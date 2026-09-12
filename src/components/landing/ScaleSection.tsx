import React from 'react';
import {
  Compass,
  CheckCircle2,
  HeartHandshake,
  Gift,
  Receipt,
  Sparkles,
  Building2,
} from 'lucide-react';

export const ScaleSection: React.FC = () => {
  const stages = [
    {
      stage: 1,
      name: 'Workforce Core',
      status: 'active',
      statusLabel: 'ĐANG HOẠT ĐỘNG • SPRINT 01',
      icon: CheckCircle2,
      desc: 'Nền tảng kiểm soát hành trình lao động: Quản trị hồ sơ Worker 360, luồng Golden Flow 8 chặng, dashboard cho 1 Quản lý và đối soát công chuẩn VWW.',
      deliverables: [
        'Chuẩn hóa Pipeline 8 chặng',
        'Kiểm tra trùng CCCD đa nguồn',
        'Bảng điều khiển Hôm Nay cho 1 Quản lý',
      ],
    },
    {
      stage: 2,
      name: 'AI Worker Care',
      status: 'roadmap',
      statusLabel: 'LỘ TRÌNH PHÁT TRIỂN',
      icon: HeartHandshake,
      desc: 'Tự động hóa chăm sóc và duy trì kỷ luật: AI nhắc hẹn xe đón, hỏi thăm sau ca làm đầu tiên và phát hiện sớm các dấu hiệu chán việc để can thiệp kịp thời.',
      deliverables: [
        'AI nhắn tin/gọi nhắc xe tự động',
        'Khảo sát nhanh mức độ hài lòng tại xưởng',
        'Cảnh báo nguy cơ bỏ ca trước 12 tiếng',
      ],
    },
    {
      stage: 3,
      name: 'Rewards & Revenue',
      status: 'roadmap',
      statusLabel: 'LỘ TRÌNH PHÁT TRIỂN',
      icon: Gift,
      desc: 'Cơ chế kích hoạt nguồn giới thiệu và giữ chân lao động lâu năm: Tích điểm chuyên cần, thưởng giới thiệu bạn bè (Referral) tự động minh bạch.',
      deliverables: [
        'Cổng tích điểm chuyên cần cho lao động',
        'Theo dõi hoa hồng giới thiệu của CTV',
        'Chính sách thưởng gắn bó 30 - 60 - 90 ngày',
      ],
    },
    {
      stage: 4,
      name: 'Finance Reconciliation',
      status: 'roadmap',
      statusLabel: 'LỘ TRÌNH PHÁT TRIỂN',
      icon: Receipt,
      desc: 'Tự động hóa đối soát tài chính: Chuyển đổi dữ liệu công chuẩn VWW thành hóa đơn nghiệm thu với nhà máy và bảng thanh toán hoa hồng CTV.',
      deliverables: [
        'Xuất bảng đối soát theo từng nhà máy',
        'Tự động chốt tiền hoa hồng theo ngày công thực',
        'Báo cáo biên lợi nhuận ròng trên từng ca làm',
      ],
    },
    {
      stage: 5,
      name: 'AI Marketing Engine',
      status: 'roadmap',
      statusLabel: 'LỘ TRÌNH PHÁT TRIỂN',
      icon: Sparkles,
      desc: 'Tự động hóa tìm kiếm nguồn tuyển: Tái kích hoạt nguồn dữ liệu lao động cũ (Reactivation), tối ưu hóa bài đăng tuyển dụng theo từng khu công nghiệp.',
      deliverables: [
        'Quét và mời lại lao động cũ phù hợp',
        'Tự động phân bổ ngân sách theo kênh hiệu quả',
        'Tối ưu nội dung tuyển dụng thu hút ứng viên',
      ],
    },
    {
      stage: 6,
      name: 'Multi-Office OS',
      status: 'roadmap',
      statusLabel: 'LỘ TRÌNH PHÁT TRIỂN',
      icon: Building2,
      desc: 'Hệ điều hành tập trung cho chuỗi văn phòng: Tổng giám đốc theo dõi toàn bộ các chi nhánh, điều phối chéo nguồn lao động giữa các tỉnh thành.',
      deliverables: [
        'Bảng điều hành hợp nhất toàn hệ thống',
        'Phân quyền độc lập theo từng chi nhánh',
        'Điều chuyển lao động linh hoạt liên tỉnh',
      ],
    },
  ];

  return (
    <section id="roadmap-section" className="py-16 sm:py-24">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>MỞ RỘNG THEO TỪNG GIAI ĐOẠN (SCALE BY STAGE)</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Hệ thống phát triển theo từng giai đoạn của doanh nghiệp
          </h2>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            <span className="text-white font-medium">
              Bạn không cần phải mua 100 tính năng phức tạp ngay hôm nay.
            </span>{' '}
            Hãy bắt đầu từ điểm nghẽn lớn nhất ở tầng Core, và yên tâm rằng kiến trúc hệ thống đã sẵn sàng mở rộng khi quy mô của bạn tăng gấp 10 lần.
          </p>
        </div>

        {/* 6 Stages Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stages.map((stg) => {
            const Icon = stg.icon;
            const isActive = stg.status === 'active';
            return (
              <div
                key={stg.stage}
                className={`rounded-2xl p-6 flex flex-col justify-between border transition-all duration-200 space-y-5 ${
                  isActive
                    ? 'bg-slate-900 border-blue-500/60 shadow-xl shadow-blue-950/40 ring-1 ring-blue-500/40'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <div className="space-y-3.5">
                  {/* Top Badge & Number */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      GIAI ĐOẠN 0{stg.stage}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border tracking-wider uppercase ${
                        isActive
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {stg.statusLabel}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start space-x-3 pt-1">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        className={`text-base font-bold ${
                          isActive ? 'text-white' : 'text-slate-200'
                        }`}
                      >
                        {stg.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">{stg.desc}</p>
                </div>

                {/* Deliverables Checklist */}
                <div className="pt-4 border-t border-slate-900 space-y-1.5 text-xs">
                  {stg.deliverables.map((item) => (
                    <div key={item} className="flex items-center space-x-2 text-slate-300">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          isActive ? 'bg-emerald-400' : 'bg-slate-600'
                        }`}
                      />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
