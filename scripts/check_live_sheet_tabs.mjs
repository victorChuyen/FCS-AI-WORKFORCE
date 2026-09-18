import WebSocket from 'ws';

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const sheetTab = tabs.find(t => t.url.includes('docs.google.com/spreadsheets') && t.url.includes('1YAVNiPtAiYrxEThvIgWuR0PAHJbDCDqrXCz5SNwrxXE'));

  if (!sheetTab) {
    console.error('Sheet tab not found');
    return;
  }

  console.log('Connected to Sheet Tab:', sheetTab.title);
  const ws = new WebSocket(sheetTab.webSocketDebuggerUrl);

  ws.on('open', () => {
    ws.send(JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: {
        expression: `
          (function() {
            var tabElements = Array.from(document.querySelectorAll('.docs-sheet-tab, .docs-sheet-tab-name'));
            var names = tabElements.map(function(el) {
              return el.innerText.trim();
            }).filter(Boolean);
            return {
              uniqueNames: Array.from(new Set(names))
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
      console.log('Live Sheet Tab Names in Browser:');
      console.log(JSON.stringify(res.result?.result?.value, null, 2));
      ws.close();
    }
  });
}

main().catch(console.error);
