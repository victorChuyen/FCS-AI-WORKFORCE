/**
 * FCS AI WORKFORCE OS V2 — FULL STANDALONE BACKEND
 * Chứa trọn vẹn 14 Modules (Bao gồm 00_Config.gs ở đầu file)
 */

// =============================================================================
// MODULE 0: CONFIG & SPREADSHEET INITIALIZER
// =============================================================================
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
  TAB_COMPANIES: "DM_COMPANY",
  TAB_BRANCHES: "DM_BRANCH",
  TAB_LEVEL_SALE: "DM_LEVEL_SALE",
  TAB_INFO: "INFO",
  
  // ID Prefixes
  PREFIX_WORKER: "WK-",
  PREFIX_DEAL: "DL-2026-",
  PREFIX_AUDIT: "LOG-",
  PREFIX_LEAD: "LD-"
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


// =============================================================================
// MODULE 6: VALIDATION SERVICE
// =============================================================================
/**
 * ==============================================================================
 * FCS AI WORKFORCE OS V2 — MODULE 5: VALIDATION SERVICE
 * Chức năng: Chuẩn hóa & Xác thực dữ liệu 2 tầng (Server API & Google Sheets Native):
 * 1. API Validation: validateWorkerPayloadOrReject_ & validateDealPayloadOrReject_
 * 2. Cài đặt Dropdown danh mục từ Taxonomy Ranges & Static Lists
 * 3. Bật Reject Input (Chặn nhập bậy, buộc chọn đúng từ danh mục)
 * 4. Định dạng Text (@) cho CCCD, SĐT, Tài khoản chống mất số 0 đầu
 * ==============================================================================
 */

/**
 * Kiểm tra tính hợp lệ của Payload tạo / sửa Worker theo Handoff 2026-09-16
 * @param {Object} payload Dữ liệu đầu vào
 * @returns {Object} { isValid: boolean, error?: string, warnings?: string[], normalizedData: Object }
 */
function validateWorkerPayloadOrReject_(payload) {
  if (!payload || typeof payload !== "object") {
    return { isValid: false, error: "Dữ liệu payload không hợp lệ hoặc bị rỗng." };
  }

  var warnings = [];
  var fullName = (payload.full_name || "").toString().trim().replace(/\s+/g, " ").toUpperCase();
  
  // 1. Kiểm tra Họ và Tên: ít nhất 2 từ, không chứa số hoặc ký tự đặc biệt
  if (!fullName || fullName.split(" ").length < 2) {
    return { isValid: false, error: "Họ và tên phải có đầy đủ cả Họ và Tên (tối thiểu 2 từ)." };
  }
  if (/[\d~`!@#$%^&*()_+={\[}\]|\\:;"'<,>?/]/.test(fullName)) {
    return { isValid: false, error: "Họ và tên không được chứa chữ số hoặc ký tự đặc biệt." };
  }

  // 2. Kiểm tra Số điện thoại: 10 chữ số, đầu mạng VN hợp lệ
  var rawPhone = (payload.phone || "").toString().replace(/\D/g, "");
  if (rawPhone.startsWith("84")) rawPhone = "0" + rawPhone.slice(2);
  var validPrefixes = ["03", "05", "07", "08", "09"];
  var phoneValid = rawPhone.length === 10 && validPrefixes.indexOf(rawPhone.substring(0, 2)) !== -1;
  if (!phoneValid) {
    return { isValid: false, error: "Số điện thoại không đúng định dạng 10 chữ số nhà mạng Việt Nam (03, 05, 07, 08, 09)." };
  }

  // 3. Kiểm tra CCCD: Đúng 12 chữ số nếu được cung cấp
  var rawCccd = (payload.cccd || "").toString().replace(/\D/g, "");
  if (rawCccd && rawCccd.length !== 12) {
    return { isValid: false, error: "Số CCCD bắt buộc phải đúng 12 chữ số định danh công dân VNeID." };
  }

  // 4. Giới tính: Nam hoặc Nữ
  var gender = (payload.gender || "Nam").toString().trim();
  if (["Nam", "Nữ"].indexOf(gender) === -1) {
    return { isValid: false, error: "Giới tính bắt buộc phải là 'Nam' hoặc 'Nữ'." };
  }

  // 5. Kiểm tra Ngày sinh & Cảnh báo độ tuổi
  var dob = (payload.date_of_birth || "").toString().trim();
  if (dob) {
    var dobMatch = dob.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (dobMatch) {
      var birthYear = parseInt(dobMatch[1], 10);
      var currentYear = new Date().getFullYear();
      var age = currentYear - birthYear;
      if (age < 15 || age > 75) {
        return { isValid: false, error: "Năm sinh không hợp lệ (tuổi từ 15 đến 75)." };
      }
      if (age < 18) {
        warnings.push("L1.8: Lao động thiếu tuổi (" + age + " tuổi < 18).");
      } else if (age >= 45) {
        warnings.push("L1.5: Lao động thừa tuổi (" + age + " tuổi ≥ 45).");
      }
    }
  }

  return {
    isValid: true,
    warnings: warnings,
    normalizedData: {
      full_name: fullName,
      phone: rawPhone,
      cccd: rawCccd,
      gender: gender,
      date_of_birth: dob
    }
  };
}

/**
 * Kiểm tra tính hợp lệ của Payload Deal ứng tuyển
 * @param {Object} payload Dữ liệu deal
 * @returns {Object} { isValid: boolean, error?: string }
 */
function normalizeStageCode_(stageInput) {
  if (!stageInput) return "C3";
  var s = stageInput.toString().trim();

  var validStages = [
    "C3", "C3.1", "C3.2", "L1", "L1.1", "L1.2", "L1.3", "L1.4", "L1.5", "L1.6", "L1.8",
    "L2", "L2.1", "L2.2", "L2.3", "L3", "L3.1", "L3.2", "L4"
  ];
  if (validStages.indexOf(s) !== -1) return s;

  // Hỗ trợ nhận diện cả tên đầy đủ hoặc tiền tố, ví dụ: "C3. Lao động mới", "L2.1. Lao động đỗ phỏng vấn"
  var match = s.match(/^(C3\.[12]|C3|L1\.[1234568]|L1|L2\.[123]|L2|L3\.[12]|L3|L4)/i);
  if (match) {
    var code = match[1].toUpperCase();
    if (validStages.indexOf(code) !== -1) return code;
  }
  return "";
}

/**
 * Kiểm tra tính hợp lệ của Payload Deal ứng tuyển
 * @param {Object} payload Dữ liệu deal
 * @returns {Object} { isValid: boolean, error?: string, normalizedStage?: string }
 */
function validateDealPayloadOrReject_(payload) {
  if (!payload || typeof payload !== "object") {
    return { isValid: false, error: "Dữ liệu Deal không hợp lệ." };
  }

  var workerId = (payload.worker_id || "").toString().trim();
  if (!workerId || !/^WK-\d+$/i.test(workerId)) {
    return { isValid: false, error: "Mã worker_id không hợp lệ (định dạng chuẩn: WK-XXXXXX)." };
  }

  var rawStage = (payload.level_sale_status || payload.stage || "C3").toString().trim();
  var normStage = normalizeStageCode_(rawStage);
  if (!normStage) {
    return { isValid: false, error: "Trạng thái Level Sale '" + rawStage + "' không thuộc danh mục 19 trạng thái chuẩn (C3 -> L4)." };
  }

  return { isValid: true, normalizedStage: normStage };
}

/**
 * Thiết lập Dropdown Validation bản địa 100% trên Google Sheets
 */
function applyNativeDataValidations_(ss) {
  var workerSheet = ss.getSheetByName(V2_CONFIG.TAB_WORKERS);
  var dealSheet = ss.getSheetByName(V2_CONFIG.TAB_DEALS);
  var branchSheet = ss.getSheetByName(V2_CONFIG.TAB_BRANCHES);
  var companySheet = ss.getSheetByName(V2_CONFIG.TAB_COMPANIES);
  var lsSheet = ss.getSheetByName(V2_CONFIG.TAB_LEVEL_SALE);
  
  if (workerSheet) {
    // 1. Dropdown Giới tính (Cột D)
    var genderRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Nam", "Nữ"], true)
      .setAllowInvalid(false)
      .setHelpText("Vui lòng chọn giới tính trong danh sách: Nam hoặc Nữ.")
      .build();
    workerSheet.getRange("D2:D").setDataValidation(genderRule);

    // 2. Dropdown Tình trạng hôn nhân (Cột Q)
    var maritalRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Đã kết hôn", "Chưa kết hôn", "Ly hôn"], true)
      .setAllowInvalid(false)
      .setHelpText("Vui lòng chọn tình trạng hôn nhân hợp lệ.")
      .build();
    workerSheet.getRange("Q2:Q").setDataValidation(maritalRule);
    
    // 3. Dropdown Chi nhánh (Cột Y) trỏ DM_BRANCH!B2:B9
    if (branchSheet) {
      var branchRule = SpreadsheetApp.newDataValidation()
        .requireValueInRange(branchSheet.getRange("B2:B9"), true)
        .setAllowInvalid(false)
        .setHelpText("Vui lòng chọn 1 trong 8 chi nhánh tuyển dụng chuẩn của FCS.")
        .build();
      workerSheet.getRange("Y2:Y").setDataValidation(branchRule);
      if (dealSheet) dealSheet.getRange("G2:G").setDataValidation(branchRule);
    }
    
    // 4. Dropdown Công ty (Cột Z) trỏ DM_COMPANY!B2:B30
    if (companySheet) {
      var companyRule = SpreadsheetApp.newDataValidation()
        .requireValueInRange(companySheet.getRange("B2:B30"), true)
        .setAllowInvalid(false)
        .setHelpText("Vui lòng chọn 1 trong 29 đối tác / nhà máy chuẩn của FCS.")
        .build();
      workerSheet.getRange("Z2:Z").setDataValidation(companyRule);
      if (dealSheet) dealSheet.getRange("F2:F").setDataValidation(companyRule);
    }

    // 5. Dropdown Hình thức làm việc (Cột AA)
    var workTypeRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Chính thức", "Thời vụ", "Theo ca"], true)
      .setAllowInvalid(false)
      .setHelpText("Vui lòng chọn hình thức làm việc: Chính thức, Thời vụ hoặc Theo ca.")
      .build();
    workerSheet.getRange("AA2:AA").setDataValidation(workTypeRule);

    // 6. Dropdown Trạng thái phỏng vấn (Cột AD)
    var interviewStatusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Đỗ", "Trượt", "Hủy", "Chưa phỏng vấn"], true)
      .setAllowInvalid(false)
      .setHelpText("Vui lòng chọn trạng thái phỏng vấn hợp lệ.")
      .build();
    workerSheet.getRange("AD2:AD").setDataValidation(interviewStatusRule);

    // 7. Dropdown Tình trạng đi làm (Cột AE)
    var workingStatusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Đang đi làm", "Nghỉ việc", "Chưa đi làm"], true)
      .setAllowInvalid(false)
      .setHelpText("Vui lòng chọn tình trạng đi làm hợp lệ.")
      .build();
    workerSheet.getRange("AE2:AE").setDataValidation(workingStatusRule);

    // 8. Định dạng Plain Text (@) cho CCCD (F), SĐT (T), STK (U), SĐT người thân (S)
    workerSheet.getRange("F2:F").setNumberFormat("@");
    workerSheet.getRange("S2:S").setNumberFormat("@");
    workerSheet.getRange("T2:T").setNumberFormat("@");
    workerSheet.getRange("U2:U").setNumberFormat("@");
  }
  
  if (dealSheet) {
    // 9. Dropdown 19 Level Sale (Cột H) trỏ DM_LEVEL_SALE!A2:A20
    if (lsSheet) {
      var lsRule = SpreadsheetApp.newDataValidation()
        .requireValueInRange(lsSheet.getRange("A2:A20"), true)
        .setAllowInvalid(false)
        .setHelpText("Vui lòng chọn trạng thái trong 19 Level Sale chuẩn (C3 -> L4).")
        .build();
      dealSheet.getRange("H2:H").setDataValidation(lsRule);
    }

    // 10. Dropdown Kết quả phỏng vấn (Cột L)
    var interviewResultRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Đỗ phỏng vấn", "Trượt phỏng vấn", "Không đến phỏng vấn", "Chờ kết quả"], true)
      .setAllowInvalid(false)
      .setHelpText("Vui lòng chọn kết quả phỏng vấn.")
      .build();
    dealSheet.getRange("L2:L").setDataValidation(interviewResultRule);

    // 11. Dropdown Tình trạng làm việc thực tế (Cột N)
    var actualWorkStatusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Đang làm việc", "Nghỉ việc ngang", "Muốn đổi công ty", "Đã hết thời gian phí", "Chưa đi làm"], true)
      .setAllowInvalid(false)
      .setHelpText("Vui lòng chọn tình trạng làm việc thực tế.")
      .build();
    dealSheet.getRange("N2:N").setDataValidation(actualWorkStatusRule);

    // 12. Dropdown Trạng thái hoa hồng (Cột R)
    var commissionStatusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Chờ duyệt", "Đã duyệt Lead", "Đã duyệt Manager", "Đã thanh toán"], true)
      .setAllowInvalid(false)
      .setHelpText("Vui lòng chọn trạng thái thanh quyết toán hoa hồng.")
      .build();
    dealSheet.getRange("R2:R").setDataValidation(commissionStatusRule);

    // 13. Định dạng Plain Text cho Phone (D), CCCD (E)
    dealSheet.getRange("D2:D").setNumberFormat("@");
    dealSheet.getRange("E2:E").setNumberFormat("@");
  }
}


// =============================================================================
// MODULE 7: AUDIT SERVICE
// =============================================================================
/**
 * ==============================================================================
 * FCS AI WORKFORCE OS V2 — MODULE 6: AUDIT SERVICE
 * Chức năng: Quản lý vết kiểm toán (Audit Trail) bất biến thời gian thực:
 * 1. Ghi nhận nhật ký mọi tác vụ (CREATE, UPDATE, STATUS_CHANGE, SOFT_DELETE)
 * 2. Định dạng mã chuẩn Handoff: LOG-YYYYMMDD-XXXX
 * 3. Lưu vết: Ai làm, thời điểm, bảng nào, dòng nào, giá trị cũ/mới, lý do
 * ==============================================================================
 */

function setupAuditLogSheet_(ss) {
  var sheet = getOrCreateSheet_(ss, V2_CONFIG.TAB_AUDIT_LOG);
  if (sheet.getLastRow() === 0) {
    var headers = [
      "log_id", "timestamp", "actor_email", "actor_role", "sheet_name",
      "record_id", "action", "field_name", "old_value", "new_value", "reason_notes"
    ];
    sheet.appendRow(headers);
    formatHeaderRow_(sheet, headers.length, "#334155"); // Slate Dark
  }
}

/**
 * Ghi vết kiểm toán chuẩn định dạng LOG-YYYYMMDD-XXXX
 */
function logAuditActionV2_(ss, log) {
  try {
    var sheet = ss.getSheetByName(V2_CONFIG.TAB_AUDIT_LOG);
    if (!sheet) return;

    var now = new Date();
    var dateStr = Utilities.formatDate(now, "GMT+7", "yyyyMMdd");
    var rowCount = sheet.getLastRow();
    var seq = ("000000" + Math.max(1, rowCount)).slice(-6);
    var logId = V2_CONFIG.PREFIX_AUDIT + dateStr + "-" + seq;

    sheet.appendRow([
      logId,
      now.toISOString(),
      log.actor_email || "",
      log.actor_role || "",
      log.sheet_name || "",
      log.record_id || "",
      log.action || "UPDATE",
      log.field_name || "",
      log.old_value !== undefined && log.old_value !== null ? log.old_value.toString() : "",
      log.new_value !== undefined && log.new_value !== null ? log.new_value.toString() : "",
      log.reason_notes || ""
    ]);
  } catch (err) {
    Logger.log("Lỗi ghi Audit Log: " + err.message);
  }
}

/**
 * Adapter alias tương thích cho các module nghiệp vụ
 */
function appendAuditLogV2_(logObj, ss) {
  if (!ss) ss = getSpreadsheetV2_();
  logAuditActionV2_(ss, {
    actor_email: logObj.actor_email || "",
    actor_role: logObj.actor_id || "USER",
    sheet_name: logObj.sheet_name || V2_CONFIG.TAB_DEALS,
    record_id: logObj.deal_id || logObj.worker_id || "",
    action: logObj.action || "UPDATE",
    field_name: "level_sale_status",
    old_value: logObj.from_stage || "",
    new_value: logObj.to_stage || "",
    reason_notes: typeof logObj.metadata === "object" ? JSON.stringify(logObj.metadata) : (logObj.metadata || "")
  });
}

/**
 * Lấy danh sách vết kiểm toán có phân trang
 */
function handleListAuditLogsV2_(params, ss) {
  var sheet = ss.getSheetByName(V2_CONFIG.TAB_AUDIT_LOG);
  if (!sheet) return { success: false, error: "Sheet not found" };
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, count: 0, items: [] };

  var headers = data[0];
  var limit = parseInt((params && params.limit) || "50", 10);
  var recordIdFilter = ((params && params.record_id) || "").toString().trim();
  var sheetFilter = ((params && params.sheet_name) || "").toString().trim();

  var items = [];
  var idIdx = headers.indexOf("record_id");
  var sheetIdx = headers.indexOf("sheet_name");

  // Lấy các dòng mới nhất ở cuối sheet
  for (var i = data.length - 1; i >= 1; i--) {
    var row = data[i];
    if (recordIdFilter && (row[idIdx] || "").toString().indexOf(recordIdFilter) === -1) {
      continue;
    }
    if (sheetFilter && (row[sheetIdx] || "").toString().indexOf(sheetFilter) === -1) {
      continue;
    }

    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    items.push(obj);

    if (items.length >= limit) break;
  }

  return {
    success: true,
    data: items,
    count: items.length,
    items: items
  };
}


// =============================================================================
// MODULE 5: SECURITY & PROTECTED RANGES
// =============================================================================
/**
 * ==============================================================================
 * FCS AI WORKFORCE OS V2 — MODULE 4: SECURITY SERVICE
 * Chức năng: Quản lý bảo mật bản địa Google Sheets:
 * 1. Phân quyền dải ô bảo vệ (Protected Ranges) theo Gmail (coach.chuyen@gmail.com)
 * 2. Khóa cứng Cột A (Khóa chính Worker ID & Deal ID) chống sửa/xóa bậy
 * 3. Khóa toàn bộ Sheet Danh mục (Taxonomy) & Nhật ký (Audit Log)
 * ==============================================================================
 */

function applyNativeGmailProtections_(ss) {
  var adminEmail = V2_CONFIG.SUPER_ADMIN_EMAIL;
  var sheetsToProtectColA = [V2_CONFIG.TAB_WORKERS, V2_CONFIG.TAB_DEALS];
  
  // 1. Khóa Cột A (Worker ID & Deal ID)
  sheetsToProtectColA.forEach(function(tabName) {
    var sheet = ss.getSheetByName(tabName);
    if (!sheet) return;
    
    // Dọn dẹp protection cũ trên Cột A nếu có để chống chồng lấn
    try {
      var existingProtections = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
      for (var p = 0; p < existingProtections.length; p++) {
        var r = existingProtections[p].getRange();
        if (r && r.getColumn() === 1 && r.getNumColumns() === 1) {
          existingProtections[p].remove();
        }
      }
    } catch(e) {}

    var idRange = sheet.getRange("A:A");
    var protection = idRange.protect().setDescription("🔒 Khóa Khóa chính ID - Chỉ Admin " + adminEmail + " có quyền sửa");
    
    // Đảm bảo chỉ có adminEmail có quyền sửa
    protection.removeEditors(protection.getEditors());
    protection.addEditor(adminEmail);
    if (protection.canDomainEdit()) {
      protection.setDomainEdit(false);
    }
  });
  
  // 2. Khóa toàn bộ Sheet Danh mục chuẩn (COMPANY, BRANCH, LEVEL_SALE)
  var taxonomySheets = [V2_CONFIG.TAB_BRANCHES, V2_CONFIG.TAB_COMPANIES, V2_CONFIG.TAB_LEVEL_SALE];
  taxonomySheets.forEach(function(tabName) {
    var sheet = ss.getSheetByName(tabName);
    if (!sheet) return;

    try {
      var existingProtections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
      for (var p = 0; p < existingProtections.length; p++) {
        existingProtections[p].remove();
      }
    } catch(e) {}

    var protection = sheet.protect().setDescription("🔒 Khóa Danh mục chuẩn - Chỉ Admin " + adminEmail + " có quyền sửa");
    protection.removeEditors(protection.getEditors());
    protection.addEditor(adminEmail);
    if (protection.canDomainEdit()) {
      protection.setDomainEdit(false);
    }
  });

  // 3. Khóa toàn bộ Sheet 03_AUDIT_LOG (Chống chỉnh sửa vết kiểm toán)
  var auditSheet = ss.getSheetByName(V2_CONFIG.TAB_AUDIT_LOG);
  if (auditSheet) {
    try {
      var existingProtections = auditSheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
      for (var p = 0; p < existingProtections.length; p++) {
        existingProtections[p].remove();
      }
    } catch(e) {}

    var auditProtection = auditSheet.protect().setDescription("🔒 Khóa Sổ cái Kiểm toán - Bất biến thời gian thực");
    auditProtection.removeEditors(auditProtection.getEditors());
    auditProtection.addEditor(adminEmail);
    if (auditProtection.canDomainEdit()) {
      auditProtection.setDomainEdit(false);
    }
  }
}


// =============================================================================
// MODULE 4: TAXONOMY SERVICE
// =============================================================================
/**
 * ==============================================================================
 * FCS AI WORKFORCE OS V2 — MODULE 3: TAXONOMY SERVICE
 * Chức năng: Quản lý danh mục chuẩn nền tảng (29 Công ty, 8 Chi nhánh, 19 Level Sale)
 * ==============================================================================
 */

function setupTaxonomySheets_(ss) {
  // 1. BRANCH (8 Chi nhánh tuyển dụng)
  var brSheet = getOrCreateSheet_(ss, V2_CONFIG.TAB_BRANCHES);
  if (brSheet.getLastRow() <= 1) {
    brSheet.clear();
    brSheet.appendRow(["STT", "TÊN CHI NHÁNH", "MÃ CHI NHÁNH", "TRẠNG THÁI"]);
    formatHeaderRow_(brSheet, 4, "#1E3A8A"); // Dark Blue
    var branches = [
      [1, "HÀ NAM", "HNM", "ACTIVE"],
      [2, "NAM ĐỊNH", "NDH", "ACTIVE"],
      [3, "HƯNG YÊN", "HYN", "ACTIVE"],
      [4, "QUẢNG NINH", "QNH", "ACTIVE"],
      [5, "BẮC GIANG", "BGG", "ACTIVE"],
      [6, "HẢI PHÒNG", "HPG", "ACTIVE"],
      [7, "NINH BÌNH", "NBH", "ACTIVE"],
      [8, "VĨNH PHÚC", "VPC", "ACTIVE"]
    ];
    brSheet.getRange(2, 1, branches.length, 4).setValues(branches);
  }

  // 2. COMPANY (29 Công ty / Đối tác nhà máy)
  var compSheet = getOrCreateSheet_(ss, V2_CONFIG.TAB_COMPANIES);
  if (compSheet.getLastRow() <= 1) {
    compSheet.clear();
    compSheet.appendRow(["STT", "TÊN CÔNG TY ĐỐI TÁC", "MÃ", "NGÀNH NGHỀ / HỆ SINH THÁI"]);
    formatHeaderRow_(compSheet, 4, "#1E3A8A");
    var companies = [
      [1, "WNC", "WNC", "Điện tử"],
      [2, "WISTRON", "WISTRON", "Điện tử"],
      [3, "AVC", "AVC", "Điện tử"],
      [4, "LCFC 2", "LCFC2", "Điện tử"],
      [5, "FOSITEK", "FOSITEK", "Điện tử"],
      [6, "LCFC3", "LCFC3", "Điện tử"],
      [7, "HANKOOK", "HANKOOK", "Linh kiện ô tô"],
      [8, "GEMTEK", "GEMTEK", "Viễn thông"],
      [9, "QISDA", "QISDA", "Điện tử"],
      [10, "RISUNTEK", "RISUNTEK", "Tai nghe / Loa"],
      [11, "TOPSUN", "TOPSUN", "Năng lượng mặt trời"],
      [12, "DARFON", "DARFON", "Điện tử"],
      [13, "MYS", "MYS", "Bao bì công nghiệp"],
      [14, "GT", "GT", "Cơ khí chính xác"],
      [15, "PARTNER", "PARTNER", "Đối tác tổng hợp"],
      [16, "ANAM", "ANAM", "Điện tử"],
      [17, "QUANTA", "QUANTA", "Máy tính xách tay"],
      [18, "LUXSHARE", "LUXSHARE", "Hệ sinh thái Apple/Foxconn"],
      [19, "FUYU", "FUYU", "Foxconn Bắc Giang"],
      [20, "NEWWING", "NEWWING", "Foxconn Đình Trám"],
      [21, "FUKANG", "FUKANG", "Foxconn Quang Châu"],
      [22, "FULIAN", "FULIAN", "Foxconn Vân Trung"],
      [23, "GOERTEK", "GOERTEK", "Acoustics Quế Võ"],
      [24, "CANON", "CANON", "Thiết bị quang học"],
      [25, "BROTHER", "BROTHER", "Máy văn phòng"],
      [26, "SYSTEK", "SYSTEK", "Điện tử"],
      [27, "HAMADEN", "HAMADEN", "Linh kiện ô tô"],
      [28, "UNIBEN", "UNIBEN", "Hàng tiêu dùng"],
      [29, "KINH ĐÔ", "KINH_DO", "Thực phẩm / Bánh kẹo"]
    ];
    compSheet.getRange(2, 1, companies.length, 4).setValues(companies);
  }

  // 3. LEVEL_SALE (19 Trạng thái phễu tuyển dụng)
  var lsSheet = getOrCreateSheet_(ss, V2_CONFIG.TAB_LEVEL_SALE);
  if (lsSheet.getLastRow() <= 1) {
    lsSheet.clear();
    lsSheet.appendRow(["MÃ TRẠNG THÁI", "TÊN ĐẦY ĐỦ", "NHÓM PHỄU", "PHÂN QUYỀN VẬN HÀNH"]);
    formatHeaderRow_(lsSheet, 4, "#0F766E"); // Teal
    var levelSales = [
      ["C3", "C3. Lao động mới", "TIẾP NHẬN", "Leader Sale, Sale, MKT, Manager"],
      ["C3.1", "C3.1. Số trùng", "TIẾP NHẬN", "Leader Sale, Sale, MKT"],
      ["C3.2", "C3.2. Số rác", "TIẾP NHẬN", "Leader Sale, Sale, MKT"],
      ["L1", "L1. Số lao động chia cho sale", "CHĂM SÓC", "Leader Sale, Manager, Sale"],
      ["L1.1", "L1.1. Tham khảo", "CHĂM SÓC", "Sale, Leader Sale"],
      ["L1.2", "L1.2. Chăm sóc lại", "CHĂM SÓC", "Sale, Leader Sale"],
      ["L1.3", "L1.3. Từ chối tiếp xúc. Không có nhu cầu", "CHĂM SÓC", "Sale, Leader Sale"],
      ["L1.4", "L1.4. TB, KNM, MB", "CHĂM SÓC", "Sale, Leader Sale"],
      ["L1.5", "L1.5. Thừa tuổi từ 45 tuổi trở lên", "CHĂM SÓC", "Sale, Leader Sale"],
      ["L1.6", "L1.6. Hẹn gọi lại", "CHĂM SÓC", "Sale, Leader Sale"],
      ["L1.8", "L1.8. Lao động thiếu tuổi", "CHĂM SÓC", "Sale, Leader Sale"],
      ["L2", "L2. Lao động hẹn phỏng vấn", "PHỎNG VẤN", "Hiện trường, Sale, Manager"],
      ["L2.1", "L2.1. Lao động đỗ phỏng vấn", "PHỎNG VẤN", "Hiện trường, Sale, Manager"],
      ["L2.2", "L2.2. Lao động trượt phỏng vấn", "PHỎNG VẤN", "Hiện trường, Sale, Manager"],
      ["L2.3", "L2.3. Lao động hẹn không đến phỏng vấn", "PHỎNG VẤN", "Hiện trường, Sale, Manager"],
      ["L3", "L3. Lao động đang đi làm", "ĐI LÀM", "Hiện trường, Manager"],
      ["L3.1", "L3.1. Lao động nghỉ ngang", "ĐI LÀM", "Hiện trường, Manager"],
      ["L3.2", "L3.2. Lao động muốn chuyển công ty khác", "ĐI LÀM", "Hiện trường, Manager, Sale"],
      ["L4", "L4. Lao động hết thời gian tính phí", "NGHIỆM THU", "Kế toán, Manager, Admin"]
    ];
    lsSheet.getRange(2, 1, levelSales.length, 4).setValues(levelSales);
  }
}

function handleGetTaxonomyV2_(ss) {
  var readSheetRows_ = function(tabName) {
    var s = ss.getSheetByName(tabName);
    if (!s) return [];
    var vals = s.getDataRange().getValues();
    if (vals.length <= 1) return [];
    var headers = vals[0];
    var list = [];
    for (var i = 1; i < vals.length; i++) {
      var item = {};
      for (var j = 0; j < headers.length; j++) {
        item[headers[j]] = vals[i][j];
      }
      list.push(item);
    }
    return list;
  };

  var taxObj = {
    companies: readSheetRows_(V2_CONFIG.TAB_COMPANIES),
    branches: readSheetRows_(V2_CONFIG.TAB_BRANCHES),
    levelSales: readSheetRows_(V2_CONFIG.TAB_LEVEL_SALE)
  };

  return {
    success: true,
    data: taxObj,
    companies: taxObj.companies,
    branches: taxObj.branches,
    levelSales: taxObj.levelSales
  };
}


// =============================================================================
// MODULE 2: MASTER WORKER SERVICE
// =============================================================================
/**
 * ==============================================================================
 * FCS AI WORKFORCE OS V2 — MODULE 1: WORKER SERVICE
 * Chức năng: Quản lý hồ sơ gốc lao động 34 cột VNeID
 * Cơ chế: Atomic Sequential Lock chống va chạm ID, tra cứu O(1) CCCD / Phone
 * Tính năng: Create, Get (Worker 360 View), Update (Audit Trail), Soft Delete,
 *           Pagination, Search & Filter
 * ==============================================================================
 */

function setupMasterWorkersSheet_(ss) {
  var sheet = getOrCreateSheet_(ss, V2_CONFIG.TAB_WORKERS);
  if (sheet.getLastRow() === 0) {
    var headers = [
      "worker_id", "dept", "full_name", "gender", "date_of_birth", "cccd",
      "issuing_date", "graduated_school", "major", "graduation_year",
      "hometown", "nation", "birth_place", "vneid_address", "permanent_residence",
      "social_insurance_no", "marital_status", "relative_name", "relative_phone",
      "phone", "vietcombank_account", "staff_code", "sourcing_recruiter", "consultant_sale",
      "branch", "target_company", "work_type", "interview_date", "start_working_date",
      "interview_status", "working_status", "resignation_date", "referral_source", "created_at"
    ];
    sheet.appendRow(headers);
    formatHeaderRow_(sheet, headers.length, "#047857"); // Emerald
  }
}

/**
 * Tiếp nhận & tạo mới hồ sơ Master Worker với Atomic Mutex Lock & Validation 2 tầng
 */
function handleCreateWorkerV2_(payload, ss) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000); // Chờ khóa tối đa 30 giây
  } catch (e) {
    return { success: false, error: "Hệ thống đang bận ghi dữ liệu, vui lòng thử lại sau giây lát." };
  }

  try {
    var sheet = ss.getSheetByName(V2_CONFIG.TAB_WORKERS);
    if (!sheet) {
      return { success: false, error: "Không tìm thấy sheet " + V2_CONFIG.TAB_WORKERS };
    }

    // 1. Validation 2 tầng nâng cao
    var val = validateWorkerPayloadOrReject_(payload);
    if (!val.isValid) {
      return { success: false, error: val.error };
    }

    var norm = val.normalizedData;
    var fullName = norm.full_name;
    var phone = norm.phone;
    var cccd = norm.cccd;

    // 2. Kiểm tra trùng lặp trên Master Workers
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var phoneIdx = headers.indexOf("phone");
    var cccdIdx = headers.indexOf("cccd");
    var idIdx = headers.indexOf("worker_id");

    var maxIdNum = 0;
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var rowId = (row[idIdx] || "").toString().trim();
      var m = rowId.match(/WK-(\d+)/);
      if (m) {
        var num = parseInt(m[1], 10);
        if (num > maxIdNum) maxIdNum = num;
      }

      // Kiểm tra trùng Phone hoặc CCCD
      var rowPhone = normalizePhoneV2_(row[phoneIdx]);
      var rowCccd = normalizeCccdV2_(row[cccdIdx]);
      if ((rowPhone && rowPhone === phone) || (cccd && rowCccd && rowCccd === cccd)) {
        var existingWorker = {
          worker_id: rowId,
          full_name: row[headers.indexOf("full_name")],
          phone: rowPhone
        };
        return {
          success: true,
          isExisting: true,
          data: existingWorker,
          worker_id: rowId,
          full_name: row[headers.indexOf("full_name")],
          phone: rowPhone,
          message: "Lao động đã có hồ sơ trong hệ thống."
        };
      }
    }

    // 3. Cấp phát Worker ID tuần tự mới
    var newIdNum = maxIdNum + 1;
    var newWorkerId = V2_CONFIG.PREFIX_WORKER + ("000000" + newIdNum).slice(-6);
    var nowIso = new Date().toISOString();

    // 4. Tạo dòng mới 34 cột
    var newRow = [
      newWorkerId,
      payload.dept || "",
      fullName,
      norm.gender || "Nam",
      norm.date_of_birth || "",
      cccd ? "'" + cccd : "",
      payload.issuing_date || "",
      payload.graduated_school || "",
      payload.major || "",
      payload.graduation_year || "",
      payload.hometown || "",
      payload.nation || "Kinh",
      payload.birth_place || "",
      payload.vneid_address || "",
      payload.permanent_residence || "",
      payload.social_insurance_no || "",
      payload.marital_status || "Chưa kết hôn",
      payload.relative_name || "",
      payload.relative_phone ? "'" + normalizePhoneV2_(payload.relative_phone) : "",
      "'" + phone,
      payload.vietcombank_account ? "'" + payload.vietcombank_account : "",
      payload.staff_code || "",
      payload.sourcing_recruiter || "",
      payload.consultant_sale || "",
      payload.branch || "HÀ NAM",
      payload.target_company || "WNC",
      payload.work_type || "Chính thức",
      payload.interview_date || "",
      payload.start_working_date || "",
      payload.interview_status || "Chưa phỏng vấn",
      payload.working_status || "Chưa đi làm",
      payload.resignation_date || "",
      payload.referral_source || "",
      nowIso
    ];

    sheet.appendRow(newRow);

    // Ghi log kiểm toán chuẩn
    logAuditActionV2_(ss, {
      actor_email: payload.actor_email || V2_CONFIG.SUPER_ADMIN_EMAIL,
      actor_role: payload.actor_role || "RECRUITER",
      sheet_name: V2_CONFIG.TAB_WORKERS,
      record_id: newWorkerId,
      action: "CREATE",
      field_name: "ALL",
      old_value: "",
      new_value: fullName,
      reason_notes: "Tạo mới hồ sơ Master Worker 34 trường VNeID"
    });

    var createdWorker = {
      worker_id: newWorkerId,
      full_name: fullName,
      phone: phone
    };
    return {
      success: true,
      isExisting: false,
      data: createdWorker,
      worker_id: newWorkerId,
      full_name: fullName,
      phone: phone,
      warnings: val.warnings,
      message: "Tạo hồ sơ lao động mới thành công."
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Worker 360 Degree View: Lấy thông tin chi tiết hồ sơ gốc + Toàn bộ lịch sử Deals
 */
function handleGetWorkerV2_(params, ss) {
  var id = (params && (params.worker_id || params.id || "")).toString().trim();
  var phone = normalizePhoneV2_(params && params.phone);
  var cccd = normalizeCccdV2_(params && params.cccd);

  if (!id && !phone && !cccd) {
    return { success: false, error: "Vui lòng cung cấp worker_id, phone hoặc cccd." };
  }

  var workerSheet = ss.getSheetByName(V2_CONFIG.TAB_WORKERS);
  if (!workerSheet) return { success: false, error: "Không tìm thấy sheet " + V2_CONFIG.TAB_WORKERS };

  var data = workerSheet.getDataRange().getValues();
  if (data.length <= 1) return { success: false, error: "Hồ sơ không tồn tại." };

  var headers = data[0];
  var idIdx = headers.indexOf("worker_id");
  var phoneIdx = headers.indexOf("phone");
  var cccdIdx = headers.indexOf("cccd");

  var workerObj = null;
  var matchedWorkerId = "";

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var rId = (row[idIdx] || "").toString().trim();
    var rPhone = normalizePhoneV2_(row[phoneIdx]);
    var rCccd = normalizeCccdV2_(row[cccdIdx]);

    if ((id && rId.toLowerCase() === id.toLowerCase()) ||
        (phone && rPhone === phone) ||
        (cccd && rCccd === cccd)) {
      matchedWorkerId = rId;
      workerObj = {};
      for (var j = 0; j < headers.length; j++) {
        workerObj[headers[j]] = row[j];
      }
      break;
    }
  }

  if (!workerObj) {
    return { success: false, error: "Không tìm thấy hồ sơ người lao động." };
  }

  // Lấy toàn bộ lịch sử Deals của Worker từ TAB_DEALS
  var dealSheet = ss.getSheetByName(V2_CONFIG.TAB_DEALS);
  var deals = [];
  if (dealSheet) {
    var dealData = dealSheet.getDataRange().getValues();
    if (dealData.length > 1) {
      var dealHeaders = dealData[0];
      var dWorkerIdx = dealHeaders.indexOf("worker_id");
      for (var k = 1; k < dealData.length; k++) {
        if ((dealData[k][dWorkerIdx] || "").toString().trim() === matchedWorkerId) {
          var dObj = {};
          for (var col = 0; col < dealHeaders.length; col++) {
            dObj[dealHeaders[col]] = dealData[k][col];
          }
          deals.push(dObj);
        }
      }
    }
  }

  return {
    success: true,
    data: {
      worker: workerObj,
      deals_history: deals,
      total_deals: deals.length
    },
    worker: workerObj,
    deals_history: deals,
    total_deals: deals.length
  };
}

/**
 * Cập nhật hồ sơ Worker kèm Audit Trail chi tiết từng trường
 */
function handleUpdateWorkerV2_(payload, ss) {
  var workerId = (payload.worker_id || "").toString().trim();
  if (!workerId) {
    return { success: false, error: "Bắt buộc phải có worker_id để cập nhật." };
  }

  var sheet = ss.getSheetByName(V2_CONFIG.TAB_WORKERS);
  if (!sheet) return { success: false, error: "Sheet not found" };

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idIdx = headers.indexOf("worker_id");

  var rowIndex = -1;
  var currentRow = null;
  for (var i = 1; i < data.length; i++) {
    if ((data[i][idIdx] || "").toString().trim() === workerId) {
      rowIndex = i + 1;
      currentRow = data[i];
      break;
    }
  }

  if (rowIndex === -1) {
    return { success: false, error: "Không tìm thấy Worker " + workerId };
  }

  var updatedFields = [];
  var editableFields = [
    "dept", "full_name", "gender", "date_of_birth", "cccd", "issuing_date",
    "graduated_school", "major", "graduation_year", "hometown", "nation",
    "birth_place", "vneid_address", "permanent_residence", "social_insurance_no",
    "marital_status", "relative_name", "relative_phone", "phone",
    "vietcombank_account", "staff_code", "sourcing_recruiter", "consultant_sale",
    "branch", "target_company", "work_type", "interview_date", "start_working_date",
    "interview_status", "working_status", "resignation_date", "referral_source"
  ];

  for (var f = 0; f < editableFields.length; f++) {
    var field = editableFields[f];
    if (payload[field] !== undefined) {
      var colIdx = headers.indexOf(field);
      if (colIdx !== -1) {
        var oldVal = (currentRow[colIdx] !== undefined && currentRow[colIdx] !== null) ? currentRow[colIdx].toString() : "";
        var newVal = payload[field].toString().trim();

        // Chuẩn hóa định dạng nếu là Phone / CCCD / STK
        if (field === "phone" || field === "relative_phone") {
          newVal = normalizePhoneV2_(newVal);
          if (newVal) sheet.getRange(rowIndex, colIdx + 1).setValue("'" + newVal);
        } else if (field === "cccd" || field === "vietcombank_account") {
          newVal = newVal.replace(/\D/g, "");
          if (newVal) sheet.getRange(rowIndex, colIdx + 1).setValue("'" + newVal);
        } else {
          sheet.getRange(rowIndex, colIdx + 1).setValue(newVal);
        }

        if (oldVal !== newVal) {
          updatedFields.push({ field: field, oldVal: oldVal, newVal: newVal });
          // Ghi nhật ký kiểm toán cho từng trường nhạy cảm
          logAuditActionV2_(ss, {
            actor_email: payload.actor_email || V2_CONFIG.SUPER_ADMIN_EMAIL,
            actor_role: payload.actor_role || "MANAGER",
            sheet_name: V2_CONFIG.TAB_WORKERS,
            record_id: workerId,
            action: "UPDATE",
            field_name: field,
            old_value: oldVal,
            new_value: newVal,
            reason_notes: payload.reason_notes || "Cập nhật thông tin lao động"
          });
        }
      }
    }
  }

  return {
    success: true,
    worker_id: workerId,
    updated_fields_count: updatedFields.length,
    updated_fields: updatedFields,
    message: "Cập nhật hồ sơ lao động thành công."
  };
}

/**
 * Xóa mềm (Soft Delete) hồ sơ lao động theo quy chuẩn Handoff 2.4
 */
function handleSoftDeleteWorkerV2_(payload, ss) {
  var workerId = (payload.worker_id || "").toString().trim();
  var reason = (payload.delete_reason || payload.reason || "").toString().trim();

  if (!workerId) return { success: false, error: "Thiếu worker_id cần xóa mềm." };
  if (!reason) return { success: false, error: "Bắt buộc phải cung cấp lý do xóa mềm (delete_reason)." };

  var sheet = ss.getSheetByName(V2_CONFIG.TAB_WORKERS);
  if (!sheet) return { success: false, error: "Sheet not found" };

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idIdx = headers.indexOf("worker_id");
  var statusIdx = headers.indexOf("working_status");
  var notesIdx = headers.indexOf("referral_source");

  var rowIndex = -1;
  var oldStatus = "";
  for (var i = 1; i < data.length; i++) {
    if ((data[i][idIdx] || "").toString().trim() === workerId) {
      rowIndex = i + 1;
      oldStatus = data[i][statusIdx];
      break;
    }
  }

  if (rowIndex === -1) return { success: false, error: "Không tìm thấy Worker " + workerId };

  var deleteNote = "[DELETED: " + new Date().toISOString() + " by " + (payload.actor_email || V2_CONFIG.SUPER_ADMIN_EMAIL) + "] Lý do: " + reason;
  sheet.getRange(rowIndex, statusIdx + 1).setValue("ĐÃ XÓA (DELETED)");
  if (notesIdx !== -1) {
    sheet.getRange(rowIndex, notesIdx + 1).setValue(deleteNote);
  }

  logAuditActionV2_(ss, {
    actor_email: payload.actor_email || V2_CONFIG.SUPER_ADMIN_EMAIL,
    actor_role: payload.actor_role || "ADMIN",
    sheet_name: V2_CONFIG.TAB_WORKERS,
    record_id: workerId,
    action: "SOFT_DELETE",
    field_name: "working_status",
    old_value: oldStatus,
    new_value: "ĐÃ XÓA (DELETED)",
    reason_notes: reason
  });

  return {
    success: true,
    worker_id: workerId,
    status: "ĐÃ XÓA (DELETED)",
    message: "Đã xóa mềm hồ sơ lao động an toàn."
  };
}

/**
 * Danh sách Worker có phân trang, tìm kiếm & bộ lọc đa điều kiện
 */
function handleListWorkersV2_(params, ss) {
  var sheet = ss.getSheetByName(V2_CONFIG.TAB_WORKERS);
  if (!sheet) return { success: false, error: "Sheet not found" };
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, total: 0, items: [] };

  var headers = data[0];
  var limit = parseInt((params && params.limit) || "50", 10);
  var offset = parseInt((params && params.offset) || "0", 10);
  var search = ((params && params.search) || "").toString().trim().toLowerCase();
  var filterBranch = ((params && params.branch) || "").toString().trim().toUpperCase();
  var filterCompany = ((params && params.company) || "").toString().trim().toUpperCase();
  var filterStatus = ((params && params.status) || "").toString().trim().toLowerCase();
  var includeDeleted = (params && (params.include_deleted === "true" || params.include_deleted === true));

  var nameIdx = headers.indexOf("full_name");
  var phoneIdx = headers.indexOf("phone");
  var cccdIdx = headers.indexOf("cccd");
  var idIdx = headers.indexOf("worker_id");
  var branchIdx = headers.indexOf("branch");
  var compIdx = headers.indexOf("target_company");
  var statusIdx = headers.indexOf("working_status");

  var filtered = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var statusVal = (row[statusIdx] || "").toString();

    // Ẩn các hồ sơ bị xóa mềm nếu không yêu cầu
    if (!includeDeleted && statusVal.indexOf("DELETED") !== -1) {
      continue;
    }

    // Bộ lọc chi nhánh
    if (filterBranch && (row[branchIdx] || "").toString().toUpperCase().indexOf(filterBranch) === -1) {
      continue;
    }

    // Bộ lọc công ty
    if (filterCompany && (row[compIdx] || "").toString().toUpperCase().indexOf(filterCompany) === -1) {
      continue;
    }

    // Bộ lọc trạng thái làm việc
    if (filterStatus && statusVal.toLowerCase().indexOf(filterStatus) === -1) {
      continue;
    }

    // Tìm kiếm từ khóa (Tên, SĐT, CCCD, Worker ID)
    if (search) {
      var rowStr = (row[nameIdx] + " " + row[phoneIdx] + " " + row[cccdIdx] + " " + row[idIdx]).toLowerCase();
      if (rowStr.indexOf(search) === -1) {
        continue;
      }
    }

    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    filtered.push(obj);
  }

  var paginated = filtered.slice(offset, offset + limit);

  return {
    success: true,
    data: paginated,
    total: filtered.length,
    offset: offset,
    limit: limit,
    count: paginated.length,
    items: paginated
  };
}

function normalizePhoneV2_(phone) {
  if (!phone) return "";
  var s = phone.toString().replace(/\D/g, "");
  if (s.startsWith("84")) s = "0" + s.slice(2);
  return s;
}

function normalizeCccdV2_(cccd) {
  if (!cccd) return "";
  return cccd.toString().replace(/\D/g, "");
}


// =============================================================================
// MODULE 3: CRM DEAL SERVICE
// =============================================================================
/**
 * ==============================================================================
 * FCS AI WORKFORCE OS V2 — MODULE 2: CRM DEAL SERVICE
 * Chức năng: Quản lý vòng đời 19 Level Sale (C3 -> L4) cho từng đợt ứng tuyển
 * Cơ chế: Atomic Sequential Lock, VLOOKUP bản địa, Validation 2 tầng,
 *           Audit Trail khi đổi Stage, Soft Delete, Pagination & Kanban Filters
 * ==============================================================================
 */

function setupCrmDealsSheet_(ss) {
  var sheet = getOrCreateSheet_(ss, V2_CONFIG.TAB_DEALS);
  if (sheet.getLastRow() === 0) {
    var headers = [
      "deal_id", "worker_id", "full_name", "phone", "cccd",
      "target_company", "branch", "level_sale_status", "assigned_sale",
      "referral_ven_ctv", "interview_date", "interview_result", "start_date",
      "actual_work_status", "is_vww", "commission_policy", "commission_amount",
      "commission_status", "notes", "created_at", "updated_at", "updated_by"
    ];
    sheet.appendRow(headers);
    formatHeaderRow_(sheet, headers.length, "#0F766E"); // Teal
  }
}

/**
 * Tạo Deal ứng tuyển mới cho người lao động (Atomic Lock)
 */
function handleCreateDealV2_(payload, ss) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (e) {
    return { success: false, error: "Hệ thống đang bận ghi nhận Deal, vui lòng thử lại." };
  }

  try {
    var sheet = ss.getSheetByName(V2_CONFIG.TAB_DEALS);
    if (!sheet) return { success: false, error: "Không tìm thấy sheet " + V2_CONFIG.TAB_DEALS };

    // Validation
    var val = validateDealPayloadOrReject_(payload);
    if (!val.isValid) {
      return { success: false, error: val.error };
    }

    var workerId = (payload.worker_id || "").toString().trim();

    // 1. Tính Deal ID tuần tự
    var data = sheet.getDataRange().getValues();
    var maxDealNum = 0;
    for (var i = 1; i < data.length; i++) {
      var dId = (data[i][0] || "").toString();
      var m = dId.match(/DL-2026-(\d+)/);
      if (m) {
        var num = parseInt(m[1], 10);
        if (num > maxDealNum) maxDealNum = num;
      }
    }

    var newDealNum = maxDealNum + 1;
    var newDealId = V2_CONFIG.PREFIX_DEAL + ("000000" + newDealNum).slice(-6);
    var nowIso = new Date().toISOString();
    var nextRow = data.length + 1;

    // 2. Tạo dòng mới có sẵn công thức VLOOKUP bản địa
    var newRow = [
      newDealId,
      workerId,
      '=IFERROR(VLOOKUP(B' + nextRow + ", '" + V2_CONFIG.TAB_WORKERS + "'!A:C, 3, FALSE), \"\")",
      '=IFERROR(VLOOKUP(B' + nextRow + ", '" + V2_CONFIG.TAB_WORKERS + "'!A:T, 20, FALSE), \"\")",
      '=IFERROR(VLOOKUP(B' + nextRow + ", '" + V2_CONFIG.TAB_WORKERS + "'!A:F, 6, FALSE), \"\")",
      payload.target_company || "WNC",
      payload.branch || "HÀ NAM",
      payload.level_sale_status || "C3",
      payload.assigned_sale || "",
      payload.referral_ven_ctv || "",
      payload.interview_date || "",
      payload.interview_result || "Chờ kết quả",
      payload.start_date || "",
      payload.actual_work_status || "Chưa đi làm",
      payload.is_vww === true,
      payload.commission_policy || "",
      payload.commission_amount || 0,
      "Chờ duyệt",
      payload.notes || "Lead mới tiếp nhận",
      nowIso,
      nowIso,
      payload.actor_email || V2_CONFIG.SUPER_ADMIN_EMAIL
    ];

    sheet.appendRow(newRow);
    SpreadsheetApp.flush();

    // Tra cứu nhanh thông tin Worker để trả về ngay cho Frontend
    var workerName = payload.full_name || "";
    var workerPhone = payload.phone || "";
    var workerCccd = payload.cccd || "";
    if (!workerName || !workerPhone) {
      var wSheet = ss.getSheetByName(V2_CONFIG.TAB_WORKERS);
      if (wSheet) {
        var wData = wSheet.getDataRange().getValues();
        for (var w = 1; w < wData.length; w++) {
          if ((wData[w][0] || "").toString().trim() === workerId) {
            workerName = workerName || wData[w][2] || "";
            workerPhone = workerPhone || wData[w][19] || "";
            workerCccd = workerCccd || wData[w][5] || "";
            break;
          }
        }
      }
    }

    var dealObj = {
      deal_id: newDealId,
      worker_id: workerId,
      full_name: workerName,
      phone: workerPhone,
      cccd: workerCccd,
      target_company: payload.target_company || "WNC",
      branch: payload.branch || "HÀ NAM",
      level_sale_status: (val && val.normalizedStage) || payload.level_sale_status || "C3",
      assigned_sale: payload.assigned_sale || "",
      referral_ven_ctv: payload.referral_ven_ctv || "",
      interview_date: payload.interview_date || "",
      interview_result: payload.interview_result || "Chờ kết quả",
      start_date: payload.start_date || "",
      actual_work_status: payload.actual_work_status || "Chưa đi làm",
      is_vww: payload.is_vww === true,
      commission_policy: payload.commission_policy || "",
      commission_amount: payload.commission_amount || 0,
      commission_status: "Chờ duyệt",
      notes: payload.notes || "Lead mới tiếp nhận",
      created_at: nowIso,
      updated_at: nowIso,
      updated_by: payload.actor_email || V2_CONFIG.SUPER_ADMIN_EMAIL
    };

    // Ghi vết kiểm toán vào bảng 03_AUDIT_LOG
    logAuditActionV2_(ss, {
      actor_email: payload.actor_email || V2_CONFIG.SUPER_ADMIN_EMAIL,
      actor_role: payload.actor_role || "RECRUITER",
      sheet_name: V2_CONFIG.TAB_DEALS,
      record_id: newDealId,
      action: "CREATE",
      field_name: "ALL",
      old_value: "",
      new_value: dealObj.level_sale_status,
      reason_notes: "Tạo Deal ứng tuyển mới cho " + workerId
    });

    return {
      success: true,
      data: dealObj,
      deal: dealObj,
      deal_id: newDealId,
      worker_id: workerId,
      status: dealObj.level_sale_status,
      message: "Tạo Deal tuyển dụng thành công."
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Chuyển trạng thái Level Sale (Kanban Move Stage)
 */
function handleMoveStageV2_(payload, ss) {
  var sheet = ss.getSheetByName(V2_CONFIG.TAB_DEALS);
  if (!sheet) return { success: false, error: "Sheet not found" };

  var dealId = (payload.deal_id || "").toString().trim();
  var newStage = (payload.new_stage || "").toString().trim();
  if (!dealId || !newStage) {
    return { success: false, error: "Thiếu deal_id hoặc new_stage." };
  }

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idIdx = headers.indexOf("deal_id");
  var stageIdx = headers.indexOf("level_sale_status");
  var updatedIdx = headers.indexOf("updated_at");
  var userIdx = headers.indexOf("updated_by");
  var notesIdx = headers.indexOf("notes");

  var rowIndex = -1;
  var oldStage = "";
  for (var i = 1; i < data.length; i++) {
    if (data[i][idIdx] === dealId) {
      rowIndex = i + 1;
      oldStage = data[i][stageIdx];
      break;
    }
  }

  if (rowIndex === -1) {
    return { success: false, error: "Không tìm thấy Deal " + dealId };
  }

  var nowIso = new Date().toISOString();
  sheet.getRange(rowIndex, stageIdx + 1).setValue(newStage);
  sheet.getRange(rowIndex, updatedIdx + 1).setValue(nowIso);
  sheet.getRange(rowIndex, userIdx + 1).setValue(payload.actor_email || V2_CONFIG.SUPER_ADMIN_EMAIL);
  if (payload.notes) {
    sheet.getRange(rowIndex, notesIdx + 1).setValue(payload.notes);
  }

  // Tự động cập nhật is_vww nếu tiến tới L4
  if (newStage === "L4") {
    var vwwIdx = headers.indexOf("is_vww");
    if (vwwIdx !== -1) {
      sheet.getRange(rowIndex, vwwIdx + 1).setValue(true);
    }
  }

  // Ghi log vào 03_AUDIT_LOG
  logAuditActionV2_(ss, {
    actor_email: payload.actor_email || V2_CONFIG.SUPER_ADMIN_EMAIL,
    actor_role: payload.actor_role || "SALE",
    sheet_name: V2_CONFIG.TAB_DEALS,
    record_id: dealId,
    action: "STATUS_CHANGE",
    field_name: "level_sale_status",
    old_value: oldStage,
    new_value: newStage,
    reason_notes: payload.notes || ("Chuyển trạng thái Level Sale sang " + newStage)
  });

  SpreadsheetApp.flush();

  var updatedDeal = {
    deal_id: dealId,
    old_stage: oldStage,
    new_stage: newStage,
    updated_at: nowIso
  };

  return {
    success: true,
    data: updatedDeal,
    deal_id: dealId,
    old_stage: oldStage,
    new_stage: newStage,
    updated_at: nowIso,
    message: "Chuyển trạng thái thành công."
  };
}

/**
 * Cập nhật thông tin chi tiết của Deal kèm Audit Trail
 */
function handleUpdateDealV2_(payload, ss) {
  var dealId = (payload.deal_id || "").toString().trim();
  if (!dealId) return { success: false, error: "Bắt buộc phải có deal_id để cập nhật." };

  var sheet = ss.getSheetByName(V2_CONFIG.TAB_DEALS);
  if (!sheet) return { success: false, error: "Sheet not found" };

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idIdx = headers.indexOf("deal_id");

  var rowIndex = -1;
  var currentRow = null;
  for (var i = 1; i < data.length; i++) {
    if (data[i][idIdx] === dealId) {
      rowIndex = i + 1;
      currentRow = data[i];
      break;
    }
  }

  if (rowIndex === -1) return { success: false, error: "Không tìm thấy Deal " + dealId };

  var updatedFields = [];
  var editableFields = [
    "target_company", "branch", "assigned_sale", "referral_ven_ctv",
    "interview_date", "interview_result", "start_date", "actual_work_status",
    "is_vww", "commission_policy", "commission_amount", "commission_status", "notes"
  ];

  for (var f = 0; f < editableFields.length; f++) {
    var field = editableFields[f];
    if (payload[field] !== undefined) {
      var colIdx = headers.indexOf(field);
      if (colIdx !== -1) {
        var oldVal = (currentRow[colIdx] !== undefined && currentRow[colIdx] !== null) ? currentRow[colIdx].toString() : "";
        var newVal = payload[field].toString().trim();

        sheet.getRange(rowIndex, colIdx + 1).setValue(payload[field]);

        if (oldVal !== newVal) {
          updatedFields.push({ field: field, oldVal: oldVal, newVal: newVal });
          logAuditActionV2_(ss, {
            actor_email: payload.actor_email || V2_CONFIG.SUPER_ADMIN_EMAIL,
            actor_role: payload.actor_role || "SALE",
            sheet_name: V2_CONFIG.TAB_DEALS,
            record_id: dealId,
            action: "UPDATE",
            field_name: field,
            old_value: oldVal,
            new_value: newVal,
            reason_notes: payload.reason_notes || "Cập nhật thông tin Deal"
          });
        }
      }
    }
  }

  var nowIso = new Date().toISOString();
  var updatedIdx = headers.indexOf("updated_at");
  var userIdx = headers.indexOf("updated_by");
  if (updatedIdx !== -1) sheet.getRange(rowIndex, updatedIdx + 1).setValue(nowIso);
  if (userIdx !== -1) sheet.getRange(rowIndex, userIdx + 1).setValue(payload.actor_email || V2_CONFIG.SUPER_ADMIN_EMAIL);

  return {
    success: true,
    deal_id: dealId,
    updated_fields_count: updatedFields.length,
    updated_fields: updatedFields,
    message: "Cập nhật thông tin Deal thành công."
  };
}

/**
 * Xóa mềm Deal ứng tuyển (Soft Delete)
 */
function handleSoftDeleteDealV2_(payload, ss) {
  var dealId = (payload.deal_id || "").toString().trim();
  var reason = (payload.delete_reason || payload.reason || "").toString().trim();

  if (!dealId) return { success: false, error: "Thiếu deal_id cần xóa mềm." };
  if (!reason) return { success: false, error: "Bắt buộc phải cung cấp lý do xóa mềm (delete_reason)." };

  var sheet = ss.getSheetByName(V2_CONFIG.TAB_DEALS);
  if (!sheet) return { success: false, error: "Sheet not found" };

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idIdx = headers.indexOf("deal_id");
  var stageIdx = headers.indexOf("level_sale_status");
  var notesIdx = headers.indexOf("notes");

  var rowIndex = -1;
  var oldStage = "";
  for (var i = 1; i < data.length; i++) {
    if (data[i][idIdx] === dealId) {
      rowIndex = i + 1;
      oldStage = data[i][stageIdx];
      break;
    }
  }

  if (rowIndex === -1) return { success: false, error: "Không tìm thấy Deal " + dealId };

  var deleteNote = "[DELETED: " + new Date().toISOString() + " by " + (payload.actor_email || V2_CONFIG.SUPER_ADMIN_EMAIL) + "] Lý do: " + reason;
  sheet.getRange(rowIndex, stageIdx + 1).setValue("DELETED");
  if (notesIdx !== -1) {
    sheet.getRange(rowIndex, notesIdx + 1).setValue(deleteNote);
  }

  logAuditActionV2_(ss, {
    actor_email: payload.actor_email || V2_CONFIG.SUPER_ADMIN_EMAIL,
    actor_role: payload.actor_role || "ADMIN",
    sheet_name: V2_CONFIG.TAB_DEALS,
    record_id: dealId,
    action: "SOFT_DELETE",
    field_name: "level_sale_status",
    old_value: oldStage,
    new_value: "DELETED",
    reason_notes: reason
  });

  return {
    success: true,
    deal_id: dealId,
    status: "DELETED",
    message: "Đã xóa mềm Deal tuyển dụng an toàn."
  };
}

/**
 * Danh sách Deal có phân trang, tìm kiếm & bộ lọc Kanban
 */
function handleListDealsV2_(params, ss) {
  var sheet = ss.getSheetByName(V2_CONFIG.TAB_DEALS);
  if (!sheet) return { success: false, error: "Sheet not found" };
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, total: 0, items: [] };

  var headers = data[0];
  var limit = parseInt((params && params.limit) || "100", 10);
  var offset = parseInt((params && params.offset) || "0", 10);
  var search = ((params && params.search) || "").toString().trim().toLowerCase();
  var filterStage = ((params && (params.stage || params.level_sale_status)) || "").toString().trim();
  var filterBranch = ((params && params.branch) || "").toString().trim().toUpperCase();
  var filterCompany = ((params && params.company) || "").toString().trim().toUpperCase();
  var filterSale = ((params && params.assigned_sale) || "").toString().trim().toLowerCase();
  var includeDeleted = (params && (params.include_deleted === "true" || params.include_deleted === true));

  var idIdx = headers.indexOf("deal_id");
  var workerIdx = headers.indexOf("worker_id");
  var nameIdx = headers.indexOf("full_name");
  var phoneIdx = headers.indexOf("phone");
  var cccdIdx = headers.indexOf("cccd");
  var stageIdx = headers.indexOf("level_sale_status");
  var branchIdx = headers.indexOf("branch");
  var compIdx = headers.indexOf("target_company");
  var saleIdx = headers.indexOf("assigned_sale");

  var filtered = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var stageVal = (row[stageIdx] || "").toString();

    // Ẩn Deal bị xóa mềm nếu không yêu cầu
    if (!includeDeleted && stageVal === "DELETED") {
      continue;
    }

    // Lọc theo Stage (Kanban Column)
    if (filterStage && stageVal !== filterStage) {
      continue;
    }

    // Lọc theo Branch
    if (filterBranch && (row[branchIdx] || "").toString().toUpperCase().indexOf(filterBranch) === -1) {
      continue;
    }

    // Lọc theo Company
    if (filterCompany && (row[compIdx] || "").toString().toUpperCase().indexOf(filterCompany) === -1) {
      continue;
    }

    // Lọc theo Sale
    if (filterSale && (row[saleIdx] || "").toString().toLowerCase().indexOf(filterSale) === -1) {
      continue;
    }

    // Tìm kiếm
    if (search) {
      var rowStr = (row[idIdx] + " " + row[workerIdx] + " " + row[nameIdx] + " " + row[phoneIdx] + " " + row[cccdIdx]).toLowerCase();
      if (rowStr.indexOf(search) === -1) {
        continue;
      }
    }

    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    filtered.push(obj);
  }

  var paginated = filtered.slice(offset, offset + limit);

  return {
    success: true,
    data: paginated,
    total: filtered.length,
    offset: offset,
    limit: limit,
    count: paginated.length,
    items: paginated
  };
}


// =============================================================================
// MODULE 9: DASHBOARD KPI SERVICE
// =============================================================================
/**
 * ==============================================================================
 * FCS AI WORKFORCE OS V2 — MODULE 9: DASHBOARD KPI SERVICE
 * Chức năng: Báo cáo số liệu thời gian thực cho Executive Dashboard & Analytics
 * 1. Tổng số Master Worker & Active Deals
 * 2. Phân bổ theo 19 Level Sale (C3 -> L4)
 * 3. Thước đo North Star: VWW (Verified Working Workers)
 * 4. Phân bổ theo 8 Chi nhánh & 29 Nhà máy đối tác
 * 5. Tỷ lệ chuyển đổi phễu tuyển dụng (Conversion Funnel)
 * ==============================================================================
 */

function handleGetDashboardStatsV2_(ss) {
  var workerSheet = ss.getSheetByName(V2_CONFIG.TAB_WORKERS);
  var dealSheet = ss.getSheetByName(V2_CONFIG.TAB_DEALS);

  var totalWorkers = 0;
  var workersDeleted = 0;
  var workersByGender = { Nam: 0, "Nữ": 0 };

  if (workerSheet) {
    var wData = workerSheet.getDataRange().getValues();
    var wHeaders = wData[0] || [];
    var wGenderIdx = wHeaders.indexOf("gender");
    var wStatusIdx = wHeaders.indexOf("working_status");

    for (var i = 1; i < wData.length; i++) {
      var row = wData[i];
      var wStatus = (row[wStatusIdx] || "").toString();
      if (wStatus.indexOf("DELETED") !== -1) {
        workersDeleted++;
      } else {
        totalWorkers++;
        var g = (row[wGenderIdx] || "").toString().trim();
        if (g === "Nữ") workersByGender["Nữ"]++;
        else workersByGender.Nam++;
      }
    }
  }

  var totalDeals = 0;
  var dealsDeleted = 0;
  var totalVww = 0;
  var stageCounts = {
    C3: 0, "C3.1": 0, "C3.2": 0,
    L1: 0, "L1.1": 0, "L1.2": 0, "L1.3": 0, "L1.4": 0, "L1.5": 0, "L1.6": 0, "L1.8": 0,
    L2: 0, "L2.1": 0, "L2.2": 0, "L2.3": 0,
    L3: 0, "L3.1": 0, "L3.2": 0,
    L4: 0
  };
  var branchCounts = {};
  var companyCounts = {};

  if (dealSheet) {
    var dData = dealSheet.getDataRange().getValues();
    var dHeaders = dData[0] || [];
    var dStageIdx = dHeaders.indexOf("level_sale_status");
    var dBranchIdx = dHeaders.indexOf("branch");
    var dCompIdx = dHeaders.indexOf("target_company");
    var dVwwIdx = dHeaders.indexOf("is_vww");

    for (var k = 1; k < dData.length; k++) {
      var dRow = dData[k];
      var stage = (dRow[dStageIdx] || "").toString().trim();

      if (stage === "DELETED") {
        dealsDeleted++;
        continue;
      }

      totalDeals++;
      if (stageCounts[stage] !== undefined) {
        stageCounts[stage]++;
      } else {
        stageCounts[stage] = 1;
      }

      // Đếm VWW (Verified Working Worker)
      var isVww = dRow[dVwwIdx] === true || dRow[dVwwIdx] === "TRUE" || stage === "L4";
      if (isVww) totalVww++;

      // Đếm theo chi nhánh
      var b = (dRow[dBranchIdx] || "CHƯA PHÂN BỔ").toString().trim().toUpperCase();
      branchCounts[b] = (branchCounts[b] || 0) + 1;

      // Đếm theo công ty đối tác
      var c = (dRow[dCompIdx] || "CHƯA PHÂN BỔ").toString().trim().toUpperCase();
      companyCounts[c] = (companyCounts[c] || 0) + 1;
    }
  }

  // Nhóm theo các chặng lớn của phễu
  var groupC3 = (stageCounts["C3"] || 0) + (stageCounts["C3.1"] || 0) + (stageCounts["C3.2"] || 0);
  var groupL1 = (stageCounts["L1"] || 0) + (stageCounts["L1.1"] || 0) + (stageCounts["L1.2"] || 0) +
                (stageCounts["L1.3"] || 0) + (stageCounts["L1.4"] || 0) + (stageCounts["L1.5"] || 0) +
                (stageCounts["L1.6"] || 0) + (stageCounts["L1.8"] || 0);
  var groupL2 = (stageCounts["L2"] || 0) + (stageCounts["L2.1"] || 0) + (stageCounts["L2.2"] || 0) + (stageCounts["L2.3"] || 0);
  var groupL3 = (stageCounts["L3"] || 0) + (stageCounts["L3.1"] || 0) + (stageCounts["L3.2"] || 0);
  var groupL4 = (stageCounts["L4"] || 0);

  // Tỷ lệ chuyển đổi phễu
  var convC3toL2 = totalDeals > 0 ? Math.round((groupL2 + groupL3 + groupL4) / totalDeals * 100) : 0;
  var convL2toL3 = (groupL2 + groupL3 + groupL4) > 0 ? Math.round((groupL3 + groupL4) / (groupL2 + groupL3 + groupL4) * 100) : 0;
  var convL3toVww = (groupL3 + groupL4) > 0 ? Math.round(totalVww / (groupL3 + groupL4) * 100) : 0;

  var metricsObj = {
    total_workers: totalWorkers,
    workers_deleted: workersDeleted,
    workers_by_gender: workersByGender,
    total_deals: totalDeals,
    deals_deleted: dealsDeleted,
    north_star_vww: totalVww,
    funnel_groups: {
      stage_c3_new_leads: groupC3,
      stage_l1_consulting: groupL1,
      stage_l2_interviewing: groupL2,
      stage_l3_working: groupL3,
      stage_l4_commission_vww: groupL4
    },
    conversion_rates: {
      c3_to_interview_percent: convC3toL2,
      interview_to_work_percent: convL2toL3,
      work_to_vww_percent: convL3toVww
    },
    stage_breakdown: stageCounts,
    branch_distribution: branchCounts,
    company_distribution: companyCounts
  };

  return {
    success: true,
    data: metricsObj,
    timestamp: new Date().toISOString(),
    metrics: metricsObj
  };
}


// =============================================================================
// MODULE 10: BATCH IMPORT SERVICE
// =============================================================================
/**
 * ==============================================================================
 * FCS AI WORKFORCE OS V2 — MODULE 10: BATCH IMPORT SERVICE
 * Chức năng: Tiếp nhận dữ liệu số lượng lớn (Batch Intake 100-500 ứng viên),
 *            Cơ chế chống trùng O(1) trong RAM, phân loại tự động C3, C3.1, C3.2
 * ==============================================================================
 */

function handleBatchImportWorkersV2_(payload, ss) {
  if (!ss) ss = getSpreadsheetV2_();
  if (!ss) return { success: false, error: "Không thể kết nối Spreadsheet V2." };

  var items = payload.items || payload.data || [];
  if (!Array.isArray(items) || items.length === 0) {
    return { success: false, error: "Danh sách lao động nạp hàng loạt (items) không hợp lệ hoặc rỗng." };
  }

  var defaultBranch = (payload.default_branch || "BẮC GIANG").toString().trim();
  var defaultCompany = (payload.default_company || "PARTNER").toString().trim();
  var defaultSource = (payload.referral_source || payload.source || "MKT_BATCH").toString().trim();
  var actorId = payload.actor_id || "SYSTEM_BATCH";
  var actorEmail = payload.actor_email || V2_CONFIG.SUPER_ADMIN_EMAIL;

  var workerSheet = ss.getSheetByName(V2_CONFIG.TAB_WORKERS);
  var dealSheet = ss.getSheetByName(V2_CONFIG.TAB_DEALS);

  if (!workerSheet || !dealSheet) {
    return { success: false, error: "Không tìm thấy bảng 01_MASTER_WORKERS hoặc 02_CRM_DEALS_2026." };
  }

  // 1. Quét Master Workers hiện có vào RAM
  var wData = workerSheet.getDataRange().getValues();
  var wHeaders = wData[0] || [];
  var wIdIdx = wHeaders.indexOf("worker_id");
  var wPhoneIdx = wHeaders.indexOf("phone");
  var wCccdIdx = wHeaders.indexOf("cccd");

  var cccdToWorkerId = {};
  var phoneToWorkerId = {};
  var maxWorkerNum = 0;

  for (var i = 1; i < wData.length; i++) {
    var row = wData[i];
    var wid = (row[wIdIdx] || "").toString().trim();
    var cccd = (row[wCccdIdx] || "").toString().replace(/[^0-9]/g, "");
    var phone = (row[wPhoneIdx] || "").toString().replace(/[^0-9]/g, "");

    if (cccd) cccdToWorkerId[cccd] = wid;
    if (phone) phoneToWorkerId[phone] = wid;

    var numMatch = wid.match(/WK-(\d+)/);
    if (numMatch) {
      var n = parseInt(numMatch[1], 10);
      if (n > maxWorkerNum) maxWorkerNum = n;
    }
  }

  // 2. Quét CRM Deals hiện có để kiểm tra trùng trong 30 ngày
  var dData = dealSheet.getDataRange().getValues();
  var dHeaders = dData[0] || [];
  var dWorkerIdIdx = dHeaders.indexOf("worker_id");
  var dCreatedIdx = dHeaders.indexOf("created_at");
  var dDealIdIdx = dHeaders.indexOf("deal_id");

  var workerRecentDealMap = {};
  var currentYear = new Date().getFullYear();
  var maxDealNum = 0;
  var thirtyDaysAgo = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;

  for (var j = 1; j < dData.length; j++) {
    var dRow = dData[j];
    var dWid = (dRow[dWorkerIdIdx] || "").toString().trim();
    var dTimeStr = dRow[dCreatedIdx];
    var dTime = dTimeStr ? new Date(dTimeStr).getTime() : 0;
    var did = (dRow[dDealIdIdx] || "").toString().trim();

    if (dWid && dTime > thirtyDaysAgo) {
      workerRecentDealMap[dWid] = true;
    }

    var didMatch = did.match(/DL-\d{4}-(\d+)/);
    if (didMatch) {
      var dn = parseInt(didMatch[1], 10);
      if (dn > maxDealNum) maxDealNum = dn;
    }
  }

  // 3. Xử lý từng record đầu vào
  var newWorkerRows = [];
  var newDealRows = [];
  var createdDealIds = [];
  var nowIso = new Date().toISOString();

  var stats = {
    total_received: items.length,
    new_workers_created: 0,
    deals_created: 0,
    valid_c3_count: 0,
    duplicate_c3_1_count: 0,
    invalid_c3_2_count: 0
  };

  var dealRowStart = dealSheet.getLastRow() + 1;

  for (var k = 0; k < items.length; k++) {
    var item = items[k];
    var rawName = (item.full_name || item.name || "").toString().trim().toUpperCase();
    var rawPhone = (item.phone || item.sdt || "").toString().replace(/[^0-9]/g, "");
    var rawCccd = (item.cccd || "").toString().replace(/[^0-9]/g, "");
    var rawGender = (item.gender || "Nam").toString().trim();
    var rawHometown = (item.hometown || item.que_quan || "Chưa rõ").toString().trim();
    var targetComp = (item.target_company || defaultCompany).toString().trim();
    var branch = (item.branch || defaultBranch).toString().trim();
    var assignedSale = (item.assigned_sale || "").toString().trim();

    // Chuẩn hóa SĐT (đầu 0 hoặc 84)
    if (rawPhone.startsWith("84") && rawPhone.length === 11) {
      rawPhone = "0" + rawPhone.slice(2);
    }

    var isInvalidPhone = !rawPhone || rawPhone.length < 10 || !rawPhone.startsWith("0");
    var isInvalidName = !rawName || rawName.length < 3;

    var targetStage = "C3";
    var note = "";

    if (isInvalidPhone || isInvalidName) {
      targetStage = "C3.2";
      note = "Số rác / Tên hoặc SĐT không hợp lệ: " + (rawPhone || "Trống");
      stats.invalid_c3_2_count++;
    }

    // Xác định Worker ID (đã có hay mới)
    var existingWorkerId = null;
    if (rawCccd && cccdToWorkerId[rawCccd]) {
      existingWorkerId = cccdToWorkerId[rawCccd];
    } else if (rawPhone && phoneToWorkerId[rawPhone]) {
      existingWorkerId = phoneToWorkerId[rawPhone];
    }

    var workerId = existingWorkerId;
    if (!workerId) {
      maxWorkerNum++;
      workerId = "WK-" + ("000000" + maxWorkerNum).slice(-6);
      if (rawCccd) cccdToWorkerId[rawCccd] = workerId;
      if (rawPhone) phoneToWorkerId[rawPhone] = workerId;

      // Tạo dòng Master Worker mới (34 cột)
      var workerRow = new Array(34).fill("");
      workerRow[0] = workerId;
      workerRow[2] = rawName || "ỨNG VIÊN MỚI";
      workerRow[3] = rawGender === "Nữ" ? "Nữ" : "Nam";
      workerRow[4] = item.date_of_birth || "2000-01-01";
      workerRow[5] = rawCccd;
      workerRow[10] = rawHometown;
      workerRow[13] = rawHometown;
      workerRow[14] = rawHometown;
      workerRow[19] = rawPhone;
      workerRow[24] = branch;
      workerRow[25] = targetComp;
      workerRow[26] = "Chính thức";
      workerRow[29] = "Chưa phỏng vấn";
      workerRow[30] = "Chưa đi làm";
      workerRow[32] = defaultSource;
      workerRow[33] = nowIso;

      newWorkerRows.push(workerRow);
      stats.new_workers_created++;
    }

    // Kiểm tra trùng lặp Deal trong 30 ngày
    if (targetStage !== "C3.2") {
      if (workerRecentDealMap[workerId]) {
        targetStage = "C3.1";
        note = "Trùng SĐT/CCCD với Deal đã tiếp nhận trong vòng 30 ngày";
        stats.duplicate_c3_1_count++;
      } else {
        targetStage = "C3";
        stats.valid_c3_count++;
        workerRecentDealMap[workerId] = true;
      }
    }

    // Tạo dòng CRM Deal mới (22 cột)
    maxDealNum++;
    var dealId = "DL-" + currentYear + "-" + ("000000" + maxDealNum).slice(-6);
    createdDealIds.push(dealId);

    var currentDealRowIndex = dealRowStart + newDealRows.length;
    var dealRow = new Array(22).fill("");
    dealRow[0] = dealId;
    dealRow[1] = workerId;
    dealRow[2] = "=IFERROR(VLOOKUP(B" + currentDealRowIndex + ", '01_MASTER_WORKERS'!A:C, 3, FALSE), \"\")";
    dealRow[3] = "=IFERROR(VLOOKUP(B" + currentDealRowIndex + ", '01_MASTER_WORKERS'!A:T, 20, FALSE), \"\")";
    dealRow[4] = "=IFERROR(VLOOKUP(B" + currentDealRowIndex + ", '01_MASTER_WORKERS'!A:F, 6, FALSE), \"\")";
    dealRow[5] = targetComp;
    dealRow[6] = branch;
    dealRow[7] = targetStage;
    dealRow[8] = assignedSale;
    dealRow[9] = defaultSource;
    dealRow[14] = false; // is_vww
    dealRow[18] = note;
    dealRow[19] = nowIso;
    dealRow[20] = nowIso;
    dealRow[21] = actorEmail;

    newDealRows.push(dealRow);
    stats.deals_created++;
  }

  // 4. Batch write vào Sheet
  if (newWorkerRows.length > 0) {
    var wNextRow = workerSheet.getLastRow() + 1;
    workerSheet.getRange(wNextRow, 1, newWorkerRows.length, 34).setValues(newWorkerRows);
  }

  if (newDealRows.length > 0) {
    dealSheet.getRange(dealRowStart, 1, newDealRows.length, 22).setValues(newDealRows);
  }

  SpreadsheetApp.flush();

  // 5. Ghi Audit Log cho đợt import
  appendAuditLogV2_({
    deal_id: createdDealIds[0] || "BATCH",
    worker_id: "MULTIPLE",
    actor_id: actorId,
    actor_email: actorEmail,
    action: "BATCH_IMPORT_WORKERS",
    from_stage: "",
    to_stage: "C3",
    metadata: stats
  }, ss);

  return {
    success: true,
    message: "Nạp hàng loạt " + items.length + " ứng viên thành công!",
    data: {
      stats: stats,
      created_deal_ids: createdDealIds.slice(0, 50)
    }
  };
}


// =============================================================================
// MODULE 11: FIELD DISPATCH SERVICE
// =============================================================================
/**
 * ==============================================================================
 * FCS AI WORKFORCE OS V2 — MODULE 11: FIELD DISPATCH SERVICE
 * Chức năng: Điều phối hiện trường đón xưởng & Điểm danh 1-chạm tại cổng nhà máy
 *            Hỗ trợ Roster phỏng vấn, phân bổ KTX, chuyển xưởng khi trượt và cứu deal bùng hẹn
 * ==============================================================================
 */

/**
 * Xuất danh sách Roster phỏng vấn tại cổng xưởng theo ngày / công ty / chi nhánh
 */
function handleGetInterviewRosterV2_(params, ss) {
  if (!ss) ss = getSpreadsheetV2_();
  if (!ss) return { success: false, error: "Không thể kết nối Spreadsheet V2." };

  var filterDate = (params.date || "").toString().trim(); // YYYY-MM-DD hoặc rỗng
  var filterCompany = (params.company || "").toString().trim().toUpperCase();
  var filterBranch = (params.branch || "").toString().trim().toUpperCase();
  var filterStage = (params.stage || "").toString().trim().toUpperCase(); // L2, L2.1, L2.2, L2.3

  var dealSheet = ss.getSheetByName(V2_CONFIG.TAB_DEALS);
  var workerSheet = ss.getSheetByName(V2_CONFIG.TAB_WORKERS);

  if (!dealSheet || !workerSheet) {
    return { success: false, error: "Không tìm thấy bảng Deals hoặc Workers." };
  }

  // Lập bản đồ Master Worker để lấy chi tiết nhân khẩu học
  var wData = workerSheet.getDataRange().getValues();
  var wHeaders = wData[0] || [];
  var wIdIdx = wHeaders.indexOf("worker_id");
  var wNameIdx = wHeaders.indexOf("full_name");
  var wPhoneIdx = wHeaders.indexOf("phone");
  var wCccdIdx = wHeaders.indexOf("cccd");
  var wGenderIdx = wHeaders.indexOf("gender");
  var wDobIdx = wHeaders.indexOf("date_of_birth");
  var wHomeIdx = wHeaders.indexOf("hometown");

  var workerMap = {};
  for (var i = 1; i < wData.length; i++) {
    var r = wData[i];
    var wid = (r[wIdIdx] || "").toString().trim();
    if (wid) {
      workerMap[wid] = {
        full_name: r[wNameIdx] || "",
        phone: r[wPhoneIdx] || "",
        cccd: r[wCccdIdx] || "",
        gender: r[wGenderIdx] || "",
        date_of_birth: r[wDobIdx] ? Utilities.formatDate(new Date(r[wDobIdx]), "GMT+7", "yyyy-MM-dd") : "",
        hometown: r[wHomeIdx] || ""
      };
    }
  }

  // Quét danh sách Deal
  var dData = dealSheet.getDataRange().getValues();
  var dHeaders = dData[0] || [];
  var dDealIdIdx = dHeaders.indexOf("deal_id");
  var dWorkerIdIdx = dHeaders.indexOf("worker_id");
  var dCompIdx = dHeaders.indexOf("target_company");
  var dBranchIdx = dHeaders.indexOf("branch");
  var dStageIdx = dHeaders.indexOf("level_sale_status");
  var dDateIdx = dHeaders.indexOf("interview_date");
  var dResultIdx = dHeaders.indexOf("interview_result");
  var dSaleIdx = dHeaders.indexOf("assigned_sale");
  var dNotesIdx = dHeaders.indexOf("notes");

  var roster = [];

  for (var j = 1; j < dData.length; j++) {
    var dRow = dData[j];
    var stage = (dRow[dStageIdx] || "").toString().trim();
    if (stage === "DELETED") continue;

    var comp = (dRow[dCompIdx] || "").toString().trim().toUpperCase();
    var branch = (dRow[dBranchIdx] || "").toString().trim().toUpperCase();
    var intDate = dRow[dDateIdx] ? Utilities.formatDate(new Date(dRow[dDateIdx]), "GMT+7", "yyyy-MM-dd") : "";

    // Bộ lọc
    if (filterStage && stage.indexOf(filterStage) === -1) continue;
    // Mặc định nếu không chỉ định stage, chỉ lấy các chặng liên quan đến phỏng vấn: L2, L2.1, L2.2, L2.3
    if (!filterStage && stage !== "L2" && stage.indexOf("L2") === -1) continue;

    if (filterCompany && comp !== filterCompany && comp.indexOf(filterCompany) === -1) continue;
    if (filterBranch && branch !== filterBranch && branch.indexOf(filterBranch) === -1) continue;
    if (filterDate && intDate !== filterDate) continue;

    var wInfo = workerMap[dRow[dWorkerIdIdx]] || {};

    roster.push({
      deal_id: dRow[dDealIdIdx],
      worker_id: dRow[dWorkerIdIdx],
      full_name: wInfo.full_name || dRow[dHeaders.indexOf("full_name")] || "",
      phone: wInfo.phone || dRow[dHeaders.indexOf("phone")] || "",
      cccd: wInfo.cccd || dRow[dHeaders.indexOf("cccd")] || "",
      gender: wInfo.gender || "",
      hometown: wInfo.hometown || "",
      date_of_birth: wInfo.date_of_birth || "",
      target_company: dRow[dCompIdx],
      branch: dRow[dBranchIdx],
      level_sale_status: stage,
      interview_date: intDate,
      interview_result: dRow[dResultIdx] || "Chưa phỏng vấn",
      assigned_sale: dRow[dSaleIdx] || "",
      notes: dRow[dNotesIdx] || ""
    });
  }

  return {
    success: true,
    count: roster.length,
    filters_applied: {
      date: filterDate || "ALL",
      company: filterCompany || "ALL",
      branch: filterBranch || "ALL",
      stage: filterStage || "L2_ALL"
    },
    data: roster
  };
}

/**
 * Điểm danh 1-chạm kết quả phỏng vấn tại cổng xưởng:
 * - PASSED: Đỗ -> chuyển L2.1, gán KTX
 * - FAILED: Trượt -> chuyển L2.2, ghi nhận lý do
 * - NO_SHOW: Bùng hẹn -> chuyển L2.3, tự động hồi chuyển về L1.2 Chăm sóc lại
 */
function handleCheckInInterviewV2_(payload, ss) {
  if (!ss) ss = getSpreadsheetV2_();
  if (!ss) return { success: false, error: "Không thể kết nối Spreadsheet V2." };

  var dealId = (payload.deal_id || "").toString().trim();
  var result = (payload.result || "").toString().trim().toUpperCase(); // PASSED | FAILED | NO_SHOW
  var dormInfo = (payload.dorm_info || "").toString().trim();
  var startDate = (payload.start_date || "").toString().trim();
  var failureReason = (payload.reason || "").toString().trim();
  var alternateCompany = (payload.alternate_company || "").toString().trim();
  var actorId = payload.actor_id || "FIELD_OFFICER";
  var actorEmail = payload.actor_email || V2_CONFIG.SUPER_ADMIN_EMAIL;

  if (!dealId) return { success: false, error: "Thiếu deal_id." };
  if (!result || (result !== "PASSED" && result !== "FAILED" && result !== "NO_SHOW")) {
    return { success: false, error: "Kết quả điểm danh (result) bắt buộc là: PASSED, FAILED hoặc NO_SHOW." };
  }

  var dealSheet = ss.getSheetByName(V2_CONFIG.TAB_DEALS);
  if (!dealSheet) return { success: false, error: "Không tìm thấy bảng Deals." };

  var dData = dealSheet.getDataRange().getValues();
  var dHeaders = dData[0] || [];
  var dDealIdIdx = dHeaders.indexOf("deal_id");
  var dWorkerIdIdx = dHeaders.indexOf("worker_id");
  var dStageIdx = dHeaders.indexOf("level_sale_status");
  var dResultIdx = dHeaders.indexOf("interview_result");
  var dStartDateIdx = dHeaders.indexOf("start_date");
  var dCompIdx = dHeaders.indexOf("target_company");
  var dNotesIdx = dHeaders.indexOf("notes");
  var dUpdatedIdx = dHeaders.indexOf("updated_at");
  var dUserIdx = dHeaders.indexOf("updated_by");

  var targetRow = -1;
  var currentDeal = null;

  for (var i = 1; i < dData.length; i++) {
    if (dData[i][dDealIdIdx] === dealId) {
      targetRow = i + 1;
      currentDeal = dData[i];
      break;
    }
  }

  if (targetRow === -1) {
    return { success: false, error: "Không tìm thấy Deal ID: " + dealId };
  }

  var fromStage = currentDeal[dStageIdx];
  var toStage = "";
  var interviewResultLabel = "";
  var updatedNotes = currentDeal[dNotesIdx] || "";
  var nowIso = new Date().toISOString();

  if (result === "PASSED") {
    toStage = "L2.1";
    interviewResultLabel = "Đỗ phỏng vấn";
    if (dormInfo) updatedNotes += (updatedNotes ? " | " : "") + "KTX: " + dormInfo;
    if (startDate) dealSheet.getRange(targetRow, dStartDateIdx + 1).setValue(startDate);
  } else if (result === "FAILED") {
    toStage = "L2.2";
    interviewResultLabel = "Trượt phỏng vấn";
    if (failureReason) updatedNotes += (updatedNotes ? " | " : "") + "Lý do trượt: " + failureReason;
    if (alternateCompany) {
      dealSheet.getRange(targetRow, dCompIdx + 1).setValue(alternateCompany);
      updatedNotes += " | Đề xuất chuyển sang xưởng: " + alternateCompany;
    }
  } else if (result === "NO_SHOW") {
    toStage = "L2.3";
    interviewResultLabel = "Không đến phỏng vấn";
    // Tự động hồi chuyển về L1.2 Chăm sóc lại sau khi ghi nhận bùng
    toStage = "L1.2";
    updatedNotes += (updatedNotes ? " | " : "") + "[TỰ ĐỘNG HỒI CHUYỂN L1.2] Lao động bùng hẹn phỏng vấn - cần Telesale gọi lại chăm sóc gấp!";
  }

  dealSheet.getRange(targetRow, dStageIdx + 1).setValue(toStage);
  dealSheet.getRange(targetRow, dResultIdx + 1).setValue(interviewResultLabel);
  dealSheet.getRange(targetRow, dNotesIdx + 1).setValue(updatedNotes);
  dealSheet.getRange(targetRow, dUpdatedIdx + 1).setValue(nowIso);
  dealSheet.getRange(targetRow, dUserIdx + 1).setValue(actorEmail);

  SpreadsheetApp.flush();

  // Ghi Audit Log
  appendAuditLogV2_({
    deal_id: dealId,
    worker_id: currentDeal[dWorkerIdIdx],
    actor_id: actorId,
    actor_email: actorEmail,
    action: "FIELD_INTERVIEW_CHECKIN_" + result,
    from_stage: fromStage,
    to_stage: toStage,
    metadata: {
      result: result,
      dorm_info: dormInfo,
      failure_reason: failureReason,
      alternate_company: alternateCompany,
      start_date: startDate
    }
  }, ss);

  return {
    success: true,
    message: "Điểm danh phỏng vấn thành công: " + interviewResultLabel,
    data: {
      deal_id: dealId,
      worker_id: currentDeal[dWorkerIdIdx],
      from_stage: fromStage,
      to_stage: toStage,
      interview_result: interviewResultLabel,
      notes: updatedNotes
    }
  };
}


// =============================================================================
// MODULE 12: ATTENDANCE MATCHING & VWW ENGINE
// =============================================================================
/**
 * ==============================================================================
 * FCS AI WORKFORCE OS V2 — MODULE 12: ATTENDANCE MATCHING & VWW ENGINE
 * Chức năng: Tiếp nhận bảng chấm công đối tác (Foxconn, Luxshare, Goertek...),
 *            Thuật toán đối soát 3 tầng (CCCD -> Mã xưởng -> Tên/SĐT),
 *            Tự động kích hoạt VWW (Verified Working Worker) & thăng hạng L4.
 * ==============================================================================
 */

/**
 * Động cơ đối soát chấm công xưởng và kích hoạt North Star VWW
 */
function handleMatchAttendanceAndVerifyVwwV2_(payload, ss) {
  if (!ss) ss = getSpreadsheetV2_();
  if (!ss) return { success: false, error: "Không thể kết nối Spreadsheet V2." };

  var records = payload.records || payload.items || [];
  if (!Array.isArray(records) || records.length === 0) {
    return { success: false, error: "Dữ liệu bảng chấm công (records) không hợp lệ hoặc rỗng." };
  }

  var defaultThreshold = typeof payload.threshold === "number" ? payload.threshold : 15; // Mặc định 15 công
  var defaultMonth = (payload.month || Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM")).toString().trim();
  var actorId = payload.actor_id || "ACCOUNTING_RECON";
  var actorEmail = payload.actor_email || V2_CONFIG.SUPER_ADMIN_EMAIL;

  var workerSheet = ss.getSheetByName(V2_CONFIG.TAB_WORKERS);
  var dealSheet = ss.getSheetByName(V2_CONFIG.TAB_DEALS);

  if (!workerSheet || !dealSheet) {
    return { success: false, error: "Không tìm thấy bảng Master Workers hoặc CRM Deals." };
  }

  // 1. Quét Master Workers lập bản đồ tra cứu O(1)
  var wData = workerSheet.getDataRange().getValues();
  var wHeaders = wData[0] || [];
  var wIdIdx = wHeaders.indexOf("worker_id");
  var wCccdIdx = wHeaders.indexOf("cccd");
  var wPhoneIdx = wHeaders.indexOf("phone");
  var wNameIdx = wHeaders.indexOf("full_name");

  var cccdToWorkerId = {};
  var phoneToWorkerId = {};
  var nameToWorkerIds = {};

  for (var i = 1; i < wData.length; i++) {
    var r = wData[i];
    var wid = (r[wIdIdx] || "").toString().trim();
    var cccd = (r[wCccdIdx] || "").toString().replace(/[^0-9]/g, "");
    var phone = (r[wPhoneIdx] || "").toString().replace(/[^0-9]/g, "");
    var name = (r[wNameIdx] || "").toString().trim().toUpperCase();

    if (cccd) cccdToWorkerId[cccd] = wid;
    if (phone) phoneToWorkerId[phone] = wid;
    if (name) {
      if (!nameToWorkerIds[name]) nameToWorkerIds[name] = [];
      nameToWorkerIds[name].push(wid);
    }
  }

  // 2. Quét CRM Deals để tìm Deal đang hoạt động theo Worker ID
  var dData = dealSheet.getDataRange().getValues();
  var dHeaders = dData[0] || [];
  var dDealIdIdx = dHeaders.indexOf("deal_id");
  var dWorkerIdIdx = dHeaders.indexOf("worker_id");
  var dStageIdx = dHeaders.indexOf("level_sale_status");
  var dVwwIdx = dHeaders.indexOf("is_vww");
  var dWorkStatusIdx = dHeaders.indexOf("actual_work_status");
  var dNotesIdx = dHeaders.indexOf("notes");
  var dUpdatedIdx = dHeaders.indexOf("updated_at");
  var dUserIdx = dHeaders.indexOf("updated_by");
  var dCompIdx = dHeaders.indexOf("target_company");

  // Map: worker_id -> array of { rowNumber, deal_id, stage, is_vww, company }
  var workerToDeals = {};
  for (var j = 1; j < dData.length; j++) {
    var dRow = dData[j];
    var dWid = (dRow[dWorkerIdIdx] || "").toString().trim();
    var dStage = (dRow[dStageIdx] || "").toString().trim();

    if (dWid && dStage !== "DELETED") {
      if (!workerToDeals[dWid]) workerToDeals[dWid] = [];
      workerToDeals[dWid].push({
        rowNumber: j + 1,
        deal_id: dRow[dDealIdIdx],
        stage: dStage,
        is_vww: dRow[dVwwIdx] === true || dRow[dVwwIdx] === "TRUE",
        company: (dRow[dCompIdx] || "").toString().trim().toUpperCase(),
        notes: dRow[dNotesIdx] || ""
      });
    }
  }

  // 3. Tiến hành khớp từng dòng chấm công
  var stats = {
    total_attendance_records: records.length,
    matched_workers: 0,
    vww_newly_verified: 0,
    already_vww: 0,
    below_threshold_count: 0,
    unmatched_count: 0
  };

  var verifiedDealsList = [];
  var unmatchedRecords = [];
  var nowIso = new Date().toISOString();

  for (var k = 0; k < records.length; k++) {
    var att = records[k];
    var rawCccd = (att.cccd || "").toString().replace(/[^0-9]/g, "");
    var rawPhone = (att.phone || "").toString().replace(/[^0-9]/g, "");
    var rawName = (att.full_name || att.name || "").toString().trim().toUpperCase();
    var factoryWorkerId = (att.factory_worker_id || att.staff_code || "").toString().trim();
    var companyCode = (att.company_code || att.company || "").toString().trim().toUpperCase();
    var workdays = typeof att.workdays === "number" ? att.workdays : parseFloat(att.workdays || 0);

    // Thuật toán đối soát Cascade 3 tầng
    var matchedWorkerId = null;
    if (rawCccd && cccdToWorkerId[rawCccd]) {
      matchedWorkerId = cccdToWorkerId[rawCccd];
    } else if (rawPhone && phoneToWorkerId[rawPhone]) {
      matchedWorkerId = phoneToWorkerId[rawPhone];
    } else if (rawName && nameToWorkerIds[rawName] && nameToWorkerIds[rawName].length === 1) {
      matchedWorkerId = nameToWorkerIds[rawName][0];
    }

    if (!matchedWorkerId) {
      stats.unmatched_count++;
      unmatchedRecords.push({
        raw_name: rawName,
        raw_cccd: rawCccd,
        raw_phone: rawPhone,
        workdays: workdays,
        reason: "Không tìm thấy hồ sơ Master Worker khớp CCCD hoặc SĐT"
      });
      continue;
    }

    stats.matched_workers++;
    var candidateDeals = workerToDeals[matchedWorkerId] || [];

    if (candidateDeals.length === 0) {
      stats.unmatched_count++;
      unmatchedRecords.push({
        worker_id: matchedWorkerId,
        raw_name: rawName,
        workdays: workdays,
        reason: "Lao động có trong Master nhưng chưa có Deal nào được tạo"
      });
      continue;
    }

    // Ưu tiên chọn Deal có cùng xưởng làm việc hoặc Deal ở chặng L3 (Đang đi làm) / L2.1 (Đỗ phỏng vấn)
    var selectedDeal = candidateDeals[0];
    for (var d = 0; d < candidateDeals.length; d++) {
      var cd = candidateDeals[d];
      if (companyCode && cd.company === companyCode) {
        selectedDeal = cd;
        break;
      }
      if (cd.stage === "L3" || cd.stage === "L2.1") {
        selectedDeal = cd;
      }
    }

    // Nếu đã là VWW từ trước
    if (selectedDeal.is_vww || selectedDeal.stage === "L4") {
      stats.already_vww++;
      continue;
    }

    // Kiểm tra điều kiện VWW (Số ngày công >= threshold)
    if (workdays >= defaultThreshold) {
      var rowToUpdate = selectedDeal.rowNumber;

      // Cập nhật Deal sang L4 và đóng dấu is_vww = TRUE
      dealSheet.getRange(rowToUpdate, dStageIdx + 1).setValue("L4");
      dealSheet.getRange(rowToUpdate, dVwwIdx + 1).setValue(true);
      dealSheet.getRange(rowToUpdate, dWorkStatusIdx + 1).setValue("Đã hết thời gian phí");

      var vwwNote = "[VWW XÁC MINH] Đạt " + workdays + " công (Ngưỡng: " + defaultThreshold + " công) tại " + (companyCode || "xưởng") + " tháng " + defaultMonth;
      if (factoryWorkerId) vwwNote += " | Mã thẻ: " + factoryWorkerId;
      var newNotes = selectedDeal.notes ? (selectedDeal.notes + " | " + vwwNote) : vwwNote;

      dealSheet.getRange(rowToUpdate, dNotesIdx + 1).setValue(newNotes);
      dealSheet.getRange(rowToUpdate, dUpdatedIdx + 1).setValue(nowIso);
      dealSheet.getRange(rowToUpdate, dUserIdx + 1).setValue(actorEmail);

      selectedDeal.is_vww = true;
      selectedDeal.stage = "L4";
      stats.vww_newly_verified++;

      verifiedDealsList.push({
        deal_id: selectedDeal.deal_id,
        worker_id: matchedWorkerId,
        full_name: rawName,
        workdays: workdays,
        company: companyCode || selectedDeal.company
      });

      // Ghi log kiểm toán cho từng người được xác nhận VWW
      appendAuditLogV2_({
        deal_id: selectedDeal.deal_id,
        worker_id: matchedWorkerId,
        actor_id: actorId,
        actor_email: actorEmail,
        action: "VWW_VERIFIED_SUCCESS",
        from_stage: selectedDeal.stage,
        to_stage: "L4",
        metadata: {
          workdays: workdays,
          threshold: defaultThreshold,
          month: defaultMonth,
          company: companyCode
        }
      }, ss);

    } else {
      // Dưới ngưỡng công (Lao động nghỉ ngang hoặc chưa đủ ngày)
      stats.below_threshold_count++;
      var rowIdx = selectedDeal.rowNumber;
      var subNote = "[CHƯA ĐẠT VWW] Chấm công ghi nhận: " + workdays + "/" + defaultThreshold + " công tháng " + defaultMonth;
      var currentN = selectedDeal.notes ? (selectedDeal.notes + " | " + subNote) : subNote;
      dealSheet.getRange(rowIdx, dNotesIdx + 1).setValue(currentN);
      dealSheet.getRange(rowIdx, dUpdatedIdx + 1).setValue(nowIso);
    }
  }

  SpreadsheetApp.flush();

  return {
    success: true,
    message: "Đối soát bảng công hoàn tất: Đã xác minh " + stats.vww_newly_verified + " lao động đạt chuẩn VWW (L4)!",
    data: {
      stats: stats,
      newly_verified_deals: verifiedDealsList,
      unmatched_sample: unmatchedRecords.slice(0, 20)
    }
  };
}


// =============================================================================
// MODULE 13: SETTLEMENT & REVENUE SERVICE
// =============================================================================
/**
 * ==============================================================================
 * FCS AI WORKFORCE OS V2 — MODULE 13: SETTLEMENT & REVENUE SERVICE
 * Chức năng: Tính toán doanh thu phí cung ứng từ nhà máy đối tác & hoa hồng Sale/CTV,
 *            Báo cáo đối soát tài chính, kiểm soát biên lợi nhuận gộp (Gross Margin)
 * ==============================================================================
 */

// Bảng đơn giá phí dịch vụ tham chiếu theo từng đối tác (VNĐ / lao động VWW)
var DEFAULT_FACTORY_RATE_VWW = 3500000; // Mặc định 3.500.000 VNĐ / VWW
var DEFAULT_SALE_COMMISSION_VWW = 1200000; // Mặc định 1.200.000 VNĐ / Sale

/**
 * Xuất Báo cáo Đối soát Tài chính Nghiệm thu (Settlement Report)
 */
function handleGetSettlementReportV2_(params, ss) {
  if (!ss) ss = getSpreadsheetV2_();
  if (!ss) return { success: false, error: "Không thể kết nối Spreadsheet V2." };

  var filterMonth = (params.month || "").toString().trim(); // YYYY-MM
  var filterCompany = (params.company || "").toString().trim().toUpperCase();
  var filterBranch = (params.branch || "").toString().trim().toUpperCase();

  var dealSheet = ss.getSheetByName(V2_CONFIG.TAB_DEALS);
  if (!dealSheet) return { success: false, error: "Không tìm thấy bảng Deals." };

  var dData = dealSheet.getDataRange().getValues();
  var dHeaders = dData[0] || [];
  var dDealIdIdx = dHeaders.indexOf("deal_id");
  var dWorkerIdIdx = dHeaders.indexOf("worker_id");
  var dFullNameIdx = dHeaders.indexOf("full_name");
  var dPhoneIdx = dHeaders.indexOf("phone");
  var dCompIdx = dHeaders.indexOf("target_company");
  var dBranchIdx = dHeaders.indexOf("branch");
  var dStageIdx = dHeaders.indexOf("level_sale_status");
  var dSaleIdx = dHeaders.indexOf("assigned_sale");
  var dSourceIdx = dHeaders.indexOf("referral_ven_ctv");
  var dVwwIdx = dHeaders.indexOf("is_vww");
  var dCommPolicyIdx = dHeaders.indexOf("commission_policy");
  var dCommAmtIdx = dHeaders.indexOf("commission_amount");
  var dCommStatusIdx = dHeaders.indexOf("commission_status");
  var dUpdatedIdx = dHeaders.indexOf("updated_at");

  var totalVwwCount = 0;
  var totalFactoryRevenue = 0;
  var totalSaleCommission = 0;

  var dealsList = [];
  var byCompanySummary = {};
  var byBranchSummary = {};
  var bySaleSummary = {};

  for (var i = 1; i < dData.length; i++) {
    var r = dData[i];
    var stage = (r[dStageIdx] || "").toString().trim();
    var isVww = r[dVwwIdx] === true || r[dVwwIdx] === "TRUE" || stage === "L4";

    if (!isVww && stage !== "L4") continue;

    var comp = (r[dCompIdx] || "CHƯA PHÂN BỔ").toString().trim().toUpperCase();
    var branch = (r[dBranchIdx] || "CHƯA PHÂN BỔ").toString().trim().toUpperCase();
    var sale = (r[dSaleIdx] || "CHƯA GÁN").toString().trim();
    var updatedStr = r[dUpdatedIdx] ? r[dUpdatedIdx].toString() : "";

    if (filterMonth && updatedStr.indexOf(filterMonth) === -1) continue;
    if (filterCompany && comp !== filterCompany && comp.indexOf(filterCompany) === -1) continue;
    if (filterBranch && branch !== filterBranch && branch.indexOf(filterBranch) === -1) continue;

    totalVwwCount++;

    // Doanh thu dự kiến từ nhà máy
    var revenue = DEFAULT_FACTORY_RATE_VWW;
    totalFactoryRevenue += revenue;

    // Hoa hồng cho Sale/CTV
    var commAmount = parseFloat(r[dCommAmtIdx] || 0);
    if (!commAmount || isNaN(commAmount)) {
      commAmount = DEFAULT_SALE_COMMISSION_VWW;
    }
    totalSaleCommission += commAmount;

    var commStatus = (r[dCommStatusIdx] || "Chờ duyệt").toString().trim();

    // Thống kê theo công ty
    if (!byCompanySummary[comp]) {
      byCompanySummary[comp] = { vww_count: 0, revenue: 0, commission: 0, gross_margin: 0 };
    }
    byCompanySummary[comp].vww_count++;
    byCompanySummary[comp].revenue += revenue;
    byCompanySummary[comp].commission += commAmount;
    byCompanySummary[comp].gross_margin = byCompanySummary[comp].revenue - byCompanySummary[comp].commission;

    // Thống kê theo chi nhánh
    if (!byBranchSummary[branch]) {
      byBranchSummary[branch] = { vww_count: 0, revenue: 0, commission: 0 };
    }
    byBranchSummary[branch].vww_count++;
    byBranchSummary[branch].revenue += revenue;
    byBranchSummary[branch].commission += commAmount;

    // Thống kê theo sale
    if (!bySaleSummary[sale]) {
      bySaleSummary[sale] = { vww_count: 0, total_commission: 0, pending_count: 0, paid_count: 0 };
    }
    bySaleSummary[sale].vww_count++;
    bySaleSummary[sale].total_commission += commAmount;
    if (commStatus === "Đã thanh toán") {
      bySaleSummary[sale].paid_count++;
    } else {
      bySaleSummary[sale].pending_count++;
    }

    dealsList.push({
      deal_id: r[dDealIdIdx],
      worker_id: r[dWorkerIdIdx],
      full_name: r[dFullNameIdx],
      phone: r[dPhoneIdx],
      target_company: comp,
      branch: branch,
      assigned_sale: sale,
      referral_source: r[dSourceIdx],
      revenue_estimated: revenue,
      commission_amount: commAmount,
      commission_status: commStatus,
      updated_at: updatedStr
    });
  }

  var totalGrossMargin = totalFactoryRevenue - totalSaleCommission;
  var profitMarginPercent = totalFactoryRevenue > 0 ? Math.round((totalGrossMargin / totalFactoryRevenue) * 100) : 0;

  var reportData = {
    summary: {
      total_vww_count: totalVwwCount,
      total_factory_revenue: totalFactoryRevenue,
      total_sale_commission: totalSaleCommission,
      total_gross_margin: totalGrossMargin,
      profit_margin_percent: profitMarginPercent
    },
    by_company: byCompanySummary,
    by_branch: byBranchSummary,
    by_sale: bySaleSummary,
    deals: dealsList
  };

  return {
    success: true,
    data: reportData,
    message: "Xuất báo cáo đối soát tài chính thành công cho " + totalVwwCount + " lao động VWW."
  };
}

/**
 * Phê duyệt thanh toán hoa hồng cho các Deal đạt chuẩn VWW
 */
function handleApproveCommissionV2_(payload, ss) {
  if (!ss) ss = getSpreadsheetV2_();
  if (!ss) return { success: false, error: "Không thể kết nối Spreadsheet V2." };

  var dealIds = payload.deal_ids || (payload.deal_id ? [payload.deal_id] : []);
  if (!Array.isArray(dealIds) || dealIds.length === 0) {
    return { success: false, error: "Danh sách deal_ids cần duyệt hoa hồng không hợp lệ." };
  }

  var newStatus = (payload.status || "Đã duyệt Manager").toString().trim(); // "Đã duyệt Lead", "Đã duyệt Manager", "Đã thanh toán"
  var actorId = payload.actor_id || "FINANCE_APPROVER";
  var actorEmail = payload.actor_email || V2_CONFIG.SUPER_ADMIN_EMAIL;

  var dealSheet = ss.getSheetByName(V2_CONFIG.TAB_DEALS);
  if (!dealSheet) return { success: false, error: "Không tìm thấy bảng Deals." };

  var dData = dealSheet.getDataRange().getValues();
  var dHeaders = dData[0] || [];
  var dDealIdIdx = dHeaders.indexOf("deal_id");
  var dWorkerIdIdx = dHeaders.indexOf("worker_id");
  var dCommStatusIdx = dHeaders.indexOf("commission_status");
  var dCommAmtIdx = dHeaders.indexOf("commission_amount");
  var dUpdatedIdx = dHeaders.indexOf("updated_at");
  var dUserIdx = dHeaders.indexOf("updated_by");

  var dealIdSet = {};
  for (var k = 0; k < dealIds.length; k++) {
    dealIdSet[dealIds[k]] = true;
  }

  var updatedCount = 0;
  var nowIso = new Date().toISOString();

  for (var i = 1; i < dData.length; i++) {
    var did = (dData[i][dDealIdIdx] || "").toString().trim();
    if (dealIdSet[did]) {
      var rowIdx = i + 1;
      dealSheet.getRange(rowIdx, dCommStatusIdx + 1).setValue(newStatus);
      dealSheet.getRange(rowIdx, dUpdatedIdx + 1).setValue(nowIso);
      dealSheet.getRange(rowIdx, dUserIdx + 1).setValue(actorEmail);
      updatedCount++;

      appendAuditLogV2_({
        deal_id: did,
        worker_id: dData[i][dWorkerIdIdx],
        actor_id: actorId,
        actor_email: actorEmail,
        action: "COMMISSION_STATUS_UPDATED",
        from_stage: dData[i][dCommStatusIdx],
        to_stage: newStatus,
        metadata: {
          new_status: newStatus,
          amount: dData[i][dCommAmtIdx]
        }
      }, ss);
    }
  }

  SpreadsheetApp.flush();

  return {
    success: true,
    message: "Đã cập nhật trạng thái hoa hồng (" + newStatus + ") cho " + updatedCount + " Deal!",
    data: {
      updated_count: updatedCount,
      status: newStatus
    }
  };
}


// =============================================================================
// MODULE 14: LEAD MARKETING & CONSULTATION SERVICE
// =============================================================================
/**
 * ═══════════════════════════════════════════════════════════════════
 * MODULE 14: LEAD MARKETING & CONSULTATION SERVICE (V2)
 * ═══════════════════════════════════════════════════════════════════
 * Chuyên trách:
 *  1. Lưu trữ Lead đăng ký AI Workforce Blueprint & Tư vấn 1:1 vào tab "04_LEADS_MARKETING".
 *  2. Bắn email thông báo tức thời đến Coach.Chuyen@gmail.com kèm link Zalo 1 chạm.
 *  3. Gửi email xác nhận kèm bản đồ tối ưu quy trình VWW cho người đăng ký.
 *  4. Quản lý trạng thái chăm sóc Email Marketing (NEW, CONTACTED, CONVERTED).
 */

var LEADS_MARKETING_SCHEMA = [
  "lead_id",
  "created_at",
  "full_name",
  "phone",
  "email",
  "company_name",
  "workforce_scale",
  "bottleneck",
  "source",
  "nurture_status",
  "email_alert_status",
  "admin_notes"
];

/**
 * Đảm bảo tab 04_LEADS_MARKETING tồn tại với format chuẩn
 */
function ensureLeadsMarketingSheetV2_(ss) {
  if (!ss) ss = getSpreadsheetV2_();
  var sheetName = V2_CONFIG.TAB_LEADS || "04_LEADS_MARKETING";
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(LEADS_MARKETING_SCHEMA);
    formatHeaderRow_(sheet, LEADS_MARKETING_SCHEMA.length, "#1E3A8A"); // Deep Navy
  } else {
    var firstCell = sheet.getRange(1, 1).getValue();
    if (!firstCell) {
      sheet.getRange(1, 1, 1, LEADS_MARKETING_SCHEMA.length).setValues([LEADS_MARKETING_SCHEMA]);
      formatHeaderRow_(sheet, LEADS_MARKETING_SCHEMA.length, "#1E3A8A");
    }
  }
  return sheet;
}

/**
 * Tiếp nhận Lead, lưu vào Google Sheet & bắn Email thông báo cho Coach Chuyên
 */
function handleCaptureLeadV2_(payload, ss) {
  if (!ss) ss = getSpreadsheetV2_();
  var sheet = ensureLeadsMarketingSheetV2_(ss);

  var fullName = String(payload.fullName || payload.name || "").trim();
  var phone = String(payload.phone || "").trim();
  var email = String(payload.email || "").trim().toLowerCase();
  var companyName = String(payload.companyName || payload.company || payload.organization || "Chưa cung cấp").trim();
  var workforceScale = String(payload.workforceScale || payload.scale || "100 - 300 lao động").trim();
  var bottleneck = String(payload.bottleneck || payload.note || payload.purpose || "Khảo sát AI Workforce Blueprint & Chuẩn VWW").trim();
  var source = String(payload.source || "LANDING_AI_BLUEPRINT_MODAL").trim();

  if (!fullName || !phone) {
    return {
      success: false,
      error: "Họ tên và Số điện thoại là thông tin bắt buộc."
    };
  }

  // Chuẩn hóa số điện thoại
  var cleanPhone = phone.replace(/[^\d+]/g, "");
  if (cleanPhone.startsWith("0")) {
    cleanPhone = "+84" + cleanPhone.substring(1);
  }

  var now = new Date();
  var nowFormatted = Utilities.formatDate(now, "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
  var datePrefix = Utilities.formatDate(now, "Asia/Ho_Chi_Minh", "yyyyMMdd");

  // Sinh ID: LD-YYYYMMDD-XXXX
  var lastRow = sheet.getLastRow();
  var seq = String(Math.max(1, lastRow)).padStart(4, "0");
  var leadId = "LD-" + datePrefix + "-" + seq;

  // Trạng thái bắn email
  var emailAlertStatus = "CHƯA GỬI";
  var adminEmail = V2_CONFIG.SUPER_ADMIN_EMAIL || "coach.chuyen@gmail.com";

  // 1. Gửi email thông báo tức thời cho Coach Chuyên
  try {
    var rawPhone = phone.replace(/[^\d]/g, "");
    var zaloLink = "https://zalo.me/" + (rawPhone.startsWith("84") ? "0" + rawPhone.substring(2) : rawPhone);
    var sheetUrl = ss ? ss.getUrl() : "https://docs.google.com/spreadsheets/d/" + V2_CONFIG.SPREADSHEET_ID;

    var emailSubject = "🚀 [FCS LEAD MỚI] " + fullName + " (" + companyName + ") - " + workforceScale;
    
    var emailBodyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #334155;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0 0 6px 0; font-size: 20px; font-weight: 900; letter-spacing: -0.5px;">
            FCS AI WORKFORCE OS — KHÁCH HÀNG TIỀM NĂNG MỚI
          </h1>
          <p style="color: #bfdbfe; margin: 0; font-size: 13px;">
            Đăng ký nhận AI Workforce Blueprint & Tư vấn tối ưu chuẩn VWW
          </p>
        </div>

        <div style="padding: 24px;">
          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #94a3b8; width: 140px;">Mã Lead:</td>
                <td style="padding: 8px 0; color: #38bdf8; font-weight: bold; font-family: monospace;">${leadId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Họ và Tên:</td>
                <td style="padding: 8px 0; color: #ffffff; font-weight: bold; font-size: 15px;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Số điện thoại:</td>
                <td style="padding: 8px 0;">
                  <a href="tel:${phone}" style="color: #4ade80; font-weight: bold; text-decoration: none;">${phone}</a>
                  &nbsp;•&nbsp;
                  <a href="${zaloLink}" target="_blank" style="display: inline-block; padding: 3px 10px; background: #0284c7; color: white; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: bold;">
                    💬 Mở Chat Zalo
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Email:</td>
                <td style="padding: 8px 0; color: #f1f5f9;">${email || "Chưa cung cấp"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Doanh nghiệp:</td>
                <td style="padding: 8px 0; color: #f1f5f9; font-weight: bold;">${companyName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Quy mô lao động:</td>
                <td style="padding: 8px 0; color: #fbbf24; font-weight: bold;">${workforceScale}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Thời gian:</td>
                <td style="padding: 8px 0; color: #cbd5e1;">${nowFormatted}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Nguồn tiếp cận:</td>
                <td style="padding: 8px 0; color: #cbd5e1;">${source}</td>
              </tr>
            </table>
          </div>

          <div style="background: #1e293b; border-left: 4px solid #f59e0b; border-radius: 0 12px 12px 0; padding: 14px 18px; margin-bottom: 24px;">
            <div style="font-size: 12px; font-weight: bold; color: #fbbf24; text-transform: uppercase; margin-bottom: 4px;">
              Điểm nghẽn / Nhu cầu khách hàng:
            </div>
            <div style="font-size: 13px; color: #e2e8f0; line-height: 1.5;">
              ${bottleneck}
            </div>
          </div>

          <div style="text-align: center; margin-top: 10px;">
            <a href="${zaloLink}" target="_blank" style="display: inline-block; padding: 12px 24px; background: #22c55e; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 10px; margin-right: 10px; box-shadow: 0 4px 14px rgba(34, 197, 94, 0.4);">
              📞 Kết Nối Zalo Ngay
            </a>
            <a href="${sheetUrl}" target="_blank" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 10px; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);">
              📊 Mở Google Sheet Leads MKT
            </a>
          </div>
        </div>

        <div style="background: #090d16; padding: 14px 24px; text-align: center; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b;">
          FCS AI WORKFORCE OS V2 • Hệ Thống Doanh Thu Tự Động & Kiểm Định Chuẩn VWW
        </div>
      </div>
    `;

    MailApp.sendEmail({
      to: adminEmail,
      subject: emailSubject,
      htmlBody: emailBodyHtml
    });

    emailAlertStatus = "ĐÃ BẮN MAIL (" + adminEmail + ")";
  } catch (mailErr) {
    Logger.log("Lỗi gửi email cho Coach Chuyên: " + mailErr.message);
    emailAlertStatus = "LỖI GỬI MAIL: " + mailErr.message;
  }

  // 2. Gửi email xác nhận cho khách hàng nếu có email
  if (email && email.indexOf("@") !== -1 && email.indexOf("lead.fcs.vn") === -1) {
    try {
      var clientSubject = "[FCS AI Workforce] Xác nhận đăng ký AI Workforce Blueprint & Lộ trình VWW";
      var clientBodyHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #0f172a; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
          <div style="background: #1e40af; padding: 24px; text-align: center; color: white;">
            <h2 style="margin: 0 0 6px 0; font-size: 20px;">FCS AI WORKFORCE OS</h2>
            <p style="margin: 0; font-size: 13px; color: #bfdbfe;">Hệ thống AI quản lý & vận hành cung ứng lao động</p>
          </div>
          <div style="padding: 24px; font-size: 14px; line-height: 1.6; color: #334155;">
            <p>Kính gửi <strong>${fullName}</strong>,</p>
            <p>Cảm ơn anh/chị đã quan tâm và gửi yêu cầu đăng ký nhận <strong>AI Workforce Blueprint & Tư vấn 1:1</strong> cho doanh nghiệp <strong>${companyName}</strong>.</p>
            <p>Hệ thống FCS đã tiếp nhận thành công thông tin với mã yêu cầu: <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #1e40af;">${leadId}</code>.</p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin: 18px 0;">
              <strong>Bước tiếp theo:</strong>
              <ul style="margin: 8px 0 0 0; padding-left: 20px;">
                <li>Chuyên gia tư vấn trưởng của FCS (Coach Chuyên) sẽ kết nối qua Số điện thoại/Zalo <strong>${phone}</strong> trong vòng 24 giờ làm việc.</li>
                <li>Gửi tặng bộ tài liệu phân tích luồng vận hành chuẩn VWW và kịch bản 19 Level Sale tối ưu tỷ lệ đi làm xưởng.</li>
              </ul>
            </div>
            <p>Trân trọng,<br><strong>Ban Điều Hành FCS AI Workforce</strong><br>Email: coach.chuyen@gmail.com</p>
          </div>
        </div>
      `;

      MailApp.sendEmail({
        to: email,
        subject: clientSubject,
        htmlBody: clientBodyHtml
      });
    } catch (clientMailErr) {
      Logger.log("Lỗi gửi email xác nhận cho khách: " + clientMailErr.message);
    }
  }

  // 3. Ghi dữ liệu vào Tab 04_LEADS_MARKETING
  var rowData = [
    leadId,
    nowFormatted,
    fullName,
    phone,
    email,
    companyName,
    workforceScale,
    bottleneck,
    source,
    "MỚI (NEW)",
    emailAlertStatus,
    "Đăng ký qua Landing Page"
  ];

  sheet.appendRow(rowData);
  SpreadsheetApp.flush();

  // 4. Ghi nhật ký vào AUDIT LOG
  try {
    appendAuditLogV2_(
      "LEAD_CAPTURE",
      "GUEST",
      leadId,
      "Tiếp nhận lead mới: " + fullName + " (" + phone + ") - " + companyName,
      ss
    );
  } catch(e) {}

  return {
    success: true,
    data: {
      leadId: leadId,
      fullName: fullName,
      phone: phone,
      email: email,
      companyName: companyName,
      workforceScale: workforceScale,
      emailSentToAdmin: emailAlertStatus.indexOf("ĐÃ BẮN MAIL") !== -1,
      savedToSheet: true,
      sheetName: V2_CONFIG.TAB_LEADS || "04_LEADS_MARKETING",
      message: "Đăng ký thành công! Thông tin đã được chuyển thẳng tới Coach Chuyên và lưu trữ vào Google Sheet."
    }
  };
}

/**
 * Lấy danh sách Leads phục vụ Dashboard quản trị
 */
function handleListLeadsV2_(params, ss) {
  if (!ss) ss = getSpreadsheetV2_();
  var sheet = ensureLeadsMarketingSheetV2_(ss);
  var lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return {
      success: true,
      data: [],
      total: 0
    };
  }

  var data = sheet.getRange(2, 1, lastRow - 1, LEADS_MARKETING_SCHEMA.length).getValues();
  var leads = [];

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue;
    leads.push({
      leadId: row[0],
      createdAt: row[1],
      fullName: row[2],
      phone: row[3],
      email: row[4],
      companyName: row[5],
      workforceScale: row[6],
      bottleneck: row[7],
      source: row[8],
      nurtureStatus: row[9],
      emailAlertStatus: row[10],
      adminNotes: row[11]
    });
  }

  // Sắp xếp mới nhất lên đầu
  leads.reverse();

  return {
    success: true,
    data: leads,
    total: leads.length
  };
}


// =============================================================================
// MODULE 8: ON-EDIT TRIGGER SERVICE
// =============================================================================
/**
 * ==============================================================================
 * FCS AI WORKFORCE OS V2 — MODULE 8: TRIGGER SERVICE
 * Chức năng:
 * 1. onEdit(e) Simple Trigger bản địa Google Sheets:
 *    - Revert ngay lập tức nếu sửa Cột A (Khóa ID bất biến) trên các sheet nghiệp vụ
 *    - Revert nếu sửa trực tiếp vào Sheet 03_AUDIT_LOG
 *    - Bắt thay đổi hợp lệ, ghi log kiểm toán vào 03_AUDIT_LOG
 *    - Tự động cập nhật updated_at và updated_by trên dòng được chỉnh sửa
 * ==============================================================================
 */

function onEdit(e) {
  if (!e || !e.range) return;

  try {
    var range = e.range;
    var sheet = range.getSheet();
    var sheetName = sheet.getName();
    var col = range.getColumn();
    var row = range.getRow();

    // Bỏ qua dòng Header (dòng 1)
    if (row === 1) return;

    // 1. Chống sửa sổ cái Audit Log: Bảng 03_AUDIT_LOG là bất biến tuyệt đối
    if (sheetName === V2_CONFIG.TAB_AUDIT_LOG) {
      range.setValue(e.oldValue !== undefined ? e.oldValue : "");
      SpreadsheetApp.getActiveSpreadsheet().toast(
        "CẢNH BÁO: Bảng Audit Log là sổ cái kiểm toán bất biến, không được phép chỉnh sửa trực tiếp!",
        "⛔ BẢO MẬT FCS V2",
        6
      );
      return;
    }

    // 2. Chống sửa Khóa chính (Cột A - ID) trên 01_MASTER_WORKERS và 02_CRM_DEALS_2026
    if (col === 1 && (sheetName === V2_CONFIG.TAB_WORKERS || sheetName === V2_CONFIG.TAB_DEALS)) {
      range.setValue(e.oldValue !== undefined ? e.oldValue : "");
      SpreadsheetApp.getActiveSpreadsheet().toast(
        "CẢNH BÁO: Cột A (Mã định danh ID) bị khóa bất biến! Thao tác đã được tự động hoàn tác.",
        "⛔ BẢO MẬT FCS V2",
        6
      );
      return;
    }

    // 3. Tự động ghi nhận Audit Log cho thao tác sửa ô trên sheet nghiệp vụ
    if (sheetName === V2_CONFIG.TAB_WORKERS || sheetName === V2_CONFIG.TAB_DEALS) {
      var userEmail = Session.getActiveUser().getEmail() || "sheet_user@fcs.vn";
      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      var fieldName = headers[col - 1] || ("COL_" + col);
      var recordId = (sheet.getRange(row, 1).getValue() || "").toString();
      var oldVal = e.oldValue !== undefined ? e.oldValue : "";
      var newVal = e.value !== undefined ? e.value : range.getValue();

      var ss = sheet.getParent();
      logAuditActionV2_(ss, {
        actor_email: userEmail,
        actor_role: "SHEET_EDITOR",
        sheet_name: sheetName,
        record_id: recordId,
        action: "UPDATE",
        field_name: fieldName,
        old_value: oldVal,
        new_value: newVal,
        reason_notes: "Chỉnh sửa trực tiếp ô " + range.getA1Notation() + " trên Google Sheet"
      });

      // 4. Tự động cập nhật cột updated_at & updated_by nếu sheet có cột này (CRM Deals)
      var updatedIdx = headers.indexOf("updated_at");
      var userIdx = headers.indexOf("updated_by");
      var nowIso = new Date().toISOString();
      if (updatedIdx !== -1) {
        sheet.getRange(row, updatedIdx + 1).setValue(nowIso);
      }
      if (userIdx !== -1) {
        sheet.getRange(row, userIdx + 1).setValue(userEmail);
      }
    }
  } catch (err) {
    Logger.log("Lỗi onEdit trigger: " + err.message);
  }
}


// =============================================================================
// MODULE 1: ROUTER & REST API GATEWAY
// =============================================================================
/**
 * ==============================================================================
 * FCS AI WORKFORCE OS V2 — ROUTER & API GATEWAY
 * Chức năng: Điều phối API RESTful cho Web App V2, Kanban & Webhooks
 * ==============================================================================
 */

function doGet(e) {
  return handleRequestV2_(e, "GET");
}

function doPost(e) {
  return handleRequestV2_(e, "POST");
}

function handleRequestV2_(e, method) {
  try {
    var ss = getSpreadsheetV2_();
    var params = (e && e.parameter) || {};
    var action = params.action || "";
    var payload = {};

    if (method === "POST" && e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (err) {
        payload = {};
      }
    }
    var mergedParams = {};
    if (params) {
      for (var k in params) mergedParams[k] = params[k];
    }
    if (payload) {
      for (var kp in payload) {
        if (kp !== "payload" && kp !== "action") mergedParams[kp] = payload[kp];
      }
      if (payload.payload && typeof payload.payload === "object") {
        for (var kpp in payload.payload) mergedParams[kpp] = payload.payload[kpp];
      }
    }

    var requestPayload = (payload.payload && typeof payload.payload === "object")
      ? Object.assign({}, payload, payload.payload)
      : payload;

    var result = { success: false, error: "Hành động không hợp lệ: " + action };

    switch (action) {
      case "v2.health":
        result = {
          success: true,
          system: V2_CONFIG.SYSTEM_NAME,
          version: V2_CONFIG.SCHEMA_VERSION,
          spreadsheetName: ss ? ss.getName() : "Unknown",
          spreadsheetUrl: ss ? ss.getUrl() : "",
          time: new Date().toISOString()
        };
        break;

      case "v2.system.setup":
        result = setupV2Platform(ss);
        break;

      // --- WORKER ENDPOINTS ---
      case "v2.workers.list":
        result = handleListWorkersV2_(mergedParams, ss);
        break;

      case "v2.worker.get":
        result = handleGetWorkerV2_(mergedParams, ss);
        break;

      case "v2.worker.create":
        result = handleCreateWorkerV2_(requestPayload, ss);
        break;

      case "v2.worker.update":
        result = handleUpdateWorkerV2_(requestPayload, ss);
        break;

      case "v2.worker.soft_delete":
        result = handleSoftDeleteWorkerV2_(requestPayload, ss);
        break;

      // --- CRM DEAL ENDPOINTS ---
      case "v2.deals.list":
        result = handleListDealsV2_(mergedParams, ss);
        break;

      case "v2.deal.create":
        result = handleCreateDealV2_(requestPayload, ss);
        break;

      case "v2.deal.move_stage":
        result = handleMoveStageV2_(requestPayload, ss);
        break;

      case "v2.deal.update":
        result = handleUpdateDealV2_(requestPayload, ss);
        break;

      case "v2.deal.soft_delete":
        result = handleSoftDeleteDealV2_(requestPayload, ss);
        break;

      // --- TAXONOMY & AUDIT & KPI ---
      case "v2.taxonomy.get":
        result = handleGetTaxonomyV2_(ss);
        break;

      case "v2.audit.list":
        result = handleListAuditLogsV2_(mergedParams, ss);
        break;

      case "v2.dashboard.stats":
        result = handleGetDashboardStatsV2_(ss);
        break;

      // --- MODULE 10: BATCH IMPORT ---
      case "v2.batch.import":
        result = handleBatchImportWorkersV2_(requestPayload, ss);
        break;

      // --- MODULE 11: FIELD DISPATCH & INTERVIEW CHECK-IN ---
      case "v2.dispatch.roster":
        result = handleGetInterviewRosterV2_(mergedParams, ss);
        break;

      case "v2.dispatch.checkin":
        result = handleCheckInInterviewV2_(requestPayload, ss);
        break;

      // --- MODULE 12: ATTENDANCE MATCHING & VWW ENGINE ---
      case "v2.attendance.match":
        result = handleMatchAttendanceAndVerifyVwwV2_(requestPayload, ss);
        break;

      // --- MODULE 13: SETTLEMENT & COMMISSION ---
      case "v2.settlement.report":
        result = handleGetSettlementReportV2_(mergedParams, ss);
        break;

      case "v2.settlement.approve":
        result = handleApproveCommissionV2_(requestPayload, ss);
        break;

      // --- LEAD MARKETING & CONSULTATION ENDPOINTS ---
      case "v2.lead.capture":
      case "auth.register_lead":
        result = handleCaptureLeadV2_(requestPayload, ss);
        break;

      case "v2.leads.list":
        result = handleListLeadsV2_(mergedParams, ss);
        break;

      default:
        result = {
          success: false,
          error: "Endpoint V2 không được hỗ trợ: " + action,
          availableActions: [
            "v2.health", "v2.system.setup",
            "v2.workers.list", "v2.worker.get", "v2.worker.create", "v2.worker.update", "v2.worker.soft_delete",
            "v2.deals.list", "v2.deal.create", "v2.deal.move_stage", "v2.deal.update", "v2.deal.soft_delete",
            "v2.taxonomy.get", "v2.audit.list", "v2.dashboard.stats",
            "v2.batch.import", "v2.dispatch.roster", "v2.dispatch.checkin",
            "v2.attendance.match", "v2.settlement.report", "v2.settlement.approve",
            "v2.lead.capture", "v2.leads.list"
          ]
        };
        break;
    }

    return createJsonResponseV2_(result);
  } catch (error) {
    return createJsonResponseV2_({
      success: false,
      error: error.message || error.toString(),
      stack: error.stack
    });
  }
}

function createJsonResponseV2_(result) {
  if (result && typeof result === "object") {
    if (result.success && result.data === undefined) {
      if (result.items !== undefined) {
        result.data = result.items;
      } else if (result.worker !== undefined) {
        result.data = result.worker;
      } else if (result.deal !== undefined) {
        result.data = result.deal;
      } else if (result.metrics !== undefined) {
        result.data = result.metrics;
      } else {
        result.data = result;
      }
    }
  }
  var output = ContentService.createTextOutput(JSON.stringify(result));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

/**
 * Điều phối thiết lập toàn diện nền tảng V2
 */
function setupV2Platform(ss) {
  if (!ss) ss = getSpreadsheetV2_();
  if (!ss) return { success: false, error: "Không tìm thấy Spreadsheet." };

  renameSheetsToOption1_(ss);
  setupTaxonomySheets_(ss);
  setupMasterWorkersSheet_(ss);
  setupCrmDealsSheet_(ss);
  setupAuditLogSheet_(ss);
  applyNativeGmailProtections_(ss);
  applyNativeDataValidations_(ss);

  return {
    success: true,
    message: "Khởi tạo và cấu hình thành công toàn bộ hệ thống FCS V2 theo Phương án 1 (01, 02, 03)!",
    spreadsheetUrl: ss.getUrl()
  };
}

/**
 * Hàm alias trực tiếp cho thanh công cụ Run của Google Apps Script Editor
 */
function setupV2NativeSheets() {
  return setupV2Platform();
}

