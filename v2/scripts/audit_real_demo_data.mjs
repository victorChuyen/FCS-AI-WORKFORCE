import xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';

const filePath = path.resolve('v2/data-demo-thực tế/FCS_V2_WORKFORCE_CRM_MASTER_T7_READY_ID_FIXED.xlsx');

console.log('================================================================');
console.log('🔍 AUDIT DỮ LIỆU THỰC TẾ: FCS_V2_WORKFORCE_CRM_MASTER_T7_READY_ID_FIXED');
console.log('================================================================\n');

const workbook = xlsx.readFile(filePath, { cellFormula: true, cellStyles: true, cellDates: true });

// 1. 01_MASTER_WORKERS
console.log('================================================================');
console.log('1. PHÂN TÍCH CHI TIẾT [01_MASTER_WORKERS]');
console.log('================================================================');
const s1 = workbook.Sheets['01_MASTER_WORKERS'];
const r1 = xlsx.utils.sheet_to_json(s1, { header: 1, defval: '' }).filter(r => r && r.some(c => c !== ''));
const h1 = r1[0];
const workers = r1.slice(1).filter(r => r[0] && r[0].toString().trim() !== '');
console.log(`- Tổng số cột: ${h1.length}`);
console.log(`- Tổng số lao động thực tế: ${workers.length}`);
console.log(`- Danh sách cột: \n  ${h1.join(' | ')}`);
console.log('\n--- CHI TIẾT CÁC HỒ SƠ LAO ĐỘNG THỰC TẾ ---');
workers.forEach((w, i) => {
  console.log(`[#${i + 1}] ID: ${w[0]} | Họ tên: ${w[2]} | SĐT: ${w[19]} | CCCD: ${w[5]} | Quê quán: ${w[7]} | Trạng thái: ${w[18]} | Chi nhánh: ${w[23]}`);
});

// 2. 02_CRM_DEALS_2026
console.log('\n================================================================');
console.log('2. PHÂN TÍCH CHI TIẾT [02_CRM_DEALS_2026]');
console.log('================================================================');
const s2 = workbook.Sheets['02_CRM_DEALS_2026'];
const r2 = xlsx.utils.sheet_to_json(s2, { header: 1, defval: '' }).filter(r => r && r.some(c => c !== ''));
const h2 = r2[0];
const deals = r2.slice(1).filter(r => r[0] && r[0].toString().trim() !== '');
console.log(`- Tổng số cột: ${h2.length}`);
console.log(`- Tổng số Deal thực tế: ${deals.length}`);
console.log(`- Danh sách cột: \n  ${h2.join(' | ')}`);
console.log('\n--- CHI TIẾT CÁC DEALS THỰC TẾ ---');
deals.forEach((d, i) => {
  console.log(`[#${i + 1}] Deal ID: ${d[0]} | Worker ID: ${d[1]} | Họ tên: ${d[2]} | Công ty: ${d[5]} | Chi nhánh: ${d[6]} | Stage: ${d[7]} | VWW: ${d[14]} | Hoa hồng: ${d[16]}`);
});

// 3. TƯƠNG QUAN GIỮA WORKERS VÀ DEALS
console.log('\n================================================================');
console.log('3. TƯƠNG QUAN TOÀN VẸN WORKER_ID <-> DEAL.WORKER_ID');
console.log('================================================================');
const workerIdSet = new Set(workers.map(w => w[0]));
let orphanDeals = 0;
deals.forEach(d => {
  const wId = d[1];
  if (!workerIdSet.has(wId)) {
    console.log(`❌ DEAL MỒ CÔI (Orphan Deal): Deal ${d[0]} trỏ tới Worker ID ${wId} KHÔNG TỒN TẠI trong 01_MASTER_WORKERS!`);
    orphanDeals++;
  }
});
if (orphanDeals === 0) {
  console.log('✅ 100% Deals đều có Worker ID hợp lệ tồn tại trong 01_MASTER_WORKERS! (Zero Orphan Deals)');
} else {
  console.log(`⚠️ Có ${orphanDeals} Deals mồ côi! Cần sửa ngay!`);
}

// 4. KIỂM TRA ASSIGNMENTS VÀ ATTENDANCE_RAW
console.log('\n================================================================');
console.log('4. KIỂM TRA CÁC SHEET THỰC TẾ KHÁC: 07_ASSIGNMENTS, 08_ATTENDANCE_RAW');
console.log('================================================================');
const s7 = workbook.Sheets['07_ASSIGNMENTS'];
if (s7) {
  const r7 = xlsx.utils.sheet_to_json(s7, { header: 1, defval: '' }).filter(r => r && r[0]);
  console.log(`- 07_ASSIGNMENTS: ${r7.length - 1} dòng dữ liệu`);
  if (r7.length > 1) {
    console.log(`  Mẫu dòng 1:`, r7[1].slice(0, 6));
  }
}
const s8 = workbook.Sheets['08_ATTENDANCE_RAW'];
if (s8) {
  const r8 = xlsx.utils.sheet_to_json(s8, { header: 1, defval: '' }).filter(r => r && r[0]);
  console.log(`- 08_ATTENDANCE_RAW: ${r8.length - 1} dòng dữ liệu`);
  if (r8.length > 1) {
    console.log(`  Mẫu dòng 1:`, r8[1].slice(0, 6));
  }
}

// 5. KIỂM TRA TÍNH TƯƠNG THÍCH DANH MỤC (DM_BRANCH, DM_COMPANY, DM_LEVEL_SALE)
console.log('\n================================================================');
console.log('5. KIỂM TRA ĐỐI CHIẾU DANH MỤC (BRANCH, COMPANY, LEVEL_SALE)');
console.log('================================================================');
const branches = workbook.Sheets['DM_BRANCH'] ? xlsx.utils.sheet_to_json(workbook.Sheets['DM_BRANCH'], { header: 1 }).slice(1).map(r => r[1]).filter(Boolean) : [];
const companies = workbook.Sheets['DM_COMPANY'] ? xlsx.utils.sheet_to_json(workbook.Sheets['DM_COMPANY'], { header: 1 }).slice(1).map(r => r[1]).filter(Boolean) : [];
const stages = workbook.Sheets['DM_LEVEL_SALE'] ? xlsx.utils.sheet_to_json(workbook.Sheets['DM_LEVEL_SALE'], { header: 1 }).slice(1).map(r => r[0]).filter(Boolean) : [];

console.log(`- DM_BRANCH (${branches.length}):`, branches.join(', '));
console.log(`- DM_COMPANY (${companies.length}):`, companies.slice(0, 10).join(', '), '...');
console.log(`- DM_LEVEL_SALE (${stages.length}):`, stages.join(', '));

deals.forEach(d => {
  const comp = d[5];
  const br = d[6];
  const stg = d[7];
  const compValid = companies.includes(comp);
  const brValid = branches.includes(br);
  const stgValid = stages.includes(stg);
  if (!compValid || !brValid || !stgValid) {
    console.log(`⚠️ Deal ${d[0]} có giá trị lệch danh mục: Comp=${comp} (${compValid}), Branch=${br} (${brValid}), Stage=${stg} (${stgValid})`);
  }
});
console.log('✅ Hoàn tất kiểm tra danh mục!');
