import React from 'react';
import { PipelineEvent, PipelineEventType } from '../../types';
import { formatDateTime } from '../../utils/formatters';
import {
  UserPlus,
  Calendar,
  CheckCircle,
  XCircle,
  Briefcase,
  PlayCircle,
  FileCheck,
  Award,
  LogOut,
  Clock,
  Sparkles,
} from 'lucide-react';

interface WorkerJourneyTimelineProps {
  events: PipelineEvent[];
}

export const WorkerJourneyTimeline: React.FC<WorkerJourneyTimelineProps> = ({ events }) => {
  const getEventIcon = (type: PipelineEventType) => {
    switch (type) {
      case PipelineEventType.REGISTERED:
        return <UserPlus className="w-4 h-4 text-blue-600" />;
      case PipelineEventType.INTERVIEW_SCHEDULED:
        return <Calendar className="w-4 h-4 text-amber-600" />;
      case PipelineEventType.INTERVIEWED:
        return <Clock className="w-4 h-4 text-purple-600" />;
      case PipelineEventType.PASSED:
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case PipelineEventType.FAILED:
        return <XCircle className="w-4 h-4 text-rose-600" />;
      case PipelineEventType.ASSIGNMENT_CREATED:
        return <Briefcase className="w-4 h-4 text-blue-600" />;
      case PipelineEventType.STARTED:
        return <PlayCircle className="w-4 h-4 text-cyan-700" />;
      case PipelineEventType.ATTENDANCE_IMPORTED:
        return <FileCheck className="w-4 h-4 text-slate-600" />;
      case PipelineEventType.ATTENDANCE_CONFIRMED:
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case PipelineEventType.VERIFIED_WORKING:
        return <Award className="w-4 h-4 text-amber-500 fill-amber-400" />;
      case PipelineEventType.QUIT:
        return <LogOut className="w-4 h-4 text-rose-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-slate-500" />;
    }
  };

  const isVWWEvent = (type: PipelineEventType) => type === PipelineEventType.VERIFIED_WORKING;

  return (
    <div className="space-y-4">
      {/* Dynamic Summary Bar from backend pipelineEvents */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          Chuỗi sự kiện hành trình ({events.length} sự kiện)
        </div>
        {events.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-1">
            Chưa có sự kiện hành trình nào được ghi nhận cho hồ sơ này.
          </p>
        ) : (
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto text-[11px] font-semibold py-1">
            {events.map((evt, idx) => {
              const isVWW = isVWWEvent(evt.eventType);
              return (
                <React.Fragment key={evt.id || idx}>
                  <span
                    className={`px-2 py-1 rounded-md shrink-0 transition-colors ${
                      isVWW
                        ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {isVWW ? '★ VWW' : evt.title}
                  </span>
                  {idx < events.length - 1 && <span className="text-slate-300">→</span>}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* Detailed Dynamic Timeline from pipelineEvents */}
      {events.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
          Hồ sơ chưa phát sinh sự kiện luân chuyển trong hệ thống.
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {events.map((event) => {
            const isVWW = isVWWEvent(event.eventType);
            return (
              <div key={event.id} className="relative group">
                {/* Dot Icon */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center shadow-xs bg-white ${
                    isVWW
                      ? 'border-amber-500 bg-amber-50 ring-4 ring-amber-100'
                      : 'border-slate-300 group-hover:border-blue-500'
                  }`}
                >
                  {getEventIcon(event.eventType)}
                </div>

                {/* Event Content */}
                <div
                  className={`p-3.5 rounded-xl border transition-colors ${
                    isVWW
                      ? 'bg-gradient-to-r from-amber-50/90 to-emerald-50/70 border-amber-300 ring-1 ring-amber-400 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                      <span>{event.title}</span>
                      {isVWW && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-700 text-white">
                          ★ VWW ĐÃ XÁC MINH
                        </span>
                      )}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formatDateTime(event.timestamp)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-2">
                    {event.description}
                  </p>

                  <div className="text-[10px] font-medium text-slate-400 flex items-center space-x-1">
                    <span>Thực hiện bởi:</span>
                    <span className="font-semibold text-slate-600">{event.performedBy || 'Hệ thống FCS'}</span>
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
