import React from 'react';
import { CrmDeal, LevelSaleGroup } from '../../types/deal.types';
import { FUNNEL_GROUPS, getStageMeta } from './kanbanData';
import { ArrowDown, Users, CheckCircle, ShieldCheck, DollarSign, Award, AlertTriangle } from 'lucide-react';

interface KanbanFunnelViewProps {
  deals: CrmDeal[];
  onSelectGroup: (group: LevelSaleGroup) => void;
}

export const KanbanFunnelView: React.FC<KanbanFunnelViewProps> = ({
  deals,
  onSelectGroup,
}) => {
  const totalDeals = deals.length || 1;

  // Aggregate stats per group
  const groupStats = Object.values(FUNNEL_GROUPS).map((group, index, arr) => {
    const groupDeals = deals.filter(d => getStageMeta(d.level_sale_status).group === group.key);
    const count = groupDeals.length;
    const pctOfTotal = Math.round((count / totalDeals) * 100);

    // Conversion rate from previous stage
    let prevCount = index === 0 ? count : deals.filter(d => getStageMeta(d.level_sale_status).group === arr[index - 1].key).length;
    if (prevCount === 0) prevCount = 1;
    const conversionRate = Math.min(100, Math.round((count / prevCount) * 100));

    const commissionTotal = groupDeals.reduce((sum, d) => sum + (d.commission_amount || 0), 0);

    return {
      ...group,
      count,
      pctOfTotal,
      conversionRate,
      commissionTotal,
      deals: groupDeals,
    };
  });

  const vwwCount = deals.filter(d => d.level_sale_status === 'L3' || d.is_vww).length;
  const vwwRate = Math.round((vwwCount / totalDeals) * 100);

  return (
    <div className="space-y-6">
      {/* North Star KPI: VWW Metric Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>North Star Metric • VWW V2</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Lao Động Đi Làm Đã Xác Minh (Verified Working Worker)
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Tiêu chuẩn vàng: Worker ID + Phỏng vấn Đỗ + Vào ca thực tế (L3) + Đối soát chấm công xưởng hợp lệ.
          </p>
        </div>

        <div className="flex items-center space-x-6 shrink-0 bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-xs">
          <div className="text-center">
            <span className="text-xs text-emerald-300 uppercase font-bold block mb-0.5">Số lượng VWW</span>
            <span className="text-3xl font-black text-white">{vwwCount}</span>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center">
            <span className="text-xs text-teal-300 uppercase font-bold block mb-0.5">Tỷ lệ chuyển đổi</span>
            <span className="text-3xl font-black text-emerald-400">{vwwRate}%</span>
          </div>
        </div>
      </div>

      {/* 5-Step Funnel Flow Cards */}
      <div className="space-y-3">
        {groupStats.map((st, idx) => (
          <div key={st.key} className="space-y-2">
            <div
              onClick={() => onSelectGroup(st.key)}
              className="group bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* Left Stage Details */}
              <div className="flex items-start sm:items-center space-x-4">
                <div className={`w-10 h-10 rounded-xl ${st.headerBg} flex items-center justify-center font-black text-sm shrink-0 shadow-2xs`}>
                  {idx + 1}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {st.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${st.badgeClass}`}>
                      {st.shortTitle}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {st.description}
                  </p>
                </div>
              </div>

              {/* Middle Metrics & Progress Bar */}
              <div className="flex-1 max-w-xs space-y-1.5 self-center w-full">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>{st.count} lao động</span>
                  <span className="text-slate-500">{st.pctOfTotal}% tổng phễu</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      idx === 3 ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.max(5, st.pctOfTotal)}%` }}
                  />
                </div>
              </div>

              {/* Right Commission & Action */}
              <div className="flex items-center justify-between sm:justify-end space-x-4 shrink-0 text-right">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Hoa hồng dự kiến</span>
                  <span className="text-xs font-extrabold text-slate-800">
                    {st.commissionTotal.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <button
                  type="button"
                  className="px-3 py-1.5 bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Xem {st.count} Deal
                </button>
              </div>
            </div>

            {/* Down Arrow Connector between funnel stages */}
            {idx < groupStats.length - 1 && (
              <div className="flex items-center justify-center py-0.5 text-slate-300">
                <ArrowDown className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
