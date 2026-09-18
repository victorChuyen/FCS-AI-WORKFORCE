import fetch from 'node-fetch';

const apiBaseUrl = 'https://script.google.com/macros/s/AKfycbyFHP51wW1sb_ES3iOx2Yltq--Isq-yr1JgUF4ysw6LE7ksX58VPoryHTFMA0R9nK1qmQ/exec';

async function main() {
  const postData = JSON.stringify({
    action: 'v2.dashboard.stats',
    requestId: `diag-${Date.now()}`,
    timestamp: Date.now(),
    identity: {
      firebaseUid: 'RChRZFoJazPizvBtHFX9dzjLGkJ2',
      email: 'coach.chuyen@gmail.com',
      role: 'PLATFORM_SUPER_ADMIN',
      tenantId: 'FCS-000001',
    },
    payload: {},
  });

  const url = `${apiBaseUrl}?action=v2.dashboard.stats`;
  const res = await fetch(url, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: postData,
  });

  const data = await res.json();
  console.log('v2.dashboard.stats RESPONSE:', JSON.stringify(data, null, 2));
}

main().catch(console.error);
