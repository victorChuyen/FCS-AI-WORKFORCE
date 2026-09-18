import { WorkerStatus } from './worker.types';

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
  daysWorked: number;
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
