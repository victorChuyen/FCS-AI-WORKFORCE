/**
 * FCS AI WORKFORCE OS CRM V2 — AUDIT & PROPOSAL VIA GPT-6 ASTRA (STREAMING)
 * Executed via 9Router AI Gateway (Local Proxy Port 20128)
 */

import fs from 'fs';
import path from 'path';

const API_KEY = 'sk-7c1f91635f52dc7e-fcsworkforce-2026';
const ENDPOINT = 'http://localhost:20128/v1/chat/completions';
const PRIMARY_MODEL = 'cx/gpt-6-astra';
const FALLBACK_MODEL = 'fcs-astra';

async function streamPrompt(modelToUse) {
  console.log('========================================================================');
  console.log(`🤖 FCS AI WORKFORCE OS — AUDIT & ACTIONABLE FIX PROPOSAL VIA ${modelToUse}`);
  console.log('🔗 Gateway Endpoint:', ENDPOINT);
  console.log('========================================================================\n');

  const systemPrompt = `Bạn là Trưởng Kiến Trúc Sư Phần Mềm (Software Architect) & Giám Đốc Kỹ Thuật (CTO) của FCS AI WORKFORCE OS V2.
Tôn chỉ tối cao: REAL DATA FIRST — ZERO MOCK DATA — TIÊU CHUẨN DOANH NGHIỆP SAAS.
Nhiệm vụ:
1. Đọc và phân tích hiện trạng mã nguồn của FCS AI WORKFORCE V2 (MoveDealStageModal.tsx, dealApi.ts, handleMoveStageV2_ trong Google Apps Script).
2. Phát hiện các lỗi logic cốt tử (VWW gán sai cấp độ, thiếu đồng bộ sang 05_PIPELINE_EVENTS, thiếu cập nhật trạng thái lao động 01_MASTER_WORKERS).
3. Đề xuất bản vá mã nguồn chi tiết, chuẩn xác, sẵn sàng triển khai ngay lập tức cho cả Backend (Code.gs) và Frontend.
4. Đưa ra lộ trình làm tiếp Giai đoạn tiếp theo (Golden Flow & Worker 360 Care 1-3-7).`;

  const userPrompt = `Anh Victor Chuyen yêu cầu bạn thực hiện phiên AUDIT & ĐỀ XUẤT FIX LỖI NÂNG CẤP LÀM TIẾP GIAI ĐOẠN.

--- HIỆN TRẠNG DỰ ÁN FCS V2 (NGÀY 18/09/2026) ---
1. Google Sheets Master: FCS_V2_WORKFORCE_CRM_MASTER (ID: 1YAVNiPtAiYrxEThvIgWuR0PAHJbDCDqrXCz5SNwrxXE)
   - Đã nạp 10 hồ sơ thực tế vào 01_MASTER_WORKERS (WK-T001 -> WK-T010).
   - Đã nạp 10 Deals thực tế vào 02_CRM_DEALS_2026 (DL-2026-T001 -> DL-2026-T010).
   - Đã khởi tạo 7 Sheets P0 cốt lõi: 05_PIPELINE_EVENTS, 06_INTERVIEWS, 07_ASSIGNMENTS, 08_ATTENDANCE_RAW, 09_ATTENDANCE, 10_MATCHING_REVIEW, 11_ACTION_QUEUE.

2. Mã nguồn Backend hiện tại (handleMoveStageV2_):
   - Đang tìm Deal trong 02_CRM_DEALS_2026, cập nhật level_sale_status.
   - Lỗi 1: Chỉ cập nhật is_vww khi level === 'L4', trong khi North Star Metric của dự án là L3 (VWW - Bắt đầu đi làm / Xác minh làm việc).
   - Lỗi 2: Chỉ ghi vào 03_AUDIT_LOG, HOÀN TOÀN CHƯA GHI VÀO 05_PIPELINE_EVENTS (bảng sự kiện phễu để tính hoa hồng và theo dõi hành trình chuyển đổi).
   - Lỗi 3: Không tự động đồng bộ trạng thái của Lao động trong 01_MASTER_WORKERS khi Deal chuyển trạng thái (VD: Deal L2.1 Đỗ PV -> Worker PASSED; Deal L3 Đi làm -> Worker WORKING & isVerifiedWorking = TRUE; Deal L3.1 Nghỉ việc -> Worker QUIT).
   - Lỗi 4: Không cập nhật actual_work_status, start_date, interview_result trên Deal.

3. Frontend (MoveDealStageModal.tsx & dealApi.ts):
   - Modal đã có FSM validation (Finite State Machine).
   - Cần tối ưu để Backend tự xử lý Transactional Integrity khi move stage (tự cập nhật deal, tự cập nhật worker, tự ghi pipeline event).

--- YÊU CẦU ĐỀ XUẤT & THIẾT KẾ CỤ THỂ ---
Hãy xuất bản Báo Cáo & Mã Nguồn Nâng Cấp:
1. Viết code hoàn chỉnh cho hàm \`handleMoveStageV2_\` (Google Apps Script):
   - Cập nhật Deal: level_sale_status, actual_work_status, start_date/interview_date, is_vww (nếu L3/L3.2/L4 -> true), notes, updated_at, updated_by.
   - Ghi event vào sheet \`05_PIPELINE_EVENTS\` (cột: event_id, deal_id, worker_id, from_stage, to_stage, event_type, actor_email, trigger_source, payload_json, created_at).
   - Tự động cập nhật hồ sơ tương ứng trong sheet \`01_MASTER_WORKERS\` (đồng bộ trạng thái PASSED nếu L2.1, WORKING nếu L3, QUIT nếu L3.1).
   - Ghi audit log vào \`03_AUDIT_LOG\`.
2. Tối ưu Frontend \`MoveDealStageModal.tsx\` & \`dealApi.ts\`.
3. Kế hoạch hành động cụ thể để hoàn thiện Giai đoạn tiếp theo (Golden Flow Test & Worker 360 Onboarding Care 1-3-7).`;

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      signal: AbortSignal.timeout(120000),
      body: JSON.stringify({
        model: modelToUse,
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 3500
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    console.log(`📡 Đang nhận luồng phản hồi từ ${modelToUse}...`);
    const reader = res.body.getReader();
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
          } catch (e) {}
        }
      }
    }

    console.log('\n\n========================================================================');
    console.log(`✅ HOÀN TẤT STREAM AUDIT TỪ ${modelToUse} (${accumulatedText.length} ký tự)`);
    console.log('========================================================================\n');

    const outFile = path.join(process.cwd(), 'scripts', 'astra_audit_proposal.md');
    fs.writeFileSync(outFile, `# ĐỀ XUẤT NÂNG CẤP & FIX LỖI TỪ ${modelToUse}\n\n**Thời gian:** ${new Date().toISOString()}\n\n` + accumulatedText, 'utf8');
    console.log(`💾 Đã lưu đề xuất vào: ${outFile}`);
    return true;
  } catch (err) {
    console.error(`❌ Lỗi với model ${modelToUse}:`, err.message);
    return false;
  }
}

async function main() {
  const ok = await streamPrompt(PRIMARY_MODEL);
  if (!ok) {
    console.log(`\n⚠️ Thử lại với Combo fcs-astra...`);
    await streamPrompt(FALLBACK_MODEL);
  }
}

main();
