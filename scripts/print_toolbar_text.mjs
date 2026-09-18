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
            var runBtn = document.querySelector('[aria-label*="Chạy"], [aria-label*="Run"]');
            var container = runBtn ? runBtn.parentElement.parentElement : null;
            return container ? container.innerText : "Not found";
          })()
        `,
        returnByValue: true
      }
    }));
  });

  ws.on('message', (data) => {
    const res = JSON.parse(data);
    if (res.id === 1) {
      console.log('=== TOOLBAR CONTAINER TEXT ===');
      console.log(res.result?.result?.value);
      ws.close();
    }
  });
}

main().catch(console.error);
