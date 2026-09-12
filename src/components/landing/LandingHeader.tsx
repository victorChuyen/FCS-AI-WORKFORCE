import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { Menu, X, ArrowRight, LogIn, UserCheck, ShieldCheck, LogOut } from 'lucide-react';

interface LandingHeaderProps {
  onNavigate: (route: string) => void;
  onOpenAuditModal?: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  onNavigate,
  onOpenAuditModal,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close drawer on escape or route change
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavClick = (anchorId: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(anchorId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navLinks = [
    { label: 'Mô hình 1 Quản lý', id: 'one-manager-section' },
    { label: 'AI Agents', id: 'ai-agents-section' },
    { label: 'Golden Flow', id: 'golden-flow-section' },
    { label: 'Chuẩn VWW', id: 'vww-section' },
    { label: 'Bảng giá', id: 'pricing-section' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-200 ${
          scrolled
            ? 'bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/20'
            : 'bg-slate-950/70 backdrop-blur-sm border-b border-slate-800/40'
        }`}
        style={{ paddingTop: 'max(0px, env(safe-area-inset-top))' }}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center space-x-2.5 text-left group cursor-pointer focus:outline-hidden"
              title="Về đầu trang FCS AI WORKFORCE OS"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-md shadow-blue-600/30 group-hover:bg-blue-500 transition-colors shrink-0">
                FCS
              </div>
              <div className="flex flex-col">
                <span className="font-black text-white text-sm sm:text-base tracking-tight leading-none group-hover:text-blue-400 transition-colors">
                  FCS AI WORKFORCE OS
                </span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">
                  1 Quản lý + AI • Chuẩn VWW
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-5 text-xs font-medium text-slate-300">
            {navLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => handleNavClick(link.id)}
                className="hover:text-white transition-colors cursor-pointer py-1.5 focus:outline-hidden focus:text-blue-400"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop Right CTA Actions - Tinh gọn, không rối mắt */}
          <div className="hidden sm:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-slate-300 font-semibold max-w-[140px] truncate">
                    {user?.displayName || user?.email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('/app')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 cursor-pointer shadow-md shadow-blue-600/25"
                >
                  <span>VÀO HỆ THỐNG</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    onNavigate('/login');
                  }}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg text-xs transition-colors cursor-pointer"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('/login')}
                  className="px-3.5 py-2 text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  ĐĂNG NHẬP
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/register')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 cursor-pointer shadow-md shadow-blue-600/25 group"
                >
                  <span>DÙNG THỬ</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex sm:hidden items-center space-x-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => onNavigate('/app')}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase cursor-pointer"
              >
                VÀO APP
              </button>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800/80 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Mở menu điều hướng"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Backdrop & Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Container */}
          <div
            className="fixed inset-y-0 right-0 w-[280px] max-w-[85vw] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col p-5 overflow-y-auto"
            style={{
              paddingTop: 'max(1.25rem, env(safe-area-inset-top))',
              paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))',
            }}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                  FCS
                </div>
                <span className="font-bold text-white text-sm">FCS AI OS</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Đóng menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation List */}
            <div className="py-4 space-y-1 flex-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => handleNavClick(link.id)}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-medium transition-colors cursor-pointer min-h-[44px] flex items-center"
                >
                  {link.label}
                </button>
              ))}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenAuditModal) {
                      onOpenAuditModal();
                    } else {
                      handleNavClick('audit-offer-section');
                    }
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-blue-400 hover:text-blue-300 hover:bg-blue-950/40 text-sm font-bold transition-colors cursor-pointer min-h-[44px] flex items-center"
                >
                  Nhận AI Blueprint Miễn Phí
                </button>
              </div>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="pt-4 border-t border-slate-800 space-y-2.5">
              {isAuthenticated ? (
                <>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                    <p className="font-bold text-white truncate">{user?.displayName || 'Người dùng FCS'}</p>
                    <p className="text-slate-400 truncate text-[11px] mt-0.5">{user?.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('/app');
                    }}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 cursor-pointer min-h-[44px]"
                  >
                    <span>VÀO HỆ THỐNG</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await logout();
                      onNavigate('/login');
                    }}
                    className="w-full py-2.5 px-4 text-slate-400 hover:text-rose-400 text-xs font-semibold transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('/register');
                    }}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 cursor-pointer min-h-[44px]"
                  >
                    <span>DÙNG THỬ HỆ THỐNG</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('/login');
                    }}
                    className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 cursor-pointer min-h-[44px]"
                  >
                    <LogIn className="w-4 h-4 text-slate-400" />
                    <span>ĐĂNG NHẬP</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
