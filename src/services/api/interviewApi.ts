import { callApi } from '../apiClient';
import { ApiResponse, Interview } from '../../types';

export const interviewApi = {
  async getWorkerInterviews(workerId: string): Promise<ApiResponse<Interview[]>> {
    return callApi<Interview[]>('interview.list', { workerId });
  },

  async createInterview(payload: any): Promise<ApiResponse<Interview>> {
    return callApi<Interview>('interview.create', payload);
  },

  async recordInterviewResult(
    interviewId: string,
    result: 'PASSED' | 'FAILED',
    note?: string
  ): Promise<ApiResponse<Interview | null>> {
    return callApi<Interview | null>('interview.update', { interviewId, result, note });
  }
};
