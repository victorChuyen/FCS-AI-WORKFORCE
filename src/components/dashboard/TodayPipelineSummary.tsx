import React from 'react';
import { ArrowRight, CheckCircle2, Award, ChevronRight } from 'lucide-react';

interface TodayPipelineSummaryProps {
  counts?: {
    newWorkers: number;
    interviewPending: number;
    passed: number;
    waitingStart: number;
    working: number;
    verifiedWorkingWorkers: number;
  };
  pipeline?: Array<{
    key: string;
    label: string;
    value: number;
  }>;
  onStageClick: (statusFilter?: string) => void;
}

export const TodayPipelineSummary: React.FC<TodayPipelineSummaryProps> = ({
  counts,
  pipeline,
  onStageClick,
}) => {
  const stageConfig: Record<string, { filter: string; color: string; bg: string; isNorthStar?: boolean; sublabel?: string }> = {
    NEW: { filter: 'NEW', color: 'text-blue-700', bg: 'bg-blue-50/70 border-blue-200' },
    INTERVIEWED: { filter: 'INTERVIEW_PENDING', color: 'text-amber-700', bg: 'bg-amber-50/70 border-amber-200' },
    PASSED: { filter: 'PASSED', color: 'text-purple-700', bg: 'bg-purple-50/70 border-purple-200' },
    WAITING_START: { filter: 'WAITING_START', color: 'text-orange-700', bg: 'bg-orange-50/70 border-orange-200' },
    WORKING: { filter: 'WORKING', color: 'text-cyan-800', bg: 'bg-cyan-50/70 border-cyan-200' },
    VWW: { filter: 'VWW', color: 'text-emerald-800', bg: 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400', isNorthStar: true, sublabel: 'Verified Working — VWW' },
  };

  const stages = pipeline && pipeline.length > 0
    ? pipeline.map(item => ({
        key: item.key,
        label: item.label.toUpperCase(),
        sublabel: item.key === 'VWW' ? 'Verified Working — VWW' : undefined,
        count: item.value,
        filter: stageConfig[item.key]?.filter || item.key,
        color: stageConfig[item.key]?.color || 'text-slate-800',
        bg: stageConfig[item.key]?.bg || 'bg-slate-50 border-slate-200',
        isNorthStar: item.key === 'VWW',
      }))
    : [
        { key: 'NEW', label: 'LAO ĐỘNG MỚI', count: counts?.newWorkers ?? 0, filter: 'NEW', color: 'text-blue-700', bg: 'bg-blue-50/70 border-blue-200', isNorthStar: false, sublabel: undefined },
        { key: 'INTERVIEWED', label: 'PHỎNG VẤN', count: counts?.interviewPending ?? 0, filter: 'INTERVIEW_PENDING', color: 'text-amber-700', bg: 'bg-amber-50/70 border-amber-200', isNorthStar: false, sublabel: undefined },
        { key: 'PASSED', label: 'ĐÃ ĐẬU', count: counts?.passed ?? 0, filter: 'PASSED', color: 'text-purple-700', bg: 'bg-purple-50/70 border-purple-200', isNorthStar: false, sublabel: undefined },
        { key: 'WAITING_START', label: 'CHỜ ĐI LÀM', count: counts?.waitingStart ?? 0, filter: 'WAITING_START', color: 'text-orange-700', bg: 'bg-orange-50/70 border-orange-200', isNorthStar: false, sublabel: undefined },
        { key: 'WORKING', label: 'ĐANG LÀM', count: counts?.working ?? 0, filter: 'WORKING', color: 'text-cyan-800', bg: 'bg-cyan-50/70 border-cyan-200', isNorthStar: false, sublabel: undefined },
        {
          key: 'VWW',
          label: 'ĐI LÀM ĐÃ XÁC MINH',
          sublabel: 'Verified Working — VWW',
          count: counts?.verifiedWorkingWorkers ?? 0,
          filter: 'VWW',
          color: 'text-emerald-800',
          bg: 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400',
          isNorthStar: true,
        },
      ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Tiến độ luồng tuyển dụng hôm nay (Pipeline)</h3>
          <p className="text-xs text-slate-500">
            Hành trình 6 chặng từ Lao động mới đến Đi làm đã xác minh (VWW)
          </p>
        </div>
        <button
          onClick={() => onStageClick()}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1 cursor-pointer"
        >
          <span>Xem chi tiết Pipeline Funnel</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stages.map((st, idx) => (
          <button
            key={st.label}
            onClick={() => onStageClick(st.filter)}
            className={`p-3.5 rounded-lg border text-left transition-all hover:shadow-xs group cursor-pointer relative flex flex-col justify-between ${st.bg}`}
          >
            {st.isNorthStar && (
              <span className="absolute -top-2.5 right-2 px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-2xs">
                ★ North Star
              </span>
            )}
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center justify-between">
                <span className="truncate">{st.label}</span>
                <span className="text-[10px] text-slate-400 ml-1 shrink-0">#{idx + 1}</span>
              </div>
              {st.sublabel && (
                <p className="text-[10px] text-emerald-700 font-medium tracking-tight mt-0.5">
                  {st.sublabel}
                </p>
              )}
              <div className={`text-2xl font-black mt-1.5 ${st.color}`}>
                {st.count}
              </div>
            </div>
            <div className="mt-3 text-[11px] text-slate-500 flex items-center group-hover:text-blue-700 font-medium">
              <span>Xem danh sách</span>
              <ArrowRight className="w-3 h-3 ml-1 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
