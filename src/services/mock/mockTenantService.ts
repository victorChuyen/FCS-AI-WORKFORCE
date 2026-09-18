import { ApiResponse } from '../../types';

export const mockTenantService = {
  async checkHealth(): Promise<ApiResponse<{ status: string; service: string; version: string; endpoints?: string[] }>> {
    return {
      success: true,
      data: {
        status: 'ok',
        service: 'FCS AI Workforce API (Mock)',
        version: '3.0.0',
        endpoints: ['system.health', 'dashboard.summary', 'action.list', 'worker.list', 'worker.get', 'worker.create'],
      },
      error: null,
      requestId: `MOCK-${Date.now()}`,
    };
  },

  async getSystemHealth(): Promise<ApiResponse<{ status: string; service: string; version: string; endpoints?: string[] }>> {
    return this.checkHealth();
  },
};
