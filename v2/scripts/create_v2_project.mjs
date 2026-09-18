/**
 * create_v2_project.mjs
 * Tự động tạo Google Apps Script project mới cho FCS V2 Enterprise CRM
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

  // Tạo Apps Script Project mới cho V2
  console.log('🚀 Đang tạo Google Apps Script Project mới: [FCS_V2_BACKEND_ENGINE]...');
  const createRes = await fetch('https://script.googleapis.com/v1/projects', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'FCS_V2_BACKEND_ENGINE'
    })
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    console.error('❌ Lỗi tạo project Apps Script:', createRes.status, err);
    return;
  }

  const project = await createRes.json();
  console.log('🎉 Tạo thành công Apps Script Project V2!');
  console.log('   Script ID:', project.scriptId);
  console.log('   Script URL: https://script.google.com/d/' + project.scriptId + '/edit');
}

main().catch(console.error);
