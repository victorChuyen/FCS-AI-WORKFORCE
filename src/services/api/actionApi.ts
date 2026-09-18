import { callApi } from '../apiClient';
import { ApiResponse, ActionQueueItem, Priority } from '../../types';

export const actionApi = {
  async getTodayActions(status: string = 'OPEN'): Promise<ApiResponse<ActionQueueItem[]>> {
    try {
      const res = await callApi<any>('action.list', { status });
      if (res.success && res.data) {
        const items = Array.isArray(res.data) ? res.data : ((res.data as any).items || []);
        if (items.length > 0) {
          const priorityOrder: Record<string, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };
          const sorted = [...items].sort((a, b) => {
            const ordA = priorityOrder[a.priority] ?? 99;
            const ordB = priorityOrder[b.priority] ?? 99;
            return ordA - ordB;
          });
          return {
            ...res,
            data: sorted,
          };
        }
      }
    } catch {
      // fallback to deriving from real CRM deals
    }

    // Derive action items directly from real deals on Google Sheets
    try {
      const dealsRes = await callApi<any>('v2.deals.list', { limit: 20 });
      if (dealsRes.success && dealsRes.data) {
        const dealList = Array.isArray(dealsRes.data) ? dealsRes.data : ((dealsRes.data as any).deals || []);
        const actionItems: ActionQueueItem[] = [];

        dealList.forEach((d: any) => {
          const stage = (d.level_sale_status || '').toUpperCase();
          if (stage === 'L3.1') {
            actionItems.push({
              actionId: `ACT-P0-${d.deal_id}`,
              workerId: d.worker_id,
              workerName: d.full_name,
              title: `Lao động ${d.full_name} (${d.worker_id}) báo nghỉ ngang tại ${d.target_company || 'nhà máy'}`,
              reason: 'Lao động đang đi làm báo nghỉ việc ngang, có nguy cơ mất phí hoa hồng',
              priority: Priority.P0,
              dueText: 'Hạn xử lý: Trong ngày',
              recommendedAction: 'Gọi điện phỏng vấn lý do thôi việc và đề xuất đổi xưởng hoặc hỗ trợ giữ chân',
              status: 'OPEN',
              createdAt: d.updated_at || new Date().toISOString(),
            } as any);
          } else if (stage === 'L1.2') {
            actionItems.push({
              actionId: `ACT-P1-${d.deal_id}`,
              workerId: d.worker_id,
              workerName: d.full_name,
              title: `Ứng viên ${d.full_name} hẹn gọi lại tư vấn chăm sóc`,
              reason: 'Ứng viên quan tâm đơn tuyển dụng nhưng chưa chốt lịch phỏng vấn',
              priority: Priority.P1,
              dueText: 'Hạn xử lý: Trước 11:30',
              recommendedAction: 'Tư vấn chế độ đãi ngộ, xe đưa đón và ký túc xá miễn phí',
              status: 'OPEN',
              createdAt: d.updated_at || new Date().toISOString(),
            } as any);
          } else if (stage === 'L2') {
            actionItems.push({
              actionId: `ACT-P2-${d.deal_id}`,
              workerId: d.worker_id,
              workerName: d.full_name,
              title: `Xác nhận lịch phỏng vấn ${d.full_name} tại xưởng ${d.target_company || 'FUYU'}`,
              reason: 'Đã hẹn phỏng vấn, cần nhắc nhở giấy tờ CCCD và điểm tập kết xe',
              priority: Priority.P2,
              dueText: 'Hạn xử lý: Trước ca phỏng vấn',
              recommendedAction: 'Gửi tin nhắn Zalo hướng dẫn mang CCCD gốc và trang phục lịch sự',
              status: 'OPEN',
              createdAt: d.updated_at || new Date().toISOString(),
            } as any);
          } else if (stage === 'C3') {
            actionItems.push({
              actionId: `ACT-P3-${d.deal_id}`,
              workerId: d.worker_id,
              workerName: d.full_name,
              title: `Hồ sơ lao động mới tiếp nhận: ${d.full_name}`,
              reason: 'Ứng viên mới đăng ký ứng tuyển, chưa được phân bổ tư vấn viên',
              priority: Priority.P3,
              dueText: 'Hạn xử lý: Trong 2 giờ',
              recommendedAction: 'Gọi điện sàng lọc độ tuổi, sức khỏe và nguyện vọng công xưởng',
              status: 'OPEN',
              createdAt: d.updated_at || new Date().toISOString(),
            } as any);
          }
        });

        const priorityOrder: Record<string, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };
        actionItems.sort((a, b) => (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99));

        return {
          success: true,
          data: actionItems,
          error: null,
          requestId: `REQ-DEAL-ACTIONS-${Date.now()}`,
        };
      }
    } catch {
      // Return empty
    }

    return {
      success: true,
      data: [],
      error: null,
      requestId: `REQ-ACT-${Date.now()}`,
    };
  },

  async resolveAction(actionId: string, note?: string): Promise<ApiResponse<boolean>> {
    return callApi<boolean>('action.resolve', { actionId, note });
  }
};
