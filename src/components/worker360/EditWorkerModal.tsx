import React, { useState, useEffect } from 'react';
import { callApi } from '../../services/apiClient';
import { Worker } from '../../types';
import { X, CheckCircle, AlertCircle, RefreshCw, Edit3 } from 'lucide-react';
import { ALL_VIETNAM_PROVINCES } from '../../constants/locations';

interface EditWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: any;
  onSuccess: () => void;
}

export const EditWorkerModal: React.FC<EditWorkerModalProps> = ({
  isOpen,
  onClose,
  worker,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [reasonNotes, setReasonNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (worker) {
      setFormData({
        full_name: worker.fullName || worker.name || '',
        phone: worker.phone || '',
        gender: worker.gender || 'Nam',
        marital_status: worker.maritalStatus || 'Chưa kết hôn',
        hometown: worker.hometown || worker.province || '',
        permanent_address: worker.permanentAddress || worker.address || '',
        current_address: worker.currentAddress || worker.address || '',
        department: worker.department || '',
        school: worker.school || '',
        major: worker.major || '',
        bank_account_no: worker.bankAccountNo || '',
        bank_name: worker.bankName || 'Vietcombank',
        emergency_contact_name: worker.emergencyContactName || '',
        emergency_contact_phone: worker.emergencyContactPhone || '',
        desired_job: worker.desiredJob || '',
      });
      setReasonNotes('');
      setError(null);
    }
  }, [worker, isOpen]);

  if (!isOpen || !worker) return null;

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

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    clearFieldError(key);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const errs: Record<string, string> = {};
    if (!formData.full_name?.trim()) {
      errs.full_name = 'Vui lòng nhập họ và tên.';
    } else if (formData.full_name.trim().split(/\s+/).length < 2) {
      errs.full_name = 'Họ và tên phải có tối thiểu 2 từ.';
    }

    const cleanPhone = (formData.phone || '').toString().replace(/\D/g, '');
    if (!cleanPhone) {
      errs.phone = 'Vui lòng nhập số điện thoại.';
    } else if (cleanPhone.length !== 10) {
      errs.phone = 'Số điện thoại phải đúng 10 chữ số nhà mạng VN.';
    }

    if (!reasonNotes.trim()) {
      errs.reason = 'Vui lòng nhập lý do cập nhật để lưu vào vết kiểm toán (Audit Trail).';
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setError(Object.values(errs)[0]);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const workerId = worker.workerId || worker.id;
      const res = await callApi<any>('v2.worker.update', {
        worker_id: workerId,
        fields: formData,
        reason_notes: reasonNotes.trim(),
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        const msg = res.error?.message || 'Không thể cập nhật hồ sơ lao động';
        setError(msg);
        if (/số điện thoại|phone/i.test(msg)) setFieldErrors({ phone: msg });
        if (/họ và tên|tên/i.test(msg)) setFieldErrors({ full_name: msg });
      }
    } catch (err: any) {
      setError(err?.message || 'Lỗi hệ thống khi cập nhật hồ sơ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <Edit3 className="w-4 h-4 text-blue-600" />
              <span>Chỉnh Sửa Hồ Sơ Lao Động (01_MASTER_WORKERS)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Mã hồ sơ: <strong className="font-mono text-blue-700">{worker.workerId || worker.id}</strong> • Mọi thay đổi đều được ghi nhật ký bất biến
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Group 1: Nhân thân */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] text-blue-800">
              1. Thông Tin Nhân Thân
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={`block mb-1 font-semibold ${fieldErrors.full_name ? 'text-red-700' : 'text-slate-500'}`}>Họ và tên *</label>
                <input
                  type="text"
                  value={formData.full_name || ''}
                  onChange={e => handleChange('full_name', e.target.value)}
                  className={`w-full px-3 py-1.5 border rounded-lg font-bold transition-all ${
                    fieldErrors.full_name
                      ? 'border-2 border-red-500 bg-red-50/30 text-red-950 ring-2 ring-red-200'
                      : 'border-slate-300 focus:ring-2 focus:ring-blue-500'
                  }`}
                  required
                />
                {fieldErrors.full_name && (
                  <p className="text-[11px] font-bold text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.full_name}</span>
                  </p>
                )}
              </div>

              <div>
                <label className={`block mb-1 font-semibold ${fieldErrors.phone ? 'text-red-700' : 'text-slate-500'}`}>Số điện thoại *</label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={e => handleChange('phone', e.target.value)}
                  className={`w-full px-3 py-1.5 border rounded-lg font-mono transition-all ${
                    fieldErrors.phone
                      ? 'border-2 border-red-500 bg-red-50/30 text-red-950 ring-2 ring-red-200'
                      : 'border-slate-300 focus:ring-2 focus:ring-blue-500'
                  }`}
                  required
                />
                {fieldErrors.phone && (
                  <p className="text-[11px] font-bold text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.phone}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Giới tính</label>
                <select
                  value={formData.gender || 'Nam'}
                  onChange={e => handleChange('gender', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white font-semibold"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Tình trạng hôn nhân</label>
                <select
                  value={formData.marital_status || 'Chưa kết hôn'}
                  onChange={e => handleChange('marital_status', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Chưa kết hôn">Chưa kết hôn</option>
                  <option value="Đã kết hôn">Đã kết hôn</option>
                  <option value="Ly hôn">Ly hôn</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Quê quán (63 Tỉnh thành / Tự do)</label>
                <input
                  type="text"
                  list="edit-hometown-list"
                  value={formData.hometown || ''}
                  onChange={e => handleChange('hometown', e.target.value)}
                  placeholder="Gõ hoặc chọn (VD: Đồng Nai, Bắc Giang...)"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <datalist id="edit-hometown-list">
                  {ALL_VIETNAM_PROVINCES.map(p => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </div>


              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Bộ phận / Dept</label>
                <input
                  type="text"
                  value={formData.department || ''}
                  onChange={e => handleChange('department', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Group 2: Địa chỉ */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] text-blue-800">
              2. Địa Chỉ Thường Trú & Nơi Ở
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Địa chỉ thường trú (VNeID)</label>
                <input
                  type="text"
                  value={formData.permanent_address || ''}
                  onChange={e => handleChange('permanent_address', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Nơi ở hiện nay (Nhà trọ / KTX)</label>
                <input
                  type="text"
                  value={formData.current_address || ''}
                  onChange={e => handleChange('current_address', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Group 3: Ngân hàng & Liên hệ khẩn cấp */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] text-blue-800">
              3. Tài Khoản Lương & Người Thân Khẩn Cấp
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Số tài khoản ngân hàng</label>
                <input
                  type="text"
                  value={formData.bank_account_no || ''}
                  onChange={e => handleChange('bank_account_no', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Tên ngân hàng</label>
                <input
                  type="text"
                  value={formData.bank_name || ''}
                  onChange={e => handleChange('bank_name', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Người liên hệ khẩn cấp</label>
                <input
                  type="text"
                  value={formData.emergency_contact_name || ''}
                  onChange={e => handleChange('emergency_contact_name', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">SĐT người thân</label>
                <input
                  type="text"
                  value={formData.emergency_contact_phone || ''}
                  onChange={e => handleChange('emergency_contact_phone', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Reason notes */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-slate-700 mb-1 font-bold">
              Lý do cập nhật (Bắt buộc ghi vào Audit Trail) *
            </label>
            <input
              type="text"
              value={reasonNotes}
              onChange={e => setReasonNotes(e.target.value)}
              placeholder="VD: Cập nhật số tài khoản nhận lương theo đối soát nhà máy..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
              required
            />
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
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Lưu Thay Đổi & Ghi Log</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
