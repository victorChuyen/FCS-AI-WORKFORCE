/**
 * Hàm thực thi công khai trên thanh công cụ Run: Thiết lập chuẩn Phương án 1
 */
function RUN_SETUP_OPTION_1() {
  var ss = getSpreadsheetV2_();
  return setupV2Platform(ss);
}

var V2_CONFIG = {
  SYSTEM_NAME: "FCS AI WORKFORCE OS V2",
  SCHEMA_VERSION: "2.1.0",
  SUPER_ADMIN_EMAIL: "coach.chuyen@gmail.com",
  PILOT_TENANT_ID: "FCS-000001",
  SPREADSHEET_ID: "1YAVNiPtAiYrxEThvIgWuR0PAHJbDCDqrXCz5SNwrxXE",
  
  // Tab Names theo Phương án 1 (Chuẩn tuần tự 01, 02, 03, 04)
  TAB_WORKERS: "01_MASTER_WORKERS",
  TAB_DEALS: "02_CRM_DEALS_2026",
  TAB_AUDIT_LOG: "03_AUDIT_LOG",
  TAB_LEADS: "04_LEADS_MARKETING",
  TAB_PIPELINE_EVENTS: "05_PIPELINE_EVENTS",
  TAB_COMPANIES: "DM_COMPANY",
  TAB_BRANCHES: "DM_BRANCH",
  TAB_LEVEL_SALE: "DM_LEVEL_SALE",
  TAB_INFO: "INFO",
  
  // ID Prefixes
  PREFIX_WORKER: "WK-",
  PREFIX_DEAL: "DL-2026-",
  PREFIX_AUDIT: "LOG-",
  PREFIX_LEAD: "LD-",
  PREFIX_EVENT: "EV-"
};

function getSpreadsheetV2_() {
  var ss = null;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch(e) {}
  
  if (!ss && V2_CONFIG.SPREADSHEET_ID) {
    try {
      ss = SpreadsheetApp.openById(V2_CONFIG.SPREADSHEET_ID);
    } catch(err) {
      Logger.log("Không thể mở Spreadsheet qua ID: " + err.message);
    }
  }
  return ss;
}

// Helper: Format Header Row
function formatHeaderRow_(sheet, colCount, hexColor) {
  var range = sheet.getRange(1, 1, 1, colCount);
  range.setFontWeight("bold");
  range.setBackground(hexColor);
  range.setFontColor("#FFFFFF");
  sheet.setFrozenRows(1);
}

// Helper: Get or Create Sheet
function getOrCreateSheet_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

/**
 * Đổi tên các tab hiện có trên Sheet sang Phương án 1 chuẩn tuần tự
 */
function renameSheetsToOption1_(ss) {
  if (!ss) ss = getSpreadsheetV2_();
  if (!ss) return;

  var renameMap = {
    "04_MASTER_WORKERS": V2_CONFIG.TAB_WORKERS,
    "05_CRM_DEALS_2026": V2_CONFIG.TAB_DEALS,
    "12_AUDIT_LOG": V2_CONFIG.TAB_AUDIT_LOG,
    "COMPANY": V2_CONFIG.TAB_COMPANIES,
    "BRANCH": V2_CONFIG.TAB_BRANCHES,
    "LEVEL_SALE": V2_CONFIG.TAB_LEVEL_SALE
  };

  for (var oldName in renameMap) {
    var sheet = ss.getSheetByName(oldName);
    var newName = renameMap[oldName];
    if (sheet && oldName !== newName) {
      // Nếu đã có sheet tên newName thì không đổi đè
      var existing = ss.getSheetByName(newName);
      if (!existing) {
        sheet.setName(newName);
      }
    }
  }
}
