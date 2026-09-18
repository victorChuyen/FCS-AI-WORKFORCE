import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');

// Order of files for single-file bundle
const filesOrder = [
  '00_Config.gs',
  '02_Response.gs',
  '03_TenantInit.gs',
  '04_TenantResolver.gs',
  '05_WorkerService.gs',
  '06_InterviewService.gs',
  '07_AssignmentService.gs',
  '08_AttendanceService.gs',
  '09_MatchingService.gs',
  '10_DashboardService.gs',
  '11_ActionQueueService.gs',
  '12_PipelineService.gs',
  '13_MasterDataService.gs',
  '22_QADataReset.gs',
  '01_Router.gs', // Router with doGet/doPost at end
];

let bundle = `/**\n * FCS AI WORKFORCE OS - V4 MULTI-TENANT SAAS BUNDLE\n * Generated automatically from 15 modular files in backend/\n * Version: 4.0.0\n */\n\n`;

for (const file of filesOrder) {
  const filePath = path.join(backendDir, file);
  if (fs.existsSync(filePath)) {
    bundle += `// ==============================================================================\n`;
    bundle += `// FILE: ${file}\n`;
    bundle += `// ==============================================================================\n\n`;
    bundle += fs.readFileSync(filePath, 'utf8') + '\n\n';
  }
}

const outDir = path.join(backendDir, 'dist');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'Code.gs');
fs.writeFileSync(outFile, bundle, 'utf8');

console.log(`✅ Đã đóng gói 15 modules thành 1 file bundle duy nhất tại: ${outFile} (${(bundle.length / 1024).toFixed(1)} KB)`);
console.log(`👉 Dùng file này nếu bạn muốn copy/paste toàn bộ trực tiếp vào trình duyệt Google Apps Script mà không dùng clasp.`);
