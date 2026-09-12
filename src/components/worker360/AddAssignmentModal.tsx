import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Partner, Job } from '../../types';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { Briefcase } from 'lucide-react';

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
  const [startDate, setStartDate] = useState('');
  const [markAsStartedNow, setMarkAsStartedNow] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartnerId || !selectedJobId || !startDate) {
      showNotification('Vui lòng chọn đối tác và ngày bắt đầu đi làm', 'warning');
      return;
    }
    setLoading(true);
    try {
      await api.createAssignment({
        workerId,
        partnerId: selectedPartnerId,
        jobId: selectedJobId,
        shift,
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
      showNotification(err.message || 'Lỗi tạo phân bổ đi làm', 'warning');
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
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Đối tác / Nhà máy nhận việc <span className="text-red-500">*</span>
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
            Vị trí công việc <span className="text-red-500">*</span>
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
            Ca làm việc <span className="text-red-500">*</span>
          </label>
          <select
            value={shift}
            onChange={e => setShift(e.target.value)}
            className="w-full text-sm py-2 px-3 border border-slate-300 rounded-lg bg-white"
          >
            <option value="Ca ngày (06:00 - 14:00)">Ca ngày (06:00 - 14:00)</option>
            <option value="Ca 2 (14:00 - 22:00)">Ca 2 (14:00 - 22:00)</option>
            <option value="Ca đêm (22:00 - 06:00)">Ca đêm (22:00 - 06:00)</option>
            <option value="Ca hành chính (08:00 - 17:00)">Ca hành chính (08:00 - 17:00)</option>
            <option value="Ca xoay theo tuần">Ca xoay theo tuần</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Ngày bắt đầu nhận việc <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full text-sm py-2 px-3 border border-slate-300 rounded-lg bg-white"
          />
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
