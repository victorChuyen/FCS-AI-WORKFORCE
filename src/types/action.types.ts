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
