import React from 'react';
import { Priority } from '../../types';
import { PriorityBadge } from '../common/PriorityBadge';
import { ArrowRight, Clock, AlertCircle } from 'lucide-react';

interface PriorityActionCardProps {
  priority: Priority;
  count: number;
  title: string;
  reason: string;
  dueText?: string;
  onAction: () => void;
  actionText?: string;
}

export const PriorityActionCard: React.FC<PriorityActionCardProps> = ({
  priority,
  count,
  title,
  reason,
  dueText,
  onAction,
  actionText = 'XỬ LÝ NGAY',
}) => {
  const borderStyles: Record<Priority, string> = {
    [Priority.P0]: 'border-red-300 hover:border-red-400 bg-white hover:shadow-md',
    [Priority.P1]: 'border-amber-300 hover:border-amber-400 bg-white hover:shadow-md',
    [Priority.P2]: 'border-blue-200 hover:border-blue-300 bg-white hover:shadow-sm',
    [Priority.P3]: 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-xs',
  };

  const countColors: Record<Priority, string> = {
    [Priority.P0]: 'text-red-600',
    [Priority.P1]: 'text-amber-600',
    [Priority.P2]: 'text-blue-600',
    [Priority.P3]: 'text-slate-700',
  };

  const buttonColors: Record<Priority, string> = {
    [Priority.P0]: 'bg-red-600 hover:bg-red-700 text-white',
    [Priority.P1]: 'bg-amber-600 hover:bg-amber-700 text-white',
    [Priority.P2]: 'bg-blue-600 hover:bg-blue-700 text-white',
    [Priority.P3]: 'bg-slate-700 hover:bg-slate-800 text-white',
  };

  return (
    <div
      className={`rounded-xl border p-5 transition-all flex flex-col justify-between relative ${borderStyles[priority]}`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <PriorityBadge priority={priority} />
          {dueText && (
            <span className="flex items-center text-[11px] text-slate-500 font-medium">
              <Clock className="w-3 h-3 mr-1 text-slate-400" />
              {dueText}
            </span>
          )}
        </div>

        <div className="flex items-baseline space-x-3 mb-2">
          <span className={`text-3xl font-extrabold tracking-tight ${countColors[priority]}`}>
            {count}
          </span>
          <h4 className="text-base font-bold text-slate-900 leading-snug">{title}</h4>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-4">{reason}</p>
      </div>

      <div className="pt-2 border-t border-slate-100 mt-auto">
        <button
          onClick={onAction}
          className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs ${buttonColors[priority]}`}
        >
          <span>{actionText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
