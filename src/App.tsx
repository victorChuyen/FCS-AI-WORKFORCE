import React from 'react';
import { AuthProvider } from './auth/AuthProvider';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { TodayPage } from './pages/TodayPage';
import { WorkersPage } from './pages/WorkersPage';
import { WorkerDetailPage } from './pages/WorkerDetailPage';
import { PipelinePage } from './pages/PipelinePage';
import { ReviewPage } from './pages/ReviewPage';
import { ResultsPage } from './pages/ResultsPage';
import { PlatformTenantsPage } from './pages/PlatformTenantsPage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { CreateWorkerModal } from './components/workers/CreateWorkerModal';
import { DocsModal } from './components/common/DocsModal';
import { AppFooter } from './components/layout/AppFooter';
import { FloatingVipContact } from './components/common/FloatingVipContact';
import { AlertCircle, CheckCircle, Info, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from './config/env';

const AppContent: React.FC = () => {
  const {
    currentRoute,
    navigateTo,
    notification,
    showCreateWorkerModal,
    setShowCreateWorkerModal,
    showDocsModal,
    setShowDocsModal,
    isMock,
    healthStatus,
    checkHealth,
  } = useApp();

  // Public Routes
  if (currentRoute === '/') {
    return (
      <>
        <LandingPage onNavigate={navigateTo} />
        <FloatingVipContact />
      </>
    );
  }

  if (currentRoute === '/login') {
    return <LoginPage onNavigate={navigateTo} />;
  }

  if (currentRoute === '/register') {
    return <RegisterPage onNavigate={navigateTo} />;
  }

  if (currentRoute === '/forgot-password') {
    return <ForgotPasswordPage onNavigate={navigateTo} />;
  }

  // Protected App Route Content Renderer
  const renderAppRoute = () => {
    // /platform/tenants (Super Admin Only)
    if (currentRoute.startsWith('/platform/tenants')) {
      return <PlatformTenantsPage />;
    }

    // /app or /app/ or /today
    if (currentRoute === '/app' || currentRoute === '/app/' || currentRoute === '/today') {
      return <TodayPage />;
    }

    // /app/workers or /app/workers/:workerId or legacy /workers
    if (currentRoute.startsWith('/app/workers') || currentRoute.startsWith('/workers')) {
      const cleanPath = currentRoute.split('?')[0];
      const parts = cleanPath.split('/');
      // E.g. ['', 'app', 'workers', 'WRK-001'] or ['', 'workers', 'WRK-001']
      const isAppPrefix = parts[1] === 'app';
      const idIdx = isAppPrefix ? 3 : 2;
      if (parts.length > idIdx && parts[idIdx]) {
        return <WorkerDetailPage />;
      }
      return <WorkersPage />;
    }

    // /app/pipeline or legacy /pipeline
    if (currentRoute.startsWith('/app/pipeline') || currentRoute.startsWith('/pipeline')) {
      return <PipelinePage />;
    }

    // /app/confirmations or /app/review or legacy /review
    if (
      currentRoute.startsWith('/app/confirmations') ||
      currentRoute.startsWith('/app/review') ||
      currentRoute.startsWith('/review')
    ) {
      return <ReviewPage />;
    }

    // /app/results or legacy /results
    if (currentRoute.startsWith('/app/results') || currentRoute.startsWith('/results')) {
      return <ResultsPage />;
    }

    return <TodayPage />;
  };

  // Protected Workforce OS Layout
  return (
    <ProtectedRoute fallbackRoute="/login" onRedirectToLogin={() => navigateTo('/login')}>
      <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
        {/* Top Navbar */}
        <Navbar />

        {/* Real Mode: Notice when API base URL is missing */}
        {!isMock && (!API_BASE_URL || API_BASE_URL.trim().length === 0) && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-950 px-4 py-3 text-xs">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">
                    Chưa cấu hình API Backend:
                  </span>{' '}
                  Chưa tìm thấy biến <code className="bg-amber-200/70 text-amber-950 border border-amber-300 px-1 py-0.5 rounded font-mono font-bold">VITE_API_BASE_URL</code> trong môi trường ứng dụng. Vui lòng kiểm tra lại cấu hình.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDocsModal(true)}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shrink-0"
              >
                XEM HƯỚNG DẪN CẤU HÌNH
              </button>
            </div>
          </div>
        )}

        {/* Real Mode: Strict Error State (Section 42: No auto fallback to Mock) */}
        {!isMock && Boolean(API_BASE_URL && API_BASE_URL.trim().length > 0) && healthStatus === 'error' && (
          <div className="bg-rose-50 border-b border-rose-200 text-rose-950 px-4 py-2.5 text-xs">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-semibold text-rose-900">
                  Mất kết nối dữ liệu Google Sheets của doanh nghiệp.
                </span>
                <span className="text-rose-700 hidden md:inline">
                  (Hệ thống tuân thủ nguyên tắc Real Data, không tự động chuyển sang dữ liệu giả lập)
                </span>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={checkHealth}
                  disabled={healthStatus === 'checking'}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shrink-0 flex items-center space-x-1"
                >
                  <RefreshCw className={`w-3 h-3 ${healthStatus === 'checking' ? 'animate-spin' : ''}`} />
                  <span>{healthStatus === 'checking' ? 'ĐANG THỬ LẠI...' : 'KẾT NỐI LẠI'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Notification Toast */}
        {notification && (
          <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-5 right-3 sm:right-5 z-50 max-w-md animate-in slide-in-from-bottom-5 duration-200">
            <div
              className={`p-4 rounded-xl shadow-lg border flex items-start space-x-3 ${
                notification.type === 'success'
                  ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
                  : notification.type === 'warning'
                  ? 'bg-amber-900 text-amber-100 border-amber-700'
                  : 'bg-slate-900 text-slate-100 border-slate-700'
              }`}
            >
              {notification.type === 'success' && (
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              {notification.type === 'warning' && (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              )}
              {notification.type === 'info' && (
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs font-medium leading-relaxed pr-2">
                <div>{notification.message}</div>
                {notification.action && (
                  <button
                    type="button"
                    onClick={notification.action.onClick}
                    className="mt-2 inline-flex items-center px-2.5 py-1 bg-white text-emerald-950 hover:bg-emerald-50 rounded-md font-bold text-[11px] shadow-xs cursor-pointer uppercase transition-colors"
                  >
                    {notification.action.label}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Page Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-8">
          {renderAppRoute()}
        </main>

        {/* Luxury Enterprise Footer */}
        <AppFooter onNavigate={navigateTo} />

        {/* Global Floating VIP Quick Contact */}
        <FloatingVipContact />

        {/* Global Modals */}
        <CreateWorkerModal
          isOpen={showCreateWorkerModal}
          onClose={() => setShowCreateWorkerModal(false)}
        />

        <DocsModal
          isOpen={showDocsModal}
          onClose={() => setShowDocsModal(false)}
        />
      </div>
    </ProtectedRoute>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}
