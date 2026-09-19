import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  FileSpreadsheet,
  Compass,
  Menu,
  X,
  ExternalLink,
  Sparkles,
  Bot,
  Trash2,
  Megaphone,
} from 'lucide-react';
import { AccountModal } from '../common/AccountModal';
import { SuperAdminResetModal } from '../common/SuperAdminResetModal';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    tenantContext,
    currentRoute,
    navigateTo,
    setShowCreateWorkerModal,
    setShowDocsModal,
    setShowGuideModal,
    isMock,
    toggleMockMode,
    connectionState,
    availableTenants,
    switchTenant,
    checkHealth,
  } = useApp();

  const { user: authUser, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [tenantSelectorOpen, setTenantSelectorOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
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

  // Close mobile drawer on route change
  const location = useLocation();
  const currentPath = location.pathname || currentRoute;
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [currentPath]);

  const navItems = [
    { label: 'HÔM NAY', route: '/app', icon: CalendarDays, shortLabel: 'Hôm nay' },
    { label: 'LAO ĐỘNG', route: '/app/workers', icon: Users, shortLabel: 'Lao động' },
    { label: 'LƯỚI EXCEL', route: '/app/grid', icon: FileSpreadsheet, shortLabel: 'Lưới Excel' },
    { label: 'PIPELINE', route: '/app/pipeline', icon: GitFork, shortLabel: 'Pipeline' },
    { label: 'MARKETING AI', route: '/app/marketing', icon: Megaphone, shortLabel: 'Marketing' },
    { label: 'CẦN XÁC NHẬN', route: '/app/confirmations', icon: CheckCircle2, shortLabel: 'Xác nhận' },
    { label: 'KẾT QUẢ', route: '/app/results', icon: BarChart3, shortLabel: 'Kết quả' },
  ];

  const isActive = (route: string) => {
    if (route === '/app') {
      return currentPath === '/app' || currentPath === '/app/' || currentPath === '/' || currentPath === '/today';
    }
    if (route === '/app/confirmations') {
      return (
        currentPath.startsWith('/app/confirmations') ||
        currentPath.startsWith('/app/review') ||
        currentPath.startsWith('/confirmations') ||
        currentPath.startsWith('/review')
      );
    }
    const shortRoute = route.replace('/app', '');
    return (
      currentPath.startsWith(route) ||
      (shortRoute ? currentPath.startsWith(shortRoute) : false)
    );
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setMobileDrawerOpen(false);
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    navigateTo('/login');
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR HEADER (CỐ ĐỊNH 100% PC, TABLET, MOBILE KHÔNG TRÀN) */}
      {/* ========================================================================= */}
      <header
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs transition-all w-full"
        style={{ top: 0, paddingTop: 'max(0px, env(safe-area-inset-top))' }}
      >
        {/* ----------------------------------------------------------------- */}
        {/* TIER 1: BRAND + TENANT SWITCHER + ACTIONS + USER PROFILE */}
        {/* ----------------------------------------------------------------- */}
        <div className="w-full max-w-[1720px] mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-13 sm:h-14 gap-1.5 sm:gap-2">
            
            {/* PHẦN TRÁI: BRAND LOGO + TENANT IDENTIFIER + SUBTITLE + QUẢN TRỊ TENANT */}
            <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
              <button
                type="button"
                onClick={() => navigateTo('/app')}
                className="flex items-center space-x-2 text-left group focus:outline-hidden cursor-pointer"
                title="Về tổng quan doanh nghiệp"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm sm:text-base tracking-wider shadow-xs group-hover:bg-blue-700 transition-colors shrink-0">
                  {currentUser.companyCode || 'FCS'}
                </div>
                
                <div className="flex flex-col text-left justify-center">
                  <div className="flex items-center space-x-1 sm:space-x-1.5">
                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm tracking-tight group-hover:text-blue-600 transition-colors truncate max-w-[110px] xs:max-w-[140px] sm:max-w-[180px] lg:max-w-[240px]">
                      {tenantContext.companyName || 'FCS Pilot Workforce Corp'}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded font-mono text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                      {tenantContext.tenantId || 'FCS-000001'}
                    </span>
                  </div>
                  <p className="hidden lg:block text-[10px] text-slate-400 font-medium leading-none mt-0.5">
                    Hệ điều hành Cung ứng Lao động • Chuẩn VWW
                  </p>
                </div>
              </button>

              {/* Super Admin Tenant Switcher Dropdown - Only show on xl+ to prevent overflow */}
              {isSuperAdmin && (
                <div className="relative hidden xl:block" ref={tenantSelectorRef}>
                  <button
                    type="button"
                    onClick={() => setTenantSelectorOpen(!tenantSelectorOpen)}
                    className="flex items-center space-x-1.5 px-2 sm:px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                    title="Chuyển đổi Doanh nghiệp khách hàng (Super Admin)"
                  >
                    <Building2 className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                    <span>Quản trị Tenant</span>
                    <ChevronDown className="w-3 h-3 text-purple-600 ml-0.5 shrink-0" />
                  </button>

                  {tenantSelectorOpen && (
                    <div className="absolute left-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
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

            {/* PHẦN PHẢI: TRẠNG THÁI + ACTIONS + USER PROFILE + HAMBURGER */}
            <div className="flex items-center space-x-1 sm:space-x-1.5 lg:space-x-2 shrink-0">
              
              {/* Status Badge: Dot + Text trên desktop xl+, chỉ Dot trên mobile, tablet & lg */}
              <div
                onClick={() => checkHealth()}
                className={`flex items-center space-x-1.5 px-2 sm:px-2.5 py-1 rounded-full text-xs font-extrabold border transition-all cursor-pointer select-none shrink-0 ${
                  connectionState.color === 'emerald'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    : connectionState.color === 'amber'
                    ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 animate-pulse'
                    : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                }`}
                title={`Trạng thái: ${connectionState.detail || connectionState.label}. Nhấp để kiểm tra kết nối.`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  connectionState.color === 'emerald'
                    ? 'bg-emerald-500'
                    : connectionState.color === 'amber'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`} />
                <span className="hidden 2xl:inline tracking-wide uppercase text-[11px] font-bold">
                  {connectionState.color === 'emerald' ? 'KẾT NỐI SHEETS' : connectionState.color === 'amber' ? 'ĐANG KẾT NỐI' : 'MẤT KẾT NỐI'}
                </span>
              </div>

              {/* Add Worker Button */}
              {currentUser.role !== 'VIEWER' && (
                <button
                  onClick={() => setShowCreateWorkerModal(true)}
                  className="inline-flex items-center justify-center h-8 px-2 sm:px-2.5 lg:px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer shrink-0"
                  title="Thêm mới lao động vào hệ thống"
                >
                  <Plus className="w-4 h-4 shrink-0 stroke-[2.5]" />
                  <span className="hidden sm:inline ml-1">Thêm lao động</span>
                </button>
              )}

              {/* Hướng Dẫn SaaS Button */}
              <button
                onClick={() => setShowGuideModal(true)}
                className="hidden xl:inline-flex items-center space-x-1.5 px-2.5 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 shadow-2xs"
                title="Hướng dẫn sử dụng chuẩn SaaS theo vai trò"
              >
                <Compass className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="hidden 2xl:inline">HƯỚNG DẪN SAAS</span>
                <span className="inline 2xl:hidden">H.Dẫn</span>
              </button>

              {/* AI Handover & Feedback Button */}
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('fcs_open_handover_copilot'));
                }}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 text-amber-300 border border-blue-400/40 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 shadow-md group"
                title="Mở Trợ lý AI Bàn Giao & Nghiệm Thu GĐ1 & GĐ2"
              >
                <Bot className="w-3.5 h-3.5 text-amber-300 shrink-0 animate-pulse" />
                <span className="hidden sm:inline">BÀN GIAO AI</span>
                <span className="hidden xl:inline px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono">
                  GĐ1-2
                </span>
              </button>

              {/* Docs / Google Sheets Architecture Modal */}
              {(isSuperAdmin || currentUser.role === 'TENANT_ADMIN' || currentUser.role === 'ADMIN') && (
                <button
                  onClick={() => setShowDocsModal(true)}
                  title="Mã nguồn Google Apps Script & Cấu trúc Spreadsheet"
                  className="hidden 2xl:inline-flex p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  <BookOpen className="w-4 h-4" />
                </button>
              )}

              {/* User Menu Trigger (Avatar + Name + Role Pill) */}
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-1.5 p-1 sm:px-2 sm:py-1 rounded-lg hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 cursor-pointer shrink-0"
                  title="Tài khoản cá nhân"
                >
                  {authUser?.photoURL ? (
                    <img
                      src={authUser.photoURL}
                      alt={authUser.displayName || 'Avatar'}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-2xs shrink-0">
                      {(authUser?.displayName || currentUser.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden 2xl:flex flex-col text-left leading-tight pl-0.5">
                    <span className="text-xs font-extrabold text-slate-800 truncate max-w-[120px] 2xl:max-w-[150px]">
                      {authUser?.displayName || currentUser.name || 'Coach Chuyên'}
                    </span>
                    <span className="text-[9px] text-purple-600 font-mono font-bold truncate max-w-[120px] 2xl:max-w-[150px]">
                      {currentUser.role === 'PLATFORM_SUPER_ADMIN' ? 'SUPER_ADMIN' : currentUser.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-0.5" />
                </button>

                {/* Dropdown Menu (Cố định z-[70] và max-w chống tràn mép màn hình) */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-68 max-w-[calc(100vw-1rem)] bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-[70] text-xs animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900 truncate">
                        {authUser?.displayName || currentUser.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {authUser?.email || currentUser.email}
                      </p>
                      <div className="mt-1.5 flex items-center space-x-1.5">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          currentUser.role === 'VIEWER'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {currentUser.role === 'PLATFORM_SUPER_ADMIN' ? 'PLATFORM SUPER ADMIN' : currentUser.role}
                        </span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {tenantContext.tenantId}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      {isSuperAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setUserMenuOpen(false);
                              navigateTo('/platform/tenants');
                            }}
                            className="w-full text-left px-3.5 py-2 text-purple-700 hover:bg-purple-50 flex items-center space-x-2 cursor-pointer font-bold"
                          >
                            <Building2 className="w-4 h-4 text-purple-600 shrink-0" />
                            <span>Quản trị Tenant (Super Admin)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setUserMenuOpen(false);
                              setShowResetModal(true);
                            }}
                            className="w-full text-left px-3.5 py-2 text-rose-700 hover:bg-rose-50 flex items-center space-x-2 cursor-pointer font-bold"
                          >
                            <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>Reset Clean Slate (Xóa sạch Data)</span>
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          setShowAccountModal(true);
                        }}
                        className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer font-medium"
                      >
                        <User className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Tài khoản & Định danh</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          setShowGuideModal(true);
                        }}
                        className="w-full text-left px-3.5 py-2 text-blue-700 hover:bg-blue-50 flex items-center space-x-2 cursor-pointer font-bold"
                      >
                        <Compass className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Hướng Dẫn Theo Vai Trò</span>
                      </button>

                      {(isSuperAdmin || currentUser.role === 'TENANT_ADMIN' || currentUser.role === 'ADMIN') && (
                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false);
                            setShowDocsModal(true);
                          }}
                          className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer font-medium"
                        >
                          <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>Kiến trúc hệ thống & Script</span>
                        </button>
                      )}

                      <div className="px-3.5 py-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">Chế độ vận hành:</span>
                        {currentUser.role === 'VIEWER' ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            Dữ liệu Demo (Mock)
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleMockMode()}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                              isMock
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            }`}
                          >
                            {isMock ? 'Mock Demo' : 'Sheet Thật (V2)'}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center space-x-2 cursor-pointer font-semibold"
                      >
                        <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Hamburger Button (Mobile & Tablet < lg) */}
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(true)}
                className="lg:hidden p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Mở menu điều hướng"
                aria-label="Mở menu điều hướng"
              >
                <Menu className="w-5 h-5 text-slate-800" />
              </button>

            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* TIER 2: 6 MODULES NAVIGATION RIBBON (HIỂN THỊ TRÊN DESKTOP LG+) */}
        {/* ----------------------------------------------------------------- */}
        <div className="hidden lg:block bg-slate-50/95 border-t border-slate-200/80">
          <div className="w-full max-w-[1720px] mx-auto px-4 lg:px-6">
            <div className="flex items-center justify-between h-10">
              <nav className="flex items-center space-x-1.5">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const active = isActive(item.route);
                  return (
                    <button
                      key={item.route}
                      onClick={() => navigateTo(item.route)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-white stroke-[2.5]' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-[11px] font-mono text-slate-600 font-bold uppercase tracking-wider">
                  Chuẩn VWW Enterprise
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MOBILE BOTTOM NAVIGATION BAR (CỐ ĐỊNH ĐÁY CHO IPHONE & ANDROID) */}
      {/* ========================================================================= */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-1 py-1"
        style={{ paddingBottom: 'max(4px, env(safe-area-inset-bottom))' }}
      >
        <div className="grid grid-cols-7 gap-0.5 max-w-lg mx-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item.route);
            return (
              <button
                key={item.route}
                onClick={() => navigateTo(item.route)}
                className={`flex flex-col items-center justify-center py-1 rounded-lg transition-all cursor-pointer ${
                  active
                    ? 'text-blue-600 font-extrabold bg-blue-50/60'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${active ? 'text-blue-600 stroke-[2.5]' : 'text-slate-400'}`} />
                <span className={`text-[9px] sm:text-[10px] mt-0.5 leading-none truncate max-w-full px-0.5 ${
                  active ? 'font-black text-blue-700' : 'font-semibold'
                }`}>
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 3. MOBILE & TABLET SLIDE-OVER DRAWER (MENU TRƯỢT BÊN PHẢI TOÀN DIỆN) */}
      {/* ========================================================================= */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-250">
            
            {/* Top Bar inside drawer */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                  FCS
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    {tenantContext.companyName || 'FCS Pilot Workforce Corp'}
                  </h3>
                  <span className="font-mono text-[10px] text-blue-700 font-bold">
                    {tenantContext.tenantId}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Navigation List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              
              {/* User summary card */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                <div className="flex items-center space-x-2">
                  {authUser?.photoURL ? (
                    <img
                      src={authUser.photoURL}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full border border-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                      {(authUser?.displayName || currentUser.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 text-xs truncate">
                      {authUser?.displayName || currentUser.name}
                    </p>
                    <span className="text-[10px] font-bold text-purple-700 uppercase">
                      {currentUser.role === 'PLATFORM_SUPER_ADMIN' ? 'PLATFORM SUPER ADMIN' : currentUser.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Primary Menu Items */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block">
                  Phân hệ Vận hành
                </span>
                {navItems.map(item => {
                  const Icon = item.icon;
                  const active = isActive(item.route);
                  return (
                    <button
                      key={item.route}
                      type="button"
                      onClick={() => {
                        navigateTo(item.route);
                        setMobileDrawerOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        active
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Management & Tools */}
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block">
                  Công cụ & Hướng dẫn
                </span>
                
                {isSuperAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      navigateTo('/platform/tenants');
                      setMobileDrawerOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold text-purple-700 hover:bg-purple-50 cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Quản trị Tenant (Super Admin)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowGuideModal(true);
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold text-blue-700 hover:bg-blue-50 cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Hướng Dẫn SaaS Theo Vai Trò</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowDocsModal(true);
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Kiến trúc hệ thống & Script</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAccountModal(true);
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Tài khoản & Định danh</span>
                </button>
              </div>

            </div>

            {/* Bottom logout */}
            <div className="p-3 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
                <span>ĐĂNG XUẤT HỆ THỐNG</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Account Modal */}
      <AccountModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        onLogout={handleLogout}
      />

      {/* Super Admin Clean Slate Reset Modal */}
      <SuperAdminResetModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
      />
    </>
  );
};

export default Navbar;
