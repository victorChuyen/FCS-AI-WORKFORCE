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
    // 1. Click Add button
    console.log('1. Clicking Add button...');
    await evalCode(`
      (function() {
        var btn = Array.from(document.querySelectorAll('button, [role="button"]')).find(b => b.getAttribute('aria-label') === 'Thêm một tệp');
        if (btn) btn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 600));

    // 2. Click 'Script' item
    console.log('2. Clicking Script item...');
    await evalCode(`
      (function() {
        var el = Array.from(document.querySelectorAll('span.z80M1, div.jO7h3c')).find(e => e.innerText.trim() === 'Script');
        if (el) el.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 800));

    // 3. Type file name '08_TriggerService' into input and press Enter
    console.log('3. Typing file name...');
    const result = await evalCode(`
      (function() {
        var input = document.querySelector('input.Ax4B8.ZAGvjd');
        if (!input) return { error: 'Input not found' };
        input.focus();
        input.value = '08_TriggerService';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        return { success: true, val: input.value };
      })()
    `);
    console.log('Input result:', result);

    // Send Enter key
    ws.send(JSON.stringify({
      id: 991,
      method: 'Input.dispatchKeyEvent',
      params: { type: 'keyDown', windowsVirtualKeyCode: 13, code: 'Enter', key: 'Enter' }
    }));
    await new Promise(r => setTimeout(r, 200));
    ws.send(JSON.stringify({
      id: 992,
      method: 'Input.dispatchKeyEvent',
      params: { type: 'keyUp', windowsVirtualKeyCode: 13, code: 'Enter', key: 'Enter' }
    }));

    await new Promise(r => setTimeout(r, 2000));

    // Check models in Monaco
    const models = await evalCode(`
      (function() {
        return window.monaco.editor.getModels().map(m => m.uri.toString());
      })()
    `);
    console.log('Monaco models now:', models);

    ws.close();
  });
}
main().catch(console.error);
