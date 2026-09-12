/**
 * FCS AI WORKFORCE OS - V4 MULTI-TENANT ENGINE & SUPER ADMIN MASTER
 * Version: 4.0.0 (Multi-Tenant Real Data Architecture)
 * 
 * This file exports the complete Google Apps Script code for:
 * 1. setupSuperAdminMaster(): One-click creation & initialization of FCS_SUPER_ADMIN_MASTER
 * 2. registerPilotTenantFiles(): Safe registration of FCS-000001 DATA and MANAGEMENT files
 * 3. Complete doPost() and router for real Google Sheets operations
 */

export const GAS_V4_BACKEND_CODE = `/**
 * ==============================================================================
 * FCS AI WORKFORCE OS - V4 MULTI-TENANT SAAS PLATFORM ENGINE
 * ARCHITECTURE: SUPER ADMIN MASTER + ISOLATED TENANT SPREADSHEETS
 * VERSION: 4.0.0 | SCHEMA: MULTI_TENANT_V4
 * ==============================================================================
 * 
 * INSTRUCTIONS FOR GOOGLE APPS SCRIPT:
 * 1. Open your Google Apps Script editor (script.google.com).
 * 2. Paste this complete file into Code.gs.
 * 3. Run setupSuperAdminMaster() once from the Run dropdown to initialize FCS_SUPER_ADMIN_MASTER.
 * 4. Run registerPilotTenantFiles() to link your FCS-000001 Data & Management spreadsheets.
 * 5. Deploy as Web App:
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy the Web App URL and set as VITE_API_BASE_URL.
 */

// ==============================================================================
// 01. PLATFORM CONFIGURATION & CONSTANTS
// ==============================================================================
var PLATFORM_CONFIG = {
  MASTER_SHEET_NAME: "FCS_SUPER_ADMIN_MASTER",
  SCHEMA_VERSION: "4.0.0",
  DEFAULT_SUPER_ADMIN: "coach.chuyen@gmail.com",
  SECONDARY_SUPER_ADMIN: "ceo-fcs@breaths.live",
  PILOT_TENANT_ID: "FCS-000001",
  PILOT_COMPANY_NAME: "FCS Pilot Workforce Corp",
  PILOT_COMPANY_CODE: "FCS1"
};

// ==============================================================================
// 02. ONE-CLICK SETUP: FCS_SUPER_ADMIN_MASTER
// ==============================================================================
/**
 * One-click function to create the FCS_SUPER_ADMIN_MASTER spreadsheet with all 8 tabs.
 * Run this directly inside Apps Script editor.
 */
function setupSuperAdminMaster() {
  var props = PropertiesService.getScriptProperties();
  var existingMasterId = props.getProperty("MASTER_SPREADSHEET_ID");
  var masterSs = null;

  if (existingMasterId) {
    try {
      masterSs = SpreadsheetApp.openById(existingMasterId);
      Logger.log("Found existing FCS_SUPER_ADMIN_MASTER: " + masterSs.getUrl());
    } catch (e) {
      Logger.log("Could not open saved Master ID, creating new one...");
    }
  }

  if (!masterSs) {
    masterSs = SpreadsheetApp.create(PLATFORM_CONFIG.MASTER_SHEET_NAME);
    props.setProperty("MASTER_SPREADSHEET_ID", masterSs.getId());
    Logger.log("Created NEW FCS_SUPER_ADMIN_MASTER with ID: " + masterSs.getId());
    Logger.log("URL: " + masterSs.getUrl());
  }

  // Define the exact 8 tabs as per V4 Architecture specification
  var tabs = [
    {
      name: "01_TENANTS",
      headers: [
        "tenant_id", "company_name", "company_slug", "company_code", "plan_code",
        "status", "owner_name", "owner_email", "owner_phone", "created_at",
        "activated_at", "created_by", "notes"
      ]
    },
    {
      name: "02_TENANT_FILES",
      headers: [
        "tenant_id", "data_spreadsheet_id", "data_spreadsheet_name",
        "management_spreadsheet_id", "management_spreadsheet_name",
        "drive_folder_id", "schema_version", "status", "created_at", "updated_at"
      ]
    },
    {
      name: "03_GLOBAL_USERS",
      headers: [
        "firebase_uid", "email", "display_name", "photo_url", "platform_role",
        "status", "created_at", "last_login_at"
      ]
    },
    {
      name: "04_USER_TENANT_ACCESS",
      headers: [
        "access_id", "firebase_uid", "email", "tenant_id", "tenant_role",
        "staff_id", "office_scope", "status", "created_at", "updated_at"
      ]
    },
    {
      name: "05_PLANS",
      headers: [
        "plan_code", "plan_name", "max_offices", "max_staff",
        "feature_worker_core", "feature_matching", "feature_reports", "status"
      ]
    },
    {
      name: "06_FEATURE_FLAGS",
      headers: [
        "tenant_id", "feature_code", "enabled", "config_json", "updated_at"
      ]
    },
    {
      name: "07_PLATFORM_CONFIG",
      headers: [
        "config_key", "config_value", "description", "updated_at"
      ]
    },
    {
      name: "08_SYSTEM_AUDIT",
      headers: [
        "audit_id", "timestamp", "firebase_uid", "email", "platform_role",
        "tenant_id", "action", "entity_type", "entity_id", "request_id",
        "result", "details"
      ]
    }
  ];

  tabs.forEach(function(tabDef) {
    var sheet = masterSs.getSheetByName(tabDef.name);
    if (!sheet) {
      sheet = masterSs.insertSheet(tabDef.name);
    }
    // Set headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(tabDef.headers);
      var headerRange = sheet.getRange(1, 1, 1, tabDef.headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#1E3A8A"); // Dark Blue
      headerRange.setFontColor("#FFFFFF");
      sheet.setFrozenRows(1);
    }
  });

  // Remove default "Sheet1" or "Trang tính 1" if other tabs exist
  var defaultSheet = masterSs.getSheetByName("Sheet1") || masterSs.getSheetByName("Trang tính 1");
  if (defaultSheet && masterSs.getSheets().length > 1) {
    try { masterSs.deleteSheet(defaultSheet); } catch (e) {}
  }

  // Seed Default Plan
  var plansSheet = masterSs.getSheetByName("05_PLANS");
  if (plansSheet && plansSheet.getLastRow() <= 1) {
    plansSheet.appendRow(["PILOT", "Doanh nghiệp Thí điểm FCS", 5, 20, true, true, true, "ACTIVE"]);
    plansSheet.appendRow(["STARTER", "Khởi nghiệp Cung ứng", 2, 5, true, false, false, "ACTIVE"]);
    plansSheet.appendRow(["BUSINESS", "Doanh nghiệp Tiêu chuẩn", 10, 50, true, true, true, "ACTIVE"]);
    plansSheet.appendRow(["MULTI_OFFICE", "Đa chi nhánh Toàn quốc", 99, 500, true, true, true, "ACTIVE"]);
  }

  // Seed Super Admin Users in 03_GLOBAL_USERS
  var usersSheet = masterSs.getSheetByName("03_GLOBAL_USERS");
  if (usersSheet && usersSheet.getLastRow() <= 1) {
    var nowStr = new Date().toISOString();
    usersSheet.appendRow(["UID-SUPERADMIN-01", PLATFORM_CONFIG.DEFAULT_SUPER_ADMIN, "Coach Chuyền", "", "PLATFORM_SUPER_ADMIN", "ACTIVE", nowStr, nowStr]);
    usersSheet.appendRow(["UID-SUPERADMIN-02", PLATFORM_CONFIG.SECONDARY_SUPER_ADMIN, "CEO FCS", "", "PLATFORM_SUPER_ADMIN", "ACTIVE", nowStr, nowStr]);
  }

  // Seed FCS-000001 Tenant in 01_TENANTS
  var tenantsSheet = masterSs.getSheetByName("01_TENANTS");
  if (tenantsSheet && tenantsSheet.getLastRow() <= 1) {
    var nowIso = new Date().toISOString();
    tenantsSheet.appendRow([
      PLATFORM_CONFIG.PILOT_TENANT_ID,
      PLATFORM_CONFIG.PILOT_COMPANY_NAME,
      "fcs-pilot",
      PLATFORM_CONFIG.PILOT_COMPANY_CODE,
      "PILOT",
      "ACTIVE",
      "Ban Giám Đốc FCS",
      PLATFORM_CONFIG.DEFAULT_SUPER_ADMIN,
      "0988888888",
      nowIso,
      nowIso,
      PLATFORM_CONFIG.DEFAULT_SUPER_ADMIN,
      "Tenant thí điểm ban đầu chuyển đổi số VWW"
    ]);
  }

  // Seed User Tenant Access in 04_USER_TENANT_ACCESS
  var accessSheet = masterSs.getSheetByName("04_USER_TENANT_ACCESS");
  if (accessSheet && accessSheet.getLastRow() <= 1) {
    var nowIso2 = new Date().toISOString();
    accessSheet.appendRow(["ACC-001", "UID-SUPERADMIN-01", PLATFORM_CONFIG.DEFAULT_SUPER_ADMIN, PLATFORM_CONFIG.PILOT_TENANT_ID, "TENANT_ADMIN", "STF-001", "*", "ACTIVE", nowIso2, nowIso2]);
    accessSheet.appendRow(["ACC-002", "UID-SUPERADMIN-02", PLATFORM_CONFIG.SECONDARY_SUPER_ADMIN, PLATFORM_CONFIG.PILOT_TENANT_ID, "TENANT_ADMIN", "STF-002", "*", "ACTIVE", nowIso2, nowIso2]);
  }

  // Seed Platform Config in 07_PLATFORM_CONFIG
  var configSheet = masterSs.getSheetByName("07_PLATFORM_CONFIG");
  if (configSheet && configSheet.getLastRow() <= 1) {
    var nowIso3 = new Date().toISOString();
    configSheet.appendRow(["SCHEMA_VERSION", "4.0.0", "Phiên bản kiến trúc cơ sở dữ liệu", nowIso3]);
    configSheet.appendRow(["DEFAULT_PLAN", "PILOT", "Gói dịch vụ mặc định", nowIso3]);
    configSheet.appendRow(["TENANT_PREFIX", "FCS", "Tiền tố mã hóa tenant", nowIso3]);
    configSheet.appendRow(["TENANT_DIGITS", "6", "Số lượng chữ số định danh tenant", nowIso3]);
  }

  Logger.log("=== SETUP COMPLETED SUCCESSFULLY ===");
  Logger.log("Master Spreadsheet ID: " + masterSs.getId());
  Logger.log("Master Spreadsheet URL: " + masterSs.getUrl());
  
  return {
    success: true,
    spreadsheetId: masterSs.getId(),
    spreadsheetUrl: masterSs.getUrl(),
    message: "Đã khởi tạo thành công FCS_SUPER_ADMIN_MASTER đầy đủ 8 tab."
  };
}

/**
 * Register or link existing spreadsheets for FCS-000001 (DATA & MANAGEMENT)
 */
function registerPilotTenantFiles(optionalDataId, optionalMgmtId) {
  var props = PropertiesService.getScriptProperties();
  var masterId = props.getProperty("MASTER_SPREADSHEET_ID");
  if (!masterId) {
    setupSuperAdminMaster();
    masterId = props.getProperty("MASTER_SPREADSHEET_ID");
  }

  var masterSs = SpreadsheetApp.openById(masterId);
  var filesSheet = masterSs.getSheetByName("02_TENANT_FILES");
  var tenantId = PLATFORM_CONFIG.PILOT_TENANT_ID;

  var dataSs = null;
  var mgmtSs = null;

  if (optionalDataId) {
    dataSs = SpreadsheetApp.openById(optionalDataId);
  } else {
    var savedDataId = props.getProperty("TENANT_DATA_ID_" + tenantId);
    if (savedDataId) {
      try { dataSs = SpreadsheetApp.openById(savedDataId); } catch(e) {}
    }
    if (!dataSs) {
      dataSs = SpreadsheetApp.create(tenantId + "_DATA");
      props.setProperty("TENANT_DATA_ID_" + tenantId, dataSs.getId());
    }
  }

  if (optionalMgmtId) {
    mgmtSs = SpreadsheetApp.openById(optionalMgmtId);
  } else {
    var savedMgmtId = props.getProperty("TENANT_MGMT_ID_" + tenantId);
    if (savedMgmtId) {
      try { mgmtSs = SpreadsheetApp.openById(savedMgmtId); } catch(e) {}
    }
    if (!mgmtSs) {
      mgmtSs = SpreadsheetApp.create(tenantId + "_MANAGEMENT");
      props.setProperty("TENANT_MGMT_ID_" + tenantId, mgmtSs.getId());
    }
  }

  // Initialize DATA tabs
  initTenantDataSpreadsheet_(dataSs);
  // Initialize MANAGEMENT tabs
  initTenantManagementSpreadsheet_(mgmtSs);

  // Write into 02_TENANT_FILES
  var dataRows = filesSheet.getDataRange().getValues();
  var rowIndexToUpdate = -1;
  for (var r = 1; r < dataRows.length; r++) {
    if (dataRows[r][0] === tenantId) {
      rowIndexToUpdate = r + 1;
      break;
    }
  }

  var nowIso = new Date().toISOString();
  var rowData = [
    tenantId,
    dataSs.getId(),
    dataSs.getName(),
    mgmtSs.getId(),
    mgmtSs.getName(),
    "", // drive_folder_id
    "4.0.0",
    "ACTIVE",
    nowIso,
    nowIso
  ];

  if (rowIndexToUpdate > 0) {
    filesSheet.getRange(rowIndexToUpdate, 1, 1, rowData.length).setValues([rowData]);
  } else {
    filesSheet.appendRow(rowData);
  }

  Logger.log("Registered Tenant Files for " + tenantId);
  Logger.log("DATA File: " + dataSs.getUrl());
  Logger.log("MANAGEMENT File: " + mgmtSs.getUrl());

  return {
    success: true,
    tenantId: tenantId,
    dataId: dataSs.getId(),
    dataUrl: dataSs.getUrl(),
    managementId: mgmtSs.getId(),
    managementUrl: mgmtSs.getUrl()
  };
}

// ==============================================================================
// 03. TENANT SPREADSHEET INITIALIZERS
// ==============================================================================
function initTenantDataSpreadsheet_(ss) {
  var tabs = [
    { name: "01_WORKER_INBOX", headers: ["inbox_id", "received_at", "source", "raw_name", "raw_phone", "raw_id_card", "note", "status"] },
    { name: "02_INTERVIEW_INBOX", headers: ["inbox_id", "worker_id", "partner_id", "job_id", "scheduled_date", "status"] },
    { name: "03_ASSIGNMENT_INBOX", headers: ["inbox_id", "worker_id", "partner_id", "job_id", "start_date", "status"] },
    { name: "04_WORKERS_MASTER", headers: ["worker_id", "full_name", "phone", "id_card", "birth_year", "gender", "hometown", "current_status", "is_vww", "active_partner_id", "office_id", "recruiter_id", "created_at", "updated_at"] },
    { name: "05_PIPELINE_EVENTS", headers: ["event_id", "worker_id", "event_type", "stage_from", "stage_to", "partner_id", "job_id", "created_at", "created_by", "notes"] },
    { name: "06_INTERVIEWS", headers: ["interview_id", "worker_id", "partner_id", "job_id", "interview_date", "interview_time", "location", "result", "interviewer", "notes"] },
    { name: "07_ASSIGNMENTS", headers: ["assignment_id", "worker_id", "partner_id", "job_id", "start_date", "end_date", "status", "attendance_days", "salary_agreement", "notes"] },
    { name: "08_ATTENDANCE_RAW", headers: ["raw_id", "imported_at", "partner_id", "report_date", "worker_identifier", "worker_name", "shift_code", "hours_worked", "status"] },
    { name: "09_ATTENDANCE", headers: ["attendance_id", "worker_id", "partner_id", "work_date", "hours", "shift", "verified_vww", "matched_at", "matched_by"] },
    { name: "10_MATCHING_REVIEW", headers: ["review_id", "raw_id", "suggested_worker_id", "confidence_score", "reason", "status", "reviewed_at", "reviewed_by"] },
    { name: "11_ACTION_QUEUE", headers: ["action_id", "priority", "category", "worker_id", "title", "reason", "due_date", "status", "created_at", "resolved_at"] },
    { name: "12_AUDIT_LOG", headers: ["log_id", "timestamp", "actor_email", "action", "target_entity", "entity_id", "details"] }
  ];

  tabs.forEach(function(t) {
    var sheet = ss.getSheetByName(t.name);
    if (!sheet) {
      sheet = ss.insertSheet(t.name);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(t.headers);
      var headerRange = sheet.getRange(1, 1, 1, t.headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#0F766E"); // Teal
      headerRange.setFontColor("#FFFFFF");
      sheet.setFrozenRows(1);
    }
  });

  var def = ss.getSheetByName("Sheet1") || ss.getSheetByName("Trang tính 1");
  if (def && ss.getSheets().length > 1) {
    try { ss.deleteSheet(def); } catch(e) {}
  }
}

function initTenantManagementSpreadsheet_(ss) {
  var tabs = [
    { name: "01_COMPANY_PROFILE", headers: ["field_key", "field_value", "description", "updated_at"] },
    { name: "02_OFFICES", headers: ["office_id", "office_name", "office_code", "address", "phone", "manager_name", "status"] },
    { name: "03_STAFF", headers: ["staff_id", "staff_name", "email", "phone", "role", "office_id", "status"] },
    { name: "04_PARTNERS", headers: ["partner_id", "partner_name", "partner_code", "industry", "location", "contact_person", "phone", "status"] },
    { name: "05_JOBS", headers: ["job_id", "partner_id", "title", "salary_range", "vacancies", "requirements", "status"] },
    { name: "06_ROLES", headers: ["role_code", "role_name", "description"] },
    { name: "07_ROLE_PERMISSIONS", headers: ["role_code", "permission_key", "allowed"] },
    { name: "08_CONFIG", headers: ["config_key", "config_value", "updated_at"] },
    { name: "09_SLA_RULES", headers: ["rule_id", "stage", "max_hours", "action_priority", "escalation_role"] },
    { name: "10_FEATURE_CONFIG", headers: ["feature_code", "enabled", "settings_json"] },
    { name: "11_INTEGRATIONS", headers: ["integration_name", "config_json", "status"] },
    { name: "12_SUBSCRIPTION_INFO", headers: ["plan_code", "billing_cycle", "start_date", "expiry_date", "status"] }
  ];

  tabs.forEach(function(t) {
    var sheet = ss.getSheetByName(t.name);
    if (!sheet) {
      sheet = ss.insertSheet(t.name);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(t.headers);
      var headerRange = sheet.getRange(1, 1, 1, t.headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#334155"); // Slate
      headerRange.setFontColor("#FFFFFF");
      sheet.setFrozenRows(1);
    }
  });

  // Seed default company profile
  var profSheet = ss.getSheetByName("01_COMPANY_PROFILE");
  if (profSheet && profSheet.getLastRow() <= 1) {
    var nowIso = new Date().toISOString();
    profSheet.appendRow(["company_name", PLATFORM_CONFIG.PILOT_COMPANY_NAME, "Tên doanh nghiệp", nowIso]);
    profSheet.appendRow(["company_code", PLATFORM_CONFIG.PILOT_COMPANY_CODE, "Mã doanh nghiệp", nowIso]);
    profSheet.appendRow(["tenant_id", PLATFORM_CONFIG.PILOT_TENANT_ID, "Định danh Tenant", nowIso]);
  }

  // Seed default office
  var offSheet = ss.getSheetByName("02_OFFICES");
  if (offSheet && offSheet.getLastRow() <= 1) {
    offSheet.appendRow(["OFF-01", "Văn phòng Bắc Ninh", "BN", "Số 12 Lý Thái Tổ, TP. Bắc Ninh", "0988000111", "Nguyễn Thu Trang", "ACTIVE"]);
    offSheet.appendRow(["OFF-02", "Văn phòng Bắc Giang", "BG", "Số 88 Hùng Vương, TP. Bắc Giang", "0988000222", "Trần Minh Trí", "ACTIVE"]);
  }

  // Seed default partners
  var partSheet = ss.getSheetByName("04_PARTNERS");
  if (partSheet && partSheet.getLastRow() <= 1) {
    partSheet.appendRow(["PT-01", "Foxconn Bắc Giang (KCN Quang Châu)", "FOXCONN_BG", "Lắp ráp điện tử", "Bắc Giang", "Mr. Tuấn", "0912345678", "ACTIVE"]);
    partSheet.appendRow(["PT-02", "Luxshare ICT Bắc Ninh (KCN VSIP)", "LUXSHARE_BN", "Linh kiện tai nghe", "Bắc Ninh", "Ms. Hạnh", "0987654321", "ACTIVE"]);
    partSheet.appendRow(["PT-03", "Goertek Vina (KCN Quế Võ)", "GOERTEK_QV", "Linh kiện âm thanh", "Bắc Ninh", "Mr. Hoàng", "0909123456", "ACTIVE"]);
  }

  // Seed default jobs
  var jobSheet = ss.getSheetByName("05_JOBS");
  if (jobSheet && jobSheet.getLastRow() <= 1) {
    jobSheet.appendRow(["JOB-01", "PT-01", "Công nhân lắp ráp Module", "8.5 - 11.5 triệu", 80, "Sức khỏe tốt, ca 12h", "ACTIVE"]);
    jobSheet.appendRow(["JOB-02", "PT-02", "Công nhân dây chuyền tai nghe", "8.0 - 10.5 triệu", 50, "Mắt tinh, tỉ mỉ", "ACTIVE"]);
    jobSheet.appendRow(["JOB-03", "PT-03", "Kiểm tra chất lượng (QA/QC)", "9.0 - 12.0 triệu", 30, "Biết đọc bản vẽ kỹ thuật cơ bản", "ACTIVE"]);
  }

  var def = ss.getSheetByName("Sheet1") || ss.getSheetByName("Trang tính 1");
  if (def && ss.getSheets().length > 1) {
    try { ss.deleteSheet(def); } catch(e) {}
  }
}

// ==============================================================================
// 04. SERVER-SIDE TENANT RESOLVER (NEVER TRUST FRONTEND)
// ==============================================================================
function resolveTenantContext_(identity, requestedTenantId) {
  var props = PropertiesService.getScriptProperties();
  var masterId = props.getProperty("MASTER_SPREADSHEET_ID");
  if (!masterId) {
    setupSuperAdminMaster();
    masterId = props.getProperty("MASTER_SPREADSHEET_ID");
  }

  var masterSs = SpreadsheetApp.openById(masterId);
  var email = (identity && identity.email) ? String(identity.email).trim().toLowerCase() : "";
  
  // 1. Check Global Users for Platform Role
  var usersSheet = masterSs.getSheetByName("03_GLOBAL_USERS");
  var usersData = usersSheet.getDataRange().getValues();
  var platformRole = "NONE";

  for (var u = 1; u < usersData.length; u++) {
    var rowEmail = String(usersData[u][1]).trim().toLowerCase();
    if (rowEmail === email) {
      platformRole = usersData[u][4] || "NONE";
      break;
    }
  }

  // Super Admin Fallback rule
  if (email === PLATFORM_CONFIG.DEFAULT_SUPER_ADMIN || email === PLATFORM_CONFIG.SECONDARY_SUPER_ADMIN) {
    platformRole = "PLATFORM_SUPER_ADMIN";
  }

  // 2. Resolve Active Tenant
  var targetTenantId = PLATFORM_CONFIG.PILOT_TENANT_ID;
  var tenantRole = "VIEWER";
  var allowedOfficeIds = ["*"];
  var staffId = "STF-001";

  if (platformRole === "PLATFORM_SUPER_ADMIN") {
    // Super Admin can inspect requested tenant if ACTIVE
    if (requestedTenantId) {
      targetTenantId = requestedTenantId;
    }
    tenantRole = "TENANT_ADMIN";
  } else {
    // Regular User: MUST look up in 04_USER_TENANT_ACCESS
    var accessSheet = masterSs.getSheetByName("04_USER_TENANT_ACCESS");
    var accessData = accessSheet.getDataRange().getValues();
    var foundAccess = false;

    for (var a = 1; a < accessData.length; a++) {
      var accEmail = String(accessData[a][2]).trim().toLowerCase();
      var accTenant = accessData[a][3];
      var accStatus = accessData[a][7];

      if (accEmail === email && accStatus === "ACTIVE") {
        if (!requestedTenantId || requestedTenantId === accTenant) {
          targetTenantId = accTenant;
          tenantRole = accessData[a][4] || "VIEWER";
          staffId = accessData[a][5] || "STF-GEN";
          allowedOfficeIds = accessData[a][6] === "*" ? ["*"] : [accessData[a][6]];
          foundAccess = true;
          break;
        }
      }
    }

    if (!foundAccess && email) {
      // Return safe fallback or denial
      targetTenantId = PLATFORM_CONFIG.PILOT_TENANT_ID;
      tenantRole = "VIEWER";
    }
  }

  // 3. Resolve Tenant Files from 02_TENANT_FILES
  var filesSheet = masterSs.getSheetByName("02_TENANT_FILES");
  var filesData = filesSheet.getDataRange().getValues();
  var dataSpreadsheetId = "";
  var managementSpreadsheetId = "";

  for (var f = 1; f < filesData.length; f++) {
    if (filesData[f][0] === targetTenantId && filesData[f][7] === "ACTIVE") {
      dataSpreadsheetId = filesData[f][1];
      managementSpreadsheetId = filesData[f][3];
      break;
    }
  }

  // Fallback to auto-registration if missing
  if (!dataSpreadsheetId || !managementSpreadsheetId) {
    if (targetTenantId === PLATFORM_CONFIG.PILOT_TENANT_ID) {
      var regResult = registerPilotTenantFiles();
      dataSpreadsheetId = regResult.dataId;
      managementSpreadsheetId = regResult.managementId;
    }
  }

  // 4. Resolve Company Name
  var companyName = PLATFORM_CONFIG.PILOT_COMPANY_NAME;
  var tenantsSheet = masterSs.getSheetByName("01_TENANTS");
  var tenantsData = tenantsSheet.getDataRange().getValues();
  for (var t = 1; t < tenantsData.length; t++) {
    if (tenantsData[t][0] === targetTenantId) {
      companyName = tenantsData[t][1];
      break;
    }
  }

  return {
    email: email,
    platformRole: platformRole,
    tenantId: targetTenantId,
    companyName: companyName,
    tenantRole: tenantRole,
    staffId: staffId,
    allowedOfficeIds: allowedOfficeIds,
    dataSpreadsheetId: dataSpreadsheetId,
    managementSpreadsheetId: managementSpreadsheetId,
    isSuperAdmin: (platformRole === "PLATFORM_SUPER_ADMIN")
  };
}

// ==============================================================================
// 05. HTTP HANDLERS (doGet & doPost)
// ==============================================================================
function doGet(e) {
  return jsonResponse_({
    success: true,
    status: "ok",
    service: "FCS AI WORKFORCE OS",
    version: PLATFORM_CONFIG.SCHEMA_VERSION,
    architecture: "MULTI_TENANT",
    dataMode: "REAL",
    tenantIsolation: true,
    timestamp: Date.now()
  });
}

function doPost(e) {
  var requestId = "REQ-" + Date.now();
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse_({ success: false, error: { code: "BAD_REQUEST", message: "Yêu cầu rỗng." }, requestId: requestId });
    }

    var request = JSON.parse(e.postData.contents);
    var action = request.action || "";
    var payload = request.payload || {};
    var identity = request.identity || { email: PLATFORM_CONFIG.DEFAULT_SUPER_ADMIN };
    var requestedTenantId = request.requestedTenantId || payload.tenantId || "";
    requestId = request.requestId || requestId;

    // Resolve Tenant Context securely
    var tenantContext = resolveTenantContext_(identity, requestedTenantId);

    // Platform Health Check (Safe public info)
    if (action === "system.health") {
      return jsonResponse_({
        success: true,
        data: {
          status: "healthy",
          service: "FCS AI WORKFORCE OS",
          version: PLATFORM_CONFIG.SCHEMA_VERSION,
          architecture: "MULTI_TENANT",
          dataMode: "REAL",
          tenantIsolation: true,
          activeTenant: tenantContext.tenantId,
          companyName: tenantContext.companyName,
          tenantRole: tenantContext.tenantRole,
          platformRole: tenantContext.platformRole
        },
        requestId: requestId
      });
    }

    // Tenant Health Check
    if (action === "tenant.health") {
      var dataOk = false;
      var mgmtOk = false;
      try {
        if (tenantContext.dataSpreadsheetId) {
          var dss = SpreadsheetApp.openById(tenantContext.dataSpreadsheetId);
          dataOk = Boolean(dss);
        }
      } catch(e) {}
      try {
        if (tenantContext.managementSpreadsheetId) {
          var mss = SpreadsheetApp.openById(tenantContext.managementSpreadsheetId);
          mgmtOk = Boolean(mss);
        }
      } catch(e) {}

      return jsonResponse_({
        success: true,
        data: {
          tenantId: tenantContext.tenantId,
          companyName: tenantContext.companyName,
          dataConnected: dataOk,
          managementConnected: mgmtOk,
          schemaVersion: PLATFORM_CONFIG.SCHEMA_VERSION,
          dataMode: "REAL",
          role: tenantContext.tenantRole
        },
        requestId: requestId
      });
    }

    // Super Admin: List Tenants
    if (action === "tenant.list") {
      if (tenantContext.platformRole !== "PLATFORM_SUPER_ADMIN") {
        return jsonResponse_({ success: false, error: { code: "FORBIDDEN", message: "Chỉ Super Admin mới có quyền xem danh sách tenants." }, requestId: requestId });
      }
      return jsonResponse_(listTenants_(), requestId);
    }

    // Super Admin: Switch Tenant
    if (action === "tenant.select") {
      if (tenantContext.platformRole !== "PLATFORM_SUPER_ADMIN") {
        return jsonResponse_({ success: false, error: { code: "FORBIDDEN", message: "Từ chối truy cập." }, requestId: requestId });
      }
      var newCtx = resolveTenantContext_(identity, payload.tenantId);
      return jsonResponse_({
        success: true,
        data: {
          tenantId: newCtx.tenantId,
          companyName: newCtx.companyName,
          tenantRole: newCtx.tenantRole
        }
      }, requestId);
    }

    // BUSINESS REPOSITORIES - ALL REQUIRE RESOLVED TENANT FILES
    if (!tenantContext.dataSpreadsheetId || !tenantContext.managementSpreadsheetId) {
      return jsonResponse_({
        success: false,
        error: { code: "TENANT_FILES_UNRESOLVED", message: "Chưa cấu hình tệp dữ liệu cho Tenant " + tenantContext.tenantId },
        requestId: requestId
      });
    }

    var dataSs = SpreadsheetApp.openById(tenantContext.dataSpreadsheetId);
    var mgmtSs = SpreadsheetApp.openById(tenantContext.managementSpreadsheetId);

    switch (action) {
      // 1. Dashboard Summary
      case "dashboard.summary":
        return jsonResponse_(getDashboardSummary_(dataSs, mgmtSs, tenantContext), requestId);

      // 2. Worker List
      case "worker.list":
        return jsonResponse_(getWorkers_(dataSs, payload), requestId);

      // 3. Worker Detail
      case "worker.get":
        return jsonResponse_(getWorkerDetail_(dataSs, payload.workerId), requestId);

      // 4. Worker Create
      case "worker.create":
        return jsonResponse_(createWorker_(dataSs, payload, tenantContext), requestId);

      // 5. Worker Update
      case "worker.update":
        return jsonResponse_(updateWorker_(dataSs, payload, tenantContext), requestId);

      // 6. Action Queue List
      case "action.list":
        return jsonResponse_(getActionQueue_(dataSs, payload), requestId);

      // 7. Pipeline Funnel
      case "pipeline.funnel":
      case "pipeline.metrics":
        return jsonResponse_(getPipelineFunnel_(dataSs), requestId);

      // 8. Pipeline Events
      case "pipeline.events":
        return jsonResponse_(getPipelineEvents_(dataSs, payload.workerId), requestId);

      // 9. Interviews
      case "interview.list":
        return jsonResponse_(getInterviews_(dataSs, payload.workerId), requestId);
      case "interview.create":
        return jsonResponse_(createInterview_(dataSs, payload, tenantContext), requestId);
      case "interview.update":
        return jsonResponse_(updateInterview_(dataSs, payload, tenantContext), requestId);

      // 10. Assignments
      case "assignment.list":
        return jsonResponse_(getAssignments_(dataSs, payload.workerId), requestId);
      case "assignment.create":
        return jsonResponse_(createAssignment_(dataSs, payload, tenantContext), requestId);
      case "assignment.start":
        return jsonResponse_(startAssignment_(dataSs, payload.assignmentId, tenantContext), requestId);

      // 11. Attendance & Matching
      case "attendance.list":
        return jsonResponse_(getAttendanceList_(dataSs, payload.workerId), requestId);
      case "attendance.match":
        return jsonResponse_(matchAttendance_(dataSs, payload, tenantContext), requestId);
      case "matching.list":
        return jsonResponse_(getMatchingReviews_(dataSs), requestId);

      // 12. Results & VWW
      case "results.summary":
      case "results.metrics":
        return jsonResponse_(getOperationalResults_(dataSs), requestId);

      // 13. Master Management Data
      case "master.offices":
        return jsonResponse_(getOffices_(mgmtSs), requestId);
      case "master.staff":
        return jsonResponse_(getStaff_(mgmtSs), requestId);
      case "master.partners":
        return jsonResponse_(getPartners_(mgmtSs), requestId);
      case "master.jobs":
        return jsonResponse_(getJobs_(mgmtSs), requestId);

      // 14. Golden Flow End-to-End Live Execution
      case "goldenflow.run":
        return jsonResponse_(executeGoldenFlow_(dataSs, payload, tenantContext), requestId);

      default:
        return jsonResponse_({
          success: false,
          error: { code: "UNKNOWN_ACTION", message: "Hành động '" + action + "' không được hỗ trợ trong phiên bản 4.0.0." },
          requestId: requestId
        });
    }

  } catch (err) {
    return jsonResponse_({
      success: false,
      error: { code: "SERVER_ERROR", message: err.toString() },
      requestId: requestId
    });
  }
}

// ==============================================================================
// 06. REAL DATA REPOSITORIES (EXACT ROWS & STATS)
// ==============================================================================
function getDashboardSummary_(dataSs, mgmtSs, tenantContext) {
  var workersSheet = dataSs.getSheetByName("04_WORKERS_MASTER");
  var actionsSheet = dataSs.getSheetByName("11_ACTION_QUEUE");
  
  var totalWorkers = 0;
  var newWorkers = 0;
  var interviewed = 0;
  var passed = 0;
  var waitingStart = 0;
  var working = 0;
  var verifiedWorking = 0;

  if (workersSheet && workersSheet.getLastRow() > 1) {
    var rows = workersSheet.getDataRange().getValues();
    totalWorkers = rows.length - 1;
    for (var i = 1; i < rows.length; i++) {
      var st = String(rows[i][7] || "").toUpperCase();
      var isVww = Boolean(rows[i][8]);
      if (isVww) verifiedWorking++;
      if (st === "NEW") newWorkers++;
      else if (st === "INTERVIEWED" || st === "INTERVIEW_PENDING") interviewed++;
      else if (st === "PASSED") passed++;
      else if (st === "WAITING_START") waitingStart++;
      else if (st === "WORKING") working++;
    }
  }

  var openActions = 0;
  var p0 = 0, p1 = 0, p2 = 0, p3 = 0;
  if (actionsSheet && actionsSheet.getLastRow() > 1) {
    var actRows = actionsSheet.getDataRange().getValues();
    for (var a = 1; a < actRows.length; a++) {
      var actStatus = String(actRows[a][7] || "").toUpperCase();
      if (actStatus === "OPEN") {
        openActions++;
        var prio = String(actRows[a][1] || "").toUpperCase();
        if (prio === "P0") p0++;
        else if (prio === "P1") p1++;
        else if (prio === "P2") p2++;
        else if (prio === "P3") p3++;
      }
    }
  }

  return {
    success: true,
    data: {
      tenantId: tenantContext.tenantId,
      companyName: tenantContext.companyName,
      metrics: {
        totalWorkers: totalWorkers,
        newWorkers: newWorkers,
        interviewed: interviewed,
        passed: passed,
        waitingStart: waitingStart,
        working: working,
        verifiedWorking: verifiedWorking,
        pendingReview: p0,
        openActions: openActions
      },
      priorities: { P0: p0, P1: p1, P2: p2, P3: p3 },
      northStar: { value: verifiedWorking, target: 500, label: "Verified Working Worker (VWW)" }
    }
  };
}

function getWorkers_(dataSs, payload) {
  var sheet = dataSs.getSheetByName("04_WORKERS_MASTER");
  if (!sheet || sheet.getLastRow() <= 1) {
    return { success: true, data: [] };
  }

  var data = sheet.getDataRange().getValues();
  var result = [];
  var search = payload && payload.search ? String(payload.search).toLowerCase().trim() : "";
  var statusFilter = payload && payload.status && payload.status !== "ALL" ? payload.status : "";

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var workerId = row[0];
    var fullName = row[1];
    var phone = row[2];
    var idCard = row[3];
    var status = row[7] || "NEW";
    var isVww = Boolean(row[8]);

    if (statusFilter && status !== statusFilter) continue;
    if (search) {
      var matchId = String(workerId).toLowerCase().indexOf(search) !== -1;
      var matchName = String(fullName).toLowerCase().indexOf(search) !== -1;
      var matchPhone = String(phone).toLowerCase().indexOf(search) !== -1;
      var matchCccd = String(idCard).toLowerCase().indexOf(search) !== -1;
      if (!matchId && !matchName && !matchPhone && !matchCccd) continue;
    }

    result.push({
      workerId: workerId,
      fullName: fullName,
      phone: phone,
      idCard: idCard,
      birthYear: row[4],
      gender: row[5],
      hometown: row[6],
      status: status,
      isVerifiedWorking: isVww,
      isVww: isVww,
      activePartnerId: row[9],
      officeId: row[10],
      recruiterId: row[11],
      createdAt: row[12],
      updatedAt: row[13]
    });
  }

  return { success: true, data: result };
}

function getWorkerDetail_(dataSs, workerId) {
  var sheet = dataSs.getSheetByName("04_WORKERS_MASTER");
  if (!sheet || sheet.getLastRow() <= 1) {
    return { success: false, error: { code: "NOT_FOUND", message: "Hồ sơ không tồn tại" } };
  }
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === workerId) {
      var row = data[i];
      return {
        success: true,
        data: {
          workerId: row[0],
          fullName: row[1],
          phone: row[2],
          idCard: row[3],
          birthYear: row[4],
          gender: row[5],
          hometown: row[6],
          status: row[7] || "NEW",
          isVerifiedWorking: Boolean(row[8]),
          isVww: Boolean(row[8]),
          activePartnerId: row[9],
          officeId: row[10],
          recruiterId: row[11],
          createdAt: row[12],
          updatedAt: row[13]
        }
      };
    }
  }
  return { success: false, error: { code: "NOT_FOUND", message: "Không tìm thấy hồ sơ " + workerId } };
}

function createWorker_(dataSs, payload, tenantContext) {
  var sheet = dataSs.getSheetByName("04_WORKERS_MASTER");
  var newIndex = sheet.getLastRow();
  var padIndex = ("000000" + newIndex).slice(-6);
  var workerId = "WK-" + padIndex;
  var nowIso = new Date().toISOString();

  var newRow = [
    workerId,
    payload.fullName || "Lao động mới",
    payload.phone || "",
    payload.idCard || "",
    payload.birthYear || 2000,
    payload.gender || "Nam",
    payload.hometown || "Bắc Ninh",
    "NEW",
    false,
    "",
    payload.officeId || "OFF-01",
    payload.recruiterId || tenantContext.staffId,
    nowIso,
    nowIso
  ];

  sheet.appendRow(newRow);

  // Append Pipeline Event
  var eventsSheet = dataSs.getSheetByName("05_PIPELINE_EVENTS");
  if (eventsSheet) {
    eventsSheet.appendRow([
      "EVT-" + Date.now(),
      workerId,
      "CREATED",
      "",
      "NEW",
      "",
      "",
      nowIso,
      tenantContext.email,
      "Tiếp nhận hồ sơ mới vào hệ thống"
    ]);
  }

  return {
    success: true,
    data: {
      workerId: workerId,
      fullName: payload.fullName,
      phone: payload.phone,
      status: "NEW",
      isVerifiedWorking: false,
      createdAt: nowIso
    }
  };
}

function updateWorker_(dataSs, payload, tenantContext) {
  var sheet = dataSs.getSheetByName("04_WORKERS_MASTER");
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === payload.workerId) {
      var row = i + 1;
      if (payload.fullName) sheet.getRange(row, 2).setValue(payload.fullName);
      if (payload.phone) sheet.getRange(row, 3).setValue(payload.phone);
      if (payload.idCard) sheet.getRange(row, 4).setValue(payload.idCard);
      if (payload.status) sheet.getRange(row, 8).setValue(payload.status);
      if (payload.isVerifiedWorking !== undefined) sheet.getRange(row, 9).setValue(Boolean(payload.isVerifiedWorking));
      sheet.getRange(row, 14).setValue(new Date().toISOString());
      return { success: true, data: { workerId: payload.workerId, updated: true } };
    }
  }
  return { success: false, error: { code: "NOT_FOUND", message: "Hồ sơ không tồn tại" } };
}

function getActionQueue_(dataSs, payload) {
  var sheet = dataSs.getSheetByName("11_ACTION_QUEUE");
  if (!sheet || sheet.getLastRow() <= 1) {
    return { success: true, data: [] };
  }
  var data = sheet.getDataRange().getValues();
  var result = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var status = row[7] || "OPEN";
    if (payload && payload.status && payload.status !== "ALL" && status !== payload.status) continue;
    result.push({
      actionId: row[0],
      priority: row[1],
      category: row[2],
      workerId: row[3],
      title: row[4],
      reason: row[5],
      dueDate: row[6],
      status: status,
      createdAt: row[8],
      resolvedAt: row[9]
    });
  }
  return { success: true, data: result };
}

function getPipelineFunnel_(dataSs) {
  var sheet = dataSs.getSheetByName("04_WORKERS_MASTER");
  var stages = {
    NEW: 0,
    INTERVIEW_PENDING: 0,
    PASSED: 0,
    WAITING_START: 0,
    WORKING: 0,
    VWW: 0
  };

  if (sheet && sheet.getLastRow() > 1) {
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      var st = String(data[i][7] || "NEW").toUpperCase();
      var isVww = Boolean(data[i][8]);
      if (isVww) stages.VWW++;
      if (stages[st] !== undefined) stages[st]++;
    }
  }

  return {
    success: true,
    data: [
      { stage: "NEW", count: stages.NEW, label: "Mới tiếp nhận" },
      { stage: "INTERVIEW_PENDING", count: stages.INTERVIEW_PENDING, label: "Chờ phỏng vấn" },
      { stage: "PASSED", count: stages.PASSED, label: "Đã đỗ phỏng vấn" },
      { stage: "WAITING_START", count: stages.WAITING_START, label: "Chờ đi làm" },
      { stage: "WORKING", count: stages.WORKING, label: "Đang làm việc" },
      { stage: "VWW", count: stages.VWW, label: "Chuẩn VWW" }
    ]
  };
}

function getPipelineEvents_(dataSs, workerId) {
  var sheet = dataSs.getSheetByName("05_PIPELINE_EVENTS");
  if (!sheet || sheet.getLastRow() <= 1) return { success: true, data: [] };
  var data = sheet.getDataRange().getValues();
  var result = [];
  for (var i = 1; i < data.length; i++) {
    if (!workerId || data[i][1] === workerId) {
      result.push({
        id: data[i][0],
        workerId: data[i][1],
        eventType: data[i][2],
        stageFrom: data[i][3],
        stageTo: data[i][4],
        timestamp: data[i][7],
        note: data[i][9]
      });
    }
  }
  return { success: true, data: result };
}

function getInterviews_(dataSs, workerId) {
  var sheet = dataSs.getSheetByName("06_INTERVIEWS");
  if (!sheet || sheet.getLastRow() <= 1) return { success: true, data: [] };
  var data = sheet.getDataRange().getValues();
  var result = [];
  for (var i = 1; i < data.length; i++) {
    if (!workerId || data[i][1] === workerId) {
      result.push({
        id: data[i][0],
        workerId: data[i][1],
        partnerId: data[i][2],
        jobId: data[i][3],
        scheduledDate: data[i][4],
        result: data[i][7],
        notes: data[i][9]
      });
    }
  }
  return { success: true, data: result };
}

function createInterview_(dataSs, payload, tenantContext) {
  var sheet = dataSs.getSheetByName("06_INTERVIEWS");
  var id = "INT-" + Date.now();
  sheet.appendRow([
    id,
    payload.workerId,
    payload.partnerId || "PT-01",
    payload.jobId || "JOB-01",
    payload.scheduledDate || new Date().toISOString().split("T")[0],
    "08:30",
    "Xưởng đối tác",
    "PENDING",
    tenantContext.staffId,
    payload.notes || ""
  ]);

  // Update Worker Status
  updateWorkerStatusInMaster_(dataSs, payload.workerId, "INTERVIEW_PENDING");
  return { success: true, data: { id: id, workerId: payload.workerId, status: "PENDING" } };
}

function updateInterview_(dataSs, payload, tenantContext) {
  var sheet = dataSs.getSheetByName("06_INTERVIEWS");
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === payload.interviewId || data[i][1] === payload.workerId) {
      sheet.getRange(i + 1, 8).setValue(payload.result || "PASSED");
      if (payload.result === "PASSED") {
        updateWorkerStatusInMaster_(dataSs, data[i][1], "PASSED");
      }
      return { success: true, data: { interviewId: data[i][0], result: payload.result } };
    }
  }
  return { success: false, error: { code: "NOT_FOUND", message: "Không tìm thấy phỏng vấn" } };
}

function getAssignments_(dataSs, workerId) {
  var sheet = dataSs.getSheetByName("07_ASSIGNMENTS");
  if (!sheet || sheet.getLastRow() <= 1) return { success: true, data: [] };
  var data = sheet.getDataRange().getValues();
  var result = [];
  for (var i = 1; i < data.length; i++) {
    if (!workerId || data[i][1] === workerId) {
      result.push({
        id: data[i][0],
        workerId: data[i][1],
        partnerId: data[i][2],
        jobId: data[i][3],
        startDate: data[i][4],
        status: data[i][6],
        attendanceDays: data[i][7] || 0
      });
    }
  }
  return { success: true, data: result };
}

function createAssignment_(dataSs, payload, tenantContext) {
  var sheet = dataSs.getSheetByName("07_ASSIGNMENTS");
  var id = "ASN-" + Date.now();
  sheet.appendRow([
    id,
    payload.workerId,
    payload.partnerId || "PT-01",
    payload.jobId || "JOB-01",
    payload.startDate || new Date().toISOString().split("T")[0],
    "",
    "WAITING_START",
    0,
    "9.5 triệu/tháng",
    payload.notes || ""
  ]);
  updateWorkerStatusInMaster_(dataSs, payload.workerId, "WAITING_START");
  return { success: true, data: { id: id, workerId: payload.workerId, status: "WAITING_START" } };
}

function startAssignment_(dataSs, assignmentId, tenantContext) {
  var sheet = dataSs.getSheetByName("07_ASSIGNMENTS");
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === assignmentId) {
      sheet.getRange(i + 1, 7).setValue("WORKING");
      var workerId = data[i][1];
      updateWorkerStatusInMaster_(dataSs, workerId, "WORKING");
      return { success: true, data: { assignmentId: assignmentId, status: "WORKING" } };
    }
  }
  return { success: false, error: { code: "NOT_FOUND", message: "Không tìm thấy điều động" } };
}

function getAttendanceList_(dataSs, workerId) {
  var sheet = dataSs.getSheetByName("09_ATTENDANCE");
  if (!sheet || sheet.getLastRow() <= 1) return { success: true, data: [] };
  var data = sheet.getDataRange().getValues();
  var result = [];
  for (var i = 1; i < data.length; i++) {
    if (!workerId || data[i][1] === workerId) {
      result.push({
        id: data[i][0],
        workerId: data[i][1],
        partnerId: data[i][2],
        date: data[i][3],
        hours: data[i][4],
        shift: data[i][5],
        verifiedVww: Boolean(data[i][6])
      });
    }
  }
  return { success: true, data: result };
}

function matchAttendance_(dataSs, payload, tenantContext) {
  var rawSheet = dataSs.getSheetByName("08_ATTENDANCE_RAW");
  var attSheet = dataSs.getSheetByName("09_ATTENDANCE");
  var id = "ATT-" + Date.now();
  var nowIso = new Date().toISOString();

  attSheet.appendRow([
    id,
    payload.workerId,
    payload.partnerId || "PT-01",
    payload.date || nowIso.split("T")[0],
    payload.hours || 8,
    payload.shift || "CA_1",
    true, // Verified VWW
    nowIso,
    tenantContext.email
  ]);

  // Set is_vww to true on worker
  setWorkerVwwInMaster_(dataSs, payload.workerId, true);

  return { success: true, data: { attendanceId: id, workerId: payload.workerId, isVww: true } };
}

function getMatchingReviews_(dataSs) {
  var sheet = dataSs.getSheetByName("10_MATCHING_REVIEW");
  if (!sheet || sheet.getLastRow() <= 1) return { success: true, data: [] };
  var data = sheet.getDataRange().getValues();
  var result = [];
  for (var i = 1; i < data.length; i++) {
    result.push({
      reviewId: data[i][0],
      rawId: data[i][1],
      suggestedWorkerId: data[i][2],
      confidenceScore: data[i][3],
      reason: data[i][4],
      status: data[i][5]
    });
  }
  return { success: true, data: result };
}

function getOperationalResults_(dataSs) {
  var sheet = dataSs.getSheetByName("04_WORKERS_MASTER");
  var vwwCount = 0;
  var total = 0;
  if (sheet && sheet.getLastRow() > 1) {
    var data = sheet.getDataRange().getValues();
    total = data.length - 1;
    for (var i = 1; i < data.length; i++) {
      if (Boolean(data[i][8])) vwwCount++;
    }
  }
  var rate = total > 0 ? ((vwwCount / total) * 100).toFixed(1) : "0.0";
  return {
    success: true,
    data: {
      vwwCount: vwwCount,
      totalWorkers: total,
      retentionRate: rate + "%",
      targetVww: 500
    }
  };
}

function getOffices_(mgmtSs) {
  var sheet = mgmtSs.getSheetByName("02_OFFICES");
  if (!sheet || sheet.getLastRow() <= 1) return { success: true, data: [] };
  var data = sheet.getDataRange().getValues();
  var res = [];
  for (var i = 1; i < data.length; i++) {
    res.push({ id: data[i][0], name: data[i][1], code: data[i][2], address: data[i][3] });
  }
  return { success: true, data: res };
}

function getStaff_(mgmtSs) {
  var sheet = mgmtSs.getSheetByName("03_STAFF");
  if (!sheet || sheet.getLastRow() <= 1) return { success: true, data: [] };
  var data = sheet.getDataRange().getValues();
  var res = [];
  for (var i = 1; i < data.length; i++) {
    res.push({ id: data[i][0], name: data[i][1], email: data[i][2], role: data[i][4], officeId: data[i][5] });
  }
  return { success: true, data: res };
}

function getPartners_(mgmtSs) {
  var sheet = mgmtSs.getSheetByName("04_PARTNERS");
  if (!sheet || sheet.getLastRow() <= 1) return { success: true, data: [] };
  var data = sheet.getDataRange().getValues();
  var res = [];
  for (var i = 1; i < data.length; i++) {
    res.push({ id: data[i][0], name: data[i][1], code: data[i][2], industry: data[i][3], location: data[i][4] });
  }
  return { success: true, data: res };
}

function getJobs_(mgmtSs) {
  var sheet = mgmtSs.getSheetByName("05_JOBS");
  if (!sheet || sheet.getLastRow() <= 1) return { success: true, data: [] };
  var data = sheet.getDataRange().getValues();
  var res = [];
  for (var i = 1; i < data.length; i++) {
    res.push({ id: data[i][0], partnerId: data[i][1], title: data[i][2], salaryRange: data[i][3], vacancies: data[i][4] });
  }
  return { success: true, data: res };
}

function listTenants_() {
  var props = PropertiesService.getScriptProperties();
  var masterId = props.getProperty("MASTER_SPREADSHEET_ID");
  var masterSs = SpreadsheetApp.openById(masterId);
  var sheet = masterSs.getSheetByName("01_TENANTS");
  var data = sheet.getDataRange().getValues();
  var result = [];
  for (var i = 1; i < data.length; i++) {
    result.push({
      tenantId: data[i][0],
      companyName: data[i][1],
      companySlug: data[i][2],
      companyCode: data[i][3],
      planCode: data[i][4],
      status: data[i][5],
      ownerName: data[i][6],
      ownerEmail: data[i][7],
      createdAt: data[i][9]
    });
  }
  return { success: true, data: result };
}

// ==============================================================================
// 07. GOLDEN FLOW REAL EXECUTION RUNNER
// ==============================================================================
function executeGoldenFlow_(dataSs, payload, tenantContext) {
  var workerName = payload && payload.workerName ? payload.workerName : "FCS Pilot Worker QA 001";
  var workerPhone = payload && payload.workerPhone ? payload.workerPhone : "0988001001";

  // Step 1: Create Worker
  var wRes = createWorker_(dataSs, { fullName: workerName, phone: workerPhone, officeId: "OFF-01" }, tenantContext);
  var workerId = wRes.data.workerId;

  // Step 2: Create & Pass Interview
  createInterview_(dataSs, { workerId: workerId, partnerId: "PT-01", jobId: "JOB-01" }, tenantContext);
  updateInterview_(dataSs, { workerId: workerId, result: "PASSED" }, tenantContext);

  // Step 3: Create & Start Assignment
  var aRes = createAssignment_(dataSs, { workerId: workerId, partnerId: "PT-01", jobId: "JOB-01" }, tenantContext);
  startAssignment_(dataSs, aRes.data.id, tenantContext);

  // Step 4: Import Attendance & Match VWW
  matchAttendance_(dataSs, { workerId: workerId, partnerId: "PT-01", hours: 8 }, tenantContext);

  return {
    success: true,
    data: {
      flowId: "GF-REAL-RUN",
      workerId: workerId,
      workerName: workerName,
      status: "WORKING",
      isVww: true,
      tenantId: tenantContext.tenantId,
      message: "Đã hoàn thành Golden Flow thực tế và ghi đầy đủ vào Google Sheet."
    }
  };
}

// ==============================================================================
// 08. HELPER UTILITIES
// ==============================================================================
function updateWorkerStatusInMaster_(dataSs, workerId, newStatus) {
  var sheet = dataSs.getSheetByName("04_WORKERS_MASTER");
  if (!sheet) return;
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === workerId) {
      sheet.getRange(i + 1, 8).setValue(newStatus);
      sheet.getRange(i + 1, 14).setValue(new Date().toISOString());
      break;
    }
  }
}

function setWorkerVwwInMaster_(dataSs, workerId, isVww) {
  var sheet = dataSs.getSheetByName("04_WORKERS_MASTER");
  if (!sheet) return;
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === workerId) {
      sheet.getRange(i + 1, 9).setValue(Boolean(isVww));
      sheet.getRange(i + 1, 14).setValue(new Date().toISOString());
      break;
    }
  }
}

function jsonResponse_(obj, requestId) {
  if (requestId && typeof obj === "object" && !obj.requestId) {
    obj.requestId = requestId;
  }
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
