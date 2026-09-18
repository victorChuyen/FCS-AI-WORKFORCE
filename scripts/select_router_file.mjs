import WebSocket from 'ws';

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const editorTab = tabs.find(t => t.url.includes('script.google.com') && t.url.includes('1qJJxG_Q6QUZ'));

  const ws = new WebSocket(editorTab.webSocketDebuggerUrl);

  ws.on('open', () => {
    // Click 01_Router.gs in sidebar
    ws.send(JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: {
        expression: `
          (function() {
            var items = Array.from(document.querySelectorAll('[role="treeitem"], [role="option"], .file-item, div'));
            var routerItem = items.find(function(el) {
              return el.innerText && el.innerText.includes('01_Router.gs') && el.getAttribute('aria-label') === '01_Router.gs';
            }) || items.find(function(el) {
              return el.innerText && el.innerText.trim() === '01_Router.gs';
            });
            if (routerItem) {
              routerItem.click();
              return { success: true, text: routerItem.innerText };
            }
            return { success: false, error: "01_Router.gs not found in sidebar" };
          })()
        `,
        returnByValue: true
      }
    }));
  });

  ws.on('message', (data) => {
    const res = JSON.parse(data);
    if (res.id === 1) {
      console.log('Select Router file result:', res.result?.result?.value);
      setTimeout(() => {
        // Check function selector text now
        ws.send(JSON.stringify({
          id: 2,
          method: 'Runtime.evaluate',
          params: {
            expression: `
              (function() {
                var el = document.querySelector('.Q45Bi, .select-function, [aria-label*="hàm"]');
                return el ? el.innerText.trim() : "Not found";
              })()
            `,
            returnByValue: true
          }
        }));
      }, 1000);
    } else if (res.id === 2) {
      console.log('Function selector text after selecting 01_Router.gs:', res.result?.result?.value);
      ws.close();
    }
  });
}

main().catch(console.error);
