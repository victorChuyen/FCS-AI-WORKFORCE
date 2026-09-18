import { MOCK_WORKERS } from './mockData/workers';
import { MOCK_INTERVIEWS } from './mockData/interviews';
import { MOCK_ASSIGNMENTS } from './mockData/assignments';
import { MOCK_ATTENDANCES } from './mockData/attendance';
import { MOCK_ACTION_QUEUE } from './mockData/actions';
import { MOCK_PIPELINE_EVENTS } from './mockData/pipeline';

// Deep clone initial seed data on module initialization
const SEED_WORKERS = JSON.parse(JSON.stringify(MOCK_WORKERS));
const SEED_INTERVIEWS = JSON.parse(JSON.stringify(MOCK_INTERVIEWS));
const SEED_ASSIGNMENTS = JSON.parse(JSON.stringify(MOCK_ASSIGNMENTS));
const SEED_ATTENDANCES = JSON.parse(JSON.stringify(MOCK_ATTENDANCES));
const SEED_ACTION_QUEUE = JSON.parse(JSON.stringify(MOCK_ACTION_QUEUE));
const SEED_PIPELINE_EVENTS = JSON.parse(JSON.stringify(MOCK_PIPELINE_EVENTS));

/**
 * Xóa sạch toàn bộ dữ liệu demo về 0.
 * Triết lý: "REAL ZERO IS BETTER THAN FAKE DEMO DATA"
 * Cho phép người dùng trải nghiệm thêm dữ liệu thực tế hoặc bắt đầu trắng.
 */
export function clearDemoData(): { message: string; success: boolean } {
  MOCK_WORKERS.length = 0;
  MOCK_INTERVIEWS.length = 0;
  MOCK_ASSIGNMENTS.length = 0;
  MOCK_ATTENDANCES.length = 0;
  MOCK_ACTION_QUEUE.length = 0;
  MOCK_PIPELINE_EVENTS.length = 0;
  return {
    success: true,
    message: 'Đã xóa sạch toàn bộ dữ liệu Demo về 0. Sẵn sàng nhập dữ liệu mới!'
  };
}

/**
 * Nạp lại toàn bộ bộ dữ liệu demo mẫu chuẩn 6 lao động Golden Flow VWW.
 */
export function reloadDemoData(): { message: string; success: boolean; count: number } {
  MOCK_WORKERS.splice(0, MOCK_WORKERS.length, ...JSON.parse(JSON.stringify(SEED_WORKERS)));
  MOCK_INTERVIEWS.splice(0, MOCK_INTERVIEWS.length, ...JSON.parse(JSON.stringify(SEED_INTERVIEWS)));
  MOCK_ASSIGNMENTS.splice(0, MOCK_ASSIGNMENTS.length, ...JSON.parse(JSON.stringify(SEED_ASSIGNMENTS)));
  MOCK_ATTENDANCES.splice(0, MOCK_ATTENDANCES.length, ...JSON.parse(JSON.stringify(SEED_ATTENDANCES)));
  MOCK_ACTION_QUEUE.splice(0, MOCK_ACTION_QUEUE.length, ...JSON.parse(JSON.stringify(SEED_ACTION_QUEUE)));
  MOCK_PIPELINE_EVENTS.splice(0, MOCK_PIPELINE_EVENTS.length, ...JSON.parse(JSON.stringify(SEED_PIPELINE_EVENTS)));
  return {
    success: true,
    message: `Đã nạp lại thành công ${SEED_WORKERS.length} hồ sơ lao động mẫu chuẩn Golden Flow VWW!`,
    count: SEED_WORKERS.length
  };
}

/**
 * Thống kê hiện trạng dữ liệu demo
 */
export function getDemoDataStats() {
  return {
    workersCount: MOCK_WORKERS.length,
    interviewsCount: MOCK_INTERVIEWS.length,
    assignmentsCount: MOCK_ASSIGNMENTS.length,
    attendancesCount: MOCK_ATTENDANCES.length,
    actionsCount: MOCK_ACTION_QUEUE.length,
    isEmpty: MOCK_WORKERS.length === 0
  };
}
