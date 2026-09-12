import React from 'react';
import {
  Bot,
  UserCheck,
  CalendarClock,
  ClipboardCheck,
  UserPlus,
  Clock,
  Zap,
  CheckCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const AIAgentSection: React.FC = () => {
  const currentAgents = [
    {
      name: 'Agent Giám sát Đậu nhưng Chưa Đi làm',
      badge: 'ĐANG HOẠT ĐỘNG • SPRINT 01',
      icon: CalendarClock,
      tag: 'BẢO TOÀN TỶ LỆ ĐI LÀM',
      color: 'emerald',
      problem: 'Lao động đã có kết quả ĐẬU phỏng vấn nhưng chưa có thông tin xác nhận tuyến xe hay ngày bắt đầu ca.',
      solution: 'Tự động phát hiện và đưa ngay vào hàng đợi ưu tiên P1 để quản lý gọi xác nhận trước khi mất liên lạc.',
    },
    {
      name: 'Agent Đối soát Chấm công Bất thường',
      badge: 'ĐANG HOẠT ĐỘNG • SPRINT 01',
      icon: ClipboardCheck,
      tag: 'KIỂM SOÁT DOANH THU CÔNG',
      color: 'emerald',
      problem: 'Lao động có trong danh sách phân bổ nhưng không có dữ liệu quét thẻ, hoặc ngược lại có công nhưng thiếu hồ sơ.',
      solution: 'Tự động bắt lỗi chênh lệch ca, đối chiếu mã định danh và cảnh báo P0 ngay trong ca làm việc.',
    },
    {
      name: 'Agent Quét Trùng Lặp & Giữ Nguồn Tuyển',
      badge: 'ĐANG HOẠT ĐỘNG • SPRINT 01',
      icon: UserCheck,
      tag: 'CHỐNG XUNG ĐỘT HOA HỒNG',
      color: 'emerald',
      problem: 'Ứng viên nộp qua nhiều kênh, CTV khai trùng số CCCD dẫn đến tranh cãi trả thưởng hoa hồng.',
      solution: 'Kiểm tra CCCD tức thì, khóa nguồn tuyển theo nguyên tắc người đăng ký trước và cấp mã Worker ID duy nhất.',
    },
  ];

  const roadmapAgents = [
    {
      name: 'AI Agent Tái kích hoạt Lao động Cũ (Reactivation)',
      badge: 'LỘ TRÌNH • GIAI ĐOẠN 2',
      icon: UserPlus,
      tag: 'KHAI THÁC TÀI NGUYÊN SẴN CÓ',
      color: 'indigo',
      desc: 'Tự động phân tích lịch sử những lao động từng làm việc tốt nhưng đã nghỉ việc > 30 ngày để gửi tin nhắn mời tham gia các đơn hàng mới với mức đãi ngộ hấp dẫn.',
    },
    {
      name: 'AI Voicebot Tự động gọi Nhắc xe & Xác nhận ca',
      badge: 'LỘ TRÌNH • GIAI ĐOẠN 2',
      icon: Zap,
      tag: 'GIẢM TẢI ĐIỆN THOẠI VIÊN',
      color: 'indigo',
      desc: 'Tự động gọi điện thoại trước 20h mỗi tối để xác nhận điểm đón xe buýt sáng hôm sau, tự động cập nhật phản hồi của lao động vào hệ thống mà không cần người gọi thủ công.',
    },
  ];

  return (
    <section id="ai-agents-section" className="py-16 sm:py-24 bg-slate-900/40 border-b border-slate-800/80">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Bot className="w-3.5 h-3.5" />
            <span>AI AGENTS THỰC CHIẾN</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Một trợ lý vận hành không bao giờ quên việc
          </h2>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Không phải chatbot nói chuyện vu vơ. AI Agents trong FCS làm việc âm thầm 24/7 để rà soát từng lỗ hổng trong luồng vận hành, bảo đảm không một người lao động nào bị bỏ rơi.
          </p>
        </div>

        {/* Part 1: Available Now (Sprint 01 Core) */}
        <div className="mt-12 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider">
                ĐANG HOẠT ĐỘNG (SẴN SÀNG TRONG HỆ THỐNG HIỆN TẠI)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
              Sprint 01 Production
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {currentAgents.map((agent) => {
              const Icon = agent.icon;
              return (
                <div
                  key={agent.name}
                  className="bg-slate-950/90 border border-emerald-900/40 hover:border-emerald-700/60 rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between space-y-4 relative group shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40 uppercase tracking-wider">
                        {agent.tag}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {agent.name}
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/30 text-slate-300">
                        <span className="font-bold text-rose-400 block mb-0.5">Vấn đề phát hiện:</span>
                        {agent.problem}
                      </div>
                      <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-emerald-200">
                        <span className="font-bold text-emerald-400 block mb-0.5">Hành động AI:</span>
                        {agent.solution}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Part 2: Roadmap & Next Phase */}
        <div className="mt-12 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm sm:text-base font-extrabold text-slate-300 uppercase tracking-wider">
                LỘ TRÌNH NÂNG CẤP TIẾP THEO (GIAI ĐOẠN 2 & 3)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-indigo-400 font-bold bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60">
              Future Architecture
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {roadmapAgents.map((agent) => {
              const Icon = agent.icon;
              return (
                <div
                  key={agent.name}
                  className="bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all duration-200 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-950/50 border border-indigo-900/40 text-indigo-400 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/40 px-2.5 py-0.5 rounded border border-indigo-900/40 uppercase tracking-wider">
                      {agent.badge}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {agent.name}
                  </h4>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {agent.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
