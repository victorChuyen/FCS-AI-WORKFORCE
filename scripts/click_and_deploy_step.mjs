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
      console.log('Step 1: Check if "Quản lý các tùy chọn triển khai" is visible...');
      let rect = await evalCode(`
        (function() {
          var els = Array.from(document.querySelectorAll('*')).filter(el => el.innerText && el.innerText.trim() === 'Quản lý các tùy chọn triển khai');
          if (els.length > 0) {
            var r = els[els.length - 1].getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
          }
          return null;
        })()
      `);

      if (!rect) {
        console.log('Dropdown not open, clicking "Triển khai" button...');
        await evalCode(`
          (function() {
            var btn = document.querySelector('div[role="button"].Gn5yxe') || 
                      Array.from(document.querySelectorAll('div[role="button"], button')).find(b => b.innerText && b.innerText.includes('Triển khai'));
            if (btn) btn.click();
          })()
        `);
        await sleep(1000);

        rect = await evalCode(`
          (function() {
            var els = Array.from(document.querySelectorAll('*')).filter(el => el.innerText && el.innerText.trim() === 'Quản lý các tùy chọn triển khai');
            if (els.length > 0) {
              var r = els[els.length - 1].getBoundingClientRect();
              return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
            }
            return null;
          })()
        `);
      }

      console.log('Target rect:', rect);
      if (rect) {
        console.log('Clicking "Quản lý các tùy chọn triển khai" at', rect.x, rect.y);
        await mouseClick(rect.x, rect.y);
        await sleep(2500);
      }

      await takeScreenshot('step1_dialog.png');

      console.log('Step 2: Finding Pencil (Chỉnh sửa) icon in deployment dialog...');
      const editRect = await evalCode(`
        (function() {
          var dialog = document.querySelector('[role="dialog"], [aria-modal="true"]') || document.body;
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
      console.log('Edit button:', editRect);
      if (editRect) {
        console.log('Clicking edit button...');
        await mouseClick(editRect.x, editRect.y);
        await sleep(2000);
      }

      await takeScreenshot('step2_edit.png');

      console.log('Step 3: Finding Version dropdown...');
      const selectRect = await evalCode(`
        (function() {
          var selects = Array.from(document.querySelectorAll('[role="combobox"], [role="listbox"], .VfPpkd-O12Hhd')).filter(s => {
            return s.innerText && (s.innerText.includes('Phiên bản') || s.innerText.includes('Version'));
          });
          if (selects.length > 0) {
            var r = selects[0].getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2, text: selects[0].innerText };
          }
          return null;
        })()
      `);
      console.log('Version dropdown:', selectRect);
      if (selectRect) {
        console.log('Clicking version dropdown...');
        await mouseClick(selectRect.x, selectRect.y);
        await sleep(1500);

        const newVerRect = await evalCode(`
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
        console.log('New version option:', newVerRect);
        if (newVerRect) {
          console.log('Selecting "Phiên bản mới"...');
          await mouseClick(newVerRect.x, newVerRect.y);
          await sleep(1500);
        }
      }

      await takeScreenshot('step3_new_ver.png');

      console.log('Step 4: Clicking "Triển khai" / "Deploy" button...');
      const deployBtnRect = await evalCode(`
        (function() {
          var dialog = document.querySelector('[role="dialog"], [aria-modal="true"]') || document.body;
          var btn = Array.from(dialog.querySelectorAll('button')).find(b => {
            var t = b.innerText.trim();
            return t === 'Triển khai' || t === 'Deploy' || t === 'Lưu' || t === 'Save';
          });
          if (btn) {
            var r = btn.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2, text: btn.innerText.trim() };
          }
          return null;
        })()
      `);
      console.log('Deploy button:', deployBtnRect);
      if (deployBtnRect) {
        console.log('Clicking Deploy at', deployBtnRect.x, deployBtnRect.y);
        await mouseClick(deployBtnRect.x, deployBtnRect.y);
        await sleep(4000);
      }

      await takeScreenshot('step4_complete.png');

      const finalDone = await evalCode(`
        (function() {
          var done = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Xong' || b.innerText.trim() === 'Done');
          if (done) {
            done.click();
            return "Done button clicked";
          }
          return "Done button not found";
        })()
      `);
      console.log('Final result:', finalDone);

      ws.close();
    } catch(err) {
      console.error('Error:', err);
      ws.close();
    }
  });
}

main();
