import React from 'react';
import { WorkerStatus } from '../../types';
import { WORKER_STATUS_LABELS, WORKER_STATUS_COLORS } from '../../utils/formatters';

interface BadgeProps {
  status?: WorkerStatus | string;
  label?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'vww';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<{ status: WorkerStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md',
}) => {
  const config = WORKER_STATUS_COLORS[status] || {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
  };
  const label = WORKER_STATUS_LABELS[status] || status;

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-md whitespace-nowrap ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs sm:text-sm'
      } ${config.bg} ${config.text} ${config.border}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {label}
    </span>
  );
};

export const VWWBadge: React.FC<{ isVWW: boolean; size?: 'sm' | 'md'; showSecondary?: boolean }> = ({
  isVWW,
  size = 'md',
  showSecondary = false,
}) => {
  if (!isVWW) return null;
  return (
    <span
      className={`inline-flex items-center font-bold bg-emerald-700 text-white rounded-md whitespace-nowrap shadow-xs ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
      title="Verified Working — VWW (Worker ID + Assignment STARTED + Verified Attendance)"
    >
      <span className="mr-1 text-amber-300">★</span>
      <span>ĐI LÀM ĐÃ XÁC MINH</span>
      {showSecondary && (
        <span className="ml-1.5 text-emerald-200 font-normal text-[11px]">
          (Verified Working — VWW)
        </span>
      )}
    </span>
  );
};
