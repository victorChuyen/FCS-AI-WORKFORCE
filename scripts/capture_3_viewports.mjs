import WebSocket from 'ws';
import fs from 'fs';

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const appTab = tabs.find(t => t.url.includes('fcs.breaths.live'));

  if (!appTab) {
    console.log('Tab fcs.breaths.live not found');
    return;
  }

  const ws = new WebSocket(appTab.webSocketDebuggerUrl);

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
    // 1. Navigate to /app
    console.log('1. Navigating to /app...');
    ws.send(JSON.stringify({
      id: 10,
      method: 'Page.navigate',
      params: { url: 'https://fcs.breaths.live/app' }
    }));
    await new Promise(r => setTimeout(r, 4500));

    // 2. Capture desktop screenshot (1536x864)
    console.log('2. Capturing desktop screenshot at 1536x864...');
    ws.send(JSON.stringify({
      id: 20,
      method: 'Page.captureScreenshot',
      params: { format: 'png' }
    }));

    ws.on('message', async (data) => {
      const res = JSON.parse(data);
      if (res.id === 20) {
        const buf = Buffer.from(res.result.data, 'base64');
        fs.writeFileSync('D:/FCS-AI-WORKFORCE/app_crm_desktop.png', buf);
        console.log('Saved D:/FCS-AI-WORKFORCE/app_crm_desktop.png');

        // 3. Mobile viewport (iPhone 14 Pro: 393 x 852)
        console.log('3. Overriding to Mobile (iPhone 14 Pro: 393x852)...');
        ws.send(JSON.stringify({
          id: 30,
          method: 'Emulation.setDeviceMetricsOverride',
          params: { width: 393, height: 852, deviceScaleFactor: 3, mobile: true }
        }));
        await new Promise(r => setTimeout(r, 1200));

        ws.send(JSON.stringify({ id: 40, method: 'Page.captureScreenshot', params: { format: 'png' } }));
      }

      if (res.id === 40) {
        const bufMobile = Buffer.from(res.result.data, 'base64');
        fs.writeFileSync('D:/FCS-AI-WORKFORCE/app_crm_mobile.png', bufMobile);
        console.log('Saved D:/FCS-AI-WORKFORCE/app_crm_mobile.png');

        // 4. Tablet viewport (iPad: 820 x 1180)
        console.log('4. Overriding to Tablet (iPad Air: 820x1180)...');
        ws.send(JSON.stringify({
          id: 50,
          method: 'Emulation.setDeviceMetricsOverride',
          params: { width: 820, height: 1180, deviceScaleFactor: 2, mobile: false }
        }));
        await new Promise(r => setTimeout(r, 1200));

        ws.send(JSON.stringify({ id: 60, method: 'Page.captureScreenshot', params: { format: 'png' } }));
      }

      if (res.id === 60) {
        const bufTablet = Buffer.from(res.result.data, 'base64');
        fs.writeFileSync('D:/FCS-AI-WORKFORCE/app_crm_tablet.png', bufTablet);
        console.log('Saved D:/FCS-AI-WORKFORCE/app_crm_tablet.png');

        // Reset metrics
        ws.send(JSON.stringify({ id: 70, method: 'Emulation.clearDeviceMetricsOverride' }));
        await new Promise(r => setTimeout(r, 500));
        ws.close();
      }
    });
  });
}

main().catch(console.error);
