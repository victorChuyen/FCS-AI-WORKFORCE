import fs from 'fs';
import path from 'path';

const profilePath = 'D:/FCS-AI-WORKFORCE/THÔNG TIN LAO ĐỘNG FOXCONN FCS.xlsx/THÔNG TIN LAO ĐỘNG FCS/PROFILE.html';
const companyPath = 'D:/FCS-AI-WORKFORCE/THÔNG TIN LAO ĐỘNG FOXCONN FCS.xlsx/THÔNG TIN LAO ĐỘNG FCS/COMPANY.html';
const branchPath = 'D:/FCS-AI-WORKFORCE/THÔNG TIN LAO ĐỘNG FOXCONN FCS.xlsx/THÔNG TIN LAO ĐỘNG FCS/BRANCH.html';
const levelSalePath = 'D:/FCS-AI-WORKFORCE/THÔNG TIN LAO ĐỘNG FOXCONN FCS.xlsx/THÔNG TIN LAO ĐỘNG FCS/TRẠNG THÁI LVEL SALE.html';
const interviewStatusPath = 'D:/FCS-AI-WORKFORCE/THÔNG TIN LAO ĐỘNG FOXCONN FCS.xlsx/THÔNG TIN LAO ĐỘNG FCS/INTERVIEW STATUS.html';
const workingStatusPath = 'D:/FCS-AI-WORKFORCE/THÔNG TIN LAO ĐỘNG FOXCONN FCS.xlsx/THÔNG TIN LAO ĐỘNG FCS/WORKING STATUS .html';
const venPath = 'D:/FCS-AI-WORKFORCE/THÔNG TIN LAO ĐỘNG FOXCONN FCS.xlsx/THÔNG TIN LAO ĐỘNG FCS/VEN.html';

console.log('================================================================');
console.log('🔍 AUDIT DỮ LIỆU THỰC TẾ KHÁCH HÀNG (GROUND-TRUTH CLIENT DATA)');
console.log('================================================================\n');

// 1. Audit PROFILE.html
if (fs.existsSync(profilePath)) {
  const content = fs.readFileSync(profilePath, 'utf8');
  const rows = content.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
  console.log(`📊 1. PROFILE.html: Tổng số dòng ghi nhận: ${rows.length} (Gồm 1 Header + ${rows.length - 1} dòng dữ liệu thực)`);

  if (rows.length > 0) {
    const ths = rows[0].match(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi) || [];
    console.log(`\n📋 Danh sách ${ths.length} Cột trong PROFILE.html gốc của khách hàng:`);
    const headerCols = ths.map((th, i) => {
      const colName = th.replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
      console.log(`   Col ${String(i + 1).padStart(2, ' ')}: "${colName}"`);
      return colName;
    });

    // Sample Row 1
    if (rows.length > 1) {
      console.log('\n📝 Dữ liệu mẫu dòng 1 (Record 1):');
      const tds = rows[1].match(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi) || [];
      tds.forEach((td, i) => {
        const val = td.replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
        if (val) {
          console.log(`   [${headerCols[i] || 'Col ' + (i + 1)}]: ${val}`);
        }
      });
    }
  }
} else {
  console.error('❌ Không tìm thấy PROFILE.html');
}

// 2. Audit COMPANY.html
if (fs.existsSync(companyPath)) {
  const content = fs.readFileSync(companyPath, 'utf8');
  const rows = content.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
  console.log(`\n🏭 2. COMPANY.html: Tổng số công ty: ${rows.length - 1}`);
  rows.slice(1, 10).forEach(r => {
    const tds = r.match(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi) || [];
    const vals = tds.map(t => t.replace(/<[^>]+>/g, '').trim());
    console.log(`   - ${vals.join(' | ')}`);
  });
  if (rows.length > 11) console.log(`   ... và ${rows.length - 11} công ty khác.`);
}

// 3. Audit BRANCH.html
if (fs.existsSync(branchPath)) {
  const content = fs.readFileSync(branchPath, 'utf8');
  const rows = content.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
  console.log(`\n🏢 3. BRANCH.html: Tổng số chi nhánh: ${rows.length - 1}`);
  rows.slice(1).forEach(r => {
    const tds = r.match(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi) || [];
    const vals = tds.map(t => t.replace(/<[^>]+>/g, '').trim());
    console.log(`   - ${vals.join(' | ')}`);
  });
}

// 4. Audit TRẠNG THÁI LVEL SALE.html
if (fs.existsSync(levelSalePath)) {
  const content = fs.readFileSync(levelSalePath, 'utf8');
  const rows = content.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
  console.log(`\n📈 4. TRẠNG THÁI LVEL SALE.html: Tổng số trạng thái: ${rows.length - 1}`);
  rows.slice(1).forEach(r => {
    const tds = r.match(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi) || [];
    const vals = tds.map(t => t.replace(/<[^>]+>/g, '').trim());
    console.log(`   - ${vals.join(' | ')}`);
  });
}
