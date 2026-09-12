import React from 'react';
import { Attendance, MatchingStatus } from '../../types';
import { formatDate, formatDateTime, getConfidenceBadge } from '../../utils/formatters';
import { FileCheck2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface WorkerAttendanceSectionProps {
  attendances: Attendance[];
}

export const WorkerAttendanceSection: React.FC<WorkerAttendanceSectionProps> = ({
  attendances,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Dữ liệu chấm công ({attendances.length})
        </h3>
      </div>

      {attendances.length === 0 ? (
        <div className="p-8 border border-dashed border-slate-300 rounded-xl text-center bg-slate-50/50">
          <FileCheck2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">Chưa có dữ liệu chấm công</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Dữ liệu chấm công được đồng bộ tự động từ file đối tác qua Google Apps Script Trigger
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {attendances.map(att => {
            const badge = att.confidenceScore ? getConfidenceBadge(att.confidenceScore) : null;
            return (
              <div
                key={att.id}
                className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">{att.partnerName}</h4>
                    <p className="text-xs text-slate-500">Kỳ chấm công: {formatDate(att.workDate)}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                      {att.daysWorked} CÔNG
                    </span>
                    {att.matchingStatus === MatchingStatus.MATCHED && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        ĐÃ KHỚP CÔNG
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg">
                  <div>
                    <span className="text-slate-400">Tên trên bảng công:</span>{' '}
                    <span className="font-semibold text-slate-800">{att.rawWorkerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Độ tin cậy:</span>{' '}
                    <span className={`font-semibold px-1.5 py-0.2 rounded border ${badge?.className || ''}`}>
                      {badge?.label || '100%'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Xác nhận lúc:</span>{' '}
                    <span className="font-semibold text-slate-800">{formatDateTime(att.matchedAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
