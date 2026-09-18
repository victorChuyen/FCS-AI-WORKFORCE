import { ApiResponse } from '../../types';
import { mockWorkerService } from './mockWorkerService';
import { mockDashboardService } from './mockDashboardService';
import { mockAttendanceService } from './mockAttendanceService';
import { mockMasterService } from './mockMasterService';
import { mockTenantService } from './mockTenantService';
import { clearDemoData, reloadDemoData, getDemoDataStats } from './mockControl';

export { clearDemoData, reloadDemoData, getDemoDataStats } from './mockControl';

const wrapMock = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
  error: null,
  requestId: `MOCK-${Date.now()}`,
});

export const mockApi = {
  getDashboard: mockDashboardService.getDashboard.bind(mockDashboardService),
  getTodayActions: mockDashboardService.getTodayActions.bind(mockDashboardService),
  getWorkers: mockWorkerService.getWorkers.bind(mockWorkerService),
  getWorker: mockWorkerService.getWorker.bind(mockWorkerService),
  createWorker: mockWorkerService.createWorker.bind(mockWorkerService),
  updateWorker: mockWorkerService.updateWorker.bind(mockWorkerService),
  getPipelineEvents: mockWorkerService.getPipelineEvents.bind(mockWorkerService),
  createInterview: mockWorkerService.createInterview.bind(mockWorkerService),
  recordInterviewResult: mockWorkerService.recordInterviewResult.bind(mockWorkerService),
  getWorkerInterviews: mockWorkerService.getWorkerInterviews.bind(mockWorkerService),
  createAssignment: mockWorkerService.createAssignment.bind(mockWorkerService),
  confirmWorkerStarted: mockWorkerService.confirmWorkerStarted.bind(mockWorkerService),
  getWorkerAssignments: mockWorkerService.getWorkerAssignments.bind(mockWorkerService),
  getWorkerAttendance: mockWorkerService.getWorkerAttendance.bind(mockWorkerService),
  getMatchingQueue: mockAttendanceService.getMatchingQueue.bind(mockAttendanceService),
  confirmMatch: mockAttendanceService.confirmMatch.bind(mockAttendanceService),
  rejectMatch: mockAttendanceService.rejectMatch.bind(mockAttendanceService),
  assignDifferentWorker: mockAttendanceService.assignDifferentWorker.bind(mockAttendanceService),
  resolveAction: mockDashboardService.resolveAction.bind(mockDashboardService),
  dismissAction: mockDashboardService.dismissAction.bind(mockDashboardService),
  getPartners: mockMasterService.getPartners.bind(mockMasterService),
  getJobs: mockMasterService.getJobs.bind(mockMasterService),
  getStaff: mockMasterService.getStaff.bind(mockMasterService),
  getOffices: mockMasterService.getOffices.bind(mockMasterService),
  runGoldenFlow: mockDashboardService.runGoldenFlow.bind(mockDashboardService),
  getAttendanceReviews: mockAttendanceService.getAttendanceReviews.bind(mockAttendanceService),
  confirmAttendanceMatch: mockAttendanceService.confirmAttendanceMatch.bind(mockAttendanceService),
  ignoreAttendance: mockAttendanceService.ignoreAttendance.bind(mockAttendanceService),
  getFollowUpQueue: mockDashboardService.getFollowUpQueue.bind(mockDashboardService),
  resolveFollowUp: mockDashboardService.resolveFollowUp.bind(mockDashboardService),
  updateWorkerStatus: mockWorkerService.updateWorkerStatus.bind(mockWorkerService),
  getDuplicateSuspects: mockWorkerService.getDuplicateSuspects.bind(mockWorkerService),
  mergeDuplicates: mockWorkerService.mergeDuplicates.bind(mockWorkerService),
  dismissDuplicate: mockWorkerService.dismissDuplicate.bind(mockWorkerService),
  getPipelineFunnel: mockDashboardService.getPipelineFunnel.bind(mockDashboardService),
  getOperationalResults: mockDashboardService.getOperationalResults.bind(mockDashboardService),

  // Demo Data Lifecycle Control
  clearDemoData,
  reloadDemoData,
  getDemoDataStats,
};

export const mockApiService = {
  isMock: true,
  checkHealth: mockTenantService.checkHealth.bind(mockTenantService),
  getSystemHealth: mockTenantService.getSystemHealth.bind(mockTenantService),
  
  async getDashboard() { return wrapMock(await mockApi.getDashboard()); },
  async getTodayActions() { return wrapMock(await mockApi.getTodayActions()); },
  async getWorkers(filters?: any) { return wrapMock(await mockApi.getWorkers(filters)); },
  async getWorker(workerId: string) { return wrapMock(await mockApi.getWorker(workerId)); },
  async getPipelineEvents(workerId: string) { return wrapMock(await mockApi.getPipelineEvents(workerId)); },
  async createWorker(payload: any) { return wrapMock(await mockApi.createWorker(payload)); },
  async updateWorker(workerId: string, payload: any) { return wrapMock(await mockApi.updateWorker(workerId, payload)); },
  async getPipeline(filters?: any) {
    const workers = await mockApi.getWorkers(filters);
    const metrics = await mockApi.getDashboard();
    return wrapMock({
      workers,
      metrics,
      counts: metrics.pipelineCounts,
      rates: metrics.rates,
    });
  },
  async createInterview(payload: any) { return wrapMock(await mockApi.createInterview(payload)); },
  async recordInterviewResult(interviewId: string, result: 'PASSED' | 'FAILED', note?: string) { return wrapMock(await mockApi.recordInterviewResult(interviewId, result, note)); },
  async getWorkerInterviews(workerId: string) { return wrapMock(await mockApi.getWorkerInterviews(workerId)); },
  async createAssignment(payload: any) { return wrapMock(await mockApi.createAssignment(payload)); },
  async confirmWorkerStarted(assignmentId: string) { return wrapMock(await mockApi.confirmWorkerStarted(assignmentId)); },
  async getWorkerAssignments(workerId: string) { return wrapMock(await mockApi.getWorkerAssignments(workerId)); },
  async getWorkerAttendance(workerId: string) { return wrapMock(await mockApi.getWorkerAttendance(workerId)); },
  async getMatchingQueue() { return wrapMock(await mockApi.getMatchingQueue()); },
  async confirmMatch(reviewId: string, workerId: string) { return wrapMock(await mockApi.confirmMatch(reviewId, workerId)); },
  async rejectMatch(reviewId: string, reason?: string) { return wrapMock(await mockApi.rejectMatch(reviewId, reason)); },
  async assignDifferentWorker(reviewId: string, workerId: string) { return wrapMock(await mockApi.assignDifferentWorker(reviewId, workerId)); },
  async resolveAction(actionId: string, resolution: string) { return wrapMock(await mockApi.resolveAction(actionId, resolution)); },
  async dismissAction(actionId: string) { return wrapMock(await mockApi.dismissAction(actionId)); },
  async getPartners() { return wrapMock(await mockApi.getPartners()); },
  async getJobs() { return wrapMock(await mockApi.getJobs()); },
  async getStaff() { return wrapMock(await mockApi.getStaff()); },
  async getOffices() { return wrapMock(await mockApi.getOffices()); },
  async runGoldenFlow(flowId: any) { return mockApi.runGoldenFlow(flowId); },
  async getAttendanceReviews() { return wrapMock(await mockApi.getAttendanceReviews()); },
  async confirmAttendanceMatch(reviewId: string, matchedWorkerId?: string) { return wrapMock(await mockApi.confirmAttendanceMatch(reviewId, matchedWorkerId)); },
  async ignoreAttendance(reviewId: string) { return wrapMock(await mockApi.ignoreAttendance(reviewId)); },
  async getFollowUpQueue() { return wrapMock(await mockApi.getFollowUpQueue()); },
  async resolveFollowUp(itemId: string, resolution: string) { return wrapMock(await mockApi.resolveFollowUp(itemId, resolution)); },
  async updateWorkerStatus(workerId: string, status: any, note?: string) { return wrapMock(await mockApi.updateWorkerStatus(workerId, status, note)); },
  async getDuplicateSuspects() { return wrapMock(await mockApi.getDuplicateSuspects()); },
  async mergeDuplicates(primaryWorkerId: string, secondaryWorkerId: string) { return wrapMock(await mockApi.mergeDuplicates(primaryWorkerId, secondaryWorkerId)); },
  async dismissDuplicate(suspectId: string) { return wrapMock(await mockApi.dismissDuplicate(suspectId)); },
  async getPipelineFunnel() { return wrapMock(await mockApi.getPipelineFunnel()); },
  async getOperationalResults() { return wrapMock(await mockApi.getOperationalResults()); },

  // Demo Data Lifecycle Control
  async clearDemoData() { return wrapMock(clearDemoData()); },
  async reloadDemoData() { return wrapMock(reloadDemoData()); },
  async getDemoDataStats() { return wrapMock(getDemoDataStats()); },
};

export default mockApi;
