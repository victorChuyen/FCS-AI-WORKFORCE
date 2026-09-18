import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { useApp } from '../context/AppContext';
import { Navbar } from '../components/layout/Navbar';
import { DemoBanner } from '../components/layout/DemoBanner';
import { AppFooter } from '../components/layout/AppFooter';
import { FloatingVipContact } from '../components/common/FloatingVipContact';
import { CreateWorkerModal } from '../components/workers/CreateWorkerModal';
import { DocsModal } from '../components/common/DocsModal';
import { SaaSRoleGuideModal } from '../components/common/SaaSRoleGuideModal';
import { AlertCircle, CheckCircle, Info, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../config/env';
import { useAppNavigate } from '../hooks/useNavigate';

export const AppLayout: React.FC = () => {
  const {
    notification,
    showCreateWorkerModal,
    setShowCreateWorkerModal,
    showDocsModal,
    setShowDocsModal,
    showGuideModal,
    setShowGuideModal,
    isMock,
    healthStatus,
    checkHealth,
  } = useApp();
  
  const navigateTo = useAppNavigate();
  const [isRetrying, setIsRetrying] = useState(false);

  // Auto-show SaaS Role Guide on login if user hasn't opted out
  useEffect(() => {
    try {
      const isDismissed = localStorage.getItem('fcs_hide_saas_onboarding') === 'true';
      if (!isDismissed) {
        setShowGuideModal(true);
      }
    } catch {
      // LocalStorage access fallback
    }
  }, [setShowGuideModal]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await checkHealth();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <ProtectedRoute fallbackRoute="/login" onRedirectToLogin={() => navigateTo('/login')}>
      <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
        <Navbar />
        <DemoBanner />
        
        {!isMock && (!API_BASE_URL || API_BASE_URL.trim().length === 0) && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-950 px-4 py-3 text-xs">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Chưa cấu hình API Backend:</span> Chưa tìm thấy biến <code className="bg-amber-200/70 text-amber-950 border border-amber-300 px-1 py-0.5 rounded font-mono font-bold">VITE_API_BASE_URL</code> trong môi trường ứng dụng. Vui lòng kiểm tra lại cấu hình.
                </div>
              </div>
              <button onClick={() => setShowDocsModal(true)} className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shrink-0">
                XEM HƯỚNG DẪN CẤU HÌNH
              </button>
            </div>
          </div>
        )}

        {!isMock && Boolean(API_BASE_URL && API_BASE_URL.trim().length > 0) && healthStatus === 'error' && (
          <div className="bg-rose-50 border-b border-rose-200 text-rose-950 px-4 py-2.5 text-xs">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-semibold text-rose-900">Mất kết nối dữ liệu Google Sheets của doanh nghiệp.</span>
                <span className="text-rose-700 hidden md:inline">(Hệ thống tuân thủ nguyên tắc Real Data, không tự động chuyển sang dữ liệu giả lập)</span>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button onClick={handleRetry} disabled={isRetrying} className="px-3 py-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shrink-0 flex items-center space-x-1">
                  <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
                  <span>{isRetrying ? 'ĐANG THỬ LẠI...' : 'KẾT NỐI LẠI'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {notification && (
          <div className="fixed top-4 right-3 sm:right-6 z-[100] max-w-md w-[calc(100vw-1.5rem)] sm:w-auto animate-in slide-in-from-top-5 duration-200 shadow-2xl">
            <div className={`p-4 rounded-xl shadow-2xl border flex items-start space-x-3 backdrop-blur-sm ${
              notification.type === 'success'
                ? 'bg-emerald-900/95 text-emerald-100 border-emerald-500 ring-2 ring-emerald-500/30'
                : notification.type === 'warning'
                ? 'bg-rose-950/95 text-rose-100 border-rose-500 ring-2 ring-rose-500/30'
                : 'bg-slate-900/95 text-slate-100 border-slate-600 ring-2 ring-slate-500/30'
            }`}>
              {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
              {notification.type === 'warning' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
              {notification.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}
              <div className="text-xs font-medium leading-relaxed pr-2">
                <div className="font-bold text-sm mb-0.5">
                  {notification.type === 'success' ? 'Thành công' : notification.type === 'warning' ? 'Thông báo / Lỗi' : 'Thông tin'}
                </div>
                <div>{notification.message}</div>
                {notification.action && (
                  <button onClick={notification.action.onClick} className="mt-2 inline-flex items-center px-2.5 py-1 bg-white text-slate-950 hover:bg-slate-100 rounded-md font-bold text-[11px] shadow-xs cursor-pointer uppercase transition-colors">
                    {notification.action.label}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-8">
          <Outlet />
        </main>

        <AppFooter onNavigate={navigateTo} />
        <FloatingVipContact />
        <CreateWorkerModal isOpen={showCreateWorkerModal} onClose={() => setShowCreateWorkerModal(false)} />
        <DocsModal isOpen={showDocsModal} onClose={() => setShowDocsModal(false)} />
        <SaaSRoleGuideModal isOpen={showGuideModal} onClose={() => setShowGuideModal(false)} />
      </div>
    </ProtectedRoute>
  );
};

export default AppLayout;
