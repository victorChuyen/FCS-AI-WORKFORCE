import React from 'react';
import { Sparkles, ArrowRight, ShieldAlert, Clock3, CheckCircle } from 'lucide-react';
import { Priority } from '../../types';
import { PriorityBadge } from '../common/PriorityBadge';

interface Suggestion {
  id: string;
  text: string;
  priority: Priority;
  type: string;
  actionLabel: string;
  targetRoute: string;
}

interface LuckySuggestionsProps {
  suggestions: Suggestion[];
  onNavigate: (route: string) => void;
}

export const LuckySuggestions: React.FC<LuckySuggestionsProps> = ({ suggestions, onNavigate }) => {
  return (
    <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-white border border-blue-200/80 rounded-xl p-5 mb-8 shadow-2xs">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>Lucky gợi ý hôm nay</span>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                Rule Automation (Sprint 01)
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Quy tắc phân tích dữ liệu tự động đề xuất 3 hành động quan trọng nhất cho quản lý
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {suggestions.map((item, idx) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-2xs hover:border-blue-300 transition-colors gap-2"
          >
            <div className="flex items-start space-x-3">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-900 leading-snug">
                  {item.text}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <PriorityBadge priority={item.priority} showLabel={false} />
                  <span className="text-[11px] text-slate-500">Tự động kích hoạt theo ngưỡng SLA</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate(item.targetRoute)}
              className="self-end sm:self-center shrink-0 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-blue-600 rounded-md text-xs font-bold transition-all cursor-pointer"
            >
              <span>{item.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
