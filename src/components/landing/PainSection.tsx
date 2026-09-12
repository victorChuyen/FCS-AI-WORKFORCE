import React from 'react';
import {
  FileSpreadsheet,
  MessageSquareOff,
  UserX,
  ClockAlert,
  HelpCircle,
  FileQuestion,
  AlertOctagon,
  ArrowDown,
} from 'lucide-react';

export const PainSection: React.FC = () => {
  const painPoints = [
    {
      icon: FileSpreadsheet,
      title: 'Ứng viên nằm rải rác ở nhiều file và tin nhắn',
      description:
        'Hồ sơ đến từ Facebook Ads, Zalo cá nhân, CTV, giới thiệu nằm ở 5-7 bảng tính khác nhau. Không ai biết đâu là phiên bản mới nhất, dẫn đến trôi tin và bỏ sót ứng viên tiềm năng.',
      impact: 'Mất dấu 30% ứng viên tiềm năng',
    },
    {
      icon: ClockAlert,
      title: 'Kết quả phỏng vấn không được cập nhật kịp thời',
      description:
        'Nhân viên phỏng vấn xong giữ ghi chú trên sổ tay hoặc chat riêng. Quản lý không biết ca sáng nay đã tuyển đủ bao nhiêu người để kịp thông báo cho nhà máy điều phối tuyến xe.',
      impact: 'Chậm trễ điều động ca làm',
    },
    {
      icon: UserX,
      title: 'Không biết ai đã đậu nhưng chưa đi làm',
      description:
        'Hàng chục lao động được báo đã trúng tuyển nhưng bặt vô âm tín vào ngày tập trung. Doanh nghiệp không có hệ thống tự động bám đuổi và chỉ phát hiện khi xe chở công nhân đã lăn bánh.',
      impact: 'Tỷ lệ bùng việc ngày đầu tới 45%',
    },
    {
      icon: HelpCircle,
      title: 'Không biết ai được báo đi làm nhưng chưa phát sinh công',
      description:
        'Danh sách báo cáo gửi cho khách hàng ghi nhận 50 người, nhưng nhà máy phản hồi chỉ có 38 người quét thẻ vào cổng. Việc thiếu đối soát tức thì gây tổn thất uy tín nghiêm trọng.',
      impact: 'Tranh cãi quân số với đối tác',
    },
    {
      icon: FileQuestion,
      title: 'Đến cuối tháng mới phát hiện dữ liệu lệch',
      description:
        'Kế toán phải mất 7-10 ngày thức đêm gom bảng chấm công từ các xưởng, đối chiếu thủ công với danh sách ban đầu để tính lương và hoa hồng CTV. Sai sót dẫn đến khiếu nại kéo dài.',
      impact: 'Mất 7-10 ngày đối soát thủ công',
    },
    {
      icon: MessageSquareOff,
      title: 'Quản lý phải hỏi nhân viên thay vì nhìn hệ thống',
      description:
        'Muốn biết tiến độ tuyển dụng hay tình trạng một lao động, chủ doanh nghiệp và quản lý phải gọi điện, nhắn tin hỏi từng người phụ trách. Không có bảng điều khiển thời gian thực để ra quyết định.',
      impact: 'Mất hoàn toàn quyền kiểm soát',
    },
  ];

  return (
    <section id="pain-section" className="py-16 sm:py-24 bg-slate-900/40 border-y border-slate-800/80">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>THỰC TRẠNG VẬN HÀNH THỦ CÔNG</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Khi quy mô tăng lên, phương pháp cũ sẽ làm bạn kiệt sức
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            <span className="text-white font-medium italic">
              “Khi doanh nghiệp còn nhỏ, Excel và Zalo vẫn chạy được. Vấn đề bắt đầu khi số lao động, nhân viên, đối tác và văn phòng cùng tăng lên.”
            </span>
          </p>
        </div>

        {/* 6 Core Problems Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {painPoints.map((pain, idx) => {
            const Icon = pain.icon;
            return (
              <div
                key={pain.title}
                className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all duration-200 space-y-3.5 group relative flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-900/50 text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/40">
                      ĐIỂM NGHẼN 0{idx + 1}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-rose-200 transition-colors">
                    {pain.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {pain.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-900">
                  <span className="text-[11px] font-semibold text-rose-400/90 flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>Hậu quả: {pain.impact}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Strategic Transition Callout */}
        <div className="mt-10 p-5 rounded-2xl bg-gradient-to-r from-blue-950/30 via-slate-900 to-indigo-950/30 border border-slate-800 text-center space-y-2">
          <p className="text-xs sm:text-sm text-slate-300">
            Vấn đề cốt lõi không phải do nhân viên của bạn lười hay thiếu người lao động —{' '}
            <strong className="text-white font-semibold">mà do bạn đang thiếu một cơ chế vận hành theo ngoại lệ.</strong>
          </p>
          <div className="inline-flex items-center space-x-1.5 text-xs text-blue-400 font-bold uppercase tracking-wider pt-1">
            <span>Xem cách FCS AI Workforce OS giải quyết tận gốc</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
};
