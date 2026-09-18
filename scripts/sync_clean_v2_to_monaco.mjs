import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';

const bundlePath = 'D:/FCS-AI-WORKFORCE/v2/backend/Code.gs';
const bundleContent = fs.readFileSync(bundlePath, 'utf8');

async function main() {
  console.log('Connecting to Chrome CDP...');
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const editorTab = tabs.find(t => t.url.includes('script.google.com') && t.url.includes('1qJJxG_Q6QUZ'));

  if (!editorTab) {
    console.error('Apps Script editor tab not found! Please ensure it is open.');
    process.exit(1);
  }

  console.log('Found Apps Script tab:', editorTab.title);
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
    try {
      console.log('Inspecting current Monaco models...');
      const modelsInfo = await evalCode(`
        (function() {
          var models = window.monaco.editor.getModels();
          return models.map(function(m, i) {
            return { index: i, uri: m.uri.toString(), length: m.getValue().length };
          });
        })()
      `);
      console.log('Current models:', modelsInfo);

      console.log('Injecting unified bundle into Model 0 and clearing secondary models...');
      const injectRes = await evalCode(`
        (function() {
          var models = window.monaco.editor.getModels();
          if (models.length === 0) return { error: "No Monaco models found" };

          var bundle = ${JSON.stringify(bundleContent)};
          models[0].setValue(bundle);

          for (var i = 1; i < models.length; i++) {
            models[i].setValue("// [MERGED INTO MODEL 0] All 14 service modules are bundled into Code.gs (Model 0).\\n// This empty stub prevents conflicting identifier declarations.\\n");
          }

          return {
            success: true,
            model0Length: models[0].getValue().length,
            modelsUpdated: models.length
          };
        })()
      `);
      console.log('Injection result:', injectRes);

      console.log('Triggering Ctrl+S to save project in Apps Script...');
      ws.send(JSON.stringify({
        id: 9991,
        method: 'Input.dispatchKeyEvent',
        params: {
          type: 'keyDown',
          modifiers: 2, // Ctrl
          windowsVirtualKeyCode: 83,
          code: 'KeyS',
          key: 's'
        }
      }));

      await new Promise(r => setTimeout(r, 500));

      ws.send(JSON.stringify({
        id: 9992,
        method: 'Input.dispatchKeyEvent',
        params: {
          type: 'keyUp',
          modifiers: 0,
          windowsVirtualKeyCode: 83,
          code: 'KeyS',
          key: 's'
        }
      }));

      console.log('Waiting 3s for save to complete...');
      await new Promise(r => setTimeout(r, 3000));

      const statusCheck = await evalCode(`
        (function() {
          var title = document.title;
          var models = window.monaco.editor.getModels();
          return {
            title: title,
            model0Lines: models[0].getValue().split('\\n').length,
            model1Length: models[1] ? models[1].getValue().length : 0
          };
        })()
      `);
      console.log('Status after save:', statusCheck);

      console.log('✅ Synchronized successfully!');
      ws.close();
    } catch(err) {
      console.error('Error during sync:', err);
      ws.close();
    }
  });
}

main().catch(console.error);
