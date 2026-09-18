export enum PipelineEventType {
  REGISTERED = 'REGISTERED',
  ASSIGNED_TO_SALE = 'ASSIGNED_TO_SALE',
  CALL_LOGGED = 'CALL_LOGGED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  INTERVIEWED = 'INTERVIEWED',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  NO_SHOW = 'NO_SHOW',
  ASSIGNMENT_CREATED = 'ASSIGNMENT_CREATED',
  STARTED = 'STARTED',
  ATTENDANCE_IMPORTED = 'ATTENDANCE_IMPORTED',
  ATTENDANCE_CONFIRMED = 'ATTENDANCE_CONFIRMED',
  VERIFIED_WORKING = 'VERIFIED_WORKING',
  QUIT = 'QUIT',
  TRANSFER_REQUESTED = 'TRANSFER_REQUESTED',
  FEE_EXPIRED = 'FEE_EXPIRED',
}

export interface PipelineEvent {
  id: string;
  workerId: string;
  eventType: PipelineEventType;
  title: string;
  description: string;
  timestamp: string;
  performedBy: string;
  metadata?: Record<string, any>;
}

export interface PipelineFunnelData {
  stageKey: string;
  stageName: string;
  count: number;
  slaWarning?: string;
}
