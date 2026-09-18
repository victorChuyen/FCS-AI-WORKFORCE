/**
 * ==============================================================================
 * FCS AI WORKFORCE OS — ASSIGNMENT SERVICE
 * Part of V4 Multi-Tenant SaaS Platform Engine
 * ==============================================================================
 */

function getAssignments_(dataSs, workerId) {
  var sheet = dataSs.getSheetByName("07_ASSIGNMENTS");
  if (!sheet || sheet.getLastRow() <= 1) return { success: true, data: [] };
  var data = sheet.getDataRange().getValues();
  var result = [];
  for (var i = 1; i < data.length; i++) {
    if (!workerId || data[i][1] === workerId) {
      result.push({
        id: data[i][0],
        workerId: data[i][1],
        partnerId: data[i][2],
        jobId: data[i][3],
        startDate: data[i][4],
        status: data[i][6],
        attendanceDays: data[i][7] || 0
      });
    }
  }
  return { success: true, data: result };
}

function createAssignment_(dataSs, payload, tenantContext) {
  var sheet = dataSs.getSheetByName("07_ASSIGNMENTS");
  var id = "ASN-" + Date.now();
  sheet.appendRow([
    id,
    payload.workerId,
    payload.partnerId || "PT-01",
    payload.jobId || "JOB-01",
    payload.startDate || new Date().toISOString().split("T")[0],
    "",
    "WAITING_START",
    0,
    "9.5 triệu/tháng",
    payload.notes || ""
  ]);
  updateWorkerStatusInMaster_(dataSs, payload.workerId, "WAITING_START");
  return { success: true, data: { id: id, assignmentId: id, workerId: payload.workerId, status: "WAITING_START" } };
}

function startAssignment_(dataSs, assignmentIdOrPayload, tenantContext) {
  var assignmentId = typeof assignmentIdOrPayload === "object"
    ? (assignmentIdOrPayload.assignmentId || assignmentIdOrPayload.id)
    : assignmentIdOrPayload;
  var sheet = dataSs.getSheetByName("07_ASSIGNMENTS");
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === assignmentId) {
      sheet.getRange(i + 1, 7).setValue("WORKING");
      var workerId = data[i][1];
      updateWorkerStatusInMaster_(dataSs, workerId, "WORKING");
      return { success: true, data: { id: assignmentId, assignmentId: assignmentId, status: "WORKING" } };
    }
  }
  return { success: false, error: { code: "NOT_FOUND", message: "Không tìm thấy điều động" } };
}
