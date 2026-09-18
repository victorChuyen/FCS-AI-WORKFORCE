import WebSocket from 'ws';

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const editorTab = tabs.find(t => t.url.includes('script.google.com') && t.url.includes('1qJJxG_Q6QUZ'));
  if (!editorTab) {
    console.log('Apps Script tab not found');
    return;
  }
  const ws = new WebSocket(editorTab.webSocketDebuggerUrl);
  ws.on('open', () => {
    ws.send(JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: {
        expression: `
          (function() {
            var items = [];
            document.querySelectorAll('[role="treeitem"]').forEach(function(el) {
              items.push({
                text: el.innerText.trim(),
                selected: el.getAttribute('aria-selected') === 'true',
                id: el.id
              });
            });
            return items;
          })()
        `,
        returnByValue: true
      }
    }));
  });
  ws.on('message', (data) => {
    const res = JSON.parse(data);
    if (res.id === 1) {
      console.log('Tree items:', res.result?.result?.value);
      ws.close();
    }
  });
}
main().catch(console.error);
