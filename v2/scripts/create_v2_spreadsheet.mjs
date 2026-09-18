/**
 * create_v2_spreadsheet.mjs
 * Tự động tạo Google Spreadsheet mới cho FCS V2 Enterprise CRM
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const CLASP_CLIENT_ID = '1072944905499-vm2v2i5dvn0a0d2o4ca36i1vge8cvbn0.apps.googleusercontent.com';
const CLASP_CLIENT_SECRET = 'v6V3fKV_zWU7iw1DrpO1rknX';

async function main() {
  const clasprcPath = join(homedir(), '.clasprc.json');
  const clasprc = JSON.parse(readFileSync(clasprcPath, 'utf-8'));
  const tokens = clasprc.tokens?.default || clasprc.token || {};
  const refreshToken = tokens.refresh_token;

  console.log('🔄 Đang làm mới Google OAuth access token...');
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
  console.log('✅ Access token sẵn sàng.');

  console.log('🚀 Đang tạo Google Spreadsheet mới qua Google Drive API: [FCS_V2_WORKFORCE_CRM_MASTER]...');
  const res = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'FCS_V2_WORKFORCE_CRM_MASTER',
      mimeType: 'application/vnd.google-apps.spreadsheet'
    })
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('❌ Lỗi tạo spreadsheet qua Drive API:', res.status, err);
    return;
  }

  const file = await res.json();
  console.log('🎉 Tạo thành công Google Spreadsheet V2!');
  console.log('   Spreadsheet ID:', file.id);
  console.log('   Spreadsheet URL: https://docs.google.com/spreadsheets/d/' + file.id + '/edit');
}

main().catch(console.error);
