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

  // Bump version để tự động invalidate cache
  CacheHelper_.bumpDataVersion(payload.tenantId || payload.requestedTenantId);

  return {
    success: true,
    message: "Đã cập nhật trạng thái hoa hồng (" + newStatus + ") cho " + updatedCount + " Deal!",
    data: {
      updated_count: updatedCount,
      status: newStatus
    }
  };
}
