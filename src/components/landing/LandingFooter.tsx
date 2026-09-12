import React from 'react';
import { ShieldCheck } from 'lucide-react';

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
      className="bg-slate-950 border-t border-slate-900 text-slate-400 text-xs"
      style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Col (2 cols) */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                FCS
              </div>
              <span className="font-black text-white text-base tracking-tight">
                FCS AI WORKFORCE OS
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Hệ thống điều hành AI toàn diện cho các doanh nghiệp tuyển dụng và cung ứng lao động phổ thông. Tự động hóa từ khâu tiếp nhận, phỏng vấn đến chấm công xác minh chuẩn Verified Working Worker (VWW).
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Bảo mật hạ tầng Google Cloud & Firebase Authentication</span>
            </div>
          </div>

          {/* Col 1: Hệ thống */}
          <div className="space-y-3">
            <div className="font-bold text-white text-xs uppercase tracking-wider">Hệ thống</div>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('golden-flow-section')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Golden Flow 8 chặng
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('one-manager-section')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Mô hình 1 Quản lý
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('ai-agents-section')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Đội ngũ AI Agents
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('vww-section')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Tiêu chuẩn VWW
                </button>
              </li>
            </ul>
          </div>

          {/* Col 2: Giải pháp */}
          <div className="space-y-3">
            <div className="font-bold text-white text-xs uppercase tracking-wider">Giải pháp</div>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('pricing-section')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Gói Starter (Chi nhánh)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('pricing-section')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Gói Business (Vừa)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('pricing-section')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Gói Multi-Office (Lớn)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('audit-offer-section')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Khảo sát AI Blueprint
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Cổng kết nối */}
          <div className="space-y-3">
            <div className="font-bold text-white text-xs uppercase tracking-wider">Cổng kết nối</div>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/login')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Đăng nhập tài khoản
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/register')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Đăng ký dùng thử
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('roadmap-section')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Lộ trình 6 giai đoạn
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('faq-section')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Hỏi đáp thường gặp
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>
            © {new Date().getFullYear()} FCS AI WORKFORCE OS. Chuẩn hóa quy trình vận hành cung ứng lao động.
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-mono">Phiên bản API 3.2.0</span>
            <span>•</span>
            <span>Sprint 01 Golden Flow</span>
            <span>•</span>
            <span>Verified Working Worker</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
