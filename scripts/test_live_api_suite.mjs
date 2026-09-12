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

function callEndpoint(action, payload = {}) {
  return new Promise((resolve, reject) => {
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

    const req = https.request(apiBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
        'Content-Length': Buffer.byteLength(postData),
      },
    }, (res) => {
      // Follow redirect (Apps Script 302)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, (redirRes) => {
          let body = '';
          redirRes.on('data', d => body += d);
          redirRes.on('end', () => {
            const elapsed = Date.now() - start;
            try {
              resolve({ elapsed, data: JSON.parse(body) });
            } catch (e) {
              resolve({ elapsed, raw: body });
            }
          });
        });
        return;
      }
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        const elapsed = Date.now() - start;
        try {
          resolve({ elapsed, data: JSON.parse(body) });
        } catch (e) {
          resolve({ elapsed, raw: body });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runSuite() {
  const tests = [
    { name: '1. Kiểm tra System Health', action: 'system.health' },
    { name: '2. Tải Dashboard Summary & VWW', action: 'dashboard.summary' },
    { name: '3. Lấy Danh Sách Lao Động Thực Tế', action: 'worker.list' },
    { name: '4. Kiểm tra Hàng Đợi Xử Lý (Action Queue)', action: 'action.list' },
    { name: '5. Kiểm tra Đối Soát Chấm Công (Matching List)', action: 'matching.list' },
  ];

  for (const test of tests) {
    process.stdout.write(`⏳ Đang chạy: ${test.name} (${test.action})... `);
    try {
      const res = await callEndpoint(test.action);
      if (res.data && res.data.success) {
        console.log(`✅ OK (${res.elapsed}ms)`);
        if (test.action === 'system.health') {
          console.log(`   └─ Backend Version: ${res.data.data.version} | Sheet: ${res.data.data.spreadsheet}`);
        } else if (test.action === 'dashboard.summary') {
          console.log(`   └─ North Star VWW: ${res.data.data.northStar?.value} | Tổng lao động: ${res.data.data.metrics?.totalWorkers}`);
        } else if (test.action === 'worker.list') {
          console.log(`   └─ Tổng số hồ sơ thực tế trong Sheet: ${res.data.data.total || res.data.data.items?.length}`);
        }
      } else {
        console.log(`⚠️ PHẢN HỒI LỖI (${res.elapsed}ms):`, res.data?.error?.message || res.raw || 'Unknown error');
      }
    } catch (err) {
      console.log(`❌ THẤT BẠI:`, err.message);
    }
  }

  console.log('\n===============================================================');
  console.log('🎉 Hoàn tất chẩn đoán toàn diện API!');
  console.log('===============================================================');
}

runSuite().catch(console.error);
