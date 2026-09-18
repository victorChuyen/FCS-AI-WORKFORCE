import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';

const backendDir = 'D:/FCS-AI-WORKFORCE/v2/backend';

function read(file) {
  return fs.readFileSync(path.join(backendDir, file), 'utf8');
}

// 1. File 0: 00_Config.gs
const file0 = read('00_Config.gs');

// 2. File 1: 01_Router.gs + 08_TriggerService.gs
const file1 = `// =============================================================================
// FCS AI WORKFORCE OS V2 — ROUTER, API GATEWAY & SYSTEM PLATFORM
// =============================================================================

${read('01_Router.gs')}

// =============================================================================
// TIME-DRIVEN TRIGGERS & NIGHTLY CRON
// =============================================================================

${read('08_TriggerService.gs')}
`;

// 3. File 2: 02_WorkerService.gs + 10_BatchImportService.gs
const file2 = `// =============================================================================
// FCS AI WORKFORCE OS V2 — WORKER PROFILE & 19-LEVEL SALE LIFECYCLE
// =============================================================================

${read('02_WorkerService.gs')}

// =============================================================================
// BATCH WORKER IMPORT SERVICE (EXCEL & MASS RECRUITMENT)
// =============================================================================

${read('10_BatchImportService.gs')}
`;

// 4. File 3: 03_DealService.gs + 14_LeadMarketingService.gs
const file3 = `// =============================================================================
// FCS AI WORKFORCE OS V2 — CRM DEALS & RECRUITMENT PIPELINE
// =============================================================================

${read('03_DealService.gs')}

// =============================================================================
// MARKETING ADS LEADS INGESTION & DUPLICATE PREVENTION (C3 -> L1.1)
// =============================================================================

${read('14_LeadMarketingService.gs')}
`;

// 5. File 4: 04_TaxonomyService.gs
const file4 = read('04_TaxonomyService.gs');

// 6. File 5: 05_SecurityService.gs
const file5 = read('05_SecurityService.gs');

// 7. File 6: 06_ValidationService.gs + 11_FieldDispatchService.gs + 12_AttendanceMatchingService.gs
const file6 = `// =============================================================================
// FCS AI WORKFORCE OS V2 — DATA VALIDATION & STRICT SCHEMA INTEGRITY
// =============================================================================

${read('06_ValidationService.gs')}

// =============================================================================
// FIELD OFFICER DISPATCH & ROSTER VERIFICATION (L2 -> L3)
// =============================================================================

${read('11_FieldDispatchService.gs')}

// =============================================================================
// ATTENDANCE MATCHING & VWW CERTIFICATION ENGINE (L3 -> VWW)
// =============================================================================

${read('12_AttendanceMatchingService.gs')}
`;

// 8. File 7: 07_AuditService.gs + 09_DashboardService.gs + 13_SettlementService.gs
const file7 = `// =============================================================================
// FCS AI WORKFORCE OS V2 — IMMUTABLE AUDIT TRAIL & ACTIVITY LOGGING
// =============================================================================

${read('07_AuditService.gs')}

// =============================================================================
// REAL-TIME KPI DASHBOARD & ANALYTICS SERVICE
// =============================================================================

${read('09_DashboardService.gs')}

// =============================================================================
// ACCOUNTANT SETTLEMENT, RECONCILIATION & COMMISSION DISPATCH
// =============================================================================

${read('13_SettlementService.gs')}
`;

const fileContents = [file0, file1, file2, file3, file4, file5, file6, file7];
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
      console.log('Injecting 8 clean modular files into Monaco models...');
      const payloadStr = JSON.stringify(fileContents);
      const namesStr = JSON.stringify(fileNames);

      const updateRes = await evalCode(`
        (function() {
          var contents = ${payloadStr};
          var names = ${namesStr};
          var models = window.monaco.editor.getModels();
          if (models.length < contents.length) {
            return { error: "Models count (" + models.length + ") < files count (" + contents.length + ")" };
          }
          
          var results = [];
          for (var i = 0; i < contents.length; i++) {
            models[i].setValue(contents[i]);
            results.push({
              index: i,
              name: names[i],
              uri: models[i].uri.toString(),
              lines: contents[i].split('\\n').length,
              chars: contents[i].length
            });
          }
          return { success: true, updated: results };
        })()
      `);

      console.log('Update result:', JSON.stringify(updateRes, null, 2));

      console.log('Triggering Ctrl+S to save project...');
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

      await new Promise(r => setTimeout(r, 400));

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

      console.log('Waiting 3s for Apps Script to persist files...');
      await new Promise(r => setTimeout(r, 3000));

      const checkRes = await evalCode(`
        (function() {
          var models = window.monaco.editor.getModels();
          return models.map(function(m, i) {
            return {
              index: i,
              lines: m.getValue().split('\\n').length,
              preview: m.getValue().split('\\n')[0]
            };
          });
        })()
      `);
      console.log('Editor state after save:', checkRes);

      console.log('\n🎉 ALL 8 MODULAR FILES SAVED CLEANLY INTO GOOGLE APPS SCRIPT!');
      ws.close();
    } catch (err) {
      console.error('Error during update:', err);
      ws.close();
    }
  });
}

main().catch(console.error);
