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
      console.log('1. Opening Deploy menu...');
      await evalCode(`
        (function() {
          var btn = document.querySelector('div[role="button"].Gn5yxe') || 
                    Array.from(document.querySelectorAll('div[role="button"], button')).find(b => b.innerText && b.innerText.includes('Triển khai'));
          if (btn) btn.click();
        })()
      `);
      await sleep(1000);

      console.log('2. Clicking "Quản lý các tùy chọn triển khai"...');
      const menuRect = await evalCode(`
        (function() {
          var els = Array.from(document.querySelectorAll('*')).filter(el => el.innerText && el.innerText.trim() === 'Quản lý các tùy chọn triển khai');
          if (els.length > 0) {
            var r = els[els.length - 1].getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
          }
          return null;
        })()
      `);
      if (menuRect) {
        await mouseClick(menuRect.x, menuRect.y);
      } else {
        console.error('Menu item not found');
      }

      console.log('3. Waiting for deployment dialog...');
      let dialogOpen = false;
      for (let i = 0; i < 10; i++) {
        await sleep(500);
        const isOpen = await evalCode(`Boolean(document.querySelector('[role="dialog"], [aria-modal="true"]'))`);
        if (isOpen) {
          dialogOpen = true;
          break;
        }
      }
      if (!dialogOpen) {
        console.error('Dialog failed to open!');
        ws.close();
        return;
      }
      console.log('✅ Dialog is open!');
      await sleep(1000);

      console.log('4. Finding and clicking Edit (Pencil) button inside dialog...');
      const editBtn = await evalCode(`
        (function() {
          var dialog = document.querySelector('[role="dialog"], [aria-modal="true"]');
          var btn = dialog.querySelector('[aria-label*="Chỉnh sửa"], [aria-label*="Edit"]') ||
                    Array.from(dialog.querySelectorAll('button, div[role="button"], span')).find(b => {
                      var t = (b.innerText || b.getAttribute('aria-label') || '');
                      return t.includes('Chỉnh sửa') || t.includes('Edit') || t.includes('edit');
                    });
          if (btn) {
            var r = btn.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2, text: btn.innerText || btn.getAttribute('aria-label') };
          }
          return null;
        })()
      `);
      console.log('Edit button found:', editBtn);
      if (editBtn) {
        await mouseClick(editBtn.x, editBtn.y);
        await sleep(1500);
      }

      console.log('5. Clicking Version dropdown inside dialog...');
      const verDropdown = await evalCode(`
        (function() {
          var dialog = document.querySelector('[role="dialog"], [aria-modal="true"]');
          var selects = Array.from(dialog.querySelectorAll('[role="combobox"], [role="listbox"], .VfPpkd-O12Hhd')).filter(s => {
            return s.innerText && (s.innerText.includes('Phiên bản') || s.innerText.includes('Version'));
          });
          if (selects.length > 0) {
            var r = selects[0].getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2, text: selects[0].innerText.slice(0, 40) };
          }
          return null;
        })()
      `);
      console.log('Version dropdown:', verDropdown);
      if (verDropdown) {
        await mouseClick(verDropdown.x, verDropdown.y);
        await sleep(1500);

        console.log('6. Selecting "Phiên bản mới"...');
        const newVerOption = await evalCode(`
          (function() {
            var opts = Array.from(document.querySelectorAll('[role="option"], li, div')).filter(el => {
              return el.innerText && el.innerText.trim() === 'Phiên bản mới';
            });
            if (opts.length > 0) {
              var r = opts[0].getBoundingClientRect();
              return { x: r.left + r.width / 2, y: r.top + r.height / 2, text: opts[0].innerText };
            }
            return null;
          })()
        `);
        console.log('New version option:', newVerOption);
        if (newVerOption) {
          await mouseClick(newVerOption.x, newVerOption.y);
          await sleep(1500);
        }
      }

      console.log('7. Clicking "Triển khai" (Deploy) button in dialog...');
      const deployBtn = await evalCode(`
        (function() {
          var dialog = document.querySelector('[role="dialog"], [aria-modal="true"]');
          var btns = Array.from(dialog.querySelectorAll('button')).filter(b => {
            var t = b.innerText.trim();
            return (t === 'Triển khai' || t === 'Deploy') && !b.disabled && b.getAttribute('aria-disabled') !== 'true';
          });
          if (btns.length > 0) {
            var r = btns[btns.length - 1].getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2, text: btns[btns.length - 1].innerText };
          }
          return null;
        })()
      `);
      console.log('Deploy button:', deployBtn);
      if (deployBtn) {
        await mouseClick(deployBtn.x, deployBtn.y);
        console.log('Deploy button clicked! Waiting 5s for deployment process...');
        await sleep(5000);
      } else {
        console.log('Deploy button might not be active, trying direct query...');
      }

      await takeScreenshot('deploy_status_result.png');

      console.log('8. Looking for "Xong" or "Done" button...');
      const doneBtn = await evalCode(`
        (function() {
          var done = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Xong' || b.innerText.trim() === 'Done');
          if (done) {
            var r = done.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
          }
          return null;
        })()
      `);
      if (doneBtn) {
        await mouseClick(doneBtn.x, doneBtn.y);
        console.log('Done button clicked!');
      }

      console.log('🎉 Full deployment flow finished!');
      ws.close();
    } catch(err) {
      console.error('Error during full deployment:', err);
      ws.close();
    }
  });
}

main();
