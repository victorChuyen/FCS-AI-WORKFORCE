import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { OperationalResults } from '../types';
import {
  BarChart3,
  Award,
  TrendingUp,
  Users,
  ShieldCheck,
  Building,
  Building2,
  Download,
  Calendar,
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw,
  Briefcase,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import { B2BEmployerOrdersTab } from '../components/results/B2BEmployerOrdersTab';
import { CommissionSettlementTab } from '../components/results/CommissionSettlementTab';
import { BranchPnLAndVendorTab } from '../components/results/BranchPnLAndVendorTab';

export const ResultsPage: React.FC = () => {
  const { refreshKey, showNotification, currentUser } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState<OperationalResults | null>(null);
  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'all'>('month');
  const [loading, setLoading] = useState(true);

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'vww' | 'b2b-orders' | 'commission' | 'pnl-vendor'>(
    tabParam === 'b2b-orders' || tabParam === 'commission' || tabParam === 'pnl-vendor' ? tabParam : 'vww'
  );

  useEffect(() => {
    if (tabParam === 'b2b-orders' || tabParam === 'commission' || tabParam === 'pnl-vendor' || tabParam === 'vww') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (t: 'vww' | 'b2b-orders' | 'commission' | 'pnl-vendor') => {
    setActiveTab(t);
    setSearchParams({ tab: t });
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await api.getOperationalResults();
      if (res.data) {
        setResults(res.data);
      }
    } catch (err: any) {
      showNotification('Không thể tải dữ liệu kết quả', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [refreshKey, timeframe]);

  const handleExportCsv = () => {
    if (!results) return;
    const partners = results.partnerPerformance || [];
    // Build CSV content
    const partnerCsv = [
      'Loại đối tác,Tổng nhận việc,VWW Đạt,Tỷ lệ VWW,Tỷ lệ giữ chân 7 ngày',
      ...partners.map(
        p => `"${p.partnerName}",${p.totalStarted},${p.vwwCount},${p.vwwRate}%,${p.retention7DaysRate}%`
      ),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + partnerCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FCS_VWW_Operational_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Đã xuất báo cáo VWW định dạng CSV thành công', 'success');
  };

  if (loading && !results) {
    return (
      <div className="py-20 text-center">
        <RefreshCw className="w-8 h-8 mx-auto text-blue-600 animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-medium">Đang tổng hợp kết quả vận hành...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5">
            <span className="inline-flex items-center space-x-1 font-extrabold text-emerald-700 uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              <span>Giai Đoạn 3: Quản Trị Khách Hàng & Doanh Thu</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
              {currentUser.tenantId || 'FCS-000001'}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full font-extrabold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300">
              ✓ GĐ3 ĐÃ PHÊ DUYỆT
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Kết Quả VWW, B2B 29 Xưởng & Hoa Hồng
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Hệ thống quản trị chỉ tiêu Headcount 29 nhà máy KCN, đối soát máy mở khóa North Star VWW và quy trình ký duyệt hoa hồng 4 cấp điện tử.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe switch */}
          <div className="bg-slate-100 p-1 rounded-lg flex space-x-1 text-xs font-bold">
            <button
              onClick={() => setTimeframe('month')}
              className={`px-3 py-1.5 rounded-md cursor-pointer ${
                timeframe === 'month' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Tháng này
            </button>
            <button
              onClick={() => setTimeframe('quarter')}
              className={`px-3 py-1.5 rounded-md cursor-pointer ${
                timeframe === 'quarter' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Quý này
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`px-3 py-1.5 rounded-md cursor-pointer ${
                timeframe === 'all' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Toàn thời gian
            </button>
          </div>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>XUẤT BÁO CÁO (CSV)</span>
          </button>
        </div>
      </div>

      {/* 3 Main Navigation Tabs for Results & Stage 3 */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => handleTabChange('vww')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'vww'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/20'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>1. THƯỚC ĐO VWW & HIỆU SUẤT</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('b2b-orders')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'b2b-orders'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-700/20'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>2. B2B 29 NHÀ MÁY & SLA HEADCOUNT (GĐ 3)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-400 text-slate-950 font-black">
            29 XƯỞNG
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('commission')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'commission'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-800 text-white shadow-md shadow-purple-700/20'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>3. BILLING & DUYỆT HOA HỒNG 4 CẤP (GĐ 3)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-400 text-slate-950 font-black">
            4 CẤP KÝ SỐ
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('pnl-vendor')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'pnl-vendor'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-800 text-white shadow-md shadow-cyan-700/20'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>4. TÀI CHÍNH, SỔ CÁI CTV & P&L CHI NHÁNH (GĐ 4)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-cyan-400 text-slate-950 font-black">
            6 CHI NHÁNH
          </span>
        </button>
      </div>

      {/* TAB 2: B2B EMPLOYER 29 FACTORIES */}
      {activeTab === 'b2b-orders' && <B2BEmployerOrdersTab />}

      {/* TAB 3: COMMISSION SETTLEMENT 4-TIER */}
      {activeTab === 'commission' && <CommissionSettlementTab />}

      {/* TAB 4: P&L BY BRANCH & VENDOR ADVANCE LEDGER */}
      {activeTab === 'pnl-vendor' && <BranchPnLAndVendorTab />}

      {/* TAB 1: VWW NORTH STAR & OPERATIONAL RESULTS */}
      {activeTab === 'vww' && (
        <div className="space-y-6">
          {/* TOP 4 OPERATIONAL KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: VWW Achieved */}
        <div className="p-5 bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-300 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-emerald-800 mb-1">
            <span>★ NORTH STAR METRIC</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-700 mt-2">
            {results?.totalVwwThisMonth ?? 0}{' '}
            <span className="text-sm font-semibold text-slate-500">người</span>
          </div>
          <p className="text-xs font-bold text-slate-900 mt-1">Tổng VWW tháng này</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Lũy kế toàn thời gian:{' '}
            <span className="font-bold text-slate-700">
              {results?.totalVwwAllTime !== undefined ? `${results.totalVwwAllTime} VWW` : 'CHƯA CÓ DỮ LIỆU'}
            </span>
          </p>
        </div>

        {/* Metric 2: Interview Pass Rate */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            <span>TỶ LỆ ĐỖ PHỎNG VẤN</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-blue-700 mt-2">
            {results?.interviewPassRate !== undefined ? `${results.interviewPassRate}%` : 'CHƯA CÓ DỮ LIỆU'}
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full"
              style={{ width: `${Math.min(results?.interviewPassRate || 0, 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Đo lường chất lượng nguồn & sơ tuyển</p>
        </div>

        {/* Metric 3: Offer to Start Rate */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            <span>ĐẬU → ĐI LÀM THỰC TẾ</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-purple-700 mt-2">
            {results?.offerToStartRate !== undefined && results.offerToStartRate > 0
              ? `${results.offerToStartRate}%`
              : 'CHƯA CÓ DỮ LIỆU'}
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-purple-600 h-1.5 rounded-full"
              style={{ width: `${Math.min(results?.offerToStartRate || 0, 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Tỷ lệ ứng viên không bùng đơn sau trúng tuyển</p>
        </div>

        {/* Metric 4: 7-Day Retention */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            <span>GIỮ CHÂN 7 NGÀY / 30 NGÀY</span>
            <ShieldCheck className="w-4 h-4 text-cyan-700" />
          </div>
          <div className="text-3xl font-black text-cyan-800 mt-2">
            {results?.retention7DaysRate !== undefined && results.retention7DaysRate > 0
              ? `${results.retention7DaysRate}%`
              : 'CHƯA CÓ DỮ LIỆU'}
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Giữ chân 30 ngày:{' '}
            <span className="font-bold text-slate-800">
              {results?.retention30DaysRate !== undefined && results.retention30DaysRate > 0
                ? `${results.retention30DaysRate}%`
                : 'CHƯA CÓ DỮ LIỆU'}
            </span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Đảm bảo đối tác thanh toán phí cung ứng trọn gói</p>
        </div>
      </div>

      {/* SECTION 5: PERFORMANCE BY PARTNER / FACTORY */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              5. Hiệu suất cung ứng theo Đối tác / Nhà máy
            </h3>
            <p className="text-xs text-slate-500">
              Tỷ lệ hoàn thành công việc và đạt trạng thái Verified Working Worker tại từng nhà máy
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Nhà máy / Đối tác</th>
                <th className="py-3 px-4">Đã bắt đầu làm</th>
                <th className="py-3 px-4">Đã đạt VWW</th>
                <th className="py-3 px-4">Tỷ lệ VWW</th>
                <th className="py-3 px-4">Giữ chân 7 ngày</th>
                <th className="py-3 px-4">Đánh giá vận hành</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {(results?.partnerPerformance || []).map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{p.partnerName}</td>
                  <td className="py-3.5 px-4">{p.totalStarted} người</td>
                  <td className="py-3.5 px-4 font-black text-emerald-700">{p.vwwCount} VWW</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">{p.vwwRate}%</span>
                      <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-1.5 rounded-full"
                          style={{ width: `${p.vwwRate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-blue-700">{p.retention7DaysRate}%</td>
                  <td className="py-3.5 px-4">
                    {p.vwwRate >= 90 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        Rất tốt
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                        Cần bám sát điểm danh
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 6: PERFORMANCE BY OFFICE / RECRUITER */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              6. Hiệu suất theo Văn phòng & Nhân viên tuyển dụng
            </h3>
            <p className="text-xs text-slate-500">
              Chỉ số tính hoa hồng & thi đua dựa trên sản lượng VWW thực tế tạo ra
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Nhân viên</th>
                <th className="py-3 px-4">Văn phòng</th>
                <th className="py-3 px-4">Lao động tiếp nhận</th>
                <th className="py-3 px-4">Đã đậu</th>
                <th className="py-3 px-4">VWW Hoàn thành</th>
                <th className="py-3 px-4">Hiệu suất</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {results?.recruiterPerformance.map((rec, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{rec.recruiterName}</td>
                  <td className="py-3.5 px-4 text-slate-500">{rec.officeName}</td>
                  <td className="py-3.5 px-4">{rec.totalAssigned} hồ sơ</td>
                  <td className="py-3.5 px-4">{rec.passedCount} người</td>
                  <td className="py-3.5 px-4 font-black text-emerald-700">{rec.vwwCount} VWW</td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900">
                      {Math.round((rec.vwwCount / (rec.totalAssigned || 1)) * 100)}% chuyển đổi
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        </div>
      )}
    </div>
  );
};

export default ResultsPage;
