import React, { useState } from 'react';
import { FollowUpItem, WorkerStatus } from '../../types';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { formatPhone } from '../../utils/formatters';
import { StatusBadge } from '../common/Badge';
import {
  PhoneCall,
  MessageSquare,
  RefreshCw,
  Clock,
  AlertTriangle,
  UserCheck,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';

interface FollowupReviewTabProps {
  items: FollowUpItem[];
  onRefresh: () => void;
}

export const FollowupReviewTab: React.FC<FollowupReviewTabProps> = ({ items, onRefresh }) => {
  const { showNotification, triggerRefresh, navigateTo } = useApp();
  const [activeZaloModal, setActiveZaloModal] = useState<FollowUpItem | null>(null);
  const [activeCallModal, setActiveCallModal] = useState<FollowUpItem | null>(null);
  const [activeStatusModal, setActiveStatusModal] = useState<FollowUpItem | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<WorkerStatus>(WorkerStatus.WAITING_START);
  const [statusNote, setStatusNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCallSimulation = (item: FollowUpItem) => {
    setActiveCallModal(item);
  };

  const handleSendZalo = (item: FollowUpItem) => {
    setActiveZaloModal(item);
  };

  const handleConfirmCall = async (item: FollowUpItem, note: string) => {
    try {
      await api.resolveFollowUp(item.id, `Đã gọi điện: ${note}`);
      showNotification(`Đã ghi nhận cuộc gọi với ${item.workerName}`, 'success');
      setActiveCallModal(null);
      triggerRefresh();
      onRefresh();
    } catch (err: any) {
      showNotification('Lỗi ghi nhận', 'warning');
    }
  };

  const handleConfirmZalo = async (item: FollowUpItem) => {
    try {
      await api.resolveFollowUp(item.id, 'Đã gửi tin nhắn Zalo nhắc lịch làm');
      showNotification(`Đã gửi tin nhắn mẫu Zalo cho ${item.workerName}`, 'success');
      setActiveZaloModal(null);
      triggerRefresh();
      onRefresh();
    } catch (err: any) {
      showNotification('Lỗi gửi tin nhắn', 'warning');
    }
  };

  const handleChangeStatus = async (item: FollowUpItem) => {
    setLoading(true);
    try {
      await api.updateWorkerStatus(item.workerId, selectedStatus, statusNote);
      await api.resolveFollowUp(item.id, `Đã cập nhật trạng thái thành ${selectedStatus}`);
      showNotification(`Đã cập nhật trạng thái hồ sơ ${item.workerName}`, 'success');
      setActiveStatusModal(null);
      triggerRefresh();
      onRefresh();
    } catch (err: any) {
      showNotification('Lỗi cập nhật trạng thái', 'warning');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
        <UserCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h4 className="text-base font-bold text-slate-800">Không có lao động nào bị trễ SLA</h4>
        <p className="text-xs text-slate-500 mt-1">
          Mọi ứng viên đã đậu hoặc có lịch đều được theo sát trong khung giờ chuẩn.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3 text-xs text-amber-900">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Hàng đợi nhắc nhở & chăm sóc lao động (SLA Follow-up Queue):</span>
          <p className="mt-0.5 text-amber-800">
            Tự động kích hoạt khi ứng viên đỗ quá 24h chưa chốt xe, hoặc nghỉ làm đột ngột. Người quản lý hoặc nhân viên tuyển sinh cần liên lạc ngay để tránh rớt lao động.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map(item => (
          <div
            key={item.id}
            className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-2">
              <div className="flex items-center space-x-2.5">
                <span
                  onClick={() => navigateTo(`/workers/${item.workerId}`)}
                  className="text-xs font-mono font-bold text-blue-700 hover:underline cursor-pointer bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
                >
                  {item.workerId}
                </span>
                <span className="text-sm font-extrabold text-slate-900">{item.workerName}</span>
                <a
                  href={`tel:${item.phone}`}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  {formatPhone(item.phone)}
                </a>
              </div>

              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                  <Clock className="w-3 h-3 mr-1" />
                  SLA: {item.slaHours} giờ
                </span>
                <StatusBadge status={item.currentStatus} size="sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg">
              <div>
                <span className="text-slate-400">Lý do cần gọi:</span>{' '}
                <span className="font-semibold text-rose-700">{item.reason}</span>
              </div>
              <div>
                <span className="text-slate-400">Nhà máy / Xưởng:</span>{' '}
                <span className="font-semibold text-slate-800">{item.partnerName || 'Chưa gán'}</span>
              </div>
              <div>
                <span className="text-slate-400">Hạn chót xử lý:</span>{' '}
                <span className="font-semibold text-slate-800">{item.dueAt}</span>
              </div>
            </div>

            {/* 3 ACTIONS: GỌI ĐIỆN | GỬI ZALO | ĐỔI TRẠNG THÁI */}
            <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setSelectedStatus(item.currentStatus);
                  setActiveStatusModal(item);
                }}
                className="px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors cursor-pointer min-h-[42px] flex items-center justify-center text-center"
              >
                ĐỔI TRẠNG THÁI
              </button>

              <button
                type="button"
                onClick={() => handleSendZalo(item)}
                className="px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer min-h-[42px]"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>GỬI ZALO MẪU</span>
              </button>

              <button
                type="button"
                onClick={() => handleCallSimulation(item)}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer min-h-[42px]"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>GỌI ĐIỆN NGAY</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Zalo Modal */}
      {activeZaloModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Gửi tin nhắn Zalo chăm sóc lao động
            </h3>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-2 text-slate-800">
              <div className="font-bold text-blue-900">Nội dung mẫu tự động (Zalo ZNS / OA):</div>
              <p className="italic bg-white p-3 rounded border border-blue-100 text-slate-700 leading-relaxed">
                "Chào anh/chị {activeZaloModal.workerName}, FCS xin chúc mừng anh/chị đã trúng tuyển vị trí tại {activeZaloModal.partnerName || 'nhà máy'}. Chuyến xe đón công nhân nhận việc sẽ xuất phát vào 07:00 ngày mai. Anh/chị vui lòng phản hồi tin nhắn này hoặc gọi 1900-xxxx để xác nhận giữ chỗ nhé!"
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setActiveZaloModal(null)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => handleConfirmZalo(activeZaloModal)}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
              >
                Xác nhận đã gửi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call Modal */}
      {activeCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Ghi nhận kết quả cuộc gọi
            </h3>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 text-slate-700">
              <div>Ứng viên: <span className="font-bold text-slate-900">{activeCallModal.workerName}</span></div>
              <div>Số điện thoại: <span className="font-bold text-blue-600">{formatPhone(activeCallModal.phone)}</span></div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Chọn kết quả phản hồi nhanh:
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Đã nghe máy: Đồng ý đi làm đúng hẹn',
                  'Đã nghe máy: Xin dời lịch sang đầu tuần sau',
                  'Thuê bao không liên lạc được (Cần gọi lại sau 2h)',
                  'Từ chối nhận việc: Đã tìm được việc khác',
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleConfirmCall(activeCallModal, preset)}
                    className="w-full text-left p-2.5 text-xs bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-lg font-medium transition-colors cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveCallModal(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {activeStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Chuyển trạng thái hồ sơ: {activeStatusModal.workerName}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Trạng thái mới
                </label>
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value as WorkerStatus)}
                  className="w-full text-sm py-2 px-3 border border-slate-300 rounded-lg bg-white"
                >
                  <option value={WorkerStatus.WAITING_START}>Chờ đi làm</option>
                  <option value={WorkerStatus.WORKING}>Đang làm việc</option>
                  <option value={WorkerStatus.QUIT}>Nghỉ việc / Dừng nhận việc</option>
                  <option value={WorkerStatus.INTERVIEW_PENDING}>Phỏng vấn lại xưởng khác</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Lý do / Ghi chú
                </label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={e => setStatusNote(e.target.value)}
                  placeholder="VD: Đã chốt xe đón ngày 15/09..."
                  className="w-full text-sm py-2 px-3 border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setActiveStatusModal(null)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => handleChangeStatus(activeStatusModal)}
                disabled={loading}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
              >
                {loading ? 'Đang lưu...' : 'LƯU TRẠNG THÁI'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
