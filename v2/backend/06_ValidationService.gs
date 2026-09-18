/**
 * ==============================================================================
 * FCS AI WORKFORCE OS V2 — MODULE 5: VALIDATION SERVICE
 * Chức năng: Chuẩn hóa & Xác thực dữ liệu 2 tầng (Server API & Google Sheets Native):
 * 1. API Validation: validateWorkerPayloadOrReject_ & validateDealPayloadOrReject_
 * 2. Cài đặt Dropdown danh mục từ Taxonomy Ranges & Static Lists
 * 3. Bật Reject Input (Chặn nhập bậy, buộc chọn đúng từ danh mục)
 * 4. Định dạng Text (@) cho CCCD, SĐT, Tài khoản chống mất số 0 đầu
 * ==============================================================================
 */

/**
 * Kiểm tra tính hợp lệ của Payload tạo / sửa Worker theo Handoff 2026-09-16
 * @param {Object} payload Dữ liệu đầu vào
 * @returns {Object} { isValid: boolean, error?: string, warnings?: string[], normalizedData: Object }
 */
function validateWorkerPayloadOrReject_(payload) {
  if (!payload || typeof payload !== "object") {
    return { isValid: false, error: "Dữ liệu payload không hợp lệ hoặc bị rỗng." };
  }

  var warnings = [];
  var fullName = (payload.full_name || payload.fullName || "").toString().trim().replace(/\s+/g, " ").toUpperCase();
  
  // 1. Kiểm tra Họ và Tên: ít nhất 2 từ, không chứa số hoặc ký tự đặc biệt
  if (!fullName || fullName.split(" ").length < 2) {
    return { isValid: false, error: "Họ và tên phải có đầy đủ cả Họ và Tên (tối thiểu 2 từ)." };
  }
  if (/[\d~`!@#$%^&*()_+={\[}\]|\\:;"'<,>?/]/.test(fullName)) {
    return { isValid: false, error: "Họ và tên không được chứa chữ số hoặc ký tự đặc biệt." };
  }

  // 2. Kiểm tra Số điện thoại: 10 chữ số, đầu mạng VN hợp lệ
  var rawPhone = (payload.phone || payload.phoneNumber || "").toString().replace(/\D/g, "");
  if (rawPhone.startsWith("84")) rawPhone = "0" + rawPhone.slice(2);
  var validPrefixes = ["03", "05", "07", "08", "09"];
  var phoneValid = rawPhone.length === 10 && validPrefixes.indexOf(rawPhone.substring(0, 2)) !== -1;
  if (!phoneValid) {
    return { isValid: false, error: "Số điện thoại không đúng định dạng 10 chữ số nhà mạng Việt Nam (03, 05, 07, 08, 09)." };
  }

  // 3. Kiểm tra CCCD: Đúng 12 chữ số nếu được cung cấp
  var rawCccd = (payload.cccd || payload.idNumber || "").toString().replace(/\D/g, "");
  if (rawCccd && rawCccd.length !== 12) {
    return { isValid: false, error: "Số CCCD bắt buộc phải đúng 12 chữ số định danh công dân VNeID." };
  }

  // 4. Giới tính: Nam hoặc Nữ (hỗ trợ M/F)
  var gender = (payload.gender || "Nam").toString().trim();
  if (gender.toUpperCase() === "M") gender = "Nam";
  if (gender.toUpperCase() === "F") gender = "Nữ";
  if (["Nam", "Nữ"].indexOf(gender) === -1) gender = "Nam";

  // 5. Kiểm tra Ngày sinh & Cảnh báo độ tuổi
  var dob = (payload.date_of_birth || payload.dateOfBirth || "").toString().trim();
  if (dob) {
    var dobMatch = dob.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (dobMatch) {
      var birthYear = parseInt(dobMatch[1], 10);
      var currentYear = new Date().getFullYear();
      var age = currentYear - birthYear;
      if (age < 15 || age > 75) {
        return { isValid: false, error: "Năm sinh không hợp lệ (tuổi từ 15 đến 75)." };
      }
      if (age < 18) {
        warnings.push("L1.7: Lao động thiếu tuổi (" + age + " tuổi < 18).");
      } else if (age >= 45) {
        warnings.push("L1.5: Lao động thừa tuổi (" + age + " tuổi ≥ 45).");
      }
    }
  }

  return {
    isValid: true,
    warnings: warnings,
    normalizedData: {
      full_name: fullName,
      phone: rawPhone,
      cccd: rawCccd,
      gender: gender,
      date_of_birth: dob
    }
  };
}

/**
 * Kiểm tra tính hợp lệ của Payload Deal ứng tuyển
 * @param {Object} payload Dữ liệu deal
 * @returns {Object} { isValid: boolean, error?: string }
 */
function normalizeStageCode_(stageInput) {
  if (!stageInput) return "C3";
  var s = stageInput.toString().trim();

  var validStages = [
    "C3", "C3.1", "C3.2", "L1", "L1.1", "L1.2", "L1.3", "L1.4", "L1.5", "L1.6", "L1.7",
    "L2", "L2.1", "L2.2", "L2.3", "L3", "L3.1", "L3.2", "L4"
  ];
  if (validStages.indexOf(s) !== -1) return s;

  // Hỗ trợ nhận diện cả tên đầy đủ hoặc tiền tố, ví dụ: "C3. Lao động mới", "L2.1. Lao động đỗ phỏng vấn"
  var match = s.match(/^(C3\.[12]|C3|L1\.[1234567]|L1|L2\.[123]|L2|L3\.[12]|L3|L4)/i);
  if (match) {
    var code = match[1].toUpperCase();
    if (validStages.indexOf(code) !== -1) return code;
  }
  return "";
}

/**
 * Kiểm tra tính hợp lệ của Payload Deal ứng tuyển
 * @param {Object} payload Dữ liệu deal
 * @returns {Object} { isValid: boolean, error?: string, normalizedStage?: string }
 */
function validateDealPayloadOrReject_(payload) {
  if (!payload || typeof payload !== "object") {
    return { isValid: false, error: "Dữ liệu Deal không hợp lệ." };
  }

  var workerId = (payload.worker_id || "").toString().trim();
  if (!workerId || !/^WK-\d+$/i.test(workerId)) {
    return { isValid: false, error: "Mã worker_id không hợp lệ (định dạng chuẩn: WK-XXXXXX)." };
  }

  var rawStage = (payload.level_sale_status || payload.stage || "C3").toString().trim();
  var normStage = normalizeStageCode_(rawStage);
  if (!normStage) {
    return { isValid: false, error: "Trạng thái Level Sale '" + rawStage + "' không thuộc danh mục 19 trạng thái chuẩn (C3 -> L4)." };
  }

  return { isValid: true, normalizedStage: normStage };
}

/**
 * Thiết lập Dropdown Validation bản địa 100% trên Google Sheets
 */
function applyNativeDataValidations_(ss) {
  var workerSheet = ss.getSheetByName(V2_CONFIG.TAB_WORKERS);
  var dealSheet = ss.getSheetByName(V2_CONFIG.TAB_DEALS);
  var branchSheet = ss.getSheetByName(V2_CONFIG.TAB_BRANCHES);
  var companySheet = ss.getSheetByName(V2_CONFIG.TAB_COMPANIES);
  var lsSheet = ss.getSheetByName(V2_CONFIG.TAB_LEVEL_SALE);
  
  if (workerSheet) {
    // 1. Dropdown Giới tính (Cột D)
    var genderRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Nam", "Nữ"], true)
      .setAllowInvalid(false)
      .setHelpText("Vui lòng chọn giới tính trong danh sách: Nam hoặc Nữ.")
      .build();
    workerSheet.getRange("D2:D").setDataValidation(genderRule);

    // 2. Dropdown Tình trạng hôn nhân (Cột Q)
    var maritalRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Đã kết hôn", "Chưa kết hôn", "Ly hôn"], true)
      .setAllowInvalid(false)
      .setHelpText("Vui lòng chọn tình trạng hôn nhân hợp lệ.")
      .build();
    workerSheet.getRange("Q2:Q").setDataValidation(maritalRule);
    
    // 3. Dropdown Chi nhánh (Cột Y) trỏ DM_BRANCH!B2:B9
    if (branchSheet) {
      var branchRule = SpreadsheetApp.newDataValidation()
        .requireValueInRange(branchSheet.getRange("B2:B9"), true)
        .setAllowInvalid(false)
        .setHelpText("Vui lòng chọn 1 trong 8 chi nhánh tuyển dụng chuẩn của FCS.")
        .build();
      workerSheet.getRange("Y2:Y").setDataValidation(branchRule);
      if (dealSheet) dealSheet.getRange("G2:G").setDataValidation(branchRule);
    }
    
    // 4. Dropdown Công ty (Cột Z) trỏ DM_COMPANY!B2:B30
    if (companySheet) {
      var companyRule = SpreadsheetApp.newDataValidation()
        .requireValueInRange(companySheet.getRange("B2:B30"), true)
        .setAllowInvalid(false)
        .setHelpText("Vui lòng chọn 1 trong 29 đối tác / nhà máy chuẩn của FCS.")
        .build();
      workerSheet.getRange("Z2:Z").setDataValidation(companyRule);
      if (dealSheet) dealSheet.getRange("F2:F").setDataValidation(companyRule);
    }

    // 5. Dropdown Hình thức làm việc (Cột AA)
    var workTypeRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Chính thức", "Thời vụ", "Theo ca"], true)
      .setAllowInvalid(false)
      .setHelpText("Vui lòng chọn hình thức làm việc: Chính thức, Thời vụ hoặc Theo ca.")
      .build();
    workerSheet.getRange("AA2:AA").setDataValidation(workTypeRule);

    // 6. Dropdown Trạng thái phỏng vấn (Cột AD)
    var interviewStatusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Đỗ", "Trượt", "Hủy", "Chưa phỏng vấn"], true)
      .setAllowInvalid(false)
      .setHelpText("Vui lòng chọn trạng thái phỏng vấn hợp lệ.")
      .build();
    workerSheet.getRange("AD2:AD").setDataValidation(interviewStatusRule);

    // 7. Dropdown Tình trạng đi làm (Cột AE)
    var workingStatusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Đang đi làm", "Nghỉ việc", "Chưa đi làm"], true)
      .setAllowInvalid(false)
      .setHelpText("Vui lòng chọn tình trạng đi làm hợp lệ.")
      .build();
    workerSheet.getRange("AE2:AE").setDataValidation(workingStatusRule);

    // 8. Định dạng Plain Text (@) cho CCCD (F), SĐT (T), STK (U), SĐT người thân (S)
    workerSheet.getRange("F2:F").setNumberFormat("@");
    workerSheet.getRange("S2:S").setNumberFormat("@");
    workerSheet.getRange("T2:T").setNumberFormat("@");
    workerSheet.getRange("U2:U").setNumberFormat("@");
  }
  
  if (dealSheet) {
    // 9. Dropdown 19 Level Sale (Cột H) trỏ DM_LEVEL_SALE!A2:A20
    if (lsSheet) {
      var lsRule = SpreadsheetApp.newDataValidation()
        .requireValueInRange(lsSheet.getRange("A2:A20"), true)
        .setAllowInvalid(false)
        .setHelpText("Vui lòng chọn trạng thái trong 19 Level Sale chuẩn (C3 -> L4).")
        .build();
      dealSheet.getRange("H2:H").setDataValidation(lsRule);
    }

    // 10. Dropdown Kết quả phỏng vấn (Cột L)
    var interviewResultRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Đỗ phỏng vấn", "Trượt phỏng vấn", "Không đến phỏng vấn", "Chờ kết quả"], true)
      .setAllowInvalid(false)
      .setHelpText("Vui lòng chọn kết quả phỏng vấn.")
      .build();
    dealSheet.getRange("L2:L").setDataValidation(interviewResultRule);

    // 11. Dropdown Tình trạng làm việc thực tế (Cột N)
    var actualWorkStatusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Đang làm việc", "Nghỉ việc ngang", "Muốn đổi công ty", "Đã hết thời gian phí", "Chưa đi làm"], true)
      .setAllowInvalid(false)
      .setHelpText("Vui lòng chọn tình trạng làm việc thực tế.")
      .build();
    dealSheet.getRange("N2:N").setDataValidation(actualWorkStatusRule);

    // 12. Dropdown Trạng thái hoa hồng (Cột R)
    var commissionStatusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Chờ duyệt", "Đã duyệt Lead", "Đã duyệt Manager", "Đã thanh toán"], true)
      .setAllowInvalid(false)
      .setHelpText("Vui lòng chọn trạng thái thanh quyết toán hoa hồng.")
      .build();
    dealSheet.getRange("R2:R").setDataValidation(commissionStatusRule);

    // 13. Định dạng Plain Text cho Phone (D), CCCD (E)
    dealSheet.getRange("D2:D").setNumberFormat("@");
    dealSheet.getRange("E2:E").setNumberFormat("@");
  }
}
