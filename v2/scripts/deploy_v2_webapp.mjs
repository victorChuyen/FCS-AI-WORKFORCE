/**
 * deploy_v2_webapp.mjs
 * Tự động tạo Version và Deploy Web App V2 qua Google Apps Script API
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const SCRIPT_ID = '1qJJxG_Q6QUZys6BUPhdVdk7DqNFOxSQTy6BRA85R2J50eoMwG-fCp0lP';
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

  // 1. Tạo Version mới cho script
  console.log('📦 Đang tạo Version mới cho Apps Script V2...');
  const verRes = await fetch(`https://script.googleapis.com/v1/projects/${SCRIPT_ID}/versions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description: 'FCS V2 Enterprise CRM Initial Release'
    })
  });

  if (!verRes.ok) {
    const err = await verRes.text();
    console.error('❌ Lỗi tạo version:', verRes.status, err);
    return;
  }

  const verData = await verRes.json();
  console.log('✅ Đã tạo Version:', verData.versionNumber);

  // 2. Tạo Deployment Web App
  console.log('🚀 Đang triển khai Web App Deployment V2...');
  const depRes = await fetch(`https://script.googleapis.com/v1/projects/${SCRIPT_ID}/deployments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      versionNumber: verData.versionNumber,
      description: 'FCS V2 Production Web App Release',
      manifestFileName: 'appsscript'
    })
  });

  if (!depRes.ok) {
    const err = await depRes.text();
    console.error('❌ Lỗi deploy Web App:', depRes.status, err);
    return;
  }

  const depData = await depRes.json();
  console.log('🎉 Triển khai Web App V2 thành công rực rỡ!');
  console.log('   Deployment ID:', depData.deploymentId);
  const webAppUrl = depData.entryPoints?.find(e => e.entryPointType === 'WEB_APP')?.webApp?.url;
  console.log('🌐 Web App URL V2:', webAppUrl);
}

main().catch(console.error);
