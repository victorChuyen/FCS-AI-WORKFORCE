import WebSocket from 'ws';
import fs from 'fs';

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const editorTab = tabs.find(t => t.url.includes('script.google.com') && t.url.includes('1qJJxG_Q6QUZ'));

  const ws = new WebSocket(editorTab.webSocketDebuggerUrl);

  ws.on('open', () => {
    ws.send(JSON.stringify({
      id: 1,
      method: 'Page.captureScreenshot',
      params: { format: 'png' }
    }));
  });

  ws.on('message', (data) => {
    const res = JSON.parse(data);
    if (res.id === 1) {
      const buf = Buffer.from(res.result.data, 'base64');
      fs.writeFileSync('D:/FCS-AI-WORKFORCE/editor_current_screen.png', buf);
      console.log('Saved screenshot to D:/FCS-AI-WORKFORCE/editor_current_screen.png');
      ws.close();
    }
  });
}

main().catch(console.error);
