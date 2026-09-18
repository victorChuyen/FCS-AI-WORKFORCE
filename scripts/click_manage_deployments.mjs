import WebSocket from 'ws';

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const editorTab = tabs.find(t => t.url.includes('script.google.com') && t.url.includes('1qJJxG_Q6QUZ'));

  const ws = new WebSocket(editorTab.webSocketDebuggerUrl);

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

  function mouseClick(x, y) {
    return new Promise(resolve => {
      ws.send(JSON.stringify({
        id: Math.floor(Math.random() * 100000),
        method: 'Input.dispatchMouseEvent',
        params: { type: 'mousePressed', x, y, button: 'left', clickCount: 1 }
      }));
      setTimeout(() => {
        ws.send(JSON.stringify({
          id: Math.floor(Math.random() * 100000),
          method: 'Input.dispatchMouseEvent',
          params: { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 }
        }));
        resolve();
      }, 100);
    });
  }

  ws.on('open', async () => {
    // Find bounding rect of "Quản lý các tùy chọn triển khai"
    const rect = await evalCode(`
      (function() {
        var items = Array.from(document.querySelectorAll('*')).filter(el => {
          return el.innerText && el.innerText.trim() === 'Quản lý các tùy chọn triển khai';
        });
        if (items.length > 0) {
          var target = items[items.length - 1];
          var r = target.getBoundingClientRect();
          return { x: r.left + r.width / 2, y: r.top + r.height / 2, width: r.width, height: r.height };
        }
        return null;
      })()
    `);

    console.log('Target rect:', rect);
    if (rect) {
      console.log('Clicking at', rect.x, rect.y);
      await mouseClick(rect.x, rect.y);
    }
    setTimeout(() => {
      ws.close();
    }, 2000);
  });
}

main().catch(console.error);
