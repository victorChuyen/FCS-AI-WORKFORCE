import { tenantApi } from './tenantApi';
import { workerApi } from './workerApi';
import { dashboardApi } from './dashboardApi';
import { pipelineApi } from './pipelineApi';
import { actionApi } from './actionApi';
import { interviewApi } from './interviewApi';
import { assignmentApi } from './assignmentApi';
import { attendanceApi } from './attendanceApi';
import { masterDataApi } from './masterDataApi';
import { reviewApi } from './reviewApi';
import { goldenFlowApi } from './goldenFlowApi';
import { authApi } from './authApi';
import { dealApi } from './dealApi';
import { handoverApi } from './handoverApi';

export const realApi = {
  isMock: false,
  call: tenantApi.call,
  ...tenantApi,
  ...workerApi,
  ...dashboardApi,
  ...pipelineApi,
  ...actionApi,
  ...interviewApi,
  ...assignmentApi,
  ...attendanceApi,
  ...masterDataApi,
  ...reviewApi,
  ...goldenFlowApi,
  ...authApi,
  ...dealApi,
  ...handoverApi,

  // Demo Data Lifecycle Control (Real API Stubs)
  async clearDemoData() {
    return {
      success: true,
      data: { success: true, message: 'Hệ thống đang chạy REAL DATA (Google Sheets thực tế). Không cần xóa demo.' },
      error: null,
      requestId: `REAL-${Date.now()}`,
    };
  },
  async reloadDemoData() {
    return {
      success: true,
      data: { success: true, message: 'Hệ thống đang chạy REAL DATA. Dữ liệu được quản lý trực tiếp qua Google Sheets.' },
      error: null,
      requestId: `REAL-${Date.now()}`,
    };
  },
  async getDemoDataStats() {
    return {
      success: true,
      data: { workersCount: 0, interviewsCount: 0, assignmentsCount: 0, attendancesCount: 0, actionsCount: 0, isEmpty: false },
      error: null,
      requestId: `REAL-${Date.now()}`,
    };
  },
};

export default realApi;
