/**
 * FCS AI WORKFORCE OS CRM V2 — 6-STAGE STRATEGIC ROADMAP AUDIT VIA GPT-6 ASTRA
 * Executed via 9Router AI Gateway (Local Proxy Port 20128) using Streaming
 */

import fs from 'fs';
import path from 'path';

const API_KEY = 'sk-7c1f91635f52dc7e-fcsworkforce-2026';
const ENDPOINT = 'http://localhost:20128/v1/chat/completions';

// Prioritize cx/gpt-6-astra, with combo fcs-astra as fallback
const PRIMARY_MODEL = 'cx/gpt-6-astra';
const FALLBACK_MODEL = 'fcs-astra';

async function streamAudit(modelToUse) {
  console.log('========================================================================');
  console.log(`🤖 FCS AI WORKFORCE OS — MASTER 6-STAGE ROADMAP AUDIT VIA ${modelToUse}`);
  console.log('🔗 Gateway Endpoint:', ENDPOINT);
  console.log('👑 Target Model:', modelToUse);
  console.log('========================================================================\n');

  const systemPrompt = `Bạn là Trưởng Kiến Trúc Sư Phần Mềm & Chuyên Gia QA Hệ Thống Cấp Cao (20+ năm kinh nghiệm) trực thuộc Ban Điều Hành FCS AI WORKFORCE OS.
Tôn chỉ tối cao: CẤM SUY DIỄN ĐOÁN MÒ — REAL DATA FIRST — ZERO MOCK IN PRODUCTION.
Nhiệm vụ: Thực hiện phiên AUDIT CHUYÊN SÂU toàn bộ 6 Giai Đoạn phát triển CRM V2 theo Đặc tả Nghiệp vụ BA 1.5 (BA_1.5_CRM_Quan_ly_Data_Tuyen_dung_FCS_Attendance), đối chiếu trực tiếp với mã nguồn và giao diện thực tế của hệ thống. Chỉ rõ các lỗi (bugs), lỗ hổng logic, và đề xuất mã nguồn cụ thể để nâng cấp chuẩn Enterprise SaaS.`;

  const userPrompt = `Hãy thực hiện AUDIT TOÀN DIỆN LỘ TRÌNH 6 GIAI ĐOẠN CỦA FCS AI WORKFORCE CRM V2:

--- BỐI CẢNH & HIỆN TRẠNG KỸ THUẬT ---
1. Hạ tầng & Nền tảng:
   - Frontend: React 18, TypeScript, TailwindCSS, Vite 6, Cloudflare Pages (fcs.breaths.live).
   - Backend: Google Apps Script Web App V2 Modular kết nối Google Spreadsheet (FCS_V2_WORKFORCE_CRM_MASTER - ID: 1YAVNiPtAiYrxEThvIgWuR0PAHJbDCDqrXCz5SNwrxXE).
   - AI Gateway: 9Router Proxy (http://localhost:20128/v1), API key sk-7c1f91635f52dc7e-fcsworkforce-2026, combo fcs-astra (cx/gpt-6-astra).
   - Security & RBAC: Firebase Auth + Custom Claims (PLATFORM_SUPER_ADMIN, TENANT_ADMIN, TENANT_MANAGER, RECRUITER, VIEWER). Đăng ký mới tự do mặc định là VIEWER (Read-Only), cấm lộ password công khai.

2. Chi tiết 6 Giai đoạn theo BA 1.5:
   - GIAI ĐOẠN 1: Master Architecture & Real Data Foundation
     * Hồ sơ Lao động 34 cột chuẩn hóa VNeID.
     * Clean Slate V2 không mock data.
     * Đồng bộ 2 chiều Web App - Google Sheets (v2.workers.list, v2.worker.get, sync ngay lập tức & hẹn giờ).
     * Bảng Excel Grid toàn màn hình đa chế độ.
   - GIAI ĐOẠN 2: AI Talent CRM & Worker Care (Onboarding 1-3-7 ngày & Re-activation Zalo 0đ)
     * Tab 9 Worker 360: Chăm sóc AI 1-3-7 ngày (Ngày 1: Nhận phòng & di chuyển; Ngày 3: Thích nghi dây chuyền; Ngày 7: Vượt qua thử việc).
     * Nút bấm chat trực tiếp Zalo (https://zalo.me/{phone}) và copy kịch bản chăm sóc chuẩn tiếng Việt.
     * 4 trạng thái cảm xúc lao động (Vui vẻ, Bình thường, Lo lắng, Nguy cơ bỏ việc).
     * Modal Tái Kích Hoạt Zalo 0đ cho lao động nghỉ ngang (L3.1 QUIT) hoặc hết thời gian phí (L4 FEE_EXPIRED).
   - GIAI ĐOẠN 3: 19 Level Sale CRM Pipeline & Auto-Conversion
     * 5 Funnel Groups: LEAD_INTAKE, SALE_NURTURE, INTERVIEW, EMPLOYMENT, SETTLEMENT.
     * 19 mã Level Sale chi tiết: C3, C3.1, C3.2, L1, L1.1, L1.2, L1.3, L1.4, L1.5, L1.6, L1.8, L2, L2.1, L2.2, L2.3, L3, L3.1, L3.2, L4.
     * Kanban Board kéo thả Deal & Funnel View tỷ lệ chuyển đổi.
     * Modal MoveDealStageModal kèm Audit Trail ghi nhận lý do và trường ngày phỏng vấn (L2), ngày đi làm (L3).
   - GIAI ĐOẠN 4: Quản lý 29 Đối tác Nhà máy KCN & SLA Hợp đồng
     * Danh mục 29 Nhà máy / Đối tác tuyển dụng (WNC, Foxconn, Luxshare, Goertek, Fuyu, Biel...).
     * Thiết lập SLA tính phí: Đơn giá phí (VND), số ngày công tối thiểu để hưởng phí (15 ngày, 30 ngày, 26 ngày).
     * Cảnh báo tự động khi lao động đạt mốc ngày công hưởng phí.
   - GIAI ĐOẠN 5: Tách biệt Dòng tiền & Quy trình Phê duyệt 4 Cấp
     * Tách bạch 2 dòng tiền:
       1. Quỹ Thưởng Người Lao Động (Worker Reward - WNC 2.000.000đ/tháng hỗ trợ công nhân).
       2. Hoa hồng môi giới (Commission - VEN 12.000đ/giờ công nhân làm việc, CTV 500.000đ/26 ngày công).
       CẤM TUYỆT ĐỐI GỘP CHUNG HOA HỒNG VÀ THƯỞNG CÔNG NHÂN.
     * Quy trình duyệt 4 cấp: Lead Sale -> Trưởng phòng (Manager) -> Kế toán (Accountant) -> Giám đốc (Director).
   - GIAI ĐOẠN 6: Nghiệm thu E2E & Bàn giao V2 Clean Slate
     * Kiểm thử trọn vẹn Golden Flow: Worker Intake -> Interview -> Assigned -> Start Work -> Attendance -> VWW -> Settlement.
     * Báo cáo nghiệm thu hoàn chỉnh FCS_V2_CLIENT_ACCEPTANCE_AND_HANDOVER_REPORT.md.

--- YÊU CẦU TRẢ LỜI TỪ CHUYÊN GIA ---
Hãy xuất bản BÁO CÁO AUDIT THEO CẤU TRÚC SAU:
1. TỔNG QUAN TÌNH TRẠNG KIẾN TRÚC & ĐIỂM CHẤM (0-100/100).
2. PHÂN TÍCH ĐÁNH GIÁ CHI TIẾT THEO TỪNG GIAI ĐOẠN (GIAI ĐOẠN 1 ĐẾN GIAI ĐOẠN 6):
   - ĐÃ ĐẠT (What works well)
   - LỖ HỔNG / LỖI TIỀM ẨN / GAPS (Bugs & Architectural Risks)
   - GIẢI PHÁP NÂNG CẤP & FIX LỖI MÃ NGUỒN CỤ THỂ
3. MA TRẬN HÀNH ĐỘNG KHẮC PHỤC (ACTIONABLE MATRIX): Tên File - Lỗi/Nâng cấp - Mức độ Ưu tiên (P0/P1/P2).
4. KẾ HOẠCH BÀN GIAO & TRIỂN KHAI TIẾP THEO.`;

  const startTime = Date.now();
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      signal: AbortSignal.timeout(90000),
      body: JSON.stringify({
        model: modelToUse,
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 3500,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`HTTP ${response.status}: ${err}`);
    }

    console.log(`📡 Đã mở luồng Stream thành công từ 9Router! Bắt đầu nhận dữ liệu...`);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = '';
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (trimmed.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            const delta = parsed.choices?.[0]?.delta?.content || '';
            if (delta) {
              accumulatedText += delta;
              process.stdout.write(delta);
            }
          } catch (e) {
            // ignore partial JSON parse errors in stream
          }
        }
      }
    }

    const elapsed = Date.now() - startTime;
    console.log(`\n\n========================================================================`);
    console.log(`✅ HOÀN TẤT STREAM AUDIT (${elapsed}ms, ${accumulatedText.length} ký tự)`);
    console.log(`========================================================================\n`);

    const reportPath = path.join(process.cwd(), 'FCS_V2_6_STAGE_ROADMAP_AUDIT_GPT6_ASTRA.md');
    fs.writeFileSync(reportPath, accumulatedText, 'utf8');
    console.log(`📄 Báo cáo đã được lưu trữ an toàn tại: ${reportPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Lỗi với model ${modelToUse}:`, error.message);
    return false;
  }
}

async function main() {
  const ok = await streamAudit(PRIMARY_MODEL);
  if (!ok) {
    console.log(`\n⚠️ Thử lại với Combo fcs-astra tự động fallback...`);
    await streamAudit(FALLBACK_MODEL);
  }
}

main();
