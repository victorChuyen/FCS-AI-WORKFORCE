import React from 'react';
import { Worker } from '../../types';
import { StatusBadge, VWWBadge } from '../common/Badge';
import { formatPhone, formatCccd } from '../../utils/formatters';
import { Eye, Building, UserCheck, Phone, MapPin, ChevronRight, User } from 'lucide-react';

interface WorkerTableProps {
  workers: Worker[];
  onSelectWorker: (workerId: string) => void;
  loading?: boolean;
}

export const WorkerTable: React.FC<WorkerTableProps> = ({
  workers,
  onSelectWorker,
  loading = false,
}) => {
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
    <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
      {/* 1. DESKTOP VIEW: Structured multi-column table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3.5 px-4">Worker ID</th>
              <th className="py-3.5 px-4">Họ tên</th>
              <th className="py-3.5 px-4">Số điện thoại</th>
              <th className="py-3.5 px-4">Tỉnh/Thành</th>
              <th className="py-3.5 px-4">Trạng thái</th>
              <th className="py-3.5 px-4 hidden lg:table-cell">Văn phòng</th>
              <th className="py-3.5 px-4 hidden lg:table-cell">Nhân viên phụ trách</th>
              <th className="py-3.5 px-4 hidden xl:table-cell">Đối tác / Việc làm</th>
              <th className="py-3.5 px-4">Cập nhật cuối</th>
              <th className="py-3.5 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {workers.map(worker => {
              const isVww = Boolean((worker as any).isVww || worker.isVerifiedWorking);
              return (
                <tr
                  key={worker.workerId}
                  onClick={() => onSelectWorker(worker.workerId)}
                  className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                >
                  {/* Worker ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                    <span className="bg-blue-50 px-2 py-1 rounded border border-blue-200">
                      {worker.workerId}
                    </span>
                  </td>

                  {/* Họ tên */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 group-hover:text-blue-700 flex items-center space-x-1.5">
                      <span>{worker.fullName}</span>
                      {isVww && (
                        <span
                          className="text-[10px] bg-emerald-700 text-white font-black px-1.5 py-0.5 rounded shadow-2xs"
                          title="Verified Working Worker (VWW)"
                        >
                          ★ VWW
                        </span>
                      )}
                    </div>
                    {worker.cccd && (
                      <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        CCCD: {formatCccd(worker.cccd)}
                      </div>
                    )}
                  </td>

                  {/* Số điện thoại */}
                  <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                    <a
                      href={`tel:${worker.phone}`}
                      onClick={e => e.stopPropagation()}
                      className="hover:text-blue-600 hover:underline"
                    >
                      {formatPhone(worker.phone)}
                    </a>
                  </td>

                  {/* Tỉnh/Thành */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                    {worker.province || 'Chưa rõ'}
                  </td>

                  {/* Trạng thái & VWW Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
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
                  <td className="py-3.5 px-4 hidden lg:table-cell whitespace-nowrap text-slate-700">
                    {worker.officeName || 'Văn phòng chính'}
                  </td>

                  {/* Nhân viên phụ trách */}
                  <td className="py-3.5 px-4 hidden lg:table-cell whitespace-nowrap">
                    <div className="font-medium text-slate-800">{worker.recruiterName || 'Chưa gán'}</div>
                  </td>

                  {/* Đối tác / Việc làm */}
                  <td className="py-3.5 px-4 hidden xl:table-cell whitespace-nowrap">
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
                  <td className="py-3.5 px-4">
                    <p className="text-slate-600 line-clamp-1 max-w-xs">{worker.lastActivity || 'Hồ sơ mới'}</p>
                  </td>

                  {/* Action button */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onSelectWorker(worker.workerId);
                      }}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded-md font-semibold text-xs transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Hồ sơ 360</span>
                    </button>
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
            {/* Top row: ID + VWW + Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="font-mono font-bold text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                  {worker.workerId}
                </span>
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
                  href={`tel:${worker.phone}`}
                  onClick={e => e.stopPropagation()}
                  className="inline-flex items-center space-x-1 font-bold text-blue-600 active:underline py-0.5"
                >
                  <Phone className="w-3 h-3 text-blue-500" />
                  <span>{formatPhone(worker.phone)}</span>
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

            {/* Full-width touch button */}
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onSelectWorker(worker.workerId);
              }}
              className="w-full py-2.5 px-3 bg-slate-100 active:bg-blue-600 active:text-white text-slate-700 font-bold text-xs rounded-lg flex items-center justify-center space-x-1.5 transition-colors min-h-[44px]"
            >
              <Eye className="w-4 h-4" />
              <span>XEM HỒ SƠ 360</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </button>
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
