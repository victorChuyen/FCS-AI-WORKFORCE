import React from 'react';
import {
  ShieldCheck,
  Calendar,
  Phone,
  MessageSquare,
  ExternalLink,
  Sparkles,
  Database,
  CheckCircle2,
  Lock,
  Headphones,
  Zap,
} from 'lucide-react';

interface AppFooterProps {
  onNavigate?: (route: string) => void;
}

export const AppFooter: React.FC<AppFooterProps> = ({ onNavigate }) => {
  return (
    <footer className="mt-auto bg-slate-950 text-slate-400 border-t border-slate-800/80 pt-10 pb-20 md:pb-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top VIP Consultation Callout Banner */}
        <div className="mb-10 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-950/80 via-indigo-950/60 to-slate-900 border border-blue-800/40 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-1.5 relative z-10">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>VIP Founder Advisory</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">• Tư vấn chiến lược 1:1</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Cần Tối Ưu Hệ Thống Hoặc Đặt Hàng Tính Năng Riêng?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Kết nối trực tiếp cùng <strong>Chairman Victor Chuyen</strong> để tư vấn kiến trúc cung ứng nhân lực tự động, tích hợp Zalo OA, đồng bộ máy chấm công và phân quyền bảo mật chuyên biệt.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10 w-full sm:w-auto">
            {/* Cal.com Booking Button */}
            <a
              href="https://cal.com/victorchuyen/coachai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-blue-900/40 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>ĐẶT LỊCH TƯ VẤN 1:1 (CAL.COM)</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>

            {/* Zalo Direct Chat Button */}
            <a
              href="https://zalo.me/0989890022"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-emerald-950/40 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>CHAT ZALO: 0989.890.022</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>

        {/* 4 Multi-Column Luxury Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-900 text-xs">
          {/* Col 1: Brand & Philosophy */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                FCS
              </div>
              <div>
                <span className="font-black text-white text-base tracking-tight block">
                  FCS AI WORKFORCE OS
                </span>
                <span className="text-[10px] text-blue-400 font-mono">Enterprise Version 4.0.0</span>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Hệ thống quản trị và điều hành nhân lực thông minh đầu tiên tại Việt Nam đạt chuẩn <strong>Verified Working Worker (VWW)</strong>. Giúp 1 Operator vận hành quy mô 500–2.000 lao động tự động trên dữ liệu thực.
            </p>
            <div className="pt-1 flex items-center space-x-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Hạ tầng Cloudflare Edge & Firebase Admin SDK</span>
            </div>
          </div>

          {/* Col 2: Direct Founder & Support Contacts */}
          <div className="space-y-3">
            <div className="font-bold text-white text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <Headphones className="w-3.5 h-3.5 text-blue-400" />
              <span>Liên Hệ & Hỗ Trợ Cấp Cao</span>
            </div>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="https://zalo.me/0989890022"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-slate-300 hover:text-emerald-400 transition-colors group"
                >
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    <MessageSquare className="w-3 h-3" />
                  </span>
                  <div>
                    <span className="font-bold block">Chat Zalo Trực Tiếp</span>
                    <span className="text-[11px] text-slate-500 font-mono">0989.890.022 (Hotline)</span>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="https://cal.com/victorchuyen/coachai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-slate-300 hover:text-blue-400 transition-colors group"
                >
                  <span className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <Calendar className="w-3 h-3" />
                  </span>
                  <div>
                    <span className="font-bold block">Đặt Lịch Tư Vấn 1:1</span>
                    <span className="text-[11px] text-slate-500">cal.com/victorchuyen/coachai</span>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="tel:0989890022"
                  className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors group"
                >
                  <span className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 group-hover:bg-slate-700 transition-all">
                    <Phone className="w-3 h-3" />
                  </span>
                  <div>
                    <span className="font-semibold block">Hotline 24/7: 0989.890.022</span>
                    <span className="text-[11px] text-slate-500">Hỗ trợ khẩn cấp KCN & đối soát</span>
                  </div>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Core AI Capabilities */}
          <div className="space-y-3">
            <div className="font-bold text-white text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Tính Năng Trọng Tâm</span>
            </div>
            <ul className="space-y-2 text-slate-400">
              <li className="hover:text-white transition-colors cursor-pointer flex items-center space-x-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Worker 360 & AI Churn Risk 7 ngày</span>
              </li>
              <li className="hover:text-white transition-colors cursor-pointer flex items-center space-x-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Golden Flow 8 Chặng Tự Động</span>
              </li>
              <li className="hover:text-white transition-colors cursor-pointer flex items-center space-x-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Re-activation Engine (Tuyển dụng 0đ)</span>
              </li>
              <li className="hover:text-white transition-colors cursor-pointer flex items-center space-x-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Đối soát chấm công & chuẩn VWW</span>
              </li>
              <li className="hover:text-white transition-colors cursor-pointer flex items-center space-x-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Phân quyền RBAC 5 cấp độ bảo mật</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform Security & Standards */}
          <div className="space-y-3">
            <div className="font-bold text-white text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tiêu Chuẩn Bảo Mật</span>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2 text-[11px]">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                <Database className="w-3.5 h-3.5" />
                <span>100% Real Google Sheets</span>
              </div>
              <p className="text-slate-400 leading-snug">
                Dữ liệu được cô lập theo từng Tenant (`FCS-000001_DATA`). Tuyệt đối không dùng dữ liệu ảo.
              </p>
              <div className="pt-1 flex items-center space-x-1.5 text-slate-500 font-mono text-[10px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Cloudflare Edge SSL Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex flex-wrap items-center gap-2">
            <span>© {new Date().getFullYear()} FCS AI WORKFORCE OS. All rights reserved.</span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-400">Founder & Chairman: <strong>Victor Chuyen</strong></span>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <a
              href="https://zalo.me/0989890022"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-emerald-400 transition-colors font-medium"
            >
              Zalo 0989.890.022
            </a>
            <span className="text-slate-700">•</span>
            <a
              href="https://cal.com/victorchuyen/coachai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-blue-400 transition-colors font-medium"
            >
              Cal.com 1:1
            </a>
            <span className="text-slate-700">•</span>
            <span className="text-emerald-400 font-bold font-mono">fcs.breaths.live</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
