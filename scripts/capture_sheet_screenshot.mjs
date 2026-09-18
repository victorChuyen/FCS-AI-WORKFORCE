import WebSocket from 'ws';
import fs from 'fs';

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const sheetTab = tabs.find(t => t.url.includes('docs.google.com/spreadsheets') && t.url.includes('1YAVNiPtAiYrxEThvIgWuR0PAHJbDCDqrXCz5SNwrxXE'));

  if (!sheetTab) {
    console.error('Sheet tab not found');
    return;
  }

  const ws = new WebSocket(sheetTab.webSocketDebuggerUrl);

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
      fs.writeFileSync('D:/FCS-AI-WORKFORCE/sheet_current_screen.png', buf);
      console.log('Saved screenshot to D:/FCS-AI-WORKFORCE/sheet_current_screen.png');
      ws.close();
    }
  });
}

main().catch(console.error);
