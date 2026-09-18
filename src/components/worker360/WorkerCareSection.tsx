import React, { useState } from 'react';
import { Worker } from '../../types';
import {
  HeartHandshake,
  Sparkles,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertTriangle,
  Smile,
  Meh,
  Frown,
  PhoneCall,
  Clock,
  Calendar,
  ExternalLink,
  Copy,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface WorkerCareSectionProps {
  worker?: Worker | null;
  workerId?: string;
  workerName?: string;
  phone?: string;
  currentStatus?: string;
  factoryName?: string;
  startDate?: string;
  onRefresh?: () => void;
}

interface CareLogItem {
  id: string;
  milestone: 'DAY_1' | 'DAY_3' | 'DAY_7' | 'ROUTINE';
  date: string;
  sentiment: 'HAPPY' | 'NEUTRAL' | 'CONCERNED' | 'RISK_QUIT';
  notes: string;
  actor: string;
}

export const WorkerCareSection: React.FC<WorkerCareSectionProps> = ({
  worker,
  workerId: propWorkerId,
  workerName: propWorkerName,
  phone: propPhone,
  currentStatus: propCurrentStatus,
  factoryName: propFactoryName,
  startDate: propStartDate,
  onRefresh,
}) => {
  const { showNotification, currentUser } = useApp();
  const [selectedMilestone, setSelectedMilestone] = useState<'DAY_1' | 'DAY_3' | 'DAY_7'>('DAY_1');
  const [copied, setCopied] = useState(false);
  const [sentiment, setSentiment] = useState<'HAPPY' | 'NEUTRAL' | 'CONCERNED' | 'RISK_QUIT'>('HAPPY');
  const [noteInput, setNoteInput] = useState('');
  const [saving, setSaving] = useState(false);

  const wId = worker?.workerId || propWorkerId || 'WK-000001';
  const wName = worker?.fullName || propWorkerName || 'Lao động';
  const wPhone = worker?.phone || propPhone || '';
  const cleanPhone = wPhone.replace(/\D/g, '');
  const partnerName = worker?.partnerName || propFactoryName || 'Foxconn KCN Quang Châu';

  // Local storage persisted care logs per worker
  const storageKey = `fcs_worker_care_logs_${wId}`;
  const [logs, setLogs] = useState<CareLogItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'care-init-1',
        milestone: 'DAY_1',
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        sentiment: 'HAPPY',
        notes: 'Công nhân đã nhận phòng KTX sạch sẽ, bữa ăn ca trưa ổn định.',
        actor: 'Cán bộ hiện trường',
      },
    ];
  });

  // Kịch bản tin nhắn Zalo chăm sóc Onboarding 3 mốc vàng
  const careScripts = {
    DAY_1: `Chào anh/chị ${wName}, em là quản lý nhân sự tại FCS.
Chúc mừng anh/chị đã hoàn thành ngày làm việc đầu tiên tại ${partnerName}!
Em nhắn tin hỏi thăm xem chỗ ở ký túc xá, bữa ăn ca và tuyến xe đưa đón hôm nay có thuận lợi với anh/chị không ạ?
Nếu cần hỗ trợ bất kỳ việc gì, anh/chị cứ nhắn lại cho em ngay nhé! Chúc anh/chị buổi tối nghỉ ngơi vui vẻ!`,
    DAY_3: `Chào anh/chị ${wName}, em là quản lý nhân sự FCS.
Anh/chị đã làm việc được 3 ngày tại ${partnerName} rồi, công việc và dây chuyền thao tác đã quen tay chưa ạ?
Các anh chị tổ trưởng và đồng nghiệp trong xưởng hướng dẫn có dễ hiểu không anh/chị?
Giai đoạn mấy ngày đầu bao giờ cũng hơi bỡ ngỡ, nếu có vướng mắc gì anh/chị chia sẻ với em để em báo xưởng hỗ trợ anh/chị tốt nhất nhé!`,
    DAY_7: `Chào anh/chị ${wName}, em là nhân sự FCS.
Tuyệt vời quá, anh/chị đã hoàn thành trọn vẹn tuần làm việc đầu tiên tại ${partnerName}!
FCS xin chúc mừng anh/chị đã chính thức vượt qua giai đoạn làm quen việc. Em chúc anh/chị tuần tới làm việc nhiều năng lượng, tích lũy đủ ngày công để nhận trọn gói phụ cấp và thưởng chuyên cần của nhà máy nhé!`,
  };

  const currentScript = careScripts[selectedMilestone];

  const handleCopyScript = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showNotification('Đã sao chép kịch bản tin nhắn chăm sóc!', 'info');
    }
  };

  const handleOpenZalo = () => {
    handleCopyScript();
    if (cleanPhone) {
      window.open(`https://zalo.me/${cleanPhone}`, '_blank');
    } else {
      showNotification('Lao động chưa có số điện thoại hợp lệ', 'warning');
    }
  };

  const handleSaveLog = () => {
    if (!noteInput.trim()) {
      showNotification('Vui lòng nhập ghi chú tâm tư của lao động', 'warning');
      return;
    }
    setSaving(true);
    const newLog: CareLogItem = {
      id: `care-${Date.now()}`,
      milestone: selectedMilestone,
      date: new Date().toISOString(),
      sentiment: sentiment,
      notes: noteInput.trim(),
      actor: currentUser.name || currentUser.email || 'Quản lý vận hành',
    };

    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedLogs));
    } catch (e) {}

    setNoteInput('');
    setSaving(false);
    showNotification(
      sentiment === 'RISK_QUIT'
        ? 'ĐÃ BÁO ĐỘNG NGUY CƠ NGHỈ VIỆC! Quản lý và hiện trường cần hỗ trợ khẩn cấp.'
        : 'Đã lưu nhật ký chăm sóc lao động thành công!',
      sentiment === 'RISK_QUIT' ? 'warning' : 'success'
    );
  };

  const milestoneLabels = {
    DAY_1: 'Mốc Ngày 1 (Ổn định nơi ở & xe)',
    DAY_3: 'Mốc Ngày 3 (Khủng hoảng thích nghi)',
    DAY_7: 'Mốc Ngày 7 (Vượt thử thách Onboarding)',
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 rounded-2xl p-5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-white/20 uppercase tracking-wider text-emerald-200">
              <Sparkles className="w-3 h-3" />
              <span>Giai Đoạn 2: AI Talent CRM</span>
            </span>
            <span className="text-xs text-emerald-100 font-medium">• Chăm sóc Onboarding 3 mốc vàng</span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1 flex items-center space-x-2">
            <HeartHandshake className="w-6 h-6 text-emerald-300" />
            <span>Chăm Sóc & Giữ Chân Lao Động (Worker Care)</span>
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1 max-w-2xl">
            Lắng nghe tâm tư người lao động tại 3 mốc thời gian vàng (Ngày 1, Ngày 3, Ngày 7) nhằm triệt tiêu nguy cơ bỏ việc sớm (L3.1) và nâng cao tỷ lệ giữ chân VWW.
          </p>
        </div>

        {/* Nút hành động nhanh Zalo / Phone */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleOpenZalo}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>MỞ ZALO CHĂM SÓC</span>
          </button>
          <a
            href={cleanPhone ? `tel:${cleanPhone}` : undefined}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-300" />
            <span>GỌI ĐIỆN</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 2. Cột Trái (7 cols): Kịch bản hỏi thăm 3 mốc vàng */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Chọn Mốc Chăm Sóc Onboarding</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Xưởng: <strong className="text-slate-800">{partnerName}</strong>
              </span>
            </div>

            {/* 3 Mốc Selector */}
            <div className="grid grid-cols-3 gap-2">
              {(['DAY_1', 'DAY_3', 'DAY_7'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMilestone(m)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedMilestone === m
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 font-extrabold shadow-2xs ring-1 ring-emerald-500'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-600 font-semibold'
                  }`}
                >
                  <div className="text-xs">{m === 'DAY_1' ? 'Ngày 1' : m === 'DAY_3' ? 'Ngày 3' : 'Ngày 7'}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {m === 'DAY_1' ? 'Nơi ở & Xe' : m === 'DAY_3' ? 'Thích nghi' : 'Ổn định'}
                  </div>
                </button>
              ))}
            </div>

            {/* Hộp Kịch Bản Zalo Tự Động */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Kịch bản tin nhắn mẫu ({milestoneLabels[selectedMilestone]}):</span>
                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="inline-flex items-center space-x-1 text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer text-[11px]"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Đã copy!' : 'Copy kịch bản'}</span>
                </button>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 whitespace-pre-line leading-relaxed font-sans select-all">
                {currentScript}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400 italic">
                  *Bấm "GỬI QUA ZALO" để tự động copy và mở chat Zalo với lao động
                </span>
                <button
                  type="button"
                  onClick={handleOpenZalo}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>GỬI QUA ZALO</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Form Ghi nhận Tâm tư & Cảnh báo Sớm */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-100 pb-2">
              <Smile className="w-4 h-4 text-amber-500" />
              <span>Ghi Nhận Phản Hồi & Đánh Giá Tâm Tư</span>
            </span>

            {/* Trạng thái tâm tư 4 nấc */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Tâm lý & Mức độ thích nghi:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: 'HAPPY', label: 'Hài lòng', icon: Smile, color: 'text-emerald-600 bg-emerald-50 border-emerald-300' },
                  { key: 'NEUTRAL', label: 'Bình thường', icon: Meh, color: 'text-blue-600 bg-blue-50 border-blue-300' },
                  { key: 'CONCERNED', label: 'Lo lắng / Mệt', icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 border-amber-300' },
                  { key: 'RISK_QUIT', label: '🚨 Nguy cơ bỏ', icon: Frown, color: 'text-rose-600 bg-rose-50 border-rose-300' },
                ].map(item => {
                  const Icon = item.icon;
                  const isSelected = sentiment === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setSentiment(item.key as any)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                        isSelected
                          ? `${item.color} font-black shadow-xs ring-2 ring-emerald-500`
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-medium'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px]">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ghi chú phản hồi thực tế */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Ghi chú chi tiết từ cuộc gọi/tin nhắn:</label>
              <textarea
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                rows={2}
                placeholder="Ví dụ: Công nhân khen ký túc xá rộng, cơm ca ngon; hoặc kêu xưởng tăng ca nhiều hơi mệt cần động viên..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleSaveLog}
                disabled={saving}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{saving ? 'ĐANG LƯU...' : 'LƯU NHẬT KÝ CHĂM SÓC'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Cột Phải (5 cols): Lịch sử chăm sóc đã ghi nhận */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Lịch Sử Chăm Sóc ({logs.length})</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400">Timeline</span>
            </div>

            {logs.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Chưa có nhật ký chăm sóc nào. Hãy gửi tin nhắn mốc Ngày 1 cho lao động!
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {logs.map(log => {
                  const isRisk = log.sentiment === 'RISK_QUIT';
                  return (
                    <div
                      key={log.id}
                      className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                        isRisk
                          ? 'border-rose-300 bg-rose-50/60'
                          : 'border-slate-200 bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 font-mono text-[11px]">
                          {log.milestone === 'DAY_1'
                            ? 'Mốc Ngày 1'
                            : log.milestone === 'DAY_3'
                            ? 'Mốc Ngày 3'
                            : log.milestone === 'DAY_7'
                            ? 'Mốc Ngày 7'
                            : 'Định kỳ'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] ${
                            log.sentiment === 'HAPPY'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.sentiment === 'NEUTRAL'
                              ? 'bg-blue-100 text-blue-800'
                              : log.sentiment === 'CONCERNED'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-600 text-white'
                          }`}
                        >
                          {log.sentiment === 'HAPPY'
                            ? '😊 Hài lòng'
                            : log.sentiment === 'NEUTRAL'
                            ? '😐 Bình thường'
                            : log.sentiment === 'CONCERNED'
                            ? '⚠️ Lo lắng'
                            : '🚨 Nguy cơ bỏ'}
                        </span>
                      </div>

                      <p className="text-slate-700 leading-relaxed text-[11px]">{log.notes}</p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/50">
                        <span>Bởi: {log.actor}</span>
                        <span>{new Date(log.date).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
