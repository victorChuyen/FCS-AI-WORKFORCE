import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../auth/AuthProvider';
import {
  CalendarDays,
  Users,
  GitFork,
  CheckCircle2,
  BarChart3,
  Plus,
  BookOpen,
  ChevronDown,
  LogOut,
  User,
  ShieldCheck,
  Check,
  Building2,
  AlertCircle,
  Database,
  Layers,
  ArrowRight,
  Sparkles,
  X,
  Radio,
} from 'lucide-react';
import { AccountModal } from '../common/AccountModal';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    tenantContext,
    currentRoute,
    navigateTo,
    setShowCreateWorkerModal,
    setShowDocsModal,
    isMock,
    toggleMockMode,
    connectionState,
    availableTenants,
    switchTenant,
    checkHealth,
    triggerRefresh,
  } = useApp();

  const { user: authUser, logout, loginWithPreset } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [tenantSelectorOpen, setTenantSelectorOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const tenantSelectorRef = useRef<HTMLDivElement>(null);

  const isSuperAdmin = currentUser.role === 'PLATFORM_SUPER_ADMIN' || currentUser.isSuperAdmin;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (tenantSelectorRef.current && !tenantSelectorRef.current.contains(event.target as Node)) {
        setTenantSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pilotAccounts = [
    { email: 'coach.chuyen@gmail.com', label: 'Coach Chuyền (Super Admin)', role: 'PLATFORM_SUPER_ADMIN' },
    { email: 'ceo-fcs@breaths.live', label: 'CEO FCS (Tenant Admin)', role: 'TENANT_ADMIN' },
    { email: 'manager-fcs@breaths.live', label: 'Quản lý Vận hành (Manager)', role: 'TENANT_MANAGER' },
    { email: 'staff-fcs@breaths.live', label: 'Chuyên viên Tuyển dụng', role: 'RECRUITER' },
  ];

  const handleQuickSwitch = async (email: string) => {
    try {
      await loginWithPreset(email);
      setUserMenuOpen(false);
      triggerRefresh();
      setTimeout(() => {
        checkHealth();
      }, 100);
    } catch (err) {
      console.error('Quick switch error:', err);
    }
  };

  const navItems = [
    { label: 'HÔM NAY', route: '/app', icon: CalendarDays },
    { label: 'LAO ĐỘNG', route: '/app/workers', icon: Users },
    { label: 'PIPELINE', route: '/app/pipeline', icon: GitFork },
    { label: 'CẦN XÁC NHẬN', route: '/app/confirmations', icon: CheckCircle2 },
    { label: 'KẾT QUẢ', route: '/app/results', icon: BarChart3 },
  ];

  const isActive = (route: string) => {
    if (route === '/app') {
      return currentRoute === '/app' || currentRoute === '/app/' || currentRoute === '/';
    }
    if (route === '/app/confirmations') {
      return (
        currentRoute.startsWith('/app/confirmations') ||
        currentRoute.startsWith('/app/review') ||
        currentRoute.startsWith('/review')
      );
    }
    const shortRoute = route.replace('/app', '');
    return (
      currentRoute.startsWith(route) ||
      (shortRoute ? currentRoute.startsWith(shortRoute) : false)
    );
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    navigateTo('/login');
  };

  return (
    <>
      {/* Top Navbar - Cố định 100% trên PC & Mobile iPhone / Android */}
      <header
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs transition-all"
        style={{ top: 0, paddingTop: 'max(0px, env(safe-area-inset-top))' }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            
            {/* Left: Brand & Customer Tenant Identifier */}
            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
              <button
                type="button"
                onClick={() => navigateTo('/app')}
                className="flex items-center space-x-2 text-left group focus:outline-hidden cursor-pointer"
                title="Về tổng quan doanh nghiệp"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-base sm:text-lg tracking-wider shadow-xs group-hover:bg-blue-700 transition-colors shrink-0">
                  {currentUser.companyCode || 'FCS'}
                </div>
                
                <div className="hidden sm:flex flex-col text-left">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight group-hover:text-blue-600 transition-colors">
                      {tenantContext.companyName || 'FCS Pilot Workforce Corp'}
                    </span>
                    <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded font-mono text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                      <span>{tenantContext.tenantId || 'FCS-000001'}</span>
                    </span>
                  </div>
                  <p className="hidden md:block text-[11px] text-slate-500 font-medium">
                    Hệ điều hành Cung ứng Lao động • Chuẩn VWW
                  </p>
                </div>
              </button>

              {/* Super Admin Tenant Switcher Dropdown (Section 20) */}
              {isSuperAdmin && (
                <div className="relative hidden md:block" ref={tenantSelectorRef}>
                  <button
                    type="button"
                    onClick={() => setTenantSelectorOpen(!tenantSelectorOpen)}
                    className="flex items-center space-x-1 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    title="Chuyển đổi Tenant (Dành cho Platform Super Admin)"
                  >
                    <Building2 className="w-3.5 h-3.5 text-purple-700" />
                    <span>Quản trị Tenant</span>
                    <ChevronDown className="w-3 h-3 text-purple-600 ml-0.5" />
                  </button>

                  {tenantSelectorOpen && (
                    <div className="absolute left-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs">
                      <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                        <span className="font-bold text-slate-700">Chọn Tenant Vận hành</span>
                        <button
                          onClick={() => {
                            setTenantSelectorOpen(false);
                            navigateTo('/platform/tenants');
                          }}
                          className="text-[10px] text-blue-600 hover:underline font-bold"
                        >
                          Xem tất cả
                        </button>
                      </div>

                      <div className="max-h-56 overflow-y-auto py-1">
                        {availableTenants.map(t => {
                          const isCur = t.tenantId === tenantContext.tenantId;
                          return (
                            <button
                              key={t.tenantId}
                              type="button"
                              onClick={() => {
                                switchTenant(t.tenantId);
                                setTenantSelectorOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                                isCur ? 'bg-blue-50/70 text-blue-900 font-bold' : 'text-slate-700'
                              }`}
                            >
                              <div>
                                <div className="font-semibold truncate max-w-[160px]">{t.companyName}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{t.tenantId}</div>
                              </div>
                              {isCur && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      <div className="pt-1.5 border-t border-slate-100 px-3">
                        <button
                          type="button"
                          onClick={() => {
                            setTenantSelectorOpen(false);
                            navigateTo('/platform/tenants');
                          }}
                          className="w-full py-1 text-center text-blue-600 hover:text-blue-700 font-bold text-[11px] block"
                        >
                          Quản trị Hệ thống Tenant →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Middle: 5 Primary Nav Items (Desktop) */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const active = isActive(item.route);
                return (
                  <button
                    key={item.route}
                    onClick={() => navigateTo(item.route)}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-blue-50 text-blue-700 font-extrabold border border-blue-200/80 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Action Tools: Data Status Indicator, Create Worker, Docs, User Avatar */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              
              {/* REAL DATA STATUS BADGE (Section 19: GREEN / YELLOW / RED) */}
              <div
                onClick={() => checkHealth()}
                className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold border transition-all cursor-pointer select-none ${
                  connectionState.color === 'emerald'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    : connectionState.color === 'amber'
                    ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 animate-pulse'
                    : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                }`}
                title={`Trạng thái: ${connectionState.detail || connectionState.label}. Nhấp để kiểm tra lại.`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  connectionState.color === 'emerald'
                    ? 'bg-emerald-500'
                    : connectionState.color === 'amber'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`} />
                <span className="tracking-wide uppercase">{connectionState.label}</span>
              </div>

              {/* Add Worker Button */}
              <button
                onClick={() => setShowCreateWorkerModal(true)}
                className="inline-flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer min-h-[32px] sm:min-h-[36px] whitespace-nowrap shrink-0"
                title="Thêm mới lao động vào hệ thống"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">THÊM LAO ĐỘNG</span>
                <span className="sm:hidden text-xs font-bold">Thêm</span>
              </button>

              {/* Docs / Google Sheets Architecture Modal */}
              <button
                onClick={() => setShowDocsModal(true)}
                title="Mã nguồn Google Apps Script V4 & Cấu trúc Spreadsheet"
                className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <BookOpen className="w-4 h-4" />
              </button>

              {/* User Menu Trigger */}
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-1 sm:space-x-1.5 p-1 sm:px-2 sm:py-1 rounded-lg hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 cursor-pointer shrink-0"
                  title="Menu người dùng"
                >
                  {authUser?.photoURL ? (
                    <img
                      src={authUser.photoURL}
                      alt={authUser.displayName || 'Avatar'}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-slate-200 shadow-2xs"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-2xs">
                      {(authUser?.displayName || currentUser.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden xl:flex flex-col text-left leading-tight">
                    <span className="text-xs font-bold text-slate-800 truncate max-w-[110px]">
                      {authUser?.displayName || currentUser.name}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[110px]">
                      {currentUser.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900 truncate">
                        {authUser?.displayName || currentUser.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {authUser?.email || currentUser.email}
                      </p>
                      <div className="mt-1.5 flex items-center space-x-1.5">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          {currentUser.role}
                        </span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          {tenantContext.tenantId}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      {isSuperAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false);
                            navigateTo('/platform/tenants');
                          }}
                          className="w-full text-left px-3.5 py-2 text-purple-700 hover:bg-purple-50 flex items-center space-x-2 cursor-pointer font-bold"
                        >
                          <Building2 className="w-4 h-4 text-purple-600" />
                          <span>Quản trị Tenant (Super Admin)</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          setShowAccountModal(true);
                        }}
                        className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer font-medium"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Tài khoản & Định danh</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          setShowDocsModal(true);
                        }}
                        className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer font-medium"
                      >
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        <span>Kiến trúc hệ thống & Script</span>
                      </button>

                      <div className="px-3.5 py-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">Chế độ vận hành:</span>
                        <button
                          type="button"
                          onClick={() => toggleMockMode()}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                            isMock
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          }`}
                          title={isMock ? 'Đang dùng Mock Demo. Bấm để chuyển sang Google Sheet thật' : 'Đang kết nối Sheet thật. Bấm để chuyển sang Mock Demo'}
                        >
                          {isMock ? 'Mock Demo' : 'Sheet Thật (V4)'}
                        </button>
                      </div>
                    </div>

                    {/* Quick Switch between the 4 pilot accounts */}
                    <div className="pt-2 pb-1 border-t border-slate-100 bg-slate-50/50">
                      <div className="px-3.5 pb-1.5 flex items-center space-x-1 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Chuyển vai trò thí điểm:</span>
                      </div>
                      {pilotAccounts.map(acc => {
                        const isCurrent = (authUser?.email || currentUser.email) === acc.email;
                        return (
                          <button
                            key={acc.email}
                            type="button"
                            onClick={() => handleQuickSwitch(acc.email)}
                            className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between text-[11px] cursor-pointer transition-colors ${
                              isCurrent ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <span className="truncate">{acc.label}</span>
                            {isCurrent && <Check className="w-3.5 h-3.5 text-blue-600" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center space-x-2 cursor-pointer font-semibold"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Account Modal */}
      <AccountModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        onLogout={handleLogout}
      />
    </>
  );
};

export default Navbar;
