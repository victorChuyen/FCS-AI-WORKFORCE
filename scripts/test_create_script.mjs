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
    // 1. Click Add File button
    await evalCode(`
      (function() {
        var btn = Array.from(document.querySelectorAll('button, [role="button"]')).find(b => b.getAttribute('aria-label') === 'Thêm một tệp');
        if (btn) btn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 500));

    // 2. Click 'Script' menuitem
    const clickedScript = await evalCode(`
      (function() {
        var items = Array.from(document.querySelectorAll('[role="menuitem"], .goog-menuitem')).filter(m => m.innerText.trim() === 'Script');
        if (items.length > 0) {
          items[items.length - 1].click();
          return true;
        }
        return false;
      })()
    `);
    console.log('Clicked Script menu item:', clickedScript);
    await new Promise(r => setTimeout(r, 600));

    // 3. Inspect active input
    const inputState = await evalCode(`
      (function() {
        var active = document.activeElement;
        return {
          tagName: active.tagName,
          className: active.className,
          placeholder: active.placeholder,
          value: active.value
        };
      })()
    `);
    console.log('Active element for file name:', inputState);

    ws.close();
  });
}
main().catch(console.error);
