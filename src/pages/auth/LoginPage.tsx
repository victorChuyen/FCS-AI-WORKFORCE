import React, { useState } from 'react';
import { signInWithEmail, signInWithGoogle, getFriendlyAuthErrorMessage } from '../../services/auth';
import { useAuth } from '../../auth/AuthProvider';
import { Mail, Lock, AlertCircle, ShieldCheck, LogIn, Building2 } from 'lucide-react';

interface LoginPageProps { onNavigate: (route: string) => void; }
export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { isAuthenticated, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const busy = loading || googleLoading;
  React.useEffect(() => { if (isAuthenticated) onNavigate('/app'); }, [isAuthenticated, onNavigate]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErrorMessage(null);
    if (!email.trim() || !password) { setErrorMessage(getFriendlyAuthErrorMessage('auth/credentials-required')); return; }
    setLoading(true);
    try { await signInWithEmail(email.trim(), password); }
    catch (err: any) { setErrorMessage(getFriendlyAuthErrorMessage(err?.code || err?.message || '')); }
    finally { setLoading(false); }
  };
  const handleGoogleLogin = async () => {
    setErrorMessage(null); setGoogleLoading(true);
    try { await signInWithGoogle(); }
    catch (err: any) { setErrorMessage(getFriendlyAuthErrorMessage(err?.code || err?.message || '')); }
    finally { setGoogleLoading(false); }
  };
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 text-slate-100 selection:bg-blue-600 selection:text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl opacity-70" />
        <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl opacity-50" />
      </div>
      <div className="w-full max-w-[500px] bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <button type="button" onClick={() => onNavigate('/')} className="flex items-center space-x-2 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/30 group-hover:bg-blue-500 transition-colors">FCS</div>
            <div className="text-left">
              <span className="block font-black text-white text-base tracking-tight group-hover:text-blue-400 transition-colors">FCS AI WORKFORCE OS</span>
              <span className="text-[10px] text-slate-400 font-mono flex items-center space-x-1"><Building2 className="w-3 h-3 text-blue-400" /><span>Workforce Core</span></span>
            </div>
          </button>
          <div className="pt-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">{'\u0110\u0103ng nh\u1eadp h\u1ec7 th\u1ed1ng'}</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">{'S\u1eed d\u1ee5ng t\u00e0i kho\u1ea3n c\u00e1 nh\u00e2n \u0111\u00e3 \u0111\u01b0\u1ee3c c\u1ea5p quy\u1ec1n.'}</p>
          </div>
        </div>
        {(errorMessage || !isConfigured) && (
          <div role="alert" className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage || getFriendlyAuthErrorMessage('auth/configuration-missing')}</span>
          </div>
        )}
        {/* No preset accounts, prefilled passwords or identity shortcuts. */}
        <div>
          <button type="button" onClick={handleGoogleLogin} disabled={busy || !isConfigured} className="w-full py-2.5 px-4 bg-slate-800/90 hover:bg-slate-700/90 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-3 cursor-pointer border border-slate-700 shadow-sm">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{googleLoading ? '\u0110ANG K\u1ebeT N\u1ed0I GOOGLE...' : 'TI\u1ebeP T\u1ee4C V\u1edaI GOOGLE'}</span>
          </button>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider"><span className="bg-slate-900 px-2 text-slate-500 font-semibold">{'HO\u1eb6C D\u00d9NG EMAIL & M\u1eacT KH\u1ea8U'}</span></div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="fcs-login-email" className="block text-xs font-semibold text-slate-300">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><Mail className="w-4 h-4" /></div>
              <input id="fcs-login-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="email@company.com" disabled={busy || !isConfigured} autoComplete="email" className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs sm:text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="fcs-login-password" className="block text-xs font-semibold text-slate-300">{'M\u1eadt kh\u1ea9u'}</label>
              <button type="button" onClick={() => onNavigate('/forgot-password')} className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">{'Qu\u00ean m\u1eadt kh\u1ea9u?'}</button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><Lock className="w-4 h-4" /></div>
              <input id="fcs-login-password" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="********" disabled={busy || !isConfigured} autoComplete="current-password" className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs sm:text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50" />
            </div>
          </div>
          <button type="submit" disabled={busy || !isConfigured} className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-blue-600/25 mt-2"><LogIn className="w-4 h-4" /><span>{loading ? '\u0110ANG \u0110\u0102NG NH\u1eacP...' : '\u0110\u0102NG NH\u1eacP H\u1ec6 TH\u1ed0NG'}</span></button>
        </form>
        <div className="pt-2 border-t border-slate-800/80 text-center"><p className="text-xs text-slate-400">{'Ch\u01b0a c\u00f3 t\u00e0i kho\u1ea3n? '}
          <button type="button" onClick={() => onNavigate('/register')} className="text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider text-xs ml-1 cursor-pointer transition-colors">{'\u0110\u0102NG K\u00dd'}</button>
        </p></div>
        <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-500"><ShieldCheck className="w-3.5 h-3.5 text-blue-500/80" /><span>Firebase Authentication</span></div>
      </div>
    </div>
  );
};
