/**
 * ═══════════════════════════════════════════════════════════════════
 * MODULE 14: LEAD MARKETING & CONSULTATION SERVICE (V2)
 * ═══════════════════════════════════════════════════════════════════
 * Chuyên trách:
 *  1. Lưu trữ Lead đăng ký AI Workforce Blueprint & Tư vấn 1:1 vào tab "04_LEADS_MARKETING".
 *  2. Bắn email thông báo tức thời đến Coach.Chuyen@gmail.com kèm link Zalo 1 chạm.
 *  3. Gửi email xác nhận kèm bản đồ tối ưu quy trình VWW cho người đăng ký.
 *  4. Quản lý trạng thái chăm sóc Email Marketing (NEW, CONTACTED, CONVERTED).
 */

var LEADS_MARKETING_SCHEMA = [
  "lead_id",
  "created_at",
  "full_name",
  "phone",
  "email",
  "company_name",
  "workforce_scale",
  "bottleneck",
  "source",
  "nurture_status",
  "email_alert_status",
  "admin_notes"
];

/**
 * Đảm bảo tab 04_LEADS_MARKETING tồn tại với format chuẩn
 */
function ensureLeadsMarketingSheetV2_(ss) {
  if (!ss) ss = getSpreadsheetV2_();
  var sheetName = V2_CONFIG.TAB_LEADS || "04_LEADS_MARKETING";
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(LEADS_MARKETING_SCHEMA);
    formatHeaderRow_(sheet, LEADS_MARKETING_SCHEMA.length, "#1E3A8A"); // Deep Navy
  } else {
    var firstCell = sheet.getRange(1, 1).getValue();
    if (!firstCell) {
      sheet.getRange(1, 1, 1, LEADS_MARKETING_SCHEMA.length).setValues([LEADS_MARKETING_SCHEMA]);
      formatHeaderRow_(sheet, LEADS_MARKETING_SCHEMA.length, "#1E3A8A");
    }
  }
  return sheet;
}

/**
 * Tiếp nhận Lead, lưu vào Google Sheet & bắn Email thông báo cho Coach Chuyên
 */
function handleCaptureLeadV2_(payload, ss) {
  if (!ss) ss = getSpreadsheetV2_();
  var sheet = ensureLeadsMarketingSheetV2_(ss);

  var fullName = String(payload.fullName || payload.name || "").trim();
  var phone = String(payload.phone || "").trim();
  var email = String(payload.email || "").trim().toLowerCase();
  var companyName = String(payload.companyName || payload.company || payload.organization || "Chưa cung cấp").trim();
  var workforceScale = String(payload.workforceScale || payload.scale || "100 - 300 lao động").trim();
  var bottleneck = String(payload.bottleneck || payload.note || payload.purpose || "Khảo sát AI Workforce Blueprint & Chuẩn VWW").trim();
  var source = String(payload.source || "LANDING_AI_BLUEPRINT_MODAL").trim();

  if (!fullName || !phone) {
    return {
      success: false,
      error: "Họ tên và Số điện thoại là thông tin bắt buộc."
    };
  }

  // Chuẩn hóa số điện thoại
  var cleanPhone = phone.replace(/[^\d+]/g, "");
  if (cleanPhone.startsWith("0")) {
    cleanPhone = "+84" + cleanPhone.substring(1);
  }

  var now = new Date();
  var nowFormatted = Utilities.formatDate(now, "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
  var datePrefix = Utilities.formatDate(now, "Asia/Ho_Chi_Minh", "yyyyMMdd");

  // Sinh ID: LD-YYYYMMDD-XXXX
  var lastRow = sheet.getLastRow();
  var seq = String(Math.max(1, lastRow)).padStart(4, "0");
  var leadId = "LD-" + datePrefix + "-" + seq;

  // Trạng thái bắn email
  var emailAlertStatus = "CHƯA GỬI";
  var adminEmail = V2_CONFIG.SUPER_ADMIN_EMAIL || "coach.chuyen@gmail.com";

  // 1. Gửi email thông báo tức thời cho Coach Chuyên
  try {
    var rawPhone = phone.replace(/[^\d]/g, "");
    var zaloLink = "https://zalo.me/" + (rawPhone.startsWith("84") ? "0" + rawPhone.substring(2) : rawPhone);
    var sheetUrl = ss ? ss.getUrl() : "https://docs.google.com/spreadsheets/d/" + V2_CONFIG.SPREADSHEET_ID;

    var emailSubject = "🚀 [FCS LEAD MỚI] " + fullName + " (" + companyName + ") - " + workforceScale;
    
    var emailBodyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #334155;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0 0 6px 0; font-size: 20px; font-weight: 900; letter-spacing: -0.5px;">
            FCS AI WORKFORCE OS — KHÁCH HÀNG TIỀM NĂNG MỚI
          </h1>
          <p style="color: #bfdbfe; margin: 0; font-size: 13px;">
            Đăng ký nhận AI Workforce Blueprint & Tư vấn tối ưu chuẩn VWW
          </p>
        </div>

        <div style="padding: 24px;">
          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #94a3b8; width: 140px;">Mã Lead:</td>
                <td style="padding: 8px 0; color: #38bdf8; font-weight: bold; font-family: monospace;">${leadId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Họ và Tên:</td>
                <td style="padding: 8px 0; color: #ffffff; font-weight: bold; font-size: 15px;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Số điện thoại:</td>
                <td style="padding: 8px 0;">
                  <a href="tel:${phone}" style="color: #4ade80; font-weight: bold; text-decoration: none;">${phone}</a>
                  &nbsp;•&nbsp;
                  <a href="${zaloLink}" target="_blank" style="display: inline-block; padding: 3px 10px; background: #0284c7; color: white; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: bold;">
                    💬 Mở Chat Zalo
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Email:</td>
                <td style="padding: 8px 0; color: #f1f5f9;">${email || "Chưa cung cấp"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Doanh nghiệp:</td>
                <td style="padding: 8px 0; color: #f1f5f9; font-weight: bold;">${companyName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Quy mô lao động:</td>
                <td style="padding: 8px 0; color: #fbbf24; font-weight: bold;">${workforceScale}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Thời gian:</td>
                <td style="padding: 8px 0; color: #cbd5e1;">${nowFormatted}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Nguồn tiếp cận:</td>
                <td style="padding: 8px 0; color: #cbd5e1;">${source}</td>
              </tr>
            </table>
          </div>

          <div style="background: #1e293b; border-left: 4px solid #f59e0b; border-radius: 0 12px 12px 0; padding: 14px 18px; margin-bottom: 24px;">
            <div style="font-size: 12px; font-weight: bold; color: #fbbf24; text-transform: uppercase; margin-bottom: 4px;">
              Điểm nghẽn / Nhu cầu khách hàng:
            </div>
            <div style="font-size: 13px; color: #e2e8f0; line-height: 1.5;">
              ${bottleneck}
            </div>
          </div>

          <div style="text-align: center; margin-top: 10px;">
            <a href="${zaloLink}" target="_blank" style="display: inline-block; padding: 12px 24px; background: #22c55e; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 10px; margin-right: 10px; box-shadow: 0 4px 14px rgba(34, 197, 94, 0.4);">
              📞 Kết Nối Zalo Ngay
            </a>
            <a href="${sheetUrl}" target="_blank" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 10px; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);">
              📊 Mở Google Sheet Leads MKT
            </a>
          </div>
        </div>

        <div style="background: #090d16; padding: 14px 24px; text-align: center; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b;">
          FCS AI WORKFORCE OS V2 • Hệ Thống Doanh Thu Tự Động & Kiểm Định Chuẩn VWW
        </div>
      </div>
    `;

    MailApp.sendEmail({
      to: adminEmail,
      subject: emailSubject,
      htmlBody: emailBodyHtml
    });

    emailAlertStatus = "ĐÃ BẮN MAIL (" + adminEmail + ")";
  } catch (mailErr) {
    Logger.log("Lỗi gửi email cho Coach Chuyên: " + mailErr.message);
    emailAlertStatus = "LỖI GỬI MAIL: " + mailErr.message;
  }

  // 2. Gửi email xác nhận cho khách hàng nếu có email
  if (email && email.indexOf("@") !== -1 && email.indexOf("lead.fcs.vn") === -1) {
    try {
      var clientSubject = "[FCS AI Workforce] Xác nhận đăng ký AI Workforce Blueprint & Lộ trình VWW";
      var clientBodyHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #0f172a; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
          <div style="background: #1e40af; padding: 24px; text-align: center; color: white;">
            <h2 style="margin: 0 0 6px 0; font-size: 20px;">FCS AI WORKFORCE OS</h2>
            <p style="margin: 0; font-size: 13px; color: #bfdbfe;">Hệ thống AI quản lý & vận hành cung ứng lao động</p>
          </div>
          <div style="padding: 24px; font-size: 14px; line-height: 1.6; color: #334155;">
            <p>Kính gửi <strong>${fullName}</strong>,</p>
            <p>Cảm ơn anh/chị đã quan tâm và gửi yêu cầu đăng ký nhận <strong>AI Workforce Blueprint & Tư vấn 1:1</strong> cho doanh nghiệp <strong>${companyName}</strong>.</p>
            <p>Hệ thống FCS đã tiếp nhận thành công thông tin với mã yêu cầu: <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #1e40af;">${leadId}</code>.</p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin: 18px 0;">
              <strong>Bước tiếp theo:</strong>
              <ul style="margin: 8px 0 0 0; padding-left: 20px;">
                <li>Chuyên gia tư vấn trưởng của FCS (Coach Chuyên) sẽ kết nối qua Số điện thoại/Zalo <strong>${phone}</strong> trong vòng 24 giờ làm việc.</li>
                <li>Gửi tặng bộ tài liệu phân tích luồng vận hành chuẩn VWW và kịch bản 19 Level Sale tối ưu tỷ lệ đi làm xưởng.</li>
              </ul>
            </div>
            <p>Trân trọng,<br><strong>Ban Điều Hành FCS AI Workforce</strong><br>Email: coach.chuyen@gmail.com</p>
          </div>
        </div>
      `;

      MailApp.sendEmail({
        to: email,
        subject: clientSubject,
        htmlBody: clientBodyHtml
      });
    } catch (clientMailErr) {
      Logger.log("Lỗi gửi email xác nhận cho khách: " + clientMailErr.message);
    }
  }

  // 3. Ghi dữ liệu vào Tab 04_LEADS_MARKETING
  var rowData = [
    leadId,
    nowFormatted,
    fullName,
    phone,
    email,
    companyName,
    workforceScale,
    bottleneck,
    source,
    "MỚI (NEW)",
    emailAlertStatus,
    "Đăng ký qua Landing Page"
  ];

  sheet.appendRow(rowData);
  SpreadsheetApp.flush();

  // 4. Ghi nhật ký vào AUDIT LOG
  try {
    appendAuditLogV2_(
      "LEAD_CAPTURE",
      "GUEST",
      leadId,
      "Tiếp nhận lead mới: " + fullName + " (" + phone + ") - " + companyName,
      ss
    );
  } catch(e) {}

  // Bump version để tự động invalidate cache
  CacheHelper_.bumpDataVersion(payload.tenantId || payload.requestedTenantId);

  return {
    success: true,
    data: {
      leadId: leadId,
      fullName: fullName,
      phone: phone,
      email: email,
      companyName: companyName,
      workforceScale: workforceScale,
      emailSentToAdmin: emailAlertStatus.indexOf("ĐÃ BẮN MAIL") !== -1,
      savedToSheet: true,
      sheetName: V2_CONFIG.TAB_LEADS || "04_LEADS_MARKETING",
      message: "Đăng ký thành công! Thông tin đã được chuyển thẳng tới Coach Chuyên và lưu trữ vào Google Sheet."
    }
  };
}

/**
 * Lấy danh sách Leads phục vụ Dashboard quản trị
 */
function handleListLeadsV2_(params, ss) {
  if (!ss) ss = getSpreadsheetV2_();
  var sheet = ensureLeadsMarketingSheetV2_(ss);
  var lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return {
      success: true,
      data: [],
      total: 0
    };
  }

  var data = sheet.getRange(2, 1, lastRow - 1, LEADS_MARKETING_SCHEMA.length).getValues();
  var leads = [];

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue;
    leads.push({
      leadId: row[0],
      createdAt: row[1],
      fullName: row[2],
      phone: row[3],
      email: row[4],
      companyName: row[5],
      workforceScale: row[6],
      bottleneck: row[7],
      source: row[8],
      nurtureStatus: row[9],
      emailAlertStatus: row[10],
      adminNotes: row[11]
    });
  }

  // Sắp xếp mới nhất lên đầu
  leads.reverse();

  return {
    success: true,
    data: leads,
    total: leads.length
  };
}
