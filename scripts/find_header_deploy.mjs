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
            var header = document.querySelector('header');
            if (!header) return "No header";
            var clickables = Array.from(header.querySelectorAll('button, [role="button"], div, span')).filter(el => {
              return el.innerText && el.innerText.includes('Triển khai');
            }).map(el => ({
              tag: el.tagName,
              text: el.innerText.trim(),
              className: el.className,
              role: el.getAttribute('role')
            }));
            return clickables;
          })()
        `,
        returnByValue: true
      }
    }));
  });

  ws.on('message', (data) => {
    const res = JSON.parse(data);
    if (res.id === 1) {
      console.log('Header deploy elements:', JSON.stringify(res.result?.result?.value, null, 2));
      ws.close();
    }
  });
}

main().catch(console.error);
