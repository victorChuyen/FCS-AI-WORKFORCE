const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbyFHP51wW1sb_ES3iOx2Yltq--Isq-yr1JgUF4ysw6LE7ksX58VPoryHTFMA0R9nK1qmQ/exec';

async function measure() {
  console.log('⏱️ Đang đo lường tốc độ các Endpoint hiện tại:');

  const t0 = Date.now();
  const res1 = await fetch(`${WEBAPP_URL}?action=v2.health`, { redirect: 'follow' });
  await res1.json();
  console.log(`1. v2.health: ${Date.now() - t0} ms`);

  const t1 = Date.now();
  const res2 = await fetch(`${WEBAPP_URL}?action=v2.dashboard.stats`, { redirect: 'follow' });
  const d2 = await res2.json();
  console.log(`2. v2.dashboard.stats: ${Date.now() - t1} ms`);
  console.log('   Stats sample:', JSON.stringify(d2.data || d2.stats).slice(0, 100));

  const t2 = Date.now();
  const res3 = await fetch(`${WEBAPP_URL}?action=v2.taxonomy.get`, { redirect: 'follow' });
  const d3 = await res3.json();
  console.log(`3. v2.taxonomy.get: ${Date.now() - t2} ms`);
  console.log(`   Companies: ${d3.companies?.length || d3.data?.companies?.length}, Branches: ${d3.branches?.length || d3.data?.branches?.length}`);
}

measure().catch(console.error);
