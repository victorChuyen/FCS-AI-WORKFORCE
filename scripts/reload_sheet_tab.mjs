import WebSocket from 'ws';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const sheetTab = tabs.find(t => t.url.includes('docs.google.com/spreadsheets') && t.url.includes('1YAVNiPtAiYrxEThvIgWuR0PAHJbDCDqrXCz5SNwrxXE'));

  if (!sheetTab) {
    console.error('Sheet tab not found');
    return;
  }

  console.log('Reloading Sheet Tab to display new tab names...');
  const ws = new WebSocket(sheetTab.webSocketDebuggerUrl);

  ws.on('open', () => {
    ws.send(JSON.stringify({
      id: 1,
      method: 'Page.reload',
      params: { ignoreCache: true }
    }));
  });

  ws.on('message', async (data) => {
    const res = JSON.parse(data);
    if (res.id === 1) {
      console.log('Reload triggered for Google Sheet!');
      ws.close();
    }
  });
}

main().catch(console.error);
