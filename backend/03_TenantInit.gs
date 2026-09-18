/**
 * ==============================================================================
 * FCS AI WORKFORCE OS — TENANT INIT
 * Part of V4 Multi-Tenant SaaS Platform Engine
 * ==============================================================================
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
