# FCS AI WORKFORCE OS V2 — DEV AI IMPLEMENTATION GUARDRAILS & PERFORMANCE NOTE

**Document type:** Dev AI execution guardrail / warning note  
**Project:** FCS AI WORKFORCE OS  
**Date:** 2026-09-18  
**Current focus:** V2 Performance Hardening + Stable Data Architecture  
**Audience:** Dev AI / Antigravity / AI coding agent đang trực tiếp sửa code  
**Status:** ACTIVE — READ BEFORE IMPLEMENTATION

---

# 0. MỤC ĐÍCH CỦA NOTE NÀY

Note này không phải tài liệu marketing.

Mục tiêu là ngăn Dev AI:
- tối ưu sai chỗ;
- vô tình làm lệch tenant security;
- biến cache thành nguồn dữ liệu thật;
- dùng Google Sheets như database query engine;
- tuyên bố performance không có benchmark;
- hard-code business rule chưa được xác nhận;
- hoặc triển khai thay đổi lớn làm ảnh hưởng V1/V2 production.

**Nguyên tắc vận hành:**

> ĐO TRƯỚC → SỬA NHỎ → TEST → SO SÁNH → GHI BẰNG CHỨNG → MỚI TIẾP TỤC

---

# 1. NGUỒN SỰ THẬT PHẢI TÔN TRỌNG

Thứ tự ưu tiên:

1. `FCS_AI_WORKFORCE_OS_MASTER_CONTEXT.md`
2. `FCS_TEAM_GOVERNANCE_RULES_SKILL.md`
3. `v2/README.md`
4. Schema JSON thực tế của V2
5. Code thực tế đang chạy
6. Google Sheet thực tế
7. Dữ liệu khách hàng thực tế
8. UI / screenshot
9. Ý tưởng AI

Nếu các nguồn mâu thuẫn:
- không tự chọn một nguồn theo cảm tính;
- ghi rõ conflict;
- giữ production an toàn;
- yêu cầu business/technical confirmation nếu cần.

---

# 2. QUYẾT ĐỊNH KIẾN TRÚC HIỆN TẠI

## 2.1 V2 hiện tại

Giữ kiến trúc:
- Master Worker
- Recruitment CRM Deal
- Interview
- Assignment / Start
- Attendance
- Matching
- VWW / Business Result
- Audit
- Company / Branch / Taxonomy

Không rebuild toàn hệ thống.

## 2.2 Google Sheets

Google Sheets vẫn được giữ cho:
- human operations;
- import/export;
- kiểm tra dữ liệu;
- dropdown / Data Validation;
- Protected Range;
- manual review;
- đối soát;
- báo cáo hỗ trợ.

**Không còn giả định rằng Google Sheets phải làm mọi phép tính realtime cho app.**

## 2.3 Long-term target

Target dài hạn đã được định hướng:

`Firebase Auth + PostgreSQL Data Hub / Firebase SQL Connect + Cloudflare Frontend + Google Sheets Sync Workspace`

Nhưng:

**KHÔNG BIG-BANG MIGRATION.**

Performance hardening hiện tại phải thiết kế sao cho sau này thay storage engine mà frontend/business contract không phải viết lại.

---

# 3. 4-PILLAR BLUEPRINT — CHỈ ĐƯỢC TRIỂN KHAI BẢN V2.1

Bản AI proposal cũ được đánh giá:

**APPROVE WITH CORRECTIONS**

Không được triển khai nguyên văn.

Kiến trúc được phép:

```text
1. SAFE CLIENT SWR
2. MINIMAL BOOTSTRAP API
3. VERSIONED + TENANT-SCOPED CACHE
4. MATERIALIZED KPI / BOUNDED NATIVE FORMULAS
```

---

# 4. VIỆC DEV AI PHẢI LÀM NGAY

## TASK A — ĐO PERFORMANCE TRƯỚC KHI SỬA

Bắt buộc thêm measurement cho từng request.

Backend log tối thiểu:

```text
request_id
action
tenant_id
user_scope

total_ms
open_sheet_ms
read_ms
compute_ms
write_ms

rows_read
rows_written
response_bytes

cache_hit
data_version
```

Frontend đo:

```text
page
api_action
ttfb_ms
request_total_ms
render_ms
rows_returned
cache_source
```

Không được báo:
- “nhanh hơn 25 lần”;
- “30ms”;
- “150ms”;
- “0.05s”;

nếu chưa có benchmark thật.

Performance report phải có:
- p50
- p95
- sample size
- cold/warm distinction

---

## TASK B — TẠO `v2.bootstrap` NHẸ

Endpoint được phép trả:

```json
{
  "success": true,
  "data": {
    "session": {},
    "tenant": {},
    "permissions": {},
    "summary": {},
    "taxonomyVersion": 0,
    "dataVersion": 0,
    "serverTime": ""
  }
}
```

Có thể thêm taxonomy nhỏ nếu response vẫn nhẹ.

### KHÔNG ĐƯỢC NHÉT VÀO BOOTSTRAP

- full workers
- full deals
- audit history
- attendance history
- matching records
- Worker 360
- toàn bộ action queue nếu query nặng

Nguyên tắc:

> Bootstrap phải làm màn hình usable nhanh, không phải trở thành “God API”.

---

## TASK C — CACHE ĐÚNG CÁCH

Có thể dùng:

`CacheService.getScriptCache()`

Nhưng cache chỉ là **acceleration layer**.

### Cache key phải chứa tenant

SAI:

```text
v2_dashboard
```

ĐÚNG:

```text
v2:FCS-000001:dashboard:v382
```

Nếu response phụ thuộc office/role:

```text
v2:FCS-000001:OFF-01:TENANT_MANAGER:actions:v382
```

Nếu phụ thuộc user:

```text
tenant + uid + resource + version
```

### CacheService là best-effort

Code luôn phải hoạt động khi:

```text
cache.get(...) == null
```

Cache miss phải fallback về canonical source/read model.

Không được coi cache là database.

---

# 5. CACHE INVALIDATION — KHÔNG XÓA THỦ CÔNG RẢI RÁC

Không viết hàng chục chỗ:

```javascript
cache.remove("v2_dashboard");
cache.remove("v2_pipeline");
cache.remove("v2_actions");
```

Tạo cơ chế version chung:

```text
data_version
taxonomy_version
```

Ví dụ:

```text
381 → mutation → 382
```

Cache key tự đổi version:

```text
dashboard:v382
pipeline:v382
```

Mutation có khả năng ảnh hưởng dữ liệu phải bump version.

Bao gồm:
- deal.create
- deal.update
- deal.move_stage
- deal.soft_delete
- worker.create
- worker.update
- worker.soft_delete
- batch import
- interview mutation
- assignment/start mutation
- attendance import
- matching verification
- VWW mutation
- manual Sheet edit nếu có hỗ trợ
- sync từ external source

---

# 6. GOOGLE SHEETS FORMULA — QUY TẮC MỚI

## ĐƯỢC GIỮ

- Protected Range
- Data Validation
- Dropdown
- simple formulas
- small reference formulas
- human-facing formulas

## KHÔNG DÙNG TRÊN HOT PATH

- full-column `A:A`, `H:H` cho bảng tăng liên tục
- hàng nghìn VLOOKUP realtime nếu có thể materialize
- OFFSET / volatile chain
- nhiều IMPORTRANGE nối nhau
- countdown theo NOW trên từng CRM deal
- dashboard phải scan toàn bộ bảng mỗi page load

### Nếu dùng COUNTIFS

Dùng bounded range:

```text
H2:H50000
```

không dùng:

```text
H:H
```

Và phải kiểm tra soft delete bằng **cột status/delete thật**, không kiểm tra sai trên cùng cột stage.

---

# 7. KHÔNG HARD-CODE `L4 = VWW` NẾU CHƯA XÁC NHẬN BUSINESS RULE

Đây là cảnh báo quan trọng.

Nếu current V2 đang dùng:

```text
L4 → VWW
```

Dev AI không được tự coi đây là business truth tuyệt đối.

Phải xác định:

```text
VWW condition = ?
```

Có thể liên quan:
- actual start;
- attendance;
- matching;
- number of workdays;
- business fee window;
- customer verification.

Nếu chưa có business confirmation:

- preserve existing behavior;
- không mở rộng logic;
- ghi `BUSINESS RULE PENDING CONFIRMATION`.

---

# 8. NÊN DÙNG KPI SNAPSHOT / MATERIALIZED READ MODEL

Khuyến nghị tạo:

```text
00_KPI_SNAPSHOT
```

hoặc technical read-model tương đương.

Ví dụ:

```text
metric_key
metric_value
data_version
updated_at
```

App đọc khoảng vài cells.

Hot path không nên chạy lại toàn bộ funnel calculation.

### Reconciliation

Định kỳ:

```text
canonical tables
→ full recompute
→ compare snapshot
→ repair drift
```

Mục tiêu:

`FAST READ + RECOVERABLE CORRECTNESS`

---

# 9. CLIENT SWR — ĐƯỢC DÙNG NHƯNG PHẢI TRUNG THỰC

Có thể hiển thị cached summary ngay.

Nhưng:

**Cache cũ KHÔNG được gắn nhãn “DỮ LIỆU THỰC / ĐÃ ĐỒNG BỘ”.**

UI semantics:

```text
🔵 DỮ LIỆU ĐÃ LƯU • 14:25
🟢 ĐÃ ĐỒNG BỘ • vừa xong
🟠 OFFLINE • dữ liệu lúc 14:25
🔴 KHÔNG THỂ XÁC MINH DỮ LIỆU
```

Không tạo false confidence.

---

# 10. LOCALSTORAGE — CẢNH BÁO SECURITY

Không lưu PII/sensitive operational dataset vào `localStorage`.

### CÓ THỂ LƯU

- UI preference
- active tab
- filter
- taxonomy version
- dashboard summary không nhạy cảm
- lastSyncedAt
- dataVersion

### KHÔNG LƯU

- CCCD
- danh sách số điện thoại
- Worker 360
- attendance details
- bank data
- VNeID profile
- Firebase token tự quản
- privileged permission payload
- private notes

Nếu cần client cache phức tạp:
- ưu tiên memory cache;
- hoặc IndexedDB với policy rõ ràng;
- vẫn không coi client cache là trusted source.

---

# 11. FRONTEND PHẢI LAZY LOAD

Màn `HÔM NAY` không được tải ngay:

- tất cả workers;
- attendance history;
- audit history;
- all deals;
- matching review.

Màn đầu chỉ cần:

```text
tenant
session
permissions
today summary
dashboard snapshot
small action summary
```

Các module khác tải khi user mở.

---

# 12. CRM GRID PHẢI PAGINATION / VIRTUALIZE

Frontend chỉ render số rows cần thiết.

Target:

```text
50–100 rows/page
```

hoặc infinite scroll.

Nhưng cảnh báo:

**Pagination giả là chưa đủ.**

Nếu backend vẫn:

```text
read 100,000 rows
→ filter JS
→ return 50
```

thì backend vẫn chậm.

Dev AI phải report:

```text
rows_read
rows_returned
```

---

# 13. SEARCH FAST PATH

Các key exact:

```text
worker_id
deal_id
phone
CCCD
employee_code
```

phải ưu tiên lookup/index.

Không scan toàn bảng cho từng ký tự user gõ.

Search text nên debounce.

Recommended:

```text
250–400ms debounce
```

---

# 14. `onEdit()` PHẢI CỰC NHẸ

Được làm:

```text
validation
timestamp
audit metadata
mark dirty / enqueue event
```

Không được làm trong `onEdit`:

```text
full dashboard rebuild
full worker scan
attendance matching toàn bộ
external API hàng loạt
multi-tab expensive recompute
```

Việc nặng đưa sang:
- batch job;
- trigger;
- outbox processor;
- explicit action.

---

# 15. OUTBOX / EVENT LAYER — NÊN CHUẨN BỊ

Để mở đường cho PostgreSQL Data Hub sau này, business mutation nên có event.

Ví dụ:

```text
DEAL_STAGE_CHANGED
WORKER_CREATED
ATTENDANCE_IMPORTED
MATCH_CONFIRMED
```

Có thể dùng technical tab:

```text
SYSTEM_OUTBOX
```

Fields:

```text
event_id
tenant_id
event_type
entity_id
payload_version
created_at
processed_at
status
retry_count
last_error
```

Sau này cùng contract này có thể chuyển sang PostgreSQL mà không thay business semantics.

---

# 16. KHÔNG BIG-BANG DATABASE MIGRATION

PostgreSQL Data Hub là target architecture có thể triển khai sau.

Không được:

```text
delete Sheet architecture
↓
migrate all production immediately
↓
switch frontend
```

Nếu làm Data Hub:

```text
1. Shadow DB
2. Sync
3. Reconcile
4. Shadow read
5. Read cutover
6. Write cutover
```

Có rollback.

---

# 17. DATA ENGINE ABSTRACTION — NÊN CHUẨN BỊ NGAY

Frontend/service không nên biết storage engine.

Desired contract:

```typescript
interface WorkforceDataGateway {
  bootstrap(...)
  listWorkers(...)
  getWorker(...)
  listDeals(...)
  createDeal(...)
  moveDealStage(...)
  getDashboard(...)
}
```

Implementation hiện tại:

```text
SheetsDataGateway
```

Tương lai:

```text
PostgresDataGateway
```

Không viết business UI gắn chết với Sheet range/tab name.

---

# 18. TENANT SECURITY — KHÔNG ĐƯỢC HY SINH VÌ PERFORMANCE

Cache/search/read model đều phải enforce:

```text
authenticated user
→ resolve trusted tenant
→ role
→ office scope
→ query
```

Không tin:

```text
tenant_id từ client
role từ client
email từ client
office_id từ client
```

Performance optimization gây cross-tenant leak = **P0 RELEASE BLOCKER**.

---

# 19. CONCURRENCY / ID GENERATION

Giữ atomic ID generation.

Nếu dùng Apps Script:

```text
LockService
```

Nhưng lock chỉ bao quanh critical section.

Không giữ lock trong lúc:
- gọi external API;
- chạy full scan;
- generate dashboard;
- gửi email.

Lock dài sẽ tạo queue và latency.

---

# 20. PERFORMANCE TARGET — KHÔNG CAM KẾT 0.05s / 30ms CỐ ĐỊNH

Các con số marketing không phải SLA.

Dev AI phải hướng tới:

```text
Warm cached UI render      < 300ms
Bootstrap cache-hit p95    < 800ms
Bootstrap fresh p95        < 2s
Dashboard cache-miss p95   < 2.5s
CRM first page p95         < 2s
Mutation p95               < 2s
Error rate                 < 0.5%
Cross-tenant leak          = 0
```

Nếu đạt tốt hơn thì báo kết quả thực.

---

# 21. TEST DATA SCALE

Performance QA bắt buộc test:

```text
5,000 deals
20,000 deals
50,000 deals
100,000 deals
```

Scenarios:

```text
bootstrap
dashboard
first CRM page
phone lookup
CCCD lookup
stage filter
branch filter
company filter
move stage
worker create
bulk import 500
Worker 360
attendance import
matching
VWW refresh
```

Không kết luận “bền vững” chỉ từ dataset 20 rows.

---

# 22. BUSINESS DATA INTEGRITY

Không được thay đổi:

```text
worker_id
deal_id
tenant_id
attendance evidence
audit trail
```

mà không migration/reconciliation.

Import cùng file nhiều lần không được tạo duplicate ngoài ý muốn.

Mọi batch import phải có:

```text
batch_id
source
row_count
inserted
updated
skipped
failed
conflict
```

---

# 23. VIỆC DEV AI TUYỆT ĐỐI KHÔNG ĐƯỢC LÀM

```text
❌ Deploy trực tiếp production để “thử”
❌ Commit trực tiếp main
❌ Xóa dữ liệu thật
❌ Đổi Worker ID / Deal ID
❌ Cache cross-tenant
❌ Cache PII trong localStorage
❌ Gọi cached data là fresh
❌ Dùng H:H / A:A tràn lan trên hot dashboard
❌ Đưa all-data vào bootstrap
❌ Rebuild project bằng framework mới
❌ Copy Ever Gauzy source wholesale
❌ Thêm PostgreSQL rồi dual-write không có transaction/outbox
❌ Tự quyết định VWW formula
❌ Tuyên bố “100% stable” chỉ vì unit tests xanh
❌ Tuyên bố performance không có benchmark
```

---

# 24. ACCEPTANCE CRITERIA CHO PERFORMANCE HARDENING

Task chỉ DONE khi có bằng chứng:

### Functional

- login bình thường;
- dashboard đúng số;
- worker/deal mutation đúng;
- Golden Flow không hỏng.

### Performance

- benchmark before/after;
- p50/p95;
- rows_read;
- response bytes;
- API count initial page reduced;
- no unnecessary full-sheet scan.

### Security

- cross-tenant cache leakage = 0;
- forged tenant denied;
- forged role denied;
- office scope đúng.

### Data

- row counts không mất;
- IDs không đổi;
- duplicate không tăng ngoài dự kiến;
- audit vẫn ghi.

### UX

- không còn spinner giả kéo dài;
- cached/fresh/offline states rõ ràng;
- error không bị biến thành zero/success.

---

# 25. OUTPUT BẮT BUỘC SAU MỖI ĐỢT CODE

Dev AI phải trả:

```text
TASK ID:
BRANCH:
BASE SHA:
HEAD SHA:

FILES CHANGED:

WHAT CHANGED:

WHAT DID NOT CHANGE:

DATA IMPACT:

SECURITY IMPACT:

BENCHMARK BEFORE:
p50:
p95:
API calls:
rows_read:

BENCHMARK AFTER:
p50:
p95:
API calls:
rows_read:

TESTS:
passed:
failed:

KNOWN RISKS:

PRODUCTION CHANGED?
YES / NO

NEED HUMAN ACTION?
YES / NO

NEXT CONTROLLED ACTION:
```

Không chấp nhận report chỉ nói:

> “Đã tối ưu thành công.”

---

# 26. HUMAN APPROVAL GATE

Phải dừng và yêu cầu người có thẩm quyền khi:

- production deploy/cutover;
- thay Firebase/GCP project;
- tạo paid Cloud SQL instance;
- tăng IAM permission;
- migration data thật;
- rotate credential;
- thay business VWW formula;
- thay tenant model;
- thay canonical schema phá compatibility;
- billing/commission logic.

Mẫu yêu cầu:

```text
HUMAN ACTION REQUIRED

WHAT:
WHERE:
WHY:
RISK:
EXPECTED RESULT:
ROLLBACK:
HOW DEV AI WILL VERIFY:
```

Không yêu cầu người dùng gửi secret/password vào chat.

---

# 27. NEXT RECOMMENDED TECHNICAL ORDER

Dev AI nên làm đúng thứ tự:

```text
1. Add performance instrumentation
2. Capture baseline
3. Minimal v2.bootstrap
4. Versioned tenant-scoped CacheService
5. KPI snapshot/materialized read model
6. Safe SWR UI semantics
7. Lazy loading
8. Grid pagination/virtualization
9. Exact-key index/search
10. Load test 5K → 100K
11. Security regression
12. Golden Flow regression
13. Benchmark report
14. Staging approval
```

Sau khi các bước trên ổn mới tiếp tục:

```text
PostgreSQL Shadow Data Hub
```

---

# 28. BOTTOM LINE

**Ưu tiên hiện tại không phải “code nhiều hơn”.**

Ưu tiên là:

> Làm đường đọc nhanh hơn nhưng vẫn giữ đúng dữ liệu, đúng tenant, đúng business rule và mở đường chuyển sang PostgreSQL mà không phải viết lại hệ thống.

Dev AI cần tối ưu theo bằng chứng, không theo cảm giác.

**Nếu bất kỳ tối ưu nào làm nhanh hơn nhưng giảm data integrity, tenant security hoặc auditability → REJECT.**

