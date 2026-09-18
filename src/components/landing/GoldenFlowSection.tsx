import React from 'react';
import {
  FileText,
  IdCard,
  PhoneCall,
  UserCheck2,
  Bus,
  Factory,
  Clock3,
  CheckCircle,
  ArrowRight,
  ArrowDown,
  Workflow,
} from 'lucide-react';

export const GoldenFlowSection: React.FC = () => {
  const steps = [
    {
      step: 1,
      name: 'Đăng ký',
      icon: FileText,
      tag: 'ĐẦU VÀO',
      desc: 'Ứng viên điền thông tin qua web/mobile form hoặc qua liên kết CTV giới thiệu.',
    },
    {
      step: 2,
      name: 'Worker ID',
      icon: IdCard,
      tag: 'ĐỊNH DANH',
      desc: 'Hệ thống tự động kiểm tra CCCD, phát hiện trùng lặp và cấp mã định danh duy nhất.',
    },
    {
      step: 3,
      name: 'Phỏng vấn',
      icon: PhoneCall,
      tag: 'SÀNG LỌC',
      desc: 'Lên lịch, gửi thông báo hẹn và ghi nhận kết quả đánh giá thể lực, sức khỏe.',
    },
    {
      step: 4,
      name: 'Đậu phỏng vấn',
      icon: UserCheck2,
      tag: 'CAM KẾT',
      desc: 'Xác nhận hợp đồng nguyên tắc, cấp phát đồng phục và chuẩn bị xuất phát.',
    },
    {
      step: 5,
      name: 'Phân bổ',
      icon: Bus,
      tag: 'ĐIỀU PHỐI',
      desc: 'Sắp xếp danh sách theo nhà máy, ca kíp và chỉ định tuyến xe buýt đưa đón.',
    },
    {
      step: 6,
      name: 'Đi làm',
      icon: Factory,
      tag: 'HIỆN DIỆN',
      desc: 'Xác nhận điểm danh có mặt tại cổng nhà máy, bắt đầu ca làm việc thực tế.',
    },
    {
      step: 7,
      name: 'Chấm công',
      icon: Clock3,
      tag: 'GHI NHẬN',
      desc: 'Thu thập giờ vào/ra, tính toán giờ làm việc tiêu chuẩn, ca đêm và tăng ca.',
    },
    {
      step: 8,
      name: 'Xác minh (VWW)',
      icon: CheckCircle,
      tag: 'CHUẨN ĐẦU RA',
      desc: 'Đối soát chéo dữ liệu, cấp chứng nhận Verified Working Worker để quyết toán.',
      highlight: true,
    },
  ];

  return (
    <section id="golden-flow-section" className="py-16 sm:py-24 bg-slate-900/50 border-y border-slate-800/80">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Workflow className="w-3.5 h-3.5" />
            <span>KIẾN TRÚC VẬN HÀNH TIÊU CHUẨN</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Quy trình Golden Flow 8 chặng khép kín
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-400 leading-relaxed">
            Hành trình xuyên suốt giúp loại bỏ 100% tình trạng mất dấu ứng viên, đảm bảo mỗi người lao động đều được theo dõi chặt chẽ từ khi nộp hồ sơ đến ngày công thực tế.
          </p>
        </div>

        {/* Desktop Step-Based Grid View (1024px+) */}
        <div className="hidden lg:grid grid-cols-4 gap-4 mt-12">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                className={`relative rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                  item.highlight
                    ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/40'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Step number badge & tag */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-black text-xs ${
                        item.highlight
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {item.step}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {item.tag}
                    </span>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      item.highlight
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-900 text-blue-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                {/* Step content */}
                <div className="space-y-1.5">
                  <h3
                    className={`text-base font-bold ${
                      item.highlight ? 'text-emerald-300' : 'text-white'
                    }`}
                  >
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>

                {/* Arrow connector indicator */}
                {idx < steps.length - 1 && (
                  <div className="hidden xl:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shadow-sm">
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tablet Grid View (768px - 1023px) */}
        <div className="hidden md:grid lg:hidden grid-cols-2 gap-4 mt-10">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                className={`rounded-2xl p-5 border flex flex-col justify-between space-y-3 ${
                  item.highlight
                    ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg'
                    : 'bg-slate-950/80 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold text-xs ${
                        item.highlight
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {item.step}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {item.tag}
                    </span>
                  </div>
                  <Icon
                    className={`w-5 h-5 ${
                      item.highlight ? 'text-emerald-400' : 'text-blue-400'
                    }`}
                  />
                </div>
                <div>
                  <h3
                    className={`text-sm font-bold ${
                      item.highlight ? 'text-emerald-300' : 'text-white'
                    }`}
                  >
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Vertical Flow Mandatory View (< 768px) */}
        <div className="md:hidden mt-8 space-y-3">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={item.name} className="relative">
                <div
                  className={`p-4 rounded-xl border flex items-start space-x-3.5 ${
                    item.highlight
                      ? 'bg-emerald-950/50 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/30'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5 ${
                      item.highlight
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    0{item.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3
                        className={`text-sm font-bold truncate ${
                          item.highlight ? 'text-emerald-300' : 'text-white'
                        }`}
                      >
                        {item.name}
                      </h3>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 shrink-0 ml-2">
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>

                {/* Vertical connector line */}
                {idx < steps.length - 1 && (
                  <div className="flex justify-center my-1">
                    <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Golden Flow Live Verification Pill */}
        <div className="mt-10 p-4 rounded-xl bg-slate-950/80 border border-slate-800 max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-xs text-slate-300">
              Mỗi chặng đều được đồng bộ hóa với{' '}
              <strong className="text-white font-semibold">Hệ thống điều hành trung tâm</strong> không làm rơi rớt dữ liệu.
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-900/50 shrink-0">
            ĐÃ KIỂM ĐỊNH THỰC TẾ
          </span>
        </div>
      </div>
    </section>
  );
};
