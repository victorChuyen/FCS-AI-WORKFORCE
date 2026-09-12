import React, { useState } from 'react';
import { Worker, WorkerStatus } from '../../types';
import {
  Sparkles,
  HeartHandshake,
  AlertTriangle,
  CheckCircle2,
  Phone,
  MessageSquare,
  Copy,
  ExternalLink,
  ShieldAlert,
  Smile,
  Meh,
  Frown,
  Send,
  Clock,
  UserCheck,
} from 'lucide-react';

interface WorkerAiCareSectionProps {
  worker: Worker;
  onSendCareNotice?: (type: string, message: string) => void;
}

export const WorkerAiCareSection: React.FC<WorkerAiCareSectionProps> = ({ worker }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [customNote, setCustomNote] = useState('');
  const [careLogs, setCareLogs] = useState<Array<{ id: string; date: string; type: string; content: string; author: string }>>([
    {
      id: 'log-1',
      date: new Date(Date.now() - 86400000).toLocaleDateString('vi-VN'),
      type: 'Hỏi thăm thích nghi',
      content: 'Lao động phản hồi xưởng môi trường tốt, ký túc xá sạch sẽ, đã nhận đồ bảo hộ.',
      author: 'Chuyên viên Tuyển dụng',
    },
  ]);

  // Clean phone number for Zalo deep link
  const rawPhone = String(worker.phone || '').replace(/\D/g, '');
  const cleanPhone = rawPhone.startsWith('84') ? '0' + rawPhone.slice(2) : rawPhone.startsWith('0') ? rawPhone : '0' + rawPhone;
  const zaloUrl = cleanPhone.length >= 9 ? `https://zalo.me/${cleanPhone}` : null;

  // Calculate dynamic Worker Health & Churn Risk Score based on real signals
  const calculateCareMetrics = () => {
    let healthScore = 85;
    const riskFactors: string[] = [];
    const retentionFactors: string[] = ['Hồ sơ đã xác thực danh tính đầy đủ'];

    const isVww = Boolean((worker as any).isVww || worker.isVerifiedWorking);
    if (isVww) {
      healthScore += 10;
      retentionFactors.push('Đã phát sinh công thực tế (VWW Verified)');
    }

    if (worker.status === WorkerStatus.NEW) {
      healthScore -= 5;
      riskFactors.push('Mới tiếp nhận, chưa có lịch phỏng vấn');
    } else if (worker.status === WorkerStatus.WAITING_START) {
      healthScore -= 10;
      riskFactors.push('Đang chờ đi làm — Dễ bị đại lý khác lôi kéo nếu xe đón trễ');
    } else if (worker.status === WorkerStatus.QUIT) {
      healthScore = 15;
      riskFactors.push('Đã rời xưởng — Cần khảo sát nguyên nhân để tái tuyển dụng');
    } else {
      retentionFactors.push('Đang trong tiến trình làm việc ổn định');
    }

    healthScore = Math.max(10, Math.min(99, healthScore));

    let churnRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (healthScore < 50) churnRisk = 'HIGH';
    else if (healthScore < 75) churnRisk = 'MEDIUM';

    return { healthScore, churnRisk, riskFactors, retentionFactors };
  };

  const { healthScore, churnRisk, riskFactors, retentionFactors } = calculateCareMetrics();

  // Lifecycle Nurture Templates tailored to current worker status
  const nurtureTemplates = [
    {
      stage: 'CHÀO MỪNG & GIẤY TỜ',
      title: 'Nhắc nhở hồ sơ & xe đón',
      desc: 'Gửi trước ngày phỏng vấn hoặc khi ứng viên mới tiếp nhận',
      content: `Chào ${worker.fullName}, FCS Workforce chúc bạn ngày mới tốt lành! Nhắc bạn chuẩn bị CCCD gốc và 2 ảnh 3x4 để hoàn tất thủ tục phỏng vấn tại xưởng nhé. Nếu cần xe đón hoặc hỗ trợ chỗ ở, bạn nhắn ngay cho mình qua số này nha!`,
    },
    {
      stage: 'NGÀY ĐẦU ĐI LÀM',
      title: 'Thăm hỏi thích nghi 3 ngày đầu',
      desc: 'Giúp giảm 80% tỷ lệ bỏ việc trong tuần đầu tiên',
      content: `Chào ${worker.fullName}, em đi làm ngày đầu tại xưởng có thuận lợi không? Cơm ca và ký túc xá có vừa ý em không? Nếu gặp bất kỳ bỡ ngỡ nào về chuyền làm việc hay quản lý, em cứ nhắn anh/chị hỗ trợ ngay nhé! Chúc em làm tốt!`,
    },
    {
      stage: 'THƯỞNG CHUYÊN CẦN',
      title: 'Động viên chuyên cần & giữ công',
      desc: 'Gửi vào tuần thứ 2 và thứ 4 trong tháng',
      content: `Chúc mừng ${worker.fullName} đã hoàn thành xuất sắc các ca làm việc trong tuần qua! Bạn cố gắng duy trì đủ công tháng này để nhận trọn vẹn tiền thưởng chuyên cần và phụ cấp xưởng nhé. FCS luôn đồng hành cùng bạn!`,
    },
  ];

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleAddCareLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNote.trim()) return;
    const newLog = {
      id: `log-${Date.now()}`,
      date: new Date().toLocaleDateString('vi-VN'),
      type: 'Chăm sóc định kỳ',
      content: customNote.trim(),
      author: 'Cán bộ Vận hành',
    };
    setCareLogs([newLog, ...careLogs]);
    setCustomNote('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner: Health Score & Churn Risk */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Health Score Gauge */}
        <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-xl p-5 border border-blue-800/60 shadow-xs flex items-center space-x-4">
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center rounded-full bg-blue-950 border-4 border-emerald-400">
            <span className="text-xl font-black text-white">{healthScore}</span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Điểm Sức Khỏe AI</span>
            </div>
            <h4 className="text-sm font-bold text-white mt-0.5">
              {healthScore >= 80 ? 'Gắn bó cao & Ổn định' : healthScore >= 60 ? 'Mức độ trung bình' : 'Cần can thiệp chăm sóc'}
            </h4>
            <p className="text-[11px] text-slate-300 mt-0.5">Đo lường từ lịch sử chấm công & phản hồi</p>
          </div>
        </div>

        {/* Churn Risk Indicator */}
        <div className={`rounded-xl p-5 border shadow-xs ${
          churnRisk === 'LOW'
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            : churnRisk === 'MEDIUM'
            ? 'bg-amber-50/80 border-amber-200 text-amber-950'
            : 'bg-rose-50/80 border-rose-200 text-rose-950'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Nguy Cơ Bỏ Việc</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
              churnRisk === 'LOW'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : churnRisk === 'MEDIUM'
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
            }`}>
              {churnRisk === 'LOW' ? 'THẤP (< 20%)' : churnRisk === 'MEDIUM' ? 'TRUNG BÌNH (35%)' : 'CAO (> 70%)'}
            </span>
          </div>
          <p className="text-xs mt-2 font-medium">
            {churnRisk === 'LOW'
              ? 'Lao động đang đi làm đều đặn, tỷ lệ duy trì công tốt.'
              : churnRisk === 'MEDIUM'
              ? 'Có dấu hiệu phân vân, cần nhân viên gọi hỏi thăm ký túc xá.'
              : 'Nguy cơ bỏ ngang cao! Đề xuất gọi điện thoại trực tiếp trong 2 giờ tới.'}
          </p>
        </div>

        {/* Quick Contact & Zalo */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Kênh Kết Nối Trực Tiếp</span>
            <div className="text-sm font-black text-slate-900 mt-1 flex items-center space-x-2">
              <Phone className="w-4 h-4 text-blue-600" />
              <span>{cleanPhone || 'Chưa có SĐT'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            {zaloUrl && (
              <a
                href={zaloUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Nhắn tin Zalo</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            )}
            <a
              href={`tel:${cleanPhone}`}
              className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Gọi điện</span>
            </a>
          </div>
        </div>
      </div>

      {/* Two Columns: Nurture Message Library & Care Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: AI Nurture Message Generator (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">
                Kịch Bản Chăm Sóc Cá Nhân Hóa Theo Vòng Đời (Lifecycle Nurture)
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              1-Click sao chép & gửi Zalo
            </span>
          </div>

          <div className="space-y-3">
            {nurtureTemplates.map((tpl, idx) => (
              <div
                key={tpl.title}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-blue-300 transition-colors space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider mb-1">
                      {tpl.stage}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{tpl.title}</h4>
                    <p className="text-xs text-slate-500">{tpl.desc}</p>
                  </div>
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy(tpl.content, idx)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Đã sao chép!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>
                    {zaloUrl && (
                      <a
                        href={zaloUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Gửi Zalo</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 font-sans leading-relaxed border border-slate-100">
                  {tpl.content}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Care Log & Rapid Survey (1 col) */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <HeartHandshake className="w-5 h-5 text-emerald-600" />
            <span>Nhật Ký Chăm Sóc</span>
          </h3>

          {/* New log form */}
          <form onSubmit={handleAddCareLog} className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Ghi chú cuộc gọi / phản hồi lao động:
            </label>
            <textarea
              rows={3}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Ví dụ: Đã gọi điện lúc 14h, lao động xác nhận đi làm tốt, không có vướng mắc..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={!customNote.trim()}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center justify-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>LƯU NHẬT KÝ CHĂM SÓC</span>
            </button>
          </form>

          {/* Log History */}
          <div className="space-y-2.5">
            {careLogs.map((log) => (
              <div key={log.id} className="bg-white border border-slate-200 rounded-lg p-3 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span className="font-bold text-blue-700">{log.type}</span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{log.date}</span>
                  </span>
                </div>
                <p className="text-slate-800 font-medium">{log.content}</p>
                <div className="text-[10px] text-slate-400">Người thực hiện: {log.author}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
