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
