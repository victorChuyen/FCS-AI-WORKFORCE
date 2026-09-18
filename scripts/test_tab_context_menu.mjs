import WebSocket from 'ws';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const sheetTab = tabs.find(t => t.url.includes('docs.google.com/spreadsheets') && t.url.includes('1YAVNiPtAiYrxEThvIgWuR0PAHJbDCDqrXCz5SNwrxXE'));

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
      console.log('Right-clicking on 12_AUDIT_LOG tab...');
      const res = await evalCode(`
        (function() {
          var tabs = Array.from(document.querySelectorAll('.docs-sheet-tab'));
          var auditTab = tabs.find(t => t.innerText.includes('12_AUDIT_LOG'));
          if (!auditTab) return { success: false, error: "Tab not found" };

          // Dispatch right click (contextmenu)
          var ev = new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            view: window,
            button: 2,
            buttons: 2
          });
          auditTab.dispatchEvent(ev);
          return { success: true };
        })()
      `);
      console.log('Right click result:', res);
      await sleep(500);

      // Check context menu items
      const menuItems = await evalCode(`
        (function() {
          var items = Array.from(document.querySelectorAll('.goog-menuitem, [role="menuitem"]')).map(el => ({
            text: el.innerText.trim(),
            className: el.className
          })).filter(x => x.text.length > 0);
          return items;
        })()
      `);
      console.log('Context menu items:', menuItems);

      ws.close();
    } catch (e) {
      console.error(e);
      ws.close();
    }
  });
}

main().catch(console.error);
