import { callApi, setApiUserMetadata } from '../apiClient';
import { ApiResponse } from '../../types';

export const tenantApi = {
  async call<T = any>(action: string, payload: any = {}): Promise<ApiResponse<T>> {
    return callApi<T>(action, payload);
  },

  async checkHealth(): Promise<ApiResponse<{ status: string; service: string; version: string; architecture?: string; dataMode?: string; activeTenant?: string; companyName?: string }>> {
    // Try V2 health check first, fallback to system.health
    const resV2 = await callApi<any>('v2.health', {});
    if (resV2.success && resV2.data) {
      return {
        success: true,
        data: {
          status: 'healthy',
          service: resV2.data.system || 'FCS AI WORKFORCE OS V2',
          version: resV2.data.version || '2.1.0',
          architecture: 'V2_CLEAN_SLATE',
          dataMode: 'REAL',
          activeTenant: 'FCS-000001',
          companyName: 'FCS Pilot Workforce Corp',
        },
        error: null,
        requestId: resV2.requestId,
      };
    }
    return callApi('system.health', {});
  },

  async getSystemHealth(): Promise<ApiResponse<{ status: string; service: string; version: string; architecture?: string; dataMode?: string; activeTenant?: string; companyName?: string }>> {
    return tenantApi.checkHealth();
  },

  async getTenantHealth(tenantId?: string): Promise<ApiResponse<{
    tenantId: string;
    companyName: string;
    dataConnected: boolean;
    managementConnected: boolean;
    schemaVersion: string;
    dataMode: string;
    role?: string;
  }>> {
    return callApi('tenant.health', { tenantId });
  },

  async listTenants(): Promise<ApiResponse<Array<{
    tenantId: string;
    companyName: string;
    companySlug?: string;
    companyCode?: string;
    planCode: string;
    status: string;
    ownerName: string;
    ownerEmail: string;
    createdAt?: string;
  }>>> {
    return callApi('tenant.list', {});
  },

  async selectTenant(tenantId: string): Promise<ApiResponse<{
    tenantId: string;
    companyName: string;
    tenantRole: string;
  }>> {
    const res = await callApi<{ tenantId: string; companyName: string; tenantRole: string }>('tenant.select', { tenantId });
    if (res.success && res.data) {
      setApiUserMetadata({ tenantId: res.data.tenantId, role: res.data.tenantRole });
    }
    return res;
  }
};
