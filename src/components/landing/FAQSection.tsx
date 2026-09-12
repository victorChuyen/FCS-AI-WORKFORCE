import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

export const FAQSection: React.FC = () => {
  // Only one item open at a time
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const faqs = [
    {
      q: '1. Chúng tôi có bắt buộc phải bỏ hoàn toàn Excel ngay lập tức không?',
      a: 'Hoàn toàn không. Hệ thống được thiết kế với cơ chế đồng bộ hai chiều trực tiếp với Google Sheets. Nhân sự của bạn vẫn có thể mở file tính quen thuộc để tra cứu hoặc xuất báo cáo, trong khi dữ liệu được bảo đảm thống nhất và không bị thất lạc.',
    },
    {
      q: '2. Nếu doanh nghiệp chúng tôi hiện chỉ có 1 văn phòng thì có dùng được không?',
      a: 'Rất phù hợp. Gói Starter được tinh gọn riêng cho 1 văn phòng để 1 quản lý kiểm soát trọn vẹn luồng từ ứng tuyển đến xác minh công. Bạn không phải trả thêm chi phí cho các phân hệ chi nhánh cồng kềnh khi chưa cần.',
    },
    {
      q: '3. Nhân viên lớn tuổi hoặc không rành công nghệ có sử dụng được không?',
      a: 'Giao diện được thiết kế tối giản, tập trung vào tiếng Việt rõ ràng và màn hình công việc "Hôm Nay". Nhân viên chỉ mất khoảng 20–30 phút để biết cách tiếp nhận ứng viên, cập nhật kết quả phỏng vấn và xem lịch xe đón.',
    },
    {
      q: '4. Doanh nghiệp chúng tôi có thể tùy chỉnh các bước tuyển dụng theo quy trình riêng không?',
      a: 'Có. Quy trình Golden Flow 8 chặng là chuẩn khung tối ưu, nhưng hệ thống cho phép cấu hình linh hoạt các tiêu chí sàng lọc, câu hỏi phỏng vấn, các ca làm việc và tiêu chuẩn nghiệm thu riêng của từng nhà máy đối tác.',
    },
    {
      q: '5. Khi quy mô tăng lên 500 hoặc 1.000 lao động, hệ thống có bị quá tải không?',
      a: 'Kiến trúc hệ thống sử dụng hạ tầng đám mây Google Cloud và cơ sở dữ liệu thời gian thực được tối ưu hóa cho hàng ngàn bản ghi. Một quản lý có thể điều phối hàng trăm ca làm việc mỗi ngày mà tốc độ xử lý vẫn dưới 1 giây.',
    },
    {
      q: '6. Trí tuệ nhân tạo (AI) có tự động quyết định nhận hay loại ứng viên không?',
      a: 'Không. AI trong FCS là trợ lý rà soát và cảnh báo, không thay thế con người. AI quét các điểm lệch (đậu chưa đi làm, thiếu công, trùng CCCD) và đưa lên danh sách cảnh báo. Quyết định tuyển dụng và xử lý ngoại lệ hoàn toàn thuộc về Quản lý.',
    },
    {
      q: '7. Các văn phòng chi nhánh ở tỉnh khác nhau có được phân quyền độc lập không?',
      a: 'Có. Cơ chế phân quyền RBAC đa cấp đảm bảo nhân sự ở chi nhánh Bắc Ninh chỉ xem được hồ sơ lao động và nhà máy tại Bắc Ninh, trong khi Giám đốc vận hành ở trụ sở chính xem được bức tranh tổng thể toàn quốc.',
    },
    {
      q: '8. Thời gian triển khai thử nghiệm (Pilot) mất bao lâu?',
      a: 'Chỉ mất từ 1 đến 3 ngày làm việc. Bạn có thể bắt đầu ngay trên dữ liệu mẫu có sẵn để làm quen luồng vận hành, sau đó nhập danh mục nhà máy và dữ liệu lao động hiện tại để chạy song song với quy trình cũ.',
    },
  ];

  return (
    <section id="faq-section" className="py-16 sm:py-24 bg-slate-900/40 border-y border-slate-800/80">
      <div className="max-w-[850px] mx-auto px-4 sm:px-6">
        {/* Section Heading */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>GIẢI ĐÁP RÀO CẢN VẬN HÀNH</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Câu hỏi thường gặp của các chủ doanh nghiệp
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Những băn khoăn thực tế nhất khi chuyển dịch từ quản lý thủ công sang hệ điều hành thông minh.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const contentId = `faq-content-${idx}`;
            const headerId = `faq-header-${idx}`;
            return (
              <div
                key={faq.q}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-slate-950 border-blue-500/50 shadow-lg'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <button
                  id={headerId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  onClick={() => toggleItem(idx)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer focus:outline-hidden"
                >
                  <span className="font-bold text-white text-sm sm:text-base leading-snug">
                    {faq.q}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? 'bg-blue-600 text-white rotate-180'
                        : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={contentId}
                    role="region"
                    aria-labelledby={headerId}
                    className="px-5 sm:px-6 pb-6 pt-1 border-t border-slate-900 text-xs sm:text-sm text-slate-300 leading-relaxed"
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
