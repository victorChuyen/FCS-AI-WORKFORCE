/**
 * export_v2_files_json.mjs
 * Đóng gói 10 file module v2/backend thành file JSON để backup / nạp trực tiếp vào Monaco Editor
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const V2_DIR = join(process.cwd(), 'v2', 'backend');
const files = [
  '00_Config.gs',
  '01_Router.gs',
  '02_WorkerService.gs',
  '03_DealService.gs',
  '04_TaxonomyService.gs',
  '05_SecurityService.gs',
  '06_ValidationService.gs',
  '07_AuditService.gs',
  '08_TriggerService.gs',
  '09_DashboardService.gs'
];

const pack = {};
for (const f of files) {
  const name = f.replace('.gs', '');
  pack[name] = readFileSync(join(V2_DIR, f), 'utf-8');
}

writeFileSync(join(process.cwd(), 'v2', 'backend_files.json'), JSON.stringify(pack, null, 2), 'utf-8');
console.log('✅ Đã tạo v2/backend_files.json với 10 modules:', Object.keys(pack).join(', '));
