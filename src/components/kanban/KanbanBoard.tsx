import React, { useState, useMemo } from 'react';
import { CrmDeal, LevelSaleCode, LevelSaleGroup } from '../../types/deal.types';
import { FUNNEL_GROUPS, LEVEL_SALE_LIST, getStageMeta } from './kanbanData';
import { KanbanColumn } from './KanbanColumn';
import {
  Search,
  Filter,
  Building2,
  MapPin,
  RefreshCw,
  X,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface KanbanBoardProps {
  deals: CrmDeal[];
  onMoveStage: (deal: CrmDeal) => void;
  onViewWorker: (workerId: string) => void;
  onDropDeal: (dealId: string, targetStage: LevelSaleCode) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  deals,
  onMoveStage,
  onViewWorker,
  onDropDeal,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<LevelSaleGroup | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedCompany, setSelectedCompany] = useState('ALL');

  // Extract unique branches and companies from deals
  const branches = useMemo(() => {
    const set = new Set<string>();
    deals.forEach(d => {
      if (d.branch) set.add(d.branch);
    });
    return Array.from(set).sort();
  }, [deals]);

  const companies = useMemo(() => {
    const set = new Set<string>();
    deals.forEach(d => {
      if (d.target_company) set.add(d.target_company);
    });
    return Array.from(set).sort();
  }, [deals]);

  // Filtered stages depending on selected group
  const activeStages = useMemo(() => {
    if (selectedGroup === 'ALL') return LEVEL_SALE_LIST;
    return LEVEL_SALE_LIST.filter(s => s.group === selectedGroup);
  }, [selectedGroup]);

  // Filter deals based on search, branch, company
  const filteredDeals = useMemo(() => {
    return deals.filter(d => {
      if (selectedBranch !== 'ALL' && d.branch !== selectedBranch) return false;
      if (selectedCompany !== 'ALL' && d.target_company !== selectedCompany) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchName = d.full_name?.toLowerCase().includes(q);
        const matchPhone = d.phone?.includes(q);
        const matchDeal = d.deal_id?.toLowerCase().includes(q);
        const matchWorker = d.worker_id?.toLowerCase().includes(q);
        const matchCccd = d.cccd?.includes(q);
        if (!matchName && !matchPhone && !matchDeal && !matchWorker && !matchCccd) return false;
      }
      return true;
    });
  }, [deals, selectedBranch, selectedCompany, search]);

  // Group count helpers
  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: deals.length };
    Object.keys(FUNNEL_GROUPS).forEach(g => {
      counts[g] = deals.filter(d => getStageMeta(d.level_sale_status).group === g).length;
    });
    return counts;
  }, [deals]);

  const hasActiveFilters = search || selectedBranch !== 'ALL' || selectedCompany !== 'ALL' || selectedGroup !== 'ALL';

  const resetFilters = () => {
    setSearch('');
    setSelectedBranch('ALL');
    setSelectedCompany('ALL');
    setSelectedGroup('ALL');
  };

  return (
    <div className="space-y-3">
      {/* 1. Funnel Group Selector Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          onClick={() => setSelectedGroup('ALL')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer border ${
            selectedGroup === 'ALL'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Tất cả 19 Level</span>
          <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
            selectedGroup === 'ALL' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'
          }`}>
            {groupCounts.ALL}
          </span>
        </button>

        {Object.values(FUNNEL_GROUPS).map(g => {
          const active = selectedGroup === g.key;
          return (
            <button
              key={g.key}
              onClick={() => setSelectedGroup(g.key)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer border ${
                active
                  ? `${g.headerBg} font-black shadow-xs ring-1 ring-blue-500`
                  : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${g.dotColor}`} />
              <span>{g.shortTitle}</span>
              <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                active ? 'bg-white/80 text-slate-900' : 'bg-slate-100 text-slate-700'
              }`}>
                {groupCounts[g.key] || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Filter Bar: Search, Branch, Company */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 shadow-2xs text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên, SĐT, mã Deal, Worker ID..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 bg-white"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Branch Filter */}
          <div className="flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="ALL">Mọi Chi Nhánh ({branches.length})</option>
              {branches.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Company Filter */}
          <div className="flex items-center space-x-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedCompany}
              onChange={e => setSelectedCompany(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="ALL">Mọi Nhà Máy ({companies.length})</option>
              {companies.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg transition-colors cursor-pointer text-[11px]"
            >
              Xóa lọc
            </button>
          )}
        </div>

        {/* Info label */}
        <div className="text-slate-500 text-[11px] font-medium">
          Hiển thị <strong>{filteredDeals.length}</strong> / {deals.length} Deal
        </div>
      </div>

      {/* 3. Horizontal Scrollable Kanban Columns */}
      <div className="flex space-x-3 overflow-x-auto pb-4 pt-1 items-start min-h-[500px]">
        {activeStages.map(stage => {
          const stageDeals = filteredDeals.filter(d => d.level_sale_status === stage.code);
          return (
            <KanbanColumn
              key={stage.code}
              stage={stage}
              deals={stageDeals}
              onMoveStage={onMoveStage}
              onViewWorker={onViewWorker}
              onDropDeal={onDropDeal}
            />
          );
        })}
      </div>
    </div>
  );
};
