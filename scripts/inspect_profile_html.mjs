import fs from 'fs';

const profilePath = 'D:/FCS-AI-WORKFORCE/THÔNG TIN LAO ĐỘNG FOXCONN FCS.xlsx/THÔNG TIN LAO ĐỘNG FCS/PROFILE.html';
const content = fs.readFileSync(profilePath, 'utf8');
const rows = content.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];

// Headers from Row 3 (index 2)
const headerCells = rows[2].match(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi) || [];
const headers = headerCells.map(c => c.replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' '));

console.log(`Loaded ${headers.length} headers from row 3:`);
headers.forEach((h, i) => {
  if (h) console.log(`  Col ${i + 1}: ${h}`);
});

let validDataCount = 0;
for (let r = 4; r < rows.length; r++) {
  const cells = rows[r].match(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi) || [];
  const name = cells[3] ? cells[3].replace(/<[^>]+>/g, '').trim() : '';
  const cccd = cells[7] ? cells[7].replace(/<[^>]+>/g, '').trim() : '';
  const phone = cells[21] ? cells[21].replace(/<[^>]+>/g, '').trim() : '';
  if (name || cccd || phone) {
    validDataCount++;
    if (validDataCount <= 3) {
      console.log(`\n--- Real Record ${validDataCount} (HTML Row ${r + 1}) ---`);
      cells.forEach((cell, c) => {
        const text = cell.replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
        if (text && headers[c]) {
          console.log(`  ${headers[c]}: ${text}`);
        }
      });
    }
  }
}

console.log(`\nTotal valid worker records found in PROFILE.html: ${validDataCount}`);
