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
      console.log('Clicking dropdown arrow on 12_AUDIT_LOG...');
      const res = await evalCode(`
        (function() {
          var tabs = Array.from(document.querySelectorAll('.docs-sheet-tab'));
          var auditTab = tabs.find(t => t.innerText.includes('12_AUDIT_LOG'));
          if (!auditTab) return "Tab not found";
          var dropdown = auditTab.querySelector('.docs-sheet-tab-dropdown, .goog-inline-block');
          if (dropdown) {
            dropdown.click();
            return { clicked: "dropdown" };
          }
          auditTab.click();
          return { clicked: "tab" };
        })()
      `);
      console.log('Click result:', res);
      await sleep(1000);

      const visibleMenu = await evalCode(`
        (function() {
          var menus = Array.from(document.querySelectorAll('.goog-menu')).filter(m => m.style.display !== 'none' && m.innerText.includes('Đổi tên'));
          if (menus.length > 0) {
            return Array.from(menus[0].querySelectorAll('.goog-menuitem')).map(i => i.innerText.trim());
          }
          return "No menu with Đổi tên found";
        })()
      `);
      console.log('Visible menu:', visibleMenu);

      ws.close();
    } catch (e) {
      console.error(e);
      ws.close();
    }
  });
}

main().catch(console.error);
