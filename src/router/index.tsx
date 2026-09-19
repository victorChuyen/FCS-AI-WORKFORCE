import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, useNavigate, useLocation, useRouteError } from 'react-router-dom';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { AppLayout } from './AppLayout';
import { PublicLayout } from './PublicLayout';

// Helper component to preserve query params (e.g. ?tab=...&status=...) across redirects
const RedirectPreservingSearch: React.FC<{ to: string }> = ({ to }) => {
  const location = useLocation();
  return <Navigate to={`${to}${location.search}`} replace />;
};

/**
 * Tự động bắt lỗi ChunkLoadError khi hệ thống vừa deploy phiên bản mới trên Cloudflare
 * Nếu phát hiện mã hash của chunk bị thay đổi, tự động reload trang để tải mã nguồn mới nhất.
 */
function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ [key: string]: any }>,
  exportName: string = 'default'
) {
  return lazy(async () => {
    try {
      const module = await factory();
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('fcs_chunk_reload');
      }
      if (exportName in module) {
        return { default: module[exportName] };
      }
      if ('default' in module) {
        return { default: module.default };
      }
      const firstExport = Object.values(module)[0];
      return { default: firstExport };
    } catch (error: any) {
      const isChunkError =
        error?.message?.includes('Failed to fetch dynamically imported module') ||
        error?.message?.includes('Importing a module script failed') ||
        error?.name === 'ChunkLoadError';

      if (isChunkError && typeof window !== 'undefined') {
        const hasReloaded = sessionStorage.getItem('fcs_chunk_reload');
        if (!hasReloaded) {
          sessionStorage.setItem('fcs_chunk_reload', 'true');
          window.location.reload();
          return new Promise<{ default: T }>(() => {});
        }
      }
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('fcs_chunk_reload');
      }
      throw error;
    }
  });
}

// Error Boundary thân thiện thay thế cho màn hình đen mặc định của React Router
export const RouteErrorBoundary: React.FC = () => {
  const error: any = useRouteError();
  const errorMsg = error?.message || (typeof error === 'string' ? error : JSON.stringify(error));
  console.error('[RouteErrorBoundary caught]:', error);

  return (
    <div className="flex items-center justify-center min-h-[70vh] p-6 text-center">
      <div className="max-w-md p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4 text-slate-200">
        <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto">
          <RefreshCw className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="text-lg font-bold text-white tracking-tight">Hệ Thống Có Bản Cập Nhật Mới</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Giao diện và tính năng hệ thống vừa được nâng cấp trên đám mây. Vui lòng bấm nút bên dưới để tải lại phiên bản mới nhất.
        </p>
        {errorMsg && (
          <div className="p-2 bg-rose-950/60 border border-rose-800/60 rounded-lg text-[11px] text-rose-300 font-mono text-left max-h-32 overflow-y-auto">
            {errorMsg}
          </div>
        )}
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('fcs_chunk_reload');
              window.location.reload();
            }
          }}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-blue-600/25 flex items-center justify-center space-x-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>TẢI LẠI PHIÊN BẢN MỚI</span>
        </button>
      </div>
    </div>
  );
};

// Lazy-loaded pages with automatic deployment retry
const LandingPage = lazyWithRetry(() => import('../pages/LandingPage'), 'LandingPage');
const LoginPage = lazyWithRetry(() => import('../pages/auth/LoginPage'), 'LoginPage');
const RegisterPage = lazyWithRetry(() => import('../pages/auth/RegisterPage'), 'RegisterPage');
const ForgotPasswordPage = lazyWithRetry(() => import('../pages/auth/ForgotPasswordPage'), 'ForgotPasswordPage');
const TodayPage = lazyWithRetry(() => import('../pages/TodayPage'), 'TodayPage');
const WorkersPage = lazyWithRetry(() => import('../pages/WorkersPage'), 'WorkersPage');
const WorkerDetailPage = lazyWithRetry(() => import('../pages/WorkerDetailPage'), 'WorkerDetailPage');
const PipelinePage = lazyWithRetry(() => import('../pages/PipelinePage'), 'PipelinePage');
const ReviewPage = lazyWithRetry(() => import('../pages/ReviewPage'), 'ReviewPage');
const ResultsPage = lazyWithRetry(() => import('../pages/ResultsPage'), 'ResultsPage');
const PlatformTenantsPage = lazyWithRetry(() => import('../pages/PlatformTenantsPage'), 'PlatformTenantsPage');
const ExcelGridPage = lazyWithRetry(() => import('../pages/ExcelGridPage'), 'ExcelGridPage');

const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center space-y-3">
      <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-sm text-slate-500">Đang tải...</p>
    </div>
  </div>
);

// SPA Navigable Wrappers
const NavLanding: React.FC = () => {
  const navigate = useNavigate();
  return <LandingPage onNavigate={navigate} />;
};

const NavLogin: React.FC = () => {
  const navigate = useNavigate();
  return <LoginPage onNavigate={navigate} />;
};

const NavRegister: React.FC = () => {
  const navigate = useNavigate();
  return <RegisterPage onNavigate={navigate} />;
};

const NavForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  return <ForgotPasswordPage onNavigate={navigate} />;
};

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: '/',
        element: (
          <Suspense fallback={<PageLoader />}>
            <NavLanding />
          </Suspense>
        ),
      },
      {
        path: '/login',
        element: (
          <Suspense fallback={<PageLoader />}>
            <NavLogin />
          </Suspense>
        ),
      },
      {
        path: '/register',
        element: (
          <Suspense fallback={<PageLoader />}>
            <NavRegister />
          </Suspense>
        ),
      },
      {
        path: '/forgot-password',
        element: (
          <Suspense fallback={<PageLoader />}>
            <NavForgotPassword />
          </Suspense>
        ),
      },
    ],
  },
  {
    element: <AppLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: '/app',
        element: (
          <Suspense fallback={<PageLoader />}>
            <TodayPage />
          </Suspense>
        ),
      },
      {
        path: '/today',
        element: <RedirectPreservingSearch to="/app" />,
      },
      {
        path: '/app/grid',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ExcelGridPage />
          </Suspense>
        ),
      },
      {
        path: '/grid',
        element: <RedirectPreservingSearch to="/app/grid" />,
      },
      {
        path: '/app/workers',
        element: (
          <Suspense fallback={<PageLoader />}>
            <WorkersPage />
          </Suspense>
        ),
      },
      {
        path: '/workers',
        element: <RedirectPreservingSearch to="/app/workers" />,
      },
      {
        path: '/app/workers/:workerId',
        element: (
          <Suspense fallback={<PageLoader />}>
            <WorkerDetailPage />
          </Suspense>
        ),
      },
      {
        path: '/workers/:workerId',
        element: (
          <Suspense fallback={<PageLoader />}>
            <WorkerDetailPage />
          </Suspense>
        ),
      },
      {
        path: '/app/pipeline',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PipelinePage />
          </Suspense>
        ),
      },
      {
        path: '/pipeline',
        element: <RedirectPreservingSearch to="/app/pipeline" />,
      },
      {
        path: '/app/confirmations',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ReviewPage />
          </Suspense>
        ),
      },
      {
        path: '/app/review',
        element: <RedirectPreservingSearch to="/app/confirmations" />,
      },
      {
        path: '/confirmations',
        element: <RedirectPreservingSearch to="/app/confirmations" />,
      },
      {
        path: '/review',
        element: <RedirectPreservingSearch to="/app/confirmations" />,
      },
      {
        path: '/app/results',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ResultsPage />
          </Suspense>
        ),
      },
      {
        path: '/results',
        element: <RedirectPreservingSearch to="/app/results" />,
      },
      {
        path: '/platform/tenants',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PlatformTenantsPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default router;
