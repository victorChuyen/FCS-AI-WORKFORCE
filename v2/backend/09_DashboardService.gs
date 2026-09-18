/**
 * ==============================================================================
 * FCS AI WORKFORCE OS V2 — MODULE 9: DASHBOARD KPI SERVICE
 * Chức năng: Báo cáo số liệu thời gian thực cho Executive Dashboard & Analytics
 * Tuân thủ Guardrails V2.1:
 * - Versioned + Tenant-Scoped Cache (CacheService)
 * - Materialized Snapshot Read Model (Tab 00_DASHBOARD_KPI Bounded Ranges)
 * - Fallback Canonical Scanning nếu chưa có snapshot
 * - Performance & Audit Instrumentation (rows_read, compute_ms, cache_hit, data_version)
 * ==============================================================================
 */

function handleGetDashboardStatsV2_(ss, tenantId) {
  var startTime = Date.now();
  tenantId = tenantId || V2_CONFIG.PILOT_TENANT_ID;

  // 1. Kiểm tra Versioned Tenant Cache trước
  var cached = CacheHelper_.get(tenantId, "dashboard");
  if (cached && typeof cached === "object") {
    cached.cache_hit = true;
    cached.latency_ms = Date.now() - startTime;
    return cached;
  }

  // 2. Thử đọc từ Tab Snapshot KPI Bounded Native (Tối ưu cực nhanh: chỉ đọc 15 ô thay vì scan cả bảng)
  var kpiSheet = ss.getSheetByName(V2_CONFIG.TAB_DASHBOARD_KPI);
  if (kpiSheet && kpiSheet.getLastRow() >= 15) {
    try {
      var kpiVals = kpiSheet.getRange(2, 1, 14, 2).getValues();
      var kpiMap = {};
      for (var r = 0; r < kpiVals.length; r++) {
        var k = String(kpiVals[r][0] || "").trim();
        var v = kpiVals[r][1];
        kpiMap[k] = v;
      }

      var totalWorkers = Math.max(0, (Number(kpiMap["total_workers"]) || 0) - (Number(kpiMap["workers_deleted"]) || 0));
      var workersDeleted = Number(kpiMap["workers_deleted"]) || 0;
      var workersNam = Number(kpiMap["workers_nam"]) || 0;
      var workersNu = Number(kpiMap["workers_nu"]) || 0;

      var totalDeals = Math.max(0, (Number(kpiMap["total_deals"]) || 0) - (Number(kpiMap["deals_deleted"]) || 0));
      var dealsDeleted = Number(kpiMap["deals_deleted"]) || 0;
      var totalVww = Number(kpiMap["total_vww"]) || 0;

      var stageC3 = Number(kpiMap["stage_c3"]) || 0;
      var stageL1 = Number(kpiMap["stage_l1"]) || 0;
      var stageL2 = Number(kpiMap["stage_l2"]) || 0;
      var stageL3 = Number(kpiMap["stage_l3"]) || 0;
      var stageL4 = Number(kpiMap["stage_l4"]) || 0;

      var convC3toL2 = totalDeals > 0 ? Math.round((stageL2 + stageL3 + stageL4) / totalDeals * 100) : 0;
      var convL2toL3 = (stageL2 + stageL3 + stageL4) > 0 ? Math.round((stageL3 + stageL4) / (stageL2 + stageL3 + stageL4) * 100) : 0;
      var convL3toVww = (stageL3 + stageL4) > 0 ? Math.round(totalVww / (stageL3 + stageL4) * 100) : 0;

      var metricsFast = {
        total_workers: totalWorkers,
        totalWorkers: totalWorkers,
        workers_deleted: workersDeleted,
        workersDeleted: workersDeleted,
        workers_by_gender: { Nam: workersNam, "Nữ": workersNu },
        workersByGender: { Nam: workersNam, "Nữ": workersNu },
        total_deals: totalDeals,
        totalDeals: totalDeals,
        deals_deleted: dealsDeleted,
        dealsDeleted: dealsDeleted,
        north_star_vww: totalVww,
        northStarVww: totalVww,
        totalVww: totalVww,
        funnel_groups: {
          stage_c3_new_leads: stageC3,
          stage_l1_consulting: stageL1,
          stage_l2_interviewing: stageL2,
          stage_l3_working: stageL3,
          stage_l4_commission_vww: stageL4
        },
        conversion_rates: {
          c3_to_interview_percent: convC3toL2,
          interview_to_work_percent: convL2toL3,
          work_to_vww_percent: convL3toVww
        },
        stage_breakdown: {
          C3: stageC3,
          L1: stageL1,
          L2: stageL2,
          L3: stageL3,
          L4: stageL4
        },
        branch_distribution: {},
        company_distribution: {}
      };

      var fastResult = {
        success: true,
        data: metricsFast,
        metrics: metricsFast,
        data_source: "MATERIALIZED_SNAPSHOT_KPI",
        rows_read: 14,
        cache_hit: false,
        data_version: CacheHelper_.getDataVersion(tenantId),
        compute_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

      // Lưu cache 60s
      CacheHelper_.put(tenantId, "dashboard", fastResult, 60);
      return fastResult;
    } catch(kpiErr) {
      Logger.log("Lỗi đọc từ tab KPI snapshot, tự động chuyển sang fallback scan: " + kpiErr.message);
    }
  }

  // 3. FALLBACK CANONICAL SCAN: Quét trực tiếp nếu chưa có tab Snapshot
  var workerSheet = ss.getSheetByName(V2_CONFIG.TAB_WORKERS);
  var dealSheet = ss.getSheetByName(V2_CONFIG.TAB_DEALS);

  var totalWorkers = 0;
  var workersDeleted = 0;
  var workersByGender = { Nam: 0, "Nữ": 0 };
  var rowsReadCount = 0;

  if (workerSheet) {
    var wData = workerSheet.getDataRange().getValues();
    rowsReadCount += wData.length;
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
    L1: 0, "L1.1": 0, "L1.2": 0, "L1.3": 0, "L1.4": 0, "L1.5": 0, "L1.6": 0, "L1.7": 0,
    L2: 0, "L2.1": 0, "L2.2": 0, "L2.3": 0,
    L3: 0, "L3.1": 0, "L3.2": 0,
    L4: 0
  };
  var branchCounts = {};
  var companyCounts = {};

  if (dealSheet) {
    var dData = dealSheet.getDataRange().getValues();
    rowsReadCount += dData.length;
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

      var isVww = dRow[dVwwIdx] === true || dRow[dVwwIdx] === "TRUE" || stage === "L4";
      if (isVww) totalVww++;

      var b = (dRow[dBranchIdx] || "CHƯA PHÂN BỔ").toString().trim().toUpperCase();
      branchCounts[b] = (branchCounts[b] || 0) + 1;

      var c = (dRow[dCompIdx] || "CHƯA PHÂN BỔ").toString().trim().toUpperCase();
      companyCounts[c] = (companyCounts[c] || 0) + 1;
    }
  }

  var groupC3 = (stageCounts["C3"] || 0) + (stageCounts["C3.1"] || 0) + (stageCounts["C3.2"] || 0);
  var groupL1 = (stageCounts["L1"] || 0) + (stageCounts["L1.1"] || 0) + (stageCounts["L1.2"] || 0) +
                (stageCounts["L1.3"] || 0) + (stageCounts["L1.4"] || 0) + (stageCounts["L1.5"] || 0) +
                (stageCounts["L1.6"] || 0) + (stageCounts["L1.7"] || 0);
  var groupL2 = (stageCounts["L2"] || 0) + (stageCounts["L2.1"] || 0) + (stageCounts["L2.2"] || 0) + (stageCounts["L2.3"] || 0);
  var groupL3 = (stageCounts["L3"] || 0) + (stageCounts["L3.1"] || 0) + (stageCounts["L3.2"] || 0);
  var groupL4 = (stageCounts["L4"] || 0);

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

  var result = {
    success: true,
    data: metricsObj,
    metrics: metricsObj,
    data_source: "CANONICAL_SCAN_FALLBACK",
    rows_read: rowsReadCount,
    cache_hit: false,
    data_version: CacheHelper_.getDataVersion(tenantId),
    compute_ms: Date.now() - startTime,
    timestamp: new Date().toISOString()
  };

  // Lưu cache 60s
  CacheHelper_.put(tenantId, "dashboard", result, 60);
  return result;
}
