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
            // Find function selector element
            var dropdowns = Array.from(document.querySelectorAll('[role="combobox"], [role="listbox"], .select-function, .function-selector, [aria-label*="hàm"], [aria-label*="function"]'));
            var toolbarButtons = Array.from(document.querySelectorAll('.script-editor-toolbar button, [role="toolbar"] button')).map(b => ({
              text: b.innerText.trim(),
              label: b.getAttribute('aria-label'),
              disabled: b.disabled
            }));
            return {
              dropdowns: dropdowns.map(d => ({ text: d.innerText, label: d.getAttribute('aria-label') })),
              toolbarButtons: toolbarButtons
            };
          })()
        `,
        returnByValue: true
      }
    }));
  });

  ws.on('message', (data) => {
    const res = JSON.parse(data);
    if (res.id === 1) {
      console.log('Toolbar inspection:', JSON.stringify(res.result?.result?.value, null, 2));
      ws.close();
    }
  });
}

main().catch(console.error);
