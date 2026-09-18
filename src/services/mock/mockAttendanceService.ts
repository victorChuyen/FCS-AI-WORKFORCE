import {
  MOCK_MATCHING_REVIEWS,
  MOCK_ATTENDANCES,
  MOCK_WORKERS,
  MOCK_ASSIGNMENTS,
  MOCK_PIPELINE_EVENTS,
} from './mockData';
import { MatchingReview, ReviewStatus, MatchingStatus, WorkerStatus, PipelineEventType, AttendanceReviewItem } from '../../types';

const delay = (ms = 120) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAttendanceService = {
  async getMatchingQueue(): Promise<MatchingReview[]> {
    await delay();
    return [...MOCK_MATCHING_REVIEWS];
  },

  async confirmMatch(reviewId: string, workerId: string): Promise<boolean> {
    await delay();
    const revIndex = MOCK_MATCHING_REVIEWS.findIndex(r => r.id === reviewId);
    if (revIndex === -1) return false;

    const review = MOCK_MATCHING_REVIEWS[revIndex];
    review.reviewStatus = ReviewStatus.CONFIRMED;
    review.reviewedAt = new Date().toISOString();
    review.reviewedBy = 'Quản lý vận hành';

    // Update attendance record
    const att = MOCK_ATTENDANCES.find(a => a.id === review.attendanceId);
    if (att) {
      att.matchingStatus = MatchingStatus.MATCHED;
      att.workerId = workerId;
      att.matchedAt = new Date().toISOString();
      att.verifiedBy = 'Quản lý duyệt';
    }

    const worker = MOCK_WORKERS.find(w => w.workerId === workerId);
    if (worker) {
      let asg = MOCK_ASSIGNMENTS.find(a => a.workerId === workerId);
      if (!asg) {
        asg = {
          id: `ASG-${Date.now().toString().slice(-4)}`,
          workerId,
          partnerId: 'PT-01',
          partnerName: review.incomingRaw.partnerName,
          jobId: 'JOB-01',
          jobTitle: 'Lao động phổ thông',
          shift: review.incomingRaw.shift || 'Ca hành chính',
          startDate: new Date().toISOString().slice(0, 10),
          startedWorkAt: new Date().toISOString(),
          hasStarted: true,
          status: 'WORKING',
          confirmedByManager: true,
          createdAt: new Date().toISOString(),
        };
        MOCK_ASSIGNMENTS.unshift(asg);
      } else {
        asg.hasStarted = true;
        asg.status = 'WORKING';
      }

      worker.status = WorkerStatus.WORKING;
      worker.isVerifiedWorking = true;
      worker.vwwAchievedAt = new Date().toISOString();
      worker.lastActivity = `Khớp ${review.incomingRaw.daysWorked} công - Đạt chuẩn VWW`;
      worker.updatedAt = new Date().toISOString();

      MOCK_PIPELINE_EVENTS.push({
        id: `EV-${workerId}-${Date.now()}-CONF`,
        workerId,
        eventType: PipelineEventType.ATTENDANCE_CONFIRMED,
        title: `Khớp thành công ${review.incomingRaw.daysWorked} công`,
        description: `Đối chiếu thành công dữ liệu từ ${review.incomingRaw.partnerName}`,
        timestamp: new Date().toISOString(),
        performedBy: 'Quản lý xác nhận',
      });

      MOCK_PIPELINE_EVENTS.push({
        id: `EV-${workerId}-${Date.now()}-VWW`,
        workerId,
        eventType: PipelineEventType.VERIFIED_WORKING,
        title: 'Đạt chuẩn VERIFIED WORKING WORKER (VWW)',
        description: 'Đã hoàn tất chu trình vàng: Có Worker ID + Assignment + Đi làm + Đã xác nhận chấm công',
        timestamp: new Date().toISOString(),
        performedBy: 'Hệ thống FCS',
      });
    }

    return true;
  },

  async rejectMatch(reviewId: string, reason?: string): Promise<boolean> {
    await delay();
    const rev = MOCK_MATCHING_REVIEWS.find(r => r.id === reviewId);
    if (!rev) return false;
    rev.reviewStatus = ReviewStatus.REJECTED;
    rev.resolutionNote = reason || 'Quản lý xác nhận không khớp hồ sơ';
    rev.reviewedAt = new Date().toISOString();

    const att = MOCK_ATTENDANCES.find(a => a.id === rev.attendanceId);
    if (att) {
      att.matchingStatus = MatchingStatus.UNMATCHED;
    }
    return true;
  },

  async assignDifferentWorker(reviewId: string, newWorkerId: string): Promise<boolean> {
    await delay();
    const rev = MOCK_MATCHING_REVIEWS.find(r => r.id === reviewId);
    const worker = MOCK_WORKERS.find(w => w.workerId === newWorkerId);
    if (!rev || !worker) return false;

    rev.suggestedWorker = {
      workerId: worker.workerId,
      fullName: worker.fullName,
      phone: worker.phone,
      cccd: worker.cccd,
      partnerName: worker.partnerName,
      currentStatus: worker.status,
    };
    rev.confidenceScore = 90;
    rev.matchReasons = ['Đã được Quản lý chỉ định ghép thủ công'];

    return mockAttendanceService.confirmMatch(reviewId, newWorkerId);
  },

  async getAttendanceReviews(): Promise<AttendanceReviewItem[]> {
    await delay();
    return MOCK_MATCHING_REVIEWS
      .filter(r => r.reviewStatus === ReviewStatus.PENDING)
      .map(r => ({
        id: r.id,
        attendanceId: r.attendanceId,
        rawWorkerName: r.incomingRaw.rawName,
        rawPhone: r.incomingRaw.rawPhone,
        rawCccd: r.incomingRaw.rawCccd,
        partnerName: r.incomingRaw.partnerName,
        workDate: r.incomingRaw.workDate,
        daysWorked: r.incomingRaw.daysWorked,
        confidenceScore: r.confidenceScore,
        reason: r.matchReasons.join('; '),
        suggestedWorker: r.suggestedWorker
          ? {
              workerId: r.suggestedWorker.workerId,
              fullName: r.suggestedWorker.fullName,
              phone: r.suggestedWorker.phone,
              assignedPartner: r.suggestedWorker.partnerName,
              status: r.suggestedWorker.currentStatus,
              isVerifiedWorking: MOCK_WORKERS.find(w => w.workerId === r.suggestedWorker?.workerId)?.isVerifiedWorking || false,
            }
          : undefined,
      }));
  },

  async confirmAttendanceMatch(reviewId: string, matchedWorkerId?: string): Promise<{ success: boolean; message: string }> {
    const rev = MOCK_MATCHING_REVIEWS.find(r => r.id === reviewId);
    const targetWorkerId = matchedWorkerId || rev?.suggestedWorker?.workerId;
    if (!targetWorkerId) {
      throw new Error('Chưa có mã lao động để khớp');
    }
    await mockAttendanceService.confirmMatch(reviewId, targetWorkerId);
    return {
      success: true,
      message: `Đã khớp thành công cho lao động ${targetWorkerId} và mở khóa tiêu chuẩn VWW!`,
    };
  },

  async ignoreAttendance(reviewId: string): Promise<boolean> {
    return mockAttendanceService.rejectMatch(reviewId, 'Tạm hoãn xác nhận');
  },
};
