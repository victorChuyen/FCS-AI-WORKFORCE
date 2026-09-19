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
  ADMIN_EMAILS: [
    "coach.chuyen@gmail.com",
    "tranngocchuyen1980@gmail.com",
    "dathao.188@gmail.com",
    "tuanluong.51pm1@gmail.com",
    "victorchuyen68@gmail.com",
    "ceo-fcs@breaths.live",
    "manager-fcs@breaths.live",
    "accountant-fcs@breaths.live"
  ],
  PILOT_TENANT_ID: "FCS-000001",
  SPREADSHEET_ID: "1YAVNiPtAiYrxEThvIgWuR0PAHJbDCDqrXCz5SNwrxXE",
  
  // Tab Names theo Phương án 1 (Chuẩn tuần tự 01, 02, 03, 04)
  TAB_DASHBOARD_KPI: "00_DASHBOARD_KPI",
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
 * Versioned + Tenant-Scoped Cache Helper
 * Tuân thủ nghiêm ngặt FCS_DEV_AI_PERFORMANCE_GUARDRAILS_V2_1 Section 4 (Task C) & Section 5
 */
var CacheHelper_ = {
  // Lấy data_version hiện tại cho tenant
  getDataVersion: function(tenantId) {
    tenantId = tenantId || V2_CONFIG.PILOT_TENANT_ID;
    try {
      var cache = CacheService.getScriptCache();
      var v = cache.get("v2:" + tenantId + ":data_version");
      if (v) return parseInt(v, 10);
    } catch(e) {}
    return 1;
  },

  // Bump version khi có mutation (deal.create, worker.create, deal.move_stage...)
  bumpDataVersion: function(tenantId) {
    tenantId = tenantId || V2_CONFIG.PILOT_TENANT_ID;
    try {
      var current = this.getDataVersion(tenantId);
      var next = current + 1;
      var cache = CacheService.getScriptCache();
      cache.put("v2:" + tenantId + ":data_version", next.toString(), 21600); // 6 hours
      return next;
    } catch(e) {
      return 1;
    }
  },

  // Lấy dữ liệu cached theo tenant và version
  get: function(tenantId, resourceKey) {
    tenantId = tenantId || V2_CONFIG.PILOT_TENANT_ID;
    try {
      var cache = CacheService.getScriptCache();
      var version = this.getDataVersion(tenantId);
      var fullKey = "v2:" + tenantId + ":" + resourceKey + ":v" + version;
      var cached = cache.get(fullKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch(e) {}
    return null;
  },

  // Lưu dữ liệu vào cache với tenant và version
  put: function(tenantId, resourceKey, data, ttlSeconds) {
    tenantId = tenantId || V2_CONFIG.PILOT_TENANT_ID;
    try {
      var cache = CacheService.getScriptCache();
      var version = this.getDataVersion(tenantId);
      var fullKey = "v2:" + tenantId + ":" + resourceKey + ":v" + version;
      var payloadStr = JSON.stringify(data);
      // CacheService limit per item is 100KB
      if (payloadStr.length < 95000) {
        cache.put(fullKey, payloadStr, ttlSeconds || 60);
      }
    } catch(e) {}
  },

  // Taxonomy Cache (TTL dài 6 giờ, tách biệt với mutation thường)
  getTaxonomy: function() {
    try {
      var cache = CacheService.getScriptCache();
      var cached = cache.get("v2:master:taxonomy:v1");
      if (cached) return JSON.parse(cached);
    } catch(e) {}
    return null;
  },

  putTaxonomy: function(data) {
    try {
      var cache = CacheService.getScriptCache();
      var payloadStr = JSON.stringify(data);
      if (payloadStr.length < 95000) {
        cache.put("v2:master:taxonomy:v1", payloadStr, 21600); // 6 hours
      }
    } catch(e) {}
  }
};

/**
 * Thiết lập tab 00_DASHBOARD_KPI với Bounded Native Formulas
 * Tuân thủ Section 6 & Section 8 của Guardrails V2.1 (bounded ranges, soft-delete filtering)
 */
function setupDashboardKpiSheet_(ss) {
  if (!ss) ss = getSpreadsheetV2_();
  if (!ss) return;

  var kpiSheet = getOrCreateSheet_(ss, V2_CONFIG.TAB_DASHBOARD_KPI);
  if (kpiSheet.getLastRow() <= 1) {
    kpiSheet.clear();
    kpiSheet.appendRow(["METRIC_KEY", "VALUE", "DESCRIPTION", "BOUNDED_FORMULA"]);
    formatHeaderRow_(kpiSheet, 4, "#0F172A"); // Slate Dark

    var kpiDefinitions = [
      ["total_workers", "=COUNTA('01_MASTER_WORKERS'!A2:A50000)", "Tổng số hồ sơ Master Workers", "COUNTA(A2:A50000)"],
      ["workers_deleted", "=COUNTIF('01_MASTER_WORKERS'!AE2:AE50000, \"*DELETED*\")", "Lao động đã đánh dấu xóa mềm", "COUNTIF(AE2:AE50000, *DELETED*)"],
      ["workers_nam", "=COUNTIFS('01_MASTER_WORKERS'!D2:D50000, \"Nam\", '01_MASTER_WORKERS'!AE2:AE50000, \"<>*DELETED*\")", "Lao động Nam hoạt động", "COUNTIFS"],
      ["workers_nu", "=COUNTIFS('01_MASTER_WORKERS'!D2:D50000, \"Nữ\", '01_MASTER_WORKERS'!AE2:AE50000, \"<>*DELETED*\")", "Lao động Nữ hoạt động", "COUNTIFS"],
      ["total_deals", "=COUNTA('02_CRM_DEALS_2026'!A2:A50000)", "Tổng số Deals CRM 2026", "COUNTA(A2:A50000)"],
      ["deals_deleted", "=COUNTIF('02_CRM_DEALS_2026'!S2:S50000, \"*DELETED*\")", "Deals đã đánh dấu xóa mềm", "COUNTIF(S2:S50000, *DELETED*)"],
      ["total_vww", "=COUNTIFS('02_CRM_DEALS_2026'!O2:O50000, TRUE, '02_CRM_DEALS_2026'!S2:S50000, \"<>*DELETED*\")", "North Star VWW đã xác minh", "COUNTIFS(O2:O50000, TRUE)"],
      ["stage_c3", "=COUNTIFS('02_CRM_DEALS_2026'!H2:H50000, \"C3*\", '02_CRM_DEALS_2026'!S2:S50000, \"<>*DELETED*\")", "Phễu Tiếp nhận C3", "COUNTIFS(C3*)"],
      ["stage_l1", "=COUNTIFS('02_CRM_DEALS_2026'!H2:H50000, \"L1*\", '02_CRM_DEALS_2026'!S2:S50000, \"<>*DELETED*\")", "Phễu Chăm sóc L1", "COUNTIFS(L1*)"],
      ["stage_l2", "=COUNTIFS('02_CRM_DEALS_2026'!H2:H50000, \"L2*\", '02_CRM_DEALS_2026'!S2:S50000, \"<>*DELETED*\")", "Phễu Phỏng vấn L2", "COUNTIFS(L2*)"],
      ["stage_l3", "=COUNTIFS('02_CRM_DEALS_2026'!H2:H50000, \"L3*\", '02_CRM_DEALS_2026'!S2:S50000, \"<>*DELETED*\")", "Phễu Đi làm L3", "COUNTIFS(L3*)"],
      ["stage_l4", "=COUNTIFS('02_CRM_DEALS_2026'!H2:H50000, \"L4*\", '02_CRM_DEALS_2026'!S2:S50000, \"<>*DELETED*\")", "Phễu Nghiệm thu L4", "COUNTIFS(L4*)"],
      ["total_commission", "=SUMIF('02_CRM_DEALS_2026'!S2:S50000, \"<>*DELETED*\", '02_CRM_DEALS_2026'!Q2:Q50000)", "Tổng hoa hồng dự kiến", "SUMIF(Q2:Q50000)"],
      ["data_version", "=COUNTA('03_AUDIT_LOG'!A2:A50000)", "Chỉ số phiên bản dữ liệu tự động tăng", "COUNTA('03_AUDIT_LOG'!A2:A50000)"],
      ["updated_at", "=NOW()", "Thời gian cập nhật thời gian thực của Sheet", "NOW()"]
    ];

    for (var r = 0; r < kpiDefinitions.length; r++) {
      kpiSheet.appendRow(kpiDefinitions[r]);
    }
  }
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
      var existing = ss.getSheetByName(newName);
      if (!existing) {
        sheet.setName(newName);
      }
    }
  }
}
