import fs from 'fs';
import path from 'path';

const baseDir = path.join('D:', 'FCS-AI-WORKFORCE');
// Find the exact folder name
const allItems = fs.readdirSync(baseDir);
const folderName = allItems.find(f => f.includes('FOXCONN') || f.includes('THONG TIN') || f.includes('THÔNG TIN'));

console.log('Target folder:', folderName);
const fullPath = path.join(baseDir, folderName);

// List all files in fullPath
function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(filePath));
    } else {
      results.push({ path: filePath, name: file, size: stat.size });
    }
  });
  return results;
}

const files = walkDir(fullPath);
console.log('\n=== TẬP TIN DỮ LIỆU THỰC TẾ KHÁCH HÀNG FCS ===');
files.forEach(f => {
  console.log(`- ${path.relative(fullPath, f.path)} (${(f.size / 1024).toFixed(1)} KB)`);
});

// Analyze HTML tables
const htmlFiles = files.filter(f => f.name.endsWith('.html') && !f.name.includes('sheet.css'));

htmlFiles.forEach(file => {
  console.log(`\n======================================================`);
  console.log(`📄 PHÂN TÍCH: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
  console.log(`======================================================`);
  
  const content = fs.readFileSync(file.path, 'utf-8');
  
  // Extract table headers (th or first tr td)
  const trMatches = content.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
  console.log(`Tổng số hàng: ${trMatches.length}`);

  if (trMatches.length > 0) {
    // Get headers
    const firstTr = trMatches[0];
    const cellMatches = firstTr.match(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi) || [];
    const headers = cellMatches.map(c => c.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
    console.log(`Cột (${headers.length}):`, headers.join(' | '));

    // Sample 2nd row
    if (trMatches.length > 1) {
      const secondTr = trMatches[1];
      const sampleCells = (secondTr.match(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi) || [])
        .map(c => c.replace(/<[^>]+>/g, '').trim());
      console.log('Mẫu dòng 1:', sampleCells.slice(0, 10).join(' | '));
    }
    if (trMatches.length > 2) {
      const thirdTr = trMatches[2];
      const sampleCells = (thirdTr.match(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi) || [])
        .map(c => c.replace(/<[^>]+>/g, '').trim());
      console.log('Mẫu dòng 2:', sampleCells.slice(0, 10).join(' | '));
    }
  }
});
