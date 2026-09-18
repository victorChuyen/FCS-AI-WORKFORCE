/**
 * ==============================================================================
 * FCS AI WORKFORCE OS — ACTION QUEUE SERVICE
 * Part of V4 Multi-Tenant SaaS Platform Engine
 * ==============================================================================
 */

function getActionQueue_(dataSs, payload) {
  var category = payload && payload.category ? String(payload.category).toUpperCase().trim() : "";

  // 1. Specialized DUPLICATE queue query (used by ReviewPage.tsx / getDuplicateSuspects)
  if (category === "DUPLICATE") {
    var duplicateSuspects = getDuplicateSuspectsList_(dataSs);
    return { success: true, data: duplicateSuspects };
  }

  // 2. Regular Action Queue from Sheet
  var sheet = dataSs.getSheetByName("18_ACTION_QUEUE") || dataSs.getSheetByName("11_ACTION_QUEUE");
  var result = [];

  if (sheet && sheet.getLastRow() > 1) {
    var records = readTable_(sheet);
    var filterStatus = payload && payload.status && payload.status !== "ALL" ? String(payload.status).toUpperCase() : "";

    for (var i = 0; i < records.length; i++) {
      var row = records[i];
      var status = cleanText_(row.status || "OPEN").toUpperCase();
      var cat = cleanText_(row.category).toUpperCase();

      if (filterStatus && status !== filterStatus) continue;
      if (category && cat !== category) continue;

      result.push({
        actionId: cleanText_(row.action_id || row.id),
        priority: cleanText_(row.priority || "P2"),
        category: cat,
        workerId: cleanText_(row.worker_id),
        title: cleanText_(row.title),
        reason: cleanText_(row.reason),
        dueDate: cleanText_(row.due_date),
        status: status,
        createdAt: cleanText_(row.created_at),
        resolvedAt: cleanText_(row.resolved_at)
      });
    }
  }

  return { success: true, data: result };
}

function actionResolve_(dataSs, payload, tenantContext) {
  var actionId = payload && (payload.actionId || payload.id);
  var resolution = (payload && payload.resolution) || "RESOLVED";

  // If this is a duplicate suspect dismissal (e.g. DUP-WK-000010-WK-000011)
  if (String(actionId).indexOf("DUP-") === 0) {
    dismissDuplicatePair_(actionId);
    return {
      success: true,
      data: { actionId: actionId, status: "DISMISSED", resolution: resolution }
    };
  }

  var sheet = dataSs.getSheetByName("18_ACTION_QUEUE") || dataSs.getSheetByName("11_ACTION_QUEUE");
  if (!sheet || sheet.getLastRow() <= 1) {
    return { success: true, data: { resolved: true } };
  }

  var nowIso = new Date().toISOString();
  updateRecordByKey_(sheet, "action_id", actionId, {
    status: "RESOLVED",
    resolved_at: nowIso,
    resolution_note: resolution
  });

  return {
    success: true,
    data: { actionId: actionId, status: "RESOLVED", resolution: resolution }
  };
}
