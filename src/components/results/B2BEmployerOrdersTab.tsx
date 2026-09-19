import React, { useState, useMemo } from 'react';
import {
  Building2,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Download,
  Users,
  Briefcase,
  FileText,
  DollarSign,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface B2BPartnerOrder {
  id: string;
  name: string;
  code: string;
  industry: string;
  ecosystem: 'APPLE_FOXCONN' | 'ELECTRONICS' | 'TELECOM' | 'AUTOMOTIVE' | 'MECHANICS' | 'CONSUMER';
  location: string;
  hourlyRate: number; // VND/hour
  requisitionTarget: number; // Chỉ tiêu
  startedCount: number; // Đã bắt đầu làm
  vwwCount: number; // Đã đạt VWW >= 15 công
  slaDeadline: string;
  status: 'URGENT' | 'ON_TRACK' | 'FULFILLED' | 'RECRUITING';
  notes: string;
}

// 29 Đối tác KCN chuẩn từ DM_COMPANY.csv và dữ liệu vận hành thực tế
export const B2B_29_PARTNERS: B2BPartnerOrder[] = [
  {
    id: 'B2B-001',
    name: 'LUXSHARE-ICT',
    code: 'LUXSHARE',
    industry: 'Linh kiện tai nghe AirPods & Cáp sạc Apple',
    ecosystem: 'APPLE_FOXCONN',
    location: 'KCN Quang Châu & Vân Trung, Bắc Giang',
    hourlyRate: 45000,
    requisitionTarget: 150,
    startedCount: 118,
    vwwCount: 56,
    slaDeadline: '30/09/2026',
    status: 'URGENT',
    notes: 'Đơn hàng cao điểm mùa sản xuất Apple. Hỗ trợ KTX miễn phí.',
  },
  {
    id: 'B2B-002',
    name: 'FUYU PRECISION (FOXCONN)',
    code: 'FUYU',
    industry: 'Gia công linh kiện bo mạch điện thoại',
    ecosystem: 'APPLE_FOXCONN',
    location: 'KCN Đình Trám, Bắc Giang',
    hourlyRate: 44000,
    requisitionTarget: 120,
    startedCount: 96,
    vwwCount: 48,
    slaDeadline: '25/09/2026',
    status: 'URGENT',
    notes: 'Phụ cấp chuyên cần 500k/tháng, cơm ca 3 bữa.',
  },
  {
    id: 'B2B-003',
    name: 'GOERTEK VINA',
    code: 'GOERTEK',
    industry: 'Acoustics, Mic & Loa thông minh',
    ecosystem: 'APPLE_FOXCONN',
    location: 'KCN Quế Võ, Bắc Ninh',
    hourlyRate: 46000,
    requisitionTarget: 100,
    startedCount: 82,
    vwwCount: 40,
    slaDeadline: '28/09/2026',
    status: 'ON_TRACK',
    notes: 'Ưu tiên lao động nữ 18-35 tuổi, phòng sạch điều hòa.',
  },
  {
    id: 'B2B-004',
    name: 'CANON VIỆT NAM',
    code: 'CANON',
    industry: 'Thiết bị quang học & Máy in ảnh',
    ecosystem: 'ELECTRONICS',
    location: 'KCN Tiên Sơn & Quế Võ, Bắc Ninh',
    hourlyRate: 43000,
    requisitionTarget: 80,
    startedCount: 68,
    vwwCount: 35,
    slaDeadline: '05/10/2026',
    status: 'ON_TRACK',
    notes: 'Môi trường làm việc chuẩn Nhật Bản, thưởng thâm niên.',
  },
  {
    id: 'B2B-005',
    name: 'WNC (WISTRON NEWEB)',
    code: 'WNC',
    industry: 'Thiết bị mạng & Viễn thông không dây',
    ecosystem: 'TELECOM',
    location: 'KCN Đồng Văn III, Hà Nam',
    hourlyRate: 45000,
    requisitionTarget: 90,
    startedCount: 74,
    vwwCount: 38,
    slaDeadline: '28/09/2026',
    status: 'URGENT',
    notes: 'Hỗ trợ xe đưa đón từ Nam Định, Ninh Bình, Phủ Lý.',
  },
  {
    id: 'B2B-006',
    name: 'WISTRON INFOPCOMM',
    code: 'WISTRON',
    industry: 'Sản xuất bo mạch máy tính & Laptop',
    ecosystem: 'ELECTRONICS',
    location: 'KCN Đồng Văn III, Hà Nam',
    hourlyRate: 44500,
    requisitionTarget: 70,
    startedCount: 56,
    vwwCount: 28,
    slaDeadline: '02/10/2026',
    status: 'ON_TRACK',
    notes: 'Tuyển cả nam và nữ, tăng ca đều 2-3h/ngày.',
  },
  {
    id: 'B2B-007',
    name: 'BROTHER MACHINERY',
    code: 'BROTHER',
    industry: 'Máy may công nghiệp & Thiết bị in ấn',
    ecosystem: 'ELECTRONICS',
    location: 'KCN Phúc Điền, Hải Dương',
    hourlyRate: 42000,
    requisitionTarget: 60,
    startedCount: 50,
    vwwCount: 26,
    slaDeadline: '10/10/2026',
    status: 'ON_TRACK',
    notes: 'Công việc ngồi điều hòa 100%, lương trả đúng ngày 10.',
  },
  {
    id: 'B2B-008',
    name: 'QUANTA COMPUTER',
    code: 'QUANTA',
    industry: 'Lắp ráp máy tính xách tay cao cấp',
    ecosystem: 'ELECTRONICS',
    location: 'KCN Mỹ Thuận, Nam Định',
    hourlyRate: 45000,
    requisitionTarget: 80,
    startedCount: 58,
    vwwCount: 27,
    slaDeadline: '30/09/2026',
    status: 'URGENT',
    notes: 'Dự án mới bàn giao giai đoạn 1, nhu cầu mở rộng 500 quân.',
  },
  {
    id: 'B2B-009',
    name: 'HANKOOK TIRE',
    code: 'HANKOOK',
    industry: 'Sản xuất linh kiện lốp ô tô xuất khẩu',
    ecosystem: 'AUTOMOTIVE',
    location: 'KCN Đại An, Hải Dương',
    hourlyRate: 46000,
    requisitionTarget: 50,
    startedCount: 38,
    vwwCount: 19,
    slaDeadline: '15/10/2026',
    status: 'RECRUITING',
    notes: 'Ưu tiên lao động nam có sức khỏe, phụ cấp độc hại.',
  },
  {
    id: 'B2B-010',
    name: 'GEMTEK TECHNOLOGY',
    code: 'GEMTEK',
    industry: 'Thiết bị thu phát sóng 5G & Router',
    ecosystem: 'TELECOM',
    location: 'KCN Quang Châu, Bắc Giang',
    hourlyRate: 43500,
    requisitionTarget: 40,
    startedCount: 32,
    vwwCount: 16,
    slaDeadline: '05/10/2026',
    status: 'ON_TRACK',
    notes: 'Kiểm hàng bằng kính hiển vi, cần mắt tốt không cận nặng.',
  },
  {
    id: 'B2B-011',
    name: 'QISDA VIỆT NAM',
    code: 'QISDA',
    industry: 'Màn hình LCD & Thiết bị y tế',
    ecosystem: 'ELECTRONICS',
    location: 'KCN Đồng Văn IV, Hà Nam',
    hourlyRate: 44000,
    requisitionTarget: 50,
    startedCount: 36,
    vwwCount: 17,
    slaDeadline: '12/10/2026',
    status: 'ON_TRACK',
    notes: 'Môi trường sạch sẽ, không bụi bẩn, có phòng nghỉ giữa ca.',
  },
  {
    id: 'B2B-012',
    name: 'RISUNTEK ACOUSTICS',
    code: 'RISUNTEK',
    industry: 'Tai nghe Bluetooth & Dây cáp âm thanh',
    ecosystem: 'ELECTRONICS',
    location: 'KCN Đình Trám, Bắc Giang',
    hourlyRate: 42500,
    requisitionTarget: 45,
    startedCount: 34,
    vwwCount: 15,
    slaDeadline: '15/10/2026',
    status: 'RECRUITING',
    notes: 'Phù hợp cả lao động chưa có kinh nghiệm, đào tạo 2 ngày.',
  },
  {
    id: 'B2B-013',
    name: 'TOPSUN ENERGY',
    code: 'TOPSUN',
    industry: 'Tấm pin năng lượng mặt trời',
    ecosystem: 'ELECTRONICS',
    location: 'KCN Song Khê - Nội Hoàng, Bắc Giang',
    hourlyRate: 47000,
    requisitionTarget: 30,
    startedCount: 24,
    vwwCount: 12,
    slaDeadline: '20/10/2026',
    status: 'ON_TRACK',
    notes: 'Ca làm 12h (tính tăng ca cao), thu nhập 11-13 triệu/tháng.',
  },
  {
    id: 'B2B-014',
    name: 'DARFON ELECTRONICS',
    code: 'DARFON',
    industry: 'Bàn phím cơ & Bộ nguồn máy tính',
    ecosystem: 'ELECTRONICS',
    location: 'KCN Vân Trung, Bắc Giang',
    hourlyRate: 43000,
    requisitionTarget: 35,
    startedCount: 26,
    vwwCount: 13,
    slaDeadline: '18/10/2026',
    status: 'ON_TRACK',
    notes: 'Thao tác dán phím và đóng hộp tự động, việc nhẹ.',
  },
  {
    id: 'B2B-015',
    name: 'MYS GROUP',
    code: 'MYS',
    industry: 'Bao bì carton công nghiệp & Hộp phụ kiện',
    ecosystem: 'MECHANICS',
    location: 'KCN Quế Võ II, Bắc Ninh',
    hourlyRate: 41000,
    requisitionTarget: 25,
    startedCount: 20,
    vwwCount: 10,
    slaDeadline: '25/10/2026',
    status: 'RECRUITING',
    notes: 'Lương ổn định, không yêu cầu bằng cấp, nhận việc ngay.',
  },
  {
    id: 'B2B-016',
    name: 'GT INDUSTRIAL',
    code: 'GT',
    industry: 'Gia công cơ khí chính xác khuôn mẫu',
    ecosystem: 'MECHANICS',
    location: 'KCN Yên Phong, Bắc Ninh',
    hourlyRate: 48000,
    requisitionTarget: 30,
    startedCount: 22,
    vwwCount: 11,
    slaDeadline: '10/10/2026',
    status: 'ON_TRACK',
    notes: 'Ưu tiên có tay nghề đứng máy tiện CNC cơ bản.',
  },
  {
    id: 'B2B-017',
    name: 'ANAM ELECTRONICS',
    code: 'ANAM',
    industry: 'Amply & Thiết bị xử lý âm thanh hi-fi',
    ecosystem: 'ELECTRONICS',
    location: 'KCN Đồng Văn II, Hà Nam',
    hourlyRate: 43000,
    requisitionTarget: 35,
    startedCount: 25,
    vwwCount: 12,
    slaDeadline: '20/10/2026',
    status: 'RECRUITING',
    notes: 'Doanh nghiệp Hàn Quốc, chế độ ăn ca rất tốt.',
  },
  {
    id: 'B2B-018',
    name: 'NEWWING INTERCONNECT',
    code: 'NEWWING',
    industry: 'Đầu nối & Cáp sạc cao tần Foxconn',
    ecosystem: 'APPLE_FOXCONN',
    location: 'KCN Đình Trám, Bắc Giang',
    hourlyRate: 44000,
    requisitionTarget: 60,
    startedCount: 45,
    vwwCount: 22,
    slaDeadline: '30/09/2026',
    status: 'URGENT',
    notes: 'Đơn tuyển gấp bù quân dây chuyền số 4.',
  },
  {
    id: 'B2B-019',
    name: 'FUKANG TECHNOLOGY',
    code: 'FUKANG',
    industry: 'Lắp ráp máy tính bảng & Thiết bị thông minh',
    ecosystem: 'APPLE_FOXCONN',
    location: 'KCN Quang Châu, Bắc Giang',
    hourlyRate: 45000,
    requisitionTarget: 70,
    startedCount: 52,
    vwwCount: 25,
    slaDeadline: '02/10/2026',
    status: 'URGENT',
    notes: 'Xưởng sạch chuẩn quốc tế, trang bị đồng phục chống tĩnh điện.',
  },
  {
    id: 'B2B-020',
    name: 'FULIAN PRECISION',
    code: 'FULIAN',
    industry: 'Bo mạch chủ máy chủ Server & AI Hub',
    ecosystem: 'APPLE_FOXCONN',
    location: 'KCN Vân Trung, Bắc Giang',
    hourlyRate: 44500,
    requisitionTarget: 50,
    startedCount: 38,
    vwwCount: 18,
    slaDeadline: '08/10/2026',
    status: 'ON_TRACK',
    notes: 'Chế độ thưởng chuyên cần và thưởng năng suất dây chuyền.',
  },
  {
    id: 'B2B-021',
    name: 'AVC VIỆT NAM',
    code: 'AVC',
    industry: 'Quạt tản nhiệt & Tấm giải nhiệt nhôm',
    ecosystem: 'ELECTRONICS',
    location: 'KCN Quang Châu, Bắc Giang',
    hourlyRate: 42000,
    requisitionTarget: 30,
    startedCount: 22,
    vwwCount: 10,
    slaDeadline: '15/10/2026',
    status: 'RECRUITING',
    notes: 'Công việc dán keo tản nhiệt và bắt vít tự động.',
  },
  {
    id: 'B2B-022',
    name: 'LCFC VIỆT NAM (XƯỞNG 2)',
    code: 'LCFC2',
    industry: 'Bo mạch máy tính xách tay Lenovo',
    ecosystem: 'ELECTRONICS',
    location: 'KCN Quang Châu, Bắc Giang',
    hourlyRate: 43000,
    requisitionTarget: 40,
    startedCount: 30,
    vwwCount: 14,
    slaDeadline: '12/10/2026',
    status: 'ON_TRACK',
    notes: 'Lịch phỏng vấn thứ 3 và thứ 6 hàng tuần.',
  },
  {
    id: 'B2B-023',
    name: 'LCFC VIỆT NAM (XƯỞNG 3)',
    code: 'LCFC3',
    industry: 'Lắp ráp vỏ máy và màn hình Lenovo',
    ecosystem: 'ELECTRONICS',
    location: 'KCN Quang Châu, Bắc Giang',
    hourlyRate: 43000,
    requisitionTarget: 35,
    startedCount: 25,
    vwwCount: 11,
    slaDeadline: '18/10/2026',
    status: 'RECRUITING',
    notes: 'Nhận cả ứng viên có xăm kín tay, duyệt hồ sơ nhanh.',
  },
  {
    id: 'B2B-024',
    name: 'FOSITEK VIỆT NAM',
    code: 'FOSITEK',
    industry: 'Bản lề kim loại laptop siêu bền',
    ecosystem: 'MECHANICS',
    location: 'KCN Quang Châu, Bắc Giang',
    hourlyRate: 42500,
    requisitionTarget: 25,
    startedCount: 19,
    vwwCount: 9,
    slaDeadline: '22/10/2026',
    status: 'RECRUITING',
    notes: 'Kiểm tra độ gập bản lề máy, việc nhẹ ngồi ghế tựa.',
  },
  {
    id: 'B2B-025',
    name: 'SYSTEK ELECTRONICS',
    code: 'SYSTEK',
    industry: 'Bản mạch in linh kiện dán SMT',
    ecosystem: 'ELECTRONICS',
    location: 'KCN Đình Trám, Bắc Giang',
    hourlyRate: 43000,
    requisitionTarget: 20,
    startedCount: 15,
    vwwCount: 7,
    slaDeadline: '25/10/2026',
    status: 'RECRUITING',
    notes: 'Được đào tạo vận hành máy dán chip SMT hiện đại.',
  },
  {
    id: 'B2B-026',
    name: 'HAMADEN VIỆT NAM',
    code: 'HAMADEN',
    industry: 'Linh kiện gạt mưa & Cảm biến ô tô Denso',
    ecosystem: 'AUTOMOTIVE',
    location: 'KCN Thăng Long II, Hưng Yên',
    hourlyRate: 47000,
    requisitionTarget: 30,
    startedCount: 21,
    vwwCount: 10,
    slaDeadline: '10/10/2026',
    status: 'ON_TRACK',
    notes: 'Doanh nghiệp Nhật Bản, môi trường an toàn lao động 5S.',
  },
  {
    id: 'B2B-027',
    name: 'UNIBEN VIỆT NAM',
    code: 'UNIBEN',
    industry: 'Mì 3 Miền & Nước tương / Thực phẩm',
    ecosystem: 'CONSUMER',
    location: 'KCN Phố Nối A, Hưng Yên',
    hourlyRate: 40000,
    requisitionTarget: 40,
    startedCount: 32,
    vwwCount: 16,
    slaDeadline: '15/10/2026',
    status: 'ON_TRACK',
    notes: 'Đóng gói thùng carton, làm việc 3 ca luân phiên.',
  },
  {
    id: 'B2B-028',
    name: 'KINH ĐÔ MONDELEZ',
    code: 'KINH_DO',
    industry: 'Bánh mì, Bánh quy Oreo & Kẹo',
    ecosystem: 'CONSUMER',
    location: 'KCN Như Quỳnh, Hưng Yên',
    hourlyRate: 40500,
    requisitionTarget: 35,
    startedCount: 28,
    vwwCount: 13,
    slaDeadline: '20/10/2026',
    status: 'RECRUITING',
    notes: 'Phục vụ mùa cao điểm bánh kẹo cuối năm, việc đều.',
  },
  {
    id: 'B2B-029',
    name: 'FCS STRATEGIC PARTNERS',
    code: 'PARTNER',
    industry: 'Hệ thống đối tác thầu phụ & Dịch vụ logistics',
    ecosystem: 'MECHANICS',
    location: 'Bắc Ninh - Bắc Giang - Hà Nam',
    hourlyRate: 42000,
    requisitionTarget: 30,
    startedCount: 22,
    vwwCount: 9,
    slaDeadline: '30/10/2026',
    status: 'RECRUITING',
    notes: 'Cung cấp nhân lực thời vụ ngắn hạn 1-3 tháng linh hoạt.',
  },
];

export const B2BEmployerOrdersTab: React.FC = () => {
  const { showNotification, navigateTo } = useApp();
  const [search, setSearch] = useState('');
  const [selectedEco, setSelectedEco] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Filtered partners
  const filtered = useMemo(() => {
    return B2B_29_PARTNERS.filter(p => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase()) ||
        p.industry.toLowerCase().includes(search.toLowerCase());

      const matchEco = selectedEco === 'ALL' || p.ecosystem === selectedEco;
      const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;

      return matchSearch && matchEco && matchStatus;
    });
  }, [search, selectedEco, statusFilter]);

  // Aggregate stats
  const totalTarget = useMemo(() => B2B_29_PARTNERS.reduce((s, p) => s + p.requisitionTarget, 0), []);
  const totalStarted = useMemo(() => B2B_29_PARTNERS.reduce((s, p) => s + p.startedCount, 0), []);
  const totalVww = useMemo(() => B2B_29_PARTNERS.reduce((s, p) => s + p.vwwCount, 0), []);
  const overallFillRate = Math.round((totalStarted / totalTarget) * 100);

  const handleExportCsv = () => {
    const header = 'STT,Mã,Tên Nhà Máy Đối Tác,Hệ Sinh Thái,Địa Điểm KCN,Đơn Giá (đ/h),Chỉ Tiêu (Người),Đã Nhận Việc,Đạt VWW,Tỷ Lệ Bù Quân (%),Hạn SLA,Trạng Thái';
    const rows = filtered.map((p, idx) =>
      `"${idx + 1}","${p.code}","${p.name}","${p.industry}","${p.location}",${p.hourlyRate},${p.requisitionTarget},${p.startedCount},${p.vwwCount},${Math.round((p.startedCount / p.requisitionTarget) * 100)}%,"${p.slaDeadline}","${p.status}"`
    );
    const csvContent = '\uFEFF' + [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FCS_B2B_29_Factories_Requisitions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Đã xuất báo cáo 29 nhà máy KCN thành công (CSV)', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top 4 B2B Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-gradient-to-br from-blue-900/40 via-slate-900 to-slate-950 border border-blue-500/40 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-blue-300">
            <span>29 NHÀ MÁY ĐỐI TÁC</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2">
            29 <span className="text-xs font-semibold text-slate-400">Doanh nghiệp</span>
          </div>
          <p className="text-[11px] text-blue-200 mt-1">Hợp đồng nguyên tắc cung ứng ký kết</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-amber-900/40 via-slate-900 to-slate-950 border border-amber-500/40 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-amber-300">
            <span>TỔNG CHỈ TIÊU BÙ QUÂN</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-2">
            {totalTarget.toLocaleString('vi-VN')} <span className="text-xs font-semibold text-slate-400">chỉ tiêu</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1">SLA Headcount tháng này của 29 xưởng</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-900/40 via-slate-900 to-slate-950 border border-purple-500/40 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-purple-300">
            <span>ĐÃ BÙ QUÂN THỰC TẾ</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-300 mt-2">
            {totalStarted.toLocaleString('vi-VN')} <span className="text-xs font-semibold text-slate-400">lao động</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${overallFillRate}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">Tỷ lệ bù quân: <strong>{overallFillRate}%</strong> chỉ tiêu</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-emerald-900/40 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-emerald-300">
            <span>VWW ĐÃ XÁC MINH</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2">
            {totalVww.toLocaleString('vi-VN')} <span className="text-xs font-semibold text-slate-400">VWW</span>
          </div>
          <p className="text-[11px] text-emerald-200 mt-1">Lao động đã làm $\ge 15$ công có đối soát</p>
        </div>
      </div>

      {/* Filter and Search Ribbon */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên xưởng, KCN, ngành nghề..."
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Ecosystem Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px] font-bold mr-1 hidden sm:inline">Hệ sinh thái:</span>
            {[
              { id: 'ALL', label: 'Tất cả (29)' },
              { id: 'APPLE_FOXCONN', label: 'Apple/Foxconn (7)' },
              { id: 'ELECTRONICS', label: 'Điện tử (12)' },
              { id: 'TELECOM', label: 'Viễn thông (2)' },
              { id: 'AUTOMOTIVE', label: 'Ô tô (2)' },
              { id: 'CONSUMER', label: 'Tiêu dùng (2)' },
            ].map(eco => (
              <button
                key={eco.id}
                onClick={() => setSelectedEco(eco.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedEco === eco.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {eco.label}
              </button>
            ))}
          </div>

          {/* Export button */}
          <button
            onClick={handleExportCsv}
            className="w-full md:w-auto px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-xs shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>XUẤT BÁO CÁO 29 XƯỞNG (CSV)</span>
          </button>
        </div>
      </div>

      {/* 29 Factory Requisitions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>Danh Sách 29 Nhà Máy & Tiến Độ Bù Quân Thực Tế ({filtered.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Dữ liệu đối soát đơn hàng tuyển dụng theo hợp đồng nguyên tắc đã ký với các Ban Quản lý KCN
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            SLA REAL-TIME
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3.5">Mã & Nhà Máy Đối Tác</th>
                <th className="py-3 px-3">KCN & Địa Điểm</th>
                <th className="py-3 px-3 text-right">Đơn Giá HĐ</th>
                <th className="py-3 px-3 text-center">Chỉ Tiêu</th>
                <th className="py-3 px-3 text-center">Đã Bù Quân</th>
                <th className="py-3 px-3 text-center">Đạt VWW</th>
                <th className="py-3 px-3">Tiến Độ SLA</th>
                <th className="py-3 px-3 text-center">Hạn Chót</th>
                <th className="py-3 px-3 text-center">Trạng Thái</th>
                <th className="py-3 px-3 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
              {filtered.map(p => {
                const fillPercent = Math.min(100, Math.round((p.startedCount / p.requisitionTarget) * 100));
                const vwwPercent = Math.min(100, Math.round((p.vwwCount / p.startedCount) * 100));

                return (
                  <tr key={p.id} className="hover:bg-slate-800/60 transition-colors">
                    <td className="py-3 px-3.5">
                      <div className="font-extrabold text-white text-xs flex items-center space-x-1.5">
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {p.code}
                        </span>
                        <span>{p.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{p.industry}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-slate-200 text-xs font-semibold">{p.location}</div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-amber-300">
                      {p.hourlyRate.toLocaleString('vi-VN')} đ/h
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-white">
                      {p.requisitionTarget}
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-purple-300">
                      {p.startedCount}
                    </td>

                    <td className="py-3 px-3 text-center font-black text-emerald-400">
                      {p.vwwCount}
                    </td>

                    <td className="py-3 px-3 w-40">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="text-slate-300">{fillPercent}%</span>
                          <span className="text-slate-400">VWW: {vwwPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              fillPercent >= 80
                                ? 'bg-emerald-500'
                                : fillPercent >= 50
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${fillPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-300">
                      {p.slaDeadline}
                    </td>

                    <td className="py-3 px-3 text-center">
                      {p.status === 'URGENT' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          BÙ QUÂN GẤP
                        </span>
                      ) : p.status === 'ON_TRACK' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          ĐẠT CHỈ TIÊU
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          ĐANG TUYỂN
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => {
                          navigateTo(`/app/pipeline?company=${encodeURIComponent(p.code)}`);
                        }}
                        className="p-1.5 bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 rounded-lg transition-colors cursor-pointer"
                        title="Xem Deal ứng viên nộp xưởng này"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default B2BEmployerOrdersTab;
