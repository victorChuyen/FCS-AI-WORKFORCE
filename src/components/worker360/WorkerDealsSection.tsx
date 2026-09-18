import React, { useState } from 'react';
import { CrmDeal } from '../../types/deal.types';
import { getStageMeta } from '../kanban/kanbanData';
import { CreateDealModal } from '../kanban/CreateDealModal';
import { MoveDealStageModal } from '../kanban/MoveDealStageModal';
import {
  GitFork,
  Plus,
  Building2,
  MapPin,
  Calendar,
  Briefcase,
  ShieldCheck,
  DollarSign,
  ArrowRight,
  Clock,
} from 'lucide-react';

interface WorkerDealsSectionProps {
  workerId: string;
  workerName: string;
  workerPhone: string;
  deals: CrmDeal[];
  onRefresh: () => void;
  canEdit?: boolean;
}

export const WorkerDealsSection: React.FC<WorkerDealsSectionProps> = ({
  workerId,
  workerName,
  workerPhone,
  deals,
  onRefresh,
  canEdit = true,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDealForMove, setSelectedDealForMove] = useState<CrmDeal | null>(null);

  return (
    <div className="space-y-4 text-xs">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-2">
            <GitFork className="w-4 h-4 text-teal-600" />
            <span>Lịch Sử Đợt Tuyển & Chu Trình 19 Level Sale ({deals.length})</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Các đợt ứng tuyển vào đối tác/nhà máy theo chuẩn bảng <strong>02_CRM_DEALS_2026</strong>
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg text-xs transition-colors flex items-center space-x-1 cursor-pointer self-start sm:self-auto shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tạo Deal Tuyển Dụng Mới</span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {deals.length === 0 ? (
        <div className="p-8 border border-dashed border-slate-300 rounded-xl text-center bg-slate-50/50 space-y-2">
          <GitFork className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="font-bold text-slate-700">Chưa có đợt tuyển nào được tạo cho lao động này</p>
          <p className="text-slate-500 text-[11px]">
            Bấm nút "+ Tạo Deal Tuyển Dụng Mới" ở trên để phân bổ lao động vào đơn hàng nhà máy
          </p>
        </div>
      ) : (
        /* Deals List */
        <div className="space-y-3">
          {deals.map(deal => {
            const stageMeta = getStageMeta(deal.level_sale_status);
            const isVww = Boolean(deal.is_vww || deal.level_sale_status === 'L3');

            return (
              <div
                key={deal.deal_id}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-400 hover:shadow-xs transition-all space-y-3"
              >
                {/* Header: Deal ID, Factory, Stage Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-extrabold text-[11px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {deal.deal_id}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="font-bold text-slate-900 text-sm flex items-center space-x-1">
                      <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{deal.target_company}</span>
                    </span>
                    <span className="text-slate-500 text-xs">({deal.branch})</span>
                  </div>

                  <div className="flex items-center space-x-2 self-start sm:self-auto">
                    {isVww && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded font-extrabold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <ShieldCheck className="w-3 h-3" />
                        <span>ĐI LÀM ĐÃ XÁC MINH (VWW)</span>
                      </span>
                    )}
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${stageMeta.badgeBg}`}>
                      {stageMeta.name}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Sale phụ trách:</span>
                    <span className="font-semibold text-slate-800">{deal.assigned_sale || 'Chưa nhận'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Lịch phỏng vấn:</span>
                    <span className="font-semibold text-amber-700">
                      {deal.interview_date ? `${deal.interview_date} (${deal.interview_result || 'Chờ'})` : 'Chưa có lịch'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Ngày đi làm (Started):</span>
                    <span className="font-semibold text-emerald-700">{deal.start_date || 'Chưa đi làm'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Hoa hồng dự kiến:</span>
                    <span className="font-bold text-slate-900">
                      {(deal.commission_amount || 500000).toLocaleString('vi-VN')}đ • {deal.commission_status || 'Chờ'}
                    </span>
                  </div>
                </div>

                {/* Notes & Move Stage Action */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                  <div className="text-slate-500 italic truncate max-w-md">
                    Ghi chú: {deal.notes || 'Không có ghi chú thêm'}
                  </div>

                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => setSelectedDealForMove(deal)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold rounded-lg transition-colors flex items-center space-x-1 cursor-pointer shrink-0"
                    >
                      <span>Đổi trạng thái Level Sale</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CreateDealModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          onRefresh();
          setShowCreateModal(false);
        }}
        prefillWorkerId={workerId}
        prefillWorkerName={workerName}
        prefillPhone={workerPhone}
      />

      <MoveDealStageModal
        isOpen={Boolean(selectedDealForMove)}
        onClose={() => setSelectedDealForMove(null)}
        deal={selectedDealForMove}
        onSuccess={() => {
          onRefresh();
          setSelectedDealForMove(null);
        }}
      />
    </div>
  );
};
