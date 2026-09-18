import {
  MOCK_WORKERS,
  MOCK_ACTION_QUEUE,
  MOCK_ATTENDANCES,
  MOCK_MATCHING_REVIEWS,
  MOCK_PIPELINE_EVENTS,
} from './mockData';
import { DashboardMetrics, ActionQueueItem, Priority, ActionStatus, WorkerStatus, ReviewStatus, PipelineFunnelData, OperationalResults, FollowUpItem, MatchingStatus } from '../../types';
import { mockWorkerService } from './mockWorkerService';
import { mockAttendanceService } from './mockAttendanceService';

const delay = (ms = 120) => new Promise(resolve => setTimeout(resolve, ms));

function computeMetrics(): DashboardMetrics {
  const newCount = MOCK_WORKERS.filter(w => w.status === WorkerStatus.NEW).length;
  const interviewPending = MOCK_WORKERS.filter(w => w.status === WorkerStatus.INTERVIEW_PENDING).length;
  const passed = MOCK_WORKERS.filter(w => w.status === WorkerStatus.PASSED).length;
  const waitingStart = MOCK_WORKERS.filter(w => w.status === WorkerStatus.WAITING_START).length;
  const working = MOCK_WORKERS.filter(w => w.status === WorkerStatus.WORKING).length;
  const vwwCount = MOCK_WORKERS.filter(w => w.isVerifiedWorking).length;

  const openActions = MOCK_ACTION_QUEUE.filter(a => a.status === ActionStatus.OPEN);
  const p0 = openActions.filter(a => a.priority === Priority.P0).length;
  const p1 = openActions.filter(a => a.priority === Priority.P1).length;
  const p2 = openActions.filter(a => a.priority === Priority.P2).length;
  const p3 = openActions.filter(a => a.priority === Priority.P3).length;

  const pendingAttendanceCount = MOCK_MATCHING_REVIEWS.filter(r => r.reviewStatus === ReviewStatus.PENDING).length;
  const openFollowUpCount = MOCK_WORKERS.filter(
    w => w.status === WorkerStatus.PASSED || w.status === WorkerStatus.WAITING_START
  ).length;
  const duplicateSuspectCount = 2;
  const interviewsTodayCount = interviewPending;

  const totalPassedAndBeyond = passed + waitingStart + working;
  const startRate = totalPassedAndBeyond > 0 ? Math.round((working / totalPassedAndBeyond) * 100) : 0;
  const totalAtt = MOCK_ATTENDANCES.length;
  const matchedAtt = MOCK_ATTENDANCES.filter(a => a.matchingStatus === MatchingStatus.MATCHED).length;
  const matchRate = totalAtt > 0 ? Math.round((matchedAtt / totalAtt) * 100) : 75;

  return {
    totalActionsNeedAttention: openActions.length,
    priorityBreakdown: { p0, p1, p2, p3 },
    pipelineCounts: {
      newWorkers: newCount,
      interviewPending: interviewPending,
      passed: passed,
      waitingStart: waitingStart,
      working: working,
      verifiedWorkingWorkers: vwwCount,
    },
    rates: {
      startRate,
      matchRate,
      dropOffCount: MOCK_WORKERS.filter(w => w.status === WorkerStatus.FAILED || w.status === WorkerStatus.QUIT).length,
    },
    todayActionSummary: {
      unmatchedAttendanceCount: pendingAttendanceCount,
      passedWaitingStartCount: openFollowUpCount,
      duplicateSuspectCount: duplicateSuspectCount,
      interviewsTodayCount: interviewsTodayCount,
    },
    luckySuggestions: [
      {
        id: 'LUK-01',
        text: 'Ưu tiên xác nhận 7 bản ghi chấm công chưa khớp để kịp chốt dữ liệu công ngày cho đối tác Foxconn.',
        priority: Priority.P0,
        type: 'ATTENDANCE_MATCH',
        actionLabel: 'Xác nhận ngay',
        targetRoute: '/review?type=matching',
      },
      {
        id: 'LUK-02',
        text: '12 lao động đã đậu quá 24 giờ nhưng chưa có xác nhận đi làm. Cần gọi đôn đốc xe đón trước 11:30.',
        priority: Priority.P1,
        type: 'SLA_FOLLOWUP',
        actionLabel: 'Xem danh sách',
        targetRoute: '/review?type=followup',
      },
      {
        id: 'LUK-03',
        text: '8 hồ sơ nghi trùng số điện thoại vừa gửi qua Google Form. Kiểm tra trước khi gọi phỏng vấn.',
        priority: Priority.P1,
        type: 'DUPLICATE_CHECK',
        actionLabel: 'Xử lý trùng',
        targetRoute: '/review?type=duplicate',
      },
    ],
  };
}

export const mockDashboardService = {
  computeMetrics,

  async getDashboard(): Promise<DashboardMetrics> {
    await delay();
    return computeMetrics();
  },

  async getTodayActions(): Promise<ActionQueueItem[]> {
    await delay();
    return MOCK_ACTION_QUEUE.filter(a => a.status === ActionStatus.OPEN);
  },

  async resolveAction(actionId: string, resolution: string): Promise<boolean> {
    await delay();
    const item = MOCK_ACTION_QUEUE.find(a => a.actionId === actionId);
    if (!item) return false;
    item.status = ActionStatus.DONE;
    return true;
  },

  async dismissAction(actionId: string): Promise<boolean> {
    await delay();
    const item = MOCK_ACTION_QUEUE.find(a => a.actionId === actionId);
    if (!item) return false;
    item.status = ActionStatus.DISMISSED;
    return true;
  },

  async getPipelineFunnel(): Promise<any[]> {
    await delay();
    const totalNew = MOCK_WORKERS.filter(w => w.status === WorkerStatus.NEW || w.status === WorkerStatus.DUPLICATE || w.status === WorkerStatus.JUNK).length;
    const totalL1 = MOCK_WORKERS.filter(w => [
      WorkerStatus.ASSIGNED_TO_SALE,
      WorkerStatus.REFERENCE,
      WorkerStatus.FOLLOW_UP,
      WorkerStatus.REJECTED,
      WorkerStatus.UNREACHABLE,
      WorkerStatus.OVERAGE,
      WorkerStatus.CALLBACK,
      WorkerStatus.UNDERAGE,
    ].includes(w.status)).length;
    const totalL2 = MOCK_WORKERS.filter(w => [WorkerStatus.INTERVIEW_PENDING, WorkerStatus.INTERVIEWED, WorkerStatus.NO_SHOW].includes(w.status)).length;
    const totalPassed = MOCK_WORKERS.filter(w => [WorkerStatus.PASSED, WorkerStatus.WAITING_START].includes(w.status)).length;
    const totalWorking = MOCK_WORKERS.filter(w => [WorkerStatus.WORKING, WorkerStatus.TRANSFER_REQUEST].includes(w.status)).length;
    const totalVww = MOCK_WORKERS.filter(w => w.isVerifiedWorking).length;
    const totalFeeExpired = MOCK_WORKERS.filter(w => w.status === WorkerStatus.FEE_EXPIRED).length;

    return [
      { stageKey: 'NEW', stageName: 'C3: THU HÚT & TIẾP NHẬN', count: totalNew },
      { stageKey: 'ASSIGNED_TO_SALE', stageName: 'L1: CHIA SALE & CHĂM SÓC', count: totalL1, slaWarning: '3 lao động hẹn gọi lại cần chăm sóc trong ngày' },
      { stageKey: 'INTERVIEW_PENDING', stageName: 'L2: PHỎNG VẤN HIỆN TRƯỜNG', count: totalL2, slaWarning: '2 lịch phỏng vấn KCN chiều nay' },
      { stageKey: 'PASSED', stageName: 'L2.1: ĐỖ PV & CHỜ ĐI LÀM', count: totalPassed, slaWarning: '1 lao động đã đậu > 24h chưa chốt xe' },
      { stageKey: 'WORKING', stageName: 'L3: ĐANG ĐI LÀM TẠI KCN', count: totalWorking },
      { stageKey: 'VWW', stageName: 'VWW: ĐI LÀM ĐÃ XÁC MINH', count: totalVww, sublabel: 'Verified Working — VWW' },
      { stageKey: 'FEE_EXPIRED', stageName: 'L4: HẾT THỜI GIAN TÍNH PHÍ', count: totalFeeExpired },
    ];
  },

  async getOperationalResults(): Promise<OperationalResults> {
    await delay();
    const totalVwwAllTime = 412;
    const totalVwwThisMonth = MOCK_WORKERS.filter(w => w.isVerifiedWorking).length + 80;

    return {
      totalVwwThisMonth,
      totalVwwAllTime,
      interviewPassRate: 74.2,
      offerToStartRate: 82.5,
      retention7DaysRate: 91.0,
      retention30DaysRate: 78.4,
      partnerPerformance: [
        { partnerName: 'Foxconn Bắc Giang', totalStarted: 120, vwwCount: 112, vwwRate: 93, retention7DaysRate: 94 },
        { partnerName: 'Luxshare ICT Bắc Ninh', totalStarted: 95, vwwCount: 86, vwwRate: 90, retention7DaysRate: 89 },
        { partnerName: 'Samsung Thái Nguyên', totalStarted: 140, vwwCount: 128, vwwRate: 91, retention7DaysRate: 92 },
        { partnerName: 'Goertek Vina Quế Võ', totalStarted: 60, vwwCount: 52, vwwRate: 86, retention7DaysRate: 88 },
      ],
      recruiterPerformance: [
        { recruiterName: 'Nguyễn Thu Trang', officeName: 'Văn phòng Bắc Ninh', totalAssigned: 85, passedCount: 68, vwwCount: 62 },
        { recruiterName: 'Lê Văn Đức', officeName: 'Văn phòng Bắc Ninh', totalAssigned: 60, passedCount: 45, vwwCount: 41 },
        { recruiterName: 'Trần Minh Trí', officeName: 'Văn phòng Bắc Giang', totalAssigned: 75, passedCount: 58, vwwCount: 52 },
        { recruiterName: 'Vũ Hoàng Lan', officeName: 'Văn phòng Hà Nội', totalAssigned: 45, passedCount: 34, vwwCount: 31 },
      ],
    };
  },

  async getFollowUpQueue(): Promise<FollowUpItem[]> {
    await delay();
    const passedWorkers = MOCK_WORKERS.filter(
      w => w.status === WorkerStatus.PASSED || w.status === WorkerStatus.WAITING_START
    );
    return passedWorkers.map(w => ({
      id: `FOL-${w.workerId}`,
      workerId: w.workerId,
      workerName: w.fullName,
      phone: w.phone,
      partnerName: w.partnerName || 'Chưa gán xưởng',
      currentStatus: w.status,
      slaHours: 26,
      reason: 'Đã có kết quả đậu phỏng vấn quá 24h nhưng chưa chốt ngày đi làm',
      dueAt: '17:00 hôm nay',
    }));
  },

  async resolveFollowUp(itemId: string, resolution: string): Promise<boolean> {
    await delay();
    return true;
  },

  async runGoldenFlow(flowId: 'GF-001' | 'GF-002' | 'GF-003' | 'GF-004' | 'GF-005'): Promise<{ message: string; workerId?: string }> {
    await delay(300);
    if (flowId === 'GF-001') {
      const wRes = await mockWorkerService.createWorker({
        fullName: 'Nguyễn Văn An (Demo GF-001)',
        phone: '0919888777',
        province: 'Bắc Giang',
        currentNeed: 'Tìm việc gấp tại Foxconn',
        overrideDuplicate: true,
      });
      const wId = wRes.worker!.workerId;

      const int = await mockWorkerService.createInterview({
        workerId: wId,
        partnerId: 'PT-01',
        jobId: 'JOB-01',
        scheduledAt: new Date().toISOString(),
        interviewer: 'Foxconn HR',
        note: 'Bài test chuẩn mực',
      });
      await mockWorkerService.recordInterviewResult(int.id, 'PASSED', 'Đạt yêu cầu xuất sắc');

      await mockWorkerService.createAssignment({
        workerId: wId,
        partnerId: 'PT-01',
        jobId: 'JOB-01',
        shift: 'Ca ngày',
        startDate: new Date().toISOString().slice(0, 10),
        markAsStartedNow: true,
      });

      const revId = `MR-GF001-${Date.now()}`;
      MOCK_MATCHING_REVIEWS.unshift({
        id: revId,
        attendanceId: `ATT-GF001-${Date.now()}`,
        incomingRaw: {
          rawName: 'NGUYEN VAN AN',
          rawPhone: '0919888777',
          partnerName: 'Foxconn Bắc Giang',
          daysWorked: 22,
          workDate: new Date().toISOString().slice(0, 10),
          shift: 'Ca ngày',
        },
        suggestedWorker: {
          workerId: wId,
          fullName: 'Nguyễn Văn An (Demo GF-001)',
          phone: '0919888777',
          currentStatus: WorkerStatus.WORKING,
        },
        confidenceScore: 98,
        matchReasons: ['Trùng khớp SĐT 100%', 'Trùng tên sau chuẩn hóa', 'Trùng đối tác Foxconn'],
        reviewStatus: ReviewStatus.PENDING,
        createdAt: new Date().toISOString(),
      });

      await mockAttendanceService.confirmMatch(revId, wId);

      return {
        message: 'Hoàn tất GF-001 Happy Path: Lao động đạt chuẩn VERIFIED WORKING WORKER (VWW)!',
        workerId: wId,
      };
    }

    if (flowId === 'GF-002') {
      return { message: 'GF-002: Thử tạo lao động với SĐT 0912345678 hoặc CCCD 001200003456 để thấy cảnh báo trùng!' };
    }

    if (flowId === 'GF-003') {
      return { message: 'GF-003: Bản ghi MR-002 (Trùng tên, không có SĐT) đang đợi người duyệt tại trang CẦN XÁC NHẬN!' };
    }

    if (flowId === 'GF-004') {
      return { message: 'GF-004: Bản ghi MR-003 (Không khớp danh sách) đã tạo Action Item và không tự động xác nhận!' };
    }

    if (flowId === 'GF-005') {
      return {
        message: 'GF-005: Lao động WK-000102 (Trần Thị Mai) đã đậu >24h chưa đi làm, tự động tạo cảnh báo P1!',
        workerId: 'WK-000102',
      };
    }

    return { message: 'Đã hoàn tất quy trình kiểm thử' };
  }
};
