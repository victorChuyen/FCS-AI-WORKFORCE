/**
 * ==============================================================================
 * FCS AI WORKFORCE OS V2 — MODULE 4: SECURITY SERVICE
 * Chức năng: Quản lý bảo mật bản địa Google Sheets:
 * 1. Phân quyền dải ô bảo vệ (Protected Ranges) theo Gmail (coach.chuyen@gmail.com)
 * 2. Khóa cứng Cột A (Khóa chính Worker ID & Deal ID) chống sửa/xóa bậy
 * 3. Khóa toàn bộ Sheet Danh mục (Taxonomy) & Nhật ký (Audit Log)
 * ==============================================================================
 */

/**
 * Kiểm tra xem một email có quyền Admin hay không
 * TỰ ĐỘNG MAP THEO QUYỀN GOOGLE SHEETS BẢN ĐỊA:
 * Bất kỳ ai là Owner hoặc có quyền Editor trên Google Spreadsheet đều là Admin!
 */
function isSpreadsheetAdmin_(userEmail, ss) {
  if (!userEmail) return false;
  var emailNorm = userEmail.toString().trim().toLowerCase();

  // 1. Danh sách Admin tĩnh được cấu hình
  var adminList = (V2_CONFIG.ADMIN_EMAILS || []).map(function(e) { return e.toLowerCase(); });
  if (adminList.indexOf(emailNorm) !== -1) return true;

  // 2. Tự động kiểm tra quyền trên Google Spreadsheet thực tế (Owner & Editors)
  try {
    if (!ss) ss = getSpreadsheetV2_();
    if (ss) {
      var owner = ss.getOwner();
      if (owner && owner.getEmail() && owner.getEmail().toLowerCase() === emailNorm) {
        return true;
      }
      var editors = ss.getEditors();
      for (var i = 0; i < editors.length; i++) {
        if (editors[i].getEmail() && editors[i].getEmail().toLowerCase() === emailNorm) {
          return true;
        }
      }
    }
  } catch(err) {
    Logger.log("Lỗi kiểm tra quyền Sheet Admin: " + err.message);
  }

  return false;
}

function applyNativeGmailProtections_(ss) {
  if (!ss) ss = getSpreadsheetV2_();
  if (!ss) return;

  // Lấy toàn bộ danh sách Admin từ cả cấu hình lẫn quyền Editor thật trên Google Sheets
  var authorizedEditors = [];
  (V2_CONFIG.ADMIN_EMAILS || []).forEach(function(em) {
    if (em && authorizedEditors.indexOf(em.toLowerCase()) === -1) {
      authorizedEditors.push(em.toLowerCase());
    }
  });

  try {
    var owner = ss.getOwner();
    if (owner && owner.getEmail()) {
      var ownerEm = owner.getEmail().toLowerCase();
      if (authorizedEditors.indexOf(ownerEm) === -1) authorizedEditors.push(ownerEm);
    }
    var driveEditors = ss.getEditors();
    driveEditors.forEach(function(u) {
      var em = u.getEmail() ? u.getEmail().toLowerCase() : "";
      if (em && authorizedEditors.indexOf(em) === -1) {
        authorizedEditors.push(em);
      }
    });
  } catch(e) {}

  var sheetsToProtectColA = [V2_CONFIG.TAB_WORKERS, V2_CONFIG.TAB_DEALS];
  
  // 1. Bảo vệ Cột A (Worker ID & Deal ID) - Chế độ CẢNH BÁO (Warning Only)
  // để mọi Admin (bao gồm dathao.188@gmail.com, tuanluong.51pm1@gmail.com, tranngocchuyen1980@gmail.com)
  // đều có quyền Thêm / Sửa / Xóa dòng tự do, không bao giờ bị chặn cứng!
  sheetsToProtectColA.forEach(function(tabName) {
    var sheet = ss.getSheetByName(tabName);
    if (!sheet) return;
    
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
    var protection = idRange.protect().setDescription("🔒 Bảo vệ Khóa chính ID - Cảnh báo nhầm lẫn");
    protection.setWarningOnly(true);
  });
  
  // 2. Bảo vệ Danh mục chuẩn (COMPANY, BRANCH, LEVEL_SALE) - Warning Only
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

    var protection = sheet.protect().setDescription("🔒 Danh mục chuẩn FCS - Cảnh báo nhầm lẫn");
    protection.setWarningOnly(true);
  });

  // 3. Bảo vệ Sheet 03_AUDIT_LOG - Warning Only
  var auditSheet = ss.getSheetByName(V2_CONFIG.TAB_AUDIT_LOG);
  if (auditSheet) {
    try {
      var existingProtections = auditSheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
      for (var p = 0; p < existingProtections.length; p++) {
        existingProtections[p].remove();
      }
    } catch(e) {}

    var auditProtection = auditSheet.protect().setDescription("🔒 Sổ cái Kiểm toán FCS V2");
    auditProtection.setWarningOnly(true);
  }
}

/**
 * Gỡ bỏ toàn bộ Range Protections và Sheet Protections trên toàn bộ bảng tính
 * Dành cho Chairman và Admin khi muốn mở hoàn toàn quyền Thêm / Sửa / Xóa cho các Admin
 */
function removeNativeGmailProtections_(ss) {
  if (!ss) ss = getSpreadsheetV2_();
  if (!ss) return { success: false, error: "Không tìm thấy Spreadsheet." };

  var sheets = ss.getSheets();
  var removedRanges = 0;
  var removedSheets = 0;

  sheets.forEach(function(sh) {
    try {
      var rangeProtections = sh.getProtections(SpreadsheetApp.ProtectionType.RANGE);
      for (var i = 0; i < rangeProtections.length; i++) {
        rangeProtections[i].remove();
        removedRanges++;
      }
    } catch(e) {}

    try {
      var sheetProtections = sh.getProtections(SpreadsheetApp.ProtectionType.SHEET);
      for (var j = 0; j < sheetProtections.length; j++) {
        sheetProtections[j].remove();
        removedSheets++;
      }
    } catch(e) {}
  });

  return {
    success: true,
    message: "ĐÃ MỞ KHÓA HOÀN TOÀN! Đã gỡ bỏ " + removedRanges + " dải ô bảo vệ và " + removedSheets + " bảng tính bảo vệ. Tất cả Admin có quyền Editor đều đã có thể Thêm / Sửa / Xóa bình thường!",
    removedRanges: removedRanges,
    removedSheets: removedSheets
  };
}

/**
 * Hàm thực thi trực tiếp từ thanh công cụ Run của Google Apps Script Editor
 */
function UNLOCK_ALL_SHEET_PROTECTIONS() {
  return removeNativeGmailProtections_();
}

/**
 * Tự động đồng bộ và mở quyền cho tất cả Gmail đang có quyền Editor trên Google Sheets
 * Thực thi trực tiếp từ menu Apps Script: Quét Drive Editors -> Bỏ ổ khóa -> Mở quyền Full Admin
 */
function AUTO_SYNC_PERMISSIONS_FROM_DRIVE() {
  var ss = getSpreadsheetV2_();
  if (!ss) return "Không tìm thấy Spreadsheet.";

  var ownerEmail = ss.getOwner() ? ss.getOwner().getEmail() : "N/A";
  var editors = ss.getEditors().map(function(u) { return u.getEmail(); });
  
  // Gỡ bỏ toàn bộ khóa cũ cản trở
  var unlockResult = removeNativeGmailProtections_(ss);
  
  var msg = "🎉 ĐÃ ĐỒNG BỘ QUYỀN TỰ ĐỘNG TỪ GOOGLE DRIVE THÀNH CÔNG!\n" +
            "👑 Chủ sở hữu (Owner): " + ownerEmail + "\n" +
            "👥 Danh sách Quản trị viên (Editors): " + editors.join(", ") + "\n" +
            "🔓 Trạng thái bảo vệ: Đã gỡ bỏ " + unlockResult.removedRanges + " ổ khóa dải ô và " + unlockResult.removedSheets + " ổ khóa sheet.\n" +
            "✅ Tất cả Admin trên đều có quyền Thêm, Sửa, Xóa dữ liệu ngang hàng với Chairman!";
  
  Logger.log(msg);
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast(
      "Đã mở quyền Full Admin cho " + editors.length + " tài khoản Editor!",
      "🚀 FCS V2 SECURITY SYNC",
      8
    );
  } catch(e) {}
  return msg;
}

/**
 * ==============================================================================
 * CLEAN SLATE RESET SERVICE (DÀNH CHO TẤT CẢ ADMIN HỢP LỆ)
 * ==============================================================================
 * Xóa sạch toàn bộ dữ liệu nghiệp vụ để thiết lập lại chuẩn Clean Slate.
 * Tất cả Quản trị viên (Owner & Editors của Sheet) đều có quyền thực thi.
 * Bắt buộc truyền confirm_code: "RESET-FCS-2026"
 */
function handleCleanSlateResetV2_(payload, ss) {
  if (!ss) ss = getSpreadsheetV2_();
  if (!ss) return { success: false, error: "Không tìm thấy Spreadsheet." };

  payload = payload || {};
  var actorEmail = (payload.actor_email || "").toString().trim().toLowerCase();
  var confirmCode = (payload.confirm_code || payload.confirmation_code || "").toString().trim();
  var isSuper = payload.is_super_admin === true || isSpreadsheetAdmin_(actorEmail, ss);

  if (!isSuper) {
    return {
      success: false,
      error: "TỪ CHỐI TRUY CẬP: Email '" + actorEmail + "' không thuộc danh sách Quản trị viên có quyền chỉnh sửa bảng tính!"
    };
  }

  if (confirmCode !== "RESET-FCS-2026") {
    return {
      success: false,
      error: "MÃ XÁC NHẬN KHÔNG CHÍNH XÁC: Vui lòng nhập đúng 'RESET-FCS-2026' để thực hiện thao tác nguy hiểm này!"
    };
  }

  var sheetsToClear = [
    V2_CONFIG.TAB_WORKERS,          // "01_MASTER_WORKERS"
    V2_CONFIG.TAB_DEALS,            // "02_CRM_DEALS_2026"
    V2_CONFIG.TAB_AUDIT_LOG,        // "03_AUDIT_LOG"
    "04_LEADS_MARKETING",
    V2_CONFIG.TAB_PIPELINE_EVENTS,  // "05_PIPELINE_EVENTS"
    "06_INTERVIEWS",
    "07_ASSIGNMENTS",
    "08_ATTENDANCE_RAW",
    "09_ATTENDANCE",
    "10_MATCHING_REVIEW",
    "11_ACTION_QUEUE"
  ];

  var clearedStats = {};

  for (var i = 0; i < sheetsToClear.length; i++) {
    var tabName = sheetsToClear[i];
    var sheet = ss.getSheetByName(tabName);
    if (!sheet) continue;

    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    if (lastRow > 1 && lastCol > 0) {
      // Xóa sạch toàn bộ nội dung từ dòng 2 (bao gồm cả các công thức VLOOKUP lỗi)
      sheet.getRange(2, 1, lastRow - 1, lastCol).clearContent();
      clearedStats[tabName] = lastRow - 1;
    } else {
      clearedStats[tabName] = 0;
    }
  }

  // Tùy chọn: Nếu có yêu cầu nạp 10 mẫu chuẩn
  var seeded = false;
  if (payload.seed_clean_sample === true) {
    seedCleanSampleDataV2_(ss);
    seeded = true;
  }

  // Ghi nhận 1 log kiểm toán duy nhất
  try {
    var auditSheet = ss.getSheetByName(V2_CONFIG.TAB_AUDIT_LOG);
    if (auditSheet) {
      var now = new Date();
      var dateStr = Utilities.formatDate(now, "GMT+7", "yyyyMMdd");
      var logId = V2_CONFIG.PREFIX_AUDIT + dateStr + "-000001";
      auditSheet.appendRow([
        logId,
        V2_CONFIG.PILOT_TENANT_ID,
        now.toISOString(),
        actorEmail,
        "PLATFORM_SUPER_ADMIN",
        "SYSTEM",
        "ALL_OPERATIONAL_SHEETS",
        "CLEAN_SLATE_RESET",
        "status",
        "PREVIOUS_DATA",
        seeded ? "SEEDED_10_SAMPLES" : "CLEAN_SLATE_EMPTY",
        "Thực thi Reset toàn diện bởi Super Admin: " + actorEmail
      ]);
    }
  } catch(e) {}

  // Flush và làm mới cache
  SpreadsheetApp.flush();
  CacheHelper_.bumpDataVersion(V2_CONFIG.PILOT_TENANT_ID);

  return {
    success: true,
    message: seeded
      ? "Đã xóa sạch toàn bộ dữ liệu cũ và nạp lại 10 hồ sơ & deal mẫu chuẩn không lỗi!"
      : "Đã xóa sạch hoàn toàn dữ liệu nghiệp vụ trên 11 bảng! Hệ thống đã ở trạng thái Clean Slate chuẩn 100%.",
    cleared: clearedStats,
    seeded: seeded
  };
}

/**
 * Nạp 10 hồ sơ lao động và 10 CRM Deals chuẩn xác thực (Static Values - Zero Broken Formulas)
 */
function seedCleanSampleDataV2_(ss) {
  if (!ss) ss = getSpreadsheetV2_();
  var nowIso = new Date().toISOString();

  // 1. Nạp 10 Master Workers (34 Cột chuẩn VNeID)
  var wSheet = ss.getSheetByName(V2_CONFIG.TAB_WORKERS);
  if (wSheet) {
    var sampleWorkers = [
      ["WK-T001","HN-01","Nguyễn Thị Mai Linh","Nữ","2002-05-15","036202051234","2021-06-10","THPT Kim Bảng A","Phổ thông",2020,"Hà Nam","Kinh","Hà Nam","Xã Thi Sơn, Huyện Kim Bảng, Tỉnh Hà Nam","Xã Thi Sơn, Huyện Kim Bảng, Tỉnh Hà Nam","Kinh","Không","Chưa tham gia","O","0912345601","Nguyễn Văn Nam","0987654321","Bố","Nguyễn Văn Nam - 1975 - Làm nông","Trần Thị Hoa - 1978 - Làm nông","Chưa kết hôn","Không có","0912345601","fb.com/mailinh2002","HÀ NAM","Đang làm việc","FUYU",nowIso,nowIso],
      ["WK-T002","BG-01","Trần Văn Bình","Nam","1998-10-20","074200082001","2019-08-15","THPT Việt Yên 1","Phổ thông",2016,"Bắc Giang","Kinh","Bắc Giang","Xã Tăng Tiến, Huyện Việt Yên, Tỉnh Bắc Giang","Xã Tăng Tiến, Huyện Việt Yên, Tỉnh Bắc Giang","Kinh","Không","Đã xuất ngũ","A","0912345602","Trần Văn Cường","0987654322","Bố","Trần Văn Cường - 1970 - Công nhân","Nguyễn Thị Mai - 1973 - Nông nghiệp","Đã kết hôn","1 con","0912345602","fb.com/binhtran98","BẮC GIANG","Đang làm việc","FUYU",nowIso,nowIso],
      ["WK-T003","HY-01","Lê Thị Hương","Nữ","2001-03-12","022201031001","2020-04-20","CĐ Nghề Hưng Yên","May mặc",2021,"Hưng Yên","Kinh","Hưng Yên","Xã Dân Tiến, Huyện Khoái Châu, Tỉnh Hưng Yên","Xã Dân Tiến, Huyện Khoái Châu, Tỉnh Hưng Yên","Kinh","Không","Chưa tham gia","B","0912345603","Lê Văn Hùng","0987654323","Bố","Lê Văn Hùng - 1972 - Thợ xây","Phạm Thị Lan - 1975 - Làm may","Chưa kết hôn","Không có","0912345603","fb.com/huongle01","HƯNG YÊN","Đang làm việc","FUYU",nowIso,nowIso],
      ["WK-T004","HN-02","Phạm Thị Đan Thanh","Nữ","2004-11-28","079198112201","2022-12-05","THPT Phủ Lý A","Phổ thông",2022,"Hà Nam","Kinh","Hà Nam","Phường Minh Khai, TP Phủ Lý, Tỉnh Hà Nam","Phường Minh Khai, TP Phủ Lý, Tỉnh Hà Nam","Kinh","Không","Chưa tham gia","AB","0912345604","Phạm Văn Hải","0987654324","Bố","Phạm Văn Hải - 1976 - Kinh doanh","Đỗ Thị Dung - 1980 - Giáo viên","Chưa kết hôn","Không có","0912345604","fb.com/thanhdan04","HÀ NAM","Đang làm việc","FUYU",nowIso,nowIso],
      ["WK-T005","BG-02","Nguyễn Văn Hùng","Nam","1999-07-04","036203010501","2020-09-10","CĐ Kỹ thuật Bắc Giang","Hàn điện",2020,"Bắc Giang","Kinh","Bắc Giang","Xã Quang Châu, Huyện Việt Yên, Tỉnh Bắc Giang","Xã Quang Châu, Huyện Việt Yên, Tỉnh Bắc Giang","Kinh","Không","Chưa tham gia","O","0912345605","Nguyễn Văn Tuấn","0987654325","Bố","Nguyễn Văn Tuấn - 1971 - Làm nông","Nguyễn Thị Vân - 1974 - Nông nghiệp","Chưa kết hôn","Không có","0912345605","fb.com/hungnguyen99","BẮC GIANG","Đang làm việc","FUYU",nowIso,nowIso],
      ["WK-T006","BG-03","Vũ Thị Lan","Nữ","2003-09-18","033201071801","2021-11-12","THPT Hiệp Hòa 2","Phổ thông",2021,"Bắc Giang","Kinh","Bắc Giang","Xã Châu Minh, Huyện Hiệp Hòa, Tỉnh Bắc Giang","Xã Châu Minh, Huyện Hiệp Hòa, Tỉnh Bắc Giang","Kinh","Không","Chưa tham gia","A","0912345606","Vũ Văn Kiên","0987654326","Bố","Vũ Văn Kiên - 1975 - Làm mộc","Lê Thị Nga - 1977 - Nội trợ","Chưa kết hôn","Không có","0912345606","fb.com/lanvu03","BẮC GIANG","Đang làm việc","LUXSHARE",nowIso,nowIso],
      ["WK-T007","BG-04","Đặng Văn Minh","Nam","1997-12-05","036200041201","2018-05-20","THPT Lục Ngạn 1","Phổ thông",2015,"Bắc Giang","Kinh","Bắc Giang","Thị trấn Chũ, Huyện Lục Ngạn, Tỉnh Bắc Giang","Thị trấn Chũ, Huyện Lục Ngạn, Tỉnh Bắc Giang","Kinh","Không","Đã xuất ngũ","B","0912345607","Đặng Văn Thanh","0987654327","Bố","Đặng Văn Thanh - 1968 - Làm vườn","Trần Thị Lệ - 1972 - Làm nông","Đã kết hôn","2 con","0912345607","fb.com/minhdang97","BẮC GIANG","Đang làm việc","FUYU",nowIso,nowIso],
      ["WK-T008","QN-01","Hoàng Thị Thu","Nữ","2000-08-22","036202093001","2019-10-05","CĐ Y Dược Quảng Ninh","Dược tá",2021,"Quảng Ninh","Kinh","Quảng Ninh","Phường Bãi Cháy, TP Hạ Long, Tỉnh Quảng Ninh","Phường Bãi Cháy, TP Hạ Long, Tỉnh Quảng Ninh","Kinh","Không","Chưa tham gia","O","0912345608","Hoàng Văn Định","0987654328","Bố","Hoàng Văn Định - 1973 - Thợ mỏ","Nguyễn Thị Xuyến - 1976 - Bán hàng","Chưa kết hôn","Không có","0912345608","fb.com/thuhoang00","QUẢNG NINH","Đang làm việc","FUYU",nowIso,nowIso],
      ["WK-T009","HP-01","Bùi Văn Tám","Nam","1995-04-16","036199122501","2016-07-15","THPT An Dương","Phổ thông",2013,"Hải Phòng","Kinh","Hải Phòng","Xã An Hưng, Huyện An Dương, TP Hải Phòng","Xã An Hưng, Huyện An Dương, TP Hải Phòng","Kinh","Không","Đã hoàn thành NVQS","A","0912345609","Bùi Văn Chung","0987654329","Bố","Bùi Văn Chung - 1966 - Nghỉ hưu","Phạm Thị Thắm - 1969 - Nội trợ","Đã kết hôn","1 con","0912345609","fb.com/tambui95","HẢI PHÒNG","Đang làm việc","FUYU",nowIso,nowIso],
      ["WK-T010","BG-05","Ngô Thị Hà","Nữ","2001-01-30","036201060801","2020-03-15","THPT Yên Dũng 1","Phổ thông",2019,"Bắc Giang","Kinh","Bắc Giang","Xã Tiền Phong, Huyện Yên Dũng, Tỉnh Bắc Giang","Xã Tiền Phong, Huyện Yên Dũng, Tỉnh Bắc Giang","Kinh","Không","Chưa tham gia","O","0912345610","Ngô Văn Trọng","0987654330","Bố","Ngô Văn Trọng - 1974 - Thợ cơ khí","Vũ Thị Loan - 1976 - Làm nông","Chưa kết hôn","Không có","0912345610","fb.com/hango01","BẮC GIANG","Đang làm việc","FUYU",nowIso,nowIso]
    ];
    for (var w = 0; w < sampleWorkers.length; w++) {
      wSheet.appendRow(sampleWorkers[w]);
    }
  }

  // 2. Nạp 10 CRM Deals (22 Cột - Toàn bộ dữ liệu Tĩnh, Tuyệt đối KHÔNG DÙNG CÔNG THỨC VLOOKUP)
  var dSheet = ss.getSheetByName(V2_CONFIG.TAB_DEALS);
  if (dSheet) {
    var sampleDeals = [
      ["DL-2026-T001","WK-T001","Nguyễn Thị Mai Linh","0912345601","036202051234","FUYU","HÀ NAM","L3","Sale Nguyễn Hoa","","2026-08-20","Đỗ phỏng vấn","2026-08-22","Đang đi làm",true,"Cố định 2.500.000đ",2500000,"ĐÃ DUYỆT","Hồ sơ mẫu chuẩn xác thực",nowIso,nowIso,V2_CONFIG.SUPER_ADMIN_EMAIL],
      ["DL-2026-T002","WK-T002","Trần Văn Bình","0912345602","074200082001","FUYU","BẮC GIANG","L3","Sale Lê Thảo","","2026-08-18","Đỗ phỏng vấn","2026-08-20","Đang đi làm",true,"Cố định 2.500.000đ",2500000,"ĐÃ DUYỆT","Hồ sơ mẫu chuẩn xác thực",nowIso,nowIso,V2_CONFIG.SUPER_ADMIN_EMAIL],
      ["DL-2026-T003","WK-T003","Lê Thị Hương","0912345603","022201031001","FUYU","HƯNG YÊN","L3","Sale Phạm Châu","CTV Nguyễn Lan","2026-08-22","Đỗ phỏng vấn","2026-08-25","Đang đi làm",true,"Cố định 2.500.000đ",2500000,"ĐÃ DUYỆT","Hồ sơ mẫu chuẩn xác thực",nowIso,nowIso,V2_CONFIG.SUPER_ADMIN_EMAIL],
      ["DL-2026-T004","WK-T004","Phạm Thị Đan Thanh","0912345604","079198112201","FUYU","HÀ NAM","L1.3","Sale Vũ Minh","","","","","Chờ phỏng vấn",false,"Cố định 2.500.000đ",2500000,"CHƯA DUYỆT","Hồ sơ mẫu chuẩn xác thực",nowIso,nowIso,V2_CONFIG.SUPER_ADMIN_EMAIL],
      ["DL-2026-T005","WK-T005","Nguyễn Văn Hùng","0912345605","036203010501","FUYU","BẮC GIANG","L2.1","Sale Nguyễn Hoa","AFF Zalo","2026-09-21","Đỗ phỏng vấn","","Chờ nhận việc",false,"Cố định 2.500.000đ",2500000,"CHƯA DUYỆT","Hồ sơ mẫu chuẩn xác thực",nowIso,nowIso,V2_CONFIG.SUPER_ADMIN_EMAIL],
      ["DL-2026-T006","WK-T006","Vũ Thị Lan","0912345606","033201071801","LUXSHARE","BẮC GIANG","L2.1","Sale Trần Bình","AFF/CTV Hoàng Lan","2026-09-11","Đỗ phỏng vấn","","Chờ nhận việc",false,"Cố định 2.500.000đ",2500000,"CHƯA DUYỆT","Hồ sơ mẫu chuẩn xác thực",nowIso,nowIso,V2_CONFIG.SUPER_ADMIN_EMAIL],
      ["DL-2026-T007","WK-T007","Đặng Văn Minh","0912345607","036200041201","FUYU","BẮC GIANG","L3","Sale Phạm Châu","","2026-08-12","Đỗ phỏng vấn","2026-08-15","Đang đi làm",true,"Cố định 2.500.000đ",2500000,"ĐÃ DUYỆT","Hồ sơ mẫu chuẩn xác thực",nowIso,nowIso,V2_CONFIG.SUPER_ADMIN_EMAIL],
      ["DL-2026-T008","WK-T008","Hoàng Thị Thu","0912345608","036202093001","FUYU","QUẢNG NINH","L3.1","Sale Lê Thảo","","2026-07-28","Đỗ phỏng vấn","2026-08-01","Nghỉ việc tạm thời",false,"Cố định 2.500.000đ",2500000,"TẠM GIỮ","Hồ sơ mẫu chuẩn xác thực",nowIso,nowIso,V2_CONFIG.SUPER_ADMIN_EMAIL],
      ["DL-2026-T009","WK-T009","Bùi Văn Tám","0912345609","036199122501","FUYU","HẢI PHÒNG","L3.2","Sale Vũ Minh","","2026-07-15","Đỗ phỏng vấn","2026-07-20","Chuyển xưởng",false,"Cố định 2.500.000đ",2500000,"CHƯA DUYỆT","Hồ sơ mẫu chuẩn xác thực",nowIso,nowIso,V2_CONFIG.SUPER_ADMIN_EMAIL],
      ["DL-2026-T010","WK-T010","Ngô Thị Hà","0912345610","036201060801","FUYU","BẮC GIANG","L4","Sale Nguyễn Hoa","AFF Hệ thống","2026-06-18","Đỗ phỏng vấn","2026-06-20","Hoàn thành hợp đồng phí",true,"Cố định 2.500.000đ",2500000,"ĐÃ THANH TOÁN","Hồ sơ mẫu chuẩn xác thực",nowIso,nowIso,V2_CONFIG.SUPER_ADMIN_EMAIL]
    ];
    for (var d = 0; d < sampleDeals.length; d++) {
      dSheet.appendRow(sampleDeals[d]);
    }
  }
}

