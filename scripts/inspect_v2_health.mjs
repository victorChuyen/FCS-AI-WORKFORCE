const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbyFHP51wW1sb_ES3iOx2Yltq--Isq-yr1JgUF4ysw6LE7ksX58VPoryHTFMA0R9nK1qmQ/exec';
async function checkHealth() {
  const res = await fetch(`${WEBAPP_URL}?action=v2.health`, { redirect: 'follow' });
  const json = await res.json();
  console.log('Health check:', JSON.stringify(json, null, 2));
}

checkHealth().catch(console.error);
