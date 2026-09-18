import { callApi } from '../apiClient';
import { ApiResponse, MatchingReview, AttendanceReviewItem } from '../../types';

export const attendanceApi = {
  async getWorkerAttendance(workerId: string): Promise<ApiResponse<any[]>> {
    return callApi<any[]>('attendance.list', { workerId });
  },

  async getMatchingQueue(): Promise<ApiResponse<MatchingReview[]>> {
    const res = await callApi<any>('matching.list', {});
    if (res.success && res.data) {
      const items = Array.isArray(res.data) ? res.data : (res.data.items || []);
      return {
        ...res,
        data: items,
      };
    }
    return {
      success: true,
      data: [],
      error: null,
      requestId: `REQ-${Date.now()}`,
    };
  },

  async getAttendanceReviews(): Promise<ApiResponse<AttendanceReviewItem[]>> {
    const res = await callApi<any>('matching.list', {});
    if (res.success && res.data) {
      const items = Array.isArray(res.data) ? res.data : (res.data.items || []);
      const mapped: AttendanceReviewItem[] = items.map((m: any) => ({
        id: m.reviewId || m.id || `REV-${Date.now()}`,
        attendanceId: m.rawId || m.attendanceId || `ATT-${Date.now()}`,
        rawWorkerName: m.workerName || m.rawWorkerName || 'Lao động cần khớp nối',
        rawWorkerPhone: m.workerPhone || m.rawWorkerPhone || 'Chưa rõ',
        date: m.date || new Date().toISOString().split('T')[0],
        hoursWorked: m.hoursWorked || 8,
        confidence: m.confidenceScore || 85,
        matchType: 'PARTIAL',
        suggestedWorker: m.suggestedWorkerId ? {
          id: m.suggestedWorkerId,
          name: m.suggestedWorkerName || 'Lao động đề xuất',
          phone: m.suggestedWorkerPhone || '',
          idCard: m.suggestedWorkerIdCard || '',
          activePartner: m.partnerName || 'Đối tác',
        } : undefined,
        reason: m.reason || 'Khớp theo ca làm việc',
        status: m.status || 'PENDING',
      }));
      return {
        ...res,
        data: mapped,
      };
    }
    return {
      success: true,
      data: [],
      error: null,
      requestId: `REQ-${Date.now()}`,
    };
  },

  async confirmMatch(reviewId: string, workerId: string): Promise<ApiResponse<boolean>> {
    return callApi<boolean>('attendance.match', { reviewId, workerId });
  },

  async confirmAttendanceMatch(attendanceId: string, workerId: string): Promise<ApiResponse<boolean>> {
    return callApi<boolean>('attendance.match', { attendanceId, workerId });
  },

  async rejectMatch(reviewId: string, reason?: string): Promise<ApiResponse<boolean>> {
    return callApi<boolean>('attendance.reject', { reviewId, reason });
  },

  async ignoreAttendance(reviewId: string): Promise<ApiResponse<boolean>> {
    return callApi<boolean>('attendance.ignore', { reviewId });
  },

  async assignMatch(reviewId: string, targetWorkerId: string): Promise<ApiResponse<boolean>> {
    return callApi<boolean>('attendance.match', { reviewId, workerId: targetWorkerId });
  }
};
