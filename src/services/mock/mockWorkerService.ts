import {
  MOCK_WORKERS,
  MOCK_PIPELINE_EVENTS,
  MOCK_OFFICES,
  MOCK_STAFF,
  MOCK_INTERVIEWS,
  MOCK_PARTNERS,
  MOCK_JOBS,
  MOCK_ASSIGNMENTS,
  MOCK_ATTENDANCES,
} from './mockData';
import { Worker, WorkerStatus, PipelineEvent, PipelineEventType, Interview, Assignment, Attendance, DuplicateSuspect } from '../../types';

const delay = (ms = 120) => new Promise(resolve => setTimeout(resolve, ms));

export const mockWorkerService = {
  async getWorkers(filters?: { search?: string; officeId?: string; recruiterId?: string; status?: string; partnerId?: string; }): Promise<Worker[]> {
    await delay();
    let result = [...MOCK_WORKERS];
    if (filters) {
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        result = result.filter(
          w =>
            w.workerId.toLowerCase().includes(q) ||
            w.fullName.toLowerCase().includes(q) ||
            w.phone.includes(q) ||
            (w.cccd && w.cccd.includes(q))
        );
      }
      if (filters.officeId && filters.officeId !== 'ALL') {
        result = result.filter(w => w.officeId === filters.officeId);
      }
      if (filters.recruiterId && filters.recruiterId !== 'ALL') {
        result = result.filter(w => w.recruiterId === filters.recruiterId);
      }
      if (filters.status && filters.status !== 'ALL') {
        if (filters.status === 'VWW') {
          result = result.filter(w => w.isVerifiedWorking);
        } else if (filters.status === 'NEW') {
          result = result.filter(w => [WorkerStatus.NEW, WorkerStatus.DUPLICATE, WorkerStatus.JUNK].includes(w.status));
        } else if (filters.status === 'ASSIGNED_TO_SALE') {
          result = result.filter(w => [
            WorkerStatus.ASSIGNED_TO_SALE,
            WorkerStatus.REFERENCE,
            WorkerStatus.FOLLOW_UP,
            WorkerStatus.REJECTED,
            WorkerStatus.UNREACHABLE,
            WorkerStatus.OVERAGE,
            WorkerStatus.CALLBACK,
            WorkerStatus.UNDERAGE,
          ].includes(w.status));
        } else if (filters.status === 'INTERVIEW_PENDING') {
          result = result.filter(w => [WorkerStatus.INTERVIEW_PENDING, WorkerStatus.INTERVIEWED, WorkerStatus.NO_SHOW].includes(w.status));
        } else if (filters.status === 'PASSED') {
          result = result.filter(w => [WorkerStatus.PASSED, WorkerStatus.WAITING_START].includes(w.status));
        } else if (filters.status === 'WORKING') {
          result = result.filter(w => [WorkerStatus.WORKING, WorkerStatus.TRANSFER_REQUEST].includes(w.status));
        } else {
          result = result.filter(w => w.status === filters.status);
        }
      }
      if (filters.partnerId && filters.partnerId !== 'ALL') {
        result = result.filter(w => w.partnerId === filters.partnerId);
      }
    }
    return result;
  },

  async getWorker(workerId: string): Promise<Worker | null> {
    await delay();
    const worker = MOCK_WORKERS.find(w => w.workerId === workerId);
    return worker || null;
  },

  async createWorker(payload: {
    fullName: string;
    phone: string;
    province: string;
    currentNeed: string;
    needNote?: string;
    dateOfBirth?: string;
    gender?: 'Nam' | 'Nữ' | 'Khác';
    cccd?: string;
    district?: string;
    address?: string;
    source?: string;
    desiredJob?: string;
    officeId?: string;
    recruiterId?: string;
    overrideDuplicate?: boolean;
    forceCreate?: boolean;
    preferredJob?: string;
    currentUser?: any;
  }): Promise<{ worker?: Worker; duplicateWarning?: boolean; existingWorker?: Worker }> {
    await delay();

    if (!payload.overrideDuplicate && !payload.forceCreate) {
      const cleanPhone = payload.phone.replace(/\D/g, '');
      const cleanCccd = payload.cccd ? payload.cccd.replace(/\D/g, '') : null;

      const dup = MOCK_WORKERS.find(w => {
        const pMatch = w.phone.replace(/\D/g, '') === cleanPhone;
        const cMatch = cleanCccd && w.cccd && w.cccd.replace(/\D/g, '') === cleanCccd;
        return pMatch || cMatch;
      });

      if (dup) {
        return {
          duplicateWarning: true,
          existingWorker: dup,
        };
      }
    }

    const nextNum = MOCK_WORKERS.length + 101;
    const workerId = `WK-${String(nextNum).padStart(6, '0')}`;
    const office = MOCK_OFFICES.find(o => o.id === payload.officeId) || MOCK_OFFICES[0];
    const recruiter = MOCK_STAFF.find(s => s.id === payload.recruiterId) || MOCK_STAFF[0];

    const newWorker: Worker = {
      workerId,
      fullName: payload.fullName.trim(),
      phone: payload.phone.trim(),
      cccd: payload.cccd?.trim(),
      dateOfBirth: payload.dateOfBirth,
      gender: payload.gender,
      province: payload.province.trim(),
      district: payload.district?.trim(),
      address: payload.address?.trim(),
      currentNeed: payload.currentNeed.trim(),
      desiredJob: payload.desiredJob?.trim() || 'Lao động phổ thông',
      source: payload.source || 'Zalo Form',
      recruiterId: recruiter.id,
      recruiterName: recruiter.name,
      officeId: office.id,
      officeName: office.name,
      status: WorkerStatus.NEW,
      isVerifiedWorking: false,
      lastActivity: 'Hồ sơ mới tiếp nhận, chờ tư vấn',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_WORKERS.unshift(newWorker);

    MOCK_PIPELINE_EVENTS.push({
      id: `EV-${workerId}-REG`,
      workerId,
      eventType: PipelineEventType.REGISTERED,
      title: 'Đăng ký hồ sơ mới',
      description: `Hồ sơ tiếp nhận từ nguồn ${newWorker.source}. Hệ thống cấp mã ${workerId}`,
      timestamp: new Date().toISOString(),
      performedBy: 'Hệ thống tự động',
    });

    return { worker: newWorker };
  },

  async updateWorker(workerId: string, payload: Partial<Worker>): Promise<Worker | null> {
    await delay();
    const index = MOCK_WORKERS.findIndex(w => w.workerId === workerId);
    if (index === -1) return null;
    MOCK_WORKERS[index] = {
      ...MOCK_WORKERS[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    return MOCK_WORKERS[index];
  },

  async updateWorkerStatus(workerId: string, status: WorkerStatus, note?: string): Promise<boolean> {
    await delay();
    const worker = MOCK_WORKERS.find(w => w.workerId === workerId);
    if (!worker) return false;
    worker.status = status;
    if (note) worker.lastActivity = note;
    worker.updatedAt = new Date().toISOString();
    return true;
  },

  async getPipelineEvents(workerId: string): Promise<PipelineEvent[]> {
    await delay();
    return MOCK_PIPELINE_EVENTS.filter(e => e.workerId === workerId).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  },

  async getDuplicateSuspects(): Promise<DuplicateSuspect[]> {
    await delay();
    return [
      {
        id: 'DUP-001',
        workerA: {
          workerId: 'WK-000101',
          fullName: 'Nguyễn Văn An',
          phone: '0912345678',
          cccd: '001200003456',
          province: 'Bắc Giang',
          recruiterName: 'Nguyễn Thu Trang',
        },
        workerB: {
          workerId: 'WK-000108',
          fullName: 'Nguyễn Văn An',
          phone: '0912345678',
          cccd: '001200003456',
          province: 'Bắc Giang',
          recruiterName: 'Lê Văn Đức',
        },
        reason: 'Trùng khớp 100% Số điện thoại và số CCCD',
        detectedAt: '10:30 hôm nay',
      },
      {
        id: 'DUP-002',
        workerA: {
          workerId: 'WK-000103',
          fullName: 'Lê Văn Cường',
          phone: '0934567890',
          cccd: '025200005678',
          province: 'Phú Thọ',
          recruiterName: 'Trần Minh Trí',
        },
        workerB: {
          workerId: 'WK-000109',
          fullName: 'Lê Cường',
          phone: '0934567890',
          province: 'Phú Thọ',
          recruiterName: 'Nguyễn Thu Trang',
        },
        reason: 'Trùng khớp Số điện thoại (Tên gần đúng)',
        detectedAt: 'Hôm qua',
      },
    ];
  },

  async mergeDuplicates(primaryWorkerId: string, secondaryWorkerId: string): Promise<boolean> {
    await delay();
    const secWorkerIndex = MOCK_WORKERS.findIndex(w => w.workerId === secondaryWorkerId);
    if (secWorkerIndex !== -1) {
      MOCK_WORKERS.splice(secWorkerIndex, 1);
    }
    return true;
  },

  async dismissDuplicate(suspectId: string): Promise<boolean> {
    await delay();
    return true;
  },

  async createInterview(payload: {
    workerId: string;
    partnerId: string;
    jobId: string;
    scheduledAt: string;
    interviewer: string;
    note?: string;
  }): Promise<Interview> {
    await delay();
    const partner = MOCK_PARTNERS.find(p => p.id === payload.partnerId) || MOCK_PARTNERS[0];
    const job = MOCK_JOBS.find(j => j.id === payload.jobId) || MOCK_JOBS[0];

    const interview: Interview = {
      id: `INT-${Date.now().toString().slice(-4)}`,
      workerId: payload.workerId,
      partnerId: partner.id,
      partnerName: partner.name,
      jobId: job.id,
      jobTitle: job.title,
      scheduledAt: payload.scheduledAt,
      interviewer: payload.interviewer,
      result: 'PENDING',
      note: payload.note,
      createdAt: new Date().toISOString(),
    };

    MOCK_INTERVIEWS.unshift(interview);

    const worker = MOCK_WORKERS.find(w => w.workerId === payload.workerId);
    if (worker) {
      worker.status = WorkerStatus.INTERVIEW_PENDING;
      worker.partnerId = partner.id;
      worker.partnerName = partner.name;
      worker.lastActivity = `Lên lịch phỏng vấn tại ${partner.name}`;
      worker.updatedAt = new Date().toISOString();
    }

    MOCK_PIPELINE_EVENTS.push({
      id: `EV-${payload.workerId}-${Date.now()}`,
      workerId: payload.workerId,
      eventType: PipelineEventType.INTERVIEW_SCHEDULED,
      title: 'Lên lịch phỏng vấn',
      description: `Phỏng vấn vị trí ${job.title} tại ${partner.name}`,
      timestamp: new Date().toISOString(),
      performedBy: payload.interviewer || 'Quản lý',
    });

    return interview;
  },

  async recordInterviewResult(
    interviewId: string,
    result: 'PASSED' | 'FAILED',
    note?: string
  ): Promise<Interview | null> {
    await delay();
    const intIndex = MOCK_INTERVIEWS.findIndex(i => i.id === interviewId);
    if (intIndex === -1) return null;

    MOCK_INTERVIEWS[intIndex].result = result;
    MOCK_INTERVIEWS[intIndex].conductedAt = new Date().toISOString();
    if (note) MOCK_INTERVIEWS[intIndex].note = note;

    const workerId = MOCK_INTERVIEWS[intIndex].workerId;
    const worker = MOCK_WORKERS.find(w => w.workerId === workerId);
    if (worker) {
      worker.status = result === 'PASSED' ? WorkerStatus.PASSED : WorkerStatus.FAILED;
      worker.lastActivity =
        result === 'PASSED'
          ? `Đã đỗ phỏng vấn tại ${MOCK_INTERVIEWS[intIndex].partnerName}`
          : `Không đạt phỏng vấn tại ${MOCK_INTERVIEWS[intIndex].partnerName}`;
      worker.updatedAt = new Date().toISOString();
    }

    MOCK_PIPELINE_EVENTS.push({
      id: `EV-${workerId}-${Date.now()}`,
      workerId,
      eventType: result === 'PASSED' ? PipelineEventType.PASSED : PipelineEventType.FAILED,
      title: result === 'PASSED' ? 'Đạt phỏng vấn (PASSED)' : 'Không đạt phỏng vấn (FAILED)',
      description: note || (result === 'PASSED' ? 'Đủ điều kiện tiếp nhận đi làm' : 'Chưa đạt yêu cầu'),
      timestamp: new Date().toISOString(),
      performedBy: 'Bộ phận phỏng vấn',
    });

    return MOCK_INTERVIEWS[intIndex];
  },

  async getWorkerInterviews(workerId: string): Promise<Interview[]> {
    await delay();
    return MOCK_INTERVIEWS.filter(i => i.workerId === workerId);
  },

  async createAssignment(payload: {
    workerId: string;
    partnerId: string;
    jobId: string;
    shift: string;
    startDate: string;
    markAsStartedNow?: boolean;
  }): Promise<Assignment> {
    await delay();
    const partner = MOCK_PARTNERS.find(p => p.id === payload.partnerId) || MOCK_PARTNERS[0];
    const job = MOCK_JOBS.find(j => j.id === payload.jobId) || MOCK_JOBS[0];

    const assignment: Assignment = {
      id: `ASG-${Date.now().toString().slice(-4)}`,
      workerId: payload.workerId,
      partnerId: partner.id,
      partnerName: partner.name,
      jobId: job.id,
      jobTitle: job.title,
      shift: payload.shift,
      startDate: payload.startDate,
      startedWorkAt: payload.markAsStartedNow ? new Date().toISOString() : undefined,
      hasStarted: !!payload.markAsStartedNow,
      status: payload.markAsStartedNow ? 'WORKING' : 'SCHEDULED',
      confirmedByManager: true,
      createdAt: new Date().toISOString(),
    };

    MOCK_ASSIGNMENTS.unshift(assignment);

    const worker = MOCK_WORKERS.find(w => w.workerId === payload.workerId);
    if (worker) {
      worker.status = payload.markAsStartedNow ? WorkerStatus.WORKING : WorkerStatus.WAITING_START;
      worker.partnerId = partner.id;
      worker.partnerName = partner.name;
      worker.lastActivity = payload.markAsStartedNow
        ? `Đã bắt đầu đi làm tại ${partner.name}`
        : `Chờ đi làm tại ${partner.name} (${payload.startDate})`;
      worker.updatedAt = new Date().toISOString();
    }

    MOCK_PIPELINE_EVENTS.push({
      id: `EV-${payload.workerId}-${Date.now()}-1`,
      workerId: payload.workerId,
      eventType: PipelineEventType.ASSIGNMENT_CREATED,
      title: 'Tạo phân bổ đi làm (Assignment)',
      description: `Phân bổ xưởng: ${partner.name} - ${job.title} (${payload.shift})`,
      timestamp: new Date().toISOString(),
      performedBy: 'Quản lý vận hành',
    });

    if (payload.markAsStartedNow) {
      MOCK_PIPELINE_EVENTS.push({
        id: `EV-${payload.workerId}-${Date.now()}-2`,
        workerId: payload.workerId,
        eventType: PipelineEventType.STARTED,
        title: 'Bắt đầu đi làm thực tế',
        description: `Lao động đã nhận ca và bắt đầu làm việc tại xưởng`,
        timestamp: new Date().toISOString(),
        performedBy: 'Quản lý điểm đón',
      });
    }

    return assignment;
  },

  async confirmWorkerStarted(assignmentId: string): Promise<Assignment | null> {
    await delay();
    const asg = MOCK_ASSIGNMENTS.find(a => a.id === assignmentId);
    if (!asg) return null;

    asg.hasStarted = true;
    asg.startedWorkAt = new Date().toISOString();
    asg.status = 'WORKING';

    const worker = MOCK_WORKERS.find(w => w.workerId === asg.workerId);
    if (worker) {
      worker.status = WorkerStatus.WORKING;
      worker.lastActivity = `Đã bắt đầu đi làm tại ${asg.partnerName}`;
      worker.updatedAt = new Date().toISOString();

      MOCK_PIPELINE_EVENTS.push({
        id: `EV-${worker.workerId}-${Date.now()}`,
        workerId: worker.workerId,
        eventType: PipelineEventType.STARTED,
        title: 'Xác nhận bắt đầu làm việc',
        description: 'Lao động đã có mặt tại nhà máy nhận ca',
        timestamp: new Date().toISOString(),
        performedBy: 'Quản lý vận hành',
      });
    }

    return asg;
  },

  async getWorkerAssignments(workerId: string): Promise<Assignment[]> {
    await delay();
    return MOCK_ASSIGNMENTS.filter(a => a.workerId === workerId);
  },

  async getWorkerAttendance(workerId: string): Promise<Attendance[]> {
    await delay();
    return MOCK_ATTENDANCES.filter(a => a.workerId === workerId);
  },
};
