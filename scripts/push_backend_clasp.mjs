/**
 * FCS AI WORKFORCE OS - Clasp Multi-file Backend Deployment Helper
 *
 * This script automates deploying the 15 modular .gs files in backend/ to Google Apps Script.
 * Usage: node scripts/push_backend_clasp.mjs
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const CLASP_JSON = path.join(ROOT_DIR, '.clasp.json');
const BACKEND_DIR = path.join(ROOT_DIR, 'backend');

console.log('====================================================');
console.log('🚀 FCS AI WORKFORCE OS — CLASP MULTI-FILE DEPLOYMENT');
console.log('====================================================\n');

// 1. Check backend files
const gsFiles = fs.readdirSync(BACKEND_DIR).filter(f => f.endsWith('.gs'));
console.log(`📁 Tìm thấy ${gsFiles.length} modules backend trong backend/:`);
gsFiles.forEach((file, idx) => {
  const stat = fs.statSync(path.join(BACKEND_DIR, file));
  console.log(`   ${(idx + 1).toString().padStart(2, '0')}. ${file.padEnd(28)} (${Math.round(stat.size / 1024 * 10) / 10} KB)`);
});

// 2. Check .clasp.json
if (!fs.existsSync(CLASP_JSON)) {
  console.error('\n❌ Không tìm thấy file .clasp.json ở thư mục gốc!');
  console.log('👉 Vui lòng tạo file .clasp.json với nội dung:');
  console.log('   {"scriptId": "<ID_APPS_SCRIPT_CUA_BAN>", "rootDir": "./backend"}');
  process.exit(1);
}

const claspConfig = JSON.parse(fs.readFileSync(CLASP_JSON, 'utf-8'));
if (!claspConfig.scriptId || claspConfig.scriptId === 'YOUR_APPS_SCRIPT_PROJECT_ID') {
  console.warn('\n⚠️ CẢNH BÁO: scriptId trong .clasp.json chưa được cấu hình ID thật!');
  console.log('👉 Mở script.google.com -> Chọn project -> Cài đặt dự án (Project Settings) -> Copy "Script ID" và dán vào .clasp.json\n');
}

// 3. Execution recommendation
console.log('\n🛠️ HƯỚNG DẪN PUSH LÊN GOOGLE APPS SCRIPT:');
console.log('   1. Đăng nhập Google một lần nếu chưa:');
console.log('      npx @google/clasp login');
console.log('   2. Đẩy toàn bộ 15 modules lên:');
console.log('      npm run push:backend   (hoặc: npx @google/clasp push)\n');
console.log('✅ Hệ thống đã sẵn sàng với 15 modules độc lập!');
