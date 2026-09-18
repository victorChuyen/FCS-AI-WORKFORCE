export interface Assignment {
  id: string;
  workerId: string;
  partnerId: string;
  partnerName: string;
  jobId: string;
  jobTitle: string;
  shift: string;
  startDate: string;
  startedWorkAt?: string;
  hasStarted: boolean;
  status: 'SCHEDULED' | 'WORKING' | 'COMPLETED' | 'CANCELLED';
  confirmedByManager: boolean;
  createdAt: string;
}
