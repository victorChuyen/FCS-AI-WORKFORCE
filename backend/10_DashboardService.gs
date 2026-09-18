/**
 * ==============================================================================
 * FCS AI WORKFORCE OS — DASHBOARD SERVICE
 * Part of V4 Multi-Tenant SaaS Platform Engine
 * ==============================================================================
 */

function getDashboardSummary_(dataSs, mgmtSs, tenantContext) {
  var workersSheet = dataSs.getSheetByName("04_WORKERS_MASTER");
  var actionsSheet = dataSs.getSheetByName("18_ACTION_QUEUE") || dataSs.getSheetByName("11_ACTION_QUEUE");

  var totalWorkers = 0;
  var newWorkers = 0;
  var interviewed = 0;
  var passed = 0;
  var waitingStart = 0;
  var working = 0;
  var verifiedWorking = 0;

  if (workersSheet && workersSheet.getLastRow() > 1) {
    var workers = readTable_(workersSheet);
    totalWorkers = workers.length;

    for (var i = 0; i < workers.length; i++) {
      var w = workers[i];
      var st = cleanText_(w.current_status || w.status || "NEW").toUpperCase();
      var isVww = w.is_vww === true || String(w.is_vww).toUpperCase() === "TRUE";

      if (isVww) verifiedWorking++;
      if (st === "NEW" || st === "DUPLICATE") newWorkers++;
      else if (st === "INTERVIEWED" || st === "INTERVIEW_PENDING") interviewed++;
      else if (st === "PASSED") passed++;
      else if (st === "WAITING_START") waitingStart++;
      else if (st === "WORKING") working++;
    }
  }

  // Calculate Duplicate Suspects
  var duplicateSuspects = getDuplicateSuspectsList_(dataSs);
  var duplicateSuspectCount = duplicateSuspects.length;

  var openActions = 0;
  var p0 = 0, p1 = 0, p2 = 0, p3 = 0;
  if (actionsSheet && actionsSheet.getLastRow() > 1) {
    var actRecords = readTable_(actionsSheet);
    for (var a = 0; a < actRecords.length; a++) {
      var item = actRecords[a];
      var actStatus = cleanText_(item.status || "OPEN").toUpperCase();
      if (actStatus === "OPEN") {
        openActions++;
        var prio = cleanText_(item.priority || "P2").toUpperCase();
        if (prio === "P0" || prio === "HIGH") p0++;
        else if (prio === "P1") p1++;
        else if (prio === "P2" || prio === "MEDIUM") p2++;
        else if (prio === "P3" || prio === "LOW") p3++;
      }
    }
  }

  // Include duplicate count in high priority actions if not already tracked
  if (duplicateSuspectCount > 0 && p0 === 0 && p1 === 0) {
    p1 += duplicateSuspectCount;
    openActions += duplicateSuspectCount;
  }

  return {
    success: true,
    data: {
      tenantId: tenantContext.tenantId,
      companyName: tenantContext.companyName,
      metrics: {
        totalWorkers: totalWorkers,
        newWorkers: newWorkers,
        interviewed: interviewed,
        passed: passed,
        waitingStart: waitingStart,
        working: working,
        verifiedWorking: verifiedWorking,
        pendingReview: p0 + duplicateSuspectCount,
        openActions: openActions,
        duplicateSuspectCount: duplicateSuspectCount
      },
      priorities: { P0: p0, P1: p1, P2: p2, P3: p3 },
      northStar: { value: verifiedWorking, target: 500, label: "Verified Working Worker (VWW)" }
    }
  };
}

function getOperationalResults_(dataSs) {
  var sheet = dataSs.getSheetByName("04_WORKERS_MASTER");
  var vwwCount = 0;
  var total = 0;

  if (sheet && sheet.getLastRow() > 1) {
    var workers = readTable_(sheet);
    total = workers.length;
    for (var i = 0; i < workers.length; i++) {
      var isVww = workers[i].is_vww === true || String(workers[i].is_vww).toUpperCase() === "TRUE";
      if (isVww) vwwCount++;
    }
  }

  var rate = total > 0 ? ((vwwCount / total) * 100).toFixed(1) : "0.0";
  return {
    success: true,
    data: {
      vwwCount: vwwCount,
      totalWorkers: total,
      retentionRate: rate + "%",
      targetVww: 500
    }
  };
}
