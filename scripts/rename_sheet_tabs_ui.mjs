import WebSocket from 'ws';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const sheetTab = tabs.find(t => t.url.includes('docs.google.com/spreadsheets') && t.url.includes('1YAVNiPtAiYrxEThvIgWuR0PAHJbDCDqrXCz5SNwrxXE'));

  if (!sheetTab) {
    console.error('Sheet tab not found');
    return;
  }

  console.log('Connected to Sheet tab:', sheetTab.title);
  const ws = new WebSocket(sheetTab.webSocketDebuggerUrl);

  function evalCode(expr) {
    return new Promise((resolve) => {
      const id = Math.floor(Math.random() * 100000);
      const handler = (data) => {
        const res = JSON.parse(data);
        if (res.id === id) {
          ws.off('message', handler);
          resolve(res.result?.result?.value);
        }
      };
      ws.on('message', handler);
      ws.send(JSON.stringify({
        id,
        method: 'Runtime.evaluate',
        params: { expression: expr, returnByValue: true }
      }));
    });
  }

  ws.on('open', async () => {
    try {
      const tabElements = await evalCode(`
        (function() {
          var tabs = Array.from(document.querySelectorAll('.docs-sheet-tab')).map(t => {
            var nameEl = t.querySelector('.docs-sheet-tab-name');
            return {
              name: nameEl ? nameEl.innerText.trim() : t.innerText.trim(),
              id: t.id,
              className: t.className
            };
          });
          return tabs;
        })()
      `);

      console.log('Found sheet tabs in DOM:', tabElements);
      ws.close();
    } catch (e) {
      console.error(e);
      ws.close();
    }
  });
}

main().catch(console.error);
