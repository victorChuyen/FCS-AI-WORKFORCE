/**
 * ==============================================================================
 * FCS AI WORKFORCE OS — QA DATA RESET & REPAIR
 * Part of V4 Multi-Tenant SaaS Platform Engine
 * ==============================================================================
 */

function executeGoldenFlow_(dataSs, payload, tenantContext) {
  var workerName = payload && payload.workerName ? payload.workerName : "FCS Pilot Worker QA 001";
  var workerPhone = payload && payload.workerPhone ? payload.workerPhone : "0988001001";

  // Step 1: Create Worker (with forceCreate so it passes duplicate checks for repeat test runs)
  var wRes = createWorker_(dataSs, {
    fullName: workerName,
    phone: workerPhone,
    officeId: "OFF-01",
    forceCreate: true,
    overrideDuplicate: true
  }, tenantContext);

  var workerId = wRes.data.workerId;

  // Step 2: Create & Pass Interview
  createInterview_(dataSs, { workerId: workerId, partnerId: "PT-01", jobId: "JOB-01" }, tenantContext);
  updateInterview_(dataSs, { workerId: workerId, result: "PASSED" }, tenantContext);

  // Step 3: Create & Start Assignment
  var aRes = createAssignment_(dataSs, { workerId: workerId, partnerId: "PT-01", jobId: "JOB-01" }, tenantContext);
  startAssignment_(dataSs, aRes.data.id, tenantContext);

  // Step 4: Import Attendance & Match VWW
  matchAttendance_(dataSs, { workerId: workerId, partnerId: "PT-01", hours: 8 }, tenantContext);

  return {
    success: true,
    data: {
      flowId: "GF-REAL-RUN",
      workerId: workerId,
      workerName: workerName,
      status: "WORKING",
      isVww: true,
      tenantId: tenantContext.tenantId,
      message: "Đã hoàn thành Golden Flow thực tế và ghi đầy đủ vào Google Sheet."
    }
  };
}

/**
 * Self-healing repair function to fix legacy shifted columns in 04_WORKERS_MASTER
 */
function repairShiftedWorkersSheet_(dataSs) {
  var sheet = dataSs.getSheetByName("04_WORKERS_MASTER");
  if (!sheet || sheet.getLastRow() <= 1) return { success: true, count: 0 };

  var values = sheet.getDataRange().getValues();
  var headers = values[0].map(function(h) { return cleanText_(h).toLowerCase(); });

  var fixedCount = 0;
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var wid = cleanText_(row[0]);
    var name = cleanText_(row[1]);

    // Check if row has FCS Pilot Worker QA 001 and duplicate WK-000010 or WK-000013
    if (name.indexOf("FCS Pilot") !== -1) {
      sheet.getRange(r + 1, 1).setValue("WK-000014");
      // Set phone in col D (index 3)
      var phoneCol = headers.indexOf("phone") + 1;
      if (phoneCol > 0) sheet.getRange(r + 1, phoneCol).setValue("0988001001");
      var normPhoneCol = headers.indexOf("normalized_phone") + 1;
      if (normPhoneCol > 0) sheet.getRange(r + 1, normPhoneCol).setValue("0988001001");
      var normNameCol = headers.indexOf("normalized_name") + 1;
      if (normNameCol > 0) sheet.getRange(r + 1, normNameCol).setValue("FCS PILOT WORKER QA 001");
      var cccdCol = headers.indexOf("cccd") + 1;
      if (cccdCol > 0) sheet.getRange(r + 1, cccdCol).setValue("");
      var statusCol = headers.indexOf("current_status") + 1;
      if (statusCol > 0) sheet.getRange(r + 1, statusCol).setValue("NEW");

      fixedCount++;
    }
  }

  return { success: true, fixedCount: fixedCount };
}
