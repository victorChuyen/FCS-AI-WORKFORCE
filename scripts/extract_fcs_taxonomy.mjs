import fs from 'fs';
import path from 'path';

const baseDir = path.join('D:', 'FCS-AI-WORKFORCE');
const allItems = fs.readdirSync(baseDir);
const folderName = allItems.find(f => f.includes('FOXCONN') || f.includes('THONG TIN') || f.includes('THÔNG TIN'));
const rootPath = path.join(baseDir, folderName);

// 1. Read BA docx
const docxFile = path.join(rootPath, 'BA_1.5_CRM_Quan_ly_Data_Tuyen_dung_FCS.docx');
console.log('Docx path:', docxFile);

// Extract text from docx (zip file -> word/document.xml)
import zlib from 'zlib';

// Simple unzip helper for docx
async function extractDocxText(filePath) {
  const content = fs.readFileSync(filePath);
  // Look for word/document.xml in buffer
  // Standard zip local file header signature: 0x04034b50
  let offset = 0;
  while (offset < content.length - 30) {
    if (content.readUInt32LE(offset) === 0x04034b50) {
      const nameLen = content.readUInt16LE(offset + 26);
      const extraLen = content.readUInt16LE(offset + 28);
      const compMethod = content.readUInt16LE(offset + 8);
      const compSize = content.readUInt32LE(offset + 18);
      const fileName = content.slice(offset + 30, offset + 30 + nameLen).toString('utf-8');
      
      if (fileName === 'word/document.xml') {
        const dataStart = offset + 30 + nameLen + extraLen;
        const compressedData = content.slice(dataStart, dataStart + compSize);
        let xmlStr = '';
        if (compMethod === 8) { // DEFLATE
          xmlStr = zlib.inflateRawSync(compressedData).toString('utf-8');
        } else {
          xmlStr = compressedData.toString('utf-8');
        }
        // Strip XML tags
        return xmlStr.replace(/<w:p[^>]*>/g, '\n')
                     .replace(/<[^>]+>/g, '')
                     .replace(/&lt;/g, '<')
                     .replace(/&gt;/g, '>')
                     .replace(/&amp;/g, '&')
                     .replace(/&quot;/g, '"');
      }
    }
    offset++;
  }
  return '';
}

// 2. Extract full taxonomy from 'Trạng thái của lao động và phân quyền.html'
const rbacPath = path.join(rootPath, 'Trạng thái của lao động và phân quyền.html');
const rbacHtml = fs.readFileSync(rbacPath, 'utf-8');
const trs = rbacHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];

console.log(`\n======================================================`);
console.log(`📋 TOÀN BỘ VÒNG ĐỜI VÀ TRẠNG THÁI LAO ĐỘNG FCS (THEO TÀI LIỆU CHUẨN)`);
console.log(`======================================================`);

let currentStage = '';
trs.forEach(tr => {
  const cells = (tr.match(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi) || [])
    .map(c => c.replace(/<[^>]+>/g, '').trim());
  const text = cells.filter(Boolean).join(' | ');
  if (text && !text.startsWith('Trạng thái |')) {
    console.log(text);
  }
});

// 3. Extract COMPANY & BRANCH detail
const compPath = path.join(rootPath, 'THÔNG TIN LAO ĐỘNG FCS', 'COMPANY.html');
const compHtml = fs.readFileSync(compPath, 'utf-8');
const compTrs = compHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
console.log(`\n======================================================`);
console.log(`🏢 DANH SÁCH 29 ĐỐI TÁC / NHÀ MÁY THỰC TẾ FCS CUNG ỨNG:`);
console.log(`======================================================`);
compTrs.slice(1).forEach(tr => {
  const cells = (tr.match(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi) || [])
    .map(c => c.replace(/<[^>]+>/g, '').trim());
  if (cells.length >= 3 && cells[1] && cells[2]) {
    console.log(`- [${cells[1]}] -> Đối tác: ${cells[2]}`);
  }
});

const branchPath = path.join(rootPath, 'THÔNG TIN LAO ĐỘNG FCS', 'BRANCH.html');
const branchHtml = fs.readFileSync(branchPath, 'utf-8');
const branchTrs = branchHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
console.log(`\n======================================================`);
console.log(`📍 CÁC VĂN PHÒNG TUYỂN DỤNG FCS (BRANCHES):`);
console.log(`======================================================`);
branchTrs.slice(1).forEach(tr => {
  const cells = (tr.match(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi) || [])
    .map(c => c.replace(/<[^>]+>/g, '').trim());
  if (cells.length >= 3 && cells[2]) {
    console.log(`- Văn phòng: ${cells[2]}`);
  }
});

// Print BA Docx
extractDocxText(docxFile).then(text => {
  console.log(`\n======================================================`);
  console.log(`📑 TRÍCH XUẤT TÀI LIỆU ĐẶC TẢ BA 1.5 CRM FCS:`);
  console.log(`======================================================`);
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  lines.slice(0, 80).forEach(l => console.log(l));
}).catch(console.error);
