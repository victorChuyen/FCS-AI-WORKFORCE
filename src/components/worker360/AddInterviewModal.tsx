import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Partner, Job } from '../../types';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { Calendar, UserCheck } from 'lucide-react';

interface AddInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  workerId: string;
  workerName: string;
  onSuccess: () => void;
}

export const AddInterviewModal: React.FC<AddInterviewModalProps> = ({
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
  const [scheduledAt, setScheduledAt] = useState('');
  const [interviewer, setInterviewer] = useState('Phòng Tuyển dụng đối tác');
  const [note, setNote] = useState('');
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
      const d = new Date();
      d.setHours(d.getHours() + 4);
      setScheduledAt(d.toISOString().slice(0, 16));
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

    const errs: Record<string, string> = {};
    if (!selectedPartnerId) errs.partner = 'Vui lòng chọn đối tác / nhà máy.';
    if (!selectedJobId) errs.job = 'Vui lòng chọn vị trí tuyển dụng.';
    if (!scheduledAt) errs.scheduledAt = 'Vui lòng chọn thời gian phỏng vấn.';

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      const msg = Object.values(errs)[0];
      setFormError(msg);
      showNotification(msg, 'warning');
      return;
    }

    setLoading(true);
    try {
      await api.createInterview({
        workerId,
        partnerId: selectedPartnerId,
        jobId: selectedJobId,
        scheduledAt,
        interviewer,
        note,
      });
      showNotification(`Đã lên lịch phỏng vấn cho ${workerName}`, 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      const errMsg = err?.message || 'Lỗi đặt lịch phỏng vấn';
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
      title="Lên lịch phỏng vấn mới"
      subtitle={`Ứng viên: ${workerName} (${workerId})`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Đối tác tiếp nhận phỏng vấn <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedPartnerId}
            onChange={e => setSelectedPartnerId(e.target.value)}
            className="w-full text-sm py-2 px-3 border border-slate-300 rounded-lg bg-white"
          >
            {partners.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Vị trí tuyển dụng <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedJobId}
            onChange={e => setSelectedJobId(e.target.value)}
            className="w-full text-sm py-2 px-3 border border-slate-300 rounded-lg bg-white"
          >
            {jobs.map(j => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.salaryRange})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Thời gian phỏng vấn <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            required
            value={scheduledAt}
            onChange={e => setScheduledAt(e.target.value)}
            className="w-full text-sm py-2 px-3 border border-slate-300 rounded-lg bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">Người / Đơn vị phỏng vấn</label>
          <input
            type="text"
            value={interviewer}
            onChange={e => setInterviewer(e.target.value)}
            className="w-full text-sm py-2 px-3 border border-slate-300 rounded-lg bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">Ghi chú chuẩn bị</label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="VD: Cần mang CCCD gốc, kiểm tra thị lực màu..."
            className="w-full text-sm py-2 px-3 border border-slate-300 rounded-lg bg-white"
          />
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
            {loading ? 'Đang lưu...' : 'XÁC NHẬN LỊCH'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
