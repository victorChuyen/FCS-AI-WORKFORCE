import fs from 'fs';
import path from 'path';

const v2BackendDir = path.resolve('v2/backend');
const filesOrder = [
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
  '01_Router.gs',
];

let bundle = `/**\n * FCS AI WORKFORCE OS V2 — MASTER BACKEND BUNDLE\n * Clean Slate Enterprise CRM & Dual-Engine Architecture\n */\n\n`;

for (const file of filesOrder) {
  const filePath = path.join(v2BackendDir, file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  bundle += `// =============================================================================\n`;
  bundle += `// FILE: ${file}\n`;
  bundle += `// =============================================================================\n\n`;
  bundle += fs.readFileSync(filePath, 'utf8') + '\n\n';
}

const outFile = path.join(v2BackendDir, 'Code.gs');
fs.writeFileSync(outFile, bundle, 'utf8');

console.log(`✅ Bundled 15 V2 modules into: ${outFile} (${(bundle.length / 1024).toFixed(1)} KB, ${bundle.split('\n').length} lines)`);
