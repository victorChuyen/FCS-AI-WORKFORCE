import React from 'react';
import {
  CheckCircle2,
  PlayCircle,
  Eye,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Layers,
  FileSpreadsheet,
  Activity,
} from 'lucide-react';

interface ProductProofSectionProps {
  onNavigate: (route: string) => void;
  onScrollToGoldenFlow: () => void;
}

export const ProductProofSection: React.FC<ProductProofSectionProps> = ({
  onNavigate,
  onScrollToGoldenFlow,
}) => {
  const proofMetrics = [
    {
      label: 'Kiểm soát hồ sơ tức thì',
      value: '< 5 giây',
      desc: 'Quét và phát hiện trùng số CCCD ngay khi ứng viên nộp qua form.',
    },
    {
      label: 'Tỷ lệ xác thực ngày công',
      value: '100%',
      desc: 'Mỗi ngày công đều có biên bản đối soát khớp chuẩn Verified Working.',
    },
    {
      label: 'Thời gian gom dữ liệu',
      value: '0 Phút',
      desc: 'Hồ sơ và điểm danh cập nhật thời gian thực vào bảng điều khiển tập trung.',
    },
    {
      label: 'Định mức quản lý',
      value: '1 : 300+',
      desc: 'Một quản lý kiểm soát hơn 300 lao động hoạt động mà không quá tải.',
    },
  ];

  return (
    <section id="proof-section" className="py-16 sm:py-24 bg-slate-900/30 border-y border-slate-800/80">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Eye className="w-3.5 h-3.5" />
            <span>MINH CHỨNG VẬN HÀNH THỰC TẾ</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Không demo bằng slide.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400">
              Xem cách hệ thống chạy thực tế.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Chúng tôi không trình diễn những tính năng lý thuyết trên PowerPoint. Toàn bộ kiến trúc dưới đây là phần mềm đang hoạt động thực sự trên dữ liệu mẫu và đồng bộ với Google Sheets.
          </p>
        </div>

        {/* 4 Hard Truth Metrics */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {proofMetrics.map((item) => (
            <div
              key={item.label}
              className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 text-center space-y-1.5"
            >
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {item.value}
              </div>
              <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                {item.label}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Real Product Interactive Sandbox Callout */}
        <div className="mt-8 bg-slate-950 border border-blue-900/40 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Chế độ Demo Tương Tác Sẵn Sàng</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Bạn có thể trải nghiệm trực tiếp hệ thống ngay bây giờ
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Hệ thống đã nạp sẵn 14 hồ sơ lao động mẫu, danh mục nhà máy, dữ liệu chấm công và các cảnh báo ngoại lệ thực tế để bạn dùng thử mà không cần cài đặt.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onNavigate('/register')}
              className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-blue-600/30"
            >
              <span>VÀO THỬ NGHIỆM NGAY</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onScrollToGoldenFlow}
              className="w-full sm:w-auto px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors border border-slate-800 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>XEM LUỒNG DỮ LIỆU</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
