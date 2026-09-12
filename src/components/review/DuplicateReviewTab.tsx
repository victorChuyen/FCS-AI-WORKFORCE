import React, { useState } from 'react';
import { DuplicateSuspect } from '../../types';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { formatPhone, formatCccd } from '../../utils/formatters';
import { StatusBadge } from '../common/Badge';
import { AlertTriangle, GitMerge, Check, ShieldCheck, ArrowRight } from 'lucide-react';

interface DuplicateReviewTabProps {
  items: DuplicateSuspect[];
  onRefresh: () => void;
}

export const DuplicateReviewTab: React.FC<DuplicateReviewTabProps> = ({ items, onRefresh }) => {
  const { showNotification, triggerRefresh, navigateTo } = useApp();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleMerge = async (item: DuplicateSuspect, primaryId: string, secondaryId: string) => {
    setProcessingId(item.id);
    try {
      await api.mergeDuplicates(primaryId, secondaryId);
      showNotification(`Đã hợp nhất hồ sơ ${secondaryId} vào hồ sơ gốc ${primaryId}`, 'success');
      triggerRefresh();
      onRefresh();
    } catch (err: any) {
      showNotification('Lỗi hợp nhất hồ sơ', 'warning');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDismiss = async (item: DuplicateSuspect) => {
    setProcessingId(item.id);
    try {
      await api.dismissDuplicate(item.id);
      showNotification('Đã xác nhận đây là hai lao động khác nhau (Không trùng)', 'info');
      triggerRefresh();
      onRefresh();
    } catch (err: any) {
      showNotification('Lỗi xác nhận', 'warning');
    } finally {
      setProcessingId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
        <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h4 className="text-base font-bold text-slate-800">Không có hồ sơ nào nghi trùng lặp</h4>
        <p className="text-xs text-slate-500 mt-1">
          Cơ sở dữ liệu nhân sự được đối chiếu toàn vẹn qua các trường SĐT và CCCD.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3 text-xs text-amber-900">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Đối chiếu hồ sơ trùng lặp (Deduplication Rules):</span>
          <p className="mt-0.5 text-amber-800">
            Hệ thống phát hiện trùng khớp qua Số điện thoại hoặc CCCD. Hãy hợp nhất để giữ liền mạch lịch sử phỏng vấn và công làm, tránh tình trạng hai nhân viên cùng chăm sóc một người.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {items.map(item => {
          const isProcessing = processingId === item.id;

          return (
            <div
              key={item.id}
              className="bg-white border-2 border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-1">
                <span className="text-xs font-bold text-rose-700 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>{item.reason}</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Phát hiện lúc: {item.detectedAt}
                </span>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Worker A */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">
                      Hồ sơ A (Hồ sơ cũ hơn)
                    </span>
                    <span
                      onClick={() => navigateTo(`/workers/${item.workerA.workerId}`)}
                      className="text-xs font-mono font-bold text-blue-700 hover:underline cursor-pointer"
                    >
                      {item.workerA.workerId}
                    </span>
                  </div>

                  <div className="text-base font-extrabold text-slate-900">
                    {item.workerA.fullName}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400">Số điện thoại:</span>{' '}
                      <span className="font-semibold text-slate-800 font-mono">
                        {formatPhone(item.workerA.phone)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">CCCD:</span>{' '}
                      <span className="font-semibold text-slate-800 font-mono">
                        {formatCccd(item.workerA.cccd)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Tỉnh/Thành:</span>{' '}
                      <span className="font-semibold text-slate-800">{item.workerA.province}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Tuyển dụng:</span>{' '}
                      <span className="font-semibold text-slate-800">{item.workerA.recruiterName}</span>
                    </div>
                  </div>
                </div>

                {/* Worker B */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">
                      Hồ sơ B (Mới đăng ký thêm)
                    </span>
                    <span
                      onClick={() => navigateTo(`/workers/${item.workerB.workerId}`)}
                      className="text-xs font-mono font-bold text-blue-700 hover:underline cursor-pointer"
                    >
                      {item.workerB.workerId}
                    </span>
                  </div>

                  <div className="text-base font-extrabold text-slate-900">
                    {item.workerB.fullName}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400">Số điện thoại:</span>{' '}
                      <span className="font-semibold text-slate-800 font-mono">
                        {formatPhone(item.workerB.phone)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">CCCD:</span>{' '}
                      <span className="font-semibold text-slate-800 font-mono">
                        {formatCccd(item.workerB.cccd)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Tỉnh/Thành:</span>{' '}
                      <span className="font-semibold text-slate-800">{item.workerB.province}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Tuyển dụng:</span>{' '}
                      <span className="font-semibold text-slate-800">{item.workerB.recruiterName}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTIONS: GIỮ NGUYÊN | HỢP NHẤT */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleDismiss(item)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors cursor-pointer min-h-[42px] flex items-center justify-center text-center"
                >
                  GIỮ NGUYÊN (KHÔNG TRÙNG)
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleMerge(item, item.workerA.workerId, item.workerB.workerId)}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer min-h-[42px]"
                >
                  <GitMerge className="w-3.5 h-3.5" />
                  <span>HỢP NHẤT VÀO {item.workerA.workerId}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
