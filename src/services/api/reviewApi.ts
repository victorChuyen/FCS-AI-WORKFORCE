import { callApi } from '../apiClient';
import { ApiResponse, FollowUpItem, DuplicateSuspect } from '../../types';

export const reviewApi = {
  async getFollowUpQueue(): Promise<ApiResponse<FollowUpItem[]>> {
    const res = await callApi<FollowUpItem[]>('action.list', { category: 'FOLLOW_UP' });
    if (res.success && Array.isArray(res.data)) {
      return res;
    }
    return {
      success: true,
      data: [],
      error: null,
      requestId: `REQ-${Date.now()}`,
    };
  },

  async resolveFollowUp(itemId: string, resolution: string): Promise<ApiResponse<boolean>> {
    return callApi<boolean>('action.resolve', { actionId: itemId, resolution });
  },

  async getDuplicateSuspects(): Promise<ApiResponse<DuplicateSuspect[]>> {
    const res = await callApi<DuplicateSuspect[]>('action.list', { category: 'DUPLICATE' });
    if (res.success && Array.isArray(res.data)) {
      return res;
    }
    return {
      success: true,
      data: [],
      error: null,
      requestId: `REQ-${Date.now()}`,
    };
  },

  async mergeDuplicates(primaryWorkerId: string, secondaryWorkerId: string): Promise<ApiResponse<boolean>> {
    return callApi<boolean>('worker.merge', { primaryWorkerId, secondaryWorkerId });
  },

  async dismissDuplicate(suspectId: string): Promise<ApiResponse<boolean>> {
    return callApi<boolean>('action.resolve', { actionId: suspectId, resolution: 'DISMISSED' });
  }
};
