import WebSocket from 'ws';

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const sheetTab = tabs.find(t => t.url.includes('docs.google.com/spreadsheets') && t.url.includes('1YAVNiPtAiYrxEThvIgWuR0PAHJbDCDqrXCz5SNwrxXE'));
  
  if (!sheetTab) {
    console.error('No sheet tab found');
    return;
  }
  
  const ws = new WebSocket(sheetTab.webSocketDebuggerUrl);
  
  ws.on('open', () => {
    ws.send(JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: {
        expression: `(() => {
          const el = document.querySelector('.docs-sheet-active-tab .docs-sheet-tab-name') || document.querySelector('.docs-sheet-active-tab');
          return {
            tabText: el ? el.innerText.trim() : 'Unknown',
            url: window.location.href
          };
        })()`,
        returnByValue: true
      }
    }));
  });
  
  ws.on('message', (data) => {
    const res = JSON.parse(data);
    console.log('Active tab full res:', JSON.stringify(res, null, 2));
    ws.close();
  });
}
main();
