import { callApi } from '../apiClient';
import { ApiResponse, Worker, WorkerStatus } from '../../types';

export const workerApi = {
  async getWorkers(filters?: {
    search?: string;
    officeId?: string;
    recruiterId?: string;
    status?: string;
    partnerId?: string;
    onlyVww?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<Worker[]>> {
    const payload: any = {
      page: filters?.page || 1,
      pageSize: filters?.pageSize || 50,
    };
    if (filters?.search) payload.search = filters.search;
    if (filters?.status && filters.status !== 'ALL') payload.status = filters.status;
    if (filters?.officeId && filters.officeId !== 'ALL') payload.officeId = filters.officeId;
    if (filters?.recruiterId && filters.recruiterId !== 'ALL') payload.recruiterId = filters.recruiterId;
    if (filters?.partnerId && filters.partnerId !== 'ALL') payload.partnerId = filters.partnerId;
    if (filters?.onlyVww) payload.onlyVww = true;

    const res = await callApi<any>('v2.workers.list', payload);
    if (res.success && res.data) {
      const items = Array.isArray(res.data) ? res.data : (res.data.items || res.data.workers || []);
      const mapped = items.map((w: any) => {
        let phoneStr = String(w.phone ?? '').trim();
        if (phoneStr.length === 9 && !phoneStr.startsWith('0')) {
          phoneStr = '0' + phoneStr;
        }

        let lastActStr = 'Mới tiếp nhận';
        if (typeof w.lastActivity === 'string') {
          lastActStr = w.lastActivity;
        } else if (w.lastActivity && typeof w.lastActivity === 'object') {
          lastActStr = `${w.lastActivity.type || 'Cập nhật'}${w.lastActivity.at ? ' • ' + new Date(w.lastActivity.at).toLocaleDateString('vi-VN') : ''}`;
        }

        return {
          ...w,
          workerId: w.workerId || w.worker_id || w.id || '',
          fullName: w.fullName || w.full_name || w.name || '',
          phone: phoneStr,
          cccd: w.cccd || '',
          province: w.province || w.hometown || w.branch || 'Hà Nam',
          hometown: w.hometown || w.province || 'Hà Nam',
          officeName: w.officeName || w.branch || 'BẮC GIANG',
          partnerName: w.partnerName || w.target_company || '',
          department: w.department || w.dept || '',
          status: w.status || w.working_status || w.currentStatus || 'NEW',
          isVerifiedWorking: Boolean(w.isVww ?? w.isVerifiedWorking),
          isVww: Boolean(w.isVww ?? w.isVerifiedWorking),
          lastActivity: lastActStr,
        };
      });
      return {
        ...res,
        data: mapped,
      };
    }
    return {
      success: true,
      data: [],
      error: res.error,
      requestId: res.requestId,
    };
  },

  async getWorker(workerId: string): Promise<ApiResponse<any>> {
    const res = await callApi<any>('v2.worker.get', {
      worker_id: workerId,
      id: workerId,
      phone: workerId,
      cccd: workerId,
      workerId,
    });
    if (res.success && res.data) {
      const raw = res.data;
      const workerObj = raw.worker || raw;
      const isVww = Boolean(workerObj.isVww ?? raw.vww?.value ?? workerObj.isVerifiedWorking);
      let phoneStr = String(workerObj.phone ?? '').trim();
      if (phoneStr.length === 9 && !phoneStr.startsWith('0')) {
        phoneStr = '0' + phoneStr;
      }
      const normalizedWorker = {
        ...workerObj,
        workerId: workerObj.workerId || workerObj.worker_id || workerObj.id || workerId,
        fullName: workerObj.fullName || workerObj.full_name || workerObj.name || `Lao động ${workerId}`,
        phone: phoneStr,
        cccd: workerObj.cccd || '',
        province: workerObj.province || workerObj.hometown || workerObj.branch || 'Hà Nam',
        hometown: workerObj.hometown || workerObj.province || 'Hà Nam',
        permanentAddress: workerObj.permanentAddress || workerObj.permanent_residence || workerObj.vneid_address || '',
        currentAddress: workerObj.currentAddress || workerObj.permanent_residence || '',
        officeName: workerObj.officeName || workerObj.branch || 'BẮC GIANG',
        partnerName: workerObj.partnerName || workerObj.target_company || 'FUYU',
        department: workerObj.department || workerObj.dept || '',
        status: workerObj.status || workerObj.working_status || workerObj.currentStatus || 'NEW',
        isVerifiedWorking: isVww,
        isVww: isVww,
        pipelineEvents: raw.pipelineEvents || workerObj.pipelineEvents || [],
        interviews: raw.interviews || workerObj.interviews || [],
        assignments: raw.assignments || workerObj.assignments || [],
        attendance: raw.attendance || workerObj.attendance || [],
        actions: raw.actions || workerObj.actions || [],
        vww: raw.vww || (isVww ? { value: true, label: 'Đi làm đã xác minh' } : null),
      };
      return {
        ...res,
        data: normalizedWorker,
      };
    }
    return res;
  },

  async searchWorkers(query: string): Promise<ApiResponse<Worker[]>> {
    return workerApi.getWorkers({ search: query });
  },

  async createWorker(payload: any): Promise<ApiResponse<any>> {
    return callApi<any>('worker.create', payload);
  },

  async updateWorker(workerId: string, payload: Partial<Worker>): Promise<ApiResponse<Worker | null>> {
    return callApi<Worker | null>('worker.update', { workerId, ...payload });
  },

  async updateWorkerStatus(workerId: string, status: WorkerStatus, note?: string): Promise<ApiResponse<boolean>> {
    return callApi<boolean>('worker.update', { workerId, status, note });
  }
};
