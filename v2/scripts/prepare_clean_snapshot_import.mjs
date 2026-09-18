import xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';

const inputFilePath = path.resolve('v2/data-demo-thực tế/FCS_V2_WORKFORCE_CRM_MASTER_T7_READY_ID_FIXED.xlsx');
const outputJsonPath = path.resolve('v2/data-demo-thực tế/fcs_cleaned_snapshot_data.json');

console.log('🚀 BẮT ĐẦU CHUẨN HÓA SNAPSHOT DỮ LIỆU THỰC CHIẾN...');
const wb = xlsx.readFile(inputFilePath, { cellFormula: false, cellDates: true, raw: false });

// 1. Workers Map
const s1 = wb.Sheets['01_MASTER_WORKERS'];
const r1 = xlsx.utils.sheet_to_json(s1, { header: 1, defval: '' });
const workerHeaders = r1[0];
const workers = r1.slice(1).filter(r => r && r[0] && r[0].toString().trim() !== '');

const workerMap = new Map();
workers.forEach(w => {
  workerMap.set(w[0].toString().trim(), {
    worker_id: w[0],
    full_name: w[2] || '',
    phone: w[19] || '',
    cccd: w[5] || '',
    raw: w
  });
});

console.log(`✅ Đã nạp ${workers.length} hồ sơ Workers vào RAM.`);

// 2. Deals Processing (Loại bỏ triệt để VLOOKUP, lưu Snapshot tĩnh)
const s2 = wb.Sheets['02_CRM_DEALS_2026'];
const r2 = xlsx.utils.sheet_to_json(s2, { header: 1, defval: '' });
const dealHeaders = r2[0];
const rawDeals = r2.slice(1).filter(r => r && r[0] && r[0].toString().trim() !== '');

let formulasConverted = 0;
const cleanedDeals = rawDeals.map(d => {
  const dealId = d[0];
  const workerId = d[1];
  let fullName = d[2];
  let phone = d[3];
  let cccd = d[4];

  // Nếu chứa formula string hoặc undefined hoặc rỗng, lấy snapshot từ workerMap
  const worker = workerMap.get(workerId);
  if (worker) {
    if (!fullName || fullName.startsWith('=') || fullName === 'undefined') {
      fullName = worker.full_name;
      formulasConverted++;
    }
    if (!phone || phone.startsWith('=') || phone === 'undefined') {
      phone = worker.phone;
    }
    if (!cccd || cccd.startsWith('=') || cccd === 'undefined') {
      cccd = worker.cccd;
    }
  }

  // Điền target_company mặc định nếu trống
  let targetCompany = d[5];
  if (!targetCompany || targetCompany.trim() === '') {
    targetCompany = 'FUYU';
  }

  return [
    dealId,
    workerId,
    fullName,
    phone,
    cccd,
    targetCompany,
    d[6] || 'BẮC GIANG',
    d[7] || 'C3',
    d[8] || '',
    d[9] || '',
    d[10] || '',
    d[11] || '',
    d[12] || '',
    d[13] || '',
    d[14] === 'true' || d[14] === true,
    d[15] || '',
    d[16] || 0,
    d[17] || 'Chờ duyệt',
    d[18] || '',
    d[19] || new Date().toISOString(),
    d[20] || new Date().toISOString(),
    d[21] || 'SYSTEM_SNAPSHOT'
  ];
});

console.log(`✅ Đã chuẩn hóa ${cleanedDeals.length} Deals (chuyển đổi ${formulasConverted} ô formula sang Snapshot tĩnh an toàn).`);

// 3. Export package
const exportData = {
  metadata: {
    sourceFile: 'FCS_V2_WORKFORCE_CRM_MASTER_T7_READY_ID_FIXED.xlsx',
    generatedAt: new Date().toISOString(),
    totalWorkers: workers.length,
    totalDeals: cleanedDeals.length,
    totalAssignments: wb.Sheets['07_ASSIGNMENTS'] ? xlsx.utils.sheet_to_json(wb.Sheets['07_ASSIGNMENTS'], { header: 1 }).length - 1 : 0,
    totalAttendanceRaw: wb.Sheets['08_ATTENDANCE_RAW'] ? xlsx.utils.sheet_to_json(wb.Sheets['08_ATTENDANCE_RAW'], { header: 1 }).length - 1 : 0
  },
  workers: {
    headers: workerHeaders,
    rows: workers
  },
  deals: {
    headers: dealHeaders,
    rows: cleanedDeals
  }
};

fs.writeFileSync(outputJsonPath, JSON.stringify(exportData, null, 2), 'utf8');
console.log(`💾 Đã xuất gói dữ liệu chuẩn sạch ra: ${outputJsonPath} (${(fs.statSync(outputJsonPath).size / 1024).toFixed(1)} KB)`);
console.log('🎉 Hoàn tất chuẩn bị dữ liệu Snapshot thực chiến!');
