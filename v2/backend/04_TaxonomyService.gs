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
      ["L1.7", "L1.7. Lao động thiếu tuổi", "CHĂM SÓC", "Sale, Leader Sale"],
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
  var startTime = Date.now();

  // 1. Kiểm tra CacheService (TTL 6 giờ)
  var cached = CacheHelper_.getTaxonomy();
  if (cached && typeof cached === "object") {
    return {
      success: true,
      data: cached,
      companies: cached.companies,
      branches: cached.branches,
      levelSales: cached.levelSales,
      cache_hit: true,
      compute_ms: Date.now() - startTime,
      taxonomy_version: 1
    };
  }

  // 2. Cache miss: Đọc từ sheets
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

  // Lưu vào CacheService (6 giờ)
  CacheHelper_.putTaxonomy(taxObj);

  return {
    success: true,
    data: taxObj,
    companies: taxObj.companies,
    branches: taxObj.branches,
    levelSales: taxObj.levelSales,
    cache_hit: false,
    compute_ms: Date.now() - startTime,
    taxonomy_version: 1
  };
}
