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
            var el = Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.includes('Triển khai') && e.tagName !== 'SCRIPT' && e.children.length === 0);
            if (!el) {
              el = Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.includes('Triển khai') && e.tagName !== 'SCRIPT');
            }
            if (el) {
              var btn = el.closest('button, [role="button"], div');
              var r = (btn || el).getBoundingClientRect();
              return {
                text: el.innerText,
                tag: el.tagName,
                btnTag: btn ? btn.tagName : null,
                btnClass: btn ? btn.className : null,
                rect: { x: r.left + r.width / 2, y: r.top + r.height / 2, width: r.width, height: r.height }
              };
            }
            return "Not found";
          })()
        `,
        returnByValue: true
      }
    }));
  });

  ws.on('message', (data) => {
    const res = JSON.parse(data);
    if (res.id === 1) {
      console.log('Blue deploy button:', JSON.stringify(res.result?.result?.value, null, 2));
      ws.close();
    }
  });
}

main().catch(console.error);
