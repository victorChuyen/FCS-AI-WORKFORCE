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

  ws.on('open', async () => {
    // 1. Press Escape to dismiss any inline input
    console.log('1. Pressing Escape on inline input...');
    ws.send(JSON.stringify({
      id: 101,
      method: 'Input.dispatchKeyEvent',
      params: { type: 'keyDown', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' }
    }));
    await new Promise(r => setTimeout(r, 100));
    ws.send(JSON.stringify({
      id: 102,
      method: 'Input.dispatchKeyEvent',
      params: { type: 'keyUp', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' }
    }));
    await new Promise(r => setTimeout(r, 400));

    // 2. Click the Save button (Floppy disk icon)
    console.log('2. Clicking Save Project button...');
    const saveResult = await evalCode(`
      (function() {
        var btns = Array.from(document.querySelectorAll('button, [role="button"]'));
        var saveBtn = btns.find(b => {
          var label = b.getAttribute('aria-label') || '';
          return label.includes('Lưu') || label.includes('Save') || label.includes('save');
        });
        if (saveBtn) {
          saveBtn.click();
          return { clicked: true, label: saveBtn.getAttribute('aria-label') };
        }
        return { clicked: false, allLabels: btns.map(b => b.getAttribute('aria-label')).filter(Boolean) };
      })()
    `);
    console.log('Save button click result:', saveResult);

    // 3. Wait 4 seconds for save
    console.log('3. Waiting for save to finish...');
    await new Promise(r => setTimeout(r, 4000));

    // 4. Check status in header
    const headerStatus = await evalCode(`
      (function() {
        var statusEl = document.querySelector('[role="status"], .status-message, .project-status');
        var allText = document.body.innerText;
        var hasUnsaved = allText.includes('Nội dung thay đổi chưa lưu');
        return {
          hasUnsaved: hasUnsaved,
          title: document.title
        };
      })()
    `);
    console.log('Status after save:', headerStatus);

    ws.close();
  });
}
main().catch(console.error);
