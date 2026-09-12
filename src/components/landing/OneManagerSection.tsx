import React from 'react';
import {
  User,
  CheckCircle,
  Sliders,
  Users,
  Handshake,
  HeartHandshake,
  Sparkles,
} from 'lucide-react';

export const OneManagerSection: React.FC = () => {
  return (
    <section id="one-manager-section" className="py-16 sm:py-24 bg-slate-900/40 border-y border-slate-800/80">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Visual Operational Ratio (5 cols) */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Mô hình Quản trị Tinh gọn
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                  Hiệu quả gấp 3-4x
                </span>
              </div>

              {/* Central Node */}
              <div className="bg-slate-900/90 border border-blue-600/40 rounded-2xl p-4 flex items-center space-x-4 shadow-lg shadow-blue-600/10">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-black text-white text-base">
                    1 Quản Lý Vận Hành
                  </div>
                  <div className="text-xs text-blue-400 font-medium">
                    Không gõ phím • Chỉ duyệt và xử lý ngoại lệ
                  </div>
                </div>
              </div>

              {/* What AI does automatically */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Hệ thống & AI tự động hóa:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 flex items-center space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">Chuẩn hóa đầu vào</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 flex items-center space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">Tự động nhắc lịch</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 flex items-center space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">Phát hiện bất thường</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 flex items-center space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">Xác thực công VWW</span>
                  </div>
                </div>
              </div>

              {/* What Manager focuses on */}
              <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-900/40 space-y-2">
                <div className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">
                  Quản lý tập trung vào giá trị cốt lõi:
                </div>
                <div className="space-y-1 text-xs text-slate-300">
                  <div className="flex items-center space-x-2">
                    <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Phỏng vấn & đánh giá sâu ứng viên</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Handshake className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Chăm sóc và giữ chân nhà máy đối tác</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <HeartHandshake className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Giải quyết ngay các ca khẩn cấp phát sinh</span>
                  </div>
                </div>
              </div>

              {/* Capacity pill */}
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Năng lực kiểm soát của 1 Quản lý:</span>
                <span className="font-bold text-emerald-400 text-sm">300 – 500 Lao động</span>
              </div>
            </div>
          </div>

          {/* Right Column: Strategic Copy (7 cols) */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-5">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5" />
              <span>MÔ HÌNH 1 QUẢN LÝ (ONE MANAGER MODEL)</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-snug">
              Không tăng bộ máy quản lý theo cùng tốc độ tăng lao động
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Mô hình truyền thống có một cái bẫy nguy hiểm: Cứ mỗi khi tăng thêm 100 lao động hoặc mở thêm 1 chi nhánh, bạn lại phải tuyển thêm 2–3 nhân viên hành chính để nhập liệu, gọi điện thoại và đối soát bảng công. Chi phí phình to và sai sót nhân lên.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-3 text-xs sm:text-sm text-slate-300">
                <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  1
                </div>
                <p>
                  <strong className="text-white">Chuẩn hóa đầu vào (Standardize Intake):</strong> Mọi hồ sơ từ các nguồn tuyển và CTV đều tự động chuẩn hóa và đổ vào một phễu duy nhất.
                </p>
              </div>

              <div className="flex items-start space-x-3 text-xs sm:text-sm text-slate-300">
                <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  2
                </div>
                <p>
                  <strong className="text-white">Tự động bám đuổi (Automate Follow-up):</strong> Lịch phỏng vấn, sơ đồ điểm đón xe và xác nhận có mặt đều được điều phối tự động mà không cần nhân sự trực máy.
                </p>
              </div>

              <div className="flex items-start space-x-3 text-xs sm:text-sm text-slate-300">
                <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  3
                </div>
                <p>
                  <strong className="text-white">AI phát hiện ngoại lệ (AI Surfaces Exceptions):</strong> Hệ thống chỉ cảnh báo những gì bất thường: ca vắng mặt, thiếu công, lệch hồ sơ.
                </p>
              </div>

              <div className="flex items-start space-x-3 text-xs sm:text-sm text-slate-300">
                <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  4
                </div>
                <p>
                  <strong className="text-white">Giải phóng con người (Human High-Value):</strong> Quản lý dồn 100% thời gian cho chất lượng phỏng vấn, xử lý tình huống và xây dựng quan hệ bền chặt với các nhà máy đối tác.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
