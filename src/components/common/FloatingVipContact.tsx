import React, { useState } from 'react';
import {
  MessageSquare,
  Calendar,
  Phone,
  X,
  Sparkles,
  ExternalLink,
  ChevronUp,
} from 'lucide-react';

export const FloatingVipContact: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end space-y-3 pointer-events-auto">
      {/* Expanded Popup Menu */}
      {isOpen && (
        <div className="w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-4 text-slate-200 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <span className="font-bold text-white text-xs block">Tư Vấn VIP Cấp Cao</span>
                <span className="text-[10px] text-slate-400">Chairman Victor Chuyen</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Đóng menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3 space-y-2 text-xs">
            {/* Zalo Direct Chat */}
            <a
              href="https://zalo.me/0989890022"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 transition-all group"
            >
              <div className="flex items-center space-x-2.5">
                <span className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-900/40 shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </span>
                <div>
                  <span className="font-bold text-white block text-xs">Chat Trực Tiếp Zalo</span>
                  <span className="text-[11px] text-emerald-400 font-mono">0989.890.022</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-emerald-400 opacity-60 group-hover:opacity-100 transition-opacity" />
            </a>

            {/* Cal.com Booking */}
            <a
              href="https://cal.com/victorchuyen/coachai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/30 text-blue-300 transition-all group"
            >
              <div className="flex items-center space-x-2.5">
                <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-900/40 shrink-0">
                  <Calendar className="w-4 h-4" />
                </span>
                <div>
                  <span className="font-bold text-white block text-xs">Đặt Lịch Tư Vấn 1:1</span>
                  <span className="text-[11px] text-blue-400">cal.com/victorchuyen/coachai</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-400 opacity-60 group-hover:opacity-100 transition-opacity" />
            </a>

            {/* Direct Call */}
            <a
              href="tel:0989890022"
              className="flex items-center space-x-2.5 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <span className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                <Phone className="w-3.5 h-3.5" />
              </span>
              <div>
                <span className="font-semibold block text-xs">Hotline 24/7: 0989.890.022</span>
                <span className="text-[10px] text-slate-400">Hỗ trợ khẩn cấp KCN & đối soát</span>
              </div>
            </a>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[10px] text-center text-slate-500">
            FCS AI WORKFORCE OS • Hỗ trợ triển khai toàn quốc
          </div>
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="flex items-center space-x-2.5">
        {/* Quick Zalo Direct Circle */}
        <a
          href="https://zalo.me/0989890022"
          target="_blank"
          rel="noopener noreferrer"
          className="relative group w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/60 flex items-center justify-center transition-transform hover:scale-105 cursor-pointer border border-emerald-400/40"
          title="Chat Zalo 0989890022"
        >
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
          <MessageSquare className="w-5 h-5" />
          {/* Tooltip */}
          <span className="absolute right-14 bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-800">
            Chat Zalo: 0989.890.022
          </span>
        </a>

        {/* Quick Cal.com 1:1 Circle */}
        <a
          href="https://cal.com/victorchuyen/coachai"
          target="_blank"
          rel="noopener noreferrer"
          className="relative group w-12 h-12 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white shadow-lg shadow-blue-950/60 flex items-center justify-center transition-transform hover:scale-105 cursor-pointer border border-blue-400/40"
          title="Đặt lịch tư vấn 1:1 cùng Chairman Victor Chuyen"
        >
          <Calendar className="w-5 h-5 text-amber-300" />
          {/* Tooltip */}
          <span className="absolute right-14 bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-800">
            Đặt lịch tư vấn 1:1 (Cal.com)
          </span>
        </a>

        {/* Toggle Expand Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-12 h-12 rounded-full ${
            isOpen ? 'bg-slate-800 text-white' : 'bg-slate-900 text-amber-400'
          } border border-slate-700 shadow-xl flex items-center justify-center transition-all hover:bg-slate-800 cursor-pointer`}
          title="Mở bảng thông tin liên hệ VIP"
        >
          {isOpen ? <X className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};
