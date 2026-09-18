import React from 'react';
import { Activity, Zap, ShieldCheck, CheckCircle2, TrendingUp, Users } from 'lucide-react';

interface TickerItem {
  tag: string;
  tagType: 'vww' | 'gold' | 'cyan' | 'purple';
  text: string;
}

const TICKER_ITEMS: TickerItem[] = [
  {
    tag: '⚡ CHUẨN VWW',
    tagType: 'vww',
    text: 'Đối soát ca đêm Luxshare ICT: 42/42 lao động đã xác minh công thực tế qua cổng Matching',
  },
  {
    tag: '🛡️ CHỐNG TRANH CHẤP',
    tagType: 'gold',
    text: 'Quét tự động CCCD & SĐT < 30s: 0 hồ sơ trùng lặp giữa các nhóm tuyển dụng',
  },
  {
    tag: '🎯 1 QUẢN LÝ 500 QUÂN',
    tagType: 'cyan',
    text: 'Tự động hóa luồng tiếp nhận, xếp lịch phỏng vấn xưởng và điều phối xe buýt đón',
  },
  {
    tag: '📊 REAL-TIME SYNC',
    tagType: 'purple',
    text: 'Đồng bộ dữ liệu 2 chiều với Google Sheets Master độ trễ 0ms — Zero Data Lock-in',
  },
  {
    tag: '🏭 CA SÁNG FOXCONN',
    tagType: 'gold',
    text: '12 ứng viên hoàn tất xác nhận lên xe lúc 06:15 sáng — Tỷ lệ có mặt đạt 100%',
  },
  {
    tag: '🚀 GOLDEN FLOW V4',
    tagType: 'vww',
    text: 'Kiểm soát khép kín 8 chặng: Đăng ký → Mã ID → Phỏng vấn → Gắn xưởng → Chấm công → VWW',
  },
];

export const NeonLiveTicker: React.FC = () => {
  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'vww':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20';
      case 'gold':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/20';
      case 'cyan':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-cyan-500/20';
      case 'purple':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-purple-500/20';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-blue-500/20';
    }
  };

  return (
    <div className="neon-ticker-bar">
      {/* Live Badge Cố định bên trái */}
      <div className="shrink-0 flex items-center space-x-2 px-3 sm:px-4 py-1.5 bg-slate-950 border-r border-slate-800 text-xs font-bold text-white z-20 shadow-md">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="tracking-wider uppercase text-[11px] font-mono text-emerald-400 font-bold hidden sm:inline">
          FCS AI OS • LIVE TICKER
        </span>
        <span className="tracking-wider uppercase text-[10px] font-mono text-emerald-400 font-bold sm:hidden">
          LIVE
        </span>
      </div>

      {/* Dòng chữ chạy Neon (Marquee Track) */}
      <div className="overflow-hidden flex-1 relative flex items-center">
        <div className="neon-marquee-track text-xs font-semibold text-slate-200">
          {/* Lặp lại 2 lần để tạo vòng lặp vô tận (Infinite Marquee) */}
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
            <div key={idx} className="inline-flex items-center space-x-2.5 mx-6">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border shadow-sm ${getBadgeStyle(
                  item.tagType
                )}`}
              >
                {item.tag}
              </span>
              <span className="text-slate-300 hover:text-white transition-colors">
                {item.text}
              </span>
              <span className="text-slate-600 font-bold mx-2">•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
