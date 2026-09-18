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
            var items = Array.from(document.querySelectorAll('.file-item, [role="treeitem"], [role="option"], div[data-file-id]'));
            var fileNames = items.map(function(el) {
              return {
                text: el.innerText.trim(),
                ariaLabel: el.getAttribute('aria-label'),
                className: el.className
              };
            }).filter(function(x) { return x.text.length > 0; });
            return {
              sidebarItems: fileNames,
              modelsCount: window.monaco ? window.monaco.editor.getModels().length : 0
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
      console.log('Sidebar inspection:', JSON.stringify(res.result?.result?.value, null, 2));
      ws.close();
    }
  });
}

main().catch(console.error);
