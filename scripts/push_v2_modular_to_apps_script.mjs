/**
 * push_v2_modular_to_apps_script.mjs
 *
 * Pushes all 15 modular V2 backend/*.gs files to the Apps Script project
 * (Script ID: 1qJJxG_Q6QUZys6BUPhdVdk7DqNFOxSQTy6BRA85R2J50eoMwG-fCp0lP)
 * using the official Google Apps Script REST API.
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const SCRIPT_ID = '1qJJxG_Q6QUZys6BUPhdVdk7DqNFOxSQTy6BRA85R2J50eoMwG-fCp0lP';
const BACKEND_DIR = join(process.cwd(), 'v2', 'backend');

const CLASP_CLIENT_ID = '1072944905499-vm2v2i5dvn0a0d2o4ca36i1vge8cvbn0.apps.googleusercontent.com';
const CLASP_CLIENT_SECRET = 'v6V3fKV_zWU7iw1DrpO1rknX';

async function main() {
  console.log('===============================================================');
  console.log('🚀 PUSHING 15 CLEAN MODULAR FILES TO GOOGLE APPS SCRIPT');
  console.log('   Script ID:', SCRIPT_ID);
  console.log('   Source:', BACKEND_DIR);
  console.log('===============================================================\n');

  // 1. Read refresh_token
  const clasprcPath = join(homedir(), '.clasprc.json');
  const clasprc = JSON.parse(readFileSync(clasprcPath, 'utf-8'));
  const tokens = clasprc.tokens?.default || clasprc.token || {};
  const refreshToken = tokens.refresh_token;

  if (!refreshToken) {
    throw new Error('No refresh_token found in .clasprc.json');
  }

  // 2. Refresh access token
  console.log('🔄 Refreshing Google access token...');
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

  if (!tokenRes.ok) {
    throw new Error(`Token refresh failed: ${tokenRes.status} ${await tokenRes.text()}`);
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;
  console.log('✅ Access token refreshed successfully!\n');

  // 3. Read modular files ONLY (exclude bundles Code.gs and 01_Router_Extended.gs)
  const excludedFiles = new Set(['Code.gs', '01_Router_Extended.gs']);
  const filesToUpload = [
    '00_Config.gs',
    '01_Router.gs',
    '02_WorkerService.gs',
    '03_DealService.gs',
    '04_TaxonomyService.gs',
    '05_SecurityService.gs',
    '06_ValidationService.gs',
    '07_AuditService.gs',
    '08_TriggerService.gs',
    '09_DashboardService.gs',
    '10_BatchImportService.gs',
    '11_FieldDispatchService.gs',
    '12_AttendanceMatchingService.gs',
    '13_SettlementService.gs',
    '14_LeadMarketingService.gs',
    'appsscript.json'
  ];

  console.log(`📁 Preparing ${filesToUpload.length} files:`);
  const projectFiles = filesToUpload.map(filename => {
    const filePath = join(BACKEND_DIR, filename);
    const content = readFileSync(filePath, 'utf-8');
    const isManifest = filename === 'appsscript.json';
    const lines = content.split('\n').length;
    console.log(`   • ${filename.padEnd(32)}: ${lines.toString().padStart(4)} lines (${(content.length / 1024).toFixed(1)} KB)`);

    return {
      name: isManifest ? 'appsscript' : filename.replace('.gs', ''),
      type: isManifest ? 'JSON' : 'SERVER_JS',
      source: content
    };
  });

  // 4. Push to Apps Script API
  console.log('\n🚀 Uploading to Apps Script Project via REST API...');
  const putRes = await fetch(`https://script.googleapis.com/v1/projects/${SCRIPT_ID}/content`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ files: projectFiles })
  });

  if (!putRes.ok) {
    throw new Error(`Upload failed: ${putRes.status} ${await putRes.text()}`);
  }

  const putResult = await putRes.json();
  const remoteFiles = putResult.files?.map(f => f.name) || [];
  console.log('\n🎉 UPLOAD THÀNH CÔNG! Danh sách files trên Google Apps Script:');
  remoteFiles.forEach((name, idx) => {
    console.log(`   ${(idx + 1).toString().padStart(2, '0')}. ${name}`);
  });

  console.log('\n✅ 15 MODULES ĐÃ ĐƯỢC TÁCH RỜI CHUẨN MỰC TRÊN GOOGLE APPS SCRIPT!');
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
