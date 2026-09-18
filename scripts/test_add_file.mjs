import WebSocket from 'ws';

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const editorTab = tabs.find(t => t.url.includes('script.google.com') && t.url.includes('1qJJxG_Q6QUZ'));
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
    // Find the add file button
    const res = await evalCode(`
      (function() {
        var btn = Array.from(document.querySelectorAll('button, [role="button"]')).find(b => b.getAttribute('aria-label') === 'Thêm một tệp');
        if (btn) {
          btn.click();
          return { clicked: true };
        }
        return { clicked: false };
      })()
    `);
    console.log('Clicked add button:', res);

    await new Promise(r => setTimeout(r, 600));

    // Check what popup or menu appeared
    const menuItems = await evalCode(`
      (function() {
        var items = Array.from(document.querySelectorAll('[role="menuitem"], .goog-menuitem, .popup-menu-item')).map(m => m.innerText.trim());
        return items;
      })()
    `);
    console.log('Menu items after click:', menuItems);

    ws.close();
  });
}
main().catch(console.error);
