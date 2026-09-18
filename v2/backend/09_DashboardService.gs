/**
 * ==============================================================================
 * FCS AI WORKFORCE OS V2 — MODULE 9: DASHBOARD KPI SERVICE
 * Chức năng: Báo cáo số liệu thời gian thực cho Executive Dashboard & Analytics
 * 1. Tổng số Master Worker & Active Deals
 * 2. Phân bổ theo 19 Level Sale (C3 -> L4)
 * 3. Thước đo North Star: VWW (Verified Working Workers)
 * 4. Phân bổ theo 8 Chi nhánh & 29 Nhà máy đối tác
 * 5. Tỷ lệ chuyển đổi phễu tuyển dụng (Conversion Funnel)
 * ==============================================================================
 */

function handleGetDashboardStatsV2_(ss) {
  var workerSheet = ss.getSheetByName(V2_CONFIG.TAB_WORKERS);
  var dealSheet = ss.getSheetByName(V2_CONFIG.TAB_DEALS);

  var totalWorkers = 0;
  var workersDeleted = 0;
  var workersByGender = { Nam: 0, "Nữ": 0 };

  if (workerSheet) {
    var wData = workerSheet.getDataRange().getValues();
    var wHeaders = wData[0] || [];
    var wGenderIdx = wHeaders.indexOf("gender");
    var wStatusIdx = wHeaders.indexOf("working_status");

    for (var i = 1; i < wData.length; i++) {
      var row = wData[i];
      var wStatus = (row[wStatusIdx] || "").toString();
      if (wStatus.indexOf("DELETED") !== -1) {
        workersDeleted++;
      } else {
        totalWorkers++;
        var g = (row[wGenderIdx] || "").toString().trim();
        if (g === "Nữ") workersByGender["Nữ"]++;
        else workersByGender.Nam++;
      }
    }
  }

  var totalDeals = 0;
  var dealsDeleted = 0;
  var totalVww = 0;
  var stageCounts = {
    C3: 0, "C3.1": 0, "C3.2": 0,
    L1: 0, "L1.1": 0, "L1.2": 0, "L1.3": 0, "L1.4": 0, "L1.5": 0, "L1.6": 0, "L1.8": 0,
    L2: 0, "L2.1": 0, "L2.2": 0, "L2.3": 0,
    L3: 0, "L3.1": 0, "L3.2": 0,
    L4: 0
  };
  var branchCounts = {};
  var companyCounts = {};

  if (dealSheet) {
    var dData = dealSheet.getDataRange().getValues();
    var dHeaders = dData[0] || [];
    var dStageIdx = dHeaders.indexOf("level_sale_status");
    var dBranchIdx = dHeaders.indexOf("branch");
    var dCompIdx = dHeaders.indexOf("target_company");
    var dVwwIdx = dHeaders.indexOf("is_vww");

    for (var k = 1; k < dData.length; k++) {
      var dRow = dData[k];
      var stage = (dRow[dStageIdx] || "").toString().trim();

      if (stage === "DELETED") {
        dealsDeleted++;
        continue;
      }

      totalDeals++;
      if (stageCounts[stage] !== undefined) {
        stageCounts[stage]++;
      } else {
        stageCounts[stage] = 1;
      }

      // Đếm VWW (Verified Working Worker)
      var isVww = dRow[dVwwIdx] === true || dRow[dVwwIdx] === "TRUE" || stage === "L4";
      if (isVww) totalVww++;

      // Đếm theo chi nhánh
      var b = (dRow[dBranchIdx] || "CHƯA PHÂN BỔ").toString().trim().toUpperCase();
      branchCounts[b] = (branchCounts[b] || 0) + 1;

      // Đếm theo công ty đối tác
      var c = (dRow[dCompIdx] || "CHƯA PHÂN BỔ").toString().trim().toUpperCase();
      companyCounts[c] = (companyCounts[c] || 0) + 1;
    }
  }

  // Nhóm theo các chặng lớn của phễu
  var groupC3 = (stageCounts["C3"] || 0) + (stageCounts["C3.1"] || 0) + (stageCounts["C3.2"] || 0);
  var groupL1 = (stageCounts["L1"] || 0) + (stageCounts["L1.1"] || 0) + (stageCounts["L1.2"] || 0) +
                (stageCounts["L1.3"] || 0) + (stageCounts["L1.4"] || 0) + (stageCounts["L1.5"] || 0) +
                (stageCounts["L1.6"] || 0) + (stageCounts["L1.8"] || 0);
  var groupL2 = (stageCounts["L2"] || 0) + (stageCounts["L2.1"] || 0) + (stageCounts["L2.2"] || 0) + (stageCounts["L2.3"] || 0);
  var groupL3 = (stageCounts["L3"] || 0) + (stageCounts["L3.1"] || 0) + (stageCounts["L3.2"] || 0);
  var groupL4 = (stageCounts["L4"] || 0);

  // Tỷ lệ chuyển đổi phễu
  var convC3toL2 = totalDeals > 0 ? Math.round((groupL2 + groupL3 + groupL4) / totalDeals * 100) : 0;
  var convL2toL3 = (groupL2 + groupL3 + groupL4) > 0 ? Math.round((groupL3 + groupL4) / (groupL2 + groupL3 + groupL4) * 100) : 0;
  var convL3toVww = (groupL3 + groupL4) > 0 ? Math.round(totalVww / (groupL3 + groupL4) * 100) : 0;

  var metricsObj = {
    total_workers: totalWorkers,
    totalWorkers: totalWorkers,
    workers_deleted: workersDeleted,
    workersDeleted: workersDeleted,
    workers_by_gender: workersByGender,
    workersByGender: workersByGender,
    total_deals: totalDeals,
    totalDeals: totalDeals,
    deals_deleted: dealsDeleted,
    dealsDeleted: dealsDeleted,
    north_star_vww: totalVww,
    northStarVww: totalVww,
    totalVww: totalVww,
    funnel_groups: {
      stage_c3_new_leads: groupC3,
      stage_l1_consulting: groupL1,
      stage_l2_interviewing: groupL2,
      stage_l3_working: groupL3,
      stage_l4_commission_vww: groupL4
    },
    conversion_rates: {
      c3_to_interview_percent: convC3toL2,
      interview_to_work_percent: convL2toL3,
      work_to_vww_percent: convL3toVww
    },
    stage_breakdown: stageCounts,
    branch_distribution: branchCounts,
    company_distribution: companyCounts
  };

  return {
    success: true,
    data: metricsObj,
    timestamp: new Date().toISOString(),
    metrics: metricsObj
  };
}
