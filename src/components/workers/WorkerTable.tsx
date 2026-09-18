import React from 'react';
import { Worker } from '../../types';
import { StatusBadge, VWWBadge } from '../common/Badge';
import { formatPhone, formatCccd } from '../../utils/formatters';
import { Eye, Building, UserCheck, Phone, MapPin, ChevronRight, User, Edit3, Printer, RefreshCw, Sparkles, HeartHandshake } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { hasPermission, maskSensitiveInfo } from '../../types/auth';

interface WorkerTableProps {
  workers: Worker[];
  onSelectWorker: (workerId: string) => void;
  onEditWorker?: (worker: Worker) => void;
  onPrintWorker?: (worker: Worker) => void;
  onSyncWorker?: (worker: Worker) => Promise<void> | void;
  onReactivateWorker?: (worker: Worker) => void;
  onCareWorker?: (worker: Worker) => void;
  loading?: boolean;
}

export const WorkerTable: React.FC<WorkerTableProps> = ({
  workers,
  onSelectWorker,
  onEditWorker,
  onPrintWorker,
  onSyncWorker,
  onReactivateWorker,
  onCareWorker,
  loading = false,
}) => {
  const { currentUser } = useApp();
  const canViewSensitive = hasPermission(currentUser, 'WORKER_VIEW_SENSITIVE');

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs">Đang tải danh sách lao động...</p>
      </div>
    );
  }

  if (workers.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <UserCheck className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-800">Không tìm thấy hồ sơ lao động nào</h4>
        <p className="text-xs text-slate-500 mt-1">
          Thử điều chỉnh từ khóa tìm kiếm (Tên, SĐT, CCCD) hoặc chọn lại bộ lọc
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-2xs">
      {/* 1. DESKTOP VIEW: Structured multi-column table (High-Density ERP Grid) */}
      <div className="hidden md:block overflow-x-auto rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider bg-slate-100/90">
              <th className="py-2.5 px-3 border-b border-slate-300">Worker ID</th>
              <th className="py-2.5 px-3 border-b border-slate-300">Họ tên</th>
              <th className="py-2.5 px-3 border-b border-slate-300">Số điện thoại</th>
              <th className="py-2.5 px-3 border-b border-slate-300">Tỉnh/Thành</th>
              <th className="py-2.5 px-3 border-b border-slate-300">Trạng thái</th>
              <th className="py-2.5 px-3 hidden lg:table-cell border-b border-slate-300">Văn phòng</th>
              <th className="py-2.5 px-3 hidden lg:table-cell border-b border-slate-300">Tuyển dụng phụ trách</th>
              <th className="py-2.5 px-3 hidden xl:table-cell border-b border-slate-300">Đối tác / Việc làm</th>
              <th className="py-2.5 px-3 border-b border-slate-300">Cập nhật cuối</th>
              <th className="py-2.5 px-3 text-center border-b border-slate-300 sticky right-0 z-20 bg-slate-100/95 backdrop-blur-xs font-black text-slate-800 shadow-[-6px_0_10px_-2px_rgba(0,0,0,0.06)]">
                HÀNH ĐỘNG
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {workers.map(worker => {
              const isVww = Boolean((worker as any).isVww || worker.isVerifiedWorking);
              return (
                <tr
                  key={worker.workerId}
                  onClick={() => onSelectWorker(worker.workerId)}
                  className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                >
                  {/* Worker ID & Department */}
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                    <span className="bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {worker.workerId}
                    </span>
                    {worker.department && (
                      <div className="text-[10px] font-mono text-indigo-700 font-semibold mt-1">
                        {worker.department}
                      </div>
                    )}
                  </td>

                  {/* Họ tên */}
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-900 group-hover:text-blue-700 flex items-center space-x-1.5">
                      <span>{worker.fullName}</span>
                      {isVww && (
                        <span
                          className="text-[10px] bg-emerald-700 text-white font-black px-1.5 py-0.2 rounded shadow-2xs"
                          title="Verified Working Worker (VWW)"
                        >
                          ★ VWW
                        </span>
                      )}
                    </div>
                    {worker.cccd && (
                      <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        CCCD: {canViewSensitive ? formatCccd(worker.cccd) : maskSensitiveInfo(worker.cccd, 'cccd')}
                      </div>
                    )}
                  </td>

                  {/* Số điện thoại */}
                  <td className="py-2.5 px-3 font-medium text-slate-800 whitespace-nowrap">
                    <a
                      href={canViewSensitive ? `tel:${worker.phone}` : undefined}
                      onClick={e => {
                        if (!canViewSensitive) e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="hover:text-blue-600 hover:underline"
                    >
                      {canViewSensitive ? formatPhone(worker.phone) : maskSensitiveInfo(worker.phone, 'phone')}
                    </a>
                  </td>

                  {/* Tỉnh/Thành */}
                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-700">
                    {worker.province || 'Chưa rõ'}
                  </td>

                  {/* Trạng thái & VWW Badge */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="flex items-center space-x-1.5">
                      <StatusBadge status={worker.status} size="sm" />
                      {isVww && (
                        <span className="text-[10px] font-black bg-emerald-700 text-white px-1.5 py-0.5 rounded">
                          ★ VWW
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Văn phòng */}
                  <td className="py-2.5 px-3 hidden lg:table-cell whitespace-nowrap text-slate-700">
                    {worker.officeName || 'Văn phòng chính'}
                  </td>

                  {/* Nhân viên phụ trách */}
                  <td className="py-2.5 px-3 hidden lg:table-cell whitespace-nowrap">
                    <div className="font-medium text-slate-800">{worker.recruiterName || 'Chưa gán'}</div>
                  </td>

                  {/* Đối tác / Việc làm */}
                  <td className="py-2.5 px-3 hidden xl:table-cell whitespace-nowrap">
                    {worker.partnerName ? (
                      <div className="flex items-center space-x-1 font-medium text-slate-800">
                        <Building className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[150px]">{worker.partnerName}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Chưa phân bổ</span>
                    )}
                  </td>

                  {/* Cập nhật cuối */}
                  <td className="py-2.5 px-3">
                    <p className="text-slate-600 line-clamp-1 max-w-xs">{worker.lastActivity || 'Hồ sơ mới'}</p>
                  </td>

                  {/* Cột HÀNH ĐỘNG Cố định bên phải (Sửa ✏️, In 🖨️, Đồng bộ 🔄, Tái kích hoạt ✨, Chăm sóc 🤝, Xem 360 👁️) */}
                  <td
                    className="py-2 px-2 text-center whitespace-nowrap sticky right-0 z-10 bg-white/95 group-hover:bg-blue-50/90 backdrop-blur-xs border-l border-slate-200 shadow-[-6px_0_10px_-2px_rgba(0,0,0,0.06)]"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-center space-x-1.5">
                      {/* Nút Tái kích hoạt 0đ qua Zalo (cho lao động QUIT hoặc FEE_EXPIRED) */}
                      {onReactivateWorker && ['QUIT', 'FEE_EXPIRED', 'L3.1', 'L4'].some(s => (worker.status || '').toUpperCase().includes(s)) && (
                        <button
                          type="button"
                          onClick={() => onReactivateWorker(worker)}
                          className="p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer"
                          title="Tái kích hoạt lao động cũ (Chi phí 0đ qua Zalo)"
                        >
                          <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                        </button>
                      )}

                      {/* Nút Chăm sóc Onboarding (cho lao động STARTED hoặc WORKING) */}
                      {onCareWorker && ['STARTED', 'WORKING', 'L3', 'VWW'].some(s => (worker.status || '').toUpperCase().includes(s)) && (
                        <button
                          type="button"
                          onClick={() => onCareWorker(worker)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                          title="Chăm sóc Onboarding 1-3-7 ngày"
                        >
                          <HeartHandshake className="w-4 h-4 text-rose-600" />
                        </button>
                      )}

                      {/* Nút sửa */}
                      <button
                        type="button"
                        onClick={() => onEditWorker ? onEditWorker(worker) : onSelectWorker(worker.workerId)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                        title="Chỉnh sửa hồ sơ & Đồng bộ 2 chiều (Google Sheets)"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Nút In */}
                      <button
                        type="button"
                        onClick={() => onPrintWorker ? onPrintWorker(worker) : window.print()}
                        className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                        title="In phiếu thông tin / Export"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* Nút Đồng bộ nhanh */}
                      {onSyncWorker && (
                        <button
                          type="button"
                          onClick={() => onSyncWorker(worker)}
                          className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                          title="Đồng bộ bản ghi này với Google Sheets"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Nút Xem 360 */}
                      <button
                        type="button"
                        onClick={() => onSelectWorker(worker.workerId)}
                        className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Xem chi tiết Hồ sơ 360"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 2. MOBILE VIEW: Touch-friendly Card List (< md) */}
      <div className="md:hidden divide-y divide-slate-200">
        {workers.map(worker => (
          <div
            key={worker.workerId}
            onClick={() => onSelectWorker(worker.workerId)}
            className="p-4 space-y-3 active:bg-blue-50/50 transition-colors cursor-pointer"
          >
            {/* Top row: ID + Dept + VWW + Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="font-mono font-bold text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                  {worker.workerId}
                </span>
                {worker.department && (
                  <span className="text-[10px] font-mono font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                    {worker.department}
                  </span>
                )}
                {worker.isVerifiedWorking && (
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded flex items-center space-x-0.5">
                    <span>★ VWW</span>
                  </span>
                )}
              </div>
              <StatusBadge status={worker.status} size="sm" />
            </div>

            {/* Middle row: Name & Phone */}
            <div>
              <div className="text-base font-extrabold text-slate-900 leading-tight">
                {worker.fullName}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1">
                <a
                  href={canViewSensitive ? `tel:${worker.phone}` : undefined}
                  onClick={e => {
                    if (!canViewSensitive) e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="inline-flex items-center space-x-1 font-bold text-blue-600 active:underline py-0.5"
                >
                  <Phone className="w-3 h-3 text-blue-500" />
                  <span>{canViewSensitive ? formatPhone(worker.phone) : maskSensitiveInfo(worker.phone, 'phone')}</span>
                </a>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center space-x-1 text-slate-500">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{worker.province || 'Chưa rõ'}</span>
                </span>
              </div>
            </div>

            {/* Factory & Recruiter Info */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] bg-slate-50 p-2 rounded-lg text-slate-600">
              <div className="flex items-center space-x-1">
                <Building className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-800 truncate max-w-[170px]">
                  {worker.partnerName || 'Chưa vào xưởng'}
                </span>
              </div>
              <div className="text-slate-400">
                Tuyển dụng: <span className="font-medium text-slate-700">{worker.recruiterName}</span>
              </div>
            </div>

            {/* Recent activity note */}
            <p className="text-[11px] text-slate-500 italic line-clamp-1">
              {typeof worker.lastActivity === 'string'
                ? worker.lastActivity
                : typeof worker.lastActivity === 'object' && worker.lastActivity !== null
                ? `${(worker.lastActivity as any).type || 'Cập nhật'}`
                : 'Chưa có hoạt động mới'}
            </p>

            {/* Mobile Action buttons row */}
            <div className="flex items-center gap-2 pt-1">
              {onReactivateWorker && ['QUIT', 'FEE_EXPIRED', 'L3.1', 'L4'].some(s => (worker.status || '').toUpperCase().includes(s)) && (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    onReactivateWorker(worker);
                  }}
                  className="flex-1 py-2 px-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 active:from-emerald-700 active:to-teal-700 text-white font-bold text-xs rounded-lg flex items-center justify-center space-x-1 shadow-xs min-h-[40px]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>Tái kích hoạt 0đ</span>
                </button>
              )}

              {onCareWorker && ['STARTED', 'WORKING', 'L3', 'VWW'].some(s => (worker.status || '').toUpperCase().includes(s)) && (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    onCareWorker(worker);
                  }}
                  className="flex-1 py-2 px-2.5 bg-rose-50 text-rose-700 border border-rose-200 active:bg-rose-100 font-bold text-xs rounded-lg flex items-center justify-center space-x-1 min-h-[40px]"
                >
                  <HeartHandshake className="w-3.5 h-3.5 text-rose-600" />
                  <span>Chăm sóc 1-3-7</span>
                </button>
              )}

              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onSelectWorker(worker.workerId);
                }}
                className="flex-1 py-2 px-3 bg-slate-100 active:bg-blue-600 active:text-white text-slate-700 font-bold text-xs rounded-lg flex items-center justify-center space-x-1 transition-colors min-h-[40px]"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Xem 360</span>
                <ChevronRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer count indicator */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span>Hiển thị {workers.length} lao động</span>
        <span className="text-[11px] hidden sm:inline">Nhấp vào để mở chi tiết Worker 360</span>
      </div>
    </div>
  );
};
