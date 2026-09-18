import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';

const backendDir = 'D:/FCS-AI-WORKFORCE/v2/backend';
const fileNames = [
  '00_Config.gs',
  '01_Router.gs',
  '02_WorkerService.gs',
  '03_DealService.gs',
  '04_TaxonomyService.gs',
  '05_SecurityService.gs',
  '06_ValidationService.gs',
  '07_AuditService.gs'
];

const fileContents = fileNames.map(f => {
  return fs.readFileSync(path.join(backendDir, f), 'utf8');
});

async function main() {
  console.log('Connecting to Chrome CDP...');
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const editorTab = tabs.find(t => t.url.includes('script.google.com') && t.url.includes('1qJJxG_Q6QUZ'));

  if (!editorTab) {
    console.error('Editor tab not found');
    return;
  }

  console.log('Connected to Editor tab:', editorTab.title);
  const ws = new WebSocket(editorTab.webSocketDebuggerUrl);

  ws.on('open', () => {
    // Inject code into Monaco models
    const codePayload = JSON.stringify(fileContents);
    const expression = `
      (function() {
        var contents = ${codePayload};
        var models = window.monaco.editor.getModels();
        if (models.length < contents.length) {
          return { error: "Models count (" + models.length + ") < files count (" + contents.length + ")" };
        }
        
        var results = [];
        for (var i = 0; i < contents.length; i++) {
          models[i].setValue(contents[i]);
          results.push({ index: i, uri: models[i].uri.toString(), lines: contents[i].split('\\n').length });
        }
        return { success: true, updated: results };
      })()
    `;

    ws.send(JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: { expression, returnByValue: true }
    }));
  });

  ws.on('message', (data) => {
    const res = JSON.parse(data);
    if (res.id === 1) {
      console.log('Update result:', JSON.stringify(res.result?.result?.value, null, 2));

      // Now trigger Ctrl+S
      console.log('Sending Ctrl+S save command...');
      ws.send(JSON.stringify({
        id: 2,
        method: 'Input.dispatchKeyEvent',
        params: {
          type: 'keyDown',
          modifiers: 2, // Ctrl
          windowsVirtualKeyCode: 83,
          code: 'KeyS',
          key: 's'
        }
      }));

      setTimeout(() => {
        ws.send(JSON.stringify({
          id: 3,
          method: 'Input.dispatchKeyEvent',
          params: {
            type: 'keyUp',
            modifiers: 0,
            windowsVirtualKeyCode: 83,
            code: 'KeyS',
            key: 's'
          }
        }));

        console.log('✅ Saved all 8 files into Apps Script Editor!');
        setTimeout(() => {
          ws.close();
        }, 1500);
      }, 500);
    }
  });
}

main().catch(console.error);
