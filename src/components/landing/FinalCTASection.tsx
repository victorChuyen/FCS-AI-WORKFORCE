import React from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { ArrowRight, Sparkles, LogIn, FileSpreadsheet, ShieldCheck } from 'lucide-react';

interface FinalCTASectionProps {
  onNavigate: (route: string) => void;
  onScrollToAudit: () => void;
}

export const FinalCTASection: React.FC<FinalCTASectionProps> = ({
  onNavigate,
  onScrollToAudit,
}) => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SẴN SÀNG CHUYỂN ĐỔI VẬN HÀNH</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tight max-w-3xl mx-auto leading-tight">
            Nâng tầm doanh nghiệp cung ứng với FCS AI Workforce OS
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Chấm dứt việc mất dấu lao động trên Zalo và rủi ro tranh chấp chấm công. Trải nghiệm hệ điều hành thông minh tối ưu cho 1 Quản lý ngay hôm nay.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => onNavigate('/app')}
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-xl shadow-blue-600/30 min-h-[48px]"
              >
                <span>VÀO HỆ THỐNG ĐIỀU HÀNH</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('/register')}
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-xl shadow-blue-600/30 min-h-[48px]"
                >
                  <span>DÙNG THỬ HỆ THỐNG MIỄN PHÍ</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onScrollToAudit}
                  className="w-full sm:w-auto px-7 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 cursor-pointer min-h-[48px]"
                >
                  <span>NHẬN TƯ VẤN BLUEPRINT</span>
                </button>
              </>
            )}
          </div>

          {/* Direct VIP Founder Consultation Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://cal.com/victorchuyen/coachai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-950/70 hover:bg-indigo-900/90 border border-indigo-500/40 text-indigo-200 text-xs font-bold tracking-wide transition-all shadow-md cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span>ĐẶT LỊCH TƯ VẤN CHIẾN LƯỢC 1:1 (CAL.COM)</span>
            </a>
            <a
              href="https://zalo.me/0989890022"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/90 border border-emerald-500/40 text-emerald-200 text-xs font-bold tracking-wide transition-all shadow-md cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>CHAT TRỰC TIẾP ZALO: 0989.890.022</span>
            </a>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-400">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Bảo mật phân quyền đa tầng</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <FileSpreadsheet className="w-4 h-4 text-blue-400" />
              <span>Đồng bộ 2 chiều Google Sheets</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Quy trình Golden Flow khép kín</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
