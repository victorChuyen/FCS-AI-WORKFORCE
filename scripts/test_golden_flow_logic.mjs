import fetch from 'node-fetch';

const apiBaseUrl = 'https://script.google.com/macros/s/AKfycbyFHP51wW1sb_ES3iOx2Yltq--Isq-yr1JgUF4ysw6LE7ksX58VPoryHTFMA0R9nK1qmQ/exec';

async function callApi(action, payload = {}) {
  const postData = JSON.stringify({
    action,
    requestId: `test-${Date.now()}`,
    timestamp: Date.now(),
    identity: {
      firebaseUid: 'RChRZFoJazPizvBtHFX9dzjLGkJ2',
      email: 'coach.chuyen@gmail.com',
      role: 'PLATFORM_SUPER_ADMIN',
      tenantId: 'FCS-000001',
    },
    payload,
  });

  const url = `${apiBaseUrl}?action=${encodeURIComponent(action)}`;
  const res = await fetch(url, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: postData,
  });
  return res.json();
}

async function testGoldenFlow() {
  console.log('--- TESTING GOLDEN FLOW LOGIC ---');
  // 1. Fetch live deals
  const dealsRes = await callApi('v2.deals.list', { limit: 10 });
  console.log('Deals list success:', dealsRes.success, 'Total deals:', dealsRes.data?.length);

  const dealList = Array.isArray(dealsRes.data) ? dealsRes.data : ((dealsRes.data)?.deals || []);
  const targetDeal = dealList.find(d => d.level_sale_status !== 'L3' && d.level_sale_status !== 'L4') || dealList[0];

  if (!targetDeal) {
    console.error('No target deal found');
    return;
  }

  const dealId = targetDeal.deal_id || targetDeal.dealId;
  console.log(`Target deal: ${dealId}, current stage: ${targetDeal.level_sale_status}`);

  // Step 1: Move to L2.1
  console.log(`Moving ${dealId} to L2.1...`);
  const step1 = await callApi('v2.deal.move_stage', {
    deal_id: dealId,
    new_stage: 'L2.1',
    notes: 'Golden Flow Test Step 1: Đỗ phỏng vấn'
  });
  console.log('Step 1 result:', step1.success, step1.message || step1.error);

  // Step 2: Move to L3
  console.log(`Moving ${dealId} to L3...`);
  const step2 = await callApi('v2.deal.move_stage', {
    deal_id: dealId,
    new_stage: 'L3',
    notes: 'Golden Flow Test Step 2: Bắt đầu đi làm VWW'
  });
  console.log('Step 2 result:', step2.success, step2.message || step2.error);

  console.log('✅ Golden Flow simulation executed successfully!');
}

testGoldenFlow().catch(console.error);
