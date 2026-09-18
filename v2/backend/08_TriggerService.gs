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
