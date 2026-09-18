import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { callAiRouter } from '../../services/aiRouterService';
import { handoverApi, HandoverFeedbackItem, HandoverSignoffItem } from '../../services/api/handoverApi';
import {
  Bot,
  X,
  Minimize2,
  Maximize2,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  MessageSquare,
  HelpCircle,
  Clock,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Award,
  Layers,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';

type TabMode = 'walkthrough' | 'chat' | 'feedback' | 'signoff' | 'history';

interface ChatMsg {
  role: 'system' | 'assistant' | 'user';
  content: string;
  timestamp: string;
}

export const AIHandoverCopilot: React.FC = () => {
  const { currentUser, showNotification, triggerRefresh } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<TabMode>('walkthrough');

  // Walkthrough state (4 steps checklist)
  const [stepStatus, setStepStatus] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
  });

  // Chatbot state
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    {
      role: 'assistant',
      content: `Xin chào **${currentUser.name || 'Quý khách'}**! Em là **AI CEO Lucky** — Trợ lý Bàn giao & Nghiệm thu 24/7 của hệ thống FCS AI Workforce OS.\n\nEm có mặt ở đây để đồng hành cùng anh/chị: hướng dẫn kiểm tra 4 bước trong 10 phút, tiếp nhận mọi góp ý/báo lỗi và hỗ trợ ký duyệt nghiệm thu Giai đoạn 1 & 2. Anh/chị cần em hỗ trợ nội dung gì ạ?`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Feedback form state
  const [feedbackType, setFeedbackType] = useState<'BUG' | 'FEEDBACK' | 'ENHANCE' | 'QUESTION'>('BUG');
  const [feedbackPriority, setFeedbackPriority] = useState<'P0' | 'P1' | 'P2' | 'P3'>('P1');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  // Sign-off form state
  const [signerName, setSignerName] = useState(currentUser.name || '');
  const [signerTitle, setSignerTitle] = useState('Đại diện Khách hàng / Giám đốc');
  const [companyName, setCompanyName] = useState(currentUser.companyName || 'Công ty Cung ứng Lao động FCS');
  const [signNotes, setSignNotes] = useState('Xác nhận nghiệm thu đạt chuẩn GĐ1 & GĐ2 theo 4 Kịch bản kiểm tra.');
  const [signoffSubmitting, setSignoffSubmitting] = useState(false);
  const [latestSignoff, setLatestSignoff] = useState<HandoverSignoffItem | null>(null);

  // History state
  const [feedbackList, setFeedbackList] = useState<HandoverFeedbackItem[]>([]);
  const [signoffList, setSignoffList] = useState<HandoverSignoffItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load history on mount
  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    const handleOpen = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };
    window.addEventListener('fcs_handover_updated', handleUpdate);
    window.addEventListener('fcs_signoff_completed', handleUpdate);
    window.addEventListener('fcs_open_handover_copilot', handleOpen);
    return () => {
      window.removeEventListener('fcs_handover_updated', handleUpdate);
      window.removeEventListener('fcs_signoff_completed', handleUpdate);
      window.removeEventListener('fcs_open_handover_copilot', handleOpen);
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  const loadData = () => {
    const fList = handoverApi.getFeedbackHistory();
    const sList = handoverApi.getSignoffHistory();
    setFeedbackList(fList);
    setSignoffList(sList);
    if (sList.length > 0) {
      setLatestSignoff(sList[0]);
    }
  };

  const toggleStep = (step: number) => {
    setStepStatus(prev => ({ ...prev, [step]: !prev[step] }));
  };

  const completedStepsCount = Object.values(stepStatus).filter(Boolean).length;

  // Handle AI Chat
  const handleSendMessage = async (customPrompt?: string) => {
    const msgToSend = customPrompt || inputMsg.trim();
    if (!msgToSend || isAiThinking) return;

    const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMsg = { role: 'user', content: msgToSend, timestamp: timeStr };
    setChatMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInputMsg('');
    setIsAiThinking(true);

    try {
      // System instructions for AI Handover Copilot
      const systemInstruction = `Bạn là AI CEO Lucky, Trợ lý Bàn giao & Nghiệm thu tối cao của dự án FCS AI WORKFORCE OS.
Bạn đang trò chuyện với đại diện khách hàng/người dùng.
Mục tiêu:
1. Hướng dẫn khách hàng kiểm tra 4 kịch bản nghiệm thu nhanh (Giai đoạn 1: Master CRM 19 Level Sale & Excel Grid, Giai đoạn 2: Worker Care 1-3-7 ngày & Re-activation Zalo 0đ).
2. Trả lời chính xác, thông thái, lịch thiệp, thực tế và đậm chất chuyên gia điều hành.
3. Nhấn mạnh nguyên tắc Real Data (Dữ liệu thực 100%, không fake demo) và North Star Metric là VWW (Verified Working Worker).
4. Nếu khách hàng báo lỗi, hãy tiếp nhận và hướng dẫn họ sang tab 'Góp ý / Báo lỗi' để ghi nhận mã ticket.
5. Khuyến khích khách hàng ký nghiệm thu GĐ1-GĐ2 để mở khóa GĐ3 (B2B Employer & Hoa hồng xưởng).
Hãy trả lời ngắn gọn, súc tích (dưới 150 từ), dùng bullet point rõ ràng.`;

      const aiHistory = [
        { role: 'system' as const, content: systemInstruction },
        ...chatMessages.slice(-4).map(m => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: msgToSend }
      ];

      const reply = await callAiRouter(aiHistory, { modelKey: 'deepReasoning', temperature: 0.4 });
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: reply,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      // Fallback domain response if 9router is unreachable
      let fallbackText = `Em đã ghi nhận câu hỏi của anh/chị: "${msgToSend}".\n\n• Hệ thống FCS V2 hiện đã hoàn tất 100% Giai đoạn 1 & 2 với dữ liệu thực từ Google Sheets.\n• Anh/chị có thể kiểm tra 4 kịch bản tại tab "Kịch Bản 10 Phút" hoặc gửi góp ý tại tab "Báo lỗi". Em và Chairman Victor luôn trực tuyến để hoàn thiện ngay!`;
      if (msgToSend.toLowerCase().includes('vww')) {
        fallbackText = `**VWW (Verified Working Worker)** là thước đo tối thượng của hệ thống: Chỉ công nhận lao động đạt chuẩn khi dữ liệu đi làm thực tế khớp với dữ liệu chấm công từ xưởng (Foxconn/Luxshare), đảm bảo tính hoa hồng chính xác 100%.`;
      } else if (msgToSend.toLowerCase().includes('nghiệm thu')) {
        fallbackText = `Quy trình nghiệm thu tuân thủ 5 nguyên tắc: Khóa Scope GĐ1-GĐ2, chỉ kiểm tra trên Real Data, kiểm tra nhanh 4 kịch bản trong 10 phút và ký duyệt điện tử 1-Click tại tab "Ký Nghiệm Thu".`;
      }
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: fallbackText,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

  // Submit Feedback
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackContent.trim()) return;

    setFeedbackSubmitting(true);
    try {
      const res = await handoverApi.submitFeedback({
        senderName: currentUser.name || 'Khách hàng',
        senderEmail: currentUser.email,
        senderRole: currentUser.role || 'Khách hàng',
        type: feedbackType,
        priority: feedbackPriority,
        stage: 'GĐ1',
        content: feedbackContent.trim(),
      });

      showNotification(res.message, 'success');
      setFeedbackContent('');
      loadData();
      setActiveTab('history');
    } catch {
      showNotification('Không thể gửi phản hồi. Vui lòng thử lại!', 'warning');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // Submit Digital Sign-off
  const handleSubmitSignoff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName.trim()) {
      showNotification('Vui lòng nhập họ và tên người ký!', 'warning');
      return;
    }

    setSignoffSubmitting(true);
    try {
      const res = await handoverApi.submitSignoff({
        signerName: signerName.trim(),
        signerTitle: signerTitle.trim(),
        signerEmail: currentUser.email,
        companyName: companyName.trim(),
        phase: 'Giai đoạn 1 & Giai đoạn 2',
        notes: signNotes.trim(),
      });

      showNotification(res.message, 'success');
      setLatestSignoff(res.signoff);
      loadData();
      triggerRefresh();
      setActiveTab('history');
    } catch {
      showNotification('Có lỗi khi tạo chứng chỉ ký duyệt!', 'warning');
    } finally {
      setSignoffSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showNotification('Đã sao chép vào bộ nhớ tạm!', 'info');
  };

  return (
    <>
      {/* 🚀 FLOATING TRIGGER BUTTON */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-5 right-5 z-40 flex items-center space-x-2.5 px-4 py-3 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white rounded-full shadow-2xl hover:shadow-blue-500/30 hover:scale-105 border border-blue-400/40 cursor-pointer transition-all duration-300 group"
          title="Mở Trợ lý AI Bàn Giao & Nghiệm Thu 24/7"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-amber-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-900" />
          </div>
          <div className="text-left">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 flex items-center space-x-1">
              <span>Trợ Lý Bàn Giao AI</span>
              <Sparkles className="w-3 h-3 text-amber-300 inline" />
            </div>
            <div className="text-[10px] text-blue-100 font-medium">Nghiệm thu GĐ1 & GĐ2 (10 Phút)</div>
          </div>
        </button>
      )}

      {/* 📦 COPILOT MODAL / DRAWER */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ${
            isMinimized
              ? 'bottom-4 right-4 w-80 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 p-3'
              : 'bottom-4 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[540px] md:w-[600px] h-[640px] max-h-[calc(100vh-2rem)] bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-700/80 flex flex-col overflow-hidden backdrop-blur-xl'
          }`}
        >
          {/* Header Bar */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-amber-300 shadow-inner">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-xs text-white tracking-wide">AI CEO Lucky</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Bàn Giao 24/7
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">9Router • GPT-6 Astra & Claude 4.6 • FCS-000001</div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title={isMinimized ? 'Mở rộng' : 'Thu nhỏ'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-800 bg-slate-950/60 p-1 gap-1 text-[11px] font-bold shrink-0 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActiveTab('walkthrough')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                    activeTab === 'walkthrough'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>Kịch Bản 10P</span>
                  <span className="ml-1 px-1 py-0.2 text-[9px] rounded-full bg-slate-900/60 font-mono">
                    {completedStepsCount}/4
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                    activeTab === 'chat'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Hỏi Đáp AI</span>
                </button>

                <button
                  onClick={() => setActiveTab('feedback')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                    activeTab === 'feedback'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-300" />
                  <span>Báo Lỗi / Góp Ý</span>
                </button>

                <button
                  onClick={() => setActiveTab('signoff')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                    activeTab === 'signoff'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-emerald-400 hover:text-white hover:bg-emerald-950/40'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>Ký Nghiệm Thu</span>
                </button>

                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                    activeTab === 'history'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Sổ Cái ({feedbackList.length})</span>
                </button>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                {/* 🧭 TAB 1: 4 BƯỚC KIỂM TRA NHANH */}
                {activeTab === 'walkthrough' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/40 flex items-start space-x-3">
                      <Sparkles className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-extrabold text-blue-200 text-sm">Hướng Dẫn Kiểm Tra 10 Phút</div>
                        <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                          Thực hiện 4 kịch bản kiểm tra thực tế dưới đây. Bấm nút đánh dấu khi hoàn thành để chuẩn bị ký nghiệm thu GĐ1 & GĐ2.
                        </p>
                      </div>
                    </div>

                    {/* 4 Steps Checklist */}
                    <div className="space-y-2.5">
                      {/* Step 1 */}
                      <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 hover:border-slate-600 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">1</span>
                              <span className="font-extrabold text-white">Kiểm tra 5 Chỉ số KPI & VWW</span>
                            </div>
                            <p className="text-slate-400 text-[11px] pl-7">
                              Mở Dashboard kiểm tra 5 thẻ KPI đầu trang (VWW, Chờ đi làm, Đã PV...) khớp đúng 10 lao động thực tế từ Google Sheet.
                            </p>
                          </div>
                          <button
                            onClick={() => toggleStep(1)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors flex items-center space-x-1 ${
                              stepStatus[1]
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            {stepStatus[1] ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                            <span>{stepStatus[1] ? 'Đã Kiểm Tra' : 'Chưa Đạt'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 hover:border-slate-600 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">2</span>
                              <span className="font-extrabold text-white">Chạy Mẫu Golden Flow 1-Click</span>
                            </div>
                            <p className="text-slate-400 text-[11px] pl-7">
                              Bấm nút "Chạy mẫu Golden Flow" trên Dashboard, quan sát deal tự động chuyển sang L3 VWW trên Sheet thời gian thực.
                            </p>
                          </div>
                          <button
                            onClick={() => toggleStep(2)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors flex items-center space-x-1 ${
                              stepStatus[2]
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            {stepStatus[2] ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                            <span>{stepStatus[2] ? 'Đã Kiểm Tra' : 'Chưa Đạt'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 hover:border-slate-600 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">3</span>
                              <span className="font-extrabold text-white">Phễu Kanban 19 Level & Lưới Excel CRM</span>
                            </div>
                            <p className="text-slate-400 text-[11px] pl-7">
                              Vào tab Phễu tuyển dụng kéo thả deal; vào Lưới Excel sửa nhanh 1 ô dữ liệu → Sheet cập nhật 2 chiều trong 2s.
                            </p>
                          </div>
                          <button
                            onClick={() => toggleStep(3)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors flex items-center space-x-1 ${
                              stepStatus[3]
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            {stepStatus[3] ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                            <span>{stepStatus[3] ? 'Đã Kiểm Tra' : 'Chưa Đạt'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 hover:border-slate-600 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">4</span>
                              <span className="font-extrabold text-white">Hồ Sơ 360 & Chăm Sóc 1-3-7 / Re-activation</span>
                            </div>
                            <p className="text-slate-400 text-[11px] pl-7">
                              Mở hồ sơ công nhân 360 độ, kiểm tra tab chăm sóc 1-3-7 ngày và nút "Mời tái làm xưởng mới" (Re-activation Zalo 0đ).
                            </p>
                          </div>
                          <button
                            onClick={() => toggleStep(4)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors flex items-center space-x-1 ${
                              stepStatus[4]
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            {stepStatus[4] ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                            <span>{stepStatus[4] ? 'Đã Kiểm Tra' : 'Chưa Đạt'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Progress & Next CTA */}
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] font-bold text-slate-400">Tiến độ nghiệm thu</div>
                        <div className="text-base font-extrabold text-emerald-400 mt-0.5">
                          {completedStepsCount === 4 ? '🎉 Đạt 4/4 Tiêu Chí!' : `${completedStepsCount} / 4 Tiêu Chí Hoàn Tất`}
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('signoff')}
                        className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-lg shadow-md cursor-pointer flex items-center space-x-1.5"
                      >
                        <span>Ký Nghiệm Thu Ngay</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* 💬 TAB 2: HỎI ĐÁP AI */}
                {activeTab === 'chat' && (
                  <div className="flex flex-col h-full space-y-3">
                    {/* Quick suggestion chips */}
                    <div className="flex flex-wrap gap-1.5 pb-1">
                      {[
                        'VWW là gì và tại sao quan trọng?',
                        'Làm sao phân quyền Recruiter chỉ xem?',
                        'Quy trình chuyển deal từ L1 sang L2?',
                        'Tiến độ Giai đoạn 3 tiếp theo thế nào?',
                      ].map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(prompt)}
                          className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium border border-slate-700 cursor-pointer transition-colors"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 space-y-2.5 overflow-y-auto pr-1 max-h-[360px]">
                      {chatMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex items-start space-x-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {msg.role === 'assistant' && (
                            <div className="w-6 h-6 rounded-lg bg-blue-600/40 border border-blue-400/40 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
                              <Bot className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <div
                            className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                              msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none whitespace-pre-line'
                            }`}
                          >
                            <div>{msg.content}</div>
                            <div className={`text-[9px] mt-1 text-right ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                              {msg.timestamp}
                            </div>
                          </div>
                        </div>
                      ))}
                      {isAiThinking && (
                        <div className="flex items-center space-x-2 text-slate-400 text-xs">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                          <span>AI CEO Lucky đang suy nghĩ câu trả lời...</span>
                        </div>
                      )}
                      <div ref={chatBottomRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="flex items-center space-x-2 pt-2 border-t border-slate-800">
                      <input
                        type="text"
                        value={inputMsg}
                        onChange={e => setInputMsg(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Hỏi bất kỳ điều gì về hệ thống FCS..."
                        className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => handleSendMessage()}
                        disabled={isAiThinking || !inputMsg.trim()}
                        className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl cursor-pointer transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ⚡ TAB 3: BÁO LỖI / GÓP Ý NHANH */}
                {activeTab === 'feedback' && (
                  <form onSubmit={handleSubmitFeedback} className="space-y-3.5">
                    <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-[11px] text-amber-200 leading-relaxed">
                      💡 Mọi phản hồi, yêu cầu chỉnh sửa hoặc lỗi phát hiện được tự động ghi vào Sổ cái và báo cho <strong>AI CEO Lucky</strong> để tự động phân tích và fix code ngay trong phiên làm việc!
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Loại phản hồi</label>
                        <select
                          value={feedbackType}
                          onChange={e => setFeedbackType(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-medium focus:outline-none"
                        >
                          <option value="BUG">🐛 Báo lỗi (Bug)</option>
                          <option value="ENHANCE">✨ Góp ý trải nghiệm (UI/UX)</option>
                          <option value="FEEDBACK">💬 Nhận xét chung</option>
                          <option value="QUESTION">❓ Thắc mắc nghiệp vụ</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Mức độ ưu tiên</label>
                        <select
                          value={feedbackPriority}
                          onChange={e => setFeedbackPriority(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-medium focus:outline-none"
                        >
                          <option value="P0">🔴 P0 - Chặn (Sập web / Mất data)</option>
                          <option value="P1">🟠 P1 - Nghiêm trọng (Chức năng sai)</option>
                          <option value="P2">🟡 P2 - Bình thường (Giao diện/Font)</option>
                          <option value="P3">🟢 P3 - Mong muốn mở rộng</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Nội dung chi tiết</label>
                      <textarea
                        rows={4}
                        value={feedbackContent}
                        onChange={e => setFeedbackContent(e.target.value)}
                        placeholder="Mô tả cụ thể: Nút nào, trang nào, kết quả mong đợi là gì..."
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={feedbackSubmitting || !feedbackContent.trim()}
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center space-x-2"
                    >
                      {feedbackSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span>Gửi Phản Hồi Cho AI CEO Lucky</span>
                    </button>
                  </form>
                )}

                {/* ✍️ TAB 4: KÝ DUYỆT NGHIỆM THU */}
                {activeTab === 'signoff' && (
                  <form onSubmit={handleSubmitSignoff} className="space-y-3.5">
                    <div className="p-3 bg-emerald-950/40 border border-emerald-700/50 rounded-xl flex items-start space-x-2.5">
                      <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-extrabold text-emerald-300 text-xs">Biên Bản Nghiệm Thu Số Giai Đoạn 1 & 2</div>
                        <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                          Xác nhận hoàn tất GĐ1 (Core & 19 Level Sale) và GĐ2 (Worker Care 1-3-7 ngày & Re-activation 0đ). Hệ thống sẽ cấp chứng chỉ số và mở khóa triển khai Giai đoạn 3.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Họ và Tên Người Ký</label>
                        <input
                          type="text"
                          value={signerName}
                          onChange={e => setSignerName(e.target.value)}
                          placeholder="Ví dụ: Nguyễn Văn A"
                          className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">Chức Vụ</label>
                          <input
                            type="text"
                            value={signerTitle}
                            onChange={e => setSignerTitle(e.target.value)}
                            placeholder="Giám Đốc / Trưởng Phòng"
                            className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">Đơn Vị / Doanh Nghiệp</label>
                          <input
                            type="text"
                            value={companyName}
                            onChange={e => setCompanyName(e.target.value)}
                            placeholder="Công ty Cung ứng Lao động FCS"
                            className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Nội Dung Xác Nhận</label>
                        <textarea
                          rows={3}
                          value={signNotes}
                          onChange={e => setSignNotes(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={signoffSubmitting || !signerName.trim()}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-lg cursor-pointer transition-all flex items-center justify-center space-x-2"
                    >
                      {signoffSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4 text-amber-300" />}
                      <span>KÝ XÁC NHẬN NGHIỆM THU GĐ 1 & 2 (1-CLICK)</span>
                    </button>

                    {latestSignoff && (
                      <div className="p-3 bg-slate-950 border border-emerald-500/40 rounded-xl space-y-1 text-[11px]">
                        <div className="text-emerald-400 font-extrabold flex items-center space-x-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Chứng chỉ đã ký: {latestSignoff.certificateId}</span>
                        </div>
                        <div className="text-slate-400">
                          Người ký: <strong>{latestSignoff.signerName}</strong> ({latestSignoff.signerTitle}) lúc {latestSignoff.timestamp}
                        </div>
                        <div className="font-mono text-[10px] text-slate-500 truncate">
                          Hash: {latestSignoff.hash}
                        </div>
                      </div>
                    )}
                  </form>
                )}

                {/* 📜 TAB 5: SỔ CÁI & AUDIT TRAIL */}
                {activeTab === 'history' && (
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white text-xs">Nhật Ký Phản Hồi & Ký Duyệt</span>
                      <span className="text-[10px] font-mono text-slate-400">{feedbackList.length} Bản ghi</span>
                    </div>

                    {/* Sign-offs List */}
                    {signoffList.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Chứng chỉ Nghiệm Thu</div>
                        {signoffList.map((sig, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-600/40 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-emerald-300">{sig.certificateId}</span>
                              <span className="text-[10px] text-slate-400">{sig.timestamp}</span>
                            </div>
                            <div className="text-slate-300 text-[11px]">
                              {sig.signerName} • {sig.signerTitle} ({sig.companyName})
                            </div>
                            <div className="text-slate-400 text-[10px] italic">"{sig.notes}"</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Feedback List */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lịch Sử Phản Hồi & Báo Lỗi</div>
                      {feedbackList.map((fb, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5">
                              <span className={`px-1.5 py-0.2 rounded font-mono font-bold text-[9px] ${
                                fb.priority === 'P0' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                                fb.priority === 'P1' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              }`}>
                                {fb.priority}
                              </span>
                              <span className="font-bold text-white text-[11px]">{fb.id}</span>
                              <span className="text-[10px] text-slate-400">• {fb.senderName}</span>
                            </div>
                            <span className={`text-[10px] font-extrabold ${
                              fb.status === 'FIXED' ? 'text-emerald-400' : 'text-amber-400'
                            }`}>
                              {fb.status === 'FIXED' ? '✅ ĐÃ XỬ LÝ' : '⏳ ĐANG XỬ LÝ'}
                            </span>
                          </div>
                          <div className="text-slate-200 text-[11px]">{fb.content}</div>
                          {fb.actionTaken && (
                            <div className="text-[10px] text-emerald-400 bg-emerald-950/30 border border-emerald-800/30 p-1.5 rounded-md mt-1">
                              <strong>AI CEO Lucky:</strong> {fb.actionTaken}
                            </div>
                          )}
                          <div className="text-[9px] text-slate-500">{fb.timestamp}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
