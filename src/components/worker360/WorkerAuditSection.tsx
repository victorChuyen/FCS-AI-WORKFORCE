import React, { useState, useEffect } from 'react';
import { callApi } from '../../services/apiClient';
import { ShieldCheck, History, User, Clock, AlertCircle, RefreshCw } from 'lucide-react';

interface WorkerAuditSectionProps {
  workerId: string;
}

export const WorkerAuditSection: React.FC<WorkerAuditSectionProps> = ({ workerId }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await callApi<any>('v2.audit.list', {
        record_id: workerId,
        limit: 100,
      });
      if (res.success && res.data) {
        const items = Array.isArray(res.data) ? res.data : (res.data.items || []);
        // Lọc log liên quan đến workerId này
        const matched = items.filter((log: any) =>
          (log.record_id || '').toString().includes(workerId) ||
          (log.reason_notes || '').toString().includes(workerId)
        );
        setLogs(matched);
      }
    } catch (e) {
      console.warn('Could not fetch audit logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [workerId]);

  return (
    <div className="space-y-4 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Sổ Cái Vết Kiểm Toán Bất Biến (03_AUDIT_LOG)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Ghi nhận vết can thiệp (Ai sửa, sửa trường nào, giá trị cũ → mới lúc nào)
          </p>
        </div>

        <button
          onClick={fetchAuditLogs}
          disabled={loading}
          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
          title="Tải lại sổ cái"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" />
          <p className="text-slate-500">Đang truy vấn sổ cái kiểm toán từ Google Sheets...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center bg-slate-50/50 space-y-1">
          <History className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-700">Chưa có bản ghi thay đổi nhạy cảm nào</p>
          <p className="text-slate-500 text-[11px]">
            Mọi thao tác Tạo mới, Cập nhật thông tin hoặc Chuyển trạng thái Level Sale sẽ tự động ghi vết tại đây
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
          {logs.map((log, idx) => (
            <div key={log.log_id || idx} className="p-3.5 hover:bg-slate-50 transition-colors space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                    {log.log_id || `LOG-${idx + 1}`}
                  </span>
                  <span className={`px-2 py-0.2 rounded font-extrabold text-[10px] ${
                    log.action === 'CREATE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : log.action === 'STATUS_CHANGE'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {log.action}
                  </span>
                  <span className="font-bold text-slate-800">
                    Trường: <span className="font-mono text-indigo-700">{log.field_name || 'Hồ sơ'}</span>
                  </span>
                </div>

                <div className="flex items-center space-x-1 text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{log.timestamp ? new Date(log.timestamp).toLocaleString('vi-VN') : 'Mới đây'}</span>
                </div>
              </div>

              {/* Value Diff */}
              {(log.old_value || log.new_value) && (
                <div className="flex items-center space-x-2 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100 font-mono">
                  <span className="text-red-600 line-through truncate max-w-[200px]">{log.old_value || '(Trống)'}</span>
                  <span className="text-slate-400">→</span>
                  <span className="text-emerald-700 font-bold truncate max-w-[200px]">{log.new_value || '(Trống)'}</span>
                </div>
              )}

              {/* Actor & Reason */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span className="flex items-center space-x-1">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>Thực hiện bởi: <strong>{log.actor_email}</strong> ({log.actor_role || 'OPERATOR'})</span>
                </span>

                {log.reason_notes && (
                  <span className="italic text-slate-600">
                    "{log.reason_notes}"
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
