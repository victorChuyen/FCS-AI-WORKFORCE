import React, { useState } from 'react';
import { sendPasswordReset, getFriendlyAuthErrorMessage } from '../../services/auth';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react';

interface ForgotPasswordPageProps {
  onNavigate: (route: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Vui lòng nhập email đăng ký tài khoản.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordReset(cleanEmail);
      setSuccess(true);
    } catch (err: any) {
      const msg = getFriendlyAuthErrorMessage(err?.code || err?.message || '');
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Background glow decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl opacity-70" />
      </div>

      <div className="w-full max-w-[420px] bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <KeyRound className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Quên mật khẩu
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xs leading-relaxed">
              Nhập email để nhận liên kết khôi phục mật khẩu tài khoản FCS.
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

        {/* Success notification */}
        {success ? (
          <div className="space-y-4 animate-in zoom-in-95 duration-200">
            <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs space-y-2">
              <div className="flex items-center space-x-2 font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Đã gửi hướng dẫn đặt lại mật khẩu.</span>
              </div>
              <p className="leading-relaxed text-slate-300">
                Vui lòng kiểm tra hộp thư của bạn ({email}). Làm theo hướng dẫn trong email để tiến hành đặt mật khẩu mới.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/login')}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-blue-600/25"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>QUAY LẠI ĐĂNG NHẬP</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Email đã đăng ký
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
                  disabled={loading}
                  autoComplete="email"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs sm:text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-blue-600/25"
            >
              <span>{loading ? 'ĐANG GỬI LIÊN KẾT...' : 'GỬI LINK ĐẶT LẠI MẬT KHẨU'}</span>
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => onNavigate('/login')}
                className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại Đăng nhập</span>
              </button>
            </div>
          </form>
        )}

        <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500/80" />
          <span>FCS AI WORKFORCE OS Security</span>
        </div>
      </div>
    </div>
  );
};
