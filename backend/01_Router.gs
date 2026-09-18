/**
 * ==============================================================================
 * FCS AI WORKFORCE OS — ROUTER
 * Part of V4 Multi-Tenant SaaS Platform Engine
 * ==============================================================================
 */

function doGet(e) {
  return jsonResponse_({
    success: true,
    status: "ok",
    service: "FCS AI WORKFORCE OS",
    version: PLATFORM_CONFIG.SCHEMA_VERSION,
    architecture: "MULTI_TENANT",
    dataMode: "REAL",
    tenantIsolation: true,
    timestamp: Date.now()
  });
}

function doPost(e) {
  var requestId = "REQ-" + Date.now();
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse_({ success: false, error: { code: "BAD_REQUEST", message: "Yêu cầu rỗng." }, requestId: requestId });
    }

    var request = JSON.parse(e.postData.contents);
    var action = request.action || "";
    var payload = request.payload || {};
    var identity = request.identity || { email: PLATFORM_CONFIG.DEFAULT_SUPER_ADMIN };
    var requestedTenantId = request.requestedTenantId || payload.tenantId || "";
    requestId = request.requestId || requestId;

    // Resolve Tenant Context securely
    var tenantContext = resolveTenantContext_(identity, requestedTenantId);

    // Platform Health Check (Safe public info)
    if (action === "system.health") {
      return jsonResponse_({
        success: true,
        data: {
          status: "healthy",
          service: "FCS AI WORKFORCE OS",
          version: PLATFORM_CONFIG.SCHEMA_VERSION,
          architecture: "MULTI_TENANT",
          dataMode: "REAL",
          tenantIsolation: true,
          activeTenant: tenantContext.tenantId,
          companyName: tenantContext.companyName,
          tenantRole: tenantContext.tenantRole,
          platformRole: tenantContext.platformRole
        },
        requestId: requestId
      });
    }

    // Lead & User Registration Intake with Purpose
    if (action === "auth.register_lead") {
      return jsonResponse_(recordUserRegistration_(payload), requestId);
    }

    // Tenant Health Check
    if (action === "tenant.health") {
      var dataOk = false;
      var mgmtOk = false;
      try {
        if (tenantContext.dataSpreadsheetId) {
          var dss = SpreadsheetApp.openById(tenantContext.dataSpreadsheetId);
          dataOk = Boolean(dss);
        }
      } catch(e) {}
      try {
        if (tenantContext.managementSpreadsheetId) {
          var mss = SpreadsheetApp.openById(tenantContext.managementSpreadsheetId);
          mgmtOk = Boolean(mss);
        }
      } catch(e) {}

      return jsonResponse_({
        success: true,
        data: {
          tenantId: tenantContext.tenantId,
          companyName: tenantContext.companyName,
          dataConnected: dataOk,
          managementConnected: mgmtOk,
          schemaVersion: PLATFORM_CONFIG.SCHEMA_VERSION,
          dataMode: "REAL",
          role: tenantContext.tenantRole
        },
        requestId: requestId
      });
    }

    // Super Admin: List Tenants
    if (action === "tenant.list") {
      if (tenantContext.platformRole !== "PLATFORM_SUPER_ADMIN") {
        return jsonResponse_({ success: false, error: { code: "FORBIDDEN", message: "Chỉ Super Admin mới có quyền xem danh sách tenants." }, requestId: requestId });
      }
      return jsonResponse_(listTenants_(), requestId);
    }

    // Super Admin: Switch Tenant
    if (action === "tenant.select") {
      if (tenantContext.platformRole !== "PLATFORM_SUPER_ADMIN") {
        return jsonResponse_({ success: false, error: { code: "FORBIDDEN", message: "Từ chối truy cập." }, requestId: requestId });
      }
      var newCtx = resolveTenantContext_(identity, payload.tenantId);
      return jsonResponse_({
        success: true,
        data: {
          tenantId: newCtx.tenantId,
          companyName: newCtx.companyName,
          tenantRole: newCtx.tenantRole
        }
      }, requestId);
    }

    // BUSINESS REPOSITORIES - ALL REQUIRE RESOLVED TENANT FILES
    if (!tenantContext.dataSpreadsheetId || !tenantContext.managementSpreadsheetId) {
      return jsonResponse_({
        success: false,
        error: { code: "TENANT_FILES_UNRESOLVED", message: "Chưa cấu hình tệp dữ liệu cho Tenant " + tenantContext.tenantId },
        requestId: requestId
      });
    }

    var dataSs = SpreadsheetApp.openById(tenantContext.dataSpreadsheetId);
    var mgmtSs = SpreadsheetApp.openById(tenantContext.managementSpreadsheetId);

    switch (action) {
      // 1. Dashboard Summary
      case "dashboard.summary":
        return jsonResponse_(getDashboardSummary_(dataSs, mgmtSs, tenantContext), requestId);

      // 2. Worker List
      case "worker.list":
        return jsonResponse_(getWorkers_(dataSs, payload), requestId);

      // 3. Worker Detail
      case "worker.get":
        return jsonResponse_(getWorkerDetail_(dataSs, payload.workerId), requestId);

      // 4. Worker Create
      case "worker.create":
        return jsonResponse_(createWorker_(dataSs, payload, tenantContext), requestId);

      // 5. Worker Update
      case "worker.update":
        return jsonResponse_(updateWorker_(dataSs, payload, tenantContext), requestId);
      case "worker.merge":
        return jsonResponse_(workerMerge_(dataSs, payload, tenantContext), requestId);

      // 6. Action Queue List & Resolve
      case "action.list":
        return jsonResponse_(getActionQueue_(dataSs, payload), requestId);
      case "action.resolve":
        return jsonResponse_(actionResolve_(dataSs, payload, tenantContext), requestId);

      // 7. Pipeline Funnel
      case "pipeline.funnel":
      case "pipeline.metrics":
        return jsonResponse_(getPipelineFunnel_(dataSs), requestId);

      // 8. Pipeline Events
      case "pipeline.events":
        return jsonResponse_(getPipelineEvents_(dataSs, payload.workerId), requestId);

      // 9. Interviews
      case "interview.list":
        return jsonResponse_(getInterviews_(dataSs, payload.workerId), requestId);
      case "interview.create":
        return jsonResponse_(createInterview_(dataSs, payload, tenantContext), requestId);
      case "interview.update":
        return jsonResponse_(updateInterview_(dataSs, payload, tenantContext), requestId);

      // 10. Assignments
      case "assignment.list":
        return jsonResponse_(getAssignments_(dataSs, payload.workerId), requestId);
      case "assignment.create":
        return jsonResponse_(createAssignment_(dataSs, payload, tenantContext), requestId);
      case "assignment.start":
        return jsonResponse_(startAssignment_(dataSs, payload.assignmentId, tenantContext), requestId);

      // 11. Attendance & Matching
      case "attendance.list":
        return jsonResponse_(getAttendanceList_(dataSs, payload.workerId), requestId);
      case "attendance.match":
        return jsonResponse_(matchAttendance_(dataSs, payload, tenantContext), requestId);
      case "attendance.reject":
      case "attendance.ignore":
        return jsonResponse_({ success: true, data: { reviewId: payload.reviewId, status: "REJECTED" } }, requestId);
      case "matching.list":
        return jsonResponse_(getMatchingReviews_(dataSs), requestId);

      // 12. Results & VWW
      case "results.summary":
      case "results.metrics":
        return jsonResponse_(getOperationalResults_(dataSs), requestId);

      // 13. Master Management Data
      case "master.offices":
        return jsonResponse_(getOffices_(mgmtSs), requestId);
      case "master.staff":
        return jsonResponse_(getStaff_(mgmtSs), requestId);
      case "master.partners":
        return jsonResponse_(getPartners_(mgmtSs), requestId);
      case "master.jobs":
        return jsonResponse_(getJobs_(mgmtSs), requestId);

      // 14. Golden Flow End-to-End Live Execution
      case "goldenflow.run":
        return jsonResponse_(executeGoldenFlow_(dataSs, payload, tenantContext), requestId);
      case "system.repair_data":
        return jsonResponse_(repairShiftedWorkersSheet_(dataSs), requestId);

      default:
        return jsonResponse_({
          success: false,
          error: { code: "UNKNOWN_ACTION", message: "Hành động '" + action + "' không được hỗ trợ trong phiên bản 4.0.0." },
          requestId: requestId
        });
    }

  } catch (err) {
    return jsonResponse_({
      success: false,
      error: { code: "SERVER_ERROR", message: err.toString() },
      requestId: requestId
    });
  }
}

function recordUserRegistration_(payload) {
  var props = PropertiesService.getScriptProperties();
  var masterId = props.getProperty("MASTER_SPREADSHEET_ID");
  var nowStr = new Date().toISOString();
  var fullName = payload.fullName || "";
  var email = String(payload.email || "").trim().toLowerCase();
  var phone = payload.phone || "";
  var organization = payload.organization || "";
  var purpose = payload.purpose || "Khảo sát giải pháp Quản lý Điều hành Lao động";
  var uid = payload.uid || ("UID-" + Date.now());

  if (masterId) {
    try {
      var masterSs = SpreadsheetApp.openById(masterId);
      var usersSheet = masterSs.getSheetByName("03_GLOBAL_USERS");
      if (usersSheet) {
        usersSheet.appendRow([uid, email, fullName + " (" + organization + ")", "", "VIEWER", "ACTIVE", nowStr, nowStr]);
      }
      var accessSheet = masterSs.getSheetByName("04_USER_TENANT_ACCESS");
      if (accessSheet) {
        accessSheet.appendRow(["ACC-" + Date.now(), uid, email, PLATFORM_CONFIG.PILOT_TENANT_ID, "VIEWER", "STF-VIEWER", "OFF-01", "ACTIVE", nowStr, nowStr]);
      }
    } catch(e) {
      Logger.log("Error writing to master sheet: " + e);
    }
  }

  return {
    success: true,
    data: {
      registered: true,
      email: email,
      role: "VIEWER",
      message: "Đã tiếp nhận thông tin đăng ký với quyền Người xem (Chỉ đọc)."
    }
  };
}

