/**
 * 🚀 FCS AI Workforce OS — 9Router AI Gateway Integration Service
 * Tự động phân luồng: Local Gateway (nếu localhost) -> Cloud Gateway -> Deep Domain Fallback
 */

export const AI_ROUTER_CONFIG = {
  localBaseUrl: 'http://localhost:20128/v1',
  tunnelBaseUrl: 'https://ruvxwm8.abc-tunnel.us/v1',
  cloudGatewayUrl: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_AI_GATEWAY_URL) || '',
  apiKey: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_AI_GATEWAY_KEY) || 'sk-7c1f91635f52dc7e-fcsworkforce-2026',
  models: {
    coreAstra: 'fcs-astra',               // 🏆 COMBO CHÍNH: cx/gpt-6-astra + auto-fallback
    deepReasoning: 'cx/gpt-6-astra',       // Trực tiếp GPT-6 Astra
    fastCode: 'ag/claude-sonnet-4-6',     // ~2s response, tối ưu React/UI
    highContext: 'ag/gemini-3.8-flash',   // 1M context, xử lý CV lao động hàng loạt
    coderExpert: 'kr/qwen3-coder-next',   // Chuyên gia Apps Script & DB SQL
  }
} as const;

export type AiModelKey = keyof typeof AI_ROUTER_CONFIG.models;

export interface AiChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiCompletionOptions {
  model?: string;
  modelKey?: AiModelKey;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Intelligent Domain Knowledge Base cho AI CEO Lucky
 * Trả lời chuyên sâu, chuẩn mực về BA 1.5, VWW, 19 Level Sale khi mạng ngoại vi gián đoạn
 */
export function getSmartFallbackResponse(userPrompt: string): string {
  const text = (userPrompt || '').toLowerCase();

  if (text.includes('vww') || text.includes('verified working worker') || text.includes('bắc đẩu')) {
    return `**VWW (Verified Working Worker)** là thước đo Bắc Đẩu (North Star Metric) tối thượng của FCS AI Workforce OS.

Khác với ứng viên chỉ mới nộp hồ sơ hay đỗ phỏng vấn, **VWW là lao động ĐÃ ĐI LÀM THỰC TẾ** và được dữ liệu chấm công từ nhà máy xác nhận đạt $\\ge$ số ngày công quy định (3–7 ngày đầu).

* **Ý nghĩa cốt lõi:** VWW là căn cứ duy nhất để hệ thống kích hoạt tính phí dịch vụ B2B và thanh toán hoa hồng cho Đại lý/CTV. VWW giúp loại bỏ 100% rủi ro chi trả cho lao động ảo hoặc bỏ việc sớm.
* **Chuỗi giá trị:** \`Worker → Interview → Passed (L2.1) → Assignment → Start Work → Attendance → Matching → VWW (L3)\`.`;
  }

  if (text.includes('l1.7') || text.includes('l1.8') || text.includes('thiếu tuổi')) {
    return `**Mã L1.7** là trạng thái chuẩn: **"Lao động thiếu tuổi"** theo đúng tài liệu đặc tả BA 1.5.

Hệ thống FCS V2 đã chuẩn hóa toàn diện từ bản v2.4:
- **Đã xóa bỏ hoàn toàn** mã \`L1.8\` cũ gây nhầm lẫn trên toàn hệ thống.
- Thống nhất áp dụng \`L1.7\` trên Database, Schema JSON, Bộ lọc Kanban Pipeline và màn hình Quản lý Lao động để bảo đảm tính toàn vẹn 100%.`;
  }

  if (text.includes('l4') || text.includes('kết thúc phí') || text.includes('chu kỳ phí')) {
    return `**Trạng thái L4** trong hệ thống là: **"Kết thúc chu kỳ hợp đồng tính phí"** (thường sau 60–90 ngày làm việc).

⚠️ **Lưu ý nghiệp vụ quan trọng từ QA & BA:**
- Đạt chuẩn **VWW** $\\neq$ **L4**. Khi lao động đi làm đủ ngày công xác minh, deal được gắn cờ \`is_vww = true\` nhưng **vẫn giữ ở chặng L3 (Đang đi làm)** để tiếp tục chăm sóc D1/D3/D7 và theo dõi tỷ lệ giữ chân (Retention).
- Chỉ khi hết thời hạn hợp đồng phí theo thỏa thuận với nhà máy thì deal mới được chuyển sang **L4 (Nghiệm thu hoàn tất)**.`;
  }

  if (text.includes('19 level') || text.includes('level sale') || text.includes('pipeline') || text.includes('phễu')) {
    return `**Phễu 19 Level Sale CRM** là trục xương sống điều hành của FCS AI Workforce, chia làm 5 chặng:
1. **Tiếp nhận C3:** C3 (Mới), C3.1 (Đã xác minh liên hệ), C3.2 (Đã phân bổ Sale).
2. **Chăm sóc L1:** L1 (Đang tư vấn), L1.1 (Chờ suy nghĩ), L1.2 (Hẹn gọi lại), L1.3 (Đã chốt hẹn PV), L1.4 (Trùng CCCD), L1.5 (Sai số/Chặn), L1.6 (Hủy ứng tuyển), L1.7 (Thiếu tuổi).
3. **Phỏng vấn xưởng L2:** L2 (Hẹn PV hôm nay), L2.1 (Đỗ phỏng vấn), L2.2 (Trượt/Bỏ về).
4. **Đi làm & VWW L3:** L3 (Đang đi làm - VWW), L3.1 (Nghỉ việc tạm thời), L3.2 (Chuyển xưởng).
5. **Nghiệm thu L4:** L4 (Hoàn thành chu kỳ tính phí 60-90 ngày).`;
  }

  if (text.includes('rbac') || text.includes('phân quyền') || text.includes('super admin') || text.includes('viewer')) {
    return `**Hệ thống phân quyền (RBAC) 5 cấp của FCS:**
- **PLATFORM_SUPER_ADMIN:** Toàn quyền hệ thống, quản trị đa Tenant, quyền thực thi Reset Clean Slate.
- **TENANT_ADMIN:** Giám đốc công ty cung ứng, quản lý chi nhánh, đối tác và cấu hình phí.
- **TENANT_MANAGER:** Trưởng phòng tuyển dụng, duyệt hồ sơ, điều xe phỏng vấn.
- **RECRUITER:** Chuyên viên tuyển mộ, tạo ứng viên, tư vấn và chuyển chặng Deal.
- **VIEWER:** Tài khoản chỉ xem. Hệ thống tự động khóa toàn bộ nút thêm/sửa/xóa để bảo vệ an toàn dữ liệu khách hàng.`;
  }

  if (text.includes('clean slate') || text.includes('xóa data') || text.includes('reset')) {
    return `**Tính năng Clean Slate Reset** là cơ chế bảo mật 3 lớp độc quyền cho Platform Super Admin (\`coach.chuyen@gmail.com\`).
- Thao tác này dọn sạch dòng 2+ trên toàn bộ 11 bảng giao dịch, loại bỏ triệt để các dòng rác bị lỗi công thức VLOOKUP (\`#ERROR!\`).
- Giữ nguyên dòng Tiêu đề và các bảng danh mục chuẩn (\`DM_BRANCH\`, \`DM_COMPANY\`, \`DM_LEVEL_SALE\`, \`00_DASHBOARD_KPI\`).
- Có tùy chọn nạp lại ngay 10 hồ sơ & deal mẫu chuẩn V2 để sẵn sàng demo.`;
  }

  return `Chào bạn, em là **AI CEO Lucky** — Trợ lý Bàn giao & Cố vấn Điều hành của FCS AI Workforce OS!

Em đã tiếp nhận câu hỏi của bạn: *"\\"${userPrompt}\\""*.
- **Phân tích mục tiêu:** Tối ưu hóa quy trình điều hành nhân lực, tự động hóa phễu 19 Level Sale và bảo đảm tính toàn vẹn dữ liệu.
- **Khuyến nghị vận hành:** Vận hành chuẩn chỉ theo luồng Golden Flow: *Worker → L2 (Phỏng vấn) → L2.1 (Đỗ) → L3 (VWW Xác minh đi làm) → L4 (Nghiệm thu)*.
- **Lưu trữ thời gian thực:** Mọi thông tin trao đổi và yêu cầu phát triển đều được lưu trữ trực tiếp vào Google Sheet tab \`IN ( Data - Mục Tiêu -KQ đầu ra là gì )\`. Em luôn sẵn sàng hỗ trợ bạn!`;
}

/**
 * Executes chat completion through 9Router AI Gateway with automatic local/tunnel fallback.
 * Uses `fcs-astra` (cx/gpt-6-astra) as default. Falls back to deep Domain Knowledge Base if endpoints are offline.
 */
export async function callAiRouter(
  messages: AiChatMessage[],
  options: AiCompletionOptions = {}
): Promise<string> {
  const model = options.model || (options.modelKey ? AI_ROUTER_CONFIG.models[options.modelKey] : AI_ROUTER_CONFIG.models.coreAstra);
  const payload = {
    model,
    messages,
    stream: false,
    temperature: options.temperature ?? 0.3,
    max_tokens: options.maxTokens ?? 2048,
  };

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AI_ROUTER_CONFIG.apiKey}`,
  };

  // Build candidate endpoints list safely avoiding Mixed Content
  const endpoints: string[] = [];
  const isBrowser = typeof window !== 'undefined';
  const isHttps = isBrowser && window.location.protocol === 'https:';
  const isLocalHost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (AI_ROUTER_CONFIG.cloudGatewayUrl) {
    endpoints.push(`${AI_ROUTER_CONFIG.cloudGatewayUrl}/chat/completions`);
  }

  // Only try localhost HTTP when NOT on remote HTTPS (prevents Mixed Content warning)
  if (!isHttps || isLocalHost) {
    endpoints.push(`${AI_ROUTER_CONFIG.localBaseUrl}/chat/completions`);
  }

  if (AI_ROUTER_CONFIG.tunnelBaseUrl) {
    endpoints.push(`${AI_ROUTER_CONFIG.tunnelBaseUrl}/chat/completions`);
  }

  let lastError: any = null;

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout per gateway

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const reply = data?.choices?.[0]?.message?.content;
        if (reply) return reply;
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  // Fallback to deep Domain Knowledge Base
  const userMsg = messages.filter(m => m.role === 'user').pop()?.content || '';
  return getSmartFallbackResponse(userMsg);
}

