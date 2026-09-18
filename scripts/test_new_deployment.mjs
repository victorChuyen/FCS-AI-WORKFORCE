import WebSocket from 'ws';
import fs from 'fs';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const editorTab = tabs.find(t => t.url.includes('script.google.com') && t.url.includes('1qJJxG_Q6QUZ'));
  const ws = new WebSocket(editorTab.webSocketDebuggerUrl);

  function evalCode(expr) {
    return new Promise(resolve => {
      const id = Math.floor(Math.random() * 100000);
      const handler = data => {
        const res = JSON.parse(data);
        if (res.id === id) {
          ws.off('message', handler);
          resolve(res.result?.result?.value);
        }
      };
      ws.on('message', handler);
      ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true } }));
    });
  }

  function mouseClick(x, y) {
    return new Promise(resolve => {
      ws.send(JSON.stringify({ id: Math.floor(Math.random() * 100000), method: 'Input.dispatchMouseEvent', params: { type: 'mousePressed', x, y, button: 'left', clickCount: 1 } }));
      setTimeout(() => {
        ws.send(JSON.stringify({ id: Math.floor(Math.random() * 100000), method: 'Input.dispatchMouseEvent', params: { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 } }));
        resolve();
      }, 100);
    });
  }

  async function takeScreenshot(name) {
    return new Promise(resolve => {
      const id = Math.floor(Math.random() * 100000);
      const handler = data => {
        const res = JSON.parse(data);
        if (res.id === id) {
          ws.off('message', handler);
          if (res.result?.data) {
            fs.writeFileSync(name, Buffer.from(res.result.data, 'base64'));
            console.log('Saved ' + name);
          }
          resolve();
        }
      };
      ws.on('message', handler);
      ws.send(JSON.stringify({ id, method: 'Page.captureScreenshot', params: { format: 'png' } }));
    });
  }

  ws.on('open', async () => {
    try {
      // First check if a dialog is already open or needs closing
      const isAlreadyOpen = await evalCode(`Boolean(document.querySelector('[role="dialog"], [aria-modal="true"]'))`);
      if (isAlreadyOpen) {
        console.log('Closing existing dialog...');
        await evalCode(`
          (function() {
            var closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Huỷ' || b.innerText.trim() === 'Cancel');
            if (closeBtn) closeBtn.click();
          })()
        `);
        await sleep(1000);
      }

      console.log('1. Opening Deploy menu in header...');
      await evalCode(`
        (function() {
          var btn = document.querySelector('div[role="button"].Gn5yxe') || 
                    Array.from(document.querySelectorAll('div[role="button"], button')).find(b => b.innerText && b.innerText.includes('Triển khai'));
          if (btn) btn.click();
        })()
      `);
      await sleep(1000);

      console.log('2. Clicking "Tùy chọn triển khai mới"...');
      const menuRect = await evalCode(`
        (function() {
          var els = Array.from(document.querySelectorAll('*')).filter(el => el.innerText && el.innerText.trim() === 'Tùy chọn triển khai mới');
          if (els.length > 0) {
            var r = els[els.length - 1].getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
          }
          return null;
        })()
      `);
      if (menuRect) {
        await mouseClick(menuRect.x, menuRect.y);
      }

      console.log('3. Waiting for dialog and loading spinner to finish...');
      let isReady = false;
      for (let i = 0; i < 20; i++) {
        await sleep(1000);
        const state = await evalCode(`
          (function() {
            var dialog = document.querySelector('[role="dialog"], [aria-modal="true"]');
            if (!dialog) return { open: false };
            var text = dialog.innerText || "";
            var isLoading = text.includes('Đang tải') || text.includes('Loading');
            var deployBtn = Array.from(dialog.querySelectorAll('button')).find(b => {
              var t = b.innerText.trim();
              return (t === 'Triển khai' || t === 'Deploy') && !b.disabled && b.getAttribute('aria-disabled') !== 'true';
            });
            return { open: true, isLoading: isLoading, canDeploy: Boolean(deployBtn) };
          })()
        `);
        console.log('Wait state #' + i + ':', state);
        if (state.open && !state.isLoading && state.canDeploy) {
          isReady = true;
          break;
        }
      }

      await takeScreenshot('dialog_ready.png');

      console.log('4. Clicking Deploy button...');
      const deployRes = await evalCode(`
        (function() {
          var dialog = document.querySelector('[role="dialog"], [aria-modal="true"]');
          var deployBtn = Array.from(dialog.querySelectorAll('button')).find(b => {
            var t = b.innerText.trim();
            return (t === 'Triển khai' || t === 'Deploy') && !b.disabled && b.getAttribute('aria-disabled') !== 'true';
          });
          if (deployBtn) {
            deployBtn.click();
            return { success: true };
          }
          return { success: false };
        })()
      `);
      console.log('Deploy click result:', deployRes);

      console.log('Waiting 10s for deployment to complete...');
      await sleep(10000);

      await takeScreenshot('deployment_result.png');

      const resultDetails = await evalCode(`
        (function() {
          var dialog = document.querySelector('[role="dialog"], [aria-modal="true"]');
          if (!dialog) return { error: "No dialog" };
          var links = Array.from(dialog.querySelectorAll('a, [href*="/exec"]')).map(a => a.href);
          var text = dialog.innerText;
          return { text: text.slice(0, 400), links: links };
        })()
      `);
      console.log('Deployment Result:\n', JSON.stringify(resultDetails, null, 2));

      // Click Xong / Done
      await evalCode(`
        (function() {
          var done = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Xong' || b.innerText.trim() === 'Done');
          if (done) done.click();
        })()
      `);
      console.log('Done button clicked!');

      ws.close();
    } catch(err) {
      console.error('Error:', err);
      ws.close();
    }
  });
}

main();
