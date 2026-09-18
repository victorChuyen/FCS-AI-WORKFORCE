/**
 * ==============================================================================
 * FCS AI WORKFORCE OS — MASTER DATA SERVICE
 * Part of V4 Multi-Tenant SaaS Platform Engine
 * ==============================================================================
 */

function getOffices_(mgmtSs) {
  var sheet = mgmtSs.getSheetByName("14_OFFICES") || mgmtSs.getSheetByName("02_OFFICES") || mgmtSs.getSheetByName("OFFICES");
  if (!sheet || sheet.getLastRow() <= 1) return { success: true, data: [] };
  var data = sheet.getDataRange().getValues();
  var res = [];
  for (var i = 1; i < data.length; i++) {
    res.push({ id: data[i][0], name: data[i][1], code: data[i][2], address: data[i][3] });
  }
  return { success: true, data: res };
}

function getStaff_(mgmtSs) {
  var sheet = mgmtSs.getSheetByName("13_STAFF") || mgmtSs.getSheetByName("03_STAFF") || mgmtSs.getSheetByName("STAFF");
  if (!sheet || sheet.getLastRow() <= 1) return { success: true, data: [] };
  var data = sheet.getDataRange().getValues();
  var res = [];
  for (var i = 1; i < data.length; i++) {
    res.push({ id: data[i][0], name: data[i][1], email: data[i][2], role: data[i][4], officeId: data[i][5] });
  }
  return { success: true, data: res };
}

function getPartners_(mgmtSs) {
  var sheet = mgmtSs.getSheetByName("11_PARTNERS") || mgmtSs.getSheetByName("04_PARTNERS") || mgmtSs.getSheetByName("PARTNERS");
  if (!sheet || sheet.getLastRow() <= 1) return { success: true, data: [] };
  var data = sheet.getDataRange().getValues();
  var res = [];
  for (var i = 1; i < data.length; i++) {
    res.push({ id: data[i][0], name: data[i][1], code: data[i][2], industry: data[i][3], location: data[i][4] });
  }
  return { success: true, data: res };
}

function getJobs_(mgmtSs) {
  var sheet = mgmtSs.getSheetByName("12_JOBS") || mgmtSs.getSheetByName("05_JOBS") || mgmtSs.getSheetByName("JOBS");
  if (!sheet || sheet.getLastRow() <= 1) return { success: true, data: [] };
  var data = sheet.getDataRange().getValues();
  var res = [];
  for (var i = 1; i < data.length; i++) {
    res.push({ id: data[i][0], partnerId: data[i][1], title: data[i][2], salaryRange: data[i][3], vacancies: data[i][4] });
  }
  return { success: true, data: res };
}
