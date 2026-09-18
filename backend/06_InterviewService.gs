/**
 * ==============================================================================
 * FCS AI WORKFORCE OS — INTERVIEW SERVICE
 * Part of V4 Multi-Tenant SaaS Platform Engine
 * ==============================================================================
 */

function getInterviews_(dataSs, workerId) {
  var sheet = dataSs.getSheetByName("06_INTERVIEWS");
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
        scheduledDate: data[i][4],
        result: data[i][7],
        notes: data[i][9]
      });
    }
  }
  return { success: true, data: result };
}

function createInterview_(dataSs, payload, tenantContext) {
  var sheet = dataSs.getSheetByName("06_INTERVIEWS");
  var id = "INT-" + Date.now();
  sheet.appendRow([
    id,
    payload.workerId,
    payload.partnerId || "PT-01",
    payload.jobId || "JOB-01",
    payload.scheduledDate || new Date().toISOString().split("T")[0],
    "08:30",
    "Xưởng đối tác",
    "PENDING",
    tenantContext.staffId,
    payload.notes || ""
  ]);

  // Update Worker Status
  updateWorkerStatusInMaster_(dataSs, payload.workerId, "INTERVIEW_PENDING");
  return { success: true, data: { id: id, workerId: payload.workerId, status: "PENDING" } };
}

function updateInterview_(dataSs, payload, tenantContext) {
  var sheet = dataSs.getSheetByName("06_INTERVIEWS");
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === payload.interviewId || data[i][1] === payload.workerId) {
      sheet.getRange(i + 1, 8).setValue(payload.result || "PASSED");
      if (payload.result === "PASSED") {
        updateWorkerStatusInMaster_(dataSs, data[i][1], "PASSED");
      }
      return { success: true, data: { interviewId: data[i][0], result: payload.result } };
    }
  }
  return { success: false, error: { code: "NOT_FOUND", message: "Không tìm thấy phỏng vấn" } };
}
