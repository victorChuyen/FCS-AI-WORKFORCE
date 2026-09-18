import { callApi } from '../apiClient';
import { ApiResponse, Partner, Job, Staff, Office } from '../../types';

export const masterDataApi = {
  async getPartners(): Promise<ApiResponse<Partner[]>> {
    return callApi<Partner[]>('master.partners', {});
  },

  async getJobs(): Promise<ApiResponse<Job[]>> {
    return callApi<Job[]>('master.jobs', {});
  },

  async getStaff(): Promise<ApiResponse<Staff[]>> {
    return callApi<Staff[]>('master.staff', {});
  },

  async getOffices(): Promise<ApiResponse<Office[]>> {
    return callApi<Office[]>('master.offices', {});
  }
};
