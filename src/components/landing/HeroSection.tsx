import React from 'react';
import { useAuth } from '../../auth/AuthProvider';
import {
  Sparkles,
  ArrowRight,
  LogIn,
  CheckCircle2,
  Clock,
  Zap,
  ShieldCheck,
  Users,
  ChevronRight,
  TrendingUp,
  Activity,
  FileSpreadsheet,
} from 'lucide-react';

interface HeroSectionProps {
  onNavigate: (route: string) => void;
  onScrollToGoldenFlow: () => void;
  onScrollToAudit: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onNavigate,
  onScrollToGoldenFlow,
  onScrollToAudit,
}) => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 -right-40 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* 2-Column Desktop Grid (55% Copy / 45% Visual) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Strategic Direct-Response Copy (~55% / 7 cols) */}
          <div className="lg:col-span-7 text-left space-y-6">
            {/* Eyebrow Badge - Targeted Customer Hook */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="tracking-wider uppercase font-bold text-[11px] sm:text-xs">
                Dành riêng cho Doanh nghiệp Cung ứng &amp; Cho thuê Lao động
              </span>
            </div>

            {/* Strategic Main Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-white leading-[1.15]">
              KHI QUY MÔ LAO ĐỘNG TĂNG LÊN,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400">
                SỰ KIỂM SOÁT CỦA BẠN
              </span>{' '}
              KHÔNG ĐƯỢC PHÉP BIẾN MẤT.
            </h1>

            {/* Subheading: Control, Visibility, Less Manual Work */}
            <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Dừng việc quản lý hàng trăm con người qua những nhóm Zalo trôi tin và file Excel rời rạc. Hệ thống điều hành thông minh giúp <strong className="text-white font-semibold">1 Quản lý</strong> kiểm soát trọn vẹn hành trình từ ứng tuyển đến ngày công xác minh thực tế theo chuẩn <strong className="text-emerald-400 font-semibold">Verified Working Worker (VWW)</strong>.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => onNavigate('/app')}
                  className="px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-2.5 cursor-pointer shadow-xl shadow-blue-600/30 group min-h-[48px]"
                >
                  <span>VÀO HỆ THỐNG ĐIỀU HÀNH</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onScrollToAudit}
                  className="px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-2.5 cursor-pointer shadow-xl shadow-blue-600/30 group min-h-[48px]"
                >
                  <span>NHẬN AI WORKFORCE BLUEPRINT</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              <button
                type="button"
                onClick={onScrollToGoldenFlow}
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 cursor-pointer border border-slate-800 min-h-[48px]"
              >
                <span>XEM GOLDEN FLOW</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={() => onNavigate('/register')}
                  className="sm:hidden px-4 py-3 text-blue-400 hover:text-blue-300 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-1.5"
                >
                  <span>Hoặc Dùng thử hệ thống ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Link for Desktop */}
            {!isAuthenticated && (
              <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400">
                <span>Bạn muốn thử nghiệm ngay?</span>
                <button
                  type="button"
                  onClick={() => onNavigate('/register')}
                  className="text-blue-400 hover:text-blue-300 font-bold underline underline-offset-4 cursor-pointer"
                >
                  Bắt đầu dùng thử miễn phí có sẵn dữ liệu demo →
                </button>
              </div>
            )}

            {/* Proof Metrics Strip */}
            <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-0.5">
                <div className="text-lg sm:text-xl font-black text-white">&lt; 30s</div>
                <div className="text-[11px] text-slate-400">Chuẩn hóa vào Pipeline</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-lg sm:text-xl font-black text-emerald-400">0 Trùng</div>
                <div className="text-[11px] text-slate-400">Quét CCCD chống tranh chấp</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-lg sm:text-xl font-black text-blue-400">100%</div>
                <div className="text-[11px] text-slate-400">Khớp công chuẩn VWW</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-lg sm:text-xl font-black text-amber-400">1 Quản lý</div>
                <div className="text-[11px] text-slate-400">300–500 lao động điều hành</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Product UI Mockup (~45% / 5 cols) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl p-4 sm:p-5 backdrop-blur-md space-y-4">
              {/* Mockup Header Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 pl-2">
                    fcs.breaths.live/app
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/60">
                  <Activity className="w-3 h-3 animate-pulse" />
                  <span>API 3.2.0 • LIVE</span>
                </div>
              </div>

              {/* Mockup Dashboard Cards */}
              <div className="space-y-3 text-xs">
                {/* Priority Action Card */}
                <div className="bg-slate-950 rounded-xl p-3.5 border border-blue-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center space-x-1">
                      <Zap className="w-3.5 h-3.5 text-blue-400" />
                      <span>Hôm Nay • Ngoại Lệ Cần Xử Lý</span>
                    </span>
                    <span className="text-[10px] bg-blue-900/50 text-blue-200 px-1.5 py-0.5 rounded font-mono font-bold">
                      3 CẦN CAN THIỆP
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-slate-300 py-1 border-b border-slate-900">
                      <span className="flex items-center space-x-1.5 truncate">
                        <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">Ca sáng Foxconn: 12 ứng viên cần nhắc xe đón</span>
                      </span>
                      <span className="text-[10px] text-amber-300 font-semibold shrink-0">
                        06:15
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300 py-1">
                      <span className="flex items-center space-x-1.5 truncate">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">Đối soát ca đêm Luxshare: 42/42 đã xác minh</span>
                      </span>
                      <span className="text-[10px] text-emerald-300 font-semibold shrink-0">
                        ĐÃ KHỚP VWW
                      </span>
                    </div>
                  </div>
                </div>

                {/* Worker 360 Mini Snapshot */}
                <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>Hồ Sơ Worker 360 Tập Trung</span>
                    </span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded-full font-bold">
                      ✓ CHUẨN VWW
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 pt-1">
                    <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold flex items-center justify-center shrink-0">
                      NA
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-white text-xs truncate">
                        Nguyễn Văn An • Mã: WRK-BN-089
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 truncate">
                        <span>Nhà máy Luxshare</span>
                        <span>•</span>
                        <span>Tuyến xe buýt số 3</span>
                        <span>•</span>
                        <span>Ca ngày</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Golden Flow Progress Bar */}
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-bold text-slate-300">TIẾN TRÌNH GOLDEN FLOW</span>
                    <span className="font-mono text-emerald-400">8/8 • XÁC MINH CÔNG</span>
                  </div>
                  <div className="grid grid-cols-8 gap-1 pt-1">
                    {[
                      'Đăng ký',
                      'Mã ID',
                      'P.Vấn',
                      'Đậu',
                      'Phân bổ',
                      'Đi làm',
                      'Chấm công',
                      'VWW',
                    ].map((step, idx) => (
                      <div key={step} className="flex flex-col items-center space-y-1">
                        <div
                          className={`w-full h-1.5 rounded-full ${
                            idx === 7 ? 'bg-emerald-400' : 'bg-blue-500'
                          }`}
                        />
                        <span className="text-[8px] text-slate-400 truncate max-w-full font-medium">
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Sync Badge */}
              <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center space-x-1">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Đồng bộ 2 chiều Google Sheets</span>
                </span>
                <span className="text-slate-400 font-mono text-[10px]">Zero Latency</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
