import React from 'react';
import { Check, ArrowRight, Sparkles, Building, Briefcase, Globe } from 'lucide-react';

interface PricingSectionProps {
  onNavigate: (route: string) => void;
  onScrollToAudit: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  onNavigate,
  onScrollToAudit,
}) => {
  const tiers = [
    {
      id: 'starter',
      name: 'STARTER',
      tagline: 'Dành cho chi nhánh hoặc tổ đội cung ứng độc lập',
      target: 'Quy mô dưới 100 lao động hoạt động',
      price: 'Cấu hình tinh gọn',
      popular: false,
      icon: Briefcase,
      features: [
        '1 Tài khoản Quản lý điều hành (Manager)',
        'Đầy đủ quy trình 8 bước Golden Flow chuẩn',
        'Quản lý hồ sơ Worker 360 & kiểm tra trùng CCCD',
        'Dashboard điều phối tác vụ Hôm nay',
        'Đồng bộ dữ liệu bảng tính Google Sheets',
        'Hỗ trợ thiết lập ban đầu qua nhóm kỹ thuật',
      ],
      cta: 'DÙNG THỬ BẢN STARTER',
      ctaAction: () => onNavigate('/register'),
    },
    {
      id: 'business',
      name: 'BUSINESS',
      tagline: 'Lựa chọn phổ biến nhất cho doanh nghiệp vừa',
      target: 'Quy mô từ 100 - 500 lao động hoạt động',
      price: 'Tối ưu hiệu suất',
      popular: true,
      icon: Building,
      features: [
        'Toàn bộ tính năng gói STARTER',
        'Phân quyền đa cấp: Manager & Tuyển dụng Staff',
        'Quản trị danh mục nhà máy & ca kíp phức tạp',
        'AI đối soát chấm công chuẩn Verified Working (VWW)',
        'Báo cáo hiệu quả chuyển đổi theo từng CTV tuyển sinh',
        'Bảo mật dữ liệu riêng tư chuẩn Firebase RBAC',
        'Ưu tiên hỗ trợ kỹ thuật và cập nhật tính năng mới',
      ],
      cta: 'NHẬN TƯ VẤN BUSINESS',
      ctaAction: onScrollToAudit,
    },
    {
      id: 'multi-office',
      name: 'MULTI-OFFICE',
      tagline: 'Dành cho tập đoàn cung ứng & mạng lưới liên tỉnh',
      target: 'Quy mô trên 500 lao động & nhiều chi nhánh',
      price: 'Tùy biến theo nhu cầu',
      popular: false,
      icon: Globe,
      features: [
        'Không giới hạn số lượng văn phòng và chi nhánh',
        'Điều phối phân bổ lao động chéo giữa các tỉnh',
        'Tích hợp kết nối hệ thống ERP / HRM của nhà máy đối tác',
        'Hỗ trợ xây dựng luồng nghiệp vụ và báo cáo riêng biệt',
        'Cam kết thỏa thuận mức dịch vụ (SLA) 99.9%',
        'Chuyên gia tư vấn tái cấu trúc quy trình đồng hành',
      ],
      cta: 'ĐẶT LỊCH 1:1 VỚI CHAIRMAN VICTOR',
      ctaAction: () => window.open('https://cal.com/victorchuyen/coachai', '_blank'),
    },
  ];

  return (
    <section id="pricing-section" className="py-16 sm:py-24">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CẤP ĐỘ GIẢI PHÁP & QUY MÔ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Lựa chọn cấp độ giải pháp phù hợp với doanh nghiệp
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-400 leading-relaxed">
            Dễ dàng bắt đầu với quy mô hiện tại và nâng cấp linh hoạt khi số lượng lao động và văn phòng chi nhánh mở rộng.
          </p>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.id}
                className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between border transition-all duration-200 relative ${
                  tier.popular
                    ? 'bg-slate-900/90 border-blue-500/60 shadow-2xl shadow-blue-950/50 ring-1 ring-blue-500/50'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                {/* Popular Pill */}
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                    PHỔ BIẾN NHẤT
                  </div>
                )}

                <div className="space-y-6">
                  {/* Tier Title & Description */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-blue-400 flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-black text-white tracking-tight">
                          {tier.name}
                        </h3>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{tier.tagline}</p>
                  </div>

                  {/* Target scale pill */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                      Định mức khuyến nghị:
                    </span>
                    <span className="font-bold text-white text-xs mt-0.5 block">
                      {tier.target}
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-2.5 pt-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Tính năng bao gồm:
                    </div>
                    {tier.features.map((feat) => (
                      <div key={feat} className="flex items-start space-x-2.5 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA Button */}
                <div className="pt-8">
                  <button
                    type="button"
                    onClick={tier.ctaAction}
                    className={`w-full py-3.5 px-5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer min-h-[48px] ${
                      tier.popular
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800'
                    }`}
                  >
                    <span>{tier.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Note */}
        <div className="mt-8 text-center text-xs text-slate-500">
          Chưa yêu cầu thanh toán thẻ trực tuyến. Mọi đăng ký đều được khởi tạo bản trải nghiệm trực tiếp.
        </div>
      </div>
    </section>
  );
};
