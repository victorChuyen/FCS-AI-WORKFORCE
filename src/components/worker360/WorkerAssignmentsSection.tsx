import React from 'react';
import { Assignment } from '../../types';
import { formatDate } from '../../utils/formatters';
import { Briefcase, PlayCircle, CheckCircle, Clock, Plus, Building2 } from 'lucide-react';

interface WorkerAssignmentsSectionProps {
  assignments: Assignment[];
  onAddAssignment: () => void;
  onConfirmStarted: (assignmentId: string) => void;
}

export const WorkerAssignmentsSection: React.FC<WorkerAssignmentsSectionProps> = ({
  assignments,
  onAddAssignment,
  onConfirmStarted,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Phân bổ đi làm (Assignments) ({assignments.length})
        </h3>
        <button
          onClick={onAddAssignment}
          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer border border-blue-200"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Phân bổ vào xưởng</span>
        </button>
      </div>

      {assignments.length === 0 ? (
        <div className="p-8 border border-dashed border-slate-300 rounded-xl text-center bg-slate-50/50">
          <Briefcase className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">Chưa có phân bổ đi làm</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Tạo Assignment để chỉ định xưởng, ca làm và ngày xuất phát cho lao động
          </p>
          <button
            onClick={onAddAssignment}
            className="mt-3 inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-bold hover:bg-blue-700 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo Assignment</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map(asg => (
            <div
              key={asg.id}
              className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span className="font-extrabold text-slate-900 text-sm">{asg.partnerName}</span>
                </div>

                <div>
                  {asg.hasStarted ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      ĐÃ BẮT ĐẦU ĐI LÀM
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-orange-100 text-orange-800 border border-orange-300">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      CHỜ NGÀY NHẬN VIỆC
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg">
                <div>
                  <span className="text-slate-400">Vị trí:</span>{' '}
                  <span className="font-semibold text-slate-800">{asg.jobTitle}</span>
                </div>
                <div>
                  <span className="text-slate-400">Ca làm việc:</span>{' '}
                  <span className="font-semibold text-slate-800">{asg.shift}</span>
                </div>
                <div>
                  <span className="text-slate-400">Ngày bắt đầu:</span>{' '}
                  <span className="font-semibold text-slate-800">{formatDate(asg.startDate)}</span>
                </div>
              </div>

              {!asg.hasStarted && (
                <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onConfirmStarted(asg.id)}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>XÁC NHẬN LAO ĐỘNG ĐÃ CÓ MẶT / BẮT ĐẦU LÀM</span>
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
