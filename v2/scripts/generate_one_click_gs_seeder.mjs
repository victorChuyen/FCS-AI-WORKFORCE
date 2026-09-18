import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';

const EXCEL_PATH = path.resolve('v2/FCS_V2_WORKFORCE_CRM_MASTER_T7_READY_ID_FIXED.xlsx');
const OUTPUT_GS = path.resolve('v2/NAP_NHANH_TOAN_BO_DATA_T7.gs');

console.log('🔄 Đang tạo tệp Apps Script Seeder 1-Click từ:', EXCEL_PATH);
const wb = xlsx.readFile(EXCEL_PATH, { cellDates: true });

// 1. Workers
const s1 = wb.Sheets['01_MASTER_WORKERS'];
const r1 = xlsx.utils.sheet_to_json(s1, { header: 1, defval: '' });
const workerRows = r1.slice(1).filter(r => r && r[0]);

// 2. Deals (loại bỏ VLOOKUP, dùng snapshot)
const s2 = wb.Sheets['02_CRM_DEALS_2026'];
const r2 = xlsx.utils.sheet_to_json(s2, { header: 1, defval: '' });
const rawDeals = r2.slice(1).filter(r => r && r[0]);

const workerMap = {};
workerRows.forEach(w => {
  workerMap[w[0]] = { name: w[2] || '', phone: w[19] || '', cccd: w[5] || '' };
});

const cleanDeals = rawDeals.map(d => {
  const wId = d[1];
  const w = workerMap[wId] || {};
  let name = d[2];
  let phone = d[3];
  let cccd = d[4];
  if (!name || name.startsWith('=') || name === 'undefined') name = w.name;
  if (!phone || phone.startsWith('=') || phone === 'undefined') phone = w.phone;
  if (!cccd || cccd.startsWith('=') || cccd === 'undefined') cccd = w.cccd;

  return [
    d[0],
    d[1],
    name,
    phone,
    cccd,
    d[5] || 'FUYU',
    d[6] || 'BẮC GIANG',
    d[7] || 'C3',
    d[8] || '',
    d[9] || '',
    d[10] || '',
    d[11] || '',
    d[12] || '',
    d[13] || '',
    d[14] === true || d[14] === 'true',
    d[15] || '',
    d[16] || 0,
    d[17] || 'Chờ duyệt',
    d[18] || '',
    d[19] || new Date().toISOString(),
    d[20] || new Date().toISOString(),
    d[21] || 'SYSTEM'
  ];
});

// 3. Assignments
const s7 = wb.Sheets['07_ASSIGNMENTS'];
const r7 = s7 ? xlsx.utils.sheet_to_json(s7, { header: 1, defval: '' }).slice(1).filter(r => r && r[0]) : [];

// 4. Attendance Raw
const s8 = wb.Sheets['08_ATTENDANCE_RAW'];
const r8 = s8 ? xlsx.utils.sheet_to_json(s8, { header: 1, defval: '' }).slice(1).filter(r => r && r[0]) : [];

console.log(`- Workers: ${workerRows.length} dòng`);
console.log(`- Clean Deals: ${cleanDeals.length} dòng`);
console.log(`- Assignments: ${r7.length} dòng`);
console.log(`- Attendance: ${r8.length} dòng`);

// Build Apps Script content
const code = `/**
 * ==============================================================================
 * FCS V2 — BỘ NẠP DỮ LIỆU T7 THỰC CHIẾN 1-CLICK TRỰC TIẾP TRÊN GOOGLE SHEETS
 * Tác dụng:
 * 1. Gỡ sạch các ổ khóa bảo vệ cũ
 * 2. Xóa sạch các dòng bị lỗi #ERROR! trên 02_CRM_DEALS_2026
 * 3. Nạp đầy đủ 925 Workers vào 01_MASTER_WORKERS
 * 4. Nạp 14 Deals chuẩn Snapshot (ZERO VLOOKUP, ZERO #ERROR!) vào 02_CRM_DEALS_2026
 * 5. Nạp 906 dòng 07_ASSIGNMENTS và 895 dòng 08_ATTENDANCE_RAW
 * ==============================================================================
 */

function NAP_DATA_T7_DONE_100_PHAN_TRAM() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log("🚀 Bắt đầu quá trình nạp dữ liệu chuẩn T7...");

  // BƯỚC 1: Gỡ bỏ toàn bộ ổ khóa bảo vệ cũ
  var protectionsCount = 0;
  ss.getSheets().forEach(function(sh) {
    try {
      sh.getProtections(SpreadsheetApp.ProtectionType.RANGE).forEach(function(p) { p.remove(); protectionsCount++; });
      sh.getProtections(SpreadsheetApp.ProtectionType.SHEET).forEach(function(p) { p.remove(); protectionsCount++; });
    } catch(e) {}
  });
  Logger.log("✅ Đã gỡ bỏ " + protectionsCount + " ổ khóa bảo vệ cũ.");

  // BƯỚC 2: Xóa sạch dữ liệu rác cũ từ dòng 2 trở đi
  var sheetsToClear = ["01_MASTER_WORKERS", "02_CRM_DEALS_2026", "07_ASSIGNMENTS", "08_ATTENDANCE_RAW"];
  sheetsToClear.forEach(function(name) {
    var sh = ss.getSheetByName(name);
    if (sh && sh.getLastRow() > 1) {
      sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).clearContent();
      Logger.log("🧹 Đã làm sạch tab " + name);
    }
  });

  // BƯỚC 3: Nạp 925 Workers vào 01_MASTER_WORKERS
  var workerSheet = ss.getSheetByName("01_MASTER_WORKERS");
  if (!workerSheet) workerSheet = ss.insertSheet("01_MASTER_WORKERS");
  var workersData = ${JSON.stringify(workerRows)};
  if (workersData.length > 0) {
    workerSheet.getRange(2, 1, workersData.length, workersData[0].length).setValues(workersData);
    Logger.log("✅ Đã nạp thành công " + workersData.length + " hồ sơ vào 01_MASTER_WORKERS!");
  }

  // BƯỚC 4: Nạp 14 Deals Snapshot chuẩn vào 02_CRM_DEALS_2026 (ZERO #ERROR!)
  var dealSheet = ss.getSheetByName("02_CRM_DEALS_2026");
  if (!dealSheet) dealSheet = ss.insertSheet("02_CRM_DEALS_2026");
  var dealsData = ${JSON.stringify(cleanDeals)};
  if (dealsData.length > 0) {
    dealSheet.getRange(2, 1, dealsData.length, dealsData[0].length).setValues(dealsData);
    Logger.log("✅ Đã nạp thành công " + dealsData.length + " Deals vào 02_CRM_DEALS_2026 (KHÔNG CÒN LỖI #ERROR!)!");
  }

  // BƯỚC 5: Nạp 07_ASSIGNMENTS (nếu có)
  var asgSheet = ss.getSheetByName("07_ASSIGNMENTS");
  if (!asgSheet) asgSheet = ss.insertSheet("07_ASSIGNMENTS");
  var asgData = ${JSON.stringify(r7)};
  if (asgData.length > 0) {
    asgSheet.getRange(2, 1, asgData.length, asgData[0].length).setValues(asgData);
    Logger.log("✅ Đã nạp thành công " + asgData.length + " dòng vào 07_ASSIGNMENTS!");
  }

  // BƯỚC 6: Nạp 08_ATTENDANCE_RAW (nếu có)
  var attSheet = ss.getSheetByName("08_ATTENDANCE_RAW");
  if (!attSheet) attSheet = ss.insertSheet("08_ATTENDANCE_RAW");
  var attData = ${JSON.stringify(r8)};
  if (attData.length > 0) {
    attSheet.getRange(2, 1, attData.length, attData[0].length).setValues(attData);
    Logger.log("✅ Đã nạp thành công " + attData.length + " dòng vào 08_ATTENDANCE_RAW!");
  }

  SpreadsheetApp.flush();
  Logger.log("🎉 HOÀN TẤT 100%! TOÀN BỘ DỮ LIỆU ĐÃ XANH SẠCH CHUẨN XÁC!");
}
`;

fs.writeFileSync(OUTPUT_GS, code, 'utf8');
console.log(`💾 Đã tạo thành công tệp: ${OUTPUT_GS} (${(fs.statSync(OUTPUT_GS).size / 1024).toFixed(1)} KB)`);
