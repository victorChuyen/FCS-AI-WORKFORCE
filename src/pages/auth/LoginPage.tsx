import React, { useState } from 'react';
import { signInWithEmail, signInWithGoogle, getFriendlyAuthErrorMessage } from '../../services/auth';
import { useAuth } from '../../auth/AuthProvider';
import { Mail, Lock, AlertCircle, ShieldCheck, LogIn, Sparkles, CheckCircle2, Building2 } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (route: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { isAuthenticated, loginWithPreset } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [presetLoadingEmail, setPresetLoadingEmail] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated, redirect to /app
  React.useEffect(() => {
    if (isAuthenticated) {
      onNavigate('/app');
    }
  }, [isAuthenticated, onNavigate]);

  const pilotAccounts = [
    {
      email: 'coach.chuyen@gmail.com',
      role: 'PLATFORM_SUPER_ADMIN',
      title: 'Coach Chuyên (Super Admin)',
      badge: 'SUPER ADMIN',
      badgeColor: 'bg-purple-950/80 text-purple-200 border-purple-600/40',
      desc: 'Toàn quyền nền tảng SaaS & tất cả khách hàng',
    },
    {
      email: 'ceo-fcs@breaths.live',
      role: 'TENANT_ADMIN',
      title: 'Giám đốc Điều hành (CEO FCS 1)',
      badge: 'TENANT ADMIN',
      badgeColor: 'bg-blue-950/80 text-blue-200 border-blue-600/40',
      desc: 'Toàn quyền điều hành FCS Pilot Workforce Corp',
    },
    {
      email: 'manager-fcs@breaths.live',
      role: 'TENANT_MANAGER',
      title: 'Trưởng phòng Vận hành (FCS 1)',
      badge: 'MANAGER',
      badgeColor: 'bg-emerald-950/80 text-emerald-200 border-emerald-600/40',
      desc: 'Quản lý văn phòng, phân bổ xưởng & đối soát VWW',
    },
    {
      email: 'staff-fcs@breaths.live',
      role: 'RECRUITER',
      title: 'Chuyên viên Tuyển dụng (FCS 1)',
      badge: 'RECRUITER',
      badgeColor: 'bg-amber-950/80 text-amber-200 border-amber-600/40',
      desc: 'Nhập liệu hồ sơ lao động & đặt lịch phỏng vấn',
    },
  ];

  const handle1ClickLogin = async (targetEmail: string) => {
    setErrorMessage(null);
    setPresetLoadingEmail(targetEmail);
    try {
      await loginWithPreset(targetEmail);
      onNavigate('/app');
    } catch (err: any) {
      setErrorMessage(getFriendlyAuthErrorMessage(err?.message || ''));
    } finally {
      setPresetLoadingEmail(null);
    }
  };

  const selectAccountIntoForm = (targetEmail: string) => {
    setEmail(targetEmail);
    setPassword('Fcs@2026!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Vui lòng nhập địa chỉ email.');
      return;
    }
    if (!password) {
      setErrorMessage('Vui lòng nhập mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(cleanEmail, password);
      onNavigate('/app');
    } catch (err: any) {
      const msg = getFriendlyAuthErrorMessage(err?.code || err?.message || '');
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      onNavigate('/app');
    } catch (err: any) {
      const code = (err?.code || err?.message || '').toLowerCase();
      if (code.includes('popup-closed-by-user') || code.includes('cancelled')) {
        // user closed popup
      } else {
        const msg = getFriendlyAuthErrorMessage(err?.code || err?.message || '');
        setErrorMessage(msg);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Background glow decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl opacity-70" />
        <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="w-full max-w-[500px] bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Brand & Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="flex items-center space-x-2 group cursor-pointer"
            title="Về trang giới thiệu"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/30 group-hover:bg-blue-500 transition-colors">
              FCS
            </div>
            <div className="text-left">
              <span className="block font-black text-white text-base tracking-tight group-hover:text-blue-400 transition-colors">
                FCS AI WORKFORCE OS
              </span>
              <span className="text-[10px] text-slate-400 font-mono flex items-center space-x-1">
                <Building2 className="w-3 h-3 text-blue-400" />
                <span>Tenant: FCS-000001 (Pilot Corp)</span>
              </span>
            </div>
          </button>

          <div className="pt-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Đăng nhập hệ thống
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
              Hệ thống quản trị và kiểm định nhân lực độc lập theo chuẩn <strong className="text-emerald-300">VWW</strong>.
            </p>
          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-start space-x-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* 1-Click Fast Login for Authorized Accounts */}
        <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/90 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center space-x-1.5 text-xs font-black uppercase text-blue-300 tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>4 Tài khoản kiểm thử nhanh (1-Click)</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">FCS-000001</span>
          </div>

          <div className="space-y-2">
            {pilotAccounts.map(acc => {
              const isCurrentLoading = presetLoadingEmail === acc.email;
              return (
                <div
                  key={acc.email}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-colors gap-2"
                >
                  <button
                    type="button"
                    onClick={() => selectAccountIntoForm(acc.email)}
                    className="flex-1 text-left min-w-0 cursor-pointer group"
                    title="Bấm để điền email và mật khẩu vào form"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-100 group-hover:text-blue-300 transition-colors truncate">
                        {acc.title}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-black border uppercase tracking-wider ${acc.badgeColor}`}>
                        {acc.badge}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                      {acc.email}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handle1ClickLogin(acc.email)}
                    disabled={Boolean(presetLoadingEmail) || loading || googleLoading}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-black transition-all cursor-pointer shrink-0 shadow-sm flex items-center space-x-1.5"
                    title={`Đăng nhập tức thì với vai trò ${acc.badge}`}
                  >
                    {isCurrentLoading ? (
                      <span>Đang vào...</span>
                    ) : (
                      <>
                        <LogIn className="w-3 h-3" />
                        <span>Đăng nhập</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Google Sign-in Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading || Boolean(presetLoadingEmail)}
            className="w-full py-2.5 px-4 bg-slate-800/90 hover:bg-slate-700/90 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-3 cursor-pointer border border-slate-700 shadow-sm"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{googleLoading ? 'ĐANG KẾT NỐI GOOGLE...' : 'TIẾP TỤC VỚI GOOGLE'}</span>
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
              <span className="bg-slate-900 px-2 text-slate-500 font-semibold">
                HOẶC DÙNG EMAIL & MẬT KHẨU
              </span>
            </div>
          </div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="manager-fcs@breaths.live"
                disabled={loading || Boolean(presetLoadingEmail)}
                autoComplete="email"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs sm:text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">
                Mật khẩu
              </label>
              <button
                type="button"
                onClick={() => onNavigate('/forgot-password')}
                className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                Quên mật khẩu?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading || Boolean(presetLoadingEmail)}
                autoComplete="current-password"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs sm:text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading || Boolean(presetLoadingEmail)}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-blue-600/25 mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP HỆ THỐNG'}</span>
          </button>
        </form>

        {/* Register link */}
        <div className="pt-2 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-400">
            Chưa có tài khoản?{' '}
            <button
              type="button"
              onClick={() => onNavigate('/register')}
              className="text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider text-xs ml-1 cursor-pointer transition-colors"
            >
              ĐĂNG KÝ
            </button>
          </p>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500/80" />
          <span>Bảo mật Firebase Auth • Tenant FCS-000001 • Chuẩn VWW</span>
        </div>
      </div>
    </div>
  );
};

