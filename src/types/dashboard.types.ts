import { Priority } from './action.types';

export interface DashboardMetrics {
  northStar?: {
    key: string;
    label: string;
    value: number;
    definition: string;
  };
  metrics?: {
    totalWorkers: number;
    newWorkers: number;
    interviewed: number;
    passed: number;
    waitingStart: number;
    started: number;
    working: number;
    verifiedWorking: number;
    matchRate: number;
    pendingReview: number;
    openActions: number;
  };
  pipeline?: Array<{
    key: string;
    label: string;
    value: number;
  }>;
  priorities?: {
    P0?: number;
    P1?: number;
    P2?: number;
    P3?: number;
  };
  updatedAt?: string;

  // Legacy / Mock fields
  totalActionsNeedAttention?: number;
  priorityBreakdown?: {
    p0: number;
    p1: number;
    p2: number;
    p3: number;
  };
  pipelineCounts?: {
    newWorkers: number;
    interviewPending: number;
    passed: number;
    waitingStart: number;
    working: number;
    verifiedWorkingWorkers: number;
  };
  rates?: {
    startRate: number;
    matchRate: number;
    dropOffCount: number;
  };
  todayActionSummary?: {
    unmatchedAttendanceCount: number;
    passedWaitingStartCount: number;
    duplicateSuspectCount: number;
    interviewsTodayCount: number;
  };
  luckySuggestions?: Array<{
    id: string;
    text: string;
    priority: Priority;
    type: string;
    actionLabel: string;
    targetRoute: string;
  }>;
}

export interface OperationalResults {
  totalVwwThisMonth: number;
  totalVwwAllTime: number;
  interviewPassRate: number;
  offerToStartRate: number;
  retention7DaysRate: number;
  retention30DaysRate: number;
  partnerPerformance: Array<{
    partnerName: string;
    totalStarted: number;
    vwwCount: number;
    vwwRate: number;
    retention7DaysRate: number;
  }>;
  recruiterPerformance: Array<{
    recruiterName: string;
    officeName: string;
    totalAssigned: number;
    passedCount: number;
    vwwCount: number;
  }>;
}
