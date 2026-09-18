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
