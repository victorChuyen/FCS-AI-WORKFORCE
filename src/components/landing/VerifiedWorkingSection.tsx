import React from 'react';
import {
  ShieldCheck,
  UserCheck,
  MapPin,
  Clock,
  BadgeCheck,
  CheckCircle2,
  Plus,
  Equal,
} from 'lucide-react';

export const VerifiedWorkingSection: React.FC = () => {
  const pillars = [
    {
      step: '1',
      title: 'Hồ sơ người lao động hợp lệ',
      vietnamese: 'Xác thực Danh tính',
      desc: 'Đã hoàn tất CCCD, ảnh chân dung, phỏng vấn ĐẠT và không bị trùng lặp hồ sơ đa kênh.',
      icon: UserCheck,
    },
    {
      step: '2',
      title: 'Xác nhận bắt đầu ca làm',
      vietnamese: 'Xác thực Có mặt',
      desc: 'Có mặt đúng giờ tại điểm đón xe buýt và check-in tại cổng nhà máy được chỉ định.',
      icon: MapPin,
    },
    {
      step: '3',
      title: 'Xác nhận chấm công thực tế',
      vietnamese: 'Xác thực Ngày công',
      desc: 'Dữ liệu quét thẻ/vân tay hoàn thành ca làm việc tiêu chuẩn được nhà máy ghi nhận.',
      icon: Clock,
    },
  ];

  return (
    <section id="vww-section" className="py-16 sm:py-24">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-emerald-500/30 rounded-3xl p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-2xl">
          {/* Subtle Ambient Light */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Heading */}
          <div className="max-w-3xl space-y-3 relative z-10">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <BadgeCheck className="w-4 h-4" />
              <span>KIM CHỈ NAM VẬN HÀNH (NORTH STAR METRIC)</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              KHÔNG ĐẾM NGƯỜI “ĐÃ BÁO ĐI LÀM”.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                CHỈ ĐẾM NGƯỜI ĐÃ ĐƯỢC XÁC MINH CÔNG.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Trong ngành cung ứng lao động, việc đếm số hồ sơ hay số người “hứa đi làm” chỉ tạo ra ảo tưởng về năng lực. Doanh nghiệp chỉ có doanh thu và uy tín khi người lao động thực sự hoàn thành ca làm việc.
            </p>
          </div>

          {/* The Formula Equation Box */}
          <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-slate-950 border border-emerald-900/40 relative z-10 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Công thức nghiệm thu tiêu chuẩn:
            </div>

            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex-1 text-center font-bold text-white">
                1. Người lao động hợp lệ
              </div>

              <div className="flex justify-center text-slate-500 font-bold">
                <Plus className="w-5 h-5" />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex-1 text-center font-bold text-white">
                2. Xác nhận đi làm tại xưởng
              </div>

              <div className="flex justify-center text-slate-500 font-bold">
                <Plus className="w-5 h-5" />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex-1 text-center font-bold text-white">
                3. Xác nhận có phát sinh công
              </div>

              <div className="flex justify-center text-emerald-400 font-bold">
                <Equal className="w-5 h-5" />
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 flex-1 text-center font-extrabold text-emerald-300 shadow-md">
                LAO ĐỘNG ĐÃ XÁC MINH (VWW)
              </div>
            </div>
          </div>

          {/* 3 Pillars Grid */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40">
                      BƯỚC 0{pillar.step}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{pillar.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Operational Value Footer */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300 relative z-10">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Chấm dứt hoàn toàn tranh cãi số lượng công giữa nhà máy và công ty cung ứng.</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Căn cứ minh bạch tuyệt đối để thanh toán hoa hồng cho mạng lưới CTV.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
