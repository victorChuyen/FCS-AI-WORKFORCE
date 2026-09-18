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
            var logPanel = document.querySelector('.execution-log, .log-container, [role="region"]');
            var dialog = document.querySelector('.modal-dialog, [role="alertdialog"], [role="dialog"]');
            var toasts = Array.from(document.querySelectorAll('.toast, .notification, .status-bar, [role="status"]')).map(el => el.innerText.trim()).filter(Boolean);
            return {
              dialogText: dialog ? dialog.innerText : null,
              toasts: toasts,
              logText: logPanel ? logPanel.innerText : null
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
      console.log('Editor State:', JSON.stringify(res.result?.result?.value, null, 2));
      ws.close();
    }
  });
}

main().catch(console.error);
