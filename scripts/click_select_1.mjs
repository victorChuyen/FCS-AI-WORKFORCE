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
            var selects = Array.from(document.querySelectorAll('[role="combobox"], [role="listbox"]'));
            var target = selects[1];
            if (target) {
              target.click();
              return { success: true, tag: target.tagName, className: target.className };
            }
            return "Not found";
          })()
        `,
        returnByValue: true
      }
    }));
  });

  ws.on('message', (data) => {
    const res = JSON.parse(data);
    if (res.id === 1) {
      console.log('Click select[1] result:', res.result?.result?.value);
      setTimeout(() => {
        ws.send(JSON.stringify({
          id: 2,
          method: 'Runtime.evaluate',
          params: {
            expression: `
              (function() {
                var options = Array.from(document.querySelectorAll('[role="option"], li, .goog-menuitem')).map(o => o.innerText.trim()).filter(Boolean);
                return options;
              })()
            `,
            returnByValue: true
          }
        }));
      }, 500);
    } else if (res.id === 2) {
      console.log('Options list:', JSON.stringify(res.result?.result?.value, null, 2));
      ws.close();
    }
  });
}

main().catch(console.error);
