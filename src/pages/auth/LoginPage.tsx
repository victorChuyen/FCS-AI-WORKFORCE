import React, { useState } from 'react';
import { signInWithEmail, signInWithGoogle, getFriendlyAuthErrorMessage } from '../../services/auth';
import { useAuth } from '../../auth/AuthProvider';
import { 
  Mail, 
  Lock, 
  AlertCircle, 
  ShieldCheck, 
  LogIn, 
  Building2, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  ChevronUp, 
  UserCheck 
} from 'lucide-react';

interface LoginPageProps {
  onNavigate: (route: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showMobileAccounts, setShowMobileAccounts] = useState(false);
  const passwordInputRef = React.useRef<HTMLInputElement>(null);

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
      desc: 'Toàn quyền điều hành FCS & phê duyệt chi Cấp 4',
    },
    {
      email: 'accountant-fcs@breaths.live',
      role: 'ACCOUNTANT',
      title: 'Kế toán Đối soát & Hoa hồng (FCS 1)',
      badge: 'KẾ TOÁN',
      badgeColor: 'bg-teal-950/80 text-teal-200 border-teal-600/40',
      desc: 'Đối soát bảng công, tính hoa hồng & duyệt Cấp 3',
    },
    {
      email: 'manager-fcs@breaths.live',
      role: 'TENANT_MANAGER',
      title: 'Trưởng phòng Vận hành (FCS 1)',
      badge: 'MANAGER',
      badgeColor: 'bg-emerald-950/80 text-emerald-200 border-emerald-600/40',
      desc: 'Quản lý văn phòng, phân bổ xưởng & duyệt Cấp 2',
    },
    {
      email: 'field-fcs@breaths.live',
      role: 'FIELD_OFFICER',
      title: 'Cán bộ Hiện trường (FCS 1)',
      badge: 'HIỆN TRƯỜNG',
      badgeColor: 'bg-indigo-950/80 text-indigo-200 border-indigo-600/40',
      desc: 'Duyệt phỏng vấn tại xưởng & xác nhận lên xe đi làm',
    },
    {
      email: 'lead-fcs@breaths.live',
      role: 'LEADER_SALE',
      title: 'Trưởng nhóm Tuyển dụng (FCS 1)',
      badge: 'LEADER SALE',
      badgeColor: 'bg-cyan-950/80 text-cyan-200 border-cyan-600/40',
      desc: 'Chia data C3 -> L1 cho team & duyệt hoa hồng Cấp 1',
    },
    {
      email: 'staff-fcs@breaths.live',
      role: 'RECRUITER',
      title: 'Chuyên viên Tuyển dụng (FCS 1)',
      badge: 'RECRUITER',
      badgeColor: 'bg-amber-950/80 text-amber-200 border-amber-600/40',
      desc: 'Tư vấn L1.1 - L1.7 & hẹn phỏng vấn L2 (khóa export)',
    },
    {
      email: 'mkt-fcs@breaths.live',
      role: 'MARKETING',
      title: 'Chuyên viên Marketing / Ads (FCS 1)',
      badge: 'MARKETING',
      badgeColor: 'bg-rose-950/80 text-rose-200 border-rose-600/40',
      desc: 'Tiếp nhận Data C3 từ Ads, lọc số trùng & số rác',
    },
  ];

  const selectAccountIntoForm = (targetEmail: string) => {
    setEmail(targetEmail);
    setPassword('');
    // Focus password input for security compliance
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 100);
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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-3 sm:px-6 py-6 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Background glow decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl opacity-70" />
        <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="w-full max-w-[940px] bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12">
          
          {/* ========================================================= */}
          {/* CỘT 1 (FORM CHÍNH): ĐƯA EMAIL & PASS LÊN ĐẦU TIÊN KHÔNG CẦN CUỘN */}
          {/* ========================================================= */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-4">
            <div>
              {/* Brand & Header */}
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => onNavigate('/')}
                  className="flex items-center space-x-2.5 group cursor-pointer"
                  title="Về trang giới thiệu"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-600/30 group-hover:bg-blue-500 transition-colors">
                    FCS
                  </div>
                  <div className="text-left">
                    <span className="block font-black text-white text-sm tracking-tight group-hover:text-blue-400 transition-colors">
                      FCS AI WORKFORCE OS
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center space-x-1">
                      <Building2 className="w-3 h-3 text-blue-400" />
                      <span>Tenant: FCS-000001 (Pilot Corp)</span>
                    </span>
                  </div>
                </button>

                <div className="hidden sm:flex items-center space-x-1 text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Chuẩn VWW</span>
                </div>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Đăng nhập hệ thống
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Nhập email và mật khẩu để truy cập CRM V2 & điều phối 19 Level Sale.
                </p>
              </div>

              {/* Error notification */}
              {errorMessage && (
                <div className="mt-3 p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-start space-x-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {/* Email & Password Form - NGAY TRÊN ĐẦU TIÊN */}
              <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
                <div className="space-y-1">
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
                      placeholder="Nhập email (ví dụ: coach.chuyen@gmail.com)"
                      disabled={loading}
                      autoComplete="email"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs sm:text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
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
                      ref={passwordInputRef}
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu của bạn"
                      disabled={loading}
                      autoComplete="current-password"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs sm:text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none cursor-pointer"
                      title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-blue-600/25 mt-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loading ? 'ĐANG XÁC THỰC BẢO MẬT...' : 'ĐĂNG NHẬP BẢO MẬT'}</span>
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                  <span className="bg-slate-900 px-2 text-slate-500 font-semibold">
                    HOẶC DÙNG TÀI KHOẢN GOOGLE
                  </span>
                </div>
              </div>

              {/* Google Sign-in Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
                className="w-full py-2.5 px-4 bg-slate-800/80 hover:bg-slate-700/80 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2.5 cursor-pointer border border-slate-700 shadow-sm"
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

              {/* Mobile Quick-fill Toggle Button (< md) */}
              <div className="md:hidden mt-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowMobileAccounts(!showMobileAccounts)}
                  className="w-full py-2 px-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center space-x-2">
                    <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>⚡ Chọn nhanh tài khoản trải nghiệm (8 vai trò)</span>
                  </span>
                  {showMobileAccounts ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>

            {/* Register link & Security */}
            <div className="pt-3 border-t border-slate-800/80 text-center space-y-1.5">
              <p className="text-xs text-slate-400">
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('/register')}
                  className="text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider text-xs ml-1 cursor-pointer transition-colors"
                >
                  ĐĂNG KÝ NGAY
                </button>
              </p>
              <div className="flex items-center justify-center space-x-1.5 text-[10px] text-slate-500">
                <ShieldCheck className="w-3 h-3 text-blue-500/80" />
                <span>Bảo mật đa tầng • Cô lập dữ liệu Doanh nghiệp • Chuẩn VWW</span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* CỘT 2: TÀI KHOẢN MẪU PHÂN QUYỀN (SIDEBAR TRÊN PC, COLLAPSIBLE TRÊN MOBILE) */}
          {/* ========================================================= */}
          <div className={`md:col-span-5 bg-slate-950/70 p-5 sm:p-6 border-t md:border-t-0 md:border-l border-slate-800/80 flex flex-col justify-between ${showMobileAccounts ? 'block' : 'hidden md:flex'}`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center space-x-1.5 text-xs font-black uppercase text-blue-300 tracking-wide">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tài khoản trải nghiệm</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                  FCS-000001
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Bấm để điền nhanh Email vai trò vào form bên trái. Mật khẩu được bảo mật nội bộ và cung cấp theo phân quyền.
              </p>

              <div className="space-y-1.5 max-h-[380px] md:max-h-[420px] overflow-y-auto pr-1">
                {pilotAccounts.map(acc => {
                  const isSelected = email === acc.email;
                  return (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => selectAccountIntoForm(acc.email)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-blue-950/50 border-blue-500/60 ring-1 ring-blue-500/30'
                          : 'bg-slate-900/90 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/60'
                      }`}
                      title="Bấm để chọn email này"
                    >
                      <div className="flex-1 min-w-0 pr-1.5">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold text-slate-100 truncate">
                            {acc.title}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span className={`px-1 py-0.2 rounded text-[8px] font-black border uppercase tracking-wider shrink-0 ${acc.badgeColor}`}>
                            {acc.badge}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 truncate">
                            {acc.email}
                          </span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 border transition-colors ${
                        isSelected 
                          ? 'bg-blue-600 text-white border-blue-500' 
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}>
                        {isSelected ? 'Đã chọn' : 'Chọn'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-900 text-center">
              <span className="text-[10px] text-slate-500">
                Hỗ trợ 8 phân quyền doanh nghiệp độc lập
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
