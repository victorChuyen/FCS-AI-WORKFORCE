/**
 * ==============================================================================
 * FCS AI WORKFORCE OS — DUPLICATE DETECTION SERVICE
 * Part of V4 Multi-Tenant SaaS Platform Engine
 * ==============================================================================
 */

function normalizeName_(value) {
  return cleanText_(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

function normalizePhone_(value) {
  var phone = cleanText_(value).replace(/\D/g, '');
  if (phone.startsWith('84') && phone.length >= 11) {
    phone = '0' + phone.slice(2);
  }
  if (phone.length === 9) {
    phone = '0' + phone;
  }
  return phone;
}

function normalizeCccd_(value) {
  return cleanText_(value).replace(/\D/g, '');
}

/**
 * Checks if a candidate worker matches an existing worker in the list.
 */
function findDuplicateWorker_(existingWorkers, candidate) {
  var candPhone = normalizePhone_(candidate.phone);
  var candCccd = normalizeCccd_(candidate.cccd || candidate.idCard || candidate.id_card);
  var candName = normalizeName_(candidate.fullName || candidate.full_name);
  var candDob = cleanText_(candidate.dateOfBirth || candidate.date_of_birth || candidate.birthYear || candidate.birth_year);
  var candId = cleanText_(candidate.workerId || candidate.worker_id);

  for (var i = 0; i < existingWorkers.length; i++) {
    var w = existingWorkers[i];
    var exId = cleanText_(w.worker_id || w.workerid);
    if (candId && exId && candId === exId) continue;

    var status = cleanText_(w.current_status || w.status).toUpperCase();
    if (status === 'MERGED' || status === 'DELETED') continue;

    var exPhone = normalizePhone_(w.phone || w.normalized_phone);
    var exCccd = normalizeCccd_(w.cccd || w.id_card || w.idcard);
    var exName = normalizeName_(w.full_name || w.fullname);
    var exDob = cleanText_(w.date_of_birth || w.birth_year);

    // 1. Match by CCCD (if provided on both)
    if (candCccd && exCccd && candCccd === exCccd) {
      return {
        worker: w,
        matchReason: 'CCCD',
        matchValue: candCccd,
        message: 'Trùng số CCCD/CMND: ' + candCccd
      };
    }

    // 2. Match by Phone (if provided on both)
    if (candPhone && exPhone && candPhone === exPhone) {
      return {
        worker: w,
        matchReason: 'PHONE',
        matchValue: candPhone,
        message: 'Trùng số điện thoại: ' + candPhone
      };
    }

    // 3. Match by Name + Date of birth
    if (candName && exName && candName === exName && candDob && exDob && candDob === exDob) {
      return {
        worker: w,
        matchReason: 'NAME_DOB',
        matchValue: candName + ' (' + candDob + ')',
        message: 'Trùng Họ tên & Năm sinh: ' + candName + ' - ' + candDob
      };
    }
  }

  return null;
}

/**
 * Scans the entire 04_WORKERS_MASTER sheet and returns all duplicate pairs
 * in the exact DuplicateSuspect format expected by DuplicateReviewTab.tsx.
 */
function getDuplicateSuspectsList_(dataSs) {
  var sheet = dataSs.getSheetByName("04_WORKERS_MASTER");
  if (!sheet || sheet.getLastRow() <= 1) return [];

  var workers = readTable_(sheet);
  var duplicates = [];
  var seenPairs = {};

  var props = PropertiesService.getScriptProperties();
  var dismissedJson = props.getProperty("DISMISSED_DUPLICATE_PAIRS") || "[]";
  var dismissedPairs = {};
  try {
    var arr = JSON.parse(dismissedJson);
    arr.forEach(function(k) { dismissedPairs[k] = true; });
  } catch (e) {}

  for (var i = 0; i < workers.length; i++) {
    for (var j = i + 1; j < workers.length; j++) {
      var wA = workers[i];
      var wB = workers[j];

      var stA = cleanText_(wA.current_status || wA.status).toUpperCase();
      var stB = cleanText_(wB.current_status || wB.status).toUpperCase();
      if (stA === 'MERGED' || stB === 'MERGED' || stA === 'DELETED' || stB === 'DELETED') continue;

      var idA = cleanText_(wA.worker_id || "WK-A" + i);
      var idB = cleanText_(wB.worker_id || "WK-B" + j);
      var pairKey = [idA, idB].sort().join("::");
      if (dismissedPairs[pairKey]) continue;

      var phoneA = normalizePhone_(wA.phone || wA.normalized_phone);
      var phoneB = normalizePhone_(wB.phone || wB.normalized_phone);
      var cccdA = normalizeCccd_(wA.cccd || wA.id_card);
      var cccdB = normalizeCccd_(wB.cccd || wB.id_card);
      var nameA = normalizeName_(wA.full_name);
      var nameB = normalizeName_(wB.full_name);
      var dobA = cleanText_(wA.date_of_birth || wA.birth_year);
      var dobB = cleanText_(wB.date_of_birth || wB.birth_year);

      var isDup = false;
      var reason = "";

      if (phoneA && phoneB && phoneA === phoneB) {
        isDup = true;
        reason = "Trùng số điện thoại (" + phoneA + ")";
      } else if (cccdA && cccdB && cccdA === cccdB) {
        isDup = true;
        reason = "Trùng số CCCD (" + cccdA + ")";
      } else if (nameA && nameB && nameA === nameB && (dobA === dobB || (!dobA && !dobB))) {
        isDup = true;
        reason = "Trùng Họ tên (" + nameA + (dobA ? " - " + dobA : "") + ")";
      } else if (idA && idB && idA === idB) {
        isDup = true;
        reason = "Trùng Mã định danh worker_id (" + idA + ")";
      }

      if (isDup && !seenPairs[pairKey]) {
        seenPairs[pairKey] = true;
        var suspectId = "DUP-" + idA + "-" + idB;
        duplicates.push({
          id: suspectId,
          workerA: {
            workerId: idA,
            fullName: cleanText_(wA.full_name) || idA,
            phone: cleanText_(wA.phone) || phoneA,
            cccd: cleanText_(wA.cccd) || cccdA,
            province: cleanText_(wA.province || wA.hometown) || "Bắc Ninh",
            recruiterName: cleanText_(wA.recruiter_id) || "Tuyển dụng"
          },
          workerB: {
            workerId: idB,
            fullName: cleanText_(wB.full_name) || idB,
            phone: cleanText_(wB.phone) || phoneB,
            cccd: cleanText_(wB.cccd) || cccdB,
            province: cleanText_(wB.province || wB.hometown) || "Bắc Ninh",
            recruiterName: cleanText_(wB.recruiter_id) || "Tuyển dụng"
          },
          reason: reason,
          detectedAt: cleanText_(wB.created_at) || new Date().toISOString()
        });
      }
    }
  }

  return duplicates;
}

/**
 * Creates an Action Queue item when a duplicate is force-created.
 */
function createDuplicateActionItem_(dataSs, workerId, duplicate) {
  var sheet = dataSs.getSheetByName("18_ACTION_QUEUE") || dataSs.getSheetByName("11_ACTION_QUEUE");
  if (!sheet) return;

  var nowIso = new Date().toISOString();
  var tomorrowIso = new Date(Date.now() + 86400000).toISOString();

  var record = {
    action_id: "ACT-" + Date.now(),
    priority: "P1",
    category: "DUPLICATE",
    worker_id: workerId,
    title: "Nghi vấn trùng hồ sơ: " + (duplicate.worker.full_name || workerId),
    reason: duplicate.message || ("Trùng " + duplicate.matchReason + " với " + duplicate.worker.worker_id),
    due_date: tomorrowIso,
    status: "OPEN",
    created_at: nowIso,
    resolved_at: ""
  };

  appendRecord_(sheet, record);
}

/**
 * Dismisses a duplicate pair so it won't be flagged repeatedly.
 */
function dismissDuplicatePair_(suspectId) {
  var parts = String(suspectId || "").replace(/^DUP-/, "").split("-");
  if (parts.length >= 2) {
    var pairKey = [parts[0], parts[1]].sort().join("::");
    var props = PropertiesService.getScriptProperties();
    var list = [];
    try {
      list = JSON.parse(props.getProperty("DISMISSED_DUPLICATE_PAIRS") || "[]");
    } catch (e) {}
    if (list.indexOf(pairKey) === -1) {
      list.push(pairKey);
      props.setProperty("DISMISSED_DUPLICATE_PAIRS", JSON.stringify(list));
    }
  }
}
