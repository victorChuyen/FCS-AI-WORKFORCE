import WebSocket from 'ws';

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const editorTab = tabs.find(t => t.url.includes('script.google.com') && t.url.includes('1qJJxG_Q6QUZ'));

  if (!editorTab) {
    console.log('No editor tab found');
    return;
  }

  console.log('Found Editor Tab:', editorTab.title);
  const ws = new WebSocket(editorTab.webSocketDebuggerUrl);

  ws.on('open', () => {
    // Check files in Monaco editor
    ws.send(JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: {
        expression: `
          (function() {
            if (window.monaco && window.monaco.editor) {
              return window.monaco.editor.getModels().map(m => m.uri.toString());
            }
            return "No monaco";
          })()
        `,
        returnByValue: true
      }
    }));
  });

  ws.on('message', (data) => {
    const res = JSON.parse(data);
    if (res.id === 1) {
      console.log('Monaco Models:', res.result?.result?.value);
      ws.close();
    }
  });
}

main().catch(console.error);
