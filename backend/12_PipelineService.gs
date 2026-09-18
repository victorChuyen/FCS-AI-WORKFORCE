/**
 * ==============================================================================
 * FCS AI WORKFORCE OS — PIPELINE SERVICE
 * Part of V4 Multi-Tenant SaaS Platform Engine
 * ==============================================================================
 */

function getPipelineFunnel_(dataSs) {
  var sheet = dataSs.getSheetByName("04_WORKERS_MASTER");
  var stages = {
    NEW: 0,
    INTERVIEW_PENDING: 0,
    PASSED: 0,
    WAITING_START: 0,
    WORKING: 0,
    VWW: 0
  };

  if (sheet && sheet.getLastRow() > 1) {
    var workers = readTable_(sheet);
    for (var i = 0; i < workers.length; i++) {
      var w = workers[i];
      var st = cleanText_(w.current_status || w.status || "NEW").toUpperCase();
      var isVww = w.is_vww === true || String(w.is_vww).toUpperCase() === "TRUE";

      if (isVww) stages.VWW++;
      if (st === "NEW" || st === "DUPLICATE") stages.NEW++;
      else if (st === "INTERVIEWED" || st === "INTERVIEW_PENDING") stages.INTERVIEW_PENDING++;
      else if (st === "PASSED") stages.PASSED++;
      else if (st === "WAITING_START") stages.WAITING_START++;
      else if (st === "WORKING") stages.WORKING++;
    }
  }

  return {
    success: true,
    data: [
      { stage: "NEW", count: stages.NEW, label: "Mới tiếp nhận" },
      { stage: "INTERVIEW_PENDING", count: stages.INTERVIEW_PENDING, label: "Chờ phỏng vấn" },
      { stage: "PASSED", count: stages.PASSED, label: "Đã đỗ phỏng vấn" },
      { stage: "WAITING_START", count: stages.WAITING_START, label: "Chờ đi làm" },
      { stage: "WORKING", count: stages.WORKING, label: "Đang làm việc" },
      { stage: "VWW", count: stages.VWW, label: "Chuẩn VWW" }
    ]
  };
}

function getPipelineEvents_(dataSs, workerId) {
  var sheet = dataSs.getSheetByName("05_PIPELINE_EVENTS");
  if (!sheet || sheet.getLastRow() <= 1) return { success: true, data: [] };

  var events = readTable_(sheet);
  var result = [];

  for (var i = 0; i < events.length; i++) {
    var ev = events[i];
    if (!workerId || ev.worker_id === workerId) {
      result.push({
        id: ev.event_id || ("EVT-" + i),
        workerId: ev.worker_id,
        eventType: ev.event_type,
        stageFrom: ev.stage_from,
        stageTo: ev.stage_to,
        timestamp: ev.created_at || ev.timestamp,
        note: ev.notes || ev.note
      });
    }
  }
  return { success: true, data: result };
}
