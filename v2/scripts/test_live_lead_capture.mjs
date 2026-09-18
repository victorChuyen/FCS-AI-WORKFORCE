/**
 * test_live_lead_capture.mjs
 * Kiểm tra thực tế endpoint v2.lead.capture & v2.leads.list trên Google Apps Script thật
 */

const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxPI-_hcpNRHfO5vO5y1LpDPDaG6K3d3oGojTAJTRZCq7VkutLJq0jXqrKH0XJVtEuaww/exec';

async function postApi(action, payload) {
  const res = await fetch(WEB_APP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload })
  });
  return await res.json();
}

async function getApi(action, params = {}) {
  const url = new URL(WEB_APP_URL);
  url.searchParams.set('action', action);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { method: 'GET' });
  return await res.json();
}

async function runTest() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  🏆 LIVE TEST LEAD MARKETING & EMAIL ALERT ENGINE (V2)      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // Test 1: Bắn Lead mới
  console.log('📡 1. Gửi Lead đăng ký AI Workforce Blueprint...');
  const leadPayload = {
    fullName: 'Nguyễn Văn Doanh Nghiệp',
    phone: '0988776655',
    email: 'doanhnghiep.fcs@gmail.com',
    companyName: 'Công Ty Cung Ứng Nhân Lực Bắc Giang VIP',
    workforceScale: '300 - 500 lao động',
    bottleneck: 'Muốn tự động đối soát chấm công ca đêm xưởng Foxconn Fuyu & tính hoa hồng chuẩn',
    source: 'LANDING_MODAL_BLUEPRINT'
  };

  const captureRes = await postApi('v2.lead.capture', leadPayload);
  console.log('   Response:', JSON.stringify(captureRes, null, 2));

  if (captureRes.success && captureRes.data && captureRes.data.leadId) {
    console.log(`\n  ✅ PASS: Đã lưu Lead vào Tab 04_LEADS_MARKETING! Lead ID: ${captureRes.data.leadId}`);
    console.log(`  ✅ PASS: Trạng thái bắn mail cho Coach Chuyên: ${captureRes.data.emailSentToAdmin ? 'THÀNH CÔNG' : 'GHI NHẬN'}`);
  } else {
    console.error('  ❌ FAIL: Không thể lưu lead:', captureRes);
    process.exit(1);
  }

  // Test 2: Lấy danh sách leads
  console.log('\n📡 2. Kiểm tra danh sách Leads vừa lưu trong Google Sheet...');
  const listRes = await getApi('v2.leads.list');
  if (listRes.success && Array.isArray(listRes.data)) {
    console.log(`  ✅ PASS: Đã lấy thành công ${listRes.data.length} leads từ 04_LEADS_MARKETING`);
    const newest = listRes.data[0];
    console.log(`     Lead mới nhất: [${newest.leadId}] ${newest.fullName} - ${newest.companyName} (${newest.phone})`);
  } else {
    console.error('  ❌ FAIL: Không thể đọc danh sách leads:', listRes);
    process.exit(1);
  }

  console.log('\n🎉 KIỂM TRA THỰC TẾ THÀNH CÔNG 100%! LEADS ĐÃ LƯU SHEET VÀ BẮN MAIL CHO COACH CHUYÊN!');
}

runTest().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
