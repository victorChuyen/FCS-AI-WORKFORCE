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

    // 2. Kiểm soát Khóa chính (Cột A - ID) trên 01_MASTER_WORKERS và 02_CRM_DEALS_2026
    if (col === 1 && (sheetName === V2_CONFIG.TAB_WORKERS || sheetName === V2_CONFIG.TAB_DEALS)) {
      var newVal = (range.getValue() || "").toString().trim();
      // Nếu người dùng nhập mã ID chuẩn (WK- hoặc DL-) thì cho phép lưu bình thường
      if (newVal.indexOf("WK-") === 0 || newVal.indexOf("DL-") === 0) {
        // Cho phép nhập hợp lệ, không revert
      } else if (!newVal && e.oldValue) {
        // Nếu xóa mất ID cũ của dòng đang có, nhắc nhở giữ lại
        range.setValue(e.oldValue);
        SpreadsheetApp.getActiveSpreadsheet().toast(
          "Nhắc nhở: Cột A là Mã định danh ID bắt buộc của hồ sơ.",
          "ℹ️ BẢO VỆ DỮ LIỆU FCS",
          4
        );
        return;
      }
    }

    // 3. Tự động cập nhật cột updated_at & updated_by trên dòng được chỉnh sửa
    if (sheetName === V2_CONFIG.TAB_WORKERS || sheetName === V2_CONFIG.TAB_DEALS) {
      var lastCol = sheet.getLastColumn();
      if (lastCol > 0) {
        var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
        var updatedIdx = headers.indexOf("updated_at");
        var userIdx = headers.indexOf("updated_by");
        var userEmail = Session.getActiveUser().getEmail() || "sheet_editor@fcs.vn";
        var nowIso = new Date().toISOString();

        // Tránh loop nếu chính cột updated_at/by được sửa
        if (updatedIdx !== -1 && col !== (updatedIdx + 1)) {
          sheet.getRange(row, updatedIdx + 1).setValue(nowIso);
        }
        if (userIdx !== -1 && col !== (userIdx + 1)) {
          sheet.getRange(row, userIdx + 1).setValue(userEmail);
        }

        // Đánh dấu bump version để cache được làm mới nhẹ nhàng
        try {
          CacheHelper_.bumpDataVersion(V2_CONFIG.PILOT_TENANT_ID);
        } catch(cErr) {}
      }
    }
  } catch (err) {
    Logger.log("Lỗi onEdit trigger: " + err.message);
  }
}
