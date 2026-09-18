/**
 * ==============================================================================
 * FCS AI WORKFORCE OS — RESPONSE & REPOSITORY HELPERS
 * Part of V4 Multi-Tenant SaaS Platform Engine
 * ==============================================================================
 */

function jsonResponse_(obj, requestId) {
  if (requestId && typeof obj === "object" && !obj.requestId) {
    obj.requestId = requestId;
  }
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function cleanText_(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

/**
 * Reads a sheet dynamically by mapping column headers.
 * Header names are converted to lowercase and cleaned.
 * Returns array of objects with '_rowIndex' tracking the 1-based sheet row.
 */
function readTable_(sheet) {
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) return [];

  var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var headers = values[0].map(function(h) {
    return cleanText_(h).toLowerCase();
  });

  var records = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var hasContent = false;
    for (var c = 0; c < row.length; c++) {
      if (row[c] !== "" && row[c] !== null) {
        hasContent = true;
        break;
      }
    }
    if (!hasContent) continue;

    var obj = { _rowIndex: i + 1 };
    for (var h = 0; h < headers.length; h++) {
      var headerKey = headers[h];
      if (headerKey) {
        obj[headerKey] = row[h];
      }
    }
    records.push(obj);
  }
  return records;
}

/**
 * Appends a record to a sheet according to the sheet's actual column headers.
 */
function appendRecord_(sheet, record) {
  if (!sheet) return false;
  var lastCol = sheet.getLastColumn();
  if (lastCol < 1) return false;

  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var newRow = headers.map(function(header) {
    var key = cleanText_(header).toLowerCase();
    return record[key] !== undefined ? record[key] : "";
  });

  sheet.appendRow(newRow);
  return true;
}

/**
 * Updates a record in a sheet by finding a row matching a key/value pair.
 */
function updateRecordByKey_(sheet, matchKey, matchValue, updates) {
  if (!sheet) return false;
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) return false;

  var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var headers = values[0].map(function(h) {
    return cleanText_(h).toLowerCase();
  });

  var targetColIdx = headers.indexOf(cleanText_(matchKey).toLowerCase());
  if (targetColIdx === -1) return false;

  for (var r = 1; r < values.length; r++) {
    if (cleanText_(values[r][targetColIdx]) === cleanText_(matchValue)) {
      var sheetRow = r + 1;
      for (var updateKey in updates) {
        var colIdx = headers.indexOf(cleanText_(updateKey).toLowerCase());
        if (colIdx !== -1) {
          sheet.getRange(sheetRow, colIdx + 1).setValue(updates[updateKey]);
        }
      }
      return true;
    }
  }
  return false;
}
