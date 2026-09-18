import { MOCK_PARTNERS, MOCK_JOBS, MOCK_STAFF, MOCK_OFFICES } from './mockData';
import { Partner, Job, Staff, Office } from '../../types';

const delay = (ms = 120) => new Promise(resolve => setTimeout(resolve, ms));

export const mockMasterService = {
  async getPartners(): Promise<Partner[]> {
    await delay();
    return [...MOCK_PARTNERS];
  },

  async getJobs(): Promise<Job[]> {
    await delay();
    return [...MOCK_JOBS];
  },

  async getStaff(): Promise<Staff[]> {
    await delay();
    return [...MOCK_STAFF];
  },

  async getOffices(): Promise<Office[]> {
    await delay();
    return [...MOCK_OFFICES];
  },
};
