import WebSocket from 'ws';

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const editorTab = tabs.find(t => t.url.includes('script.google.com') && t.url.includes('1qJJxG_Q6QUZ'));

  if (!editorTab) {
    console.error('Editor tab not found');
    return;
  }

  const ws = new WebSocket(editorTab.webSocketDebuggerUrl);

  ws.on('open', () => {
    // Click the "Chạy" or "Run" button
    ws.send(JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: {
        expression: `
          (function() {
            var buttons = Array.from(document.querySelectorAll('button'));
            var runBtn = buttons.find(function(b) {
              var text = b.innerText || b.getAttribute('aria-label') || '';
              return text.includes('Chạy') || text.includes('Run');
            });
            if (runBtn) {
              runBtn.click();
              return { success: true, message: "Clicked Run button" };
            }
            return { success: false, error: "Run button not found", buttons: buttons.map(b => b.innerText.trim()).filter(Boolean) };
          })()
        `,
        returnByValue: true
      }
    }));
  });

  ws.on('message', (data) => {
    const res = JSON.parse(data);
    if (res.id === 1) {
      console.log('Run button result:', res.result?.result?.value);
      setTimeout(() => {
        ws.close();
      }, 3000);
    }
  });
}

main().catch(console.error);
