export enum WorkerStatus {
  NEW = 'NEW',
  INTERVIEW_PENDING = 'INTERVIEW_PENDING',
  INTERVIEWED = 'INTERVIEWED',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  WAITING_START = 'WAITING_START',
  WORKING = 'WORKING',
  QUIT = 'QUIT',
  INACTIVE = 'INACTIVE',
}

export enum MatchingStatus {
  MATCHED = 'MATCHED',
  REVIEW = 'REVIEW',
  UNMATCHED = 'UNMATCHED',
  ERROR = 'ERROR',
}

export enum ReviewStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  CREATED_NEW = 'CREATED_NEW',
}

export enum ActionStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  DISMISSED = 'DISMISSED',
}

export enum Priority {
  P0 = 'P0',
  P1 = 'P1',
  P2 = 'P2',
  P3 = 'P3',
}

export enum PipelineEventType {
  REGISTERED = 'REGISTERED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  INTERVIEWED = 'INTERVIEWED',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  ASSIGNMENT_CREATED = 'ASSIGNMENT_CREATED',
  STARTED = 'STARTED',
  ATTENDANCE_IMPORTED = 'ATTENDANCE_IMPORTED',
  ATTENDANCE_CONFIRMED = 'ATTENDANCE_CONFIRMED',
  VERIFIED_WORKING = 'VERIFIED_WORKING',
  QUIT = 'QUIT',
}

export type UserRole =
  | 'PLATFORM_SUPER_ADMIN'
  | 'TENANT_ADMIN'
  | 'TENANT_MANAGER'
  | 'RECRUITER'
  | 'VIEWER'
  | 'ADMIN'
  | 'MANAGER'
  | 'STAFF';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId?: string;
  companyName?: string;
  companySlug?: string;
  companyCode?: string;
  officeId: string;
  allowedOfficeIds?: string[];
  staffId?: string;
  isSuperAdmin?: boolean;
}

export interface Worker {
  workerId: string;
  fullName: string;
  phone: string;
  cccd?: string;
  dateOfBirth?: string;
  gender?: 'Nam' | 'Nữ' | 'Khác';
  province: string;
  district?: string;
  address?: string;
  currentNeed: string; // Nhu cầu hiện tại (e.g. "Cần việc gấp trong 3 ngày", "Tìm việc ca ngày",...)
  desiredJob?: string;
  source: string; // "Zalo Form", "Facebook", "Điểm tuyển dụng trực tiếp", "Người quen giới thiệu", etc.
  recruiterId: string;
  recruiterName: string;
  officeId: string;
  officeName: string;
  partnerId?: string;
  partnerName?: string;
  status: WorkerStatus;
  isVerifiedWorking: boolean; // VWW flag
  vwwAchievedAt?: string;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface PipelineEvent {
  id: string;
  workerId: string;
  eventType: PipelineEventType;
  title: string;
  description: string;
  timestamp: string;
  performedBy: string; // "AI Automation" | "Hệ thống" | Staff Name
  metadata?: Record<string, any>;
}

export interface Interview {
  id: string;
  workerId: string;
  partnerId: string;
  partnerName: string;
  jobId: string;
  jobTitle: string;
  scheduledAt: string;
  conductedAt?: string;
  interviewer: string;
  result: 'PENDING' | 'PASSED' | 'FAILED' | 'NO_SHOW';
  note?: string;
  createdAt: string;
}

export interface Assignment {
  id: string;
  workerId: string;
  partnerId: string;
  partnerName: string;
  jobId: string;
  jobTitle: string;
  shift: string; // e.g. "Ca 1 (6h - 14h)", "Ca xoay", "Hành chính"
  startDate: string;
  startedWorkAt?: string;
  hasStarted: boolean;
  status: 'SCHEDULED' | 'WORKING' | 'COMPLETED' | 'CANCELLED';
  confirmedByManager: boolean;
  createdAt: string;
}

export interface Attendance {
  id: string;
  workerId?: string;
  workerName?: string;
  rawWorkerName: string;
  rawPhone?: string;
  rawCccd?: string;
  partnerId: string;
  partnerName: string;
  workDate: string;
  shift?: string;
  daysWorked: number; // e.g. 22 công, 1 công
  matchingStatus: MatchingStatus;
  confidenceScore?: number;
  matchedAt?: string;
  verifiedBy?: string;
  importBatchId: string;
  createdAt: string;
}

export interface MatchingReview {
  id: string;
  attendanceId: string;
  incomingRaw: {
    rawName: string;
    rawPhone?: string;
    rawCccd?: string;
    partnerName: string;
    daysWorked: number;
    workDate: string;
    shift?: string;
  };
  suggestedWorker?: {
    workerId: string;
    fullName: string;
    phone: string;
    cccd?: string;
    partnerName?: string;
    currentStatus: WorkerStatus;
    assignmentId?: string;
  };
  confidenceScore: number;
  matchReasons: string[];
  reviewStatus: ReviewStatus;
  resolutionNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface ActionQueueItem {
  actionId: string;
  priority: Priority;
  actionType:
    | 'UNMATCHED_ATTENDANCE'
    | 'PASSED_NO_START_24H'
    | 'DUPLICATE_RECORD'
    | 'STARTED_NO_ATTENDANCE'
    | 'DATA_MISSING'
    | 'INTERVIEW_PENDING';
  workerId?: string;
  workerName?: string;
  title: string;
  reason: string;
  recommendedAction: string;
  status: ActionStatus;
  dueAt: string;
  createdAt: string;
  officeId?: string;
}

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
    verifiedWorkingWorkers: number; // VWW
  };
  rates?: {
    startRate: number; // %
    matchRate: number; // %
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

export interface Partner {
  id: string;
  name: string;
  code: string;
  location: string;
  industry: string;
  activeWorkersCount: number;
}

export interface Job {
  id: string;
  partnerId: string;
  partnerName: string;
  title: string;
  salaryRange: string;
  location: string;
  vacancies: number;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  officeId: string;
  officeName: string;
  activeCandidatesCount: number;
}

export interface Office {
  id: string;
  name: string;
  code: string;
  address: string;
}

export interface AttendanceReviewItem {
  id: string;
  attendanceId: string;
  rawWorkerName: string;
  rawPhone?: string;
  rawCccd?: string;
  partnerName: string;
  workDate: string;
  daysWorked: number;
  confidenceScore: number;
  reason: string;
  suggestedWorker?: {
    workerId: string;
    fullName: string;
    phone: string;
    assignedPartner?: string;
    status: string;
    isVerifiedWorking: boolean;
  };
}

export interface FollowUpItem {
  id: string;
  workerId: string;
  workerName: string;
  phone: string;
  partnerName?: string;
  currentStatus: WorkerStatus;
  slaHours: number;
  reason: string;
  dueAt: string;
}

export interface DuplicateSuspect {
  id: string;
  workerA: {
    workerId: string;
    fullName: string;
    phone: string;
    cccd?: string;
    province: string;
    recruiterName: string;
  };
  workerB: {
    workerId: string;
    fullName: string;
    phone: string;
    cccd?: string;
    province: string;
    recruiterName: string;
  };
  reason: string;
  detectedAt: string;
}

export interface PipelineFunnelData {
  stageKey: string;
  stageName: string;
  count: number;
  slaWarning?: string;
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

export interface DuplicateWorkerInfo {
  workerId: string;
  fullName: string;
  phone: string;
  currentStatus: string;
  matchReason?: string;
  province?: string;
  recruiterName?: string;
  cccd?: string;
  isVerifiedWorking?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: any;
    [key: string]: any;
  } | null;
  requestId: string;
}

/**
 * FCS V4 MULTI-TENANT SAAS CORE DOMAIN TYPES
 */

export type TenantStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
export type UserAccessStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED';

export interface TenantContext {
  firebaseUid: string;
  email: string;
  tenantId: string;
  companyName: string;
  companySlug: string;
  companyCode: string;
  role: 'PLATFORM_SUPER_ADMIN' | 'TENANT_ADMIN' | 'TENANT_MANAGER' | 'RECRUITER' | 'VIEWER';
  staffId: string;
  allowedOfficeIds: string[];
  planCode: string;
  features: string[];
  dataSpreadsheetId?: string;
  managementSpreadsheetId?: string;
  isSuperAdmin?: boolean;
}

export interface TenantSummary {
  tenantId: string;
  companyName: string;
  companySlug: string;
  companyCode: string;
  planCode: string;
  status: TenantStatus;
  ownerEmail: string;
  createdAt?: string;
  activatedAt?: string;
}

export interface TenantFilesConfig {
  tenantId: string;
  dataSpreadsheetId: string;
  managementSpreadsheetId: string;
  dataSpreadsheetName: string;
  managementSpreadsheetName: string;
  driveFolderId?: string;
  schemaVersion: string;
}

export interface UserTenantAccess {
  accessId: string;
  firebaseUid: string;
  tenantId: string;
  role: string;
  officeScope: string[];
  staffId: string;
  status: UserAccessStatus;
}
