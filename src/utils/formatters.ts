import { WorkerStatus, Priority, ActionStatus, MatchingStatus } from '../types';

export const WORKER_STATUS_LABELS: Record<WorkerStatus, string> = {
  [WorkerStatus.NEW]: 'Mới',
  [WorkerStatus.INTERVIEW_PENDING]: 'Chờ phỏng vấn',
  [WorkerStatus.INTERVIEWED]: 'Đã phỏng vấn',
  [WorkerStatus.PASSED]: 'Đã đậu',
  [WorkerStatus.FAILED]: 'Không đạt',
  [WorkerStatus.WAITING_START]: 'Chờ đi làm',
  [WorkerStatus.WORKING]: 'Đang làm',
  [WorkerStatus.QUIT]: 'Đã nghỉ',
  [WorkerStatus.INACTIVE]: 'Không hoạt động',
};

export const WORKER_STATUS_COLORS: Record<WorkerStatus, { bg: string; text: string; border: string }> = {
  [WorkerStatus.NEW]: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  [WorkerStatus.INTERVIEW_PENDING]: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  [WorkerStatus.INTERVIEWED]: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  [WorkerStatus.PASSED]: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  [WorkerStatus.FAILED]: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  [WorkerStatus.WAITING_START]: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  [WorkerStatus.WORKING]: { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200' },
  [WorkerStatus.QUIT]: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
  [WorkerStatus.INACTIVE]: { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200' },
};

export const PRIORITY_CONFIG: Record<Priority, { label: string; badge: string; border: string; lightBg: string }> = {
  [Priority.P0]: {
    label: 'Khẩn cấp (P0)',
    badge: 'bg-red-600 text-white',
    border: 'border-red-500',
    lightBg: 'bg-red-50 text-red-700 border-red-200',
  },
  [Priority.P1]: {
    label: 'Ưu tiên cao (P1)',
    badge: 'bg-amber-600 text-white',
    border: 'border-amber-500',
    lightBg: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  [Priority.P2]: {
    label: 'Trung bình (P2)',
    badge: 'bg-blue-600 text-white',
    border: 'border-blue-500',
    lightBg: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  [Priority.P3]: {
    label: 'Thấp (P3)',
    badge: 'bg-slate-500 text-white',
    border: 'border-slate-400',
    lightBg: 'bg-slate-50 text-slate-700 border-slate-200',
  },
};

export function formatPhone(phone?: string | number): string {
  if (!phone && phone !== 0) return '—';
  const str = String(phone).trim();
  if (!str) return '—';
  const clean = str.replace(/\D/g, '');
  if (clean.length === 10) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 7)} ${clean.slice(7)}`;
  }
  if (clean.length === 9 && !clean.startsWith('0')) {
    const withZero = '0' + clean;
    return `${withZero.slice(0, 4)} ${withZero.slice(4, 7)} ${withZero.slice(7)}`;
  }
  return str;
}

export function formatCccd(cccd?: string): string {
  if (!cccd) return 'Chưa có CCCD';
  if (cccd.length === 12) {
    return `${cccd.slice(0, 3)} ${cccd.slice(3, 6)} ${cccd.slice(6, 9)} ${cccd.slice(9)}`;
  }
  return cccd;
}

export function formatDateTime(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function getConfidenceBadge(score: number): { label: string; className: string } {
  if (score >= 90) {
    return {
      label: `${score}% - Tự động khớp`,
      className: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold',
    };
  }
  if (score >= 75) {
    return {
      label: `${score}% - Cần người duyệt`,
      className: 'bg-amber-100 text-amber-800 border-amber-300 font-semibold',
    };
  }
  return {
    label: `${score}% - Không khớp`,
    className: 'bg-rose-100 text-rose-800 border-rose-300 font-semibold',
  };
}
