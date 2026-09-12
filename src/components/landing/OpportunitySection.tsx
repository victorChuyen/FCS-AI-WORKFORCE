import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Database,
  Layers,
  Search,
  AlertTriangle,
  BellRing,
  UserCheck,
} from 'lucide-react';

export const OpportunitySection: React.FC = () => {
  const pipelineFlow = [
    {
      step: '1',
      title: 'Thu thập',
      sub: 'Collect',
      icon: Database,
      desc: 'Tự động gom hồ sơ từ Zalo, Web, CTV vào 1 nơi duy nhất.',
    },
    {
      step: '2',
      title: 'Sắp xếp',
      sub: 'Organize',
      icon: Layers,
      desc: 'Cấp Worker ID, phân loại nguồn tuyển và chuẩn hóa CCCD.',
    },
    {
      step: '3',
      title: 'Theo dõi',
      sub: 'Follow',
      icon: Search,
      desc: 'Theo sát từng chặng: phỏng vấn, đậu, lên xe, đến nhà máy.',
    },
    {
      step: '4',
      title: 'Phát hiện',
      sub: 'Detect',
      icon: AlertTriangle,
      desc: 'AI liên tục quét các điểm lệch: đậu chưa đi làm, thiếu chấm công.',
    },
    {
      step: '5',
      title: 'Cảnh báo',
      sub: 'Alert',
      icon: BellRing,
      desc: 'Đẩy ngay các ca bất thường vào hàng đợi hành động ưu tiên.',
    },
    {
      step: '6',
      title: 'Người duyệt',
      sub: 'Decision',
      icon: UserCheck,
      desc: 'Quản lý chỉ cần 1 cú click để ra quyết định và xử lý ngoại lệ.',
      highlight: true,
    },
  ];

  const comparisons = [
    {
      criteria: 'Cách tìm kiếm dữ liệu',
      legacy: 'Quản lý phải mở từng file Excel, lướt tìm từng đoạn chat Zalo để biết ai đang ở đâu.',
      fcs: 'Hệ thống tự động gom toàn bộ. Quản lý chỉ nhìn vào màn hình hành động cần giải quyết hôm nay.',
    },
    {
      criteria: 'Kiểm soát trùng lặp ứng viên',
      legacy: 'Dò số CCCD bằng mắt, thường xuyên tranh chấp hoa hồng giữa các cộng tác viên.',
      fcs: 'Thuật toán đối soát CCCD thời gian thực, khóa nguồn tuyển minh bạch và tức thì.',
    },
    {
      criteria: 'Xử lý bùng việc ngày đầu',
      legacy: 'Chỉ biết công nhân không đến khi quản đốc nhà máy gọi điện phàn nàn thiếu người.',
      fcs: 'AI tự động nhắc lịch xe đón, phát hiện trước các ca có nguy cơ vắng để kịp bổ sung.',
    },
    {
      criteria: 'Đối soát chấm công & thanh toán',
      legacy: 'Chờ bảng công giấy cuối tháng, đối chiếu hàng tuần liền mới tính xong lương và phí.',
      fcs: 'Khớp công hàng ngày theo chuẩn Verified Working Worker (VWW), sẵn sàng quyết toán ngay.',
    },
  ];

  return (
    <section id="opportunity-section" className="py-16 sm:py-24">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Section Heading with Core Philosophy */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MÔ HÌNH VẬN HÀNH NGOẠI LỆ</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            “Hệ thống theo dõi tất cả.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">
              AI phát hiện bất thường.
            </span>{' '}
            Con người xử lý ngoại lệ.”
          </h2>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Thay vì bắt quản lý phải đi tìm kiếm thông tin trong biển dữ liệu hỗn loạn, FCS AI Workforce OS tự động sàng lọc và chỉ đưa lên những gì cần sự can thiệp của con người.
          </p>
        </div>

        {/* 6-Step Operational Chain (Collect → Organize → Follow → Detect → Alert → Human Decision) */}
        <div className="mt-12 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Chuỗi vận hành tự động khép kín (6 chặng)
            </div>
            <div className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/60">
              Zero Manual Search
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mt-6">
            {pipelineFlow.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className={`rounded-2xl p-4 border flex flex-col justify-between space-y-3 transition-all ${
                    item.highlight
                      ? 'bg-blue-600/20 border-blue-500/60 text-white shadow-lg ring-1 ring-blue-500/40'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      0{item.step}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        item.highlight
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-900 text-blue-400'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-white">{item.title}</h3>
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      {item.sub}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side-by-Side Reality Comparison Table */}
        <div className="mt-12 bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-12 bg-slate-950 border-b border-slate-800 p-4 sm:p-5 text-xs font-bold uppercase tracking-wider">
            <div className="md:col-span-4 text-slate-400">Khía cạnh vận hành</div>
            <div className="md:col-span-4 text-rose-400 hidden md:flex items-center space-x-1.5">
              <XCircle className="w-4 h-4" />
              <span>Cách làm cũ (File Excel & Zalo rời rạc)</span>
            </div>
            <div className="md:col-span-4 text-emerald-400 hidden md:flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>FCS AI Workforce OS</span>
            </div>
          </div>

          <div className="divide-y divide-slate-800/70">
            {comparisons.map((row, idx) => (
              <div
                key={row.criteria}
                className="grid grid-cols-1 md:grid-cols-12 p-4 sm:p-5 gap-3 md:gap-4 hover:bg-slate-800/20 transition-colors"
              >
                <div className="md:col-span-4 flex items-center">
                  <span className="font-bold text-white text-xs sm:text-sm">
                    {idx + 1}. {row.criteria}
                  </span>
                </div>

                <div className="md:col-span-4 bg-rose-950/20 md:bg-transparent p-3 md:p-0 rounded-xl md:rounded-none border border-rose-900/30 md:border-none">
                  <div className="md:hidden text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cách làm cũ:</span>
                  </div>
                  <p className="text-xs text-rose-200/80 leading-relaxed">{row.legacy}</p>
                </div>

                <div className="md:col-span-4 bg-emerald-950/20 md:bg-transparent p-3 md:p-0 rounded-xl md:rounded-none border border-emerald-900/30 md:border-none">
                  <div className="md:hidden text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>FCS AI Workforce OS:</span>
                  </div>
                  <p className="text-xs text-emerald-200/90 font-medium leading-relaxed">
                    {row.fcs}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
