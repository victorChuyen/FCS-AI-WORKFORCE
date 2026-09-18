import React, { useState } from 'react';
import { CrmDeal, LevelSaleCode, LevelSaleItem } from '../../types/deal.types';
import { DealCard } from './DealCard';
import { useApp } from '../../context/AppContext';
import { canAccessLevelSale } from '../../types/auth';
import { Lock } from 'lucide-react';

interface KanbanColumnProps {
  stage: LevelSaleItem;
  deals: CrmDeal[];
  onMoveStage: (deal: CrmDeal) => void;
  onViewWorker: (workerId: string) => void;
  onDropDeal: (dealId: string, targetStage: LevelSaleCode) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  stage,
  deals,
  onMoveStage,
  onViewWorker,
  onDropDeal,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const { currentUser } = useApp();
  const isAllowed = canAccessLevelSale(currentUser, stage.code);

  const handleDragOver = (e: React.DragEvent) => {
    if (!isAllowed) {
      e.dataTransfer.dropEffect = 'none';
      return;
    }
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!isAllowed) return;
    const dealId = e.dataTransfer.getData('text/plain');
    if (dealId) {
      onDropDeal(dealId, stage.code);
    }
  };

  const handleDragStart = (e: React.DragEvent, deal: CrmDeal) => {
    e.dataTransfer.setData('text/plain', deal.deal_id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const totalCommission = deals.reduce((sum, d) => sum + (d.commission_amount || 0), 0);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-72 sm:w-80 shrink-0 flex flex-col rounded-2xl border transition-all ${
        !isAllowed
          ? 'opacity-85 bg-slate-100/70 border-slate-200'
          : isDragOver
          ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-400 shadow-md'
          : 'bg-slate-50/60 border-slate-200'
      }`}
    >
      {/* Column Header */}
      <div className="p-3 border-b border-slate-200 bg-white/80 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center space-x-2 truncate">
          <span className={`px-2 py-0.5 rounded text-xs font-black border ${stage.badgeBg || 'bg-slate-100'}`}>
            {stage.code}
          </span>
          <h4 className="text-xs font-bold text-slate-800 truncate" title={stage.name}>
            {stage.name.replace(`${stage.code}. `, '')}
          </h4>
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          {!isAllowed && (
            <span
              className="p-1 rounded bg-slate-100 text-slate-400"
              title={`Khóa: Chỉ ${stage.role_scope?.join(', ')} mới được chuyển sang bước này`}
            >
              <Lock className="w-3 h-3" />
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
            {deals.length}
          </span>
        </div>
      </div>

      {/* Column Subheader: Commission Summary */}
      {deals.length > 0 && totalCommission > 0 && (
        <div className="px-3 py-1 bg-slate-100/60 text-[10px] text-slate-500 flex items-center justify-between font-medium">
          <span>Hoa hồng dự kiến:</span>
          <span className="font-bold text-emerald-700">
            {totalCommission.toLocaleString('vi-VN')}đ
          </span>
        </div>
      )}

      {/* Cards Container */}
      <div className="p-2.5 space-y-2.5 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[140px] flex-1">
        {deals.length === 0 ? (
          <div className="h-28 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-center p-3 text-slate-400 text-[11px]">
            {isDragOver ? (
              <span className="font-bold text-blue-600">Thả vào đây để chuyển bước</span>
            ) : (
              <span>Chưa có Deal ở bước này</span>
            )}
          </div>
        ) : (
          deals.map(deal => (
            <DealCard
              key={deal.deal_id}
              deal={deal}
              onMoveStage={onMoveStage}
              onViewWorker={onViewWorker}
              onDragStart={handleDragStart}
            />
          ))
        )}
      </div>
    </div>
  );
};
