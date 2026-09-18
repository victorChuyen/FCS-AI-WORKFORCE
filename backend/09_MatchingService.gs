/**
 * ==============================================================================
 * FCS AI WORKFORCE OS — MATCHING SERVICE
 * Part of V4 Multi-Tenant SaaS Platform Engine
 * ==============================================================================
 */

function getMatchingReviews_(dataSs) {
  var sheet = dataSs.getSheetByName("10_MATCHING_REVIEW");
  if (!sheet || sheet.getLastRow() <= 1) return { success: true, data: [] };
  var data = sheet.getDataRange().getValues();
  var result = [];
  for (var i = 1; i < data.length; i++) {
    result.push({
      reviewId: data[i][0],
      rawId: data[i][1],
      suggestedWorkerId: data[i][2],
      confidenceScore: data[i][3],
      reason: data[i][4],
      status: data[i][5]
    });
  }
  return { success: true, data: result };
}
