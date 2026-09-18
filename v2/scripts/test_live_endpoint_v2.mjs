/**
 * test_live_endpoint_v2.mjs
 * Live integration test against newly deployed Apps Script V2 Web App
 */

const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbyFHP51wW1sb_ES3iOx2Yltq--Isq-yr1JgUF4ysw6LE7ksX58VPoryHTFMA0R9nK1qmQ/exec';

async function runTests() {
  console.log('🚀 Bắt đầu kiểm tra LIVE Web App V2...\n');
  let pass = 0;
  let fail = 0;

  async function check(name, url, validateFn) {
    try {
      const res = await fetch(url, { redirect: 'follow' });
      const json = await res.json();
      const ok = validateFn(json);
      if (ok) {
        console.log(`  ✅ PASS: ${name}`);
        pass++;
      } else {
        console.error(`  ❌ FAIL: ${name}`, JSON.stringify(json).slice(0, 150));
        fail++;
      }
    } catch (err) {
      console.error(`  ❌ ERROR: ${name} - ${err.message}`);
      fail++;
    }
  }

  // 1. Health
  await check('v2.health Check', `${WEBAPP_URL}?action=v2.health`, data => data.success && data.version === '2.1.0');

  // 2. Taxonomy
  await check('v2.taxonomy.get (Companies & Branches)', `${WEBAPP_URL}?action=v2.taxonomy.get`, data => data.success && data.companies?.length >= 25 && data.branches?.length >= 8);

  // 3. Workers List
  await check('v2.workers.list', `${WEBAPP_URL}?action=v2.workers.list&limit=10`, data => data.success && Array.isArray(data.data ?? data.items));

  // 4. Deals List
  await check('v2.deals.list', `${WEBAPP_URL}?action=v2.deals.list&limit=10`, data => data.success && Array.isArray(data.data ?? data.items));

  // 5. Dashboard Stats
  await check('v2.dashboard.stats', `${WEBAPP_URL}?action=v2.dashboard.stats`, data => data.success && (data.data || data.stats));

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`📊 KẾT QUẢ KIỂM THỬ LIVE V2 WEB APP:`);
  console.log(`   🟢 PASS: ${pass} tests`);
  console.log(`   🔴 FAIL: ${fail} tests`);
  console.log('═══════════════════════════════════════════════════════════════');
}

runTests().catch(console.error);
