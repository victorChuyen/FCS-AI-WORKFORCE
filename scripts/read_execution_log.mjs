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
            var el = document.querySelector('.pEY3d, .execution-log, [role="region"], .x8I12c');
            var bodyText = document.body.innerText;
            var logLines = bodyText.split('\\n').filter(l => l.includes('Đang thực thi') || l.includes('Đã hoàn tất') || l.includes('Lỗi') || l.includes('Exception') || l.includes('Thực thi'));
            return {
              logSnippet: el ? el.innerText : null,
              logLines: logLines
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
      console.log('Execution log:', JSON.stringify(res.result?.result?.value, null, 2));
      ws.close();
    }
  });
}

main().catch(console.error);
