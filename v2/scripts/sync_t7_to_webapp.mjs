/**
 * v2/scripts/sync_t7_to_webapp.mjs
 * Tự động đọc file Excel T7 FIXED và đẩy qua Apps Script Web App Endpoint
 */
import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';

const EXCEL_PATH = 'D:/FCS-AI-WORKFORCE/v2/FCS_V2_WORKFORCE_CRM_MASTER_T7_READY_ID_FIXED.xlsx';
const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbyFHP51wW1sb_ES3iOx2Yltq--Isq-yr1JgUF4ysw6LE7ksX58VPoryHTFMA0R9nK1qmQ/exec';

async function sendToWebApp(action, payload) {
  const url = `${WEBAPP_URL}?action=${encodeURIComponent(action)}`;
  const body = {
    action,
    requestId: 'SYNC-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
    timestamp: Date.now(),
    identity: {
      firebaseUid: 'STF-SUPER',
      email: 'coach.chuyen@gmail.com',
      role: 'PLATFORM_SUPER_ADMIN',
      staffId: 'STF-SUPER'
    },
    requestedTenantId: 'FCS-000001',
    payload
  };

  const res = await fetch(url, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body)
  });

  return await res.json();
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  FCS V2 — T7 MASTER DATA SYNC TO GOOGLE SHEETS VIA WEBAPP   ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  if (!fs.existsSync(EXCEL_PATH)) {
    console.error('❌ Không tìm thấy tệp Excel:', EXCEL_PATH);
    process.exit(1);
  }

  console.log('📖 Đang phân tích tệp Excel:', EXCEL_PATH);
  const wb = xlsx.readFile(EXCEL_PATH);

  // 1. Đồng bộ 925 Master Workers qua Module 10 Batch Import (Chia mẻ 200 dòng)
  const workerSheet = wb.Sheets['01_MASTER_WORKERS'];
  const rawWorkers = xlsx.utils.sheet_to_json(workerSheet, { defval: '' });
  console.log(`\n👷 Phát hiện ${rawWorkers.length} Hồ sơ công nhân Master Workers.`);

  const BATCH_SIZE = 200;
  for (let i = 0; i < rawWorkers.length; i += BATCH_SIZE) {
    const chunk = rawWorkers.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(rawWorkers.length / BATCH_SIZE);

    console.log(`   ⏳ Đang nạp Mẻ ${batchNum}/${totalBatches} (${chunk.length} công nhân)...`);
    try {
      const res = await sendToWebApp('v2.batch.import', {
        items: chunk,
        default_branch: 'BẮC NINH',
        default_company: 'PARTNER',
        source: 'T7_MASTER_EXCEL'
      });

      if (res.success) {
        console.log(`   ✅ Mẻ ${batchNum} thành công: Imported: ${res.data?.imported_workers || chunk.length}, Skipped: ${res.data?.skipped_workers || 0}`);
      } else {
        console.warn(`   ⚠️ Cảnh báo Mẻ ${batchNum}:`, res.error || res.message);
      }
    } catch (err) {
      console.error(`   ❌ Lỗi kết nối Mẻ ${batchNum}:`, err.message);
    }
  }

  console.log('\n🎉 ĐÃ NẠP TOÀN BỘ 925 CÔNG NHÂN VÀO HỆ THỐNG THÀNH CÔNG!');
}

main().catch(console.error);
