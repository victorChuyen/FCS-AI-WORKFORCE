import { readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const SPREADSHEET_ID = '1YAVNiPtAiYrxEThvIgWuR0PAHJbDCDqrXCz5SNwrxXE';
const CLASP_CLIENT_ID = '1072944905499-vm2v2i5dvn0a0d2o4ca36i1vge8cvbn0.apps.googleusercontent.com';
const CLASP_CLIENT_SECRET = 'v6V3fKV_zWU7iw1DrpO1rknX';

async function auditLiveSheet() {
  const clasprcPath = join(homedir(), '.clasprc.json');
  const clasprc = JSON.parse(readFileSync(clasprcPath, 'utf-8'));
  const tokens = clasprc.tokens?.default || clasprc.token || {};
  const refreshToken = tokens.refresh_token;

  console.log('🔄 Làm mới token Google OAuth...');
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLASP_CLIENT_ID,
      client_secret: CLASP_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  console.log(`📊 Đang tải metadata Spreadsheet: ${SPREADSHEET_ID}...`);
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!metaRes.ok) {
    const err = await metaRes.text();
    console.error('❌ Lỗi tải metadata sheet:', metaRes.status, err);
    return;
  }

  const meta = await metaRes.json();
  console.log(`\nTên bảng tính: "${meta.properties?.title}"`);
  console.log(`Số lượng tab: ${meta.sheets?.length}\n`);

  for (const sheet of meta.sheets) {
    const title = sheet.properties.title;
    const sheetId = sheet.properties.sheetId;
    const rowCount = sheet.properties.gridProperties?.rowCount;
    const colCount = sheet.properties.gridProperties?.columnCount;

    // Fetch first 2 rows of each tab
    const valRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(title)}!1:2`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const valData = await valRes.json();
    const rows = valData.values || [];

    console.log(`📑 Tab [${title}] (ID: ${sheetId}, Grid: ${rowCount}x${colCount}):`);
    if (rows.length > 0) {
      console.log(`   Headers (${rows[0].length} cột): ${rows[0].join(', ')}`);
    } else {
      console.log('   (Trống không có dữ liệu)');
    }
    if (rows.length > 1) {
      console.log(`   Dòng 2: ${rows[1].slice(0, 5).join(', ')} ...`);
    } else {
      console.log('   (Chưa có dòng dữ liệu nào ngoài header)');
    }
    console.log('----------------------------------------------------------------');
  }
}

auditLiveSheet().catch(console.error);
