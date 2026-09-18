/**
 * FCS AI WORKFORCE OS CRM V2 — 6-STAGE ROADMAP AUDIT PART 2 (STAGES 2 - 6 + ACTION MATRIX)
 * Executed via 9Router AI Gateway (fcs-astra)
 */

import fs from 'fs';
import path from 'path';

const API_KEY = 'sk-7c1f91635f52dc7e-fcsworkforce-2026';
const ENDPOINT = 'http://localhost:20128/v1/chat/completions';
const MODEL = 'fcs-astra';

async function streamPart2() {
  console.log('📡 Đang tiếp tục Audit từ Giai đoạn 2 đến Giai đoạn 6 & Action Matrix...');

  const systemPrompt = `Bạn là Trưởng Kiến Trúc Sư Phần Mềm & Chuyên Gia QA Hệ Thống Cấp Cao (20+ năm kinh nghiệm) trực thuộc Ban Điều Hành FCS AI WORKFORCE OS.
Nhiệm vụ: Viết TIẾP phần 2 của Báo Cáo Audit Lộ Trình 6 Giai Đoạn CRM V2, tập trung sâu vào:
- GIAI ĐOẠN 2: AI Talent CRM & Worker Care 1-3-7 ngày & Re-activation Zalo 0đ.
- GIAI ĐOẠN 3: 19 Level Sale Pipeline Kanban & Funnel + Transition Matrix.
- GIAI ĐOẠN 4: Quản lý 29 Đối tác Nhà máy KCN & SLA Hợp đồng (WNC, Foxconn, Luxshare, Goertek...).
- GIAI ĐOẠN 5: Tách biệt Dòng tiền (Worker Reward vs Commission) & Quy trình duyệt 4 cấp (Lead Sale -> Manager -> Accountant -> Director).
- GIAI ĐOẠN 6: E2E Golden Flow & Nghiệm thu bàn giao V2 Clean Slate.
- MA TRẬN HÀNH ĐỘNG KHẮC PHỤC (File - Bug/Upgrade - Priority P0/P1/P2) & Kế hoạch triển khai ngay.
Viết cụ thể, chuyên sâu, kèm code mẫu TypeScript/GAS thực chiến.`;

  const userPrompt = `Hãy tiếp tục Báo cáo Audit từ GIAI ĐOẠN 2:
1. GIAI ĐOẠN 2: Đã đạt, Lỗ hổng (Scheduler, dedup, consent, trạng thái cảm xúc), Giải pháp code cụ thể.
2. GIAI ĐOẠN 3: Đã đạt, Lỗ hổng (Transition Matrix 19 Level, auto-conversion Deal -> Worker VWW), Giải pháp code.
3. GIAI ĐOẠN 4: Quản lý 29 Nhà máy & SLA Hợp đồng (WNC 2M sau 15/30 ngày công, cảnh báo SLA).
4. GIAI ĐOẠN 5: Tách biệt Dòng tiền (Quỹ Thưởng Công Nhân WNC 2M/tháng vs Hoa hồng VEN 12k/h hoặc CTV 500k/26 công) + Quy trình duyệt 4 cấp (Lead Sale -> Manager -> Accountant -> Director).
5. GIAI ĐOẠN 6: Nghiệm thu E2E & Checklist bàn giao.
6. MA TRẬN HÀNH ĐỘNG KHẮC PHỤC CHI TIẾT (File - Fix/Upgrade - P0/P1/P2).`;

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      signal: AbortSignal.timeout(90000),
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 3500,
      }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = '\n\n---\n\n';
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

    const reportPath = path.join(process.cwd(), 'FCS_V2_6_STAGE_ROADMAP_AUDIT_GPT6_ASTRA.md');
    fs.appendFileSync(reportPath, accumulatedText, 'utf8');
    console.log(`\n\n✅ Đã nối thành công Phần 2 vào: ${reportPath}`);
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
  }
}

streamPart2();
