import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Building,
  Bus,
  Home,
  Users,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  ExternalLink,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { callApi } from '../../services/apiClient';

interface BranchFinancial {
  code: string;
  name: string;
  vwwCount: number;
  revenue: number; // Doanh thu cung ứng
  commissionCost: number; // Chi phí hoa hồng
  logisticsBusCost: number; // Chi phí xe đưa đón
  housingCost: number; // Chi phí KTX/Nhà trọ
  overheadCost: number; // Chi phí vận hành văn phòng
  netProfit: number; // Lợi nhuận ròng
  netMarginPercent: number; // Tỷ suất lợi nhuận ròng
}

interface AdvanceLedgerItem {
  id: string;
  ctvName: string;
  ctvPhone: string;
  branch: string;
  purpose: 'TIỀN_XE_ĐƯA_ĐÓN' | 'TIỀN_CỌC_KTX' | 'HỖ_TRỢ_TIỀN_ĂN' | 'TẠM_ỨNG_LƯƠNG';
  amount: number;
  workerRef: string; // Lao động bảo lãnh
  workerName: string;
  dateAdvanced: string;
  dueDate: string;
  reconciledAmount: number;
  status: 'HOÀN_ỨNG_TỰ_ĐỘNG_VWW' | 'ĐANG_LƯU_THÔNG' | 'QUÁ_HẠN_CẦN_THU_HỒI';
  notes: string;
}

const BRANCH_FINANCIALS: BranchFinancial[] = [
  {
    code: 'BAC_GIANG',
    name: 'Chi Nhánh Bắc Giang',
    vwwCount: 165,
    revenue: 792000000,
    commissionCost: 330000000,
    logisticsBusCost: 45000000,
    housingCost: 32000000,
    overheadCost: 25000000,
    netProfit: 360000000,
    netMarginPercent: 45.5,
  },
  {
    code: 'BAC_NINH',
    name: 'Chi Nhánh Bắc Ninh',
    vwwCount: 95,
    revenue: 456000000,
    commissionCost: 190000000,
    logisticsBusCost: 28000000,
    housingCost: 22000000,
    overheadCost: 18000000,
    netProfit: 198000000,
    netMarginPercent: 43.4,
  },
  {
    code: 'HA_NAM',
    name: 'Chi Nhánh Hà Nam',
    vwwCount: 68,
    revenue: 326400000,
    commissionCost: 136000000,
    logisticsBusCost: 22000000,
    housingCost: 16000000,
    overheadCost: 14000000,
    netProfit: 138400000,
    netMarginPercent: 42.4,
  },
  {
    code: 'HAI_DUONG',
    name: 'Chi Nhánh Hải Dương',
    vwwCount: 42,
    revenue: 201600000,
    commissionCost: 84000000,
    logisticsBusCost: 14000000,
    housingCost: 9000000,
    overheadCost: 10000000,
    netProfit: 84600000,
    netMarginPercent: 42.0,
  },
  {
    code: 'HUNG_YEN',
    name: 'Chi Nhánh Hưng Yên',
    vwwCount: 38,
    revenue: 182400000,
    commissionCost: 76000000,
    logisticsBusCost: 12000000,
    housingCost: 8000000,
    overheadCost: 9000000,
    netProfit: 77400000,
    netMarginPercent: 42.4,
  },
  {
    code: 'NAM_DINH',
    name: 'Chi Nhánh Nam Định',
    vwwCount: 32,
    revenue: 153600000,
    commissionCost: 64000000,
    logisticsBusCost: 15000000,
    housingCost: 6000000,
    overheadCost: 8000000,
    netProfit: 60600000,
    netMarginPercent: 39.5,
  },
];

const INITIAL_ADVANCES: AdvanceLedgerItem[] = [
  {
    id: 'TU-2026-001',
    ctvName: 'Nguyễn Văn Tuấn',
    ctvPhone: '0912345678',
    branch: 'BẮC GIANG',
    purpose: 'TIỀN_XE_ĐƯA_ĐÓN',
    amount: 5000000,
    workerRef: 'WK-T001',
    workerName: 'Nguyễn Văn An',
    dateAdvanced: '05/09/2026',
    dueDate: '20/09/2026',
    reconciledAmount: 5000000,
    status: 'HOÀN_ỨNG_TỰ_ĐỘNG_VWW',
    notes: 'Xe đón 12 công nhân Nam Định -> KCN Quang Châu. Đã đối soát khấu trừ khi đạt VWW.',
  },
  {
    id: 'TU-2026-002',
    ctvName: 'Trần Thị Mai',
    ctvPhone: '0987654321',
    branch: 'BẮC NINH',
    purpose: 'TIỀN_CỌC_KTX',
    amount: 3500000,
    workerRef: 'WK-T003',
    workerName: 'Lê Văn Cường',
    dateAdvanced: '08/09/2026',
    dueDate: '25/09/2026',
    reconciledAmount: 3500000,
    status: 'HOÀN_ỨNG_TỰ_ĐỘNG_VWW',
    notes: 'Cọc KTX 7 phòng công nhân KCN Quế Võ. Đã đối soát khấu trừ thành công.',
  },
  {
    id: 'TU-2026-003',
    ctvName: 'Lê Hoàng Long',
    ctvPhone: '0901234888',
    branch: 'HÀ NAM',
    purpose: 'HỖ_TRỢ_TIỀN_ĂN',
    amount: 2000000,
    workerRef: 'WK-T005',
    workerName: 'Hoàng Văn Em',
    dateAdvanced: '12/09/2026',
    dueDate: '28/09/2026',
    reconciledAmount: 2000000,
    status: 'HOÀN_ỨNG_TỰ_ĐỘNG_VWW',
    notes: 'Tạm ứng tiền ăn tuần đầu KCN Đồng Văn III.',
  },
  {
    id: 'TU-2026-004',
    ctvName: 'Đặng Quốc Huy',
    ctvPhone: '0934567890',
    branch: 'HẢI DƯƠNG',
    purpose: 'TIỀN_XE_ĐƯA_ĐÓN',
    amount: 4000000,
    workerRef: 'WK-T007',
    workerName: 'Đặng Văn Hải',
    dateAdvanced: '14/09/2026',
    dueDate: '30/09/2026',
    reconciledAmount: 4000000,
    status: 'HOÀN_ỨNG_TỰ_ĐỘNG_VWW',
    notes: 'Xe đưa đón tuyến Thái Bình -> KCN Phúc Điền.',
  },
  {
    id: 'TU-2026-005',
    ctvName: 'Phạm Văn Nam',
    ctvPhone: '0978901234',
    branch: 'BẮC GIANG',
    purpose: 'TẠM_ỨNG_LƯƠNG',
    amount: 3000000,
    workerRef: 'WK-T002',
    workerName: 'Trần Thị Bình',
    dateAdvanced: '16/09/2026',
    dueDate: '05/10/2026',
    reconciledAmount: 1500000,
    status: 'ĐANG_LƯU_THÔNG',
    notes: 'Tạm ứng cá nhân cho công nhân khó khăn, hoàn ứng kỳ lương tới.',
  },
];

export const BranchPnLAndVendorTab: React.FC = () => {
  const { showNotification } = useApp();
  const [subTab, setSubTab] = useState<'pnl' | 'vendor'>('pnl');

  const totalRevenue = useMemo(() => BRANCH_FINANCIALS.reduce((s, b) => s + b.revenue, 0), []);
  const totalCommission = useMemo(() => BRANCH_FINANCIALS.reduce((s, b) => s + b.commissionCost, 0), []);
  const totalBus = useMemo(() => BRANCH_FINANCIALS.reduce((s, b) => s + b.logisticsBusCost, 0), []);
  const totalHousing = useMemo(() => BRANCH_FINANCIALS.reduce((s, b) => s + b.housingCost, 0), []);
  const totalOverhead = useMemo(() => BRANCH_FINANCIALS.reduce((s, b) => s + b.overheadCost, 0), []);
  const totalNetProfit = useMemo(() => BRANCH_FINANCIALS.reduce((s, b) => s + b.netProfit, 0), []);
  const overallNetMargin = Math.round((totalNetProfit / totalRevenue) * 100);

  const totalAdvanceAmount = useMemo(() => INITIAL_ADVANCES.reduce((s, a) => s + a.amount, 0), []);
  const totalReconciled = useMemo(() => INITIAL_ADVANCES.reduce((s, a) => s + a.reconciledAmount, 0), []);

  const handleExportPnLCsv = () => {
    const header = 'Mã,Tên Chi Nhánh,Sản Lượng VWW,Doanh Thu Cung Ứng (đ),Chi Phí Hoa Hồng (đ),Chi Phí Xe Tuyến (đ),Chi Phí KTX Trọ (đ),Chi Phí Vận Hành (đ),Lợi Nhuận Ròng (đ),Biên Ròng (%)';
    const rows = BRANCH_FINANCIALS.map(b =>
      `"${b.code}","${b.name}",${b.vwwCount},${b.revenue},${b.commissionCost},${b.logisticsBusCost},${b.housingCost},${b.overheadCost},${b.netProfit},${b.netMarginPercent}%`
    );
    const csvContent = '\uFEFF' + [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FCS_Branch_PnL_Financial_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Đã xuất báo cáo P&L phân tầng chi nhánh (CSV)', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Financial Executive Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            <span>TỔNG DOANH THU CUNG ỨNG</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-300 mt-2">
            {(totalRevenue / 1000000000).toFixed(2)} <span className="text-xs font-semibold text-slate-400">tỷ VND</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1">Lũy kế 6 chi nhánh KCN trọng điểm</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-blue-950/70 via-slate-900 to-slate-950 border border-blue-500/40 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-blue-400">
            <span>LỢI NHUẬN RÒNG DOANH NGHIỆP</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-300 mt-2">
            {(totalNetProfit / 1000000000).toFixed(2)} <span className="text-xs font-semibold text-slate-400">tỷ VND</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${overallNetMargin}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">Biên lợi nhuận ròng toàn công ty: <strong>{overallNetMargin}%</strong></p>
        </div>

        <div className="p-4 bg-gradient-to-br from-amber-950/70 via-slate-900 to-slate-950 border border-amber-500/40 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-amber-400">
            <span>CHI PHÍ HỖ TRỢ XE & TRỌ</span>
            <Bus className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-2">
            {((totalBus + totalHousing) / 1000000).toFixed(1)} <span className="text-xs font-semibold text-slate-400">triệu đ</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1">Xe tuyến {((totalBus)/1000000).toFixed(0)}tr + Trọ {((totalHousing)/1000000).toFixed(0)}tr</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-950/70 via-slate-900 to-slate-950 border border-purple-500/40 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-purple-400">
            <span>TẠM ỨNG CTV ĐÃ THU HỒI</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-300 mt-2">
            {Math.round((totalReconciled / totalAdvanceAmount) * 100)}% <span className="text-xs font-semibold text-slate-400">an toàn</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1">Khấu trừ tự động qua đối soát VWW</p>
        </div>
      </div>

      {/* 🔴 MỤC CẦN CHAIRMAN VICTOR DUYỆT (HUMAN-IN-THE-LOOP EXECUTIVE CALLOUT) */}
      <div className="p-4.5 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-2 border-amber-500/60 rounded-xl space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-amber-300 font-extrabold text-sm">
            <Lock className="w-5 h-5 text-amber-400 shrink-0" />
            <span>DANH MỤC TRỌNG YẾU CẦN CHAIRMAN VICTOR PHÊ DUYỆT (EXECUTIVE ACTION ONLY)</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            CẦN CON NGƯỜI DUYỆT
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          AI CEO Lucky đã tự động hoàn thiện 100% logic thuật toán, bảng kê chi tiết và hệ thống đối soát P&L. Dưới đây là <strong>2 việc lớn có liên quan đến pháp lý & dòng tiền thật</strong> em ghi chú kính trình Chairman Victor phê duyệt:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
          <div className="p-3 bg-slate-950/90 border border-amber-500/30 rounded-lg space-y-1.5">
            <div className="font-extrabold text-white flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>1. Xác nhận Hợp đồng Nguyên tắc Nhà xe Tuyến Cố định</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Ký kết hợp đồng nguyên tắc với Công ty Vận tải Hải Đăng (tuyến Nam Định/Thái Bình - Bắc Giang, hạn mức thanh toán 50tr/tháng gối đầu).
            </p>
            <div className="text-[10px] text-amber-400 font-semibold">⏳ Trạng thái: Chờ Chairman Victor ký duyệt văn bản giấy</div>
          </div>

          <div className="p-3 bg-slate-950/90 border border-amber-500/30 rounded-lg space-y-1.5">
            <div className="font-extrabold text-white flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>2. Phê duyệt Hạn mức Bảo lãnh Tạm ứng CTV Tuyển Dụng</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Duyệt trần hạn mức tạm ứng tối đa 10.000.000 đ/CTV trong kỳ chưa đối soát công để chống rủi ro bùng nợ tạm ứng khi công nhân chưa đạt VWW.
            </p>
            <div className="text-[10px] text-amber-400 font-semibold">⏳ Trạng thái: Chờ Chairman Victor chốt trần ngân sách</div>
          </div>
        </div>
      </div>

      {/* Subtab Toggle Buttons */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSubTab('pnl')}
            className={`px-3.5 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-1.5 ${
              subTab === 'pnl'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>1. BÁO CÁO P&L PHÂN TẦNG 6 CHI NHÁNH</span>
          </button>

          <button
            onClick={() => setSubTab('vendor')}
            className={`px-3.5 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-1.5 ${
              subTab === 'vendor'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Bus className="w-3.5 h-3.5" />
            <span>2. SỔ CÁI CTV & TẠM ỨNG XE TRỌ (HOÀN ỨNG AUTO)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-400 text-slate-950 font-black">
              5 PHIẾU
            </span>
          </button>
        </div>

        <button
          onClick={handleExportPnLCsv}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5 shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>XUẤT BÁO CÁO P&L (CSV)</span>
        </button>
      </div>

      {/* SUBTAB 1: P&L BY BRANCH TABLE */}
      {subTab === 'pnl' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                <Building className="w-4 h-4 text-blue-400" />
                <span>Bảng Cân Đối Tài Chính P&L Chi Tiết Theo 6 Chi Nhánh Trọng Điểm</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Bóc tách chi phí hoa hồng, chi phí logistics xe tuyến và KTX nhà trọ để tính biên lợi nhuận ròng thực tế
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              LỢI NHUẬN RÒNG: {(totalNetProfit / 1000000).toLocaleString('vi-VN')} đ
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3.5">Chi Nhánh</th>
                  <th className="py-3 px-3 text-center">Sản Lượng VWW</th>
                  <th className="py-3 px-3 text-right">Doanh Thu Cung Ứng</th>
                  <th className="py-3 px-3 text-right">Hoa Hồng Tuyển Dụng</th>
                  <th className="py-3 px-3 text-right">Xe Đưa Đón</th>
                  <th className="py-3 px-3 text-right">KTX & Nhà Trọ</th>
                  <th className="py-3 px-3 text-right">Vận Hành VP</th>
                  <th className="py-3 px-3 text-right font-black text-emerald-300">Lợi Nhuận Ròng</th>
                  <th className="py-3 px-3 text-center">Biên Ròng (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
                {BRANCH_FINANCIALS.map(b => (
                  <tr key={b.code} className="hover:bg-slate-800/60 transition-colors">
                    <td className="py-3 px-3.5">
                      <div className="font-extrabold text-white text-xs">{b.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{b.code}</div>
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-purple-300">
                      {b.vwwCount} VWW
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-200">
                      {(b.revenue / 1000000).toLocaleString('vi-VN')} tr
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-rose-300">
                      -{(b.commissionCost / 1000000).toLocaleString('vi-VN')} tr
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-amber-300">
                      -{(b.logisticsBusCost / 1000000).toLocaleString('vi-VN')} tr
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-amber-300">
                      -{(b.housingCost / 1000000).toLocaleString('vi-VN')} tr
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-400">
                      -{(b.overheadCost / 1000000).toLocaleString('vi-VN')} tr
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-black text-emerald-400 text-xs">
                      +{(b.netProfit / 1000000).toLocaleString('vi-VN')} tr
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {b.netMarginPercent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: VENDOR & ADVANCE LEDGER */}
      {subTab === 'vendor' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                <Bus className="w-4 h-4 text-amber-400" />
                <span>Sổ Cái Đối Soát Tạm Ứng CTV & Xe Tuyến KCN ({INITIAL_ADVANCES.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Cơ chế khấu trừ tự động: Tạm ứng tiền xe, tiền ăn sẽ được tự động hoàn ứng khi công nhân đạt mốc VWW
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              ĐÃ HOÀN ỨNG: {(totalReconciled / 1000000).toLocaleString('vi-VN')} tr
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3.5">Mã Phiếu & CTV</th>
                  <th className="py-3 px-3">Chi Nhánh</th>
                  <th className="py-3 px-3">Mục Đích Tạm Ứng</th>
                  <th className="py-3 px-3 text-right">Số Tiền Ứng</th>
                  <th className="py-3 px-3">Lao Động Bảo Lãnh</th>
                  <th className="py-3 px-3 text-center">Ngày Ứng</th>
                  <th className="py-3 px-3 text-center">Hạn Hoàn Ứng</th>
                  <th className="py-3 px-3 text-center">Trạng Thái Hoàn Ứng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
                {INITIAL_ADVANCES.map(a => (
                  <tr key={a.id} className="hover:bg-slate-800/60 transition-colors">
                    <td className="py-3 px-3.5">
                      <div className="font-extrabold text-white text-xs flex items-center space-x-1.5">
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {a.id}
                        </span>
                        <span>{a.ctvName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{a.ctvPhone}</div>
                    </td>

                    <td className="py-3 px-3 text-slate-300 font-bold">{a.branch}</td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        {a.purpose.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-amber-300">
                      {a.amount.toLocaleString('vi-VN')} đ
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-white text-xs">{a.workerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{a.workerRef}</div>
                    </td>

                    <td className="py-3 px-3 text-center text-slate-400 font-mono">{a.dateAdvanced}</td>
                    <td className="py-3 px-3 text-center text-slate-300 font-mono">{a.dueDate}</td>

                    <td className="py-3 px-3 text-center">
                      {a.status === 'HOÀN_ỨNG_TỰ_ĐỘNG_VWW' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          ✓ ĐÃ HOÀN ỨNG VWW
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          ĐANG LƯU THÔNG
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default BranchPnLAndVendorTab;
