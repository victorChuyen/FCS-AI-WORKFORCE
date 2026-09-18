import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { dealApi } from '../services/api/dealApi';
import { CrmDeal, LevelSaleCode, LevelSaleGroup } from '../types/deal.types';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { KanbanFunnelView } from '../components/kanban/KanbanFunnelView';
import { MoveDealStageModal } from '../components/kanban/MoveDealStageModal';
import { CreateDealModal } from '../components/kanban/CreateDealModal';
import { getStageMeta } from '../components/kanban/kanbanData';
import {
  GitFork,
  Kanban,
  Filter,
  BarChart3,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  ShieldCheck,
  Building2,
  Users,
  Table as TableIcon,
} from 'lucide-react';

export const PipelinePage: React.FC = () => {
  const { navigateTo, refreshKey, showNotification, currentUser, triggerRefresh } = useApp();

  const [deals, setDeals] = useState<CrmDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'kanban' | 'funnel' | 'table'>('kanban');

  // Modals state
  const [selectedDealForMove, setSelectedDealForMove] = useState<CrmDeal | null>(null);
  const [showCreateDealModal, setShowCreateDealModal] = useState(false);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const res = await dealApi.getDeals({ limit: 300 });
      if (res.data) {
        setDeals(res.data);
      }
    } catch (err: any) {
      showNotification('Không thể tải danh sách Deal ứng tuyển', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [refreshKey]);

  const handleDropDeal = async (dealId: string, targetStage: LevelSaleCode) => {
    const targetDeal = deals.find(d => d.deal_id === dealId);
    if (!targetDeal || targetDeal.level_sale_status === targetStage) return;

    // Các stage cần ngày hoặc lý do bắt buộc -> Mở modal để người dùng nhập chuẩn
    const requiresModal = 
      targetStage === 'L2' || 
      targetStage === 'L3' || 
      targetStage === 'L3.1' ||
      targetDeal.level_sale_status === 'L3';

    if (requiresModal) {
      setSelectedDealForMove(targetDeal);
      showNotification(`Chuyển sang ${targetStage} cần bổ sung ngày/lý do để ghi nhận Audit Trail.`, 'info');
      return;
    }

    // Optimistic UI update
    setDeals(prev =>
      prev.map(d =>
        d.deal_id === dealId ? { ...d, level_sale_status: targetStage } : d
      )
    );

    try {
      const res = await dealApi.moveDealStage(dealId, targetStage, `Kéo thả Kanban sang ${targetStage}`);
      if (res.success) {
        showNotification(`Đã chuyển Deal ${dealId} sang ${targetStage}`, 'success');
        triggerRefresh();
      } else {
        showNotification(res.error?.message || 'Không thể chuyển trạng thái Deal', 'warning');
        fetchDeals(); // Revert
      }
    } catch (err) {
      showNotification('Lỗi kết nối khi cập nhật Deal', 'warning');
      fetchDeals(); // Revert
    }
  };

  const handleViewWorker = (workerId: string) => {
    if (workerId) {
      navigateTo(`/app/workers/${workerId}`);
    }
  };

  // KPIs
  const totalDeals = deals.length;
  const vwwDeals = deals.filter(d => d.level_sale_status === 'L3' || d.is_vww).length;
  const interviewDeals = deals.filter(d => d.level_sale_status.startsWith('L2')).length;
  const totalCommission = deals.reduce((sum, d) => sum + (d.commission_amount || 0), 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 1. Page Header with Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5">
            <span className="inline-flex items-center space-x-1 font-extrabold text-teal-700 uppercase tracking-wider">
              <GitFork className="w-3.5 h-3.5" />
              <span>Pipeline & 19 Level Sale</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[10px] font-extrabold bg-teal-50 text-teal-700 border border-teal-200">
              02_CRM_DEALS_2026
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-mono text-[11px]">
              {currentUser.tenantId || 'FCS-000001'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Kanban Tuyển Dụng & VWW
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Quản lý dòng đời ứng tuyển của {currentUser.companyName || 'FCS-000001'} qua 19 trạng thái Level Sale chuẩn (C3 → L4) và chốt chặn Verified Working Worker.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => navigateTo('/app/grid')}
            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mở Lưới Excel</span>
          </button>

          <button
            onClick={fetchDeals}
            disabled={loading}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl transition-colors cursor-pointer shadow-2xs"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {currentUser.role !== 'VIEWER' && (
            <button
              onClick={() => setShowCreateDealModal(true)}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tạo Deal Ứng Tuyển</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Metric Tickers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Tổng Deal Ứng Tuyển</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900">{totalDeals}</span>
            <span className="text-[11px] text-slate-500 font-medium">hồ sơ</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] text-amber-700 font-bold uppercase block mb-0.5">Đang Phỏng Vấn (L2)</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl sm:text-2xl font-black text-amber-700">{interviewDeals}</span>
            <span className="text-[11px] text-slate-500 font-medium">lao động</span>
          </div>
        </div>

        <div className="bg-white border border-emerald-300 rounded-xl p-3.5 shadow-2xs bg-emerald-50/40">
          <span className="text-[10px] text-emerald-800 font-bold uppercase block mb-0.5 flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Đi Làm Đã Xác Minh (VWW)</span>
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl sm:text-2xl font-black text-emerald-800">{vwwDeals}</span>
            <span className="text-[11px] font-bold text-emerald-700">
              ({totalDeals > 0 ? Math.round((vwwDeals / totalDeals) * 100) : 0}%)
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] text-purple-700 font-bold uppercase block mb-0.5">Tổng Hoa Hồng Dự Kiến</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-lg sm:text-xl font-black text-purple-900">
              {totalCommission.toLocaleString('vi-VN')}đ
            </span>
          </div>
        </div>
      </div>

      {/* 3. View Switcher Tabs: Kanban vs Funnel vs Table */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => setActiveView('kanban')}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeView === 'kanban'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Kanban className="w-4 h-4" />
            <span>BẢNG KANBAN (19 LEVEL)</span>
          </button>

          <button
            onClick={() => setActiveView('funnel')}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeView === 'funnel'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>PHỄU TỶ LỆ CHUYỂN ĐỔI</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 font-semibold hidden sm:block">
          Kéo thả thẻ Deal giữa các cột để cập nhật trạng thái tự động
        </div>
      </div>

      {/* 4. Active View Content */}
      {loading && deals.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-8 h-8 mx-auto text-teal-600 animate-spin mb-3" />
          <p className="text-xs text-slate-500 font-medium">Đang tải bảng Kanban 19 Level Sale...</p>
        </div>
      ) : activeView === 'kanban' ? (
        <KanbanBoard
          deals={deals}
          onMoveStage={deal => setSelectedDealForMove(deal)}
          onViewWorker={handleViewWorker}
          onDropDeal={handleDropDeal}
        />
      ) : (
        <KanbanFunnelView
          deals={deals}
          onSelectGroup={group => {
            setActiveView('kanban');
          }}
        />
      )}

      {/* 5. Modals */}
      <MoveDealStageModal
        isOpen={Boolean(selectedDealForMove)}
        onClose={() => setSelectedDealForMove(null)}
        deal={selectedDealForMove}
        onSuccess={() => {
          showNotification('Đã cập nhật trạng thái Level Sale thành công', 'success');
          fetchDeals();
        }}
      />

      <CreateDealModal
        isOpen={showCreateDealModal}
        onClose={() => setShowCreateDealModal(false)}
        onSuccess={() => {
          showNotification('Đã tạo Deal ứng tuyển mới thành công', 'success');
          fetchDeals();
        }}
      />
    </div>
  );
};
