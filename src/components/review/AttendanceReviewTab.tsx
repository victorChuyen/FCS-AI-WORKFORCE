import React, { useState } from 'react';
import { AttendanceReviewItem, Worker } from '../../types';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { getConfidenceBadge, formatPhone, formatCccd } from '../../utils/formatters';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  UserCheck,
  UserPlus,
  Clock,
  Sparkles,
  Search,
  ExternalLink,
} from 'lucide-react';

interface AttendanceReviewTabProps {
  items: AttendanceReviewItem[];
  onRefresh: () => void;
}

export const AttendanceReviewTab: React.FC<AttendanceReviewTabProps> = ({
  items,
  onRefresh,
}) => {
  const { showNotification, triggerRefresh, navigateTo } = useApp();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedAlternativeWorker, setSelectedAlternativeWorker] = useState<string | null>(null);
  const [showSearchModal, setShowSearchModal] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Worker[]>([]);
  const [searching, setSearching] = useState(false);

  const handleConfirmMatch = async (reviewId: string, matchedWorkerId?: string) => {
    setProcessingId(reviewId);
    try {
      const res = await api.confirmAttendanceMatch(reviewId, matchedWorkerId);
      showNotification(
        'Đã xác nhận khớp công thành công! Lao động đã đạt trạng thái VWW.',
        'success'
      );
      triggerRefresh();
      onRefresh();
    } catch (err: any) {
      showNotification(err.message || 'Lỗi khi khớp công', 'warning');
    } finally {
      setProcessingId(null);
      setShowSearchModal(null);
    }
  };

  const handleIgnore = async (reviewId: string) => {
    setProcessingId(reviewId);
    try {
      await api.ignoreAttendance(reviewId);
      showNotification('Đã tạm hoãn bản ghi chấm công này', 'info');
      triggerRefresh();
      onRefresh();
    } catch (err: any) {
      showNotification('Lỗi khi bỏ qua bản ghi', 'warning');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSearchWorkers = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await api.getWorkers({ search: q.trim() });
      if (res.data) {
        setSearchResults(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h4 className="text-base font-bold text-slate-800">Tất cả dữ liệu chấm công đã được khớp sạch sẽ</h4>
        <p className="text-xs text-slate-500 mt-1">
          Không còn bản ghi chấm công nào tồn đọng cần xác nhận thủ công.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start justify-between text-xs text-blue-900 gap-3">
        <div>
          <span className="font-bold">Quy tắc đối soát chấm công (Attendance Matching Rule):</span>
          <ul className="list-disc list-inside mt-1 space-y-0.5 text-blue-800">
            <li><span className="font-semibold">≥ 90%</span>: Khớp chính xác cả SĐT/CCCD và tên → Khớp nhanh 1-Click</li>
            <li><span className="font-semibold">75% - 89%</span>: Trùng tên & xưởng, thiếu SĐT → Bắt buộc người quản lý kiểm tra và duyệt (GF-003)</li>
            <li><span className="font-semibold">&lt; 75%</span>: Bản ghi lạ không có trong cơ sở dữ liệu → Tùy chọn tìm kiếm hoặc tạo mới</li>
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        {items.map(item => {
          const badge = getConfidenceBadge(item.confidenceScore);
          const isProcessing = processingId === item.id;

          return (
            <div
              key={item.id}
              className="bg-white border-2 border-slate-200 hover:border-blue-300 rounded-xl p-4 sm:p-5 shadow-2xs transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Mã bản ghi: {item.attendanceId}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {item.reason}
                </span>
              </div>

              {/* Comparison grid: Raw partner data vs Proposed Worker DB */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Raw Partner Data */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Dữ liệu bảng công đối tác gửi về
                  </div>
                  <div className="text-base font-extrabold text-slate-900">
                    {item.rawWorkerName}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400">SĐT trên bảng:</span>{' '}
                      <span className="font-semibold text-slate-800">
                        {item.rawPhone ? formatPhone(item.rawPhone) : '(Không có SĐT)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">CCCD:</span>{' '}
                      <span className="font-semibold text-slate-800">
                        {item.rawCccd ? formatCccd(item.rawCccd) : '(Không có)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Nhà máy / Xưởng:</span>{' '}
                      <span className="font-semibold text-slate-800">{item.partnerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Ngày chấm:</span>{' '}
                      <span className="font-semibold text-slate-800">{item.workDate} ({item.daysWorked} công)</span>
                    </div>
                  </div>
                </div>

                {/* Right: Suggested Worker Match */}
                <div className={`p-3.5 border rounded-lg space-y-2 ${
                  item.suggestedWorker
                    ? 'bg-blue-50/40 border-blue-200'
                    : 'bg-amber-50/30 border-amber-200'
                }`}>
                  <div className="text-[11px] font-bold uppercase tracking-wider flex items-center justify-between">
                    <span className="text-blue-700">Hệ thống đề xuất trong cơ sở dữ liệu</span>
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  </div>

                  {item.suggestedWorker ? (
                    <>
                      <div className="flex items-baseline justify-between">
                        <span className="text-base font-extrabold text-slate-900">
                          {item.suggestedWorker.fullName}
                        </span>
                        <span className="text-xs font-mono font-bold text-blue-700">
                          {item.suggestedWorker.workerId}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                        <div>
                          <span className="text-slate-400">SĐT hồ sơ:</span>{' '}
                          <span className="font-semibold text-slate-800">
                            {formatPhone(item.suggestedWorker.phone)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">Phân bổ xưởng:</span>{' '}
                          <span className="font-semibold text-slate-800">
                            {item.suggestedWorker.assignedPartner || 'Chưa phân bổ'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">Trạng thái:</span>{' '}
                          <span className="font-semibold text-slate-800">
                            {item.suggestedWorker.status}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">VWW:</span>{' '}
                          <span className="font-semibold text-slate-800">
                            {item.suggestedWorker.isVerifiedWorking ? 'Đã đạt VWW' : 'Chưa đạt (Sẽ kích hoạt)'}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-3 text-center text-xs text-amber-800">
                      <p className="font-semibold">Không tìm thấy ứng viên khớp tự động</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Hãy chọn lao động thủ công hoặc tạo mới hồ sơ nếu đây là lao động tuyển ngoài
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 4 ACTION BUTTONS: XÁC NHẬN KHỚP | CHỌN LAO ĐỘNG KHÁC | TẠO LAO ĐỘNG MỚI | BỎ QUA */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleIgnore(item.id)}
                  className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer min-h-[42px] flex items-center justify-center text-center"
                >
                  BỎ QUA / TẠM HOÃN
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setShowSearchModal(item.id)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors cursor-pointer min-h-[42px] flex items-center justify-center text-center"
                >
                  CHỌN LAO ĐỘNG KHÁC...
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => navigateTo('/workers')}
                  className="px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer min-h-[42px] flex items-center justify-center text-center"
                >
                  TẠO LAO ĐỘNG MỚI
                </button>

                {item.suggestedWorker && (
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleConfirmMatch(item.id, item.suggestedWorker?.workerId)}
                    className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-1.5 cursor-pointer min-h-[42px]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isProcessing ? 'Đang khớp...' : 'XÁC NHẬN KHỚP (ĐẠT VWW)'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Tìm kiếm và chỉ định lao động cho bản ghi chấm công
            </h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => handleSearchWorkers(e.target.value)}
                placeholder="Nhập tên, số điện thoại hoặc mã lao động..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  {searchQuery ? 'Không tìm thấy kết quả phù hợp' : 'Nhập từ khóa để tìm kiếm...'}
                </div>
              ) : (
                searchResults.map(w => (
                  <div
                    key={w.workerId}
                    className="p-3 hover:bg-blue-50 flex items-center justify-between cursor-pointer"
                    onClick={() => handleConfirmMatch(showSearchModal, w.workerId)}
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900">{w.fullName}</div>
                      <div className="text-[11px] text-slate-500">
                        {w.workerId} • {formatPhone(w.phone)} • {w.province}
                      </div>
                    </div>
                    <button className="px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded">
                      Chọn
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowSearchModal(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
