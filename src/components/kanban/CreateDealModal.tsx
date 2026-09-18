import React, { useState, useEffect } from 'react';
import { CreateDealPayload, LevelSaleCode } from '../../types/deal.types';
import { LEVEL_SALE_LIST } from './kanbanData';
import { dealApi } from '../../services/api/dealApi';
import { workerApi } from '../../services/api/workerApi';
import { X, Plus, CheckCircle, AlertCircle, RefreshCw, User, Building2 } from 'lucide-react';

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  prefillWorkerId?: string;
  prefillWorkerName?: string;
  prefillPhone?: string;
}

const DEFAULT_COMPANIES = [
  'FUYU (FOXCONN)', 'NEW WING (FOXCONN)', 'FUKANG (FOXCONN)', 'FULIAN (FOXCONN)',
  'LUXSHARE-ICT', 'GOERTEK', 'WNC', 'WISTRON', 'CANON', 'BROTHER', 'QISDA',
  'DARFON', 'ANAM', 'QUANTA', 'HANKOOK', 'GEMTEK', 'RISUNTEK', 'SYSTEK',
  'HAMADEN', 'UNIBEN', 'KINH ĐÔ'
];

const DEFAULT_BRANCHES = [
  // Miền Nam
  'ĐỒNG NAI', 'BÌNH DƯƠNG', 'TP. HỒ CHÍ MINH', 'LONG AN', 'BÀ RỊA - VŨNG TÀU',
  // Miền Bắc
  'BẮC GIANG', 'BẮC NINH', 'HÀ NỘI', 'THÁI NGUYÊN', 'HẢI PHÒNG', 'HẢI DƯƠNG',
  'HƯNG YÊN', 'HÀ NAM', 'NAM ĐỊNH', 'NINH BÌNH', 'VĨNH PHÚC', 'QUẢNG NINH',
  // Miền Trung
  'THANH HÓA', 'NGHỆ AN', 'ĐÀ NẴNG'
];

export const CreateDealModal: React.FC<CreateDealModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  prefillWorkerId = '',
  prefillWorkerName = '',
  prefillPhone = '',
}) => {
  const [workerId, setWorkerId] = useState(prefillWorkerId);
  const [fullName, setFullName] = useState(prefillWorkerName);
  const [phone, setPhone] = useState(prefillPhone);
  const [targetCompany, setTargetCompany] = useState('FUYU (FOXCONN)');
  const [customCompany, setCustomCompany] = useState('');
  const [branch, setBranch] = useState('BẮC GIANG');
  const [customBranch, setCustomBranch] = useState('');
  const [levelSaleStatus, setLevelSaleStatus] = useState<LevelSaleCode>('C3');
  const [assignedSale, setAssignedSale] = useState('');
  const [referralVenCtv, setReferralVenCtv] = useState('');
  const [commissionAmount, setCommissionAmount] = useState(500000);
  const [notes, setNotes] = useState('Lead mới tiếp nhận');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Danh sách lao động gợi ý nếu chưa có prefill
  const [workersList, setWorkersList] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      setWorkerId(prefillWorkerId);
      setFullName(prefillWorkerName);
      setPhone(prefillPhone);
      setError(null);

      // Load gợi ý workers nếu chưa prefill
      if (!prefillWorkerId) {
        workerApi.getWorkers({ pageSize: 50 }).then(res => {
          if (res.data) setWorkersList(res.data);
        });
      }
    }
  }, [isOpen, prefillWorkerId, prefillWorkerName, prefillPhone]);

  if (!isOpen) return null;

  const handleSelectWorker = (wId: string) => {
    setWorkerId(wId);
    const found = workersList.find(w => (w.workerId || w.id) === wId);
    if (found) {
      setFullName(found.fullName || found.name || '');
      setPhone(found.phone || '');
    }
  };

  const clearFieldError = (f: string) => {
    if (fieldErrors[f]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[f];
        return next;
      });
    }
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanWorkerId = workerId.trim();
    const finalCompany = (targetCompany === '__CUSTOM__' ? customCompany : targetCompany).trim();
    const finalBranch = (branch === '__CUSTOM__' ? customBranch : branch).trim();

    const errs: Record<string, string> = {};
    if (!cleanWorkerId) {
      errs.workerId = 'Vui lòng chọn hoặc nhập mã lao động (Worker ID).';
    }
    if (!finalCompany) {
      errs.company = 'Vui lòng chọn hoặc tự nhập tên nhà máy / đối tác.';
    }
    if (!finalBranch) {
      errs.branch = 'Vui lòng chọn hoặc tự nhập tên chi nhánh.';
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setError(Object.values(errs)[0]);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload: CreateDealPayload = {
        worker_id: cleanWorkerId,
        full_name: fullName.trim(),
        phone: phone.trim(),
        target_company: finalCompany,
        branch: finalBranch,
        level_sale_status: levelSaleStatus,
        assigned_sale: assignedSale.trim(),
        referral_ven_ctv: referralVenCtv.trim(),
        commission_amount: Number(commissionAmount) || 500000,
        notes: notes.trim(),
      };

      const res = await dealApi.createDeal(payload);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        const msg = res.error?.message || 'Không thể tạo Deal mới';
        setError(msg);
        if (/worker_id|mã lao động/i.test(msg)) {
          setFieldErrors({ workerId: msg });
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Lỗi hệ thống khi tạo Deal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Tạo Deal Ứng Tuyển Mới (02_CRM_DEALS_2026)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Khởi tạo hồ sơ tuyển dụng vào phễu 19 Level Sale (Toàn quốc & Đồng Nai)
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border-2 border-red-400 rounded-xl text-red-900 flex items-start space-x-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase tracking-wide text-[11px] block text-red-900">
                  Lỗi nhập liệu:
                </span>
                <span className="font-semibold text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Chọn Lao Động */}
          <div>
            <label className={`block font-bold mb-1 ${fieldErrors.workerId ? 'text-red-700' : 'text-slate-700'}`}>
              Mã Lao Động (Worker ID) *
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={workerId}
                onChange={e => {
                  setWorkerId(e.target.value);
                  clearFieldError('workerId');
                }}
                placeholder="VD: WK-000001"
                className={`flex-1 px-3 py-2 border rounded-xl text-xs font-mono font-bold uppercase transition-all ${
                  fieldErrors.workerId
                    ? 'border-2 border-red-500 bg-red-50/30 text-red-950 ring-2 ring-red-200'
                    : 'border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white'
                }`}
                required
              />
            </div>
            {fieldErrors.workerId && (
              <p className="text-xs font-bold text-red-600 mt-1 flex items-center space-x-1 animate-in fade-in duration-150">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{fieldErrors.workerId}</span>
              </p>
            )}

            {/* Gợi ý chọn nhanh nếu chưa prefill */}
            {!prefillWorkerId && workersList.length > 0 && (
              <div className="mt-2">
                <span className="text-[11px] text-slate-500 block mb-1">Hoặc chọn nhanh từ danh sách:</span>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto p-1 bg-slate-50 border border-slate-200 rounded-lg">
                  {workersList.slice(0, 10).map(w => (
                    <button
                      key={w.workerId || w.id}
                      type="button"
                      onClick={() => {
                        handleSelectWorker(w.workerId || w.id);
                        clearFieldError('workerId');
                      }}
                      className="px-2 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded text-[11px] font-medium text-slate-700 cursor-pointer transition-colors"
                    >
                      <strong className="font-mono text-blue-700">{w.workerId || w.id}</strong> - {w.fullName || w.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Thông tin đi kèm */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Họ và Tên
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Tự động điền"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Số Điện Thoại
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Tự động điền"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono bg-slate-50"
              />
            </div>
          </div>

          {/* Nhà Máy Mục Tiêu & Chi Nhánh */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block font-bold mb-1 ${fieldErrors.company ? 'text-red-700' : 'text-slate-700'}`}>
                Nhà Máy / Công Ty Đối Tác *
              </label>
              <select
                value={targetCompany}
                onChange={e => {
                  setTargetCompany(e.target.value);
                  if (e.target.value === '__CUSTOM__') setCustomCompany('');
                  clearFieldError('company');
                }}
                className={`w-full px-3 py-2 border rounded-xl text-xs font-semibold transition-all bg-white ${
                  fieldErrors.company
                    ? 'border-2 border-red-500 bg-red-50/30 text-red-950 ring-2 ring-red-200'
                    : 'border-slate-300 focus:ring-2 focus:ring-blue-500'
                }`}
              >
                {DEFAULT_COMPANIES.map(comp => (
                  <option key={comp} value={comp}>
                    {comp}
                  </option>
                ))}
                <option value="__CUSTOM__">✏️ Công ty khác (Tự nhập...)</option>
              </select>

              {targetCompany === '__CUSTOM__' && (
                <input
                  type="text"
                  autoFocus
                  value={customCompany}
                  onChange={e => {
                    setCustomCompany(e.target.value);
                    clearFieldError('company');
                  }}
                  placeholder="Nhập tên đối tác / nhà máy cụ thể..."
                  className="mt-2 w-full px-3 py-1.5 border-2 border-blue-400 bg-blue-50/30 text-blue-950 rounded-xl text-xs font-semibold"
                />
              )}

              {fieldErrors.company && (
                <p className="text-xs font-bold text-red-600 mt-1 flex items-center space-x-1 animate-in fade-in duration-150">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.company}</span>
                </p>
              )}
            </div>

            <div>
              <label className={`block font-bold mb-1 ${fieldErrors.branch ? 'text-red-700' : 'text-slate-700'}`}>
                Chi Nhánh Tiếp Nhận *
              </label>
              <select
                value={branch}
                onChange={e => {
                  setBranch(e.target.value);
                  if (e.target.value === '__CUSTOM__') setCustomBranch('');
                  clearFieldError('branch');
                }}
                className={`w-full px-3 py-2 border rounded-xl text-xs font-semibold transition-all bg-white ${
                  fieldErrors.branch
                    ? 'border-2 border-red-500 bg-red-50/30 text-red-950 ring-2 ring-red-200'
                    : 'border-slate-300 focus:ring-2 focus:ring-blue-500'
                }`}
              >
                {DEFAULT_BRANCHES.map(b => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
                <option value="__CUSTOM__">✏️ Chi nhánh khác (Tự nhập...)</option>
              </select>

              {branch === '__CUSTOM__' && (
                <input
                  type="text"
                  autoFocus
                  value={customBranch}
                  onChange={e => {
                    setCustomBranch(e.target.value);
                    clearFieldError('branch');
                  }}
                  placeholder="Nhập chi nhánh cụ thể (VD: ĐỒNG NAI, LONG THÀNH...)..."
                  className="mt-2 w-full px-3 py-1.5 border-2 border-blue-400 bg-blue-50/30 text-blue-950 rounded-xl text-xs font-semibold"
                />
              )}

              {fieldErrors.branch && (
                <p className="text-xs font-bold text-red-600 mt-1 flex items-center space-x-1 animate-in fade-in duration-150">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.branch}</span>
                </p>
              )}
            </div>
          </div>

          {/* Khởi tạo Level Sale */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Trạng Thái Level Sale Ban Đầu *
            </label>
            <select
              value={levelSaleStatus}
              onChange={e => setLevelSaleStatus(e.target.value as LevelSaleCode)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {LEVEL_SALE_LIST.map(st => (
                <option key={st.code} value={st.code}>
                  {st.name} ({st.group})
                </option>
              ))}
            </select>
          </div>

          {/* Sale Phụ Trách & CTV */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Sale Phụ Trách
              </label>
              <input
                type="text"
                value={assignedSale}
                onChange={e => setAssignedSale(e.target.value)}
                placeholder="VD: Nguyễn Văn A"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nguồn / CTV Giới Thiệu
              </label>
              <input
                type="text"
                value={referralVenCtv}
                onChange={e => setReferralVenCtv(e.target.value)}
                placeholder="VD: CTV Hưng Yên"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          {/* Hoa hồng & Ghi chú */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Mức Hoa Hồng Dự Kiến (VNĐ)
              </label>
              <input
                type="number"
                step="50000"
                value={commissionAmount}
                onChange={e => setCommissionAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Ghi Chú Đợt Tuyển
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ghi chú đợt tuyển..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang tạo Deal...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo Deal Ứng Tuyển</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
