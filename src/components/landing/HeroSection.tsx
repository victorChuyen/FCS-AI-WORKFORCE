import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import {
  Calendar,
  Play,
  Layers,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Users,
  CheckCircle2,
  Zap,
} from 'lucide-react';

interface HeroSectionProps {
  onNavigate: (route: string) => void;
  onScrollToGoldenFlow: () => void;
  onScrollToAudit: () => void;
  onOpenConsultModal: () => void;
  youtubeId?: string;
}

const ROTATING_HIGHLIGHTS = [
  {
    tag: '🎯 ĐIỀU HÀNH TINH GỌN',
    text: '1 Quản trị viên kiểm soát trọn vẹn 300 – 500 lao động thời vụ',
    neonColor: 'text-amber-300',
    borderColor: 'border-amber-500/40 bg-amber-500/10',
  },
  {
    tag: '⚡ TỐC ĐỘ VƯỢT TRỘI',
    text: 'Quét tự động CCCD & SĐT < 30s triệt tiêu 100% trùng lặp giữa các nhóm',
    neonColor: 'text-cyan-300',
    borderColor: 'border-cyan-500/40 bg-cyan-500/10',
  },
  {
    tag: '🛡️ CHỐNG THẤT THOÁT',
    text: 'Khớp lệnh chấm công tự động theo chuẩn Verified Working Worker (VWW)',
    neonColor: 'text-emerald-300',
    borderColor: 'border-emerald-500/40 bg-emerald-500/10',
  },
  {
    tag: '📊 REAL-TIME SYNC',
    text: 'Đồng bộ 2 chiều thời gian thực với Google Sheets — Zero Data Lock-in',
    neonColor: 'text-purple-300',
    borderColor: 'border-purple-500/40 bg-purple-500/10',
  },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onNavigate,
  onScrollToGoldenFlow,
  onScrollToAudit,
  onOpenConsultModal,
  youtubeId = 'HHGQN9Zqaxo', // Mặc định video giới thiệu demo (dễ dàng thay đổi)
}) => {
  const { isAuthenticated } = useAuth();
  const [activeHighlightIndex, setActiveHighlightIndex] = useState(0);

  // Hiệu ứng xoay vòng chữ chạy Neon tự động mỗi 2.8 giây
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHighlightIndex((prev) => (prev + 1) % ROTATING_HIGHLIGHTS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const currentHighlight = ROTATING_HIGHLIGHTS[activeHighlightIndex];

  return (
    <section className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 overflow-hidden">
      {/* Blur background blobs (Tương tự chuẩn Luxury Meta Ads) */}
      <div 
        className="absolute -top-20 left-4 w-[600px] h-[600px] rounded-full pointer-events-none -z-10"
        style={{
          background: 'rgba(249, 115, 22, 0.08)',
          filter: 'blur(140px)',
        }}
      />
      <div 
        className="absolute top-1/4 right-0 w-[550px] h-[550px] rounded-full pointer-events-none -z-10"
        style={{
          background: 'rgba(59, 130, 246, 0.09)',
          filter: 'blur(130px)',
        }}
      />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 relative z-10">
        
        {/* KHỐI TIÊU ĐỀ ĐỈNH CAO TRUNG TÂM (CHUẨN LUXURY GO.BREATHS.LIVE & ADS.BREATHS.LIVE) */}
        <div className="text-center max-w-6xl mx-auto mb-8 sm:mb-12 space-y-3.5 sm:space-y-4 animate-fade-in px-2">
          
          {/* Luxury Badge phát sáng mạ vàng */}
          <div className="inline-flex items-center justify-center">
            <div className="luxury-badge">
              <span>💎</span>
              <span>HỆ ĐIỀU HÀNH THÔNG MINH CHO CUNG ỨNG &amp; CHO THUÊ LAO ĐỘNG</span>
            </div>
          </div>

          {/* Eyebrow Luxury */}
          <div>
            <span className="eyebrow-luxury tracking-widest text-[11px] sm:text-xs text-slate-400 font-bold uppercase">
              CHUYỂN ĐỔI SỐ DOANH NGHIỆP LAO ĐỘNG KCN 4.0
            </span>
          </div>

          {/* Headline Chuẩn Ngữ Nghĩa — ĐÚNG 2 HÀNG DUY NHẤT THEO LỆNH CHAIRMAN */}
          <h1 className="text-[20px] sm:text-[28px] md:text-[34px] lg:text-[38px] xl:text-[42px] font-black tracking-tight leading-[1.22] sm:leading-[1.2]">
            <span className="neon-hero block sm:whitespace-nowrap font-black">
              TỰ ĐỘNG HÓA CUNG ỨNG LAO ĐỘNG VỚI AI AGENTIC
            </span>
            <span className="neon-hero-orange block sm:whitespace-nowrap mt-2 sm:mt-2.5 font-black">
              CHẤM DỨT HỖN LOẠN EXCEL &amp; ZALO!
            </span>
          </h1>

          {/* Mô tả giải quyết trúng nỗi đau */}
          <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto pt-1 font-normal">
            Dừng việc quản lý hàng trăm con người qua những nhóm Zalo trôi tin và file Excel rời rạc. Hệ thống giúp <strong className="text-white font-bold">1 Quản trị viên</strong> kiểm soát trọn vẹn hành trình từ ứng tuyển đến ngày công xác minh thực tế theo chuẩn <strong className="text-emerald-400 font-bold">Verified Working Worker (VWW)</strong>.
          </p>

          {/* Hiệu ứng Chữ Chạy Neon Xoay Vòng Chuyên Nghiệp (Interactive Rotating Neon Box) */}
          <div className="pt-1 flex justify-center">
            <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl inline-flex items-center space-x-3 max-w-2xl text-left transition-all duration-500">
              <div className="shrink-0 flex items-center">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider border shadow-sm transition-all duration-300 ${currentHighlight.borderColor} ${currentHighlight.neonColor}`}>
                  {currentHighlight.tag}
                </span>
              </div>
              <div className="overflow-hidden">
                <p className="text-xs sm:text-sm font-semibold text-slate-200 truncate transition-all duration-500">
                  {currentHighlight.text}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* LƯỚI 2 PHÂN KHU CHIẾN LƯỢC: CỘT TRÁI (HÀNH ĐỘNG + STATS) & CỘT PHẢI (VIDEO PLAYER) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* CỘT TRÁI (7 cols): NỘI DUNG TƯƠNG TÁC & 4 THẺ THỐNG KÊ KÍNH MỜ */}
          <div className="lg:col-span-7 space-y-6 text-left animate-fade-in">
            
            {/* Tiêu đề phân khu */}
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>CÔNG CỤ ĐIỀU HÀNH THỜI GIAN THỰC</span>
            </div>

            {/* 4 Nút Tương Tác 2x2 Grid Phong Cách Meta Ads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
              {/* Nút 1: Dùng thử */}
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => onNavigate('/app')}
                  className="glow-border-hover inline-flex items-center justify-center space-x-2.5 px-5 py-3.5 rounded-xl font-bold text-sm text-orange-400 bg-orange-500/10 border border-orange-500/70 shadow-lg shadow-orange-500/15 cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-sm shadow-emerald-400" />
                  <span>VÀO HỆ THỐNG ĐIỀU HÀNH</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate('/register')}
                  className="glow-border-hover inline-flex items-center justify-center space-x-2.5 px-5 py-3.5 rounded-xl font-bold text-sm text-orange-400 bg-orange-500/10 border border-orange-500/70 shadow-lg shadow-orange-500/15 cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-sm shadow-emerald-400" />
                  <span>DÙNG THỬ HỆ THỐNG</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {/* Nút 2: Đăng ký tư vấn / Nhận Blueprint */}
              <button
                type="button"
                onClick={onOpenConsultModal}
                className="glow-border-hover inline-flex items-center justify-center space-x-2.5 px-5 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border border-blue-400/40 shadow-lg shadow-blue-600/25 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-blue-200" />
                <span>ĐĂNG KÝ TƯ VẤN 1:1</span>
              </button>

              {/* Nút 3: Xem Golden Flow 8 Chặng */}
              <button
                type="button"
                onClick={onScrollToGoldenFlow}
                className="hero-btn-secondary inline-flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl font-semibold text-sm text-slate-300 hover:text-white bg-slate-900/80 border border-slate-800 cursor-pointer"
              >
                <Layers className="w-4 h-4 text-slate-400" />
                <span>XEM GOLDEN FLOW 8 CHẶNG</span>
              </button>

              {/* Nút 4: Cuộn xem chi tiết giải pháp */}
              <button
                type="button"
                onClick={onScrollToAudit}
                className="hero-btn-secondary inline-flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl font-semibold text-sm text-slate-300 hover:text-white bg-slate-900/80 border border-slate-800 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>CHẨN ĐOÁN LỖ HỔNG MIỄN PHÍ</span>
              </button>
            </div>

            {/* 4 Thẻ Thống Kê Kính Mờ (Glassmorphic Stat Cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-900/85 border border-indigo-500/20 shadow-lg shadow-black/40 backdrop-blur-md text-center">
                <div className="text-xl sm:text-2xl font-black text-indigo-400 font-mono">&lt; 30s</div>
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">Chuẩn hóa Pipeline</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/85 border border-emerald-500/20 shadow-lg shadow-black/40 backdrop-blur-md text-center">
                <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">0 Trùng</div>
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">Quét CCCD chống tranh chấp</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/85 border border-blue-500/20 shadow-lg shadow-black/40 backdrop-blur-md text-center">
                <div className="text-xl sm:text-2xl font-black text-blue-400 font-mono">100%</div>
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">Khớp công chuẩn VWW</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/85 border border-amber-500/20 shadow-lg shadow-black/40 backdrop-blur-md text-center">
                <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">1 Quản lý</div>
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">300–500 lao động điều hành</div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI (5 cols): KHUNG VIDEO YOUTUBE BÁN HÀNG & GIỚI THIỆU APP */}
          <div className="lg:col-span-5 animate-fade-in">
            <div className="relative">
              {/* Vòng sáng nền quanh khung video */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-orange-500/50 via-amber-500/30 to-blue-500/50 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 -z-10" />

              {/* Khung Video Phát Sáng chuẩn Luxury */}
              <div 
                className="glow-pulse relative rounded-2xl overflow-hidden bg-black border-2 border-orange-500/60 shadow-2xl"
                style={{
                  boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 35px rgba(249,115,22,0.4)',
                }}
              >
                {/* Ratio 16:9 */}
                <div className="relative w-full pt-[56.25%] bg-slate-950">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0&modestbranding=1`}
                    title="FCS AI Workforce OS - Giới thiệu Tính năng & Lợi ích"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full"
                  />
                </div>
              </div>

              {/* Thanh thông tin dưới video */}
              <div className="mt-3.5 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-md flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                  </span>
                  <span className="font-bold text-slate-200">
                    Video Thuyết Trình Giải Pháp &amp; Demo
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 text-blue-400 font-semibold text-[11px]">
                  <span>Chuẩn VWW</span>
                  <span className="text-slate-600">•</span>
                  <span>KCN 4.0</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

