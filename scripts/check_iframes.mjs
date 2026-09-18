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
            var iframes = Array.from(document.querySelectorAll('iframe')).map(f => ({
              id: f.id,
              name: f.name,
              src: f.src
            }));
            var topElements = Array.from(document.querySelectorAll('header, nav, [role="banner"], .app-bar')).map(h => ({
              tag: h.tagName,
              text: h.innerText.slice(0, 100),
              className: h.className
            }));
            return {
              iframes: iframes,
              topElements: topElements,
              title: document.title
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
      console.log('Page structure:', JSON.stringify(res.result?.result?.value, null, 2));
      ws.close();
    }
  });
}

main().catch(console.error);
