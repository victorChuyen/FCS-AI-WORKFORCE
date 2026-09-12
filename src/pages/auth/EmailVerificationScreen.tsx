import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { Mail, CheckCircle2, AlertCircle, RefreshCw, LogOut } from 'lucide-react';

interface EmailVerificationScreenProps {
  onVerified?: () => void;
  onLogout?: () => void;
}

export const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({
  onVerified,
  onLogout,
}) => {
  const { user, refreshUser, sendVerificationEmail, logout } = useAuth();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleResend = async () => {
    setResending(true);
    setNotice(null);
    try {
      await sendVerificationEmail();
      setNotice({
        type: 'success',
        message: 'Đã gửi lại email xác minh! Vui lòng kiểm tra hộp thư đến (và thư mục Spam).',
      });
    } catch (err: any) {
      setNotice({
        type: 'error',
        message: err.message || 'Không thể gửi lại email xác minh. Vui lòng thử lại sau.',
      });
    } finally {
      setResending(false);
    }
  };

  const handleCheckAgain = async () => {
    setChecking(true);
    setNotice(null);
    try {
      const refreshed = await refreshUser();
      if (refreshed?.emailVerified) {
        setNotice({
          type: 'success',
          message: 'Tài khoản đã được xác minh thành công! Đang chuyển tiếp...',
        });
        if (onVerified) {
          setTimeout(() => onVerified(), 800);
        }
      } else {
        setNotice({
          type: 'error',
          message: 'Hệ thống chưa nhận được xác minh. Bạn hãy bấm vào liên kết trong email và thử lại.',
        });
      }
    } catch {
      setNotice({
        type: 'error',
        message: 'Không thể kiểm tra trạng thái xác minh. Vui lòng thử lại.',
      });
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    if (onLogout) onLogout();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 text-slate-100 selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Brand Icon */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Mail className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold tracking-widest text-amber-400 uppercase">
              XÁC THỰC BẢO MẬT FCS
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Email chưa được xác minh
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Tài khoản <span className="font-semibold text-slate-200">{user?.email}</span> cần được xác minh trước khi truy cập hệ thống điều hành nhân lực FCS AI WORKFORCE OS.
            </p>
          </div>
        </div>

        {notice && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-start space-x-2.5 border ${
              notice.type === 'success'
                ? 'bg-emerald-950/70 border-emerald-800 text-emerald-200'
                : 'bg-rose-950/70 border-rose-800 text-rose-200'
            }`}
          >
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed">{notice.message}</span>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 text-xs text-slate-400 space-y-2">
          <p className="font-medium text-slate-300">Hướng dẫn nhanh:</p>
          <ol className="list-decimal list-inside space-y-1 text-slate-400">
            <li>Mở hộp thư đến của email <span className="text-slate-200 font-mono">{user?.email}</span></li>
            <li>Bấm vào liên kết xác minh được gửi từ Firebase / FCS</li>
            <li>Quay lại màn hình này và bấm <span className="text-slate-200 font-bold">"Tôi đã xác minh — Kiểm tra lại"</span></li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleCheckAgain}
            disabled={checking}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-blue-600/20"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'ĐANG KIỂM TRA...' : 'TÔI ĐÃ XÁC MINH — KIỂM TRA LẠI'}</span>
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 cursor-pointer border border-slate-700"
          >
            <Mail className="w-4 h-4" />
            <span>{resending ? 'ĐANG GỬI LẠI...' : 'GỬI LẠI EMAIL XÁC MINH'}</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2 px-4 text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>ĐĂNG XUẤT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
