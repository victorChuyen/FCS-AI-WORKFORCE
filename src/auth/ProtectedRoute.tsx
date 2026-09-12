import React, { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { EmailVerificationScreen } from '../pages/auth/EmailVerificationScreen';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onRedirectToLogin?: () => void;
  fallbackRoute?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  onRedirectToLogin,
  fallbackRoute = '/login',
}) => {
  const { user, loading, isAuthenticated } = useAuth();

  // Redirect to login when authentication check completes and user is unauthenticated
  useEffect(() => {
    if (!loading && (!isAuthenticated || !user)) {
      if (onRedirectToLogin) {
        onRedirectToLogin();
      } else if (typeof window !== 'undefined' && window.location.pathname !== fallbackRoute) {
        window.history.pushState(null, '', fallbackRoute);
      }
    }
  }, [loading, isAuthenticated, user, onRedirectToLogin, fallbackRoute]);

  // 1. Auth Loading UI (Section 19): Clean premium loading screen with FCS logo
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100 selection:bg-blue-600 selection:text-white">
        <div className="flex flex-col items-center space-y-4 animate-in fade-in duration-300">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-600/30 tracking-wider">
            FCS
          </div>
          <div className="flex items-center space-x-2.5 text-xs sm:text-sm text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            <span>Đang xác thực tài khoản...</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Not Authenticated: render null while useEffect handles redirect
  if (!isAuthenticated || !user) {
    return null;
  }

  // 3. Email verification required only for non-whitelisted external accounts
  const isWhitelisted =
    Boolean(user.isSuperAdmin) ||
    user.email === 'coach.chuyen@gmail.com' ||
    user.email.endsWith('@breaths.live') ||
    user.email.includes('fcs');

  if (user.emailVerified === false && !isWhitelisted) {
    return (
      <EmailVerificationScreen
        onVerified={() => {}}
        onLogout={onRedirectToLogin || (() => {
          if (typeof window !== 'undefined') window.history.pushState(null, '', fallbackRoute);
        })}
      />
    );
  }

  // 4. Authenticated & verified: render protected FCS app
  return <>{children}</>;
};
