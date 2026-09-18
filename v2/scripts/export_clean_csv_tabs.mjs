import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';

const EXCEL_PATH = path.resolve('v2/FCS_V2_WORKFORCE_CRM_MASTER_T7_READY_ID_FIXED.xlsx');
const OUTPUT_DIR = path.resolve('v2/data-demo-thực tế/clean_csv');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('📂 Đang đọc tệp Excel:', EXCEL_PATH);
const wb = xlsx.readFile(EXCEL_PATH, { cellDates: true });

const sheetsToExport = [
  '01_MASTER_WORKERS',
  '02_CRM_DEALS_2026',
  '07_ASSIGNMENTS',
  '08_ATTENDANCE_RAW',
  '03_AUDIT_LOG',
  'DM_BRANCH',
  'DM_COMPANY',
  'DM_LEVEL_SALE'
];

sheetsToExport.forEach(name => {
  const ws = wb.Sheets[name];
  if (!ws) {
    console.warn(`⚠️ Không tìm thấy sheet: ${name}`);
    return;
  }
  const csvContent = xlsx.utils.sheet_to_csv(ws);
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1 }).filter(r => r && r.some(c => c !== ''));
  const targetFile = path.join(OUTPUT_DIR, `${name}.csv`);
  fs.writeFileSync(targetFile, csvContent, 'utf8');
  console.log(`✅ [${name}] -> ${targetFile} (${rows.length - 1} dòng dữ liệu, ${(fs.statSync(targetFile).size / 1024).toFixed(1)} KB)`);
});

console.log('\n🎉 ĐÃ XUẤT THÀNH CÔNG TOÀN BỘ CÁC TAB CHUẨN SẠCH RA CSV!');
console.log(`📁 Thư mục lưu trữ: ${OUTPUT_DIR}`);
