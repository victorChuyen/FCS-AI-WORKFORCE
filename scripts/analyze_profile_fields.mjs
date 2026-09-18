import fs from 'fs';
import path from 'path';

const p = path.join('D:', 'FCS-AI-WORKFORCE', 'THÔNG TIN LAO ĐỘNG FOXCONN FCS.xlsx', 'THÔNG TIN LAO ĐỘNG FCS', 'PROFILE.html');
const html = fs.readFileSync(p, 'utf-8');
const trs = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];

console.log('Total rows in HTML:', trs.length);

for (let i = 0; i < 6; i++) {
  const cells = (trs[i].match(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi) || [])
    .map(c => c.replace(/<[^>]+>/g, '').trim());
  console.log(`\n--- Row ${i + 1} (${cells.length} cells) ---`);
  cells.forEach((c, idx) => {
    if (c) console.log(`  Col ${idx + 1}: ${c}`);
  });
}

// Sample non-empty rows
let validCount = 0;
const companyCount = {};
const provinces = {};
const recruiters = {};

for (let r = 2; r < trs.length; r++) {
  const cells = (trs[r].match(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi) || [])
    .map(c => c.replace(/<[^>]+>/g, '').trim());
  
  // Find name: could be at index 2 or 3
  const name = cells[3] || cells[2];
  if (name && name !== 'full_name' && name !== 'HỌ TÊNFull name' && !name.includes('điền')) {
    validCount++;
    const comp = cells[1] || 'Chưa phân';
    if (comp) companyCount[comp] = (companyCount[comp] || 0) + 1;
    const prov = cells[11] || cells[12] || cells[10];
    if (prov) {
      const pClean = prov.split(',').pop().trim();
      provinces[pClean] = (provinces[pClean] || 0) + 1;
    }
  }
}

console.log(`\nTổng số hồ sơ lao động thực tế có dữ liệu: ${validCount} hồ sơ`);
console.log('\nTop 10 Tỉnh/Thành phổ biến của người lao động:');
Object.entries(provinces).sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([p, c]) => {
  console.log(`  - ${p}: ${c} người`);
});

// Also print the 34 headers cleanly
console.log('\n--- DANH SÁCH TOÀN BỘ 34 TRƯỜNG DỮ LIỆU ĐẦY ĐỦ ---');
for (let i = 0; i < headers.length; i++) {
  console.log(`Cột ${i + 1}: ${headers[i] || '(Cột phụ/Trống)'}`);
}
