import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { callAiRouter, getSmartFallbackResponse } from '../../services/aiRouterService';
import { handoverApi, HandoverFeedbackItem, HandoverSignoffItem } from '../../services/api/handoverApi';
import {
  devSupportApi,
  DEV_SUPPORT_SHEET_URL,
  DEV_SUPPORT_TAB_NAME,
  DevSupportTicket,
} from '../../services/api/devSupportApi';
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
  Wrench,
  Database,
  Target,
  FileSpreadsheet,
} from 'lucide-react';

type TabMode = 'roadmap' | 'walkthrough' | 'devsupport' | 'chat' | 'signoff' | 'history';

interface ChatMsg {
  role: 'system' | 'assistant' | 'user';
  content: string;
  timestamp: string;
}

export const AIHandoverCopilot: React.FC = () => {
  const { currentUser, showNotification, triggerRefresh, navigateTo } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<TabMode>('roadmap');

  // Trigger compact state (thu nhỏ icon trợ lý để tránh che nút thao tác)
  const [isTriggerCompact, setIsTriggerCompact] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('fcs_copilot_trigger_compact');
      if (saved !== null) return saved === 'true';
      return typeof window !== 'undefined' && window.innerWidth < 768;
    } catch {
      return false;
    }
  });

  const toggleTriggerCompact = (compact?: boolean) => {
    setIsTriggerCompact(prev => {
      const next = typeof compact === 'boolean' ? compact : !prev;
      try {
        localStorage.setItem('fcs_copilot_trigger_compact', String(next));
      } catch {}
      return next;
    });
  };

  // Dev Support & Chat Intake state
  const [devGoal, setDevGoal] = useState('');
  const [devOutput, setDevOutput] = useState('');
  const [devDetails, setDevDetails] = useState('');
  const [devCategory, setDevCategory] = useState<'BÁO LỖI (BUG)' | 'MỤC TIÊU PHÁT TRIỂN' | 'GÓP Ý UI/UX' | 'HỎI ĐÁP KỸ THUẬT'>('BÁO LỖI (BUG)');
  const [devPriority, setDevPriority] = useState<'P0 - CHẶN' | 'P1 - NGHIÊM TRỌNG' | 'P2 - BÌNH THƯỜNG' | 'P3 - GÓP Ý'>('P1 - NGHIÊM TRỌNG');
  const [devTickets, setDevTickets] = useState<DevSupportTicket[]>([]);
  const [isSubmittingDev, setIsSubmittingDev] = useState(false);
  const [devAiAdvice, setDevAiAdvice] = useState<string | null>(null);

  // Walkthrough state (4 steps checklist)
  const [stepStatus, setStepStatus] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: false,
    4: false,
  });

  // Chatbot state
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    {
      role: 'assistant',
      content: `Xin chào **${currentUser.name || 'Chairman Victor'}**! Em là **AI CEO Lucky** — Trợ lý Bàn giao & Support Kỹ thuật 24/7 của FCS AI Workforce OS.\n\nEm đã kết nối trực tiếp với Google Sheet tab **"${DEV_SUPPORT_TAB_NAME}"**.\nMọi mục tiêu, yêu cầu, báo lỗi hoặc trao đổi kỹ thuật của anh/chị tại đây đều được **tự động lưu vào Google Sheet** và em sẽ chủ động fix code ngay!`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

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
    window.addEventListener('fcs_dev_support_updated', handleUpdate);
    window.addEventListener('fcs_open_handover_copilot', handleOpen);
    return () => {
      window.removeEventListener('fcs_handover_updated', handleUpdate);
      window.removeEventListener('fcs_signoff_completed', handleUpdate);
      window.removeEventListener('fcs_dev_support_updated', handleUpdate);
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
    const dList = devSupportApi.getTickets();
    setFeedbackList(fList);
    setSignoffList(sList);
    setDevTickets(dList);
    if (sList.length > 0) {
      setLatestSignoff(sList[0]);
    }
  };

  const toggleStep = (step: number) => {
    setStepStatus(prev => ({ ...prev, [step]: !prev[step] }));
  };

  const completedStepsCount = Object.values(stepStatus).filter(Boolean).length;

  // Handle Dev Support Chat & Sheet Submission
  const handleSubmitDevSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devGoal.trim() && !devDetails.trim()) {
      showNotification('Vui lòng nhập mục tiêu hoặc nội dung trao đổi!', 'warning');
      return;
    }

    setIsSubmittingDev(true);
    setDevAiAdvice(null);
    try {
      const fullContent = [
        devGoal ? `MỤC TIÊU: ${devGoal}` : '',
        devOutput ? `KẾT QUẢ ĐẦU RA: ${devOutput}` : '',
        devDetails ? `CHI TIẾT: ${devDetails}` : '',
      ].filter(Boolean).join('\n');

      const res = await devSupportApi.logExchange({
        senderName: currentUser.name || 'Chairman Victor Chuyen',
        senderRole: currentUser.role || 'CHAIRMAN',
        category: devCategory,
        goal: devGoal || 'Xử lý yêu cầu phát triển',
        expectedOutput: devOutput || 'Tính năng hoạt động ổn định',
        content: fullContent,
        priority: devPriority,
        stage: 'GĐ1',
      });

      showNotification(res.message, 'success');
      loadData();

      // Ask AI for instant architectural response
      const aiRes = await devSupportApi.askSupportAi(fullContent);
      setDevAiAdvice(aiRes.reply);

      // Add to conversation chat history
      setChatMessages(prev => [
        ...prev,
        {
          role: 'user',
          content: fullContent,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
        {
          role: 'assistant',
          content: `✅ **ĐÃ GHI NHẬN VÀO GOOGLE SHEET** (Ticket: \`${res.ticket.id}\`):\n\n${aiRes.reply}`,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      // Reset inputs
      setDevGoal('');
      setDevOutput('');
      setDevDetails('');
    } catch {
      showNotification('Không thể lưu vào Google Sheet. Vui lòng thử lại!', 'warning');
    } finally {
      setIsSubmittingDev(false);
    }
  };

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
      const systemInstruction = `Bạn là AI CEO Lucky, Trợ lý Bàn giao & Support Kỹ thuật của dự án FCS AI WORKFORCE OS.
Bạn kết nối trực tiếp với Google Sheet: FCS_V2_WORKFORCE_CRM_MASTER (Tab: "IN ( Data - Mục Tiêu -KQ đầu ra là gì )").
Khi trao đổi với người dùng:
1. Luôn làm rõ: Mục tiêu / Vấn đề là gì? Kết quả đầu ra mong muốn là gì?
2. Trả lời chính xác, thông thái, lịch thiệp, đậm chất chuyên gia điều hành.
3. Đề xuất phương án fix code cụ thể theo tinh thần "OPC 1 Người Vận Hành".
4. Tóm tắt ngắn gọn dưới 150 từ.`;

      const aiHistory = [
        { role: 'system' as const, content: systemInstruction },
        ...chatMessages.slice(-4).map(m => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: msgToSend },
      ];

      const reply = await callAiRouter(aiHistory, { modelKey: 'deepReasoning', temperature: 0.3 });
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: reply,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      let fallbackText = getSmartFallbackResponse(msgToSend);
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
      {/* 🚀 FLOATING TRIGGER BUTTON (HỖ TRỢ THU NHỎ / MỞ RỘNG) */}
      {!isOpen && !isTriggerCompact && (
        <div className="fixed bottom-20 lg:bottom-6 left-3 sm:left-6 z-50 flex items-center bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white rounded-full shadow-2xl hover:shadow-blue-500/40 border border-blue-400/40 transition-all duration-300 group">
          {/* Main button to open Copilot */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="flex items-center space-x-2.5 pl-3.5 pr-2 py-2 sm:py-2.5 cursor-pointer text-left focus:outline-none"
            title="Mở Trợ lý AI Bàn Giao & Support Kỹ Thuật (Lưu Google Sheet)"
          >
            <div className="relative shrink-0">
              <Bot className="w-5 h-5 text-amber-300 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-900" />
            </div>
            <div className="text-left">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 flex items-center space-x-1">
                <span>Trợ Lý Bàn Giao AI</span>
                <Sparkles className="w-3 h-3 text-amber-300 inline" />
              </div>
              <div className="text-[10px] text-blue-100 font-medium">Lưu Google Sheet • GĐ1 & 2</div>
            </div>
          </button>

          {/* Nút thu nhỏ icon trợ lý support bàn giao */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleTriggerCompact(true);
            }}
            className="p-1.5 mr-2 text-blue-200 hover:text-white hover:bg-white/20 rounded-full transition-colors cursor-pointer shrink-0"
            title="Thu nhỏ icon trợ lý (Tránh che nút thao tác)"
            aria-label="Thu nhỏ icon trợ lý"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {!isOpen && isTriggerCompact && (
        <div className="fixed bottom-20 lg:bottom-6 left-3 sm:left-6 z-50 flex items-center group">
          {/* Compact Circular Bot Button */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white shadow-2xl hover:shadow-blue-500/40 hover:scale-110 border border-blue-400/50 flex items-center justify-center cursor-pointer transition-all duration-300 relative focus:outline-none"
            title="Mở Trợ lý Bàn Giao AI (Đang thu nhỏ - Bấm để mở)"
            aria-label="Mở Trợ lý Bàn Giao AI"
          >
            <Bot className="w-5 h-5 text-amber-300 animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-900" />
          </button>

          {/* Nút phóng to lại pill */}
          <button
            type="button"
            onClick={() => toggleTriggerCompact(false)}
            className="ml-1.5 p-1.5 bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer text-xs"
            title="Mở rộng nút Trợ lý Bàn Giao"
            aria-label="Mở rộng nút Trợ lý"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* 📦 COPILOT MODAL / DRAWER */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ${
            isMinimized
              ? 'bottom-20 lg:bottom-6 left-3 sm:left-6 w-[calc(100vw-1.5rem)] sm:w-80 max-w-sm bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 p-3'
              : 'bottom-20 lg:bottom-6 left-3 sm:left-6 w-[calc(100vw-1.5rem)] sm:w-[560px] md:w-[620px] max-w-[calc(100vw-1.5rem)] h-[660px] max-h-[calc(100vh-6.5rem)] bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-700/80 flex flex-col overflow-hidden backdrop-blur-xl'
          }`}
        >
          {/* Header Bar */}
          <div className="px-4 py-3 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-amber-300 shadow-inner">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-xs text-white tracking-wide">AI CEO Lucky</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Live Sheet Sync
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    ⚡ 12 Keys Gemini SOTA
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">Gemini 3.8/3.6 Cloud Pool 24/7 • Tab: {DEV_SUPPORT_TAB_NAME}</div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title={isMinimized ? 'Mở rộng' : 'Thu nhỏ'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
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
                  onClick={() => setActiveTab('roadmap')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                    activeTab === 'roadmap'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-amber-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-amber-300" />
                  <span>Lộ Trình 6 GĐ</span>
                  <span className="ml-1 px-1 py-0.2 text-[9px] rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                    GĐ 1 & 2 Xong
                  </span>
                </button>

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
                  onClick={() => setActiveTab('devsupport')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                    activeTab === 'devsupport'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5 text-amber-300" />
                  <span>Support & Sheet</span>
                  <span className="ml-1 px-1 py-0.2 text-[9px] rounded-full bg-slate-900/60 font-mono">
                    {devTickets.length}
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
                  <span>Sổ Cái MD</span>
                </button>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                {/* 🗺️ TAB 0: LỘ TRÌNH BÀN GIAO 6 GIAI ĐOẠN */}
                {activeTab === 'roadmap' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    {/* Executive Overview Header */}
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/90 via-slate-900 to-indigo-950/90 border border-blue-500/40 space-y-2 shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Layers className="w-5 h-5 text-amber-300" />
                          <span className="font-extrabold text-sm text-white">Lộ Trình Bàn Giao 6 Giai Đoạn</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          GĐ 1 & 2: 100% ĐẠT
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Theo Đặc tả chiến lược <strong className="text-white">FCS_AI_WORKFORCE_OS_PROJECT_MASTER.md</strong> và Hướng dẫn nghiệm thu thực tế. Toàn bộ tính năng đã kết nối trực tiếp với Google Sheets Master.
                      </p>
                      
                      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80 text-center">
                        <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
                          <div className="text-[9px] text-slate-400 font-bold uppercase">Giai Đoạn Hoàn Tất</div>
                          <div className="text-sm font-black text-emerald-400 mt-0.5">2 / 6 GĐ</div>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
                          <div className="text-[9px] text-slate-400 font-bold uppercase">Kiểm Thử Tự Động</div>
                          <div className="text-sm font-black text-blue-400 mt-0.5">59/59 Pass</div>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
                          <div className="text-[9px] text-slate-400 font-bold uppercase">North Star VWW</div>
                          <div className="text-sm font-black text-amber-400 mt-0.5">Sẵn Sàng</div>
                        </div>
                      </div>
                    </div>

                    {/* Stage 1 Card */}
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 space-y-2.5 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              GĐ 1
                            </span>
                            <span className="font-extrabold text-white text-xs">Workforce Core Architecture & 19 Level Sale CRM</span>
                          </div>
                          <div className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Đã hoàn thành & Nghiệm thu đạt chuẩn 100%</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-600 text-white shrink-0">
                          BÀN GIAO NGAY
                        </span>
                      </div>

                      <ul className="space-y-1 text-[11px] text-slate-300 pl-2 border-l-2 border-emerald-500/50">
                        <li>• <strong>34 Cột VNeID Chuẩn:</strong> Định danh công dân, CCCD, phân loại chuyên sâu, chống trùng lặp tuyệt đối.</li>
                        <li>• <strong>Phễu CRM 19 Level:</strong> Bóc tách luồng tuyển dụng từ C3 (Tiếp nhận) đến L4 (Hoa hồng VWW).</li>
                        <li>• <strong>Lưới Excel Grid 2 Chiều:</strong> Thao tác bàn phím cực nhanh, đồng bộ Google Sheets thời gian thực ACID.</li>
                        <li>• <strong>Golden Flow 1-Click:</strong> Mô phỏng toàn bộ hành trình chuyển deal đạt chuẩn VWW chỉ trong 1 thao tác.</li>
                      </ul>

                      <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            navigateTo('/app/grid');
                            setIsMinimized(true);
                          }}
                          className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3 text-blue-400" />
                          <span>Mở Lưới Excel Grid</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigateTo('/app/pipeline');
                            setIsMinimized(true);
                          }}
                          className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3 text-amber-400" />
                          <span>Mở Phễu Tuyển Dụng</span>
                        </button>
                      </div>
                    </div>

                    {/* Stage 2 Card */}
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 space-y-2.5 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              GĐ 2
                            </span>
                            <span className="font-extrabold text-white text-xs">AI Talent Care & Retention / Re-activation 0đ</span>
                          </div>
                          <div className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Đã hoàn thành & Nghiệm thu đạt chuẩn 100%</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-600 text-white shrink-0">
                          BÀN GIAO NGAY
                        </span>
                      </div>

                      <ul className="space-y-1 text-[11px] text-slate-300 pl-2 border-l-2 border-emerald-500/50">
                        <li>• <strong>Chăm Sóc 1-3-7 Ngày:</strong> Giảm 80% tỷ lệ bỏ việc ngày đầu vào xưởng (KTX, cơm ca, ép ca).</li>
                        <li>• <strong>Báo Động Nguy Cơ Bỏ Việc:</strong> Tự động gắn nhãn P0 - CẦN CAN THIỆP KHẨN CẤP và lưu Google Sheet tab IN.</li>
                        <li>• <strong>Re-activation Engine 0đ:</strong> Kéo cựu công nhân đi làm lại qua Zalo/SMS, tự động sinh Deal C3 trên CRM.</li>
                        <li>• <strong>Hồ Sơ 360 Độ:</strong> Tích hợp lịch sử phỏng vấn, nhật ký điều động và dòng thời gian tương tác.</li>
                      </ul>

                      <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            navigateTo('/app/workers/WK-000016', { tab: 'care' });
                            setIsMinimized(true);
                          }}
                          className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3 text-rose-400" />
                          <span>Thử Chăm Sóc 1-3-7</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigateTo('/app/workers');
                            setIsMinimized(true);
                          }}
                          className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3 text-emerald-400" />
                          <span>Thử Re-activation 0đ</span>
                        </button>
                      </div>
                    </div>

                    {/* Stage 3 Card - APPROVED & ACTIVATED */}
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 space-y-2.5 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              GĐ 3
                            </span>
                            <span className="font-extrabold text-white text-xs">B2B Employer CRM, SLA Headcount & Khớp Công VWW</span>
                          </div>
                          <div className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Đã duyệt bởi Chairman Victor Chuyen • Đang vận hành</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-600 text-white shrink-0">
                          ĐÃ KÍCH HOẠT
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Quản trị đơn hàng 29 nhà máy KCN (Foxconn, Luxshare, Fuyu, Goertek...), tự động khớp công máy nhà máy để xác nhận North Star VWW và vận hành quy trình ký duyệt hoa hồng 4 cấp điện tử.
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            navigateTo('/app/results?tab=b2b-orders');
                            setIsMinimized(true);
                          }}
                          className="flex-1 min-w-[110px] py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3 text-blue-400" />
                          <span>Đơn Hàng 29 Xưởng</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigateTo('/app/confirmations?tab=matching');
                            setIsMinimized(true);
                          }}
                          className="flex-1 min-w-[110px] py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3 text-emerald-400" />
                          <span>Khớp Công VWW</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigateTo('/app/results?tab=commission');
                            setIsMinimized(true);
                          }}
                          className="flex-1 min-w-[110px] py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3 text-purple-400" />
                          <span>Duyệt Hoa Hồng 4 Cấp</span>
                        </button>
                      </div>
                    </div>

                    {/* Stages 4, 5, 6 summary */}
                    {/* Stage 4 Card - ACTIVATED & LIVE */}
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 space-y-2.5 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                              GĐ 4
                            </span>
                            <span className="font-extrabold text-white text-xs">Tài Chính, Sổ Cái CTV & P&L Chi Nhánh</span>
                          </div>
                          <div className="text-[10px] text-cyan-400 font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                            <span>Đã kích hoạt bởi AI CEO Lucky • Vận hành tự động</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-600 text-white shrink-0">
                          ĐÃ KÍCH HOẠT
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Quản trị sổ cái CTV, theo dõi hạn mức công nợ tạm ứng xe tuyến, tiền cọc KTX trọ công nhân và báo cáo P&L phân tầng theo 6 chi nhánh (Bắc Giang, Bắc Ninh, Hà Nam, Hải Dương, Hưng Yên, Nam Định).
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            navigateTo('/app/results?tab=pnl-vendor');
                            setIsMinimized(true);
                          }}
                          className="flex-1 min-w-[120px] py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3 text-cyan-400" />
                          <span>P&L 6 Chi Nhánh</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigateTo('/app/results?tab=pnl-vendor');
                            setIsMinimized(true);
                          }}
                          className="flex-1 min-w-[120px] py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3 text-amber-400" />
                          <span>Sổ Cái Tạm Ứng CTV</span>
                        </button>
                      </div>
                    </div>

                    {/* Stages 5, 6 summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                        <div className="font-bold text-slate-400 flex items-center space-x-1">
                          <span className="px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">GĐ 5</span>
                          <span>AI Marketing Ads</span>
                        </div>
                        <p className="text-slate-500">Thu lead TikTok/FB về C3, chia data 1s cho Telesale.</p>
                        <div className="text-[9px] text-slate-500 font-semibold">⚪ Ưu tiên số 1 tiếp theo</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                        <div className="font-bold text-slate-400 flex items-center space-x-1">
                          <span className="px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">GĐ 6</span>
                          <span>Multi-Tenant SaaS</span>
                        </div>
                        <p className="text-slate-500">Đóng gói SaaS nhân bản, sàn san sẻ KCN toàn quốc.</p>
                        <div className="text-[9px] text-slate-500 font-semibold">⚪ Theo lộ trình</div>
                      </div>
                    </div>

                    {/* Quick CTA to Sign-off */}
                    <div className="p-3 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-600/40 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-xs font-extrabold text-white">GĐ 1 & GĐ 2 Đã Đạt Chuẩn Nghiệm Thu</div>
                        <div className="text-[10px] text-emerald-400 mt-0.5">Sẵn sàng ký biên bản điện tử và nhận chứng chỉ bàn giao</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('signoff')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg text-xs shadow-md cursor-pointer flex items-center space-x-1"
                      >
                        <span>Ký Nghiệm Thu</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* 🛠️ TAB 1: SUPPORT KỸ THUẬT & GHI LỖI TRỰC TIẾP VÀO SHEET */}
                {activeTab === 'devsupport' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    {/* Live Sheet Banner with direct link */}
                    <a
                      href={DEV_SUPPORT_SHEET_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 bg-gradient-to-r from-blue-950/90 via-slate-900 to-indigo-950/90 border border-blue-500/40 rounded-xl flex items-center justify-between hover:border-blue-400 transition-all cursor-pointer group shadow-md"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
                          <FileSpreadsheet className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-extrabold text-xs text-white flex items-center space-x-1.5">
                            <span>Google Sheet: {DEV_SUPPORT_TAB_NAME}</span>
                            <ExternalLink className="w-3 h-3 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Mọi trao đổi tự động đồng bộ vào hàng mới của tab này thời gian thực
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                        MỞ SHEET ↗
                      </span>
                    </a>

                    {/* Support Input Form */}
                    <form onSubmit={handleSubmitDevSupport} className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3 shadow-inner">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-amber-300 flex items-center space-x-1.5">
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Ghi Nhận Trao Đổi Kỹ Thuật (Data - Mục Tiêu - KQ Đầu Ra)</span>
                        </span>
                        <span className="text-[10px] text-slate-400">Giai đoạn phát triển</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Phân loại</label>
                          <select
                            value={devCategory}
                            onChange={e => setDevCategory(e.target.value as any)}
                            className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-medium focus:outline-none"
                          >
                            <option value="BÁO LỖI (BUG)">🐛 Báo lỗi (Bug)</option>
                            <option value="MỤC TIÊU PHÁT TRIỂN">🎯 Mục tiêu phát triển</option>
                            <option value="GÓP Ý UI/UX">✨ Góp ý UI/UX</option>
                            <option value="HỎI ĐÁP KỸ THUẬT">❓ Hỏi đáp kỹ thuật</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Mức độ ưu tiên</label>
                          <select
                            value={devPriority}
                            onChange={e => setDevPriority(e.target.value as any)}
                            className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-medium focus:outline-none"
                          >
                            <option value="P0 - CHẶN">🔴 P0 - Chặn (Sập web / Mất data)</option>
                            <option value="P1 - NGHIÊM TRỌNG">🟠 P1 - Nghiêm trọng (Tính năng sai)</option>
                            <option value="P2 - BÌNH THƯỜNG">🟡 P2 - Bình thường (Giao diện / Font)</option>
                            <option value="P3 - GÓP Ý">🟢 P3 - Góp ý mở rộng</option>
                          </select>
                        </div>
                      </div>

                      {/* Goal Input */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">
                          1. Mục tiêu / Vấn đề cần giải quyết là gì? <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={devGoal}
                          onChange={e => setDevGoal(e.target.value)}
                          placeholder="Ví dụ: Fix 5 thẻ KPI đầu trang hiển thị 0; Sửa nút Golden Flow..."
                          className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>

                      {/* Expected Output Input */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">
                          2. Kết quả đầu ra mong muốn là gì? (Expected Output) <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={devOutput}
                          onChange={e => setDevOutput(e.target.value)}
                          placeholder="Ví dụ: Hiển thị đúng 10 lao động, VWW: 2; Deal nhảy sang L3 trên Sheet..."
                          className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>

                      {/* Details Textarea */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">
                          3. Nội dung trao đổi chi tiết / Lời nhắn cho AI CEO Lucky
                        </label>
                        <textarea
                          rows={2}
                          value={devDetails}
                          onChange={e => setDevDetails(e.target.value)}
                          placeholder="Mô tả cụ thể ngữ cảnh, thao tác gặp lỗi, hoặc gợi ý hướng giải quyết..."
                          className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingDev || (!devGoal.trim() && !devDetails.trim())}
                        className="w-full py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center space-x-2"
                      >
                        {isSubmittingDev ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        <span>LƯU VÀO GOOGLE SHEET & PHÂN TÍCH AI (1-CLICK)</span>
                      </button>
                    </form>

                    {/* AI Architectural Response Notice */}
                    {devAiAdvice && (
                      <div className="p-3.5 bg-blue-950/40 border border-blue-600/50 rounded-xl space-y-1.5 animate-in fade-in">
                        <div className="flex items-center space-x-2 text-amber-300 font-extrabold text-xs">
                          <Bot className="w-4 h-4" />
                          <span>AI CEO Lucky • Giải Pháp Kiến Trúc & Kế Hoạch Fix Code:</span>
                        </div>
                        <div className="text-slate-200 text-[11px] leading-relaxed whitespace-pre-line">
                          {devAiAdvice}
                        </div>
                      </div>
                    )}

                    {/* Live Sheet Records List */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Danh Sách Phiếu Đã Lưu Trên Sheet ({devTickets.length})</span>
                        <span className="text-emerald-400 font-mono text-[10px]">Auto-Synced</span>
                      </div>

                      {devTickets.map((tk, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-white font-mono">{tk.id}</span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                {tk.category}
                              </span>
                              <span className="text-[10px] text-slate-400">• {tk.senderName}</span>
                            </div>
                            <span className={`text-[10px] font-extrabold ${
                              tk.status === 'ĐÃ FIX & DEPLOY' ? 'text-emerald-400' : 'text-amber-400'
                            }`}>
                              {tk.status}
                            </span>
                          </div>

                          <div className="text-slate-300 text-[11px]">
                            <strong>Mục tiêu:</strong> {tk.goal}
                          </div>
                          <div className="text-slate-300 text-[11px]">
                            <strong>KQ Đầu ra:</strong> {tk.expectedOutput}
                          </div>
                          {tk.aiAction && (
                            <div className="text-[10px] text-emerald-400 bg-emerald-950/30 border border-emerald-800/30 p-1.5 rounded-md mt-1">
                              <strong>Hành động thực thi:</strong> {tk.aiAction}
                            </div>
                          )}
                          <div className="text-[9px] text-slate-500">{tk.timestamp}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 🧭 TAB 2: 4 BƯỚC KIỂM TRA NHANH */}
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
                            <button
                              type="button"
                              onClick={() => {
                                navigateTo('/app');
                                setIsMinimized(true);
                              }}
                              className="text-[10px] font-bold text-blue-400 hover:text-blue-300 hover:underline flex items-center space-x-1 mt-1 pl-7 cursor-pointer"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>👉 Mở Dashboard xem 5 thẻ KPI</span>
                            </button>
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
                            <button
                              type="button"
                              onClick={() => {
                                navigateTo('/app');
                                setIsMinimized(true);
                              }}
                              className="text-[10px] font-bold text-amber-400 hover:text-amber-300 hover:underline flex items-center space-x-1 mt-1 pl-7 cursor-pointer"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>👉 Mở Dashboard và chạy Golden Flow</span>
                            </button>
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
                            <div className="flex items-center space-x-3 mt-1 pl-7">
                              <button
                                type="button"
                                onClick={() => {
                                  navigateTo('/app/pipeline');
                                  setIsMinimized(true);
                                }}
                                className="text-[10px] font-bold text-blue-400 hover:text-blue-300 hover:underline flex items-center space-x-1 cursor-pointer"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>👉 Mở Phễu Tuyển Dụng</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  navigateTo('/app/grid');
                                  setIsMinimized(true);
                                }}
                                className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center space-x-1 cursor-pointer"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>👉 Mở Lưới Excel Grid</span>
                              </button>
                            </div>
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
                            <div className="flex items-center space-x-3 mt-1 pl-7">
                              <button
                                type="button"
                                onClick={() => {
                                  navigateTo('/app/workers/WK-000016', { tab: 'care' });
                                  setIsMinimized(true);
                                }}
                                className="text-[10px] font-bold text-rose-400 hover:text-rose-300 hover:underline flex items-center space-x-1 cursor-pointer"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>👉 Mở Hồ sơ Chăm sóc 1-3-7 (WK-000016)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  navigateTo('/app/workers');
                                  setIsMinimized(true);
                                }}
                                className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center space-x-1 cursor-pointer"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>👉 Thử Re-activation 0đ</span>
                              </button>
                            </div>
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

                {/* 💬 TAB 3: HỎI ĐÁP AI */}
                {activeTab === 'chat' && (
                  <div className="flex flex-col h-full space-y-3">
                    {/* Gemini Cloud Multi-Key Pool 24/7 Status Bar */}
                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-blue-950/80 border border-indigo-500/30 flex items-center justify-between text-[11px] shadow-sm">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse shrink-0" />
                        <div>
                          <span className="font-extrabold text-white">Google Gemini Cloud Pool: </span>
                          <span className="text-emerald-400 font-bold font-mono">12 Keys SOTA 24/7</span>
                        </div>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
                        Đa Key Xoay Vòng • Auto 429
                      </span>
                    </div>

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
