import { readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

async function main() {
  const clasprc = JSON.parse(readFileSync(join(homedir(), '.clasprc.json'), 'utf-8'));
  const refreshToken = clasprc.tokens?.default?.refresh_token;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: '1072944905499-vm2v2i5dvn0a0d2o4ca36i1vge8cvbn0.apps.googleusercontent.com',
      client_secret: 'v6V3fKV_zWU7iw1DrpO1rknX',
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });
  const { access_token } = await tokenRes.json();

  const ssId = '1YAVNiPtAiYrxEThvIgWuR0PAHJbDCDqrXCz5SNwrxXE';
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${ssId}`, {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('📋 ALL SHEETS in FCS_V2_WORKFORCE_CRM_MASTER:');
  data.sheets?.forEach(s => console.log(`  - ${s.properties.title} (${s.properties.gridProperties.rowCount} rows, ${s.properties.gridProperties.columnCount} cols)`));

  // Check headers of 05_PIPELINE_EVENTS
  const peRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${ssId}/values/05_PIPELINE_EVENTS!1:1`, {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  const peData = await peRes.json();
  console.log('\n📌 05_PIPELINE_EVENTS headers:', peData.values?.[0]);

  // Check headers of 02_CRM_DEALS_2026
  const cdRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${ssId}/values/02_CRM_DEALS_2026!1:1`, {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  const cdData = await cdRes.json();
  console.log('\n📌 02_CRM_DEALS_2026 headers:', cdData.values?.[0]);

  // Check headers of 01_MASTER_WORKERS
  const mwRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${ssId}/values/01_MASTER_WORKERS!1:1`, {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  const mwData = await mwRes.json();
  console.log('\n📌 01_MASTER_WORKERS headers:', mwData.values?.[0]);
}

main().catch(console.error);
