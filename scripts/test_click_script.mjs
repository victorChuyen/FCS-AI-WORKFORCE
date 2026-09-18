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
    // 1. Click Add button
    await evalCode(`
      (function() {
        var btn = Array.from(document.querySelectorAll('button, [role="button"]')).find(b => b.getAttribute('aria-label') === 'Thêm một tệp');
        if (btn) btn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 600));

    // 2. Click 'Script'
    await evalCode(`
      (function() {
        var el = Array.from(document.querySelectorAll('span.z80M1, div.jO7h3c')).find(e => e.innerText.trim() === 'Script');
        if (el) el.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 800));

    // 3. Find input in sidebar
    const inputInfo = await evalCode(`
      (function() {
        var inputs = Array.from(document.querySelectorAll('input')).map(i => ({
          tagName: i.tagName,
          className: i.className,
          placeholder: i.placeholder,
          value: i.value,
          id: i.id
        }));
        return {
          activeElement: {
            tagName: document.activeElement.tagName,
            className: document.activeElement.className,
            value: document.activeElement.value
          },
          allInputs: inputs
        };
      })()
    `);
    console.log('Input info:', inputInfo);

    ws.close();
  });
}
main().catch(console.error);
