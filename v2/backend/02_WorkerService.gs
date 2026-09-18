/**
 * ==============================================================================
 * FCS AI WORKFORCE OS V2 — MODULE 1: WORKER SERVICE
 * Chức năng: Quản lý hồ sơ gốc lao động 34 cột VNeID
 * Cơ chế: Atomic Sequential Lock chống va chạm ID, tra cứu O(1) CCCD / Phone
 * Tính năng: Create, Get (Worker 360 View), Update (Audit Trail), Soft Delete,
 *           Pagination, Search & Filter
 * ==============================================================================
 */

function setupMasterWorkersSheet_(ss) {
  var sheet = getOrCreateSheet_(ss, V2_CONFIG.TAB_WORKERS);
  if (sheet.getLastRow() === 0) {
    var headers = [
      "worker_id", "dept", "full_name", "gender", "date_of_birth", "cccd",
      "issuing_date", "graduated_school", "major", "graduation_year",
      "hometown", "nation", "birth_place", "vneid_address", "permanent_residence",
      "social_insurance_no", "marital_status", "relative_name", "relative_phone",
      "phone", "vietcombank_account", "staff_code", "sourcing_recruiter", "consultant_sale",
      "branch", "target_company", "work_type", "interview_date", "start_working_date",
      "interview_status", "working_status", "resignation_date", "referral_source", "created_at"
    ];
    sheet.appendRow(headers);
    formatHeaderRow_(sheet, headers.length, "#047857"); // Emerald
  }
}

/**
 * Tiếp nhận & tạo mới hồ sơ Master Worker với Atomic Mutex Lock & Validation 2 tầng
 */
function handleCreateWorkerV2_(payload, ss) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000); // Chờ khóa tối đa 30 giây
  } catch (e) {
    return { success: false, error: "Hệ thống đang bận ghi dữ liệu, vui lòng thử lại sau giây lát." };
  }

  try {
    var sheet = ss.getSheetByName(V2_CONFIG.TAB_WORKERS);
    if (!sheet) {
      return { success: false, error: "Không tìm thấy sheet " + V2_CONFIG.TAB_WORKERS };
    }

    // 1. Validation 2 tầng nâng cao
    var val = validateWorkerPayloadOrReject_(payload);
    if (!val.isValid) {
      return { success: false, error: val.error };
    }

    var norm = val.normalizedData;
    var fullName = norm.full_name;
    var phone = norm.phone;
    var cccd = norm.cccd;

    // 2. Kiểm tra trùng lặp trên Master Workers
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var phoneIdx = headers.indexOf("phone");
    var cccdIdx = headers.indexOf("cccd");
    var idIdx = headers.indexOf("worker_id");

    var maxIdNum = 0;
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var rowId = (row[idIdx] || "").toString().trim();
      var m = rowId.match(/WK-(\d+)/);
      if (m) {
        var num = parseInt(m[1], 10);
        if (num > maxIdNum) maxIdNum = num;
      }

      // Kiểm tra trùng Phone hoặc CCCD
      var rowPhone = normalizePhoneV2_(row[phoneIdx]);
      var rowCccd = normalizeCccdV2_(row[cccdIdx]);
      if ((rowPhone && rowPhone === phone) || (cccd && rowCccd && rowCccd === cccd)) {
        var existingWorker = {
          worker_id: rowId,
          full_name: row[headers.indexOf("full_name")],
          phone: rowPhone
        };
        return {
          success: true,
          isExisting: true,
          data: existingWorker,
          worker_id: rowId,
          full_name: row[headers.indexOf("full_name")],
          phone: rowPhone,
          message: "Lao động đã có hồ sơ trong hệ thống."
        };
      }
    }

    // 3. Cấp phát Worker ID tuần tự mới
    var newIdNum = maxIdNum + 1;
    var newWorkerId = V2_CONFIG.PREFIX_WORKER + ("000000" + newIdNum).slice(-6);
    var nowIso = new Date().toISOString();

    // 4. Tạo dòng mới 34 cột
    var newRow = [
      newWorkerId,
      payload.dept || "",
      fullName,
      norm.gender || "Nam",
      norm.date_of_birth || "",
      cccd ? "'" + cccd : "",
      payload.issuing_date || "",
      payload.graduated_school || "",
      payload.major || "",
      payload.graduation_year || "",
      payload.hometown || "",
      payload.nation || "Kinh",
      payload.birth_place || "",
      payload.vneid_address || "",
      payload.permanent_residence || "",
      payload.social_insurance_no || "",
      payload.marital_status || "Chưa kết hôn",
      payload.relative_name || "",
      payload.relative_phone ? "'" + normalizePhoneV2_(payload.relative_phone) : "",
      "'" + phone,
      payload.vietcombank_account ? "'" + payload.vietcombank_account : "",
      payload.staff_code || "",
      payload.sourcing_recruiter || "",
      payload.consultant_sale || "",
      payload.branch || "HÀ NAM",
      payload.target_company || "WNC",
      payload.work_type || "Chính thức",
      payload.interview_date || "",
      payload.start_working_date || "",
      payload.interview_status || "Chưa phỏng vấn",
      payload.working_status || "Chưa đi làm",
      payload.resignation_date || "",
      payload.referral_source || "",
      nowIso
    ];

    sheet.appendRow(newRow);

    // Ghi log kiểm toán chuẩn
    logAuditActionV2_(ss, {
      actor_email: payload.actor_email || V2_CONFIG.SUPER_ADMIN_EMAIL,
      actor_role: payload.actor_role || "RECRUITER",
      sheet_name: V2_CONFIG.TAB_WORKERS,
      record_id: newWorkerId,
      action: "CREATE",
      field_name: "ALL",
      old_value: "",
      new_value: fullName,
      reason_notes: "Tạo mới hồ sơ Master Worker 34 trường VNeID"
    });

    // Bump version để tự động invalidate cache
    CacheHelper_.bumpDataVersion(payload.tenantId || payload.requestedTenantId);

    var createdWorker = {
      worker_id: newWorkerId,
      full_name: fullName,
      phone: phone
    };
    return {
      success: true,
      isExisting: false,
      data: createdWorker,
      worker_id: newWorkerId,
      full_name: fullName,
      phone: phone,
      warnings: val.warnings,
      message: "Tạo hồ sơ lao động mới thành công."
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Worker 360 Degree View: Lấy thông tin chi tiết hồ sơ gốc + Toàn bộ lịch sử Deals
 */
function handleGetWorkerV2_(params, ss) {
  var id = (params && (params.worker_id || params.id || "")).toString().trim();
  var phone = normalizePhoneV2_(params && params.phone);
  var cccd = normalizeCccdV2_(params && params.cccd);

  if (!id && !phone && !cccd) {
    return { success: false, error: "Vui lòng cung cấp worker_id, phone hoặc cccd." };
  }

  var workerSheet = ss.getSheetByName(V2_CONFIG.TAB_WORKERS);
  if (!workerSheet) return { success: false, error: "Không tìm thấy sheet " + V2_CONFIG.TAB_WORKERS };

  var data = workerSheet.getDataRange().getValues();
  if (data.length <= 1) return { success: false, error: "Hồ sơ không tồn tại." };

  var headers = data[0];
  var idIdx = headers.indexOf("worker_id");
  var phoneIdx = headers.indexOf("phone");
  var cccdIdx = headers.indexOf("cccd");

  var workerObj = null;
  var matchedWorkerId = "";

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var rId = (row[idIdx] || "").toString().trim();
    var rPhone = normalizePhoneV2_(row[phoneIdx]);
    var rCccd = normalizeCccdV2_(row[cccdIdx]);

    if ((id && rId.toLowerCase() === id.toLowerCase()) ||
        (phone && rPhone === phone) ||
        (cccd && rCccd === cccd)) {
      matchedWorkerId = rId;
      workerObj = {};
      for (var j = 0; j < headers.length; j++) {
        workerObj[headers[j]] = row[j];
      }
      break;
    }
  }

  if (!workerObj) {
    return { success: false, error: "Không tìm thấy hồ sơ người lao động." };
  }

  // Lấy toàn bộ lịch sử Deals của Worker từ TAB_DEALS
  var dealSheet = ss.getSheetByName(V2_CONFIG.TAB_DEALS);
  var deals = [];
  if (dealSheet) {
    var dealData = dealSheet.getDataRange().getValues();
    if (dealData.length > 1) {
      var dealHeaders = dealData[0];
      var dWorkerIdx = dealHeaders.indexOf("worker_id");
      for (var k = 1; k < dealData.length; k++) {
        if ((dealData[k][dWorkerIdx] || "").toString().trim() === matchedWorkerId) {
          var dObj = {};
          for (var col = 0; col < dealHeaders.length; col++) {
            dObj[dealHeaders[col]] = dealData[k][col];
          }
          deals.push(dObj);
        }
      }
    }
  }

  // Lấy toàn bộ Pipeline Events của Worker từ 05_PIPELINE_EVENTS
  var eventSheet = ss.getSheetByName(V2_CONFIG.TAB_PIPELINE_EVENTS || "05_PIPELINE_EVENTS");
  var pipelineEvents = [];
  if (eventSheet && eventSheet.getLastRow() > 1) {
    var evData = eventSheet.getDataRange().getValues();
    var evHeaders = evData[0];
    var evWorkerIdx = evHeaders.indexOf("worker_id");
    var evIdIdx = evHeaders.indexOf("event_id");
    var evFromIdx = evHeaders.indexOf("stage_from");
    var evToIdx = evHeaders.indexOf("stage_to");
    var evTypeIdx = evHeaders.indexOf("event_type");
    var evNotesIdx = evHeaders.indexOf("notes");
    var evCreatedIdx = evHeaders.indexOf("created_at");

    for (var e = 1; e < evData.length; e++) {
      if ((evData[e][evWorkerIdx] || "").toString().trim() === matchedWorkerId) {
        var toSt = evToIdx !== -1 ? (evData[e][evToIdx] || "") : "";
        var fromSt = evFromIdx !== -1 ? (evData[e][evFromIdx] || "") : "";
        var evType = evTypeIdx !== -1 ? (evData[e][evTypeIdx] || "STAGE_TRANSITION") : "STAGE_TRANSITION";
        pipelineEvents.push({
          id: evIdIdx !== -1 ? evData[e][evIdIdx] : ("EV-" + e),
          workerId: matchedWorkerId,
          stageFrom: fromSt,
          stageTo: toSt,
          title: toSt ? ("Chuyển trạng thái: " + toSt) : evType,
          eventType: (toSt === "L3" || toSt === "L3.2") ? "VERIFIED_WORKING" :
                    toSt === "L2.1" ? "PASSED" :
                    toSt === "L3.1" ? "QUIT" :
                    toSt.startsWith("L2") ? "INTERVIEW_SCHEDULED" : "REGISTERED",
          timestamp: evCreatedIdx !== -1 ? evData[e][evCreatedIdx] : "",
          note: evNotesIdx !== -1 ? evData[e][evNotesIdx] : ""
        });
      }
    }
  }

  // Nếu chưa có event nào từ 05_PIPELINE_EVENTS, tạo ít nhất 1 event khởi tạo hồ sơ
  if (pipelineEvents.length === 0 && (workerObj.created_at || workerObj.interview_date || workerObj.start_working_date)) {
    pipelineEvents.push({
      id: "EV-INIT",
      workerId: matchedWorkerId,
      stageFrom: "",
      stageTo: "C3",
      title: "Tiếp nhận hồ sơ tuyển dụng",
      eventType: "REGISTERED",
      timestamp: workerObj.created_at || new Date().toISOString(),
      note: "Hồ sơ được tạo và lưu vào hệ thống Master Workers."
    });
  }

  // Enrich Worker Object with both CamelCase and SnakeCase properties
  var enrichedWorker = Object.assign({}, workerObj, {
    workerId: workerObj.worker_id,
    fullName: workerObj.full_name,
    dateOfBirth: workerObj.date_of_birth,
    department: workerObj.dept,
    ethnicity: workerObj.nation,
    hometown: workerObj.hometown,
    partnerName: workerObj.target_company,
    status: workerObj.working_status || "NEW",
    isVww: workerObj.is_verified_working === true || workerObj.working_status === "Đang đi làm",
    pipelineEvents: pipelineEvents,
    deals: deals,
    deals_history: deals,
    total_deals: deals.length
  });

  return {
    success: true,
    data: enrichedWorker,
    worker: enrichedWorker,
    deals_history: deals,
    deals: deals,
    pipelineEvents: pipelineEvents,
    total_deals: deals.length
  };
}

/**
 * Cập nhật hồ sơ Worker kèm Audit Trail chi tiết từng trường
 */
function handleUpdateWorkerV2_(payload, ss) {
  var workerId = (payload.worker_id || "").toString().trim();
  if (!workerId) {
    return { success: false, error: "Bắt buộc phải có worker_id để cập nhật." };
  }

  var sheet = ss.getSheetByName(V2_CONFIG.TAB_WORKERS);
  if (!sheet) return { success: false, error: "Sheet not found" };

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idIdx = headers.indexOf("worker_id");

  var rowIndex = -1;
  var currentRow = null;
  for (var i = 1; i < data.length; i++) {
    if ((data[i][idIdx] || "").toString().trim() === workerId) {
      rowIndex = i + 1;
      currentRow = data[i];
      break;
    }
  }

  if (rowIndex === -1) {
    return { success: false, error: "Không tìm thấy Worker " + workerId };
  }

  var updatedFields = [];
  var editableFields = [
    "dept", "full_name", "gender", "date_of_birth", "cccd", "issuing_date",
    "graduated_school", "major", "graduation_year", "hometown", "nation",
    "birth_place", "vneid_address", "permanent_residence", "social_insurance_no",
    "marital_status", "relative_name", "relative_phone", "phone",
    "vietcombank_account", "staff_code", "sourcing_recruiter", "consultant_sale",
    "branch", "target_company", "work_type", "interview_date", "start_working_date",
    "interview_status", "working_status", "resignation_date", "referral_source"
  ];

  for (var f = 0; f < editableFields.length; f++) {
    var field = editableFields[f];
    if (payload[field] !== undefined) {
      var colIdx = headers.indexOf(field);
      if (colIdx !== -1) {
        var oldVal = (currentRow[colIdx] !== undefined && currentRow[colIdx] !== null) ? currentRow[colIdx].toString() : "";
        var newVal = payload[field].toString().trim();

        // Chuẩn hóa định dạng nếu là Phone / CCCD / STK
        if (field === "phone" || field === "relative_phone") {
          newVal = normalizePhoneV2_(newVal);
          if (newVal) sheet.getRange(rowIndex, colIdx + 1).setValue("'" + newVal);
        } else if (field === "cccd" || field === "vietcombank_account") {
          newVal = newVal.replace(/\D/g, "");
          if (newVal) sheet.getRange(rowIndex, colIdx + 1).setValue("'" + newVal);
        } else {
          sheet.getRange(rowIndex, colIdx + 1).setValue(newVal);
        }

        if (oldVal !== newVal) {
          updatedFields.push({ field: field, oldVal: oldVal, newVal: newVal });
          // Ghi nhật ký kiểm toán cho từng trường nhạy cảm
          logAuditActionV2_(ss, {
            actor_email: payload.actor_email || V2_CONFIG.SUPER_ADMIN_EMAIL,
            actor_role: payload.actor_role || "MANAGER",
            sheet_name: V2_CONFIG.TAB_WORKERS,
            record_id: workerId,
            action: "UPDATE",
            field_name: field,
            old_value: oldVal,
            new_value: newVal,
            reason_notes: payload.reason_notes || "Cập nhật thông tin lao động"
          });
        }
      }
    }
  }

  CacheHelper_.bumpDataVersion(payload.tenantId || payload.requestedTenantId);

  return {
    success: true,
    worker_id: workerId,
    updated_fields_count: updatedFields.length,
    updated_fields: updatedFields,
    message: "Cập nhật hồ sơ lao động thành công."
  };
}

/**
 * Xóa mềm (Soft Delete) hồ sơ lao động theo quy chuẩn Handoff 2.4
 */
function handleSoftDeleteWorkerV2_(payload, ss) {
  var workerId = (payload.worker_id || "").toString().trim();
  var reason = (payload.delete_reason || payload.reason || "").toString().trim();

  if (!workerId) return { success: false, error: "Thiếu worker_id cần xóa mềm." };
  if (!reason) return { success: false, error: "Bắt buộc phải cung cấp lý do xóa mềm (delete_reason)." };

  var sheet = ss.getSheetByName(V2_CONFIG.TAB_WORKERS);
  if (!sheet) return { success: false, error: "Sheet not found" };

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idIdx = headers.indexOf("worker_id");
  var statusIdx = headers.indexOf("working_status");
  var notesIdx = headers.indexOf("referral_source");

  var rowIndex = -1;
  var oldStatus = "";
  for (var i = 1; i < data.length; i++) {
    if ((data[i][idIdx] || "").toString().trim() === workerId) {
      rowIndex = i + 1;
      oldStatus = data[i][statusIdx];
      break;
    }
  }

  if (rowIndex === -1) return { success: false, error: "Không tìm thấy Worker " + workerId };

  var deleteNote = "[DELETED: " + new Date().toISOString() + " by " + (payload.actor_email || V2_CONFIG.SUPER_ADMIN_EMAIL) + "] Lý do: " + reason;
  sheet.getRange(rowIndex, statusIdx + 1).setValue("ĐÃ XÓA (DELETED)");
  if (notesIdx !== -1) {
    sheet.getRange(rowIndex, notesIdx + 1).setValue(deleteNote);
  }

  logAuditActionV2_(ss, {
    actor_email: payload.actor_email || V2_CONFIG.SUPER_ADMIN_EMAIL,
    actor_role: payload.actor_role || "ADMIN",
    sheet_name: V2_CONFIG.TAB_WORKERS,
    record_id: workerId,
    action: "SOFT_DELETE",
    field_name: "working_status",
    old_value: oldStatus,
    new_value: "ĐÃ XÓA (DELETED)",
    reason_notes: reason
  });

  CacheHelper_.bumpDataVersion(payload.tenantId || payload.requestedTenantId);

  return {
    success: true,
    worker_id: workerId,
    status: "ĐÃ XÓA (DELETED)",
    message: "Đã xóa mềm hồ sơ lao động an toàn."
  };
}

/**
 * Danh sách Worker có phân trang, tìm kiếm & bộ lọc đa điều kiện
 */
function handleListWorkersV2_(params, ss) {
  var sheet = ss.getSheetByName(V2_CONFIG.TAB_WORKERS);
  if (!sheet) return { success: false, error: "Sheet not found" };
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, total: 0, items: [] };

  var headers = data[0];
  var limit = parseInt((params && params.limit) || "50", 10);
  var offset = parseInt((params && params.offset) || "0", 10);
  var search = ((params && params.search) || "").toString().trim().toLowerCase();
  var filterBranch = ((params && params.branch) || "").toString().trim().toUpperCase();
  var filterCompany = ((params && params.company) || "").toString().trim().toUpperCase();
  var filterStatus = ((params && params.status) || "").toString().trim().toLowerCase();
  var includeDeleted = (params && (params.include_deleted === "true" || params.include_deleted === true));

  var nameIdx = headers.indexOf("full_name");
  var phoneIdx = headers.indexOf("phone");
  var cccdIdx = headers.indexOf("cccd");
  var idIdx = headers.indexOf("worker_id");
  var branchIdx = headers.indexOf("branch");
  var compIdx = headers.indexOf("target_company");
  var statusIdx = headers.indexOf("working_status");

  var filtered = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var statusVal = (row[statusIdx] || "").toString();

    // Ẩn các hồ sơ bị xóa mềm nếu không yêu cầu
    if (!includeDeleted && statusVal.indexOf("DELETED") !== -1) {
      continue;
    }

    // Bộ lọc chi nhánh
    if (filterBranch && (row[branchIdx] || "").toString().toUpperCase().indexOf(filterBranch) === -1) {
      continue;
    }

    // Bộ lọc công ty
    if (filterCompany && (row[compIdx] || "").toString().toUpperCase().indexOf(filterCompany) === -1) {
      continue;
    }

    // Bộ lọc trạng thái làm việc
    if (filterStatus && statusVal.toLowerCase().indexOf(filterStatus) === -1) {
      continue;
    }

    // Tìm kiếm từ khóa (Tên, SĐT, CCCD, Worker ID)
    if (search) {
      var rowStr = (row[nameIdx] + " " + row[phoneIdx] + " " + row[cccdIdx] + " " + row[idIdx]).toLowerCase();
      if (rowStr.indexOf(search) === -1) {
        continue;
      }
    }

    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    filtered.push(obj);
  }

  var paginated = filtered.slice(offset, offset + limit);

  return {
    success: true,
    data: paginated,
    total: filtered.length,
    offset: offset,
    limit: limit,
    count: paginated.length,
    items: paginated
  };
}

function normalizePhoneV2_(phone) {
  if (!phone) return "";
  var s = phone.toString().replace(/\D/g, "");
  if (s.startsWith("84")) s = "0" + s.slice(2);
  return s;
}

function normalizeCccdV2_(cccd) {
  if (!cccd) return "";
  return cccd.toString().replace(/\D/g, "");
}
