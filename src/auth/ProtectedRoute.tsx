import React, { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { EmailVerificationScreen } from '../pages/auth/EmailVerificationScreen';
interface ProtectedRouteProps { children: React.ReactNode; onRedirectToLogin?: () => void; fallbackRoute?: string; }
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, onRedirectToLogin, fallbackRoute = '/login' }) => {
  const { user, loading, isAuthenticated } = useAuth();
  useEffect(() => {
    if (!loading && (!isAuthenticated || !user)) {
      if (onRedirectToLogin) onRedirectToLogin();
      else if (typeof window !== 'undefined' && window.location.pathname !== fallbackRoute) window.history.pushState(null, '', fallbackRoute);
    }
  }, [loading, isAuthenticated, user, onRedirectToLogin, fallbackRoute]);
  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100">
      <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-2xl">FCS</div>
      <p className="mt-4 text-sm text-slate-400">{'\u0110ang x\u00e1c th\u1ef1c t\u00e0i kho\u1ea3n...'}</p>
    </div>
  );
  if (!isAuthenticated || !user || !user.tenantId) return null;
  if (user.emailVerified !== true) return (
    <EmailVerificationScreen onVerified={() => {}} onLogout={onRedirectToLogin || (() => {
      if (typeof window !== 'undefined') window.history.pushState(null, '', fallbackRoute);
    })} />
  );
  return <>{children}</>;
};
