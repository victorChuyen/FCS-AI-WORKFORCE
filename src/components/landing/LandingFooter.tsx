import React from 'react';
import {
  ShieldCheck,
  Calendar,
  Phone,
  MessageSquare,
  ExternalLink,
  Sparkles,
  Database,
  CheckCircle2,
  Lock,
  Headphones,
  Award,
} from 'lucide-react';

interface LandingFooterProps {
  onNavigate: (route: string) => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ onNavigate }) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer
      className="bg-slate-950 border-t border-slate-900 text-slate-400 text-xs relative overflow-hidden"
      style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
    >
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-gradient-to-b from-blue-900/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-14 relative z-10">
        {/* VIP Founder Consultation Card */}
        <div className="mb-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950/90 via-indigo-950/70 to-slate-900/90 border border-blue-700/40 shadow-2xl shadow-blue-950/50 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-2 relative z-10 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>VIP Founder Advisory</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">• Tư vấn chiến lược 1:1</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Đồng Hành Trực Tiếp Cùng Chairman Victor Chuyen
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Dành riêng cho chủ doanh nghiệp cung ứng, chi nhánh tuyển dụng và công ty cho thuê lại lao động cần khảo sát điểm nghẽn, đóng gói quy trình Golden Flow hoặc triển khai giải pháp chuyên biệt.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 shrink-0 relative z-10 w-full sm:w-auto">
            {/* Cal.com Booking Button */}
            <a
              href="https://cal.com/victorchuyen/coachai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs tracking-wider uppercase shadow-xl shadow-blue-900/50 transition-all transform hover:-translate-y-0.5 cursor-pointer border border-blue-400/30"
            >
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>ĐẶT LỊCH TƯ VẤN 1:1 (CAL.COM)</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>

            {/* Zalo Direct Chat Button */}
            <a
              href="https://zalo.me/0989890022"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs tracking-wider uppercase shadow-xl shadow-emerald-950/50 transition-all transform hover:-translate-y-0.5 cursor-pointer border border-emerald-400/30"
            >
              <MessageSquare className="w-4 h-4" />
              <span>CHAT ZALO: 0989.890.022</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>

        {/* 5 Columns Luxury Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-slate-900">
          {/* Brand Col */}
          <div className="sm:col-span-2 md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-blue-600/30">
                FCS
              </div>
              <div>
                <span className="font-black text-white text-base tracking-tight block">
                  FCS AI WORKFORCE OS
                </span>
                <span className="text-[10px] text-blue-400 font-mono">1 Quản lý + AI • Chuẩn VWW</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Hệ thống điều hành AI toàn diện cho các doanh nghiệp tuyển dụng và cung ứng lao động phổ thông. Tự động hóa từ khâu tiếp nhận, phỏng vấn đến chấm công xác minh chuẩn <strong>Verified Working Worker (VWW)</strong>.
            </p>
            <div className="space-y-1.5 text-[11px] text-slate-400">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Bảo mật hạ tầng Google Cloud & Firebase Authentication</span>
              </div>
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Dữ liệu thực 100% đồng bộ 2 chiều Google Sheets</span>
              </div>
              <div className="flex items-center space-x-2 text-amber-300/90 font-medium">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Kiến trúc Multi-Tenant chuẩn doanh nghiệp</span>
              </div>
            </div>
          </div>

          {/* Col 2: Liên hệ VIP & Hỗ trợ */}
          <div className="space-y-3">
            <div className="font-bold text-white text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <Headphones className="w-3.5 h-3.5 text-blue-400" />
              <span>Liên Hệ VIP</span>
            </div>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="https://zalo.me/0989890022"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start space-x-2 text-slate-300 hover:text-emerald-400 transition-colors group"
                >
                  <span className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shrink-0 mt-0.5">
                    <MessageSquare className="w-3 h-3" />
                  </span>
                  <div>
                    <span className="font-semibold block leading-snug">Zalo: 0989.890.022</span>
                    <span className="text-[10px] text-slate-500">Hỗ trợ nhanh 24/7</span>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="https://cal.com/victorchuyen/coachai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start space-x-2 text-slate-300 hover:text-blue-400 transition-colors group"
                >
                  <span className="w-5 h-5 rounded-md bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all shrink-0 mt-0.5">
                    <Calendar className="w-3 h-3" />
                  </span>
                  <div>
                    <span className="font-semibold block leading-snug">Đặt lịch tư vấn 1:1</span>
                    <span className="text-[10px] text-slate-500">cal.com/victorchuyen/coachai</span>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="tel:0989890022"
                  className="flex items-start space-x-2 text-slate-300 hover:text-white transition-colors group"
                >
                  <span className="w-5 h-5 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 group-hover:bg-slate-700 transition-all shrink-0 mt-0.5">
                    <Phone className="w-3 h-3" />
                  </span>
                  <div>
                    <span className="font-semibold block leading-snug">Hotline Doanh Nghiệp</span>
                    <span className="text-[10px] text-slate-500">0989.890.022</span>
                  </div>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Hệ thống */}
          <div className="space-y-3">
            <div className="font-bold text-white text-xs uppercase tracking-wider">Hệ thống</div>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('golden-flow-section')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Golden Flow 8 chặng
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('one-manager-section')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Mô hình 1 Quản lý
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('ai-agents-section')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Đội ngũ AI Agents
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('vww-section')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Tiêu chuẩn VWW
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('roadmap-section')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Lộ trình 6 giai đoạn
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Giải pháp */}
          <div className="space-y-3">
            <div className="font-bold text-white text-xs uppercase tracking-wider">Giải pháp</div>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('pricing-section')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Gói Starter (Chi nhánh)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('pricing-section')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Gói Business (Vừa)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('pricing-section')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Gói Multi-Office (Lớn)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('audit-offer-section')}
                  className="hover:text-white transition-colors cursor-pointer text-left font-semibold text-blue-400"
                >
                  Khảo sát AI Blueprint
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/login')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Cổng kết nối vận hành
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div className="flex flex-wrap items-center gap-2 text-center sm:text-left">
            <span>© {new Date().getFullYear()} FCS AI WORKFORCE OS. Chuẩn hóa quy trình vận hành cung ứng lao động.</span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span className="text-slate-400">Founder & Chairman: <strong>Victor Chuyen</strong></span>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <a
              href="https://zalo.me/0989890022"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-emerald-400 transition-colors font-medium"
            >
              Zalo: 0989.890.022
            </a>
            <span className="text-slate-700">•</span>
            <a
              href="https://cal.com/victorchuyen/coachai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-blue-400 transition-colors font-medium"
            >
              Cal.com 1:1
            </a>
            <span className="text-slate-700">•</span>
            <span className="text-emerald-400 font-bold font-mono">fcs.breaths.live</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
