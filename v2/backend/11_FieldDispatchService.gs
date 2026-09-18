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
