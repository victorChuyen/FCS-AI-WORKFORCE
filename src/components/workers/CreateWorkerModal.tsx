import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { Worker, DuplicateWorkerInfo } from '../../types';
import { DuplicateWarningModal } from './DuplicateWarningModal';
import { VIETNAM_PROVINCES_BY_REGION, ALL_VIETNAM_PROVINCES } from '../../constants/locations';
import {
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Edit3,
  MapPin,
  ListFilter
} from 'lucide-react';

interface CreateWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatedSuccess?: (workerId: string) => void;
}

const mapCurrentNeed = (need: string) => {
  switch (need) {
    case 'Cần việc ngay':
      return 'URGENT';
    case 'Muốn đổi việc':
      return 'CONSIDERING';
    case 'Đang tìm hiểu':
      return 'FUTURE';
    default:
      return need;
  }
};

const getFriendlyErrorMessage = (code?: string, rawMsg?: string): string => {
  if (rawMsg && typeof rawMsg === 'string' && rawMsg.trim().length > 0) {
    if (!rawMsg.includes('TypeError') && !rawMsg.includes('ReferenceError') && !rawMsg.includes('<!DOCTYPE')) {
      return rawMsg;
    }
  }

  switch (code) {
    case 'MISSING_FULL_NAME':
      return 'Vui lòng nhập họ và tên đầy đủ (ít nhất 2 từ).';
    case 'MISSING_PHONE':
      return 'Vui lòng nhập số điện thoại hợp lệ (10 chữ số nhà mạng VN).';
    case 'MISSING_PROVINCE':
      return 'Vui lòng chọn hoặc nhập Tỉnh/Thành đang sinh sống.';
    case 'MISSING_CURRENT_NEED':
      return 'Vui lòng chọn hoặc nhập nhu cầu hiện tại của lao động.';
    case 'NETWORK_ERROR':
      return 'Chưa kết nối được hệ thống dữ liệu Google Sheets.';
    default:
      return rawMsg || 'Không thể lưu dữ liệu hồ sơ. Vui lòng kiểm tra lại các trường bôi đỏ.';
  }
};

export const CreateWorkerModal: React.FC<CreateWorkerModalProps> = ({
  isOpen,
  onClose,
  onCreatedSuccess,
}) => {
  const { showNotification, triggerRefresh, navigateTo, currentUser } = useApp();

  // Required Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [province, setProvince] = useState('Bắc Ninh');
  const [customProvince, setCustomProvince] = useState('');
  const [isCustomProvince, setIsCustomProvince] = useState(false);
  const [currentNeed, setCurrentNeed] = useState('Cần việc ngay');
  const [customNeed, setCustomNeed] = useState('');
  const [needNote, setNeedNote] = useState('');

  // Optional Fields
  const [showOptional, setShowOptional] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'Nam' | 'Nữ' | 'Khác'>('Nam');
  const [cccd, setCccd] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [source, setSource] = useState('Zalo Form');
  const [customSource, setCustomSource] = useState('');
  const [desiredJob, setDesiredJob] = useState('Lắp ráp điện tử');

  const [loading, setLoading] = useState(false);
  const [duplicateWorker, setDuplicateWorker] = useState<DuplicateWorkerInfo | Worker | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  
  // Detailed Error Tracking & Field Highlighting
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (formError) setFormError(null);
  };

  const resetForm = () => {
    setFullName('');
    setPhone('');
    setProvince('Bắc Ninh');
    setCustomProvince('');
    setIsCustomProvince(false);
    setCurrentNeed('Cần việc ngay');
    setCustomNeed('');
    setNeedNote('');
    setDateOfBirth('');
    setCccd('');
    setDistrict('');
    setAddress('');
    setSource('Zalo Form');
    setCustomSource('');
    setDesiredJob('Lắp ráp điện tử');
    setDuplicateWorker(null);
    setShowDuplicateModal(false);
    setFormError(null);
    setFieldErrors({});
  };

  const handleSubmit = async (e?: React.FormEvent, forceCreate = false) => {
    if (e) e.preventDefault();
    if (loading) return;
    setFormError(null);

    const cleanFullName = fullName.trim();
    const cleanPhone = phone.trim().replace(/\D/g, '');
    const cleanCccd = cccd.trim().replace(/\D/g, '');

    // Resolve final province
    let finalProvince = province;
    if (isCustomProvince || province === '__CUSTOM__') {
      finalProvince = customProvince.trim();
    }

    // Resolve final need
    let finalNeed = currentNeed;
    if (currentNeed === '__CUSTOM__') {
      finalNeed = customNeed.trim();
    }

    // Resolve final source
    let finalSource = source;
    if (source === '__CUSTOM__') {
      finalSource = customSource.trim();
    }

    // Client-side strict validation with field-level highlighting
    const newFieldErrors: Record<string, string> = {};

    if (!cleanFullName) {
      newFieldErrors.fullName = 'Vui lòng nhập Họ và Tên của người lao động.';
    } else if (cleanFullName.split(/\s+/).length < 2) {
      newFieldErrors.fullName = 'Họ và tên phải có ít nhất 2 từ (Họ và Tên đầy đủ).';
    } else if (/[\d~`!@#$%^&*()_+={\[}\]|\\:;"'<,>?/]/.test(cleanFullName)) {
      newFieldErrors.fullName = 'Họ và tên không được chứa chữ số hoặc ký tự đặc biệt.';
    }

    if (!phone.trim()) {
      newFieldErrors.phone = 'Vui lòng nhập số điện thoại liên hệ.';
    } else if (cleanPhone.length !== 10) {
      newFieldErrors.phone = 'Số điện thoại phải đúng 10 chữ số nhà mạng Việt Nam (03, 05, 07, 08, 09).';
    } else if (!['03', '05', '07', '08', '09'].includes(cleanPhone.substring(0, 2))) {
      newFieldErrors.phone = `Đầu số "${cleanPhone.substring(0, 2)}" không hợp lệ. Phải thuộc các đầu mạng VN (03, 05, 07, 08, 09).`;
    }

    if (!finalProvince || finalProvince === '__CUSTOM__' || finalProvince.toLowerCase() === 'khác') {
      newFieldErrors.province = 'Vui lòng chọn hoặc tự nhập tên Tỉnh/Thành cụ thể (VD: Đồng Nai, Bình Dương...).';
    }

    if (!finalNeed || finalNeed === '__CUSTOM__') {
      newFieldErrors.currentNeed = 'Vui lòng chọn hoặc ghi rõ nhu cầu tìm việc của lao động.';
    }

    if (cleanCccd && cleanCccd.length !== 12) {
      newFieldErrors.cccd = 'Số CCCD bắt buộc phải đúng 12 chữ số định danh công dân VNeID.';
      setShowOptional(true);
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      const firstMsg = Object.values(newFieldErrors)[0];
      setFormError(firstMsg);
      showNotification(firstMsg, 'warning');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        // Snake_case for V2 Apps Script engine
        full_name: cleanFullName,
        phone: cleanPhone,
        hometown: finalProvince,
        province: finalProvince,
        date_of_birth: dateOfBirth || '',
        cccd: cleanCccd || '',
        gender: gender || 'Nam',
        target_company: 'FUYU',
        branch: finalProvince,
        work_type: 'Chính thức',
        referral_source: finalSource || 'MANAGER_APP',
        // CamelCase for frontend & backwards compatibility
        fullName: cleanFullName,
        currentNeed: mapCurrentNeed(finalNeed),
        needNote: needNote.trim() || '',
        dateOfBirth: dateOfBirth || '',
        source: finalSource || 'MANAGER_APP',
        preferredJob: desiredJob.trim() || '',
        currentUser: {
          email: currentUser?.email || '',
          role: currentUser?.role || 'MANAGER',
          officeId: currentUser?.officeId || '',
          staffId: currentUser?.id || '',
        },
      };

      if (gender) payload.gender = gender;
      if (district.trim()) payload.district = district.trim();
      if (address.trim()) payload.address = address.trim();
      if (currentUser?.officeId) payload.officeId = currentUser.officeId;
      if (currentUser?.id) payload.recruiterId = currentUser.id;

      if (forceCreate) {
        payload.forceCreate = true;
        payload.overrideDuplicate = true;
      }

      const res = await api.createWorker(payload);

      // Handle duplicate detection from either real API or mock API
      if (
        res.error?.code === 'DUPLICATE_WORKER' ||
        res.data?.duplicateWarning ||
        (res.data as any)?.isDuplicate ||
        (res.data as any)?.isExisting
      ) {
        const errDetails = res.error?.details || (res.error as any)?.existingWorker || (res.error as any)?.worker || {};
        const dataDetails = res.data?.existingWorker || res.data?.worker || (res.data as any) || {};

        const duplicateInfo: DuplicateWorkerInfo = {
          workerId: dataDetails.workerId || errDetails.workerId || (res.error as any)?.workerId || (res.data as any)?.worker_id || 'WK-??????',
          fullName: dataDetails.fullName || errDetails.fullName || (res.error as any)?.fullName || cleanFullName,
          phone: String(dataDetails.phone || errDetails.phone || (res.error as any)?.phone || cleanPhone),
          currentStatus: dataDetails.currentStatus || dataDetails.status || errDetails.currentStatus || errDetails.status || (res.error as any)?.currentStatus || 'NEW',
          matchReason: dataDetails.matchReason || errDetails.matchReason || (res.error as any)?.matchReason || 'PHONE',
          province: dataDetails.province || errDetails.province || finalProvince,
          cccd: dataDetails.cccd || errDetails.cccd || cleanCccd,
        };

        setDuplicateWorker(duplicateInfo);
        setShowDuplicateModal(true);
        setLoading(false);
        return;
      }

      if (!res.success) {
        const rawErrMsg = res.error?.message || (res as any)?.message || (typeof res.error === 'string' ? res.error : '') || 'Không thể lưu hồ sơ';
        const friendlyMsg = getFriendlyErrorMessage(res.error?.code, rawErrMsg);
        setFormError(friendlyMsg);

        // Bôi đỏ khu vực lỗi tương ứng với lỗi trả về từ server
        const serverFieldErrors: Record<string, string> = {};
        if (/số điện thoại|phone|sđt/i.test(rawErrMsg)) {
          serverFieldErrors.phone = rawErrMsg;
        }
        if (/họ và tên|tên|fullname/i.test(rawErrMsg)) {
          serverFieldErrors.fullName = rawErrMsg;
        }
        if (/cccd|căn cước|cmt/i.test(rawErrMsg)) {
          serverFieldErrors.cccd = rawErrMsg;
          setShowOptional(true);
        }
        if (/tỉnh|thành|quê quán|hometown|province/i.test(rawErrMsg)) {
          serverFieldErrors.province = rawErrMsg;
        }
        if (/nhu cầu/i.test(rawErrMsg)) {
          serverFieldErrors.currentNeed = rawErrMsg;
        }
        setFieldErrors(serverFieldErrors);

        showNotification(friendlyMsg, 'warning');
        setLoading(false);
        return;
      }

      const createdWorker = res.data?.worker;
      const createdId = createdWorker?.workerId || (res.data as any)?.workerId || (res.data as any)?.worker_id || (res.data as any)?.id;
      const displayId = createdId ? ` ${createdId}` : '';

      showNotification(
        `Đã tạo thành công hồ sơ lao động${displayId}`,
        'success',
        createdId
          ? {
              label: 'XEM HỒ SƠ 360',
              onClick: () => navigateTo(`/workers/${createdId}`),
            }
          : undefined
      );

      triggerRefresh();
      resetForm();
      onClose();

      if (onCreatedSuccess && createdId) {
        onCreatedSuccess(createdId);
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || (typeof err === 'string' ? err : 'Không thể kết nối đến máy chủ Google Apps Script / Backend.');
      setFormError(errMsg);
      showNotification(errMsg, 'warning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !showDuplicateModal}
        onClose={onClose}
        title="Tiếp nhận lao động mới"
        subtitle="Chuẩn hóa dữ liệu theo nguyên lý Progressive Profiling (63 Tỉnh Thành & VNeID)"
        maxWidth="lg"
      >
        <form onSubmit={e => handleSubmit(e, false)} className="space-y-4">
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-center justify-between">
            <span className="font-semibold">Mã Worker ID:</span>
            <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-700">
              Mã Worker được hệ thống tự động tạo tuần tự (WK-XXXXXX).
            </span>
          </div>

          {/* Banner Thông Báo Lỗi Trực Tiếp Bên Trong Modal */}
          {formError && (
            <div className="p-3.5 bg-rose-50 border-2 border-rose-400 rounded-xl text-rose-900 flex items-start space-x-2.5 shadow-sm animate-in fade-in duration-150">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs uppercase tracking-wide text-rose-900">
                  Lỗi nhập liệu — Vui lòng kiểm tra các mục bôi đỏ:
                </p>
                <p className="text-xs font-semibold text-rose-700 mt-0.5 leading-relaxed">{formError}</p>
              </div>
            </div>
          )}

          {/* 4 Required Fields */}
          <div className="space-y-3.5">
            {/* 1. Họ và tên */}
            <div>
              <label className={`block text-xs font-bold mb-1 ${fieldErrors.fullName ? 'text-red-700' : 'text-slate-800'}`}>
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => {
                  setFullName(e.target.value);
                  clearFieldError('fullName');
                }}
                placeholder="VD: Trần Ngọc Chuyên"
                className={`w-full px-3 py-2 text-sm rounded-lg transition-all ${
                  fieldErrors.fullName
                    ? 'border-2 border-red-500 bg-red-50/30 text-red-950 ring-2 ring-red-200 focus:ring-red-400 focus:border-red-600'
                    : 'border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white'
                }`}
              />
              {fieldErrors.fullName && (
                <p className="text-xs font-bold text-red-600 mt-1 flex items-center space-x-1 animate-in fade-in duration-150">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.fullName}</span>
                </p>
              )}
            </div>

            {/* 2. Số điện thoại & 3. Tỉnh/Thành đang sinh sống */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Số điện thoại */}
              <div>
                <label className={`block text-xs font-bold mb-1 ${fieldErrors.phone ? 'text-red-700' : 'text-slate-800'}`}>
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  required
                  value={phone}
                  onChange={e => {
                    setPhone(e.target.value);
                    clearFieldError('phone');
                  }}
                  placeholder="VD: 0989890022"
                  className={`w-full px-3 py-2 text-sm font-mono rounded-lg transition-all ${
                    fieldErrors.phone
                      ? 'border-2 border-red-500 bg-red-50/30 text-red-950 ring-2 ring-red-200 focus:ring-red-400 focus:border-red-600'
                      : 'border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white'
                  }`}
                />
                {fieldErrors.phone && (
                  <p className="text-xs font-bold text-red-600 mt-1 flex items-center space-x-1 animate-in fade-in duration-150">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.phone}</span>
                  </p>
                )}
              </div>

              {/* Tỉnh/Thành đang sinh sống (Hỗ trợ 63 Tỉnh thành + Tự nhập Đồng Nai / Tỉnh khác) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={`block text-xs font-bold ${fieldErrors.province ? 'text-red-700' : 'text-slate-800'}`}>
                    Tỉnh/Thành đang sinh sống <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomProvince(!isCustomProvince);
                      if (!isCustomProvince && province !== '__CUSTOM__') {
                        setCustomProvince(province);
                      }
                      clearFieldError('province');
                    }}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1 cursor-pointer underline"
                  >
                    {isCustomProvince ? (
                      <>
                        <ListFilter className="w-3 h-3" />
                        <span>Chọn 63 Tỉnh</span>
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-3 h-3" />
                        <span>Tự gõ tên tỉnh</span>
                      </>
                    )}
                  </button>
                </div>

                {!isCustomProvince ? (
                  <>
                    <select
                      value={province}
                      onChange={e => {
                        const val = e.target.value;
                        setProvince(val);
                        if (val === '__CUSTOM__') {
                          setCustomProvince('');
                        }
                        clearFieldError('province');
                      }}
                      className={`w-full px-3 py-2 text-sm rounded-lg transition-all bg-white ${
                        fieldErrors.province
                          ? 'border-2 border-red-500 bg-red-50/30 text-red-950 ring-2 ring-red-200'
                          : 'border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    >
                      {VIETNAM_PROVINCES_BY_REGION.map(group => (
                        <optgroup key={group.region} label={group.region}>
                          {group.provinces.map(p => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                      <optgroup label="Tùy chọn bổ sung">
                        <option value="__CUSTOM__">✏️ Tỉnh khác (Tự nhập tên riêng)...</option>
                      </optgroup>
                    </select>

                    {province === '__CUSTOM__' && (
                      <div className="mt-2 animate-in fade-in duration-150">
                        <input
                          type="text"
                          autoFocus
                          value={customProvince}
                          onChange={e => {
                            setCustomProvince(e.target.value);
                            clearFieldError('province');
                          }}
                          placeholder="Nhập tên Tỉnh/Thành cụ thể (VD: Đồng Nai, Bình Phước...)"
                          className={`w-full px-3 py-2 text-sm rounded-lg font-semibold transition-all ${
                            fieldErrors.province
                              ? 'border-2 border-red-500 bg-red-50/30 text-red-950 ring-2 ring-red-200'
                              : 'border-2 border-blue-400 bg-blue-50/30 text-blue-950 focus:ring-2 focus:ring-blue-500'
                          }`}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="animate-in fade-in duration-150">
                    <input
                      type="text"
                      list="vietnam-provinces-list"
                      autoFocus
                      value={customProvince}
                      onChange={e => {
                        setCustomProvince(e.target.value);
                        clearFieldError('province');
                      }}
                      placeholder="Gõ hoặc chọn Tỉnh/Thành (VD: Đồng Nai, Bình Dương...)"
                      className={`w-full px-3 py-2 text-sm rounded-lg font-semibold transition-all bg-white ${
                        fieldErrors.province
                          ? 'border-2 border-red-500 bg-red-50/30 text-red-950 ring-2 ring-red-200'
                          : 'border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    <datalist id="vietnam-provinces-list">
                      {ALL_VIETNAM_PROVINCES.map(p => (
                        <option key={p} value={p} />
                      ))}
                    </datalist>
                  </div>
                )}

                {fieldErrors.province && (
                  <p className="text-xs font-bold text-red-600 mt-1 flex items-center space-x-1 animate-in fade-in duration-150">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.province}</span>
                  </p>
                )}
              </div>
            </div>

            {/* 4. Nhu cầu hiện tại & Ghi chú nhu cầu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={`block text-xs font-bold mb-1 ${fieldErrors.currentNeed ? 'text-red-700' : 'text-slate-800'}`}>
                  Nhu cầu hiện tại <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={currentNeed}
                  onChange={e => {
                    const val = e.target.value;
                    setCurrentNeed(val);
                    if (val === '__CUSTOM__') setCustomNeed('');
                    clearFieldError('currentNeed');
                  }}
                  className={`w-full px-3 py-2 text-sm rounded-lg font-medium transition-all bg-white ${
                    fieldErrors.currentNeed
                      ? 'border-2 border-red-500 bg-red-50/30 text-red-950 ring-2 ring-red-200'
                      : 'border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                >
                  <option value="Cần việc ngay">Cần việc ngay</option>
                  <option value="Muốn đổi việc">Muốn đổi việc</option>
                  <option value="Đang tìm hiểu">Đang tìm hiểu</option>
                  <option value="__CUSTOM__">✏️ Nhu cầu khác (Tự nhập...)</option>
                </select>

                {currentNeed === '__CUSTOM__' && (
                  <div className="mt-2 animate-in fade-in duration-150">
                    <input
                      type="text"
                      autoFocus
                      value={customNeed}
                      onChange={e => {
                        setCustomNeed(e.target.value);
                        clearFieldError('currentNeed');
                      }}
                      placeholder="Ghi rõ nhu cầu (VD: Tìm ca đêm xưởng Đồng Nai, KTX...)"
                      className={`w-full px-3 py-2 text-sm rounded-lg font-semibold transition-all ${
                        fieldErrors.currentNeed
                          ? 'border-2 border-red-500 bg-red-50/30 text-red-950 ring-2 ring-red-200'
                          : 'border-2 border-blue-400 bg-blue-50/30 text-blue-950 focus:ring-2 focus:ring-blue-500'
                      }`}
                    />
                  </div>
                )}

                {fieldErrors.currentNeed && (
                  <p className="text-xs font-bold text-red-600 mt-1 flex items-center space-x-1 animate-in fade-in duration-150">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.currentNeed}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Ghi chú nhu cầu <span className="text-slate-400 font-normal">(Tùy chọn)</span>
                </label>
                <input
                  type="text"
                  value={needNote}
                  onChange={e => setNeedNote(e.target.value)}
                  placeholder="VD: Muốn có ký túc xá, có thể đi làm ngay"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Optional Toggle */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowOptional(!showOptional)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1 cursor-pointer"
            >
              <span>{showOptional ? 'Thu gọn thông tin bổ sung' : '+ Thêm thông tin CCCD, ngày sinh, địa chỉ (Không bắt buộc)'}</span>
              {showOptional ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showOptional && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${fieldErrors.cccd ? 'text-red-700 font-bold' : 'text-slate-700'}`}>
                    Số CCCD (12 số)
                  </label>
                  <input
                    type="text"
                    value={cccd}
                    onChange={e => {
                      setCccd(e.target.value);
                      clearFieldError('cccd');
                    }}
                    placeholder="VD: 001200003456"
                    className={`w-full px-3 py-1.5 text-xs sm:text-sm rounded-md transition-all font-mono ${
                      fieldErrors.cccd
                        ? 'border-2 border-red-500 bg-red-50/30 text-red-950 ring-2 ring-red-200'
                        : 'border border-slate-300 bg-white'
                    }`}
                  />
                  {fieldErrors.cccd && (
                    <p className="text-xs font-bold text-red-600 mt-1 flex items-center space-x-1 animate-in fade-in duration-150">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors.cccd}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Ngày sinh</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={e => setDateOfBirth(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Giới tính</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md bg-white font-medium"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Nguồn tiếp nhận</label>
                  <select
                    value={source}
                    onChange={e => {
                      const val = e.target.value;
                      setSource(val);
                      if (val === '__CUSTOM__') setCustomSource('');
                    }}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md bg-white font-medium"
                  >
                    <option value="Zalo Form">Zalo Form</option>
                    <option value="Google Form">Google Form Trực tiếp</option>
                    <option value="Facebook">Facebook Tuyển dụng</option>
                    <option value="Người quen giới thiệu">Người quen giới thiệu</option>
                    <option value="Điểm tuyển dụng trực tiếp">Điểm tuyển dụng trực tiếp</option>
                    <option value="__CUSTOM__">✏️ Nguồn khác (Tự nhập...)</option>
                  </select>
                  {source === '__CUSTOM__' && (
                    <input
                      type="text"
                      autoFocus
                      value={customSource}
                      onChange={e => setCustomSource(e.target.value)}
                      placeholder="Nhập nguồn tiếp nhận cụ thể (VD: TikTok, Tờ rơi KCN Amata...)"
                      className="mt-2 w-full px-3 py-1.5 text-xs sm:text-sm border-2 border-blue-400 rounded-md bg-blue-50/30 text-blue-950 font-semibold"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Quận/Huyện</label>
                  <input
                    type="text"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    placeholder="VD: Long Thành / Việt Yên"
                    className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Công việc mong muốn</label>
                  <input
                    type="text"
                    value={desiredJob}
                    onChange={e => setDesiredJob(e.target.value)}
                    placeholder="VD: Lắp ráp linh kiện, Vận hành máy..."
                    className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Địa chỉ chi tiết (Thường trú / Tạm trú)</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="VD: Ấp 2, Xã An Phước, Long Thành, Đồng Nai"
                  className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md bg-white"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
            >
              HỦY
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer shadow-md shadow-blue-500/20 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'ĐANG LƯU HỒ SƠ...' : 'LƯU HỒ SƠ LAO ĐỘNG'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Duplicate Worker Modal */}
      {showDuplicateModal && duplicateWorker && (
        <DuplicateWarningModal
          isOpen={showDuplicateModal}
          onClose={() => {
            setShowDuplicateModal(false);
            setDuplicateWorker(null);
          }}
          existingWorker={duplicateWorker}
          onViewProfile={(workerId) => {
            setShowDuplicateModal(false);
            onClose();
            navigateTo(`/app/workers/${workerId}`);
          }}
          onCancel={() => {
            setShowDuplicateModal(false);
            setDuplicateWorker(null);
          }}
          onOverrideCreate={() => {
            setShowDuplicateModal(false);
            handleSubmit(undefined, true);
          }}
        />
      )}
    </>
  );
};

export default CreateWorkerModal;
