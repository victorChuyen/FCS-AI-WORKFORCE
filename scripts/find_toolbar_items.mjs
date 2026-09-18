import WebSocket from 'ws';

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const editorTab = tabs.find(t => t.url.includes('script.google.com') && t.url.includes('1qJJxG_Q6QUZ'));

  const ws = new WebSocket(editorTab.webSocketDebuggerUrl);

  ws.on('open', () => {
    ws.send(JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: {
        expression: `
          (function() {
            var runBtn = document.querySelector('[aria-label="Chạy hàm đã chọn"], [aria-label*="Chạy"], [aria-label*="Run"]');
            var toolbar = runBtn.closest('[role="toolbar"], div');
            while (toolbar && toolbar.children.length < 5) {
              toolbar = toolbar.parentElement;
            }
            if (!toolbar) return "No toolbar container";
            return Array.from(toolbar.children).map(function(c) {
              return {
                text: c.innerText.trim(),
                ariaLabel: c.getAttribute('aria-label'),
                className: c.className
              };
            });
          })()
        `,
        returnByValue: true
      }
    }));
  });

  ws.on('message', (data) => {
    const res = JSON.parse(data);
    if (res.id === 1) {
      console.log('Toolbar container children:', JSON.stringify(res.result?.result?.value, null, 2));
      ws.close();
    }
  });
}

main().catch(console.error);
