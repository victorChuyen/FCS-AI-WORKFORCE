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

  const ssId = '1cGm6h-Py1Da5-uWYm2KkKYCWIEWtzDe6uwDwhai2o0E';
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${ssId}`, {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Data:', JSON.stringify(data, null, 2));
  console.log('📋 ALL SHEETS:');
  data.sheets?.forEach(s => console.log(`  - ${s.properties.title}`));

  // Headers of 04_WORKERS_MASTER
  const hRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${ssId}/values/04_WORKERS_MASTER!1:1`, {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  const hData = await hRes.json();
  console.log('\n📌 04_WORKERS_MASTER headers:');
  console.log(JSON.stringify(hData.values?.[0], null, 2));

  // Rows of 04_WORKERS_MASTER
  const rRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${ssId}/values/04_WORKERS_MASTER!A1:Z15`, {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  const rData = await rRes.json();
  console.log('\n📌 04_WORKERS_MASTER rows 1-15:');
  rData.values?.forEach((row, idx) => {
    console.log(`Row ${idx + 1}: ${row.slice(0, 8).join(' | ')}`);
  });

  // Check 18_ACTION_QUEUE or 11_ACTION_QUEUE
  const actSheet = data.sheets?.find(s => s.properties.title.includes('ACTION_QUEUE'))?.properties.title;
  if (actSheet) {
    const actRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${ssId}/values/${actSheet}!A1:Z10`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    const actData = await actRes.json();
    console.log(`\n📌 ${actSheet} rows:`);
    actData.values?.forEach((row, idx) => {
      console.log(`Row ${idx + 1}: ${row.join(' | ')}`);
    });
  }
}

main().catch(console.error);
