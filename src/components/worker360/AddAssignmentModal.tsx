import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Partner, Job } from '../../types';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { Briefcase, AlertCircle } from 'lucide-react';

interface AddAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  workerId: string;
  workerName: string;
  onSuccess: () => void;
}

export const AddAssignmentModal: React.FC<AddAssignmentModalProps> = ({
  isOpen,
  onClose,
  workerId,
  workerName,
  onSuccess,
}) => {
  const { showNotification } = useApp();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [shift, setShift] = useState('Ca ngày (06:00 - 14:00)');
  const [customShift, setCustomShift] = useState('');
  const [startDate, setStartDate] = useState('');
  const [markAsStartedNow, setMarkAsStartedNow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [pRes, jRes] = await Promise.all([api.getPartners(), api.getJobs()]);
      if (pRes.data && pRes.data.length > 0) {
        setPartners(pRes.data);
        setSelectedPartnerId(pRes.data[0].id);
      }
      if (jRes.data && jRes.data.length > 0) {
        setJobs(jRes.data);
        setSelectedJobId(jRes.data[0].id);
      }
      setStartDate(new Date().toISOString().slice(0, 10));
    };
    if (isOpen) load();
  }, [isOpen]);

  const clearFieldError = (f: string) => {
    if (fieldErrors[f]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[f];
        return next;
      });
    }
    if (formError) setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const finalShift = (shift === '__CUSTOM__' ? customShift : shift).trim();
    const errs: Record<string, string> = {};

    if (!selectedPartnerId) errs.partner = 'Vui lòng chọn đối tác / nhà máy.';
    if (!selectedJobId) errs.job = 'Vui lòng chọn vị trí công việc.';
    if (!finalShift) errs.shift = 'Vui lòng chọn hoặc nhập ca làm việc.';
    if (!startDate) errs.date = 'Vui lòng chọn ngày bắt đầu đi làm.';

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      const msg = Object.values(errs)[0];
      setFormError(msg);
      showNotification(msg, 'warning');
      return;
    }

    setLoading(true);
    try {
      await api.createAssignment({
        workerId,
        partnerId: selectedPartnerId,
        jobId: selectedJobId,
        shift: finalShift,
        startDate,
        markAsStartedNow,
      });
      showNotification(
        `Đã tạo phân bổ đi làm xưởng cho ${workerName}${markAsStartedNow ? ' (Đã kích hoạt STARTED)' : ''}`,
        'success'
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      const errMsg = err?.message || 'Lỗi tạo phân bổ đi làm';
      setFormError(errMsg);
      showNotification(errMsg, 'warning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo phân bổ đi làm (Assignment)"
      subtitle={`Gán xưởng & ca làm cho: ${workerName} (${workerId})`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {formError && (
          <div className="p-3 bg-red-50 border-2 border-red-400 rounded-xl text-red-900 flex items-start space-x-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase tracking-wide text-[11px] block text-red-900">
                Lỗi phân bổ:
              </span>
              <span className="font-semibold text-red-700 text-xs">{formError}</span>
            </div>
          </div>
        )}

        <div>
          <label className={`block text-xs font-bold mb-1 ${fieldErrors.partner ? 'text-red-700' : 'text-slate-800'}`}>
            Đối tác / Nhà máy nhận việc <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedPartnerId}
            onChange={e => {
              setSelectedPartnerId(e.target.value);
              clearFieldError('partner');
            }}
            className={`w-full text-sm py-2 px-3 border rounded-lg bg-white transition-all ${
              fieldErrors.partner
                ? 'border-2 border-red-500 bg-red-50/30 text-red-950 ring-2 ring-red-200'
                : 'border-slate-300 focus:ring-2 focus:ring-blue-500'
            }`}
          >
            {partners.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {fieldErrors.partner && (
            <p className="text-xs font-bold text-red-600 mt-1 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{fieldErrors.partner}</span>
            </p>
          )}
        </div>

        <div>
          <label className={`block text-xs font-bold mb-1 ${fieldErrors.job ? 'text-red-700' : 'text-slate-800'}`}>
            Vị trí công việc <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedJobId}
            onChange={e => {
              setSelectedJobId(e.target.value);
              clearFieldError('job');
            }}
            className={`w-full text-sm py-2 px-3 border rounded-lg bg-white transition-all ${
              fieldErrors.job
                ? 'border-2 border-red-500 bg-red-50/30 text-red-950 ring-2 ring-red-200'
                : 'border-slate-300 focus:ring-2 focus:ring-blue-500'
            }`}
          >
            {jobs.map(j => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.salaryRange})
              </option>
            ))}
          </select>
          {fieldErrors.job && (
            <p className="text-xs font-bold text-red-600 mt-1 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{fieldErrors.job}</span>
            </p>
          )}
        </div>

        <div>
          <label className={`block text-xs font-bold mb-1 ${fieldErrors.shift ? 'text-red-700' : 'text-slate-800'}`}>
            Ca làm việc <span className="text-red-500">*</span>
          </label>
          <select
            value={shift}
            onChange={e => {
              setShift(e.target.value);
              if (e.target.value === '__CUSTOM__') setCustomShift('');
              clearFieldError('shift');
            }}
            className={`w-full text-sm py-2 px-3 border rounded-lg bg-white transition-all ${
              fieldErrors.shift
                ? 'border-2 border-red-500 bg-red-50/30 text-red-950 ring-2 ring-red-200'
                : 'border-slate-300 focus:ring-2 focus:ring-blue-500'
            }`}
          >
            <option value="Ca ngày (06:00 - 14:00)">Ca ngày (06:00 - 14:00)</option>
            <option value="Ca 2 (14:00 - 22:00)">Ca 2 (14:00 - 22:00)</option>
            <option value="Ca đêm (22:00 - 06:00)">Ca đêm (22:00 - 06:00)</option>
            <option value="Ca hành chính (08:00 - 17:00)">Ca hành chính (08:00 - 17:00)</option>
            <option value="Ca xoay theo tuần">Ca xoay theo tuần</option>
            <option value="__CUSTOM__">✏️ Ca khác (Tự nhập...)</option>
          </select>

          {shift === '__CUSTOM__' && (
            <input
              type="text"
              autoFocus
              value={customShift}
              onChange={e => {
                setCustomShift(e.target.value);
                clearFieldError('shift');
              }}
              placeholder="Ghi rõ ca làm (VD: Ca gãy 12h, Ca tăng cường...)"
              className="mt-2 w-full text-sm py-2 px-3 border-2 border-blue-400 bg-blue-50/30 text-blue-950 rounded-lg font-semibold"
            />
          )}

          {fieldErrors.shift && (
            <p className="text-xs font-bold text-red-600 mt-1 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{fieldErrors.shift}</span>
            </p>
          )}
        </div>

        <div>
          <label className={`block text-xs font-bold mb-1 ${fieldErrors.date ? 'text-red-700' : 'text-slate-800'}`}>
            Ngày bắt đầu nhận việc <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            value={startDate}
            onChange={e => {
              setStartDate(e.target.value);
              clearFieldError('date');
            }}
            className={`w-full text-sm py-2 px-3 border rounded-lg bg-white transition-all ${
              fieldErrors.date
                ? 'border-2 border-red-500 bg-red-50/30 text-red-950 ring-2 ring-red-200'
                : 'border-slate-300 focus:ring-2 focus:ring-blue-500'
            }`}
          />
          {fieldErrors.date && (
            <p className="text-xs font-bold text-red-600 mt-1 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{fieldErrors.date}</span>
            </p>
          )}
        </div>


        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <label className="flex items-start space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={markAsStartedNow}
              onChange={e => setMarkAsStartedNow(e.target.checked)}
              className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <div>
              <span className="text-xs font-bold text-slate-900">
                Xác nhận lao động đã có mặt & bắt đầu làm việc ngay bây giờ (STARTED)
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Kích hoạt sự kiện STARTED trong hành trình. Khi có bảng chấm công khớp, lao động sẽ tự động trở thành Verified Working Worker (VWW).
              </p>
            </div>
          </label>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
          >
            HỦY
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-xs"
          >
            {loading ? 'Đang tạo...' : 'TẠO PHÂN BỔ'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
