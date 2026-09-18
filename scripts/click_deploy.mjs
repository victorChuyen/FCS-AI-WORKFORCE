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
            var buttons = Array.from(document.querySelectorAll('button'));
            var deployBtn = buttons.find(b => b.innerText && b.innerText.includes('Triển khai'));
            if (deployBtn) {
              deployBtn.click();
              return { success: true, text: deployBtn.innerText.trim() };
            }
            return { success: false, error: "Deploy button not found" };
          })()
        `,
        returnByValue: true
      }
    }));
  });

  ws.on('message', (data) => {
    const res = JSON.parse(data);
    if (res.id === 1) {
      console.log('Deploy button click:', res.result?.result?.value);
      setTimeout(() => {
        // List menu options
        ws.send(JSON.stringify({
          id: 2,
          method: 'Runtime.evaluate',
          params: {
            expression: `
              (function() {
                var items = Array.from(document.querySelectorAll('[role="menuitem"], [role="option"], li')).map(el => el.innerText.trim()).filter(Boolean);
                return items;
              })()
            `,
            returnByValue: true
          }
        }));
      }, 500);
    } else if (res.id === 2) {
      console.log('Deploy menu items:', res.result?.result?.value);
      ws.close();
    }
  });
}

main().catch(console.error);
