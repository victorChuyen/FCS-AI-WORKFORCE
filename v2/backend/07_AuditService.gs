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
      "log_id", "tenant_id", "timestamp", "actor_email", "actor_role", "sheet_name",
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
      log.tenant_id || V2_CONFIG.PILOT_TENANT_ID,
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
    tenant_id: logObj.tenant_id || V2_CONFIG.PILOT_TENANT_ID,
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
  var tenantFilter = ((params && params.tenant_id) || "").toString().trim();

  var items = [];
  var idIdx = headers.indexOf("record_id");
  var sheetIdx = headers.indexOf("sheet_name");
  var tenantIdx = headers.indexOf("tenant_id");

  // Lấy các dòng mới nhất ở cuối sheet
  for (var i = data.length - 1; i >= 1; i--) {
    var row = data[i];
    if (tenantFilter && tenantIdx !== -1 && (row[tenantIdx] || "").toString().trim() !== tenantFilter) {
      continue;
    }
    if (recordIdFilter && idIdx !== -1 && (row[idIdx] || "").toString().indexOf(recordIdFilter) === -1) {
      continue;
    }
    if (sheetFilter && sheetIdx !== -1 && (row[sheetIdx] || "").toString().indexOf(sheetFilter) === -1) {
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
