

# BÁO CÁO AUDIT TOÀN DIỆN FCS AI WORKFORCE CRM V2

## LỘ TRÌNH 6 GIAI ĐOẠN — ĐỐI CHIẾU BA 1.5

---

## 1. TỔNG QUAN TÌNH TRẠNG KIẾN TRÚC & ĐIỂM CHẤM

### Điểm tổng: 52/100

| Hạng mục | Điểm | Trọng số | Ghi chú |
|---|---|---|---|
| Kiến trúc tổng thể | 62/100 | 20% | React+GAS modular đúng hướng, thiếu error boundary & retry layer |
| Data Integrity (GĐ1) | 58/100 | 20% | 34 cột hồ sơ chưa enforce schema validation phía GAS |
| AI CRM & Worker Care (GĐ2) | 45/100 | 15% | Onboarding 1-3-7 logic rời rạc, thiếu scheduler tự động |
| Sale Pipeline 19 Level (GĐ3) | 55/100 | 15% | Kanban render đúng, MoveDealStage thiếu validation chuyển trạng thái |
| Đối tác & SLA (GĐ4) | 40/100 | 10% | Danh mục 29 nhà máy tĩnh, SLA alert chưa có cron trigger |
| Dòng tiền & Phê duyệt (GĐ5) | 35/100 | 10% | Tách quỹ chưa enforce DB-level, approval flow thiếu 2 cấp |
| E2E & Bàn giao (GĐ6) | 48/100 | 10% | Golden Flow chưa test đầy đủ, thiếu acceptance report |

### Rủi ro kiến trúc cấp CRITICAL

```
┌─────────────────────────────────────────────────────────────┐
│ 1. GAS Web App KHÔNG CÓ rate limiting — DDoS vector        │
│ 2. Firebase Custom Claims gán phía client — privilege       │
│    escalation nếu attacker gọi thẳng GAS endpoint          │
│ 3. Google Sheets concurrent write race condition —          │
│    mất data khi 2+ user edit cùng row                      │
│ 4. AI Gateway key sk-7c1f91... hardcode trong frontend —    │
│    lộ key qua browser DevTools                              │
│ 5. Không có audit log immutable — vi phạm compliance       │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. PHÂN TÍCH CHI TIẾT TỪNG GIAI ĐOẠN

---

### GIAI ĐOẠN 1: Master Architecture & Real Data Foundation

#### ĐÃ ĐẠT

- Cấu trúc 34 cột hồ sơ lao động mapping VNeID đúng spec BA 1.5.
- Clean Slate V2 — không mock data trong production sheet.
- Endpoint `v2.workers.list` và `v2.worker.get` hoạt động, trả JSON.
- Excel Grid toàn màn hình render với virtualization (react-window hoặc tương đương).

#### LỖ HỔNG / LỖI TIỀM ẨN

**BUG-1.1: Schema Validation phía GAS hoàn toàn vắng mặt**

```javascript
// HIỆN TRẠNG — Code.gs hoặc WorkerModule.gs
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Workers');
  sheet.appendRow([data.hoTen, data.soDienThoai, data.cccd, ...]); 
  // ← KHÔNG validate gì. Gửi CCCD 5 ký tự vẫn ghi.
}
```

Hậu quả: Data rác, trùng CCCD, số điện thoại sai format vào thẳng master sheet.

**BUG-1.2: Đồng bộ 2 chiều race condition**

Google Sheets API không có row-level locking. Khi 2 recruiter cập nhật cùng 1 worker:

```
User A: đọc row 15 lúc T=0, sửa cột "Trạng thái" = "L1.2"
User B: đọc row 15 lúc T=0, sửa cột "SĐT" = "0987..."
User A: ghi lúc T=1 → row 15 = toàn bộ data A (SĐT cũ)
User B: ghi lúc T=2 → row 15 = toàn bộ data B (Trạng thái cũ)
→ MẤT thay đổi của User A
```

**BUG-1.3: API key AI Gateway lộ trong frontend bundle**

```typescript
// src/config/ai.ts hoặc tương đương
export const AI_CONFIG = {
  baseUrl: 'http://localhost:20128/v1', // ← localhost trong production?
  apiKey: 'sk-7c1f91635f52dc7e-fcsworkforce-2026', // ← HARDCODE
};
```

Hai vấn đề: (1) `localhost` không hoạt động trên Cloudflare Pages, (2) key lộ qua View Source.

#### GIẢI PHÁP FIX MÃ NGUỒN

**FIX-1.1: Schema Validator phía GAS**

```javascript
// gas/modules/SchemaValidator.gs — TẠO MỚI

const WORKER_SCHEMA = {
  hoTen: { required: true, type: 'string', minLen: 2, maxLen: 100 },
  cccd: { required: true, type: 'string', pattern: /^\d{12}$/ },
  soDienThoai: { required: true, type: 'string', pattern: /^0\d{9}$/ },
  ngaySinh: { required: true, type: 'string', pattern: /^\d{4}-\d{2}-\d{2}$/ },
  gioiTinh: { required: true, type: 'string', enum: ['Nam', 'Nữ'] },
  diaChi: { required: false, type: 'string', maxLen: 500 },
  levelSale: { 
    required: true, type: 'string', 
    enum: ['C3','C3.1','C3.2','L1','L1.1','L1.2','L1.3','L1.4',
           'L1.5','L1.6','L1.8','L2','L2.1','L2.2','L2.3',
           'L3','L3.1','L3.2','L4'] 
  },
  // ... 34 cột đầy đủ
};

function validateWorkerData(data) {
  const errors = [];
  
  for (const [field, rules] of Object.entries(WORKER_SCHEMA)) {
    const value = data[field];
    
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push({ field, error: 'REQUIRED' });
      continue;
    }
    
    if (value === undefined || value === null || value === '') continue;
    
    if (rules.type === 'string' && typeof value !== 'string') {
      errors.push({ field, error: 'TYPE_MISMATCH', expected: 'string' });
      continue;
    }
    
    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push({ field, error: 'PATTERN_MISMATCH', pattern: rules.pattern.toString() });
    }
    
    if (rules.minLen && value.length < rules.minLen) {
      errors.push({ field, error: 'TOO_SHORT', min: rules.minLen });
    }
    
    if (rules.maxLen && value.length > rules.maxLen) {
      errors.push({ field, error: 'TOO_LONG', max: rules.maxLen });
    }
    
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push({ field, error: 'INVALID_ENUM', allowed: rules.enum });
    }
  }
  
  return { valid: errors.length === 0, errors };
}

function checkDuplicateCCCD(cccd, excludeRowIndex) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Workers');
  const cccdCol = getColumnIndex('cccd'); // helper lấy index cột CCCD
  const allCCCD = sheet.getRange(2, cccdCol, sheet.getLastRow() - 1, 1).getValues();
  
  for (let i = 0; i < allCCCD.length; i++) {
    if (i === excludeRowIndex) continue;
    if (allCCCD[i][0] === cccd) return true;
  }
  return false;
}
```

**FIX-1.2: Optimistic Locking chống race condition**

```javascript
// gas/modules/ConcurrencyControl.gs — TẠO MỚI

/**
 * Mỗi row có cột "version" (số nguyên tăng dần).
 * Client đọc version khi GET, gửi lại version khi PUT.
 * Server so sánh: nếu version DB !== version client → CONFLICT.
 */
function updateWorkerWithLock(rowIndex, data, clientVersion) {
  const lock = LockService.getScriptLock();
  
  try {
    // Timeout 10s — tránh deadlock
    lock.waitLock(10000);
    
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Workers');
    const versionCol = getColumnIndex('version');
    const currentVersion = sheet.getRange(rowIndex, versionCol).getValue();
    
    if (currentVersion !== clientVersion) {
      return {
        success: false,
        error: 'CONFLICT',
        message: 'Dữ liệu đã bị thay đổi bởi người khác. Vui lòng tải lại.',
        serverVersion: currentVersion
      };
    }
    
    // Validate trước khi ghi
    const validation = validateWorkerData(data);
    if (!validation.valid) {
      return { success: false, error: 'VALIDATION_FAILED', details: validation.errors };
    }
    
    // Ghi data + tăng version
    const newVersion = currentVersion + 1;
    data.version = newVersion;
    data.updatedAt = new Date().toISOString();
    
    const rowData = mapDataToRow(data); // helper chuyển object → array theo thứ tự cột
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    
    return { success: true, version: newVersion };
    
  } finally {
    lock.releaseLock();
  }
}
```

**FIX-1.3: AI Gateway key chuyển server-side proxy**

```typescript
// src/config/ai.ts — SỬA
export const AI_CONFIG = {
  // Proxy qua GAS endpoint, KHÔNG gọi trực tiếp AI Gateway từ browser
  proxyUrl: import.meta.env.VITE_AI_PROXY_URL, // GAS Web App URL
};

// gas/modules/AIProxy.gs — TẠO MỚI
const AI_GATEWAY_KEY = PropertiesService.getScriptProperties()
  .getProperty('AI_GATEWAY_KEY'); // Lưu trong Script Properties, KHÔNG hardcode

function proxyAIRequest(payload, userToken) {
  // Verify Firebase token trước
  const user = verifyFirebaseToken(userToken);
  if (!user) return { error: 'UNAUTHORIZED' };
  
  // Rate limit per user: 20 requests/phút
  const rateLimitKey = `ai_rate_${user.uid}`;
  const cache = CacheService.getScriptCache();
  const count = parseInt(cache.get(rateLimitKey) || '0');
  if (count >= 20) return { error: 'RATE_LIMITED' };
  cache.put(rateLimitKey, String(count + 1), 60);
  
  const response = UrlFetchApp.fetch('https://ai-gateway.fcs.internal/v1/chat/completions', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Authorization': `Bearer ${AI_GATEWAY_KEY}` },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  
  return JSON.parse(response.getContentText());
}
```

⚠️ **CẢNH BÁO BẢO MẬT QUAN TRỌNG:**
Phải thực hiện ngay 3 

---

# BÁO CÁO AUDIT & THIẾT KẾ KIẾN TRÚC CRM V2 (PHẦN 2)

---

## GIAI ĐOẠN 2: AI TALENT CRM & WORKER CARE 1-3-7 NGÀY & RE-ACTIVATION ZALO 0Đ

### 1. Hiện trạng & Đã đạt
* Lưu trữ profile ứng viên tập trung trên Google Sheets/AppSheet.
* Gửi tin Zalo ZNS cơ bản qua Webhook khi đổi trạng thái.
* Template chăm sóc 1-3-7 ngày tạo sẵn trên kịch bản tư vấn.

### 2. Lỗ hổng kỹ thuật (Critical Gaps)
* **Trigger Drift & Duplicate**: Trigger theo thời gian (Clock Trigger) chạy quét toàn bảng. Dễ gửi trùng tin nhắn nhiều lần khi trigger timeout hoặc retry. Thiếu `Idempotency-Key`.
* **Worker Consent & Opt-out**: Thiếu cờ `OPT_OUT_CARE`. Công nhân chặn tin Zalo gây tụt điểm chất lượng Zalo OA / ZNS template.
* **Sentiment Tracking (Trạng thái cảm xúc)**: Không ghi nhận phản hồi tiêu cực (bị ép ca, nhà xưởng nóng, nợ lương). Thiếu bộ phân loại phản hồi để gắn cờ `CRITICAL_INTERVENTION`.
* **Re-activation 0đ thiếu điều kiện**: Quét hàng loạt ứng viên cũ không qua lọc trạng thái `BLACKLIST`, `AGE_OUT`, gây lãng phí hạn mức Zalo Follow-up quota.

### 3. Giải pháp & Mã nguồn triển khai

#### Chống spam & Quản lý Care 1-3-7 theo Idempotency Key
File: `src/services/WorkerCareEngine.ts`

```typescript
interface CareJob {
  workerId: string;
  phone: string;
  onboardingDate: string; // ISO String
  milestoneDay: 1 | 3 | 7;
  consentOptOut: boolean;
  isBlacklisted: boolean;
}

export class WorkerCareEngine {
  private cache: GoogleAppsScript.Cache.Cache;
  private dbSheet: GoogleAppsScript.Spreadsheet.Sheet;

  constructor(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    this.cache = CacheService.getScriptCache();
    this.dbSheet = sheet;
  }

  public processCareMilestone(job: CareJob): boolean {
    if (job.consentOptOut || job.isBlacklisted) {
      return false;
    }

    const idempotencyKey = `CARE_${job.workerId}_DAY_${job.milestoneDay}_${job.onboardingDate.slice(0, 10)}`;
    const lock = LockService.getScriptLock();
    
    // Khóa tránh race condition từ nhiều instance trigger
    if (!lock.tryLock(5000)) {
      throw new Error(`Lock conflict on worker: ${job.workerId}`);
    }

    try {
      if (this.cache.get(idempotencyKey)) {
        return false; // Đã gửi trong cache
      }

      // Kiểm tra trong Google Sheet Log
      if (this.isAlreadyLogged(idempotencyKey)) {
        this.cache.put(idempotencyKey, "SENT", 21600);
        return false;
      }

      // Xác định payload Zalo OA theo milestone
      const payload = this.buildZaloPayload(job);
      const sent = this.sendZaloMessage(payload);

      if (sent) {
        this.logCareSuccess(idempotencyKey, job);
        this.cache.put(idempotencyKey, "SENT", 21600);
        return true;
      }
      return false;
    } finally {
      lock.releaseLock();
    }
  }

  private isAlreadyLogged(key: string): boolean {
    const data = this.dbSheet.getDataRange().getValues();
    // Col 0: Key
    return data.some(row => row[0] === key);
  }

  private buildZaloPayload(job: CareJob) {
    const templateIds = { 1: "ZNS_D1_WELCOME", 3: "ZNS_D3_ADAPTATION", 7: "ZNS_D7_RETENTION" };
    return {
      template_id: templateIds[job.milestoneDay],
      phone: job.phone,
      template_data: { worker_id: job.workerId, day: job.milestoneDay }
    };
  }

  private sendZaloMessage(payload: any): boolean {
    // Gọi Zalo API qua UrlFetchApp
    return true;
  }

  private logCareSuccess(key: string, job: CareJob): void {
    this.dbSheet.appendRow([key, job.workerId, job.milestoneDay, new Date().toISOString()]);
  }
}
```

#### Phân tích cảm xúc phản hồi (Sentiment Parser)
File: `src/services/SentimentClassifier.ts`

```typescript
export enum SentimentAlertLevel {
  NORMAL = "NORMAL",
  WARNING = "WARNING",
  CRITICAL = "CRITICAL"
}

export class SentimentClassifier {
  private static CRITICAL_KEYWORDS = ["nghỉ việc", "bỏ về", "nợ lương", "đánh nhau", "ép ca", "độc hại", "tai nạn"];
  private static WARNING_KEYWORDS = ["khó khăn", "xa nhà", "cơm dở", "mệt", "quản lý khó", "chưa quen"];

  public static analyzeWorkerFeedback(text: string): { level: SentimentAlertLevel; flags: string[] } {
    const normalized = text.toLowerCase();
    const matchedCritical = this.CRITICAL_KEYWORDS.filter(k => normalized.includes(k));
    
    if (matchedCritical.length > 0) {
      return { level: SentimentAlertLevel.CRITICAL, flags: matchedCritical };
    }

    const matchedWarning = this.WARNING_KEYWORDS.filter(k => normalized.includes(k));
    if (matchedWarning.length > 0) {
      return { level: SentimentAlertLevel.WARNING, flags: matchedWarning };
    }

    return { level: SentimentAlertLevel.NORMAL, flags: [] };
  }
}
```

---

## GIAI ĐOẠN 3: 19 LEVEL SALE PIPELINE KANBAN & TRANSITION MATRIX

### 1. Hiện trạng & Đã đạt
* 19 bước tuyển mộ hiển thị trên Kanban AppSheet.
* Chuyển trạng thái bằng kéo thả giao diện.

### 2. Lỗ hổng kỹ thuật (Critical Gaps)
* **Thiếu State Transition Matrix (Ma trận chuyển trạng thái)**: User kéo nhảy cóc từ `L01_LEAD_RAW` lên thẳng `L10_ARRIVED_FACTORY` mà không qua phỏng vấn (`L05`) hay test sức khỏe (`L07`). Gây sai số phễu chuyển đổi (Funnel Conversion Rate).
* **Missing Invariant Checks**: Không bắt buộc đủ trường (CCCD, Ảnh thẻ, Giấy khám SK) khi chuyển trạng thái sang `L08_SUBMITTED_FACTORY`.
* **Mất đồng bộ Deal -> Worker**: Khi Deal chạm `L12_CHECKIN_SUCCESS`, hệ thống không tự động tạo bản ghi tại Master DB `VWW_WORKER_POOL`, buộc thao tác tay gây đúp dữ liệu.

### 3. Giải pháp & Mã nguồn triển khai

#### Pipeline State Transition Matrix Engine
File: `src/pipelines/PipelineValidator.ts`

```typescript
export type PipelineStage = 
  | "L01_RAW_LEAD" | "L02_QUALIFIED" | "L03_DATA_COLLECTED" | "L04_INTERVIEW_SCHEDULED"
  | "L05_INTERVIEW_PASSED" | "L06_HEALTH_CHECK" | "L07_DOCS_VERIFIED" | "L08_SUBMIT_FACTORY"
  | "L09_FACTORY_ACCEPTED" | "L10_DEPARTURE" | "L11_ARRIVED" | "L12_CHECKIN_SUCCESS"
  | "L13_DAY_01" | "L14_DAY_03" | "L15_DAY_07" | "L16_OFFICIAL"
  | "L17_DROPOUT" | "L18_BLACKLIST" | "L19_REHIRED";

export class PipelineValidator {
  private static VALID_TRANSITIONS: Map<PipelineStage, PipelineStage[]> = new Map([
    ["L01_RAW_LEAD", ["L02_QUALIFIED", "L17_DROPOUT"]],
    ["L02_QUALIFIED", ["L03_DATA_COLLECTED", "L17_DROPOUT"]],
    ["L03_DATA_COLLECTED", ["L04_INTERVIEW_SCHEDULED", "L17_DROPOUT"]],
    ["L04_INTERVIEW_SCHEDULED", ["L05_INTERVIEW_PASSED", "L17_DROPOUT"]],
    ["L05_INTERVIEW_PASSED", ["L06_HEALTH_CHECK", "L17_DROPOUT"]],
    ["L06_HEALTH_CHECK", ["L07_DOCS_VERIFIED", "L17_DROPOUT"]],
    ["L07_DOCS_VERIFIED", ["L08_SUBMIT_FACTORY", "L17_DROPOUT"]],
    ["L08_SUBMIT_FACTORY", ["L09_FACTORY_ACCEPTED", "L17_DROPOUT"]],
    ["L09_FACTORY_ACCEPTED", ["L10_DEPARTURE", "L17_DROPOUT"]],
    ["L10_DEPARTURE", ["L11_ARRIVED", "L17_DROPOUT"]],
    ["L11_ARRIVED", ["L12_CHECKIN_SUCCESS", "L17_DROPOUT"]],
    ["L12_CHECKIN_SUCCESS", ["L13_DAY_01", "L17_DROPOUT"]],
    ["L13_DAY_01", ["L14_DAY_03", "L17_DROPOUT"]],
    ["L14_DAY_03", ["L15_DAY_07", "L17_DROPOUT"]],
    ["L15_DAY_07", ["L16_OFFICIAL", "L17_DROPOUT"]],
    ["L17_DROPOUT", ["L18_BLACKLIST", "L19_REHIRED"]],
    ["L18_BLACKLIST", []],
    ["L19_REHIRED", ["L02_QUALIFIED"]]
  ]);

  public static validateTransition(
    current: PipelineStage, 
    next: PipelineStage, 
    payload: Record<string, any>
  ): { ok: boolean; reason?: string } {
    const allowed = this.VALID_TRANSITIONS.get(current) || [];
    if (!allowed.includes(next)) {
      return { ok: false, reason: `Chuyển chặng bất hợp lệ từ ${current} sang ${next}` };
    }

    // Invariant field validation
    if (next === "L07_DOCS_VERIFIED") {
      if (!payload.cccd_front || !payload.cccd_back || !payload.phone) {
        return { ok: false, reason: "Thiếu thông tin CCCD hoặc SĐT khi xác minh hồ sơ" };
      }
    }

    if (next === "L12_CHECKIN_SUCCESS") {
      if (!payload.factory_worker_code || !payload.checkin_time) {
        return { ok: false, reason: "Thiếu Mã thẻ nhà máy hoặc Thời gian Check-in thực tế" };
      }
    }

    return { ok: true };
  }
}
```

#### Auto-Conversion Deal -> Master Worker Record
File: `src/pipelines/AutoProvisionWorker.ts`

```typescript
export function onDealCheckinSuccess(dealData: {
  dealId: string;
  workerName: string;
  phone: string;
  cccd: string;
  factoryId: string;
  checkinTime: string;
}): string {
  const masterSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("VWW_WORKER_POOL");
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const data = masterSheet.getDataRange().getValues();
    // Index 2: CCCD
    const exists = data.some(row => row[2] === dealData.cccd);
    if (exists) {
      throw new Error(`Worker CCCD ${dealData.cccd} đã tồn tại trong Pool.`);
    }

    const workerId = `WRK_${new Date().getFullYear()}_${Utilities.getUuid().substring(0, 6).toUpperCase()}`;
    masterSheet.appendRow([
      workerId,
      dealData.workerName,
      dealData.cccd,
      dealData.phone,
      dealData.factoryId,
      dealData.checkinTime,
      "ACTIVE",
      dealData.dealId
    ]);

    return workerId;
  } finally {
    lock.releaseLock();
  }
}
```

---

## GIAI ĐOẠN 4: QUẢN LÝ 29 ĐỐI TÁC NHÀ MÁY & SLA HỢP ĐỒNG

### 1. Hiện trạng & Lỗ hổng
* Danh sách 29 Nhà máy (WNC, Foxconn, Luxshare, Goertek...) lưu rời rạc.
* SLA thưởng/phạt tính tay. Đặc thù WNC: thưởng công nhân 2.000.000 VNĐ khi đạt 15/30 ngày công thực tế (Attendance). Hiện thiếu logic kiểm tra công ca tự động, dẫn tới trả thưởng nhầm người đã bỏ việc trước ngày 15.
* Cảnh báo vi phạm SLA tuyển mộ (thiếu người, tuyển trễ tiến độ bàn giao xưởng) chưa có tính năng đẩy tin realtime.

### 2. Giải pháp kỹ thuật

#### Engine Tính Thưởng & Quản Lý SLA WNC / Foxconn
File: `src/sla/FactorySLAEngine.ts`

```typescript
export interface WorkAttendanceRecord {
  workerId: string;
  factoryId: string;
  validShiftCount: number; // Tổng ca làm >= 8h
  startDate: string;
  currentDate: string;
  hasViolation: boolean;
}

export interface SLARewardResult {
  workerId: string;
  factoryId: string;
  eligibleReward: boolean;
  rewardAmount: number;
  reason: string;
}

export class FactorySLAEngine {
  public static evaluateWncRetentionBonus(att: WorkAttendanceRecord): SLARewardResult {
    if (att.factoryId !== "FACT_WNC") {
      return { workerId: att.workerId, factoryId: att.factoryId, eligibleReward: false, rewardAmount: 0, reason: "Không thuộc WNC" };
    }

    if (att.hasViolation) {
      return { workerId: att.workerId, factoryId: att.factoryId, eligibleReward: false, rewardAmount: 0, reason: "Vi phạm kỷ luật xưởng" };
    }

    // Tiêu chuẩn WNC: 2 triệu VNĐ sau 15 công hợp lệ trong vòng 30 ngày đầu
    if (att.validShiftCount >= 15) {
      return {
        workerId: att.workerId,
        factoryId: att.factoryId,
        eligibleReward: true,
        rewardAmount: 2000000,
        reason: `Đạt tiêu chuẩn WNC: ${att.validShiftCount}/15 công`
      };
    }

    return {
      workerId: att.workerId,
      factoryId: att.factoryId,
      eligibleReward: false,
      rewardAmount: 0,
      reason: `Chưa đủ công: ${att.validShiftCount}/15 công`
    };
  }

  public static checkOrderSLABreach(order: {
    orderId: string;
    requiredHeadcount: number;
    fulfilledHeadcount: number;
    deadline: string;
  }): { isBreached: boolean; shortfall: number } {
    const now = new Date().getTime();
    const deadlineTime = new Date(order.deadline).getTime();
    const shortfall = order.requiredHeadcount - order.fulfilledHeadcount;

    if (now > deadlineTime && shortfall > 0) {
      return { isBreached: true, shortfall };
    }
    return { isBreached: false, shortfall: Math.max(0, shortfall) };
  }
}
```

---

## GIAI ĐOẠN 5: TÁCH BIỆT DÒNG TIỀN & QUY TRÌNH DUYỆT 4 CẤP

### 1. Hiện trạng & Lỗ hổng
* **Gộp quỹ**: Tiền thưởng công nhân (WNC 2M) và tiền hoa hồng trung gian (Vendor 12.000đ/giờ hoặc CTV 500.000đ/26 công) cùng đổ vào một cột chi phí. Thất thoát tài chính, tính sai P&L dự án.
* **Quy trình duyệt lỏng lẻo**: Nhân viên tự sửa trạng thái thanh toán trên Sheet. Thiếu Audit Trail không thể truy vết người duyệt.

### 2. Kiến trúc Phân Tách Quỹ & Luồng Duyệt 4 Cấp (Dual-Ledger & 4-Tier Approval)

#### Ledger Schema
1. **Ledger A (Worker Reward - Quỹ Thưởng Công Nhân)**: Nguồn chi trả trực tiếp cho công nhân đạt SLA.
2. **Ledger B (Broker Commission - Quỹ Hoa Hồng Đối Tác)**: Nguồn chi trả VEN/CTV theo năng lực cung ứng.

#### Máy Trạng Thái Duyệt 4 Cấp (Finite State Machine)
Luồng: `DRAFT` -> `LEAD_SALE_APPROVED` -> `MANAGER_APPROVED` -> `ACCOUNTANT_APPROVED` -> `DIRECTOR_APPROVED` (FINAL PAY).

File: `src/finance/ApprovalWorkflowEngine.ts`

```typescript
export type FundType = "WORKER_REWARD" | "COMMISSION_VEN" | "COMMISSION_CTV";
export type ApprovalRole = "LEAD_SALE" | "MANAGER" | "ACCOUNTANT" | "DIRECTOR";
export type ApprovalStatus = 
  | "DRAFT" 
  | "LEAD_SALE_APPROVED" 
  | "MANAGER_APPROVED" 
  | "ACCOUNTANT_APPROVED" 
  | "DIRECTOR_APPROVED" 
  | "REJECTED";

export interface PaymentVoucher {
  voucherId: string;
  fundType: FundType;
  beneficiaryId: string;
  amount: number;
  status: ApprovalStatus;
  history: Array<{ role: ApprovalRole; approvedBy: string; timestamp: string; action: "APPROVE" | "REJECT" }>;
}

export class ApprovalWorkflowEngine {
  public static approveVoucher(
    voucher: PaymentVoucher, 
    role: ApprovalRole, 
    userId: string
  ): PaymentVoucher {
    const lock = LockService.getScriptLock();
    lock.waitLock(5000);

    try {
      if (!this.canApprove(voucher.status, role)) {
        throw new Error(`Cấp bậc ${role} không được phép duyệt tại trạng thái ${voucher.status}`);
      }

      const nextStatus = this.getNextStatus(role);
      voucher.status = nextStatus;
      voucher.history.push({
        role,
        approvedBy: userId,
        timestamp: new Date().toISOString(),
        action: "APPROVE"
      });

      return voucher;
    } finally {
      lock.releaseLock();
    }
  }

  private static canApprove(currentStatus: ApprovalStatus, role: ApprovalRole): boolean {
    switch (currentStatus) {
      case "DRAFT": return role === "LEAD_SALE";
      case "LEAD_SALE_APPROVED": return role === "MANAGER";
      case "MANAGER_APPROVED": return role === "ACCOUNTANT";
      case "ACCOUNTANT_APPROVED": return role === "DIRECTOR";
      default: return false;
    }
  }

  private static getNextStatus(role: ApprovalRole): ApprovalStatus {
    switch (role) {
      case "LEAD_SALE": return "LEAD_SALE_APPROVED";
      case "MANAGER": return "MANAGER_APPROVED";
      case "ACCOUNTANT": return "ACCOUNTANT_APPROVED";
      case "DIRECTOR": return "DIRECTOR_APPROVED";
    }
  }
}
```

---

## GIAI ĐOẠN 6: NGHIỆM THU E2E & CHECKLIST BÀN GIAO CLEAN SLATE

### Kịch bản Golden Flow (E2E Validation)

```
[Lead vào Facebook/Tiktok/Zalo] 
  -> Ingest Webhook (Parse CCCD/Phone) 
  -> State L01_RAW_LEAD
  -> Validator check (L01 -> L02 -> ... -> L12)
  -> Check-in Factory: Kích hoạt AutoProvisionWorker
  -> Worker Pool nhận profile (Status: ACTIVE)
  -> Trigger Care D1-D3-D7 (Check Idempotency)
  -> Check công ca WNC 15/30 ngày (FactorySLAEngine)
  -> Sinh Voucher thưởng (Fund: WORKER_REWARD)
  -> Routing duyệt 4 cấp (Lead -> Manager -> Accountant -> Director)
  -> Chi trả & Cập nhật Ledger cân đối số dư.
```

### Checklist Bàn Giao V2 Clean Slate
1. [ ] Không còn ô công thức tính tay (`SUM`, `VLOOKUP`) đè lên Sheet giao dịch; toàn bộ chuyển sang GAS Service hoặc AppSheet Computed Key.
2. [ ] Zero Ghost Records: 100% Deal tại `L12_CHECKIN_SUCCESS` phải map 1-1 với ID trên bảng `VWW_WORKER_POOL`.
3. [ ] Anti-Race Condition: Toàn bộ thao tác ghi tiền và duyệt trạng thái đều được bọc bởi `LockService.getScriptLock()`.
4. [ ] Quản lý Quỹ kép: Phân tách tuyệt đối 2 cột tài khoản ngân hàng chi trả (Quỹ công nhân vs Quỹ CTV/VEN).

---

## MA TRẬN HÀNH ĐỘNG KHẮC PHỤC (ACTION MATRIX)

| Mã | File Cần Tác Động | Vấn Đề / Nâng Cấp Kỹ Thuật | Độ Ưu Tiên | Kế Hoạch Xử Lý |
|---|---|---|---|---|
| **ACT-01** | `src/pipelines/PipelineValidator.ts` | Người dùng nhảy cóc trạng thái Pipeline trên UI. | **P0** | Viết Script Trigger chặn onEdit/Form Submit, rollback trạng thái sai. |
| **ACT-02** | `src/finance/ApprovalWorkflowEngine.ts` | Sửa số tiền và thanh toán trực tiếp không qua phê duyệt. | **P0** | Khóa dải ô cột Status & Amount; chỉ Service Account mới được ghi. |
| **ACT-03** | `src/services/WorkerCareEngine.ts` | Bắn đúp tin nhắn Zalo khi Cronjob quét lại sheet. | **P1** | Đưa `CacheService` và `IdempotencyKey` vào code dispatch. |
| **ACT-04** | `src/sla/FactorySLAEngine.ts` | Trả nhầm 2M tiền thưởng WNC khi công nhân nghỉ trước 15 công. | **P1** | Kết nối bảng chấm công daily, tính hàm verify trước khi xuất phiếu chi. |
| **ACT-05** | `src/services/SentimentClassifier.ts` | Bỏ sót công nhân phản ánh bị đối xử tệ, dẫn đến bỏ việc hàng loạt. | **P2** | Cài đặt Webhook Zalo Hook bắt keyword, gửi cảnh báo Telegram nhóm Lead. |
| **ACT-06** | `src/pipelines/AutoProvisionWorker.ts` | Nhập liệu thủ công từ Deal sang Master Sheet Worker chậm trễ. | **P2** | Gắn trigger tự động sao chép profile khi Deal chạm `L12`. |

---

## KẾ HOẠCH TRIỂN KHAI THEO GIỜ

```
H00 - H04: Triển khai ACT-01 & ACT-02 (Chặn nhảy trạng thái & Khóa quyền tài chính).
H04 - H08: Triển khai ACT-03 & ACT-04 (Hệ thống Care Zalo & Khóa logic thưởng SLA WNC).
H08 - H12: Triển khai ACT-05 & ACT-06 (Auto Provisioning & Phân tích rủi ro cảm xúc).
H12 - H16: Chạy test Golden Flow 100 Lead giả lập, nghiệm thu bàn giao hệ thống.
```