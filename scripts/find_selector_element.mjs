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
            var el = document.querySelector('.Q45Bi, .MocG8c, [aria-label*="hàm"], [aria-label*="function"], .select-function');
            var allSelects = Array.from(document.querySelectorAll('[role="combobox"], [role="listbox"], [role="option"]')).map(s => ({
              text: s.innerText.trim(),
              label: s.getAttribute('aria-label')
            }));
            return {
              target: el ? el.innerText.trim() : null,
              selects: allSelects
            };
          })()
        `,
        returnByValue: true
      }
    }));
  });

  ws.on('message', (data) => {
    const res = JSON.parse(data);
    if (res.id === 1) {
      console.log('Function selector search:', JSON.stringify(res.result?.result?.value, null, 2));
      ws.close();
    }
  });
}

main().catch(console.error);
