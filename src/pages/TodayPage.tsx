import React, { useEffect, useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { DashboardMetrics, Priority, ActionQueueItem, ActionStatus } from '../types';
import { PriorityActionCard } from '../components/dashboard/PriorityActionCard';
import { LuckySuggestions } from '../components/dashboard/LuckySuggestions';
import { TodayPipelineSummary } from '../components/dashboard/TodayPipelineSummary';
import { GoldenFlowLiveRunner } from '../components/dashboard/GoldenFlowLiveRunner';
import { RefreshCw, Code2, Users, Building2, Briefcase } from 'lucide-react';

export const TodayPage: React.FC = () => {
  const { navigateTo, refreshKey, showNotification, isMock, currentUser } = useApp();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [actions, setActions] = useState<ActionQueueItem[]>([]);
  const [actionsLoaded, setActionsLoaded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [dashRes, actRes] = await Promise.all([
        api.getDashboard(),
        api.getTodayActions(),
      ]);
      if (dashRes.success && dashRes.data) {
        setMetrics(dashRes.data);
      }
      if (actRes.success && actRes.data) {
        const actionItems = Array.isArray(actRes.data)
          ? actRes.data
          : ((actRes.data as any).items || []);
        setActions(actionItems);
        setActionsLoaded(true);
      }
    } catch {
      showNotification('Không thể tải số liệu hôm nay', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [refreshKey]);

  if (loading && !metrics) {
    return (
      <div className="py-20 text-center">
        <RefreshCw className="w-8 h-8 mx-auto text-blue-600 animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-medium">Đang tải trung tâm điều hành hôm nay...</p>
      </div>
    );
  }

  // Exact metrics mapping: in Real Mode, use response.data.metrics directly
  const m = metrics?.metrics;
  const verifiedWorking = !isMock
    ? (m?.verifiedWorking ?? metrics?.northStar?.value ?? 0)
    : (metrics?.pipelineCounts?.verifiedWorkingWorkers ?? 0);

  const waitingStart = !isMock
    ? (m?.waitingStart ?? 0)
    : (metrics?.pipelineCounts?.waitingStart ?? 0);

  const interviewed = !isMock
    ? (m?.interviewed ?? 0)
    : (metrics?.pipelineCounts?.interviewPending ?? 0);

  const pendingReview = !isMock
    ? (m?.pendingReview ?? 0)
    : (metrics?.todayActionSummary?.unmatchedAttendanceCount ?? 0);

  const newWorkers = !isMock
    ? (m?.newWorkers ?? 0)
    : (metrics?.pipelineCounts?.newWorkers ?? 0);

  const totalWorkers = !isMock
    ? (m?.totalWorkers ?? 0)
    : 14;

  // Filter for actual OPEN action records returned by action.list
  const openActionRecords = actions.filter(
    a => !a.status || a.status === 'OPEN' || a.status === ActionStatus.OPEN
  );

  const openP0 = openActionRecords.filter(a => (a.priority || '').toUpperCase() === 'P0');
  const openP1 = openActionRecords.filter(a => (a.priority || '').toUpperCase() === 'P1');
  const openP2 = openActionRecords.filter(a => (a.priority || '').toUpperCase() === 'P2');
  const openP3 = openActionRecords.filter(a => (a.priority || '').toUpperCase() === 'P3');

  // Counts strictly reflect actual OPEN action records returned by action.list
  const p0Count = actionsLoaded
    ? openP0.length
    : (!isMock ? (metrics?.priorities?.P0 ?? 0) : (metrics?.todayActionSummary?.unmatchedAttendanceCount ?? 0));
  const p1Count = actionsLoaded
    ? openP1.length
    : (!isMock ? (metrics?.priorities?.P1 ?? 0) : (metrics?.todayActionSummary?.passedWaitingStartCount ?? 0));
  const p2Count = actionsLoaded
    ? openP2.length
    : (!isMock ? (metrics?.priorities?.P2 ?? 0) : (metrics?.todayActionSummary?.duplicateSuspectCount ?? 0));
  const p3Count = actionsLoaded
    ? openP3.length
    : (!isMock ? (metrics?.priorities?.P3 ?? 0) : (metrics?.todayActionSummary?.interviewsTodayCount ?? 0));

  const priorityCards = [
    {
      priority: Priority.P0,
      count: p0Count,
      title: 'bản ghi chấm công chưa khớp',
      reason: openP0[0]?.reason || 'Dữ liệu file chấm công đối tác gửi về chưa khớp hoàn toàn số điện thoại/CCCD',
      dueText: 'Hạn chót: 17:00 hôm nay',
      onAction: () => navigateTo('/app/confirmations', { tab: 'matching' }),
    },
    {
      priority: Priority.P1,
      count: p1Count,
      title: 'lao động đã đậu chưa xác nhận đi làm',
      reason: openP1[0]?.reason || 'Đã có kết quả đậu phỏng vấn nhưng chưa chốt ca làm hoặc chưa đón xe',
      dueText: 'Cần liên hệ trong 4h',
      onAction: () => navigateTo('/app/confirmations', { tab: 'followup' }),
    },
    {
      priority: Priority.P2,
      count: p2Count,
      title: 'hồ sơ nghi trùng',
      reason: openP2[0]?.reason || 'Phát hiện trùng lặp Số điện thoại hoặc CCCD từ lượt đăng ký Google Form gần nhất',
      dueText: 'Đối chiếu trước khi gọi',
      onAction: () => navigateTo('/app/confirmations', { tab: 'duplicate' }),
    },
    {
      priority: Priority.P3,
      count: p3Count,
      title: 'lao động phỏng vấn',
      reason: openP3[0]?.reason || 'Lịch phỏng vấn trực tiếp tại xưởng đối tác',
      dueText: 'Ca phỏng vấn hôm nay',
      onAction: () => navigateTo('/app/workers', { status: 'INTERVIEW_PENDING' }),
    },
  ];

  // Do not render Action Queue cards whose count is 0. Only render cards representing actual OPEN actions.
  const visiblePriorityCards = priorityCards.filter(card => card.count > 0);

  // The headline: “Hôm nay có X việc cần xử lý” must equal the total number of OPEN Action Queue records actually displayed.
  const openActionsCount = visiblePriorityCards.reduce((sum, card) => sum + card.count, 0);

  // Dynamic Real-time Lucky Suggestions Engine (Hoạt động 100% trên cả Dữ liệu thật lẫn Mock)
  const computedLuckySuggestions = useMemo(() => {
    if (metrics?.luckySuggestions && metrics.luckySuggestions.length > 0) {
      return metrics.luckySuggestions;
    }

    const suggestions = [];

    const pendingStarts = metrics?.counts?.passedWaitingForWork ?? 0;
    if (pendingStarts > 0) {
      suggestions.push({
        id: 'sugg-start',
        text: `Có ${pendingStarts} lao động đã đỗ phỏng vấn đang chờ điều xe / xuất phát đến xưởng.`,
        priority: Priority.P1,
        type: 'ACTION_REQUIRED',
        actionLabel: 'Xem danh sách',
        targetRoute: '/app/pipeline',
      });
    }

    const vwwCount = metrics?.counts?.verifiedWorkingWorkers ?? 0;
    if (vwwCount > 0) {
      suggestions.push({
        id: 'sugg-vww',
        text: `Đã xác minh ${vwwCount} lao động đạt chuẩn VWW đi làm thực tế. Sẵn sàng đối soát bảng công tính phí.`,
        priority: Priority.P2,
        type: 'OPPORTUNITY',
        actionLabel: 'Đối soát ngay',
        targetRoute: '/app/confirmations',
      });
    }

    const totalDeals = metrics?.counts?.totalDeals ?? 0;
    const totalWorkers = metrics?.counts?.totalWorkers ?? 0;
    if (totalWorkers > 0 && totalDeals === 0) {
      suggestions.push({
        id: 'sugg-deals',
        text: `Hệ thống có ${totalWorkers} hồ sơ lao động nhưng chưa tạo Deal phễu CRM 2026. Hãy tạo Deal để bắt đầu tư vấn.`,
        priority: Priority.P1,
        type: 'ACTION_REQUIRED',
        actionLabel: 'Tạo Deal mới',
        targetRoute: '/app/pipeline',
      });
    }

    if (suggestions.length === 0) {
      suggestions.push(
        {
          id: 'sugg-golden',
          text: 'Vận hành quy chuẩn Golden Flow: Lao động -> Phỏng vấn Pass (L2.1) -> Đi làm VWW (L3) -> Đối soát công.',
          priority: Priority.P3,
          type: 'INFO',
          actionLabel: 'Khám phá Pipeline',
          targetRoute: '/app/pipeline',
        },
        {
          id: 'sugg-clean',
          text: 'Kiểm tra bảng tổng hợp Lưới Excel Grid để rà soát đồng bộ 34 cột hồ sơ VNeID và 22 cột Deals CRM.',
          priority: Priority.P3,
          type: 'INFO',
          actionLabel: 'Mở Lưới Excel',
          targetRoute: '/app/grid',
        }
      );
    }

    return suggestions;
  }, [metrics]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Command Center */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5">
            <span className="inline-flex items-center space-x-1.5 font-extrabold text-blue-700 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              <span>Hôm nay</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
              {currentUser.tenantId || 'FCS-000001'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center space-x-1 text-slate-600 font-medium">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{totalWorkers} lao động</span>
            </span>
            {currentUser.officeId && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 font-medium">{currentUser.officeId}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hôm nay có <span className="text-red-600 underline decoration-red-300">{openActionsCount} việc</span> cần xử lý
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Hệ thống tự động gom nhóm các việc bất thường và việc ưu tiên cao nhất, người quản lý không cần dò tìm thủ công trong bảng tính.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          title="Tải lại dữ liệu"
          className="self-start sm:self-center inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Tải lại dữ liệu</span>
        </button>
      </div>

      {/* Golden Flow Live Execution Engine for FCS-000001 */}
      <GoldenFlowLiveRunner />

      {/* 5 Core Summary Counters Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* 1. Đi làm đã xác minh (VWW) */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Đi làm đã xác minh (VWW)
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 flex items-baseline space-x-1">
            <span>{verifiedWorking}</span>
            <span className="text-[11px] text-emerald-600 font-semibold">lao động</span>
          </div>
        </div>

        {/* 2. Chờ đi làm */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Chờ đi làm
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 mt-1 flex items-baseline space-x-1">
            <span>{waitingStart}</span>
            <span className="text-[11px] text-amber-600 font-semibold">hồ sơ</span>
          </div>
        </div>

        {/* 3. Đã phỏng vấn */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Đã phỏng vấn
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-700 mt-1 flex items-baseline space-x-1">
            <span>{interviewed}</span>
            <span className="text-[11px] text-blue-600 font-semibold">lao động</span>
          </div>
        </div>

        {/* 4. Cần xác nhận */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Cần xác nhận
          </div>
          <div className="text-xl sm:text-2xl font-black text-red-600 mt-1 flex items-baseline space-x-1">
            <span>{pendingReview}</span>
            <span className="text-[11px] text-red-500 font-semibold">bản ghi</span>
          </div>
        </div>

        {/* 5. Lao động mới */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs col-span-2 sm:col-span-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Lao động mới
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-baseline space-x-1">
            <span>{newWorkers}</span>
            <span className="text-[11px] text-slate-500 font-semibold">tiếp nhận</span>
          </div>
        </div>
      </div>

      {/* Priority Action Cards (P0, P1, P2, P3) - Only render actual OPEN actions with count > 0 */}
      {visiblePriorityCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {visiblePriorityCards.map((card, idx) => (
            <PriorityActionCard
              key={idx}
              priority={card.priority}
              count={card.count}
              title={card.title}
              reason={card.reason}
              dueText={card.dueText}
              onAction={card.onAction}
              actionText="XỬ LÝ NGAY"
            />
          ))}
        </div>
      )}

      {/* Section: Lucky gợi ý hôm nay (Hoạt động trên cả Mock lẫn Dữ liệu thật) */}
      {(metrics?.luckySuggestions || computedLuckySuggestions)?.length > 0 && (
        <LuckySuggestions
          suggestions={metrics?.luckySuggestions || computedLuckySuggestions}
          onNavigate={route => navigateTo(route)}
        />
      )}

      {/* Below: Today's Pipeline summary */}
      <TodayPipelineSummary
        pipeline={metrics?.pipeline}
        counts={metrics?.pipelineCounts}
        onStageClick={statusFilter => {
          if (statusFilter) {
            navigateTo('/app/workers', { status: statusFilter });
          } else {
            navigateTo('/app/pipeline');
          }
        }}
      />

      {/* Temporary Dev Debug: Only in development / AI Studio preview */}
      {import.meta.env.DEV && (
        <div className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs font-mono border border-slate-800 shadow-sm">
          <details className="group">
            <summary className="font-bold text-amber-400 cursor-pointer flex items-center justify-between list-none select-none">
              <span className="flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-amber-400" />
                <span>API DEBUG (dashboard.summary response)</span>
              </span>
              <span className="text-[11px] text-slate-400 group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <div className="mt-3 pt-3 border-t border-slate-800 overflow-x-auto max-h-96">
              <pre className="text-[11px] text-emerald-400 leading-relaxed">
                {JSON.stringify(metrics, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

