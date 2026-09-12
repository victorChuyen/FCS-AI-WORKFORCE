import React from 'react';
import { Priority } from '../../types';
import { PRIORITY_CONFIG } from '../../utils/formatters';

export const PriorityBadge: React.FC<{ priority: Priority; showLabel?: boolean }> = ({
  priority,
  showLabel = true,
}) => {
  const config = PRIORITY_CONFIG[priority];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded font-bold text-xs tracking-wider uppercase ${config.badge}`}
    >
      {priority}
      {showLabel && <span className="ml-1 text-[11px] font-normal opacity-90 hidden sm:inline">• {config.label.replace(` (${priority})`, '')}</span>}
    </span>
  );
};
