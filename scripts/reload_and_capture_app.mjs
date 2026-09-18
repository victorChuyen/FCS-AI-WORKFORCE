import WebSocket from 'ws';
import fs from 'fs';

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const appTab = tabs.find(t => t.url.includes('fcs.breaths.live'));

  if (!appTab) {
    console.log('Tab fcs.breaths.live not found in Chrome');
    return;
  }

  console.log('Connecting to App tab:', appTab.title, '->', appTab.url);
  const ws = new WebSocket(appTab.webSocketDebuggerUrl);

  ws.on('open', async () => {
    // 1. Reload the page
    console.log('1. Reloading page...');
    ws.send(JSON.stringify({ id: 10, method: 'Page.reload', params: { ignoreCache: true } }));
    await new Promise(r => setTimeout(r, 4000));

    // 2. Capture screenshot at desktop size
    console.log('2. Capturing desktop screenshot...');
    ws.send(JSON.stringify({ id: 20, method: 'Page.captureScreenshot', params: { format: 'png' } }));

    ws.on('message', async (data) => {
      const res = JSON.parse(data);
      if (res.id === 20) {
        const buf = Buffer.from(res.result.data, 'base64');
        fs.writeFileSync('D:/FCS-AI-WORKFORCE/app_desktop_screen.png', buf);
        console.log('Saved D:/FCS-AI-WORKFORCE/app_desktop_screen.png');

        // 3. Test mobile viewport resize & screenshot
        console.log('3. Resizing to mobile (iPhone 14: 390x844)...');
        ws.send(JSON.stringify({
          id: 30,
          method: 'Emulation.setDeviceMetricsOverride',
          params: { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }
        }));
        await new Promise(r => setTimeout(r, 1000));

        ws.send(JSON.stringify({ id: 40, method: 'Page.captureScreenshot', params: { format: 'png' } }));
      }

      if (res.id === 40) {
        const bufMobile = Buffer.from(res.result.data, 'base64');
        fs.writeFileSync('D:/FCS-AI-WORKFORCE/app_mobile_screen.png', bufMobile);
        console.log('Saved D:/FCS-AI-WORKFORCE/app_mobile_screen.png');

        // Reset device metrics override
        ws.send(JSON.stringify({
          id: 50,
          method: 'Emulation.clearDeviceMetricsOverride'
        }));
        await new Promise(r => setTimeout(r, 500));
        ws.close();
      }
    });
  });
}

main().catch(console.error);
