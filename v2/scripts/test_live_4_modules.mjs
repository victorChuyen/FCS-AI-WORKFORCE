/**
 * test_live_4_modules.mjs
 * Kiểm thử toàn diện 4 module thực chiến trên Web App V2 Version 6
 */

const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbyFHP51wW1sb_ES3iOx2Yltq--Isq-yr1JgUF4ysw6LE7ksX58VPoryHTFMA0R9nK1qmQ/exec';

async function runTests() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  🏆 LIVE TEST 4 MODULES THỰC CHIẾN — APPS SCRIPT V2 (VER 6)   ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  let pass = 0;
  let fail = 0;

  async function checkGet(name, action, validateFn) {
    try {
      const res = await fetch(`${WEBAPP_URL}?action=${action}`, { redirect: 'follow' });
      const json = await res.json();
      if (validateFn(json)) {
        console.log(`  ✅ PASS: [GET] ${name}`);
        pass++;
        return json;
      } else {
        console.error(`  ❌ FAIL: [GET] ${name}`, JSON.stringify(json).slice(0, 150));
        fail++;
        return null;
      }
    } catch (err) {
      console.error(`  ❌ ERROR: [GET] ${name} - ${err.message}`);
      fail++;
      return null;
    }
  }

  async function checkPost(name, action, payload, validateFn) {
    try {
      const res = await fetch(`${WEBAPP_URL}?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        redirect: 'follow'
      });
      const json = await res.json();
      if (validateFn(json)) {
        console.log(`  ✅ PASS: [POST] ${name}`);
        pass++;
        return json;
      } else {
        console.error(`  ❌ FAIL: [POST] ${name}`, JSON.stringify(json).slice(0, 150));
        fail++;
        return null;
      }
    } catch (err) {
      console.error(`  ❌ ERROR: [POST] ${name} - ${err.message}`);
      fail++;
      return null;
    }
  }

  // 1. Health Check
  await checkGet('v2.health (Version 6)', 'v2.health', res => res.success && res.version === '2.1.0');

  // 2. Module 10: Batch Import
  const testPhone = '098' + Math.floor(1000000 + Math.random() * 9000000);
  const testCccd = '00109' + Math.floor(1000000 + Math.random() * 9000000);
  const batchRes = await checkPost(
    'v2.batch.import (Nạp 2 ứng viên: 1 chuẩn, 1 rác)',
    'v2.batch.import',
    {
      default_company: 'FUYU',
      default_branch: 'BẮC GIANG',
      items: [
        {
          full_name: 'NGUYỄN VĂN AN THỰC CHIẾN',
          phone: testPhone,
          cccd: testCccd,
          gender: 'Nam',
          hometown: 'Hà Nam',
          target_company: 'FUYU',
          branch: 'BẮC GIANG'
        },
        {
          full_name: 'RÁC',
          phone: '123',
          cccd: 'abc',
          target_company: 'FUYU',
          branch: 'BẮC GIANG'
        }
      ]
    },
    res => res.success && res.data?.stats?.total_received === 2 && res.data?.stats?.invalid_c3_2_count === 1
  );

  const createdDealId = batchRes?.data?.created_deal_ids?.[0];

  // 3. Module 11: Field Dispatch Roster
  await checkGet(
    'v2.dispatch.roster (Lấy danh sách phỏng vấn xưởng)',
    'v2.dispatch.roster&company=FUYU',
    res => res.success && Array.isArray(res.data)
  );

  // 4. Module 11: Field Dispatch Check-in (Điểm danh ĐỖ phỏng vấn)
  if (createdDealId) {
    await checkPost(
      'v2.dispatch.checkin (Điểm danh PASSED -> L2.1)',
      'v2.dispatch.checkin',
      {
        deal_id: createdDealId,
        result: 'PASSED',
        dorm_info: 'KTX Quang Châu Phòng 302',
        start_date: '2026-09-20'
      },
      res => res.success && res.data?.to_stage === 'L2.1'
    );
  }

  // 5. Module 12: Attendance Matching (Đối soát chấm công xưởng -> VWW)
  await checkPost(
    'v2.attendance.match (Đối soát bảng công -> Kích hoạt VWW L4)',
    'v2.attendance.match',
    {
      threshold: 15,
      records: [
        {
          cccd: testCccd,
          full_name: 'NGUYỄN VĂN AN THỰC CHIẾN',
          company_code: 'FUYU',
          workdays: 22,
          month: '2026-09'
        }
      ]
    },
    res => res.success && res.data?.stats?.vww_newly_verified >= 1
  );

  // 6. Module 13: Settlement Report (Báo cáo doanh thu & hoa hồng VWW)
  await checkGet(
    'v2.settlement.report (Báo cáo doanh thu & hoa hồng L4)',
    'v2.settlement.report',
    res => res.success && res.data?.summary?.total_vww_count >= 1 && res.data?.summary?.total_factory_revenue > 0
  );

  // 7. Dashboard Stats Verification
  await checkGet(
    'v2.dashboard.stats (Telemetry KPI North Star VWW)',
    'v2.dashboard.stats',
    res => res.success && (res.data?.north_star_vww >= 1 || res.metrics?.north_star_vww >= 1)
  );

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`📊 TỔNG KẾT KIỂM THỬ LIVE 4 MODULES:`);
  console.log(`   🟢 PASS: ${pass} tests`);
  console.log(`   🔴 FAIL: ${fail} tests`);
  console.log('═══════════════════════════════════════════════════════════════');

  if (fail === 0) {
    console.log('🎉 4 MODULE THỰC CHIẾN ĐÃ HOẠT ĐỘNG HOÀN HẢO 100% TRÊN SHEET THẬT!\n');
  }
}

runTests().catch(console.error);
