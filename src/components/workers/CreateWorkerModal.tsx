import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { DuplicateWarningModal } from './DuplicateWarningModal';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { Worker, DuplicateWorkerInfo } from '../../types';
import { UserPlus, Sparkles, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface CreateWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatedSuccess?: (workerId: string) => void;
}

const mapCurrentNeed = (need: string): string => {
  switch (need) {
    case 'Cần việc ngay':
    case 'NEED_JOB_NOW':
      return 'NEED_JOB_NOW';
    case 'Muốn đổi việc':
    case 'WANT_CHANGE_JOB':
      return 'WANT_CHANGE_JOB';
    case 'Đang tìm hiểu':
    case 'EXPLORING':
      return 'EXPLORING';
    default:
      return 'NEED_JOB_NOW';
  }
};

const getFriendlyErrorMessage = (code?: string, rawMsg?: string): string => {
  switch (code) {
    case 'MISSING_FULL_NAME':
      return 'Vui lòng nhập họ và tên.';
    case 'MISSING_PHONE':
      return 'Vui lòng nhập số điện thoại.';
    case 'MISSING_PROVINCE':
      return 'Vui lòng chọn Tỉnh/Thành.';
    case 'MISSING_CURRENT_NEED':
      return 'Vui lòng chọn nhu cầu hiện tại.';
    case 'SERVER_ERROR':
    case 'API_ERROR':
      return 'Không thể lưu dữ liệu. Vui lòng thử lại.';
    case 'NETWORK_ERROR':
      return 'Chưa kết nối được hệ thống dữ liệu.';
    default:
      if (rawMsg && !rawMsg.includes('TypeError') && !rawMsg.includes('ReferenceError') && !rawMsg.includes('JSON')) {
        return rawMsg;
      }
      return 'Không thể lưu dữ liệu. Vui lòng thử lại.';
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
  const [currentNeed, setCurrentNeed] = useState('Cần việc ngay');
  const [needNote, setNeedNote] = useState('');

  // Optional Fields
  const [showOptional, setShowOptional] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'Nam' | 'Nữ' | 'Khác'>('Nam');
  const [cccd, setCccd] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [source, setSource] = useState('Zalo Form');
  const [desiredJob, setDesiredJob] = useState('Lắp ráp điện tử');

  const [loading, setLoading] = useState(false);
  const [duplicateWorker, setDuplicateWorker] = useState<DuplicateWorkerInfo | Worker | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  const resetForm = () => {
    setFullName('');
    setPhone('');
    setProvince('Bắc Ninh');
    setCurrentNeed('Cần việc ngay');
    setNeedNote('');
    setDateOfBirth('');
    setCccd('');
    setDistrict('');
    setAddress('');
    setSource('Zalo Form');
    setDesiredJob('Lắp ráp điện tử');
    setDuplicateWorker(null);
    setShowDuplicateModal(false);
  };

  const handleSubmit = async (e?: React.FormEvent, forceCreate = false) => {
    if (e) e.preventDefault();
    if (loading) return;

    if (!fullName.trim() || !phone.trim() || !province.trim() || !currentNeed.trim()) {
      showNotification('Vui lòng điền đầy đủ 4 trường bắt buộc (*)', 'warning');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        province: province.trim(),
        currentNeed: mapCurrentNeed(currentNeed),
        needNote: needNote.trim() || '',
        dateOfBirth: dateOfBirth || '',
        cccd: cccd.trim() || '',
        source: source || 'MANAGER_APP',
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
        (res.data as any)?.isDuplicate
      ) {
        const errDetails = res.error?.details || (res.error as any)?.existingWorker || (res.error as any)?.worker || {};
        const dataDetails = res.data?.existingWorker || res.data?.worker || (res.data as any) || {};

        const duplicateInfo: DuplicateWorkerInfo = {
          workerId: dataDetails.workerId || errDetails.workerId || (res.error as any)?.workerId || 'WK-??????',
          fullName: dataDetails.fullName || errDetails.fullName || (res.error as any)?.fullName || fullName,
          phone: String(dataDetails.phone || errDetails.phone || (res.error as any)?.phone || phone),
          currentStatus: dataDetails.currentStatus || dataDetails.status || errDetails.currentStatus || errDetails.status || (res.error as any)?.currentStatus || 'NEW',
          matchReason: dataDetails.matchReason || errDetails.matchReason || (res.error as any)?.matchReason || 'PHONE',
          province: dataDetails.province || errDetails.province || province,
          cccd: dataDetails.cccd || errDetails.cccd || cccd,
        };

        setDuplicateWorker(duplicateInfo);
        setShowDuplicateModal(true);
        setLoading(false);
        return;
      }

      if (!res.success) {
        const friendlyMsg = getFriendlyErrorMessage(res.error?.code, res.error?.message);
        showNotification(friendlyMsg, 'warning');
        setLoading(false);
        return;
      }

      const createdWorker = res.data?.worker;
      const createdId = createdWorker?.workerId || (res.data as any)?.workerId || (res.data as any)?.id;
      const displayId = createdId ? ` ${createdId}` : '';

      showNotification(
        `Đã tạo hồ sơ lao động${displayId}`,
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
      showNotification('Không thể lưu dữ liệu. Vui lòng thử lại.', 'warning');
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
        subtitle="Form rút gọn theo nguyên lý Progressive Profiling dành cho người quản lý"
        maxWidth="lg"
      >
        <form onSubmit={e => handleSubmit(e, false)} className="space-y-4">
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-center justify-between">
            <span className="font-semibold">Mã Worker ID:</span>
            <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-blue-200">
              Mã Worker được hệ thống tự động tạo.
            </span>
          </div>

          {/* 4 Required Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="VD: Nguyễn Văn An"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="VD: 0912345678"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Tỉnh/Thành đang sinh sống <span className="text-red-500">*</span>
                </label>
                <select
                  value={province}
                  onChange={e => setProvince(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="Bắc Ninh">Bắc Ninh</option>
                  <option value="Bắc Giang">Bắc Giang</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Thái Nguyên">Thái Nguyên</option>
                  <option value="Phú Thọ">Phú Thọ</option>
                  <option value="Lạng Sơn">Lạng Sơn</option>
                  <option value="Vĩnh Phúc">Vĩnh Phúc</option>
                  <option value="Hải Dương">Hải Dương</option>
                  <option value="Ninh Bình">Ninh Bình</option>
                  <option value="Tuyên Quang">Tuyên Quang</option>
                  <option value="Thanh Hóa">Thanh Hóa</option>
                  <option value="Nghệ An">Nghệ An</option>
                  <option value="Khác">Tỉnh khác...</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nhu cầu hiện tại <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={currentNeed}
                  onChange={e => setCurrentNeed(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium"
                >
                  <option value="Cần việc ngay">Cần việc ngay</option>
                  <option value="Muốn đổi việc">Muốn đổi việc</option>
                  <option value="Đang tìm hiểu">Đang tìm hiểu</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Ghi chú nhu cầu <span className="text-slate-400 font-normal">(Tùy chọn)</span>
                </label>
                <input
                  type="text"
                  value={needNote}
                  onChange={e => setNeedNote(e.target.value)}
                  placeholder="VD: Muốn có ký túc xá, có thể đi làm trong 3 ngày."
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
                  <label className="block text-xs font-medium text-slate-700 mb-1">Số CCCD (12 số)</label>
                  <input
                    type="text"
                    value={cccd}
                    onChange={e => setCccd(e.target.value)}
                    placeholder="VD: 001200003456"
                    className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md bg-white"
                  />
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
                    className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md bg-white"
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
                    onChange={e => setSource(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md bg-white"
                  >
                    <option value="Zalo Form">Zalo Form</option>
                    <option value="Google Form">Google Form Trực tiếp</option>
                    <option value="Facebook">Facebook Tuyển dụng</option>
                    <option value="Người quen giới thiệu">Người quen giới thiệu</option>
                    <option value="Điểm tuyển dụng trực tiếp">Điểm tuyển dụng trực tiếp</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Quận/Huyện</label>
                  <input
                    type="text"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    placeholder="VD: Việt Yên"
                    className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Công việc mong muốn</label>
                  <input
                    type="text"
                    value={desiredJob}
                    onChange={e => setDesiredJob(e.target.value)}
                    placeholder="VD: Lắp ráp điện tử"
                    className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Địa chỉ chi tiết</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="VD: Xã Tăng Tiến, Huyện Việt Yên"
                  className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md bg-white"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer text-center min-h-[42px]"
            >
              HỦY
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-sm transition-colors min-h-[42px] ${
                loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'ĐANG LƯU...' : 'LƯU HỒ SƠ LAO ĐỘNG'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Duplicate Warning Modal */}
      <DuplicateWarningModal
        isOpen={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        existingWorker={duplicateWorker}
        onViewProfile={workerId => {
          setShowDuplicateModal(false);
          onClose();
          navigateTo(`/workers/${workerId}`);
        }}
        onCancel={() => {
          setShowDuplicateModal(false);
        }}
        onOverrideCreate={() => {
          setShowDuplicateModal(false);
          handleSubmit(undefined, true);
        }}
      />
    </>
  );
};
