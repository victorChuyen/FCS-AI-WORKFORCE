import { callApi } from '../apiClient';
import { ApiResponse, PipelineEvent, PipelineFunnelData } from '../../types';
import { dashboardApi } from './dashboardApi';

export const pipelineApi = {
  async getPipeline(filters?: {
    officeId?: string;
    recruiterId?: string;
    partnerId?: string;
    source?: string;
  }): Promise<ApiResponse<any>> {
    const res = await callApi<any>('dashboard.summary', filters || {});
    if (res.success && res.data) {
      return {
        ...res,
        data: res.data.pipeline || [],
      };
    }
    return res;
  },

  async getPipelineFunnel(): Promise<ApiResponse<PipelineFunnelData[]>> {
    const res = await callApi<any>('pipeline.funnel', {});
    if (res.success && Array.isArray(res.data)) {
      return res;
    }
    // Fallback query through dashboard.summary
    const dashRes = await dashboardApi.getDashboard();
    if (dashRes.success && dashRes.data) {
      const d = dashRes.data;
      return {
        success: true,
        data: [
          { stageKey: 'NEW', stageName: 'Lao động mới', count: d.metrics.newWorkers },
          { stageKey: 'INTERVIEWED', stageName: 'Chờ phỏng vấn', count: d.metrics.interviewed },
          { stageKey: 'PASSED', stageName: 'Đã đỗ', count: d.metrics.passed },
          { stageKey: 'WAITING_START', stageName: 'Chờ đi làm', count: d.metrics.waitingStart },
          { stageKey: 'WORKING', stageName: 'Đang làm việc', count: d.metrics.working },
          { stageKey: 'VWW', stageName: 'Đi làm đã xác minh', count: d.metrics.verifiedWorking },
        ],
        error: null,
        requestId: dashRes.requestId,
      };
    }
    return {
      success: true,
      data: [
        { stageKey: 'NEW', stageName: 'Lao động mới', count: 0 },
        { stageKey: 'INTERVIEWED', stageName: 'Chờ phỏng vấn', count: 0 },
        { stageKey: 'PASSED', stageName: 'Đã đỗ', count: 0 },
        { stageKey: 'WAITING_START', stageName: 'Chờ đi làm', count: 0 },
        { stageKey: 'WORKING', stageName: 'Đang làm việc', count: 0 },
        { stageKey: 'VWW', stageName: 'Đi làm đã xác minh', count: 0 },
      ],
      error: null,
      requestId: `REQ-${Date.now()}`,
    };
  },

  async getPipelineEvents(workerId: string): Promise<ApiResponse<PipelineEvent[]>> {
    return callApi<PipelineEvent[]>('pipeline.events', { workerId });
  }
};
