/**
 * share_v2_with_coach.mjs
 * Chia sẻ quyền Editor cho coach.chuyen@gmail.com trên Apps Script V2
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

  console.log('🚀 Đang chia sẻ quyền Editor cho coach.chuyen@gmail.com...');
  const shareRes = await fetch(`https://www.googleapis.com/drive/v3/files/${SCRIPT_ID}/permissions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      role: 'writer',
      type: 'user',
      emailAddress: 'coach.chuyen@gmail.com'
    })
  });

  if (!shareRes.ok) {
    const err = await shareRes.text();
    console.error('❌ Lỗi share:', shareRes.status, err);
    return;
  }

  const shareData = await shareRes.json();
  console.log('✅ Đã cấp quyền Editor thành công cho coach.chuyen@gmail.com!');
  console.log('   Permission ID:', shareData.id);
}

main().catch(console.error);
