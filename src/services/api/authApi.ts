import { callApi } from '../apiClient';
import { ApiResponse } from '../../types';

export const authApi = {
  async registerLead(payload: {
    fullName: string;
    email: string;
    phone: string;
    organization?: string;
    purpose?: string;
    uid?: string;
  }): Promise<ApiResponse<any>> {
    try {
      return await callApi<any>('auth.register_lead', payload);
    } catch (err: any) {
      console.warn('Could not sync lead registration to Apps Script:', err);
      return {
        success: true,
        data: { fallback: true },
        error: null,
        requestId: 'LOCAL-' + Date.now(),
      };
    }
  },
};
