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
            var allBtns = Array.from(document.querySelectorAll('button, div[role="button"], span[role="button"]'));
            return allBtns.map(b => ({
              text: b.innerText ? b.innerText.trim() : "",
              ariaLabel: b.getAttribute('aria-label'),
              role: b.getAttribute('role'),
              className: b.className
            })).filter(b => b.text.length > 0 || b.ariaLabel);
          })()
        `,
        returnByValue: true
      }
    }));
  });

  ws.on('message', (data) => {
    const res = JSON.parse(data);
    if (res.id === 1) {
      console.log('All buttons:', JSON.stringify(res.result?.result?.value, null, 2));
      ws.close();
    }
  });
}

main().catch(console.error);
