/**
 * ==============================================================================
 * FCS AI WORKFORCE OS — WORKER SERVICE
 * Part of V4 Multi-Tenant SaaS Platform Engine
 * ==============================================================================
 */

function getWorkers_(dataSs, payload) {
  var sheet = dataSs.getSheetByName("04_WORKERS_MASTER");
  if (!sheet || sheet.getLastRow() <= 1) {
    return { success: true, data: [] };
  }

  var workers = readTable_(sheet);
  var result = [];
  var search = payload && payload.search ? String(payload.search).toLowerCase().trim() : "";
  var statusFilter = payload && payload.status && payload.status !== "ALL" ? String(payload.status).toUpperCase() : "";

  for (var i = 0; i < workers.length; i++) {
    var w = workers[i];
    var status = cleanText_(w.current_status || w.status || "NEW").toUpperCase();
    var isVww = w.is_vww === true || String(w.is_vww).toUpperCase() === "TRUE";

    if (statusFilter && status !== statusFilter) continue;
    if (search) {
      var matchId = String(w.worker_id || "").toLowerCase().indexOf(search) !== -1;
      var matchName = String(w.full_name || "").toLowerCase().indexOf(search) !== -1;
      var matchPhone = String(w.phone || w.normalized_phone || "").toLowerCase().indexOf(search) !== -1;
      var matchCccd = String(w.cccd || "").toLowerCase().indexOf(search) !== -1;
      if (!matchId && !matchName && !matchPhone && !matchCccd) continue;
    }

    result.push({
      workerId: w.worker_id,
      fullName: w.full_name,
      phone: w.phone || w.normalized_phone || "",
      idCard: w.cccd || "",
      birthYear: w.date_of_birth || w.birth_year || "",
      gender: w.gender || "",
      hometown: w.province || w.hometown || "",
      status: status,
      isVerifiedWorking: isVww,
      isVww: isVww,
      activePartnerId: w.active_partner_id || "",
      officeId: w.office_id || "",
      recruiterId: w.recruiter_id || "",
      createdAt: w.created_at || "",
      updatedAt: w.updated_at || ""
    });
  }

  return { success: true, data: result };
}

function getWorkerDetail_(dataSs, workerId) {
  var sheet = dataSs.getSheetByName("04_WORKERS_MASTER");
  if (!sheet || sheet.getLastRow() <= 1) {
    return { success: false, error: { code: "NOT_FOUND", message: "Hồ sơ không tồn tại" } };
  }

  var workers = readTable_(sheet);
  for (var i = 0; i < workers.length; i++) {
    var w = workers[i];
    if (w.worker_id === workerId) {
      var status = cleanText_(w.current_status || w.status || "NEW").toUpperCase();
      var isVww = w.is_vww === true || String(w.is_vww).toUpperCase() === "TRUE";

      return {
        success: true,
        data: {
          workerId: w.worker_id,
          fullName: w.full_name,
          phone: w.phone || w.normalized_phone || "",
          idCard: w.cccd || "",
          birthYear: w.date_of_birth || w.birth_year || "",
          gender: w.gender || "",
          hometown: w.province || w.hometown || "",
          status: status,
          isVerifiedWorking: isVww,
          isVww: isVww,
          activePartnerId: w.active_partner_id || "",
          officeId: w.office_id || "",
          recruiterId: w.recruiter_id || "",
          createdAt: w.created_at || "",
          updatedAt: w.updated_at || ""
        }
      };
    }
  }
  return { success: false, error: { code: "NOT_FOUND", message: "Không tìm thấy hồ sơ " + workerId } };
}

function createWorker_(dataSs, payload, tenantContext) {
  payload = payload || {};
  var sheet = dataSs.getSheetByName("04_WORKERS_MASTER");
  if (!sheet) {
    return { success: false, error: { code: "SHEET_NOT_FOUND", message: "Bảng 04_WORKERS_MASTER không tồn tại" } };
  }

  var existingWorkers = readTable_(sheet);

  // 1. DUPLICATE CHECK: Prevent duplicates or warn operator
  var duplicate = findDuplicateWorker_(existingWorkers, payload);
  var isForced = payload.forceCreate === true || payload.overrideDuplicate === true;

  if (duplicate && !isForced) {
    return {
      success: false,
      error: {
        code: "DUPLICATE_WORKER",
        message: "Phát hiện trùng lặp: " + duplicate.message,
        details: {
          workerId: duplicate.worker.worker_id,
          fullName: duplicate.worker.full_name,
          phone: duplicate.worker.phone || duplicate.worker.normalized_phone,
          cccd: duplicate.worker.cccd || "",
          province: duplicate.worker.province || "",
          currentStatus: duplicate.worker.current_status || duplicate.worker.status || "NEW",
          matchReason: duplicate.matchReason
        }
      }
    };
  }

  // 2. GENERATE UNIQUE WORKER ID (find maximum existing index to prevent collision)
  var maxIndex = 0;
  existingWorkers.forEach(function(w) {
    var rawDigits = String(w.worker_id || "").replace(/\D/g, "");
    if (rawDigits) {
      var num = parseInt(rawDigits, 10);
      if (!isNaN(num) && num > maxIndex) maxIndex = num;
    }
  });
  var nextIndex = maxIndex + 1;
  var padIndex = ("000000" + nextIndex).slice(-6);
  var workerId = "WK-" + padIndex;
  var nowIso = new Date().toISOString();

  var normalizedPhone = normalizePhone_(payload.phone);
  var normalizedCccd = normalizeCccd_(payload.cccd || payload.idCard);
  var initialStatus = duplicate ? "DUPLICATE" : "NEW";

  var workerRecord = {
    worker_id: workerId,
    full_name: payload.fullName || "Lao động mới",
    normalized_name: normalizeName_(payload.fullName || "Lao động mới"),
    phone: payload.phone || "",
    normalized_phone: normalizedPhone,
    cccd: normalizedCccd,
    date_of_birth: payload.dateOfBirth || payload.birthYear || "",
    gender: payload.gender || "Nam",
    province: payload.province || payload.hometown || "Bắc Ninh",
    district: payload.district || "",
    address: payload.address || "",
    source: payload.source || "WEB_APP",
    source_detail: payload.sourceDetail || "",
    office_id: payload.officeId || "OFF-01",
    recruiter_id: payload.recruiterId || (tenantContext && tenantContext.staffId) || "STF-001",
    current_need: payload.currentNeed || "",
    preferred_job: payload.preferredJob || "",
    current_status: initialStatus,
    status: initialStatus,
    is_vww: false,
    created_at: nowIso,
    created_by: (tenantContext && tenantContext.email) || "APP",
    updated_at: nowIso,
    updated_by: (tenantContext && tenantContext.email) || "APP",
    is_active: true
  };

  appendRecord_(sheet, workerRecord);

  // If force-created despite duplicate, push item to Action Queue
  if (duplicate) {
    createDuplicateActionItem_(dataSs, workerId, duplicate);
  }

  // Record Pipeline Event
  var eventsSheet = dataSs.getSheetByName("05_PIPELINE_EVENTS");
  if (eventsSheet) {
    var eventRecord = {
      event_id: "EVT-" + Date.now(),
      worker_id: workerId,
      event_type: duplicate ? "DUPLICATE_FLAGGED" : "CREATED",
      stage_from: "",
      stage_to: initialStatus,
      partner_id: "",
      job_id: "",
      created_at: nowIso,
      created_by: (tenantContext && tenantContext.email) || "APP",
      notes: duplicate
        ? ("Tạo cưỡng bức sau cảnh báo trùng với hồ sơ " + duplicate.worker.worker_id)
        : "Tiếp nhận hồ sơ mới vào hệ thống"
    };
    appendRecord_(eventsSheet, eventRecord);
  }

  return {
    success: true,
    data: {
      workerId: workerId,
      fullName: workerRecord.full_name,
      phone: workerRecord.phone,
      status: initialStatus,
      isVerifiedWorking: false,
      isDuplicate: Boolean(duplicate),
      createdAt: nowIso
    }
  };
}

function updateWorker_(dataSs, payload, tenantContext) {
  var sheet = dataSs.getSheetByName("04_WORKERS_MASTER");
  if (!sheet) return { success: false, error: { code: "SHEET_NOT_FOUND", message: "Bảng không tồn tại" } };

  var updates = {
    updated_at: new Date().toISOString(),
    updated_by: (tenantContext && tenantContext.email) || "APP"
  };

  if (payload.fullName) {
    updates.full_name = payload.fullName;
    updates.normalized_name = normalizeName_(payload.fullName);
  }
  if (payload.phone) {
    updates.phone = payload.phone;
    updates.normalized_phone = normalizePhone_(payload.phone);
  }
  if (payload.idCard || payload.cccd) {
    updates.cccd = normalizeCccd_(payload.idCard || payload.cccd);
  }
  if (payload.status) {
    updates.current_status = payload.status;
    updates.status = payload.status;
  }
  if (payload.isVerifiedWorking !== undefined) {
    updates.is_vww = Boolean(payload.isVerifiedWorking);
  }

  var updated = updateRecordByKey_(sheet, "worker_id", payload.workerId, updates);
  if (updated) {
    return { success: true, data: { workerId: payload.workerId, updated: true } };
  }
  return { success: false, error: { code: "NOT_FOUND", message: "Hồ sơ không tồn tại" } };
}

function updateWorkerStatusInMaster_(dataSs, workerId, newStatus) {
  var sheet = dataSs.getSheetByName("04_WORKERS_MASTER");
  if (!sheet) return;
  updateRecordByKey_(sheet, "worker_id", workerId, {
    current_status: newStatus,
    status: newStatus,
    updated_at: new Date().toISOString()
  });
}

function setWorkerVwwInMaster_(dataSs, workerId, isVww) {
  var sheet = dataSs.getSheetByName("04_WORKERS_MASTER");
  if (!sheet) return;
  updateRecordByKey_(sheet, "worker_id", workerId, {
    is_vww: Boolean(isVww),
    updated_at: new Date().toISOString()
  });
}

function workerMerge_(dataSs, payload, tenantContext) {
  var primaryId = payload.primaryWorkerId;
  var secondaryId = payload.secondaryWorkerId;
  var sheet = dataSs.getSheetByName("04_WORKERS_MASTER");
  if (!sheet) return { success: false, error: { code: "SHEET_NOT_FOUND", message: "Bảng không tồn tại" } };

  var nowIso = new Date().toISOString();

  // Mark secondary worker as MERGED
  var updated = updateRecordByKey_(sheet, "worker_id", secondaryId, {
    current_status: "MERGED",
    status: "MERGED",
    updated_at: nowIso,
    updated_by: (tenantContext && tenantContext.email) || "APP",
    notes: "Đã hợp nhất vào hồ sơ gốc: " + primaryId
  });

  // Record Pipeline Event
  var eventsSheet = dataSs.getSheetByName("05_PIPELINE_EVENTS");
  if (eventsSheet) {
    appendRecord_(eventsSheet, {
      event_id: "EVT-" + Date.now(),
      worker_id: secondaryId,
      event_type: "MERGED",
      stage_from: "",
      stage_to: "MERGED",
      partner_id: "",
      job_id: "",
      created_at: nowIso,
      created_by: (tenantContext && tenantContext.email) || "APP",
      notes: "Hợp nhất hồ sơ " + secondaryId + " vào " + primaryId
    });
  }

  // Dismiss / resolve duplicate action item
  var suspectId = "DUP-" + primaryId + "-" + secondaryId;
  dismissDuplicatePair_(suspectId);

  return {
    success: true,
    data: {
      primaryWorkerId: primaryId,
      mergedWorkerId: secondaryId,
      status: "MERGED",
      message: "Đã hợp nhất thành công hồ sơ " + secondaryId + " vào " + primaryId
    }
  };
}
