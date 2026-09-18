/**
 * push_v2_backend.mjs
 * Tự động đẩy toàn bộ mã nguồn v2/backend/*.gs lên Apps Script V2 Project
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const SCRIPT_ID = '1qJJxG_Q6QUZys6BUPhdVdk7DqNFOxSQTy6BRA85R2J50eoMwG-fCp0lP';
const V2_BACKEND_DIR = join(process.cwd(), 'v2', 'backend');

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

  // Đọc toàn bộ file trong v2/backend (bỏ qua bundle Code.gs, chỉ lấy các file module rời)
  const allFiles = readdirSync(V2_BACKEND_DIR)
    .filter(f => (f.endsWith('.gs') && f !== 'Code.gs') || f === 'appsscript.json')
    .sort();

  console.log(`📁 Tìm thấy ${allFiles.length} files trong v2/backend:`, allFiles.join(', '));

  const projectFiles = allFiles.map(filename => {
    const content = readFileSync(join(V2_BACKEND_DIR, filename), 'utf-8');
    const isManifest = filename === 'appsscript.json';
    return {
      name: isManifest ? 'appsscript' : filename.replace('.gs', ''),
      type: isManifest ? 'JSON' : 'SERVER_JS',
      source: content
    };
  });

  console.log('\n🚀 Đang tải mã nguồn lên Google Apps Script V2...');
  const putRes = await fetch(
    `https://script.googleapis.com/v1/projects/${SCRIPT_ID}/content`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ files: projectFiles })
    }
  );

  if (!putRes.ok) {
    const err = await putRes.text();
    console.error('❌ Lỗi tải mã nguồn V2:', putRes.status, err);
    process.exit(1);
  }

  const result = await putRes.json();
  console.log('🎉 Tải mã nguồn V2 thành công rực rỡ! Số files:', result.files?.length);
  result.files?.forEach(f => console.log(`  ✓ ${f.name} (${f.type})`));
  console.log('\n🌐 Link Apps Script Editor V2:');
  console.log('   https://script.google.com/d/' + SCRIPT_ID + '/edit');
}

main().catch(console.error);
