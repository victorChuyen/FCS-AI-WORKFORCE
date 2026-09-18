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
