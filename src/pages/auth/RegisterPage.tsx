import React, { useState } from 'react';
import { signUpWithEmail, signInWithGoogle, sendVerificationEmail, getFriendlyAuthErrorMessage } from '../../services/auth';
import { realApi } from '../../services/api';
import { useAuth } from '../../auth/AuthProvider';
import { Mail, Lock, User, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, RefreshCw, Phone, Building2, HelpCircle, Eye, EyeOff } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (route: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { isAuthenticated } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [purpose, setPurpose] = useState('Khảo sát giải pháp Quản lý Điều hành Lao động Chuẩn VWW');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated && !registeredSuccess) {
      onNavigate('/app');
    }
  }, [isAuthenticated, registeredSuccess, onNavigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = fullName.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      setErrorMessage('Vui lòng nhập Họ và tên.');
      return;
    }
    if (!cleanEmail) {
      setErrorMessage('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    if (!cleanPhone) {
      setErrorMessage('Vui lòng nhập số điện thoại liên hệ.');
      return;
    }
    if (!password) {
      setErrorMessage('Vui lòng nhập mật khẩu.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Mật khẩu phải có tối thiểu 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      const regRes = await signUpWithEmail(cleanEmail, password, cleanName, {
        phone: cleanPhone,
        organization: organization.trim(),
        purpose,
      });

      // Synchronize lead registration data to Google Sheets
      try {
        await realApi.registerLead({
          fullName: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          organization: organization.trim() || 'Cá nhân trải nghiệm',
          purpose,
          uid: regRes.user.uid,
        });
      } catch (logErr) {
        console.warn('Could not sync registration to Google Sheets:', logErr);
      }

      setRegisteredSuccess(true);
    } catch (err: any) {
      const msg = getFriendlyAuthErrorMessage(err?.code || err?.message || '');
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setErrorMessage(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      onNavigate('/app');
    } catch (err: any) {
      const code = (err?.code || err?.message || '').toLowerCase();
      if (!code.includes('popup-closed-by-user') && !code.includes('cancelled')) {
        const msg = getFriendlyAuthErrorMessage(err?.code || err?.message || '');
        setErrorMessage(msg);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    setResendSuccess(false);
    try {
      await sendVerificationEmail();
      setResendSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể gửi lại email xác minh lúc này.');
    } finally {
      setResending(false);
    }
  };

  // Success Screen (Section 10)
  if (registeredSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 text-slate-100 selection:bg-blue-600 selection:text-white">
        <div className="w-full max-w-[440px] bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold tracking-widest text-emerald-400 uppercase">
                ĐĂNG KÝ THÀNH CÔNG
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                TÀI KHOẢN NGƯỜI XEM ĐÃ TẠO
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm pt-1">
                Tài khoản của bạn đã được ghi nhận với quyền <strong className="text-emerald-400">NGƯỜI XEM (CHỈ ĐỌC)</strong>. Vui lòng kiểm tra email <span className="text-slate-200 font-semibold">{email}</span> để xác minh tài khoản.
              </p>
            </div>
          </div>

          {resendSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Đã gửi lại email xác minh! Vui lòng kiểm tra hòm thư của bạn.</span>
            </div>
          )}

          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
            <p className="font-semibold text-slate-300">Quyền hạn tài khoản:</p>
            <p>• Phân quyền mặc định: <strong className="text-blue-400">Người xem (Chỉ đọc)</strong> để bảo vệ dữ liệu doanh nghiệp.</p>
            <p>• Để nâng cấp lên Quản lý / Tuyển dụng, vui lòng liên hệ Admin nền tảng.</p>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('/login')}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-blue-600/25"
            >
              <span>MỞ TRANG ĐĂNG NHẬP</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resending}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 cursor-pointer border border-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              <span>{resending ? 'ĐANG GỬI...' : 'GỬI LẠI EMAIL XÁC MINH'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl opacity-70" />
      </div>

      <div className="w-full max-w-[440px] bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
        {/* Brand & Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="flex items-center space-x-2 group cursor-pointer"
            title="Về trang giới thiệu"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-600/30 group-hover:bg-blue-500 transition-colors">
              FCS
            </div>
            <span className="font-extrabold text-white text-base tracking-tight group-hover:text-blue-400 transition-colors">
              FCS AI WORKFORCE OS
            </span>
          </button>

          <div className="pt-1">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Tạo tài khoản chuyên viên
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
              Trải nghiệm quy trình tự động hóa nhân sự từ hồ sơ đến Verified Working Worker.
            </p>
          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-start space-x-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Google Sign-up Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={googleLoading || loading}
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
            <span>{googleLoading ? 'ĐANG KẾT NỐI GOOGLE...' : 'ĐĂNG KÝ VỚI GOOGLE'}</span>
          </button>

          <div className="relative my-3.5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
              <span className="bg-slate-900 px-2 text-slate-500 font-semibold">
                HOẶC ĐĂNG KÝ BẰNG EMAIL
              </span>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">
              Họ và tên
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Nguyễn Văn An"
                disabled={loading}
                autoComplete="name"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs sm:text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50"
              />
            </div>
          </div>

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
                placeholder="email-cua-ban@company.com"
                disabled={loading}
                autoComplete="email"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs sm:text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Phone */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">
                Số điện thoại liên hệ *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="0912345678"
                  disabled={loading}
                  autoComplete="tel"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs sm:text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Organization */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">
                Tên Doanh nghiệp / Đơn vị
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={organization}
                  onChange={e => setOrganization(e.target.value)}
                  placeholder="Công ty Cung ứng ABC..."
                  disabled={loading}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs sm:text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Purpose of Account Creation */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300 flex items-center space-x-1">
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>Mục đích tạo tài khoản *</span>
            </label>
            <select
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50"
            >
              <option value="Khảo sát giải pháp Quản lý Điều hành Lao động Chuẩn VWW">
                Khảo sát giải pháp Quản lý Điều hành Lao động Chuẩn VWW
              </option>
              <option value="Doanh nghiệp tìm hiểu đăng ký bản quyền SaaS">
                Doanh nghiệp tìm hiểu đăng ký bản quyền SaaS riêng
              </option>
              <option value="Đơn vị tuyển dụng cần giải pháp đối soát & chấm công">
                Đơn vị tuyển dụng cần giải pháp đối soát & chấm công
              </option>
              <option value="Cá nhân tìm hiểu kiến trúc công nghệ & AI Automation">
                Cá nhân tìm hiểu kiến trúc công nghệ & AI Automation
              </option>
              <option value="Mục đích khác">Mục đích khác</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">
              Mật khẩu (tối thiểu 6 ký tự)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                autoComplete="new-password"
                className="w-full pl-9 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs sm:text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50"
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

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                autoComplete="new-password"
                className="w-full pl-9 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs sm:text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none cursor-pointer"
                title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Security & RBAC Policy Alert */}
          <div className="p-3 bg-blue-950/40 border border-blue-800/60 rounded-xl text-[11px] text-blue-200 space-y-1">
            <div className="font-bold flex items-center space-x-1 text-blue-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chính sách Bảo mật & Phân quyền Tài khoản</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Tài khoản đăng ký mới được cấp quyền <strong className="text-slate-200">NGƯỜI XEM (CHỈ ĐỌC - READ ONLY)</strong> để tham quan hệ thống. Doanh nghiệp cần quyền Quản trị/Quản lý vui lòng liên hệ Admin để phê duyệt.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-blue-600/25 mt-3"
          >
            <span>{loading ? 'ĐANG TẠO TÀI KHOẢN...' : 'TẠO TÀI KHOẢN NGƯỜI XEM'}</span>
          </button>
        </form>

        {/* Login link */}
        <div className="pt-2 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-400">
            Đã có tài khoản?{' '}
            <button
              type="button"
              onClick={() => onNavigate('/login')}
              className="text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider text-xs ml-1 cursor-pointer transition-colors"
            >
              ĐĂNG NHẬP
            </button>
          </p>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500/80" />
          <span>Bảo mật danh tính đa tầng chuẩn Doanh nghiệp</span>
        </div>
      </div>
    </div>
  );
};
