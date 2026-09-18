import WebSocket from 'ws';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const editorTab = tabs.find(t => t.url.includes('script.google.com') && t.url.includes('1qJJxG_Q6QUZ'));

  if (!editorTab) {
    console.error('Editor tab not found');
    return;
  }

  console.log('Connected to Apps Script Editor:', editorTab.title);
  const ws = new WebSocket(editorTab.webSocketDebuggerUrl);

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
      console.log('1. Clicking Triển khai dropdown button in header...');
      const clickRes = await evalCode(`
        (function() {
          var btn = document.querySelector('div[role="button"].Gn5yxe') || 
                    Array.from(document.querySelectorAll('div[role="button"]')).find(b => b.innerText && b.innerText.includes('Triển khai'));
          if (btn) {
            btn.click();
            return { success: true, text: btn.innerText.trim() };
          }
          return { success: false, error: "Not found" };
        })()
      `);
      console.log('   Result:', clickRes);
      await sleep(1000);

      console.log('2. Clicking "Quản lý các tùy chọn triển khai"...');
      const menuRes = await evalCode(`
        (function() {
          var items = Array.from(document.querySelectorAll('[role="menuitem"], span, div')).filter(el => {
            return el.innerText && el.innerText.includes('Quản lý các tùy chọn triển khai');
          });
          if (items.length > 0) {
            items[items.length - 1].click();
            return { success: true, text: items[items.length - 1].innerText.trim() };
          }
          return { success: false, error: "Menu item not found" };
        })()
      `);
      console.log('   Result:', menuRes);
      await sleep(2000);

      console.log('3. Inspecting deployment dialog...');
      const dialogInfo = await evalCode(`
        (function() {
          var dialog = document.querySelector('[role="dialog"], [aria-modal="true"]');
          if (!dialog) return { open: false };
          var buttons = Array.from(dialog.querySelectorAll('button, div[role="button"]')).map(b => ({
            text: b.innerText ? b.innerText.trim() : "",
            ariaLabel: b.getAttribute('aria-label')
          }));
          return {
            open: true,
            title: dialog.querySelector('h1, h2, [role="heading"]')?.innerText,
            buttons: buttons
          };
        })()
      `);
      console.log('   Dialog info:', JSON.stringify(dialogInfo, null, 2));

      // Click edit pencil icon
      console.log('4. Clicking Edit (Pencil icon)...');
      const editRes = await evalCode(`
        (function() {
          var dialog = document.querySelector('[role="dialog"], [aria-modal="true"]');
          if (!dialog) return { success: false, error: "No dialog" };
          var editBtn = dialog.querySelector('[aria-label*="Chỉnh sửa"], [aria-label*="Edit"]') ||
                        Array.from(dialog.querySelectorAll('button, div[role="button"]')).find(b => {
                          var t = (b.innerText || b.getAttribute('aria-label') || '');
                          return t.includes('edit') || t.includes('Chỉnh sửa') || t.includes('Sửa');
                        });
          if (editBtn) {
            editBtn.click();
            return { success: true, text: editBtn.innerText || editBtn.getAttribute('aria-label') };
          }
          return { success: false, error: "Edit button not found" };
        })()
      `);
      console.log('   Edit result:', editRes);
      await sleep(1500);

      // Select "Phiên bản mới"
      console.log('5. Selecting "Phiên bản mới" (New version)...');
      const verRes = await evalCode(`
        (function() {
          var dialog = document.querySelector('[role="dialog"], [aria-modal="true"]');
          if (!dialog) return { success: false, error: "No dialog" };
          var selects = Array.from(dialog.querySelectorAll('[role="combobox"], [role="listbox"], select, .VfPpkd-O12Hhd'));
          // Find version dropdown
          var verSelect = selects.find(s => s.innerText && (s.innerText.includes('Phiên bản') || s.innerText.includes('Version')));
          if (verSelect) {
            verSelect.click();
            return { success: true, text: verSelect.innerText };
          }
          return { success: false, error: "Version select not found", count: selects.length };
        })()
      `);
      console.log('   Version select result:', verRes);
      await sleep(1000);

      // Click "Phiên bản mới" option in list
      const newVerOption = await evalCode(`
        (function() {
          var options = Array.from(document.querySelectorAll('[role="option"], li, div')).filter(el => {
            return el.innerText && el.innerText.trim() === 'Phiên bản mới';
          });
          if (options.length > 0) {
            options[0].click();
            return { success: true, text: options[0].innerText.trim() };
          }
          return { success: false, error: "New version option not found" };
        })()
      `);
      console.log('   New version option result:', newVerOption);
      await sleep(1000);

      // Click "Triển khai" button in dialog
      console.log('6. Clicking "Triển khai" inside dialog to confirm update...');
      const confirmRes = await evalCode(`
        (function() {
          var dialog = document.querySelector('[role="dialog"], [aria-modal="true"]');
          if (!dialog) return { success: false, error: "No dialog" };
          var deployBtn = Array.from(dialog.querySelectorAll('button')).find(b => {
            var t = b.innerText.trim();
            return t === 'Triển khai' || t === 'Deploy' || t === 'Lưu' || t === 'Save';
          });
          if (deployBtn) {
            deployBtn.click();
            return { success: true, text: deployBtn.innerText.trim() };
          }
          return { success: false, error: "Confirm deploy button not found" };
        })()
      `);
      console.log('   Confirm result:', confirmRes);
      await sleep(3000);

      // Check final modal result
      const finalDialog = await evalCode(`
        (function() {
          var dialog = document.querySelector('[role="dialog"], [aria-modal="true"]');
          if (!dialog) return "Dialog closed";
          var links = Array.from(dialog.querySelectorAll('a, [href*="/exec"]')).map(a => a.href);
          var buttons = Array.from(dialog.querySelectorAll('button')).map(b => b.innerText.trim());
          var doneBtn = Array.from(dialog.querySelectorAll('button')).find(b => b.innerText.trim() === 'Xong' || b.innerText.trim() === 'Done');
          if (doneBtn) doneBtn.click();
          return {
            title: dialog.querySelector('h1, h2')?.innerText,
            body: dialog.innerText.slice(0, 300),
            links: links,
            buttons: buttons
          };
        })()
      `);
      console.log('   Final dialog info:', JSON.stringify(finalDialog, null, 2));

      ws.close();
    } catch (err) {
      console.error('Error during deployment:', err);
      ws.close();
    }
  });
}

main().catch(console.error);
