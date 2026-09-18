import WebSocket from 'ws';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  await sleep(4000); // Wait for page to finish loading

  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const editorTab = tabs.find(t => t.url.includes('script.google.com') && t.url.includes('1qJJxG_Q6QUZ'));

  if (!editorTab) {
    console.error('Editor tab not found');
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
            var items = Array.from(document.querySelectorAll('*')).filter(el => {
              return el.innerText && (el.innerText.includes('setupV2NativeSheets') || el.innerText.includes('doGet') || el.innerText.includes('doPost'));
            });
            var runBtn = document.querySelector('[aria-label="Chạy hàm đã chọn"], [aria-label*="Chạy"], [aria-label*="Run"]');
            var toolbarContainer = runBtn ? runBtn.parentElement.parentElement.innerText : "No run button";
            return {
              toolbarText: toolbarContainer,
              matchedElements: items.map(i => ({ tag: i.tagName, text: i.innerText.trim(), className: i.className })).slice(0, 5)
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
      console.log('Post-reload check:', JSON.stringify(res.result?.result?.value, null, 2));
      ws.close();
    }
  });
}

main().catch(console.error);
