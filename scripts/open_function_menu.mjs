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
            var el = Array.from(document.querySelectorAll('*')).find(function(e) {
              return e.innerText && e.innerText.trim() === 'Không có hàm nào' && e.children.length === 0;
            }) || Array.from(document.querySelectorAll('*')).find(function(e) {
              return e.innerText && e.innerText.includes('Không có hàm nào');
            });
            if (el) {
              el.click();
              return { success: true, clicked: el.tagName, className: el.className };
            }
            return { success: false, error: "Not found" };
          })()
        `,
        returnByValue: true
      }
    }));
  });

  ws.on('message', (data) => {
    const res = JSON.parse(data);
    if (res.id === 1) {
      console.log('Click result:', res.result?.result?.value);
      setTimeout(() => {
        // Now check for dropdown menu items
        ws.send(JSON.stringify({
          id: 2,
          method: 'Runtime.evaluate',
          params: {
            expression: `
              (function() {
                var menuItems = Array.from(document.querySelectorAll('[role="option"], [role="menuitem"], .goog-menuitem, li')).map(function(m) {
                  return m.innerText.trim();
                }).filter(Boolean);
                return menuItems;
              })()
            `,
            returnByValue: true
          }
        }));
      }, 500);
    } else if (res.id === 2) {
      console.log('Available menu items:', res.result?.result?.value);
      ws.close();
    }
  });
}

main().catch(console.error);
