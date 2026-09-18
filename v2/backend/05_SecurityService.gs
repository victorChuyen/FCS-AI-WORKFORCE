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
