import WebSocket from 'ws';

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const echoTab = tabs.find(t => t.url.includes('script.googleusercontent.com/macros/echo'));

  if (!echoTab) {
    console.log('No echo tab found');
    return;
  }

  console.log('Echo Tab URL:', echoTab.url);
  const ws = new WebSocket(echoTab.webSocketDebuggerUrl);

  ws.on('open', () => {
    ws.send(JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: { expression: 'document.body.innerText' }
    }));
  });

  ws.on('message', (data) => {
    const res = JSON.parse(data);
    if (res.id === 1) {
      console.log('Response content from Web App:');
      console.log(res.result?.result?.value);
      ws.close();
    }
  });
}

main().catch(console.error);
