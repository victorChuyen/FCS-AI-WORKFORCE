import fs from 'fs';
import path from 'path';

const baseDir = path.join('D:', 'FCS-AI-WORKFORCE');
const allItems = fs.readdirSync(baseDir);
const folderName = allItems.find(f => f.includes('FOXCONN') || f.includes('THONG TIN') || f.includes('THÔNG TIN'));
const rootPath = path.join(baseDir, folderName);
const fcsDataDir = path.join(rootPath, 'THÔNG TIN LAO ĐỘNG FCS');

console.log('FCS Data Dir:', fcsDataDir);

// 1. Analyze PROFILE.html headers and sample data
const profilePath = path.join(fcsDataDir, 'PROFILE.html');
const profileHtml = fs.readFileSync(profilePath, 'utf-8');

const trMatches = profileHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
console.log(`\n======================================================`);
console.log(`📋 1. CẤU TRÚC 34 CỘT CỦA BẢNG PROFILE (HỒ SƠ LAO ĐỘNG GỐC)`);
console.log(`Tổng số dòng dữ liệu: ${trMatches.length - 2}`);
console.log(`======================================================`);

// Row 2 usually has the actual column headers
if (trMatches.length > 1) {
  const headerTr = trMatches[1];
  const cells = (headerTr.match(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi) || [])
    .map(c => c.replace(/<[^>]+>/g, '').trim());
  
  cells.forEach((col, idx) => {
    console.log(`  Col ${idx + 1} (${String.fromCharCode(65 + (idx % 26))}${idx >= 26 ? 'A' : ''}): ${col}`);
  });
}

// Sample 5 records to see actual data format
console.log(`\n--- 5 DÒNG DỮ LIỆU THỰC TẾ ĐẦU TIÊN (BẢO MẬT CHE SĐT/CCCD) ---`);
for (let r = 2; r < Math.min(7, trMatches.length); r++) {
  const rowCells = (trMatches[r].match(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi) || [])
    .map(c => c.replace(/<[^>]+>/g, '').trim());
  console.log(`\n[Hồ sơ ${r - 1}]:`);
  console.log(`  Họ tên: ${rowCells[2]} | Giới tính: ${rowCells[4]} | Năm sinh: ${rowCells[5]}`);
  console.log(`  Bộ phận: ${rowCells[1]} | Quê quán: ${rowCells[10] || rowCells[11] || ''}`);
  console.log(`  Trạng thái: ${rowCells.slice(15, 25).filter(Boolean).join(' -> ')}`);
}

// 2. Analyze COMPANY.html (Khách hàng / Doanh nghiệp đối tác)
console.log(`\n======================================================`);
console.log(`🏢 2. DANH MỤC CÔNG TY / ĐỐI TÁC (COMPANY.html)`);
console.log(`======================================================`);
const compPath = path.join(fcsDataDir, 'COMPANY.html');
if (fs.existsSync(compPath)) {
  const compHtml = fs.readFileSync(compPath, 'utf-8');
  const compTrs = compHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
  for (let i = 1; i < compTrs.length; i++) {
    const cells = (compTrs[i].match(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi) || [])
      .map(c => c.replace(/<[^>]+>/g, '').trim());
    if (cells[1]) console.log(`  ${cells[0] || i}. ${cells[1]} ${cells[2] ? `(KCN: ${cells[2]})` : ''}`);
  }
}

// 3. Analyze BRANCH.html (Văn phòng / Chi nhánh)
console.log(`\n======================================================`);
console.log(`📍 3. DANH MỤC VĂN PHÒNG / CHI NHÁNH (BRANCH.html)`);
console.log(`======================================================`);
const branchPath = path.join(fcsDataDir, 'BRANCH.html');
if (fs.existsSync(branchPath)) {
  const branchHtml = fs.readFileSync(branchPath, 'utf-8');
  const branchTrs = branchHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
  for (let i = 1; i < branchTrs.length; i++) {
    const cells = (branchTrs[i].match(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi) || [])
      .map(c => c.replace(/<[^>]+>/g, '').trim());
    if (cells[1]) console.log(`  ${cells[0] || i}. Văn phòng: ${cells[1]}`);
  }
}

// 4. Analyze INTERVIEW STATUS.html & TRẠNG THÁI
console.log(`\n======================================================`);
console.log(`🎯 4. HỆ THỐNG TRẠNG THÁI PHỎNG VẤN & LEVEL SALE`);
console.log(`======================================================`);
const intPath = path.join(fcsDataDir, 'INTERVIEW STATUS.html');
if (fs.existsSync(intPath)) {
  const intHtml = fs.readFileSync(intPath, 'utf-8');
  const intTrs = intHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
  console.log('Trạng thái phỏng vấn:');
  for (let i = 1; i < intTrs.length; i++) {
    const cells = (intTrs[i].match(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi) || [])
      .map(c => c.replace(/<[^>]+>/g, '').trim());
    if (cells[1]) console.log(`  • ${cells[1]}`);
  }
}

// 5. Analyze Trạng thái của lao động và phân quyền.html
console.log(`\n======================================================`);
console.log(`🔐 5. MA TRẬN PHÂN QUYỀN THEO TRẠNG THÁI LAO ĐỘNG (RBAC)`);
console.log(`======================================================`);
const rbacPath = path.join(rootPath, 'Trạng thái của lao động và phân quyền.html');
if (fs.existsSync(rbacPath)) {
  const rbacHtml = fs.readFileSync(rbacPath, 'utf-8');
  const rbacTrs = rbacHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
  for (let i = 1; i < Math.min(25, rbacTrs.length); i++) {
    const cells = (rbacTrs[i].match(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi) || [])
      .map(c => c.replace(/<[^>]+>/g, '').trim());
    if (cells[0] && cells[1]) {
      console.log(`  [${cells[0]}] -> Phân quyền: ${cells[1]}`);
    }
  }
}
