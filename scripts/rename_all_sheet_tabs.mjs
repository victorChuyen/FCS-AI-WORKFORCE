import WebSocket from 'ws';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function renameTab(ws, evalCode, oldName, newName) {
  console.log(`\nRenaming tab "${oldName}" -> "${newName}"...`);

  // 1. Click dropdown on tab
  const openRes = await evalCode(`
    (function() {
      var tabs = Array.from(document.querySelectorAll('.docs-sheet-tab'));
      var targetTab = tabs.find(t => t.innerText.includes('${oldName}'));
      if (!targetTab) return { success: false, error: "Tab not found: ${oldName}" };

      var dropdown = targetTab.querySelector('.docs-sheet-tab-dropdown');
      if (dropdown) {
        dropdown.click();
        return { success: true };
      }
      return { success: false, error: "Dropdown arrow not found" };
    })()
  `);

  if (!openRes.success) {
    console.error('Failed to open menu:', openRes);
    return false;
  }
  await sleep(600);

  // 2. Click "Đổi tên"
  const clickRename = await evalCode(`
    (function() {
      var items = Array.from(document.querySelectorAll('.goog-menuitem')).filter(i => {
        return i.innerText && i.innerText.trim().startsWith('Đổi tên');
      });
      if (items.length > 0) {
        // Find the visible one
        var visibleItem = items.find(i => i.offsetParent !== null) || items[items.length - 1];
        visibleItem.click();
        return { success: true };
      }
      return { success: false, error: "Đổi tên item not found" };
    })()
  `);

  if (!clickRename.success) {
    console.error('Failed to click Đổi tên:', clickRename);
    return false;
  }
  await sleep(600);

  // 3. Find input or active element
  const inputRes = await evalCode(`
    (function() {
      var activeEl = document.activeElement;
      var inputs = Array.from(document.querySelectorAll('input, .docs-sheet-tab-name-input, [contenteditable="true"]'));
      var targetInput = inputs.find(inp => inp.offsetParent !== null) || activeEl;
      if (targetInput && (targetInput.tagName === 'INPUT' || targetInput.isContentEditable)) {
        targetInput.value = "${newName}";
        targetInput.dispatchEvent(new Event('input', { bubbles: true }));
        targetInput.dispatchEvent(new Event('change', { bubbles: true }));
        return { success: true, tag: targetInput.tagName };
      }
      return { success: false, error: "Input not found", activeTag: activeEl ? activeEl.tagName : null };
    })()
  `);

  console.log('   Input result:', inputRes);

  // 4. Press Enter via dispatchKeyEvent
  await new Promise(resolve => {
    ws.send(JSON.stringify({
      id: Math.floor(Math.random() * 100000),
      method: 'Input.dispatchKeyEvent',
      params: { type: 'keyDown', windowsVirtualKeyCode: 13, code: 'Enter', key: 'Enter' }
    }));
    setTimeout(() => {
      ws.send(JSON.stringify({
        id: Math.floor(Math.random() * 100000),
        method: 'Input.dispatchKeyEvent',
        params: { type: 'keyUp', windowsVirtualKeyCode: 13, code: 'Enter', key: 'Enter' }
      }));
      resolve();
    }, 100);
  });

  await sleep(1000);
  console.log(`✅ Finished renaming "${oldName}" -> "${newName}"`);
  return true;
}

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const sheetTab = tabs.find(t => t.url.includes('docs.google.com/spreadsheets') && t.url.includes('1YAVNiPtAiYrxEThvIgWuR0PAHJbDCDqrXCz5SNwrxXE'));

  if (!sheetTab) {
    console.error('Sheet tab not found');
    return;
  }

  const ws = new WebSocket(sheetTab.webSocketDebuggerUrl);

  function evalCode(expr) {
    return new Promise((resolve) => {
      const id = Math.floor(Math.random() * 100000);
      const handler = (data) => {
        const res = JSON.parse(data);
        if (res.id === id) {
          ws.off('message', handler);
          resolve(res.result?.result?.value);
        }
      };
      ws.on('message', handler);
      ws.send(JSON.stringify({
        id,
        method: 'Runtime.evaluate',
        params: { expression: expr, returnByValue: true }
      }));
    });
  }

  ws.on('open', async () => {
    try {
      // Rename in order:
      // 12_AUDIT_LOG -> 03_AUDIT_LOG
      // 05_CRM_DEALS_2026 -> 02_CRM_DEALS_2026
      // 04_MASTER_WORKERS -> 01_MASTER_WORKERS
      // COMPANY -> DM_COMPANY
      // BRANCH -> DM_BRANCH
      // LEVEL_SALE -> DM_LEVEL_SALE

      const renameMap = [
        { old: '12_AUDIT_LOG', new: '03_AUDIT_LOG' },
        { old: '05_CRM_DEALS_2026', new: '02_CRM_DEALS_2026' },
        { old: '04_MASTER_WORKERS', new: '01_MASTER_WORKERS' },
        { old: 'COMPANY', new: 'DM_COMPANY' },
        { old: 'BRANCH', new: 'DM_BRANCH' },
        { old: 'LEVEL_SALE', new: 'DM_LEVEL_SALE' }
      ];

      for (const item of renameMap) {
        await renameTab(ws, evalCode, item.old, item.new);
        await sleep(1500);
      }

      // Check current tabs
      const finalTabs = await evalCode(`
        (function() {
          return Array.from(document.querySelectorAll('.docs-sheet-tab')).map(t => t.innerText.trim());
        })()
      `);
      console.log('\n🎉 Final Tabs in Google Sheet:');
      console.log(finalTabs);

      ws.close();
    } catch (e) {
      console.error(e);
      ws.close();
    }
  });
}

main().catch(console.error);
