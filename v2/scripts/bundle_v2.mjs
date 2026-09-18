/**
 * bundle_v2.mjs
 * Ghép toàn bộ các file trong v2/backend thành một file Code.gs duy nhất
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const V2_BACKEND = join(process.cwd(), 'v2', 'backend');
const files = [
  '00_Config.gs',
  '06_ValidationService.gs',
  '07_AuditService.gs',
  '05_SecurityService.gs',
  '04_TaxonomyService.gs',
  '02_WorkerService.gs',
  '03_DealService.gs',
  '09_DashboardService.gs',
  '10_BatchImportService.gs',
  '11_FieldDispatchService.gs',
  '12_AttendanceMatchingService.gs',
  '13_SettlementService.gs',
  '14_LeadMarketingService.gs',
  '08_TriggerService.gs',
  '01_Router.gs'
];

let bundle = '/**\n * FCS AI WORKFORCE OS V2 — MASTER BACKEND BUNDLE\n * Clean Slate Enterprise CRM & Dual-Engine Architecture\n */\n\n';

for (const f of files) {
  const content = readFileSync(join(V2_BACKEND, f), 'utf-8');
  bundle += `// =============================================================================\n// FILE: ${f}\n// =============================================================================\n\n`;
  bundle += content + '\n\n';
}

const outputPath = join(V2_BACKEND, 'Code.gs');
writeFileSync(outputPath, bundle, 'utf-8');
console.log('✅ Đã tạo thành công bundle v2/backend/Code.gs (Dung lượng:', bundle.length, 'bytes)');
