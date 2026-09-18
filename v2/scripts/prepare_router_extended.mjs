import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const backendDir = join(process.cwd(), 'v2', 'backend');

// Đọc toàn bộ các module nền tảng và nghiệp vụ
const config = readFileSync(join(backendDir, '00_Config.gs'), 'utf8');
const validation = readFileSync(join(backendDir, '06_ValidationService.gs'), 'utf8');
const audit = readFileSync(join(backendDir, '07_AuditService.gs'), 'utf8');
const security = readFileSync(join(backendDir, '05_SecurityService.gs'), 'utf8');
const taxonomy = readFileSync(join(backendDir, '04_TaxonomyService.gs'), 'utf8');
const worker = readFileSync(join(backendDir, '02_WorkerService.gs'), 'utf8');
const deal = readFileSync(join(backendDir, '03_DealService.gs'), 'utf8');
const dashboard = readFileSync(join(backendDir, '09_DashboardService.gs'), 'utf8');
const batch = readFileSync(join(backendDir, '10_BatchImportService.gs'), 'utf8');
const dispatch = readFileSync(join(backendDir, '11_FieldDispatchService.gs'), 'utf8');
const attendance = readFileSync(join(backendDir, '12_AttendanceMatchingService.gs'), 'utf8');
const settlement = readFileSync(join(backendDir, '13_SettlementService.gs'), 'utf8');
const leadMarketing = readFileSync(join(backendDir, '14_LeadMarketingService.gs'), 'utf8');
const trigger = readFileSync(join(backendDir, '08_TriggerService.gs'), 'utf8');
const router = readFileSync(join(backendDir, '01_Router.gs'), 'utf8');

const combined = `/**
 * FCS AI WORKFORCE OS V2 — FULL STANDALONE BACKEND
 * Chứa trọn vẹn 14 Modules (Bao gồm 00_Config.gs ở đầu file)
 */

// =============================================================================
// MODULE 0: CONFIG & SPREADSHEET INITIALIZER
// =============================================================================
${config}

// =============================================================================
// MODULE 6: VALIDATION SERVICE
// =============================================================================
${validation}

// =============================================================================
// MODULE 7: AUDIT SERVICE
// =============================================================================
${audit}

// =============================================================================
// MODULE 5: SECURITY & PROTECTED RANGES
// =============================================================================
${security}

// =============================================================================
// MODULE 4: TAXONOMY SERVICE
// =============================================================================
${taxonomy}

// =============================================================================
// MODULE 2: MASTER WORKER SERVICE
// =============================================================================
${worker}

// =============================================================================
// MODULE 3: CRM DEAL SERVICE
// =============================================================================
${deal}

// =============================================================================
// MODULE 9: DASHBOARD KPI SERVICE
// =============================================================================
${dashboard}

// =============================================================================
// MODULE 10: BATCH IMPORT SERVICE
// =============================================================================
${batch}

// =============================================================================
// MODULE 11: FIELD DISPATCH SERVICE
// =============================================================================
${dispatch}

// =============================================================================
// MODULE 12: ATTENDANCE MATCHING & VWW ENGINE
// =============================================================================
${attendance}

// =============================================================================
// MODULE 13: SETTLEMENT & REVENUE SERVICE
// =============================================================================
${settlement}

// =============================================================================
// MODULE 14: LEAD MARKETING & CONSULTATION SERVICE
// =============================================================================
${leadMarketing}

// =============================================================================
// MODULE 8: ON-EDIT TRIGGER SERVICE
// =============================================================================
${trigger}

// =============================================================================
// MODULE 1: ROUTER & REST API GATEWAY
// =============================================================================
${router}
`;

const outputPath = join(backendDir, '01_Router_Extended.gs');
writeFileSync(outputPath, combined, 'utf8');
console.log('✅ Đã tạo thành công 01_Router_Extended.gs hoàn chỉnh (bao gồm 00_Config.gs)! Dung lượng:', combined.length, 'bytes');
