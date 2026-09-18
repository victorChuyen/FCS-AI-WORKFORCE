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
            var allBtns = Array.from(document.querySelectorAll('button, [role="button"]')).map(b => ({
              ariaLabel: b.getAttribute('aria-label'),
              innerText: b.innerText,
              title: b.title,
              id: b.id,
              className: b.className
            })).filter(b => (b.ariaLabel && (b.ariaLabel.includes('Thêm') || b.ariaLabel.includes('Add'))) || b.innerText === '+' || b.innerText.includes('add'));
            return allBtns;
          })()
        `,
        returnByValue: true
      }
    }));
  });
  ws.on('message', (data) => {
    const res = JSON.parse(data);
    if (res.id === 1) {
      console.log('Add buttons:', res.result?.result?.value);
      ws.close();
    }
  });
}
main().catch(console.error);
