import React from 'react';
import {
  Database,
  Users2,
  CheckCircle2,
  HelpCircle,
  FileSpreadsheet,
  ShieldCheck,
  Building,
  UserCheck,
  CalendarCheck,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const CRMSection: React.FC = () => {
  const sevenQuestions = [
    {
      q: '1. Người này là ai?',
      a: 'Họ tên, số CCCD, số điện thoại, ảnh chân dung và quê quán được chuẩn hóa ngay từ lúc đăng ký.',
      icon: UserCheck,
    },
    {
      q: '2. Ai phụ trách?',
      a: 'Xác định chính xác nhân viên tuyển dụng, chi nhánh văn phòng và cộng tác viên (CTV) giới thiệu.',
      icon: Building,
    },
    {
      q: '3. Đã phỏng vấn chưa?',
      a: 'Thời gian, địa điểm, người phỏng vấn và biên bản đánh giá thể lực, thái độ.',
      icon: CalendarCheck,
    },
    {
      q: '4. Đậu hay không?',
      a: 'Trạng thái rõ ràng: Đạt tiêu chuẩn, Chờ bổ sung hồ sơ, hoặc Không đạt (lý do cụ thể).',
      icon: CheckCircle2,
    },
    {
      q: '5. Được phân bổ đi đâu?',
      a: 'Nhà máy đối tác, ca kíp đăng ký (ca ngày / ca đêm), và số hiệu tuyến xe buýt đưa đón.',
      icon: Building,
    },
    {
      q: '6. Đã bắt đầu đi làm chưa?',
      a: 'Thời điểm lên xe, người xác nhận có mặt tại cổng và ngày bắt đầu làm việc đầu tiên.',
      icon: Clock,
    },
    {
      q: '7. Đã có chấm công xác nhận chưa?',
      a: 'Dữ liệu quét vân tay/thẻ, số giờ công tiêu chuẩn, tăng ca và trạng thái nghiệm thu VWW.',
      icon: ShieldCheck,
      highlight: true,
    },
  ];

  return (
    <section id="crm-section" className="py-16 sm:py-24">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Database className="w-3.5 h-3.5" />
            <span>NGUỒN SỰ THẬT DUY NHẤT (SINGLE SOURCE OF TRUTH)</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Bộ nhớ chung của doanh nghiệp vận hành lao động
          </h2>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Không phải CRM bán hàng chung chung. Đây là hồ sơ{' '}
            <strong className="text-white font-semibold">Worker 360</strong>{' '}
            chuyên biệt: Một lao động • Một hồ sơ • Một lịch sử • Một trạng thái duy nhất.
          </p>
        </div>

        {/* 7 Questions Grid */}
        <div className="mt-12 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                7 câu hỏi cốt tử hệ thống trả lời ngay lập tức trong 3 giây
              </h3>
              <p className="text-xs text-slate-400">
                Quản lý không cần phải mở file Excel hay nhắn tin hỏi bất kỳ ai.
              </p>
            </div>
            <span className="text-[11px] font-mono text-blue-400 font-bold bg-blue-950/60 px-3 py-1 rounded-md border border-blue-800/60">
              Worker 360 Full Journey
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sevenQuestions.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.q}
                  className={`rounded-2xl p-4 sm:p-5 border transition-all flex flex-col justify-between space-y-3 ${
                    item.highlight
                      ? 'bg-emerald-950/30 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs sm:text-sm font-extrabold ${
                        item.highlight ? 'text-emerald-300' : 'text-white'
                      }`}
                    >
                      {item.q}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        item.highlight
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-900 text-blue-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">{item.a}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sync with Google Sheets Notice */}
        <div className="mt-8 p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                Vẫn kết nối 2 chiều với Google Sheets của doanh nghiệp
              </div>
              <div className="text-xs text-slate-400">
                Dữ liệu luôn được sao lưu trực tiếp vào bảng tính quen thuộc, không khóa chặt dữ liệu.
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800/60 shrink-0">
            <span>2-Way Sheet Sync</span>
          </div>
        </div>
      </div>
    </section>
  );
};
