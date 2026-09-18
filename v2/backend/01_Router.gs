/**
 * ==============================================================================
 * FCS AI WORKFORCE OS V2 — ROUTER & API GATEWAY
 * Chức năng: Điều phối API RESTful cho Web App V2, Kanban & Webhooks
 * ==============================================================================
 */

function doGet(e) {
  return handleRequestV2_(e, "GET");
}

function doPost(e) {
  return handleRequestV2_(e, "POST");
}

function handleRequestV2_(e, method) {
  try {
    var ss = getSpreadsheetV2_();
    var params = (e && e.parameter) || {};
    var payload = {};

    if (method === "POST" && e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (err) {
        payload = {};
      }
    }
    var action = params.action || (payload && payload.action) || "";
    var mergedParams = {};
    if (params) {
      for (var k in params) mergedParams[k] = params[k];
    }
    if (payload) {
      for (var kp in payload) {
        if (kp !== "payload" && kp !== "action") mergedParams[kp] = payload[kp];
      }
      if (payload.payload && typeof payload.payload === "object") {
        for (var kpp in payload.payload) mergedParams[kpp] = payload.payload[kpp];
      }
    }

    var requestPayload = (payload.payload && typeof payload.payload === "object")
      ? Object.assign({}, payload, payload.payload)
      : payload;

    var result = { success: false, error: "Hành động không hợp lệ: " + action };

    switch (action) {
      case "v2.health":
      case "system.health":
        result = {
          success: true,
          status: "healthy",
          service: V2_CONFIG.SYSTEM_NAME,
          version: V2_CONFIG.SCHEMA_VERSION,
          architecture: "MULTI_TENANT",
          dataMode: "REAL",
          activeTenant: V2_CONFIG.PILOT_TENANT_ID,
          companyName: V2_CONFIG.SYSTEM_NAME,
          spreadsheetName: ss ? ss.getName() : "Unknown",
          spreadsheetUrl: ss ? ss.getUrl() : "",
          time: new Date().toISOString()
        };
        break;

      case "v2.system.setup":
        result = setupV2Platform(ss);
        break;

      // --- WORKER ENDPOINTS ---
      case "v2.workers.list":
      case "v2.worker.list":
      case "worker.list":
        result = handleListWorkersV2_(mergedParams, ss);
        break;

      case "v2.worker.get":
      case "worker.get":
        result = handleGetWorkerV2_(mergedParams, ss);
        break;

      case "v2.worker.create":
      case "worker.create":
        result = handleCreateWorkerV2_(requestPayload, ss);
        break;

      case "v2.worker.update":
      case "worker.update":
        result = handleUpdateWorkerV2_(requestPayload, ss);
        break;

      case "v2.worker.soft_delete":
      case "worker.delete":
        result = handleSoftDeleteWorkerV2_(requestPayload, ss);
        break;

      // --- CRM DEAL ENDPOINTS ---
      case "v2.deals.list":
      case "v2.deal.list":
      case "deal.list":
      case "deals.list":
        result = handleListDealsV2_(mergedParams, ss);
        break;

      case "v2.deal.create":
      case "deal.create":
        result = handleCreateDealV2_(requestPayload, ss);
        break;

      case "v2.deal.move_stage":
      case "deal.move_stage":
        result = handleMoveStageV2_(requestPayload, ss);
        break;

      case "v2.deal.update":
      case "deal.update":
        result = handleUpdateDealV2_(requestPayload, ss);
        break;

      case "v2.deal.soft_delete":
      case "deal.soft_delete":
      case "deal.delete":
        result = handleSoftDeleteDealV2_(requestPayload, ss);
        break;

      // --- PIPELINE EVENTS ---
      case "v2.pipeline.events":
      case "pipeline.events":
        result = handleListPipelineEventsV2_(mergedParams, ss);
        break;

      // --- TAXONOMY & AUDIT & KPI ---
      case "v2.taxonomy.get":
      case "taxonomy.get":
      case "master.taxonomy":
        result = handleGetTaxonomyV2_(ss);
        break;

      case "v2.audit.list":
        result = handleListAuditLogsV2_(mergedParams, ss);
        break;

      case "v2.dashboard.stats":
        result = handleGetDashboardStatsV2_(ss);
        break;

      // --- MODULE 10: BATCH IMPORT ---
      case "v2.batch.import":
        result = handleBatchImportWorkersV2_(requestPayload, ss);
        break;

      // --- MODULE 11: FIELD DISPATCH & INTERVIEW CHECK-IN ---
      case "v2.dispatch.roster":
        result = handleGetInterviewRosterV2_(mergedParams, ss);
        break;

      case "v2.dispatch.checkin":
        result = handleCheckInInterviewV2_(requestPayload, ss);
        break;

      // --- MODULE 12: ATTENDANCE MATCHING & VWW ENGINE ---
      case "v2.attendance.match":
        result = handleMatchAttendanceAndVerifyVwwV2_(requestPayload, ss);
        break;

      // --- MODULE 13: SETTLEMENT & COMMISSION ---
      case "v2.settlement.report":
        result = handleGetSettlementReportV2_(mergedParams, ss);
        break;

      case "v2.settlement.approve":
        result = handleApproveCommissionV2_(requestPayload, ss);
        break;

      // --- LEAD MARKETING & CONSULTATION ENDPOINTS ---
      case "v2.lead.capture":
      case "auth.register_lead":
        result = handleCaptureLeadV2_(requestPayload, ss);
        break;

      case "v2.leads.list":
        result = handleListLeadsV2_(mergedParams, ss);
        break;

      default:
        result = {
          success: false,
          error: "Endpoint V2 không được hỗ trợ: " + action,
          availableActions: [
            "v2.health", "v2.system.setup",
            "v2.workers.list", "v2.worker.get", "v2.worker.create", "v2.worker.update", "v2.worker.soft_delete",
            "v2.deals.list", "v2.deal.create", "v2.deal.move_stage", "v2.deal.update", "v2.deal.soft_delete",
            "v2.taxonomy.get", "v2.audit.list", "v2.dashboard.stats", "v2.pipeline.events",
            "v2.batch.import", "v2.dispatch.roster", "v2.dispatch.checkin",
            "v2.attendance.match", "v2.settlement.report", "v2.settlement.approve",
            "v2.lead.capture", "v2.leads.list"
          ]
        };
        break;
    }

    return createJsonResponseV2_(result);
  } catch (error) {
    return createJsonResponseV2_({
      success: false,
      error: error.message || error.toString(),
      stack: error.stack
    });
  }
}

function createJsonResponseV2_(result) {
  if (result && typeof result === "object") {
    if (result.success && result.data === undefined) {
      if (result.items !== undefined) {
        result.data = result.items;
      } else if (result.worker !== undefined) {
        result.data = result.worker;
      } else if (result.deal !== undefined) {
        result.data = result.deal;
      } else if (result.metrics !== undefined) {
        result.data = result.metrics;
      } else {
        var copy = {};
        for (var k in result) {
          if (k !== 'data') copy[k] = result[k];
        }
        result.data = copy;
      }
    }
  }
  var output = ContentService.createTextOutput(JSON.stringify(result));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

/**
 * Điều phối thiết lập toàn diện nền tảng V2
 */
function setupV2Platform(ss) {
  if (!ss) ss = getSpreadsheetV2_();
  if (!ss) return { success: false, error: "Không tìm thấy Spreadsheet." };

  renameSheetsToOption1_(ss);
  setupTaxonomySheets_(ss);
  setupMasterWorkersSheet_(ss);
  setupCrmDealsSheet_(ss);
  setupAuditLogSheet_(ss);
  applyNativeGmailProtections_(ss);
  applyNativeDataValidations_(ss);

  return {
    success: true,
    message: "Khởi tạo và cấu hình thành công toàn bộ hệ thống FCS V2 theo Phương án 1 (01, 02, 03)!",
    spreadsheetUrl: ss.getUrl()
  };
}

/**
 * Hàm alias trực tiếp cho thanh công cụ Run của Google Apps Script Editor
 */
function setupV2NativeSheets() {
  return setupV2Platform();
}
