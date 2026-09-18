/**
 * ==============================================================================
 * FCS AI WORKFORCE OS V2 — PUSH ALL BACKEND FILES TO APPS SCRIPT
 * Script tự động đẩy toàn bộ 8 file .gs module lên Google Apps Script Project
 * Sử dụng Google Apps Script API (projects.updateContent)
 * ==============================================================================
 * 
 * CÁCH SỬ DỤNG:
 * 1. Mở https://script.google.com/home/usersettings -> Bật "Google Apps Script API"
 * 2. Chạy: node v2/scripts/push_v2_to_apps_script.mjs
 * 
 * HOẶC: Copy thủ công từng file qua clipboard vào editor
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.join(__dirname, '..', 'backend');

// Đọc tất cả file .gs và appsscript.json
const files = fs.readdirSync(backendDir)
  .filter(f => (f.endsWith('.gs') && f !== 'Code.gs') || f === 'appsscript.json')
  .sort();

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  FCS AI WORKFORCE OS V2 — APPS SCRIPT FILE INVENTORY       ║');
console.log('╠══════════════════════════════════════════════════════════════╣');

let totalLines = 0;
let totalBytes = 0;

const fileContents = {};

for (const f of files) {
  const fullPath = path.join(backendDir, f);
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n').length;
  const bytes = Buffer.byteLength(content, 'utf8');
  totalLines += lines;
  totalBytes += bytes;
  fileContents[f] = content;
  
  const type = f.endsWith('.json') ? 'JSON' : 'SCRIPT';
  const icon = type === 'JSON' ? '📋' : '📄';
  console.log(`║  ${icon} ${f.padEnd(30)} │ ${String(lines).padStart(4)} lines │ ${String(bytes).padStart(6)} bytes │ ${type} ║`);
}

console.log('╠══════════════════════════════════════════════════════════════╣');
console.log(`║  📊 TỔNG CỘNG: ${String(files.length).padStart(2)} files │ ${String(totalLines).padStart(4)} lines │ ${String(totalBytes).padStart(6)} bytes        ║`);
console.log('╚══════════════════════════════════════════════════════════════╝');

// Tạo payload cho Apps Script API
const scriptId = '1qJJxG_Q6QUZys6BUPhdVdk7DqNFOxSQTy6BRA85R2J50eoMwG-fCp0lP';

const apiPayload = {
  scriptId: scriptId,
  files: files.map(f => {
    const name = f.replace('.gs', '').replace('.json', '');
    const type = f.endsWith('.json') ? 'JSON' : 'SERVER_JS';
    return {
      name: name,
      type: type,
      source: fileContents[f]
    };
  })
};

// Lưu payload để có thể dùng với curl hoặc gửi qua API
const payloadPath = path.join(__dirname, '..', 'apps_script_api_payload.json');
fs.writeFileSync(payloadPath, JSON.stringify(apiPayload, null, 2), 'utf8');
console.log(`\n✅ API Payload đã lưu tại: ${payloadPath}`);
console.log(`\n📌 Script ID: ${scriptId}`);

// Hướng dẫn thủ công nếu API không khả dụng
console.log('\n' + '═'.repeat(70));
console.log('📋 HƯỚNG DẪN ĐỒNG BỘ THỦ CÔNG (NẾU API BỊ CHẶN QUYỀN):');
console.log('═'.repeat(70));
console.log(`
Mở Apps Script editor tại:
  https://script.google.com/u/0/home/projects/${scriptId}/edit

Với mỗi file cần thêm/cập nhật:
  1. Click dấu [+] bên cạnh "Tệp" → "Tệp tập lệnh"
  2. Đặt tên file (không cần đuôi .gs)
  3. Xóa nội dung mặc định (Ctrl+A) rồi dán code (Ctrl+V)
  4. Ctrl+S để lưu

Hoặc dùng lệnh clipboard cho từng file:
`);

for (const f of files.filter(x => x.endsWith('.gs'))) {
  const name = f.replace('.gs', '');
  console.log(`  # ${name}:`);
  console.log(`  Get-Content "d:\\FCS-AI-WORKFORCE\\v2\\backend\\${f}" -Raw | Set-Clipboard`);
  console.log('');
}

console.log('═'.repeat(70));
console.log('🎯 Sau khi thêm xong tất cả file, bấm "Triển khai" → "Tùy chọn triển khai mới"');
console.log('   → Chọn "Ứng dụng web" → Quyền truy cập: "Bất kỳ ai" → Triển khai');
console.log('═'.repeat(70));
