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
          const formulaInput = document.querySelector('#t-formula-bar-input .cell-input') || document.querySelector('.cell-input') || document.querySelector('[contenteditable="true"]');
          return {
            hasFormulaBar: !!formulaInput,
            formulaBarTag: formulaInput ? formulaInput.tagName : null,
            formulaBarClass: formulaInput ? formulaInput.className : null
          };
        })()`,
        returnByValue: true
      }
    }));
  });
  
  ws.on('message', (data) => {
    const res = JSON.parse(data);
    console.log('DOM check:', res.result?.result?.value || res.result?.value);
    ws.close();
  });
}
main();
