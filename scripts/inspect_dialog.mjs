import WebSocket from 'ws';

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const editorTab = tabs.find(t => t.url.includes('script.google.com') && t.url.includes('1qJJxG_Q6QUZ'));
  const ws = new WebSocket(editorTab.webSocketDebuggerUrl);

  function evalCode(expr) {
    return new Promise(resolve => {
      const id = Math.floor(Math.random() * 100000);
      const handler = data => {
        const res = JSON.parse(data);
        if (res.id === id) {
          ws.off('message', handler);
          resolve(res.result?.result?.value);
        }
      };
      ws.on('message', handler);
      ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true } }));
    });
  }

  ws.on('open', async () => {
    const dialogInfo = await evalCode(`
      (function() {
        var dialog = document.querySelector('[role="dialog"], [aria-modal="true"]');
        if (!dialog) return { open: false };
        var allButtons = Array.from(dialog.querySelectorAll('button, div[role="button"], [role="combobox"], [role="listbox"], input, select')).map(b => {
          var r = b.getBoundingClientRect();
          return {
            tag: b.tagName,
            role: b.getAttribute('role'),
            ariaLabel: b.getAttribute('aria-label'),
            text: b.innerText ? b.innerText.trim().slice(0, 50) : '',
            x: Math.round(r.left + r.width/2),
            y: Math.round(r.top + r.height/2),
            w: Math.round(r.width),
            h: Math.round(r.height),
            disabled: b.disabled || b.getAttribute('aria-disabled') === 'true'
          };
        });
        return { open: true, elements: allButtons };
      })()
    `);
    console.log(JSON.stringify(dialogInfo, null, 2));
    ws.close();
  });
}
main();
