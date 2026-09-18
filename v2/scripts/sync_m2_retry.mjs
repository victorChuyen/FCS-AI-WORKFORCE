import xlsx from 'xlsx';
import fs from 'fs';

const EXCEL_PATH = 'D:/FCS-AI-WORKFORCE/v2/FCS_V2_WORKFORCE_CRM_MASTER_T7_READY_ID_FIXED.xlsx';
const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbyFHP51wW1sb_ES3iOx2Yltq--Isq-yr1JgUF4ysw6LE7ksX58VPoryHTFMA0R9nK1qmQ/exec';

async function sendToWebApp(action, payload) {
  const url = `${WEBAPP_URL}?action=${encodeURIComponent(action)}`;
  const body = {
    action,
    requestId: 'SYNC-RETRY-' + Date.now(),
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

async function retryBatch2() {
  console.log('🔄 Đang nạp bù Mẻ 2 (index 200 -> 400)...');
  const wb = xlsx.readFile(EXCEL_PATH);
  const workerSheet = wb.Sheets['01_MASTER_WORKERS'];
  const rawWorkers = xlsx.utils.sheet_to_json(workerSheet, { defval: '' });
  
  const chunk = rawWorkers.slice(200, 400);
  console.log(`   ⏳ Đang nạp ${chunk.length} công nhân của Mẻ 2...`);

  // Thử chia nhỏ thành 2 mẻ con 100 dòng để chống timeout tuyệt đối
  for (let i = 0; i < chunk.length; i += 100) {
    const subChunk = chunk.slice(i, i + 100);
    console.log(`   ⏳ Gửi ${subChunk.length} bản ghi...`);
    const res = await sendToWebApp('v2.batch.import', {
      items: subChunk,
      default_branch: 'BẮC NINH',
      default_company: 'PARTNER',
      source: 'T7_MASTER_EXCEL'
    });
    console.log(`   ✅ Kết quả:`, res.success ? `Thành công imported: ${res.data?.imported_workers || subChunk.length}` : res.error);
  }

  console.log('🎉 Hoàn tất nạp bù Mẻ 2!');
}

retryBatch2().catch(console.error);
