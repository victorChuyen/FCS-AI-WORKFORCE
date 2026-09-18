/**
 * ==============================================================================
 * FCS AI WORKFORCE OS — TENANT RESOLVER
 * Part of V4 Multi-Tenant SaaS Platform Engine
 * ==============================================================================
 */

function resolveTenantContext_(identity, requestedTenantId) {
  var props = PropertiesService.getScriptProperties();
  var masterId = props.getProperty("MASTER_SPREADSHEET_ID");
  var masterSs = null;

  if (masterId) {
    try { masterSs = SpreadsheetApp.openById(masterId); } catch (e) {}
  }
  if (!masterSs && PLATFORM_CONFIG.DEFAULT_SPREADSHEET_ID) {
    try {
      masterSs = SpreadsheetApp.openById(PLATFORM_CONFIG.DEFAULT_SPREADSHEET_ID);
    } catch (e) {}
  }

  var email = (identity && identity.email) ? String(identity.email).trim().toLowerCase() : "";
  
  // 1. Check Global Users for Platform Role
  var platformRole = "NONE";
  var usersSheet = masterSs ? masterSs.getSheetByName("03_GLOBAL_USERS") : null;

  if (usersSheet && usersSheet.getLastRow() > 1) {
    var usersData = usersSheet.getDataRange().getValues();
    for (var u = 1; u < usersData.length; u++) {
      var rowEmail = String(usersData[u][1]).trim().toLowerCase();
      if (rowEmail === email) {
        platformRole = usersData[u][4] || "NONE";
        break;
      }
    }
  }

  // Super Admin Fallback rule
  if (!email || email === PLATFORM_CONFIG.DEFAULT_SUPER_ADMIN || email === PLATFORM_CONFIG.SECONDARY_SUPER_ADMIN) {
    platformRole = "PLATFORM_SUPER_ADMIN";
  }

  // 2. Resolve Active Tenant
  var targetTenantId = PLATFORM_CONFIG.PILOT_TENANT_ID;
  var tenantRole = "VIEWER";
  var allowedOfficeIds = ["*"];
  var staffId = "STF-001";

  if (platformRole === "PLATFORM_SUPER_ADMIN") {
    if (requestedTenantId) {
      targetTenantId = requestedTenantId;
    }
    tenantRole = "TENANT_ADMIN";
  } else {
    var accessSheet = masterSs ? masterSs.getSheetByName("04_USER_TENANT_ACCESS") : null;
    var foundAccess = false;

    if (accessSheet && accessSheet.getLastRow() > 1) {
      var accessData = accessSheet.getDataRange().getValues();
      for (var a = 1; a < accessData.length; a++) {
        var accEmail = String(accessData[a][2]).trim().toLowerCase();
        var accTenant = accessData[a][3];
        var accStatus = accessData[a][7];

        if (accEmail === email && accStatus === "ACTIVE") {
          if (!requestedTenantId || requestedTenantId === accTenant) {
            targetTenantId = accTenant;
            tenantRole = accessData[a][4] || "VIEWER";
            staffId = accessData[a][5] || "STF-GEN";
            allowedOfficeIds = accessData[a][6] === "*" ? ["*"] : [accessData[a][6]];
            foundAccess = true;
            break;
          }
        }
      }
    }

    if (!foundAccess) {
      targetTenantId = PLATFORM_CONFIG.PILOT_TENANT_ID;
      tenantRole = "VIEWER";
    }
  }

  // 3. Resolve Tenant Files
  var dataSpreadsheetId = "";
  var managementSpreadsheetId = "";
  var filesSheet = masterSs ? masterSs.getSheetByName("02_TENANT_FILES") : null;

  if (filesSheet && filesSheet.getLastRow() > 1) {
    var filesData = filesSheet.getDataRange().getValues();
    for (var f = 1; f < filesData.length; f++) {
      if (filesData[f][0] === targetTenantId && filesData[f][7] === "ACTIVE") {
        dataSpreadsheetId = filesData[f][1];
        managementSpreadsheetId = filesData[f][3];
        break;
      }
    }
  }

  // Default fallback for Pilot Tenant to operational spreadsheet
  if (!dataSpreadsheetId || !managementSpreadsheetId) {
    dataSpreadsheetId = PLATFORM_CONFIG.DEFAULT_SPREADSHEET_ID;
    managementSpreadsheetId = PLATFORM_CONFIG.DEFAULT_SPREADSHEET_ID;
  }

  // 4. Resolve Company Name
  var companyName = PLATFORM_CONFIG.PILOT_COMPANY_NAME;
  var tenantsSheet = masterSs ? masterSs.getSheetByName("01_TENANTS") : null;
  if (tenantsSheet && tenantsSheet.getLastRow() > 1) {
    var tenantsData = tenantsSheet.getDataRange().getValues();
    for (var t = 1; t < tenantsData.length; t++) {
      if (tenantsData[t][0] === targetTenantId) {
        companyName = tenantsData[t][1];
        break;
      }
    }
  }

  return {
    email: email,
    platformRole: platformRole,
    tenantId: targetTenantId,
    companyName: companyName,
    tenantRole: tenantRole,
    staffId: staffId,
    allowedOfficeIds: allowedOfficeIds,
    dataSpreadsheetId: dataSpreadsheetId,
    managementSpreadsheetId: managementSpreadsheetId,
    isSuperAdmin: (platformRole === "PLATFORM_SUPER_ADMIN")
  };
}

function listTenants_() {
  var props = PropertiesService.getScriptProperties();
  var masterId = props.getProperty("MASTER_SPREADSHEET_ID");
  var masterSs = SpreadsheetApp.openById(masterId);
  var sheet = masterSs.getSheetByName("01_TENANTS");
  var data = sheet.getDataRange().getValues();
  var result = [];
  for (var i = 1; i < data.length; i++) {
    result.push({
      tenantId: data[i][0],
      companyName: data[i][1],
      companySlug: data[i][2],
      companyCode: data[i][3],
      planCode: data[i][4],
      status: data[i][5],
      ownerName: data[i][6],
      ownerEmail: data[i][7],
      createdAt: data[i][9]
    });
  }
  return { success: true, data: result };
}
