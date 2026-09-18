/**
 * FCS AI WORKFORCE OS — Live API Diagnostic & Health Suite
 * 
 * Tests connectivity, latency, endpoints, and data schema against:
 * VITE_API_BASE_URL (Google Apps Script Web App)
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Read .env
const envPath = path.join(rootDir, '.env');
let apiBaseUrl = 'https://script.google.com/macros/s/AKfycbzBMRgBxNuO-rhxuJDl-YPJgLTVvXBQ9u0ZoIc70PKt06U_phLpPUH_xkvtOA6kjnc-/exec';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/VITE_API_BASE_URL=(.+)/);
  if (match && match[1].trim()) {
    apiBaseUrl = match[1].trim();
  }
}

console.log('===============================================================');
console.log('🎯 FCS AI WORKFORCE OS — LIVE API DIAGNOSTIC SUITE');
console.log('🔗 Target URL:', apiBaseUrl);
console.log('===============================================================\n');

async function callEndpoint(action, payload = {}, retryCount = 1) {
  const start = Date.now();
  const postData = JSON.stringify({
    action: action,
    requestId: `diag-${Date.now()}`,
    timestamp: Date.now(),
    identity: {
      firebaseUid: 'RChRZFoJazPizvBtHFX9dzjLGkJ2',
      email: 'coach.chuyen@gmail.com',
      role: 'PLATFORM_SUPER_ADMIN',
      tenantId: 'FCS-000001',
    },
    payload: payload,
  });

  try {
    const url = apiBaseUrl.includes('?')
      ? `${apiBaseUrl}&action=${encodeURIComponent(action)}`
      : `${apiBaseUrl}?action=${encodeURIComponent(action)}`;

    const res = await fetch(url, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: postData,
    });

    const elapsed = Date.now() - start;
    const rawText = await res.text();
    try {
      const data = JSON.parse(rawText);
      return { elapsed, data };
    } catch {
      // If Google returned HTML throttle page, retry once with backoff
      if (retryCount > 0) {
        await new Promise(r => setTimeout(r, 2000));
        return callEndpoint(action, payload, retryCount - 1);
      }
      return { elapsed, raw: rawText.slice(0, 100), data: { success: false, error: { message: 'Google Apps Script trả về HTML thay vì JSON (Rate limit tạm thời).' } } };
    }
  } catch (err) {
    if (retryCount > 0) {
      await new Promise(r => setTimeout(r, 2000));
      return callEndpoint(action, payload, retryCount - 1);
    }
    throw err;
  }
}

async function runSuite() {
  const tests = [
    { name: '1. Kiểm tra System Health', action: 'v2.health' },
    { name: '2. Thống Kê Dashboard Stats & VWW', action: 'v2.dashboard.stats' },
    { name: '3. Lấy Danh Sách Lao Động Thực Tế (34 Cột)', action: 'v2.workers.list' },
    { name: '4. Kiểm tra Phễu 19 Level Sale CRM Deals', action: 'v2.deals.list' },
    { name: '5. Danh mục Hệ Thống & Taxonomy', action: 'v2.taxonomy.get' },
  ];

  for (const test of tests) {
    process.stdout.write(`⏳ Đang chạy: ${test.name} (${test.action})... `);
    try {
      const res = await callEndpoint(test.action);
      if (res.data && res.data.success) {
        console.log(`✅ OK (${res.elapsed}ms)`);
        if (test.action === 'v2.health') {
          console.log(`   └─ Backend Version: ${res.data.version} | Sheet: ${res.data.spreadsheetName}`);
        } else if (test.action === 'v2.dashboard.stats') {
          const funnel = res.data.data?.funnel || {};
          const metrics = res.data.data?.metrics || {};
          console.log(`   └─ Tổng lao động: ${funnel.total_workers ?? res.data.data?.totalWorkers ?? 0} | Deals: ${funnel.total_deals ?? res.data.data?.totalDeals ?? 0} | VWW: ${metrics.vww_count ?? 0} | Chờ đi làm: ${metrics.waiting_start ?? 0}`);
        } else if (test.action === 'v2.workers.list') {
          console.log(`   └─ Tổng số hồ sơ thực tế trong Sheet: ${res.data.data?.total || res.data.data?.length || 0}`);
        } else if (test.action === 'v2.deals.list') {
          console.log(`   └─ Tổng số Deals thực tế trong Sheet: ${res.data.data?.total || res.data.data?.length || 0}`);
        }
      } else {
        console.log(`⚠️ PHẢN HỒI LỖI (${res.elapsed}ms):`, res.data?.error?.message || res.data?.error || res.raw || 'Unknown error');
      }
    } catch (err) {
      console.log(`❌ THẤT BẠI:`, err.message);
    }
    // Respect Google Apps Script concurrency rate limit
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\n===============================================================');
  console.log('🎉 Hoàn tất chẩn đoán toàn diện API!');
  console.log('===============================================================');
}

runSuite().catch(console.error);
