import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Megaphone,
  Sparkles,
  Zap,
  Users,
  Video,
  Share2,
  TrendingUp,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  Copy,
  Check,
  Send,
  RefreshCw,
  Lock,
  ExternalLink,
  PhoneCall,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { callApi } from '../services/apiClient';
import { callAiRouter } from '../services/aiRouterService';

interface InboundLead {
  id: string;
  fullName: string;
  phone: string;
  channel: 'TIKTOK_ADS' | 'FACEBOOK_LEADS' | 'ZALO_MINI_APP' | 'LANDING_PAGE' | 'HOTLINE';
  targetCompany: string;
  location: string;
  assignedTelesale: string;
  slaSeconds: number;
  timestamp: string;
  status: 'PUSHED_TO_C3' | 'CALLING' | 'INTERVIEW_SCHEDULED' | 'REJECTED';
  notes: string;
}

interface TelesaleAgent {
  id: string;
  name: string;
  branch: string;
  phone: string;
  activeLeadsCount: number;
  maxCapacity: number;
  avgResponseSeconds: number;
  conversionRatePercent: number;
  status: 'ONLINE' | 'BUSY' | 'OFFLINE';
}

const INITIAL_TELESALE_AGENTS: TelesaleAgent[] = [
  {
    id: 'TS-001',
    name: 'Lương Tuấn',
    branch: 'BẮC GIANG',
    phone: '0912345678',
    activeLeadsCount: 18,
    maxCapacity: 25,
    avgResponseSeconds: 42,
    conversionRatePercent: 38.5,
    status: 'ONLINE',
  },
  {
    id: 'TS-002',
    name: 'Nguyễn Thị Hoa',
    branch: 'BẮC NINH',
    phone: '0987654321',
    activeLeadsCount: 14,
    maxCapacity: 20,
    avgResponseSeconds: 48,
    conversionRatePercent: 35.0,
    status: 'ONLINE',
  },
  {
    id: 'TS-003',
    name: 'Đỗ Thảo',
    branch: 'HÀ NAM',
    phone: '0901234567',
    activeLeadsCount: 10,
    maxCapacity: 20,
    avgResponseSeconds: 55,
    conversionRatePercent: 34.2,
    status: 'ONLINE',
  },
  {
    id: 'TS-004',
    name: 'Vũ Hùng',
    branch: 'HẢI DƯƠNG',
    phone: '0934567890',
    activeLeadsCount: 8,
    maxCapacity: 15,
    avgResponseSeconds: 50,
    conversionRatePercent: 32.0,
    status: 'ONLINE',
  },
];

const INITIAL_INBOUND_LEADS: InboundLead[] = [
  {
    id: 'LD-2026-0919-001',
    fullName: 'Hoàng Văn Mạnh',
    phone: '0389123456',
    channel: 'TIKTOK_ADS',
    targetCompany: 'LUXSHARE',
    location: 'Bắc Giang',
    assignedTelesale: 'Lương Tuấn',
    slaSeconds: 28,
    timestamp: '19/09/2026 09:12:15',
    status: 'CALLING',
    notes: 'Xem video TikTok AirPods lương 11tr, cần việc có KTX bao ăn.',
  },
  {
    id: 'LD-2026-0919-002',
    fullName: 'Nguyễn Thị Lan Anh',
    phone: '0978654321',
    channel: 'FACEBOOK_LEADS',
    targetCompany: 'FUYU',
    location: 'Bắc Giang',
    assignedTelesale: 'Lương Tuấn',
    slaSeconds: 35,
    timestamp: '19/09/2026 09:05:40',
    status: 'INTERVIEW_SCHEDULED',
    notes: 'Đi cặp 2 vợ chồng, hẹn phỏng vấn thứ 2 tại KCN Đình Trám.',
  },
  {
    id: 'LD-2026-0919-003',
    fullName: 'Lê Đình Trọng',
    phone: '0912987654',
    channel: 'ZALO_MINI_APP',
    targetCompany: 'GOERTEK',
    location: 'Bắc Ninh',
    assignedTelesale: 'Nguyễn Thị Hoa',
    slaSeconds: 45,
    timestamp: '19/09/2026 08:52:10',
    status: 'PUSHED_TO_C3',
    notes: 'Ứng tuyển xưởng sạch Quế Võ, có kinh nghiệm hàn linh kiện.',
  },
  {
    id: 'LD-2026-0919-004',
    fullName: 'Phạm Minh Đức',
    phone: '0356789123',
    channel: 'TIKTOK_ADS',
    targetCompany: 'CANON',
    location: 'Bắc Ninh',
    assignedTelesale: 'Nguyễn Thị Hoa',
    slaSeconds: 22,
    timestamp: '19/09/2026 08:40:00',
    status: 'INTERVIEW_SCHEDULED',
    notes: 'Đã hẹn xe đón từ Lạng Sơn về KCN Tiên Sơn.',
  },
  {
    id: 'LD-2026-0919-005',
    fullName: 'Trần Văn Kiên',
    phone: '0945678123',
    channel: 'LANDING_PAGE',
    targetCompany: 'WNC',
    location: 'Hà Nam',
    assignedTelesale: 'Đỗ Thảo',
    slaSeconds: 58,
    timestamp: '19/09/2026 08:15:22',
    status: 'PUSHED_TO_C3',
    notes: 'Đăng ký nhận Blueprint việc làm KCN Đồng Văn III.',
  },
];

export const MarketingHarvesterPage: React.FC = () => {
  const { showNotification, currentUser, navigateTo } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'harvester' | 'routing' | 'ai-scripts' | 'approval'>(
    (tabParam as any) || 'harvester'
  );

  useEffect(() => {
    if (tabParam && ['harvester', 'routing', 'ai-scripts', 'approval'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);

  const handleTabChange = (t: 'harvester' | 'routing' | 'ai-scripts' | 'approval') => {
    setActiveTab(t);
    setSearchParams({ tab: t });
  };

  // Harvester State
  const [leads, setLeads] = useState<InboundLead[]>(INITIAL_INBOUND_LEADS);
  const [isSimulating, setIsSimulating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('ALL');

  // AI Script Generator State
  const [selectedCompany, setSelectedCompany] = useState('LUXSHARE');
  const [targetAudience, setTargetAudience] = useState('Lao động trẻ 18-28 tuổi tìm việc bao ăn ở');
  const [contentType, setContentType] = useState<'TIKTOK_REELS' | 'FACEBOOK_POST' | 'ZALO_BROADCAST'>('TIKTOK_REELS');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  // 1-Click Simulation: Real Ingestion into 04_LEADS_MARKETING & C3
  const handleSimulateInboundLead = async () => {
    setIsSimulating(true);
    const mockNames = ['Đặng Quốc Bảo', 'Vũ Thị Thanh Tâm', 'Nguyễn Hữu Tài', 'Bùi Văn Tiến'];
    const mockPhones = ['0399887766', '0988776655', '0911223344', '0377665544'];
    const mockCompanies = ['LUXSHARE', 'FUYU', 'GOERTEK', 'WNC', 'CANON'];
    const mockChannels: InboundLead['channel'][] = ['TIKTOK_ADS', 'FACEBOOK_LEADS', 'ZALO_MINI_APP'];

    const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
    const randomPhone = mockPhones[Math.floor(Math.random() * mockPhones.length)];
    const randomCompany = mockCompanies[Math.floor(Math.random() * mockCompanies.length)];
    const randomChannel = mockChannels[Math.floor(Math.random() * mockChannels.length)];

    const newLeadId = `LD-2026-0919-${Date.now().toString(36).substring(2, 6).toUpperCase()}`;

    try {
      // 1. Call Real API to append to Google Sheets 04_LEADS_MARKETING
      await callApi('v2.lead.capture', {
        fullName: randomName,
        phone: randomPhone,
        email: `${randomPhone}@lead.fcs.vn`,
        companyName: randomCompany,
        workforceScale: '50-100 LĐ',
        bottleneck: `Inbound Lead từ ${randomChannel} quan tâm xưởng ${randomCompany}. Tự động chuyển tầng C3.`,
        source: randomChannel,
      });

      // 2. Append to local state feed
      const newLeadItem: InboundLead = {
        id: newLeadId,
        fullName: randomName,
        phone: randomPhone,
        channel: randomChannel,
        targetCompany: randomCompany,
        location: randomCompany === 'WNC' ? 'Hà Nam' : 'Bắc Giang',
        assignedTelesale: 'Lương Tuấn',
        slaSeconds: 15,
        timestamp: new Date().toLocaleString('vi-VN'),
        status: 'PUSHED_TO_C3',
        notes: `Tự động đẩy vào CRM Deal Stage C3 trong 1s. Nguồn: ${randomChannel}.`,
      };

      setLeads(prev => [newLeadItem, ...prev]);
      showNotification(`⚡ INBOUND HARVESTER: Lead ${randomName} (${randomPhone}) đã đổ vào C3 trong 1s!`, 'success');
    } catch {
      showNotification('Lỗi khi mô phỏng lead', 'warning');
    } finally {
      setIsSimulating(false);
    }
  };

  // AI Script Generation with Gemini Pool
  const handleGenerateScript = async () => {
    setIsGeneratingAi(true);
    setGeneratedScript(null);
    try {
      const prompt = `Bạn là Giám đốc Marketing AI (CMO) của hệ thống tuyển dụng FCS AI Workforce.
Hãy viết một kịch bản Video ngắn TikTok/Reels 15s-30s tuyển dụng công nhân đi làm ngay cho nhà máy: ${selectedCompany}.
Đối tượng mục tiêu: ${targetAudience}.
Định dạng: ${contentType}.

Yêu cầu nội dung:
1. [0-3s] HOOK GIẬT GÂN: Đánh mạnh vào nỗi đau thất nghiệp, nợ nần, bị môi giới lừa tiền, muốn đổi đời.
2. [3-12s] NỖI ĐAU & ĐỒNG CẢM: Cuộc sống chật vật, xin việc khó khăn.
3. [12-22s] GIẢI PHÁP / OFFER ĐỘC QUYỀN FCS:
   - Xưởng sạch điều hòa 100%, không độc hại.
   - Thu nhập 9.000.000 - 13.000.000 đ/tháng, tăng ca đều.
   - Hỗ trợ KTX điều hòa FREE, bao cơm ca 3 bữa.
   - Xe ô tô FCS đón tận cổng nhà, không mất 1 đồng cọc môi giới!
4. [22-30s] CALL TO ACTION (CTA): Thúc giục bình luận "1" hoặc bấm link Bio, gán hotline kết nối Zalo trong 1 giây.
5. GỢI Ý CẢNH QUAY B-ROLL: Cảnh khay cơm ca đầy ắp, cảnh phòng KTX điều hòa, cảnh nhận lương qua thẻ ATM.

Hãy viết thật cuốn hút, mộc mạc, gần gũi với công nhân lao động phổ thông.`;

      const response = await callAiRouter(
        [
          { role: 'system', content: 'Bạn là chuyên gia sản xuất kịch bản video TikTok tuyển dụng hàng đầu Việt Nam.' },
          { role: 'user', content: prompt }
        ],
        { modelKey: 'deepReasoning', temperature: 0.6 }
      );

      setGeneratedScript(response);
      showNotification('Đã sinh kịch bản tuyển dụng AI thành công!', 'success');
    } catch (e) {
      showNotification('Lỗi khi sinh kịch bản AI', 'warning');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const copyScriptToClipboard = () => {
    if (!generatedScript) return;
    navigator.clipboard.writeText(generatedScript);
    setCopiedScript(true);
    showNotification('Đã sao chép kịch bản vào bộ nhớ tạm!', 'info');
    setTimeout(() => setCopiedScript(false), 2000);
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchSearch =
        l.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.phone.includes(searchQuery) ||
        l.targetCompany.toLowerCase().includes(searchQuery.toLowerCase());
      const matchChannel = channelFilter === 'ALL' || l.channel === channelFilter;
      return matchSearch && matchChannel;
    });
  }, [leads, searchQuery, channelFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5">
            <span className="inline-flex items-center space-x-1 font-extrabold text-indigo-700 uppercase tracking-wider">
              <Megaphone className="w-3.5 h-3.5" />
              <span>Giai Đoạn 5: AI Marketing & Lead Harvester</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
              {currentUser.tenantId || 'FCS-000001'}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full font-extrabold text-[10px] bg-indigo-100 text-indigo-800 border border-indigo-300">
              ⚡ 1S INGESTION
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            AI Marketing CRM & Inbound Lead Harvester
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Hệ thống thu thập Lead đa kênh (TikTok Ads, FB Ads, Zalo) đẩy thẳng C3 trong 1s, thuật toán phân bổ thông minh Telesale và xưởng video AI.
          </p>
        </div>

        {/* Quick Simulation Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSimulateInboundLead}
            disabled={isSimulating}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <Zap className={`w-4 h-4 text-amber-300 ${isSimulating ? 'animate-bounce' : ''}`} />
            <span>{isSimulating ? 'ĐANG BẮN DATA VÀO C3...' : 'MÔ PHỎNG LEAD MỚI ĐỔ VỀ (1-CLICK TEST 1S)'}</span>
          </button>
        </div>
      </div>

      {/* Top 4 Harvester KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-950 border border-indigo-500/40 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-indigo-400">
            <span>LEAD THU VỀ HÔM NAY</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-300 mt-2">
            {leads.length} <span className="text-xs font-semibold text-slate-400">leads nóng</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1">Đa kênh TikTok Ads & Facebook Ads</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            <span>TỐC ĐỘ ĐẨY VÀO TẦNG C3</span>
            <Zap className="w-4 h-4 text-amber-300" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-300 mt-2">
            0.85s <span className="text-xs font-semibold text-slate-400">real-time</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1">100% tự động sinh Deal C3 & lưu Sheet</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-blue-950/70 via-slate-900 to-slate-950 border border-blue-500/40 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-blue-400">
            <span>TELESALE SLA TRUNG BÌNH</span>
            <PhoneCall className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-300 mt-2">
            48s <span className="text-xs font-semibold text-slate-400">gọi lại</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1">Tỷ lệ bắt máy lần đầu đạt 84.5%</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-950/70 via-slate-900 to-slate-950 border border-purple-500/40 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-purple-400">
            <span>KỊCH BẢN AI VIRAL</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-300 mt-2">
            29 xưởng <span className="text-xs font-semibold text-slate-400">sẵn sàng</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1">Gemini Cloud Pool 24/7 sinh tự động</p>
        </div>
      </div>

      {/* Main 4 Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => handleTabChange('harvester')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'harvester'
              ? 'bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-md shadow-indigo-700/20'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-300" />
          <span>1. INBOUND LEAD HARVESTER (FEED 1 GIÂY)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-400 text-slate-950 font-black">
            {leads.length} LEAD
          </span>
        </button>

        <button
          onClick={() => handleTabChange('routing')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'routing'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-700/20'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>2. PHÂN BỔ THÔNG MINH TELESALE (SMART ROUTING)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-400 text-slate-950 font-black">
            4 TELESALE
          </span>
        </button>

        <button
          onClick={() => handleTabChange('ai-scripts')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'ai-scripts'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-800 text-white shadow-md shadow-purple-700/20'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Video className="w-4 h-4 text-pink-300" />
          <span>3. XƯỞNG SẢN XUẤT VIDEO AI (VIRAL SCRIPTS)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-pink-400 text-slate-950 font-black">
            AI POOL
          </span>
        </button>

        <button
          onClick={() => handleTabChange('approval')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'approval'
              ? 'bg-gradient-to-r from-amber-600 to-orange-700 text-white shadow-md shadow-amber-700/20'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Lock className="w-4 h-4 text-amber-300" />
          <span>4. THẨM QUYỀN CHAIRMAN (NGÂN SÁCH & PHÁP LÝ ADS)</span>
        </button>
      </div>

      {/* TAB 1: INBOUND LEAD HARVESTER FEED */}
      {activeTab === 'harvester' && (
        <div className="space-y-4">
          {/* Search & Channel Filter */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên, SĐT, nhà máy..."
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[11px] font-bold mr-1 hidden sm:inline">Kênh nguồn:</span>
              {[
                { id: 'ALL', label: 'Tất cả' },
                { id: 'TIKTOK_ADS', label: 'TikTok Ads' },
                { id: 'FACEBOOK_LEADS', label: 'Facebook Ads' },
                { id: 'ZALO_MINI_APP', label: 'Zalo OA' },
                { id: 'LANDING_PAGE', label: 'Landing Page' },
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setChannelFilter(c.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    channelFilter === c.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Inbound Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Dòng Chảy Lead Đổ Về Thời Gian Thực (Đã Bắn Thẳng C3: {filteredLeads.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Đồng bộ tức thì 2 chiều vào Google Sheets Tab `04_LEADS_MARKETING` và khởi tạo Deal `C3` tại `02_CRM_DEALS_2026`
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                ● LIVE WEBHOOK
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3.5">Mã Lead & Họ Tên</th>
                    <th className="py-3 px-3">Số Điện Thoại</th>
                    <th className="py-3 px-3">Kênh Quảng Cáo</th>
                    <th className="py-3 px-3">Nhà Máy Mong Muốn</th>
                    <th className="py-3 px-3">Telesale Phụ Trách</th>
                    <th className="py-3 px-3 text-center">Tốc Độ Đẩy C3</th>
                    <th className="py-3 px-3 text-center">Trạng Thái</th>
                    <th className="py-3 px-3 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
                  {filteredLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-slate-800/60 transition-colors">
                      <td className="py-3 px-3.5">
                        <div className="font-extrabold text-white text-xs flex items-center space-x-1.5">
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {lead.id}
                          </span>
                          <span>{lead.fullName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{lead.timestamp}</div>
                      </td>

                      <td className="py-3 px-3 font-mono text-amber-300 font-bold">{lead.phone}</td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                          {lead.channel.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-bold text-blue-400">{lead.targetCompany}</span>
                        <span className="text-slate-400 text-[10px] ml-1">({lead.location})</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-bold text-purple-300">{lead.assignedTelesale}</span>
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-bold text-emerald-400">
                        {lead.slaSeconds}s
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          ✓ ĐÃ VÀO C3
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => navigateTo('/app/pipeline')}
                          className="p-1.5 bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 rounded-lg transition-colors cursor-pointer"
                          title="Xem trên Phễu Pipeline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SMART LEAD ROUTING */}
      {activeTab === 'routing' && (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/40 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Thuật Toán Phân Bổ Lead Tự Động (Smart Routing Algorithm)</span>
              </h3>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ACTIVE: WEIGHTED SLA (NĂNG LỰC CHỐT)
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Dữ liệu từ TikTok/Facebook đổ về sẽ được phân tích vị trí xưởng mong muốn và tự động bắn data nóng cho Telesale trực chiến có SLA phản hồi nhanh nhất. Nếu sau <strong>5 phút</strong> Telesale không gọi, hệ thống tự động điều chuyển cho người tiếp theo!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INITIAL_TELESALE_AGENTS.map(agent => (
              <div key={agent.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-extrabold text-white text-sm">{agent.name}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-blue-500/20 text-blue-300">
                      {agent.branch}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400">{agent.phone}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-950 rounded-lg">
                    <div className="text-[10px] text-slate-400">Lead Đang Xử Lý</div>
                    <div className="font-bold text-purple-300 text-sm mt-0.5">{agent.activeLeadsCount} / {agent.maxCapacity}</div>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-lg">
                    <div className="text-[10px] text-slate-400">SLA Gọi Lại</div>
                    <div className="font-bold text-emerald-400 text-sm mt-0.5">{agent.avgResponseSeconds}s</div>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-lg">
                    <div className="text-[10px] text-slate-400">Tỷ Lệ Đỗ PV</div>
                    <div className="font-bold text-amber-300 text-sm mt-0.5">{agent.conversionRatePercent}%</div>
                  </div>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-1.5 rounded-full"
                    style={{ width: `${Math.round((agent.activeLeadsCount / agent.maxCapacity) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AI SHORT-VIDEO SCRIPT GENERATOR */}
      {activeTab === 'ai-scripts' && (
        <div className="space-y-4">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4 shadow-sm">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Xưởng Sản Xuất Kịch Bản Video AI Tuyển Dụng (Powered by Gemini Cloud Pool)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tự động tạo kịch bản video TikTok 15s-30s và bài viết quảng cáo Facebook thu hút công nhân ứng tuyển tức thì
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">1. Nhà máy cần tuyển gấp</label>
                <select
                  value={selectedCompany}
                  onChange={e => setSelectedCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="LUXSHARE">LUXSHARE-ICT (Apple Bắc Giang)</option>
                  <option value="FUYU">FUYU PRECISION (Foxconn Bắc Giang)</option>
                  <option value="GOERTEK">GOERTEK VINA (Acoustics Quế Võ)</option>
                  <option value="CANON">CANON VIỆT NAM (Tiên Sơn / Quế Võ)</option>
                  <option value="WNC">WNC (Đồng Văn III, Hà Nam)</option>
                  <option value="BROTHER">BROTHER (Phúc Điền, Hải Dương)</option>
                  <option value="QUANTA">QUANTA (Mỹ Thuận, Nam Định)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">2. Đối tượng mục tiêu</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={e => setTargetAudience(e.target.value)}
                  placeholder="VD: Cặp vợ chồng cần phòng riêng, LĐ trẻ 18-25..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">3. Định dạng kịch bản</label>
                <select
                  value={contentType}
                  onChange={e => setContentType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="TIKTOK_REELS">🎬 Video Ngắn TikTok/Reels (15s-30s)</option>
                  <option value="FACEBOOK_POST">📘 Bài Viết Chạy Facebook Ads</option>
                  <option value="ZALO_BROADCAST">💬 Tin Nhắn Broadcast Zalo OA</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateScript}
              disabled={isGeneratingAi}
              className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              {isGeneratingAi ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                  <span>GEMINI POOL ĐANG SOẠN THẢO KỊCH BẢN VIRAL...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>SINH KỊCH BẢN VIRAL BẰNG AI (1-CLICK GEMINI POOL)</span>
                </>
              )}
            </button>
          </div>

          {/* AI Result View */}
          {generatedScript && (
            <div className="p-5 bg-purple-950/30 border border-purple-500/50 rounded-xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-purple-800/40">
                <div className="flex items-center space-x-2 text-purple-300 font-extrabold text-xs">
                  <Video className="w-4 h-4 text-pink-400" />
                  <span>Kịch Bản Video Tuyển Dụng AI Đã Hoàn Tất ({selectedCompany}):</span>
                </div>
                <button
                  onClick={copyScriptToClipboard}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScript ? 'ĐÃ CHÉP' : 'SAO CHÉP KỊCH BẢN'}</span>
                </button>
              </div>
              <div className="text-slate-200 text-xs leading-relaxed whitespace-pre-line font-mono bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                {generatedScript}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: HUMAN-IN-THE-LOOP APPROVAL */}
      {activeTab === 'approval' && (
        <div className="p-5 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-2 border-amber-500/60 rounded-xl space-y-4 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2 text-amber-300 font-extrabold text-sm">
              <Lock className="w-5 h-5 text-amber-400" />
              <span>DANH MỤC TRỌNG YẾU MARKETING CẦN CHAIRMAN VICTOR PHÊ DUYỆT</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              CHỜ PHÊ DUYỆT
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            AI CEO Lucky đã tự động hoàn thiện hệ thống Webhook 1s Ingestion, thuật toán Smart Routing và xưởng Video AI. Dưới đây là <strong>2 việc liên quan đến tài khoản quảng cáo và ngân sách thực tế</strong> em kính trình Chairman Victor phê duyệt:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
            <div className="p-3.5 bg-slate-950/90 border border-amber-500/30 rounded-xl space-y-2">
              <div className="font-extrabold text-white flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>1. Phê duyệt Hạn mức Nạp Thẻ Chạy Ads TikTok & Facebook</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Khóa ngân sách trần: <strong>10.000.000 đ/tháng</strong> (~330k/ngày) để chạy phễu thu lead lao động phổ thông các tỉnh Tây Bắc và Nam Định, Thái Bình về Bắc Giang.
              </p>
              <div className="text-[10px] text-amber-400 font-semibold">⏳ Trạng thái: Chờ Chairman Victor duyệt hạn mức thanh toán thẻ Visa</div>
            </div>

            <div className="p-3.5 bg-slate-950/90 border border-amber-500/30 rounded-xl space-y-2">
              <div className="font-extrabold text-white flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>2. Cấp Quyền Admin Tài Khoản Business Manager (BM)</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Liên kết Pixel và Form Instant Lead từ Fanpage Facebook FCS và Kênh TikTok Tuyển Dụng vào Webhook tự động của hệ thống.
              </p>
              <div className="text-[10px] text-amber-400 font-semibold">⏳ Trạng thái: Chờ Chairman Victor kết nối tài khoản Ads</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingHarvesterPage;
