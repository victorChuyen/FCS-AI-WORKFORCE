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

const files = [
  { name: '00_Config.gs', content: file0 },
  { name: '01_Router.gs', content: file1 },
  { name: '02_WorkerService.gs', content: file2 },
  { name: '03_DealService.gs', content: file3 },
  { name: '04_TaxonomyService.gs', content: file4 },
  { name: '05_SecurityService.gs', content: file5 },
  { name: '06_ValidationService.gs', content: file6 },
  { name: '07_AuditService.gs', content: file7 }
];

console.log('=== PLAN FOR 8 CLEAN MODULAR FILES ===');
files.forEach((f, idx) => {
  const lines = f.content.split('\n').length;
  const kb = (f.content.length / 1024).toFixed(1);
  console.log(`[${idx}] ${f.name.padEnd(25)}: ${lines.toString().padStart(4)} lines (${kb.padStart(5)} KB)`);
});
