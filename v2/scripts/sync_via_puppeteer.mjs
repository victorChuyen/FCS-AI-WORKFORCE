/**
 * ==============================================================================
 * FCS AI WORKFORCE V2 — SYNC ALL FILES TO APPS SCRIPT VIA PUPPETEER
 * Tự động mở Apps Script Editor, tạo file mới và paste code vào
 * ==============================================================================
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.join(__dirname, '..', 'backend');

const SCRIPT_URL = 'https://script.google.com/u/0/home/projects/1qJJxG_Q6QUZys6BUPhdVdk7DqNFOxSQTy6BRA85R2J50eoMwG-fCp0lP/edit';

// Danh sách file cần đồng bộ (thứ tự quan trọng)
const FILES_TO_SYNC = [
  '00_Config.gs',
  '01_Router.gs',
  '02_WorkerService.gs',
  '03_DealService.gs',
  '04_TaxonomyService.gs',
  '05_SecurityService.gs',
  '06_ValidationService.gs',
  '07_AuditService.gs'
];

// Các file hiện CHƯA CÓ trên Apps Script editor (cần tạo mới)
const FILES_TO_CREATE = ['07_AuditService.gs'];

// Các file đã có nhưng cần update nội dung
const FILES_TO_UPDATE = [
  '00_Config.gs',
  '01_Router.gs',
  '02_WorkerService.gs',
  '03_DealService.gs',
  '04_TaxonomyService.gs',
  '05_SecurityService.gs',
  '06_ValidationService.gs'
];

async function main() {
  console.log('🚀 Bắt đầu đồng bộ V2 Backend lên Apps Script Editor...\n');

  // Kết nối browser đang chạy qua CDP
  const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:9222',
    defaultViewport: null
  });

  const pages = await browser.pages();
  let editorPage = null;
  
  for (const page of pages) {
    const url = await page.url();
    if (url.includes('script.google.com') && url.includes('1qJJxG_Q6QUZ')) {
      editorPage = page;
      break;
    }
  }

  if (!editorPage) {
    console.error('❌ Không tìm thấy tab Apps Script Editor! Hãy mở editor trước.');
    await browser.disconnect();
    return;
  }

  console.log('✅ Đã kết nối tab Apps Script Editor');
  await editorPage.bringToFront();
  await sleep(1000);

  // 1. Tạo file mới (nếu chưa có)
  for (const fileName of FILES_TO_CREATE) {
    const baseName = fileName.replace('.gs', '');
    console.log(`\n📝 Tạo file mới: ${baseName}`);
    
    // Click nút "+" để thêm file
    try {
      // Tìm nút thêm file
      await editorPage.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const addBtn = buttons.find(b => 
          b.getAttribute('aria-label')?.includes('Thêm') || 
          b.getAttribute('aria-label')?.includes('Add')
        );
        if (addBtn) addBtn.click();
      });
      await sleep(1000);

      // Click "Tệp tập lệnh" (Script)
      await editorPage.evaluate(() => {
        const items = Array.from(document.querySelectorAll('[role="menuitem"], [role="option"], li'));
        const scriptItem = items.find(i => 
          i.textContent.includes('Tệp tập lệnh') || 
          i.textContent.includes('Script')
        );
        if (scriptItem) scriptItem.click();
      });
      await sleep(1000);

      // Nhập tên file
      await editorPage.keyboard.type(baseName, { delay: 50 });
      await sleep(500);
      await editorPage.keyboard.press('Enter');
      await sleep(2000);

      console.log(`  ✅ File ${baseName}.gs đã tạo`);
    } catch (err) {
      console.log(`  ⚠️ Lỗi tạo file: ${err.message}`);
    }
  }

  // 2. Update nội dung cho tất cả file
  for (const fileName of FILES_TO_SYNC) {
    const baseName = fileName.replace('.gs', '');
    const filePath = path.join(backendDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️ Bỏ qua ${fileName} (không tìm thấy trên local)`);
      continue;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`\n📄 Đồng bộ nội dung: ${baseName} (${content.split('\n').length} lines)`);

    try {
      // Click vào file trong sidebar
      await editorPage.evaluate((name) => {
        const items = Array.from(document.querySelectorAll('[role="treeitem"], [role="option"], .file-item'));
        const target = items.find(i => i.textContent.includes(name));
        if (target) target.click();
      }, baseName);
      await sleep(1500);

      // Focus editor, select all, paste
      await editorPage.evaluate((code) => {
        // Sử dụng Monaco API nếu có
        if (window.monaco && window.monaco.editor) {
          const models = window.monaco.editor.getModels();
          if (models.length > 0) {
            const activeModel = models.find(m => m.uri.toString().includes('active')) || models[models.length - 1];
            activeModel.setValue(code);
          }
        }
      }, content);
      await sleep(500);

      // Ctrl+S để save
      await editorPage.keyboard.down('Control');
      await editorPage.keyboard.press('s');
      await editorPage.keyboard.up('Control');
      await sleep(2000);

      console.log(`  ✅ Đã đồng bộ ${baseName}`);
    } catch (err) {
      console.log(`  ⚠️ Lỗi đồng bộ ${baseName}: ${err.message}`);
    }
  }

  console.log('\n🎉 Hoàn tất đồng bộ V2 Backend!');
  await browser.disconnect();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(console.error);
