import { callApi } from '../apiClient';
import { ApiResponse, Assignment } from '../../types';

export const assignmentApi = {
  async getWorkerAssignments(workerId: string): Promise<ApiResponse<Assignment[]>> {
    return callApi<Assignment[]>('assignment.list', { workerId });
  },

  async createAssignment(payload: any): Promise<ApiResponse<Assignment>> {
    return callApi<Assignment>('assignment.create', payload);
  },

  async confirmWorkerStarted(assignmentId: string): Promise<ApiResponse<Assignment | null>> {
    return callApi<Assignment | null>('assignment.start', { assignmentId });
  }
};
