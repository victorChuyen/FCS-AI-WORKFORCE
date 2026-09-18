/**
 * ==============================================================================
 * FCS AI WORKFORCE OS V2 — COMPREHENSIVE API DIAGNOSTIC & TEST SUITE
 * Chức năng: Kiểm tra tính toàn vẹn của 10 Service Modules, 15 API Actions,
 *            kiểm định Schema và quy chuẩn V2.
 * ==============================================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const v2Dir = path.resolve(__dirname, '..');
const backendDir = path.join(v2Dir, 'backend');
const schemaDir = path.join(v2Dir, 'schema');

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  🏆 FCS AI WORKFORCE OS V2 — API DIAGNOSTIC SUITE            ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failCount++;
  }
}

// =============================================================================
// TEST SUITE 1: FILE INVENTORY & MODULE INTEGRITY
// =============================================================================
console.log('📦 [SUITE 1] Kiểm tra cấu trúc 14 Service Modules V2:');

const expectedModules = [
  '00_Config.gs',
  '01_Router.gs',
  '02_WorkerService.gs',
  '03_DealService.gs',
  '04_TaxonomyService.gs',
  '05_SecurityService.gs',
  '06_ValidationService.gs',
  '07_AuditService.gs',
  '08_TriggerService.gs',
  '09_DashboardService.gs',
  '10_BatchImportService.gs',
  '11_FieldDispatchService.gs',
  '12_AttendanceMatchingService.gs',
  '13_SettlementService.gs',
  '14_LeadMarketingService.gs'
];

expectedModules.forEach(mod => {
  const filePath = path.join(backendDir, mod);
  assert(fs.existsSync(filePath), `Module tồn tại: ${mod}`);
});

// =============================================================================
// TEST SUITE 2: ROUTER & ENDPOINTS REGISTRATION
// =============================================================================
console.log('\n🧭 [SUITE 2] Kiểm tra 23 Action Routes trong 01_Router.gs:');

const routerContent = fs.readFileSync(path.join(backendDir, '01_Router.gs'), 'utf8');
const expectedActions = [
  'v2.health',
  'v2.system.setup',
  'v2.workers.list',
  'v2.worker.get',
  'v2.worker.create',
  'v2.worker.update',
  'v2.worker.soft_delete',
  'v2.deals.list',
  'v2.deal.create',
  'v2.deal.move_stage',
  'v2.deal.update',
  'v2.deal.soft_delete',
  'v2.taxonomy.get',
  'v2.audit.list',
  'v2.dashboard.stats',
  'v2.batch.import',
  'v2.dispatch.roster',
  'v2.dispatch.checkin',
  'v2.attendance.match',
  'v2.settlement.report',
  'v2.settlement.approve',
  'v2.lead.capture',
  'v2.leads.list'
];

expectedActions.forEach(action => {
  const hasRoute = routerContent.includes(`case "${action}":`);
  assert(hasRoute, `Endpoint được đăng ký: ${action}`);
});

// Kiểm tra createJsonResponseV2_ có bọc data
assert(
  routerContent.includes('result.data === undefined'),
  'createJsonResponseV2_ có cơ chế tự động bọc response data envelope'
);

// =============================================================================
// TEST SUITE 3: VALIDATION & NORMALIZATION RULES
// =============================================================================
console.log('\n🛡️ [SUITE 3] Kiểm tra quy tắc Validation & Bảo vệ dữ liệu:');

const valContent = fs.readFileSync(path.join(backendDir, '06_ValidationService.gs'), 'utf8');
assert(valContent.includes('normalizeStageCode_'), '06_ValidationService có hàm normalizeStageCode_');
assert(valContent.includes('normalizedStage: normStage'), 'validateDealPayloadOrReject_ trả về normalizedStage');

const secContent = fs.readFileSync(path.join(backendDir, '05_SecurityService.gs'), 'utf8');
assert(secContent.includes('existingProtections[p].remove()'), '05_SecurityService dọn dẹp protection cũ chống trùng lặp');

const auditContent = fs.readFileSync(path.join(backendDir, '07_AuditService.gs'), 'utf8');
assert(auditContent.includes('slice(-6)'), '07_AuditService cấp phát số sequence 6 chữ số chống tràn');

const dealContent = fs.readFileSync(path.join(backendDir, '03_DealService.gs'), 'utf8');
assert(dealContent.includes('SpreadsheetApp.flush()'), '03_DealService có SpreadsheetApp.flush() đồng bộ công thức');

const batchContent = fs.readFileSync(path.join(backendDir, '10_BatchImportService.gs'), 'utf8');
assert(batchContent.includes('handleBatchImportWorkersV2_'), '10_BatchImportService có hàm handleBatchImportWorkersV2_');

const dispatchContent = fs.readFileSync(path.join(backendDir, '11_FieldDispatchService.gs'), 'utf8');
assert(dispatchContent.includes('handleGetInterviewRosterV2_'), '11_FieldDispatchService có hàm handleGetInterviewRosterV2_');
assert(dispatchContent.includes('handleCheckInInterviewV2_'), '11_FieldDispatchService có hàm handleCheckInInterviewV2_');

const matchContent = fs.readFileSync(path.join(backendDir, '12_AttendanceMatchingService.gs'), 'utf8');
assert(matchContent.includes('handleMatchAttendanceAndVerifyVwwV2_'), '12_AttendanceMatchingService có hàm handleMatchAttendanceAndVerifyVwwV2_');

const settleContent = fs.readFileSync(path.join(backendDir, '13_SettlementService.gs'), 'utf8');
assert(settleContent.includes('handleGetSettlementReportV2_'), '13_SettlementService có hàm handleGetSettlementReportV2_');
assert(settleContent.includes('handleApproveCommissionV2_'), '13_SettlementService có hàm handleApproveCommissionV2_');

// =============================================================================
// TEST SUITE 4: SCHEMA ALIGNMENT
// =============================================================================
console.log('\n📋 [SUITE 4] Kiểm tra tính chuẩn xác của Schemas:');

const workerSchemaPath = path.join(schemaDir, 'MASTER_WORKERS_SCHEMA.json');
const workerSchema = JSON.parse(fs.readFileSync(workerSchemaPath, 'utf8'));
assert(workerSchema.totalColumns === 34, 'MASTER_WORKERS_SCHEMA có đủ 34 cột VNeID');

const branchCol = workerSchema.columns.find(c => c.key === 'branch');
assert(branchCol && branchCol.dropdownFrom === 'DM_BRANCH!B2:B9', 'Cột branch tham chiếu đúng tab DM_BRANCH');

const compCol = workerSchema.columns.find(c => c.key === 'target_company');
assert(compCol && compCol.dropdownFrom === 'DM_COMPANY!B2:B30', 'Cột target_company tham chiếu đúng tab DM_COMPANY');

const dealSchemaPath = path.join(schemaDir, 'CRM_DEALS_SCHEMA.json');
const dealSchema = JSON.parse(fs.readFileSync(dealSchemaPath, 'utf8'));
assert(dealSchema.totalColumns === 22, 'CRM_DEALS_SCHEMA có đủ 22 cột CRM');

// =============================================================================
// TEST SUITE 5: SCRIPT ID CONSISTENCY
// =============================================================================
console.log('\n🔑 [SUITE 5] Kiểm tra tính nhất quán của Script ID:');

const EXPECTED_SCRIPT_ID = '1qJJxG_Q6QUZys6BUPhdVdk7DqNFOxSQTy6BRA85R2J50eoMwG-fCp0lP';

const claspJson = JSON.parse(fs.readFileSync(path.join(backendDir, '.clasp.json'), 'utf8'));
assert(claspJson.scriptId === EXPECTED_SCRIPT_ID, `.clasp.json khớp Script ID: ${EXPECTED_SCRIPT_ID}`);

const deployContent = fs.readFileSync(path.join(v2Dir, 'scripts', 'deploy_v2_webapp.mjs'), 'utf8');
assert(deployContent.includes(EXPECTED_SCRIPT_ID), `deploy_v2_webapp.mjs khớp Script ID: ${EXPECTED_SCRIPT_ID}`);

const pushContent = fs.readFileSync(path.join(v2Dir, 'scripts', 'push_v2_backend.mjs'), 'utf8');
assert(pushContent.includes(EXPECTED_SCRIPT_ID), `push_v2_backend.mjs khớp Script ID: ${EXPECTED_SCRIPT_ID}`);

// =============================================================================
// KẾT QUẢ TỔNG HỢP
// =============================================================================
console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`📊 TỔNG KẾT KIỂM THỬ V2:`);
console.log(`   🟢 ĐẠT: ${passCount} bài kiểm tra`);
console.log(`   🔴 LỖI: ${failCount} bài kiểm tra`);
console.log('═══════════════════════════════════════════════════════════════');

if (failCount === 0) {
  console.log('🎉 TẤT CẢ MODULE & QUY CHUẨN V2 ĐẠT 100% TIÊU CHUẨN ENTERPRISE!\n');
  process.exit(0);
} else {
  console.error('⚠️ PHÁT HIỆN LỖI TRONG BỘ KIỂM THỬ V2!\n');
  process.exit(1);
}
