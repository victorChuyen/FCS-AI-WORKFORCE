import React from 'react';
import { CrmDeal } from '../../types/deal.types';
import { getStageMeta } from './kanbanData';
import { formatPhone, formatCccd } from '../../utils/formatters';
import {
  Phone,
  Building2,
  MapPin,
  UserCheck,
  Calendar,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  GripVertical,
} from 'lucide-react';

interface DealCardProps {
  deal: CrmDeal;
  onMoveStage: (deal: CrmDeal) => void;
  onViewWorker: (workerId: string) => void;
  onDragStart?: (e: React.DragEvent, deal: CrmDeal) => void;
}

export const DealCard: React.FC<DealCardProps> = ({
  deal,
  onMoveStage,
  onViewWorker,
  onDragStart,
}) => {
  const stageMeta = getStageMeta(deal.level_sale_status);
  const isVww = Boolean(deal.is_vww || deal.level_sale_status === 'L3');

  return (
    <div
      draggable={true}
      onDragStart={e => onDragStart && onDragStart(e, deal)}
      className="group bg-white rounded-xl border border-slate-200 p-3.5 hover:border-blue-400 hover:shadow-md transition-all space-y-2.5 cursor-grab active:cursor-grabbing text-xs select-none"
    >
      {/* Card Header: IDs & Badges */}
      <div className="flex items-start justify-between gap-1.5">
        <div className="flex items-center space-x-1">
          <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 shrink-0" />
          <span className="font-mono font-extrabold text-[10px] text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
            {deal.deal_id}
          </span>
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          {isVww && (
            <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded font-extrabold text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-300">
              <ShieldCheck className="w-3 h-3" />
              <span>VWW</span>
            </span>
          )}
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${stageMeta.badgeBg || 'bg-slate-100 text-slate-700'}`}>
            {stageMeta.code}
          </span>
        </div>
      </div>

      {/* Worker Name & Phone */}
      <div>
        <div
          onClick={() => onViewWorker(deal.worker_id)}
          className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors cursor-pointer flex items-center justify-between"
        >
          <span className="truncate">{deal.full_name}</span>
          <span className="text-[10px] font-mono text-slate-400 hover:underline shrink-0 ml-1">
            {deal.worker_id}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
          <a
            href={`tel:${deal.phone}`}
            onClick={e => e.stopPropagation()}
            className="flex items-center space-x-1 font-bold text-blue-600 hover:underline"
          >
            <Phone className="w-3 h-3 text-blue-500" />
            <span>{formatPhone(deal.phone)}</span>
          </a>
          {deal.cccd && (
            <>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-slate-500">{formatCccd(deal.cccd)}</span>
            </>
          )}
        </div>
      </div>

      {/* Target Company & Branch */}
      <div className="pt-1 border-t border-slate-100 grid grid-cols-2 gap-1 text-[11px]">
        <div className="flex items-center space-x-1 text-slate-700 truncate font-semibold">
          <Building2 className="w-3 h-3 text-indigo-500 shrink-0" />
          <span className="truncate">{deal.target_company || 'Chưa gán'}</span>
        </div>
        <div className="flex items-center space-x-1 text-slate-600 truncate">
          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="truncate">{deal.branch || 'HÀ NAM'}</span>
        </div>
      </div>

      {/* Assigned Sale & Schedule */}
      <div className="flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center space-x-1 truncate max-w-[65%]">
          <UserCheck className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="truncate">{deal.assigned_sale || 'Sale chưa nhận'}</span>
        </div>

        {deal.interview_date ? (
          <div className="flex items-center space-x-1 text-amber-700 font-medium shrink-0">
            <Calendar className="w-3 h-3" />
            <span>{deal.interview_date}</span>
          </div>
        ) : deal.start_date ? (
          <div className="flex items-center space-x-1 text-emerald-700 font-medium shrink-0">
            <Briefcase className="w-3 h-3" />
            <span>{deal.start_date}</span>
          </div>
        ) : null}
      </div>

      {/* Footer: Commission & Quick Action */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-1 text-[10px] text-slate-500">
          <DollarSign className="w-3 h-3 text-emerald-600" />
          <span className="font-semibold text-emerald-800">
            {(deal.commission_amount || 500000).toLocaleString('vi-VN')}đ
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-[9px] text-slate-500">{deal.commission_status || 'Chờ duyệt'}</span>
        </div>

        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onMoveStage(deal);
          }}
          className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-[10px] transition-colors cursor-pointer"
          title="Chuyển trạng thái Level Sale"
        >
          <span>Đổi Level</span>
          <ArrowRight className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
};
