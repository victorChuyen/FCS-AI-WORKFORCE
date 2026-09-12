import React from 'react';
import { Interview } from '../../types';
import { formatDateTime } from '../../utils/formatters';
import { Calendar, CheckCircle2, XCircle, Clock, Plus } from 'lucide-react';

interface WorkerInterviewsSectionProps {
  interviews: Interview[];
  onAddInterview: () => void;
  onRecordResult: (interviewId: string, result: 'PASSED' | 'FAILED') => void;
}

export const WorkerInterviewsSection: React.FC<WorkerInterviewsSectionProps> = ({
  interviews,
  onAddInterview,
  onRecordResult,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Lịch sử & Kết quả phỏng vấn ({interviews.length})
        </h3>
        <button
          onClick={onAddInterview}
          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer border border-blue-200"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Đặt lịch phỏng vấn</span>
        </button>
      </div>

      {interviews.length === 0 ? (
        <div className="p-8 border border-dashed border-slate-300 rounded-xl text-center bg-slate-50/50">
          <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">Chưa có lịch phỏng vấn nào</p>
          <p className="text-xs text-slate-500 mt-0.5">Đặt lịch phỏng vấn với đối tác xưởng để ứng viên dự thi</p>
          <button
            onClick={onAddInterview}
            className="mt-3 inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-bold hover:bg-blue-700 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo lịch ngay</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {interviews.map(item => (
            <div
              key={item.id}
              className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">{item.partnerName}</h4>
                  <p className="text-xs text-slate-500 font-medium">{item.jobTitle}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {item.result === 'PASSED' && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      ĐÃ ĐẬU (PASSED)
                    </span>
                  )}
                  {item.result === 'FAILED' && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      KHÔNG ĐẠT (FAILED)
                    </span>
                  )}
                  {item.result === 'PENDING' && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      CHỜ PHỎNG VẤN
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg">
                <div>
                  <span className="text-slate-400">Thời gian:</span>{' '}
                  <span className="font-semibold text-slate-800">{formatDateTime(item.scheduledAt)}</span>
                </div>
                <div>
                  <span className="text-slate-400">Người phỏng vấn:</span>{' '}
                  <span className="font-semibold text-slate-800">{item.interviewer}</span>
                </div>
                <div>
                  <span className="text-slate-400">Ghi chú:</span>{' '}
                  <span className="font-semibold text-slate-800">{item.note || 'Không có ghi chú'}</span>
                </div>
              </div>

              {item.result === 'PENDING' && (
                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-500 font-medium mr-2">Cập nhật kết quả:</span>
                  <button
                    onClick={() => onRecordResult(item.id, 'PASSED')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold cursor-pointer"
                  >
                    ✓ ĐÁNH DẤU ĐẬU
                  </button>
                  <button
                    onClick={() => onRecordResult(item.id, 'FAILED')}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-md text-xs font-bold cursor-pointer"
                  >
                    ✕ KHÔNG ĐẠT
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
