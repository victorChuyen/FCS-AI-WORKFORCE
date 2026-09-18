/**
 * ==============================================================================
 * FCS AI WORKFORCE OS — ATTENDANCE SERVICE
 * Part of V4 Multi-Tenant SaaS Platform Engine
 * ==============================================================================
 */

function getAttendanceList_(dataSs, workerId) {
  var sheet = dataSs.getSheetByName("09_ATTENDANCE");
  if (!sheet || sheet.getLastRow() <= 1) return { success: true, data: [] };
  var data = sheet.getDataRange().getValues();
  var result = [];
  for (var i = 1; i < data.length; i++) {
    if (!workerId || data[i][1] === workerId) {
      result.push({
        id: data[i][0],
        workerId: data[i][1],
        partnerId: data[i][2],
        date: data[i][3],
        hours: data[i][4],
        shift: data[i][5],
        verifiedVww: Boolean(data[i][6])
      });
    }
  }
  return { success: true, data: result };
}

function matchAttendance_(dataSs, payload, tenantContext) {
  var rawSheet = dataSs.getSheetByName("08_ATTENDANCE_RAW");
  var attSheet = dataSs.getSheetByName("09_ATTENDANCE");
  var id = "ATT-" + Date.now();
  var nowIso = new Date().toISOString();

  attSheet.appendRow([
    id,
    payload.workerId,
    payload.partnerId || "PT-01",
    payload.date || nowIso.split("T")[0],
    payload.hours || 8,
    payload.shift || "CA_1",
    true, // Verified VWW
    nowIso,
    tenantContext.email
  ]);

  // Set is_vww to true on worker
  setWorkerVwwInMaster_(dataSs, payload.workerId, true);

  return { success: true, data: { attendanceId: id, workerId: payload.workerId, isVww: true } };
}
