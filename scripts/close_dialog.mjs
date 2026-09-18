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
            var dialog = document.querySelector('[role="dialog"], .modal-dialog, [aria-modal="true"]');
            var buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean);
            var xongBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Xong' || b.innerText.trim() === 'Done');
            if (xongBtn) {
              xongBtn.click();
              return { success: true, message: "Clicked Xong button", dialogTitle: dialog ? dialog.innerText.slice(0, 100) : null };
            }
            return {
              dialog: dialog ? dialog.innerText.slice(0, 100) : null,
              buttons: buttons
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
      console.log('Dialog check:', JSON.stringify(res.result?.result?.value, null, 2));
      ws.close();
    }
  });
}

main().catch(console.error);
