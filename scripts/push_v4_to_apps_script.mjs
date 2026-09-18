/**
 * push_v4_to_apps_script.mjs
 * 
 * Pushes all V4 backend/*.gs files to the Apps Script project
 * using the clasp OAuth credentials stored in ~/.clasprc.json.
 * 
 * Steps:
 * 1. Read refresh_token from ~/.clasprc.json
 * 2. Refresh access_token via Google OAuth2
 * 3. Read all backend/*.gs files
 * 4. PUT them to the Apps Script API as the project's content
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// =============================================================================
// CONFIG
// =============================================================================
const SCRIPT_ID = '1pwI2BRmnyk-cknsg_Ym-wOTaH2UbC3QMUyXmV3g4sSfzRl1Oc5Xgd45S';
const BACKEND_DIR = join(process.cwd(), 'backend');

// Clasp's built-in OAuth client credentials (public, embedded in clasp source)
const CLASP_CLIENT_ID = '1072944905499-vm2v2i5dvn0a0d2o4ca36i1vge8cvbn0.apps.googleusercontent.com';
const CLASP_CLIENT_SECRET = 'v6V3fKV_zWU7iw1DrpO1rknX';

// =============================================================================
// 1. Read clasp credentials
// =============================================================================
const clasprcPath = join(homedir(), '.clasprc.json');
console.log('📂 Reading clasp credentials from:', clasprcPath);

const clasprc = JSON.parse(readFileSync(clasprcPath, 'utf-8'));
const tokens = clasprc.tokens?.default || clasprc.token || {};
const refreshToken = tokens.refresh_token;

if (!refreshToken) {
  console.error('❌ No refresh_token found in .clasprc.json');
  process.exit(1);
}
console.log('✅ refresh_token found (length:', refreshToken.length, ')');

// =============================================================================
// 2. Refresh access token
// =============================================================================
console.log('\n🔄 Refreshing access token...');

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
  const errBody = await tokenRes.text();
  console.error('❌ Token refresh failed:', tokenRes.status, errBody);
  process.exit(1);
}

const tokenData = await tokenRes.json();
const accessToken = tokenData.access_token;
console.log('✅ New access_token obtained (length:', accessToken.length, ')');

// Check who we are
const meRes = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
  headers: { Authorization: `Bearer ${accessToken}` }
});
const me = await meRes.json();
console.log('👤 Logged in as:', me.email, '(', me.name, ')');

// =============================================================================
// 3. Read all backend .gs files + appsscript.json
// =============================================================================
console.log('\n📁 Reading backend files...');

const allFiles = readdirSync(BACKEND_DIR)
  .filter(f => f.endsWith('.gs') || f === 'appsscript.json')
  .filter(f => f !== 'Code.gs') // Skip the bundle, we use modular files
  .sort();

console.log(`Found ${allFiles.length} files:`, allFiles.join(', '));

const projectFiles = allFiles.map(filename => {
  const content = readFileSync(join(BACKEND_DIR, filename), 'utf-8');
  const isManifest = filename === 'appsscript.json';
  
  return {
    name: isManifest ? 'appsscript' : filename.replace('.gs', ''),
    type: isManifest ? 'JSON' : 'SERVER_JS',
    source: content
  };
});

console.log(`Prepared ${projectFiles.length} files for upload:`);
projectFiles.forEach(f => {
  console.log(`  • ${f.name} (${f.type}, ${f.source.length} chars)`);
});

// =============================================================================
// 4. GET current project content (to check permissions)
// =============================================================================
console.log('\n🔍 Verifying project access...');

const getRes = await fetch(
  `https://script.googleapis.com/v1/projects/${SCRIPT_ID}/content`,
  { headers: { Authorization: `Bearer ${accessToken}` } }
);

if (!getRes.ok) {
  const errBody = await getRes.text();
  console.error('❌ Cannot read project:', getRes.status, errBody);
  console.error('\n⚠️  This account may not have access to the project.');
  console.error('    Project ID:', SCRIPT_ID);
  console.error('    Logged in as:', me.email);
  process.exit(1);
}

const currentContent = await getRes.json();
const currentFiles = currentContent.files?.map(f => f.name) || [];
console.log('✅ Current project has', currentFiles.length, 'files:', currentFiles.join(', '));

// =============================================================================
// 5. PUT updated project content
// =============================================================================
console.log('\n🚀 Pushing V4 files to Apps Script project...');

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
  const errBody = await putRes.text();
  console.error('❌ Push failed:', putRes.status, errBody);
  process.exit(1);
}

const putResult = await putRes.json();
const pushedFiles = putResult.files?.map(f => f.name) || [];
console.log('✅ Push successful! Updated files:', pushedFiles.length);
pushedFiles.forEach(f => console.log(`  ✓ ${f}`));

console.log('\n🎉 V4 code is now live on Apps Script!');
console.log('📋 Next steps:');
console.log('   1. Go to https://script.google.com/home/projects/' + SCRIPT_ID + '/edit');
console.log('   2. Click Deploy → Manage deployments → Edit → New version → Deploy');
console.log('   3. Copy the new Web App URL');
console.log('   4. Update VITE_API_BASE_URL in .env and Cloudflare Pages');
