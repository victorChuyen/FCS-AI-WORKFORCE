# FCS AI WORKFORCE OS — BA 1.5 CRM REQUIREMENT REVIEW & AI COMPLETION CHECKLIST

**Project:** FCS AI WORKFORCE OS  
**Document type:** Requirement review + Dev AI completion directive  
**Primary source:** `BA_1.5_CRM_Quan_ly_Data_Tuyen_dung_FCS_Attendance.docx`  
**Related source:** `v2/README.md`  
**Date:** 2026-09-18  
**Purpose:** Yêu cầu Dev AI kiểm tra toàn bộ BA 1.5 với V2 hiện tại, phát hiện GAP/CONFLICT, hoàn thiện schema/API/UI/test mà không làm lệch business rule hoặc tenant security.

---

# 0. CHỈ THỊ BẮT BUỘC CHO DEV AI

ĐỌC FILE NÀY TRƯỚC KHI SỬA CODE.

Không được coi `v2/README.md`, schema JSON, Google Sheet hiện tại hay code hiện tại là đúng tuyệt đối nếu chưa đối chiếu BA 1.5.

Không được triển khai theo kiểu:

```text
README nói gì → code đúng như vậy
```

Phải làm:

```text
BA 1.5
  ↓
Current V2 schema
  ↓
Current V2 code
  ↓
Current Google Sheet
  ↓
Business / Security rules
  ↓
GAP + CONFLICT MATRIX
  ↓
Approved implementation
```

Quy tắc ưu tiên:

1. Business evidence / BA đã được Business Owner xác nhận
2. FCS Master Context / tenant-security invariants
3. Governance / approval rules
4. BA 1.5
5. V2 README
6. Current schema/code
7. UI hiện tại
8. AI proposal

Nếu có conflict:
- KHÔNG tự suy đoán;
- ghi rõ conflict;
- giữ behavior production an toàn;
- yêu cầu quyết định business/architecture nếu conflict ảnh hưởng dữ liệu hoặc tài chính.

---

# 1. KẾT LUẬN REVIEW CẤP CAO

BA 1.5 là một bước tiến lớn so với mô hình CRM tối giản.

Nó xác định hệ thống theo hướng:

```text
WORKER IDENTITY
    ↓
RECRUITMENT REGISTRATION
    ↓
ASSIGNMENT / CONSULTATION
    ↓
INTERVIEW
    ↓
EMPLOYMENT
    ↓
ATTENDANCE
    ↓
CONFIRMED OPERATIONAL EVIDENCE
    ↓
REWARD / COMMISSION / PAYMENT
```

Điểm đúng nhất của BA 1.5:

> **Một Worker là một con người; mỗi lần ứng tuyển là một Recruitment Registration riêng.**

Đây phải trở thành canonical business model của CRM.

Không được tiếp tục dùng một row Worker để chứa toàn bộ lịch sử tuyển dụng.

---

# 2. CRITICAL CONFLICT — L4 KHÔNG PHẢI VWW

Đây là blocker quan trọng nhất.

BA 1.5 xác định Master Recruitment Status:

```text
C3    Lao động mới
C3.1  Số trùng
C3.2  Số rác

L1    Số lao động chia cho Sale
L1.1  Tham khảo
L1.2  Chăm sóc lại
L1.3  Từ chối tiếp xúc / Không có nhu cầu
L1.4  TB, KNM, MB
L1.5  Thừa tuổi từ 45 tuổi trở lên
L1.6  Hẹn gọi lại
L1.7  Lao động thiếu tuổi

L2    Lao động hẹn phỏng vấn
L2.1  Lao động đỗ phỏng vấn
L2.2  Lao động trượt phỏng vấn
L2.3  Lao động hẹn không đến phỏng vấn

L3    Lao động đang đi làm
L3.1  Lao động nghỉ ngang
L3.2  Lao động muốn chuyển công ty khác

L4    Lao động hết thời gian tính phí
```

**L4 = HẾT THỜI GIAN TÍNH PHÍ.**

Không được map:

```text
L4 = Verified Working Worker
```

Không được:

```javascript
if (stage === "L4") {
  vww = true;
}
```

nếu chỉ dựa vào BA 1.5.

### DEV AI PHẢI KIỂM TRA

Current V2 README/code có behavior:

```text
deal.move_stage
→ auto VWW on L4
```

Nếu tồn tại, đánh dấu:

```text
CONFLICT-CRITICAL
```

và không mở rộng behavior đó.

### Target design

VWW phải là **derived operational result**, độc lập với Recruitment Status.

Ví dụ data model tương lai:

```text
worker_verification
vww_event
```

hoặc field derived/materialized phù hợp.

VWW criteria phải được Business Owner xác nhận.

Không suy đoán.

---

# 3. CRITICAL MODEL DECISION — DEAL = RECRUITMENT REGISTRATION?

Current V2 dùng khái niệm:

```text
CRM Deal
deal_id
```

BA 1.5 dùng:

```text
Recruitment Registration
registration_id
```

Về business semantics, hai entity có khả năng tương đương rất cao:

> Một lần Worker ứng tuyển vào Company/Position là một transaction tuyển dụng riêng.

Nhưng Dev AI KHÔNG được rename toàn hệ thống ngay.

Phải lập mapping:

| V2 | BA 1.5 | Decision |
| --- | --- | --- |
| CRM Deal | Recruitment Registration | VERIFY |
| deal_id | registration_id | VERIFY |
| deal stage | recruitment_status_id | VERIFY |
| company_id | company_id | VERIFY |
| assigned_sale | assigned_sale_id/current assignment | VERIFY |

Sau review có 2 phương án hợp lệ:

### Option A — giữ `deal_id` trong code/UI

```text
CRM Deal
```

là product terminology, còn database logical concept là Registration.

### Option B — chuẩn hóa dần sang Registration

Chỉ nếu không phá compatibility/API/import/export.

Không mass rename trước khi impact analysis.

---

# 4. WORKER PROFILE — CURRENT V2 PHẢI ĐƯỢC KIỂM TRA LẠI

BA 1.5 quy định:

> Worker Profile chỉ chứa thông tin không phụ thuộc lần tuyển dụng.

Các field chính:

```text
worker_id
worker_code
full_name
date_of_birth
gender
identity_number
identity_type
identity_issue_date
identity_issue_place
ethnicity
birth_place
hometown
marital_status
education_level_id
graduated_school
major
graduation_year
social_insurance_number
profile_status
created_at/by
updated_at/by
```

Thông tin thay đổi theo thời gian được tách riêng:

```text
worker_phone
worker_address
worker_bank_account
worker_emergency_contact
```

### DEV AI PHẢI SO VỚI

```text
MASTER_WORKERS_SCHEMA.json
01_MASTER_WORKERS
02_WorkerService.gs
current frontend forms
```

và phân loại từng field:

```text
KEEP IN WORKER PROFILE
MOVE TO TEMPORAL CHILD ENTITY
REGISTRATION FIELD
EMPLOYMENT FIELD
FINANCIAL FIELD
DERIVED FIELD
UNCLEAR
```

### Cảnh báo

BA gọi Worker Profile là “thông tin cố định”, nhưng một số field như:

```text
marital_status
education
```

có thể thay đổi trong đời.

Không tự sửa BA.

Đánh dấu:

```text
BUSINESS/DOMAIN CLARIFICATION
```

nếu cần lịch sử các field này.

---

# 5. PHONE — KHÔNG ĐƯỢC GHI ĐÈ LỊCH SỬ

BA 1.5 quyết định:

```text
SĐT là khóa check trùng ban đầu
CCCD là định danh chính sau xác minh
```

Phone phải nằm trong:

```text
worker_phone
```

với:

```text
phone_number
phone_type
is_primary
is_verified
effective_from
effective_to
status
```

### Rule bắt buộc

Khi đổi phone:

```text
OLD PHONE
→ không delete
→ close effective period / mark historical
→ vẫn searchable
→ vẫn usable cho duplicate detection/audit
```

Dev AI phải kiểm tra current V2 có overwrite `phone` trực tiếp trong Master Worker không.

Nếu có:

```text
PARTIAL / MIGRATION REQUIRED
```

---

# 6. DUPLICATE / MERGE WORKER — PHẢI CÓ FLOW THẬT

BA 1.5 không cho phép:

```text
trùng SĐT
→ auto merge
```

hoặc:

```text
trùng CCCD
→ overwrite Worker cũ
```

Required flow:

```text
detect
↓
warning
↓
verify same person
↓
merge
↓
preserve all histories
↓
audit reason
```

Merge phải giữ:

```text
all Recruitment Registrations
assignments
consultation
interviews
employment
phone/address/bank/emergency history
referral attribution
reward
commission
payment
audit
```

### DEV AI PHẢI KIỂM TRA

- có merge service chưa?
- merge có transaction/lock không?
- old worker có status `MERGED` không?
- có `merged_into_worker_id` không?
- foreign records được relink hay lookup alias?
- duplicate worker codes xử lý thế nào?
- audit before/after có đủ không?

Không triển khai auto-merge mơ hồ.

---

# 7. DATA ORIGIN / CREATED BY / ASSIGNED SALE / VEN-CTV — 4 KHÁI NIỆM KHÁC NHAU

BA 1.5 khóa:

```text
Data Origin
Created By
Assigned Sale
Referral Attribution
```

Không được dùng một field `source` cho tất cả.

Canonical concepts:

```text
registration_source
registration.created_by
registration_assignment
registration_attribution
```

### Example

```text
Origin        = Facebook Ads
Created By    = MKT user A
Assigned Sale = Sale user B
Referral      = CTV C
```

Đây là 4 facts khác nhau.

### DEV AI PHẢI SEARCH CODE

Tìm các field:

```text
source
source_name
recruiter
assigned_sale
referrer
ven
ctv
created_by
```

và xác định chỗ nào đang bị overload.

---

# 8. ASSIGNMENT HISTORY — CURRENT SALE KHÔNG ĐƯỢC LÀM MẤT LỊCH SỬ

Registration có:

```text
assigned_sale_id
```

nhưng BA đồng thời yêu cầu:

```text
registration_assignment
```

và UAT đổi Sale phải giữ old/new.

Target pattern:

```text
registration_assignment
assignment_id
registration_id
sale_id
assigned_from
assigned_to
assigned_by
reason
status
```

Current sale có thể:
- materialize trên Registration để đọc nhanh;
- hoặc derive từ active assignment.

Nhưng không được overwrite mà mất history.

---

# 9. MASTER STATUS PHẢI CÓ VERSION / SINGLE CATALOG

BA 1.5 quyết định bộ C3→L4 là master status dùng chung cho:

```text
BA
UI
API
import/export
report
```

Không cho từng module tự định nghĩa enum riêng.

### DEV AI PHẢI KIỂM TRA

```text
TAXONOMY_LEVEL_SALES.json
DM_LEVEL_SALE
frontend enums
backend constants
import mapping
report mapping
```

Tất cả phải trỏ tới cùng status code.

### Không dùng display label làm key

Canonical:

```text
status_code = L1.2
```

Display:

```text
Chăm sóc lại
```

Không match logic bằng:

```text
"Chăm sóc lại"
```

---

# 10. STATE MACHINE PHẢI ĐƯỢC ENFORCE SERVER-SIDE

BA 1.5 quy định core transitions:

```text
C3       → L1
L1       → L1.1..L1.7
L1/L1.6 → L2
L2       → L2.1/L2.2/L2.3
L2.1     → L3
L3       → L3.1
L3       → L3.2
L3       → L4
```

Vai trò tương ứng:

```text
Sale
Field
authorized user/system
```

### Frontend disable button không đủ

Backend phải reject invalid transition.

Response cần có:

```text
INVALID_STATE_TRANSITION
INSUFFICIENT_PERMISSION
FIELD_CONFIRMATION_REQUIRED
```

### DEV AI PHẢI TẠO TEST

- valid transitions
- invalid transition
- role wrong
- stale concurrent transition
- transition repeated/idempotent
- manual import status bypass attempt

---

# 11. INTERVIEW — SALE REPORT KHÔNG ĐƯỢC GHI ĐÈ FIELD CONFIRMATION

BA 1.5 khóa 2 facts:

```text
sale_reported_status
field_confirmed_status
```

Rule:

> Field Confirmed Status là kết quả thực tế chính thức cho nghiệp vụ tiếp theo.

### Không dùng

```text
interview.status
```

duy nhất nếu Sale và Field cùng update field đó.

Required history:

```text
reported_by
reported_at
confirmed_by
confirmed_at
source
note
```

Dev AI phải kiểm tra `InterviewService`/schema/UI current.

---

# 12. EMPLOYMENT LÀ ENTITY RIÊNG

Không dùng Recruitment Registration để đại diện toàn bộ employment.

BA fields:

```text
employment_id
registration_id
company_id
client_employee_code
start_date
end_date
employment_status
termination_reason
commission_start_date
commission_end_date
```

### Important

```text
registration.company_id
```

= company ứng tuyển.

```text
employment.company_id
```

= company thực tế.

Không giả định luôn giống nhau.

---

# 13. ATTENDANCE — CÓ HAI LỚP NGHIỆP VỤ PHẢI HỢP NHẤT

BA 1.5 có:

### A. Attendance Period / bảng công

```text
attendance_period
actual_workdays
actual_work_hours
eligible_workdays
eligible_work_hours
source_file
confirmed_by
status
```

### B. Attendance App Evidence

```text
attendance_event
daily_attendance
GPS
accuracy
device
selfie
shift
geofence
adjustment
confirmation
```

Dev AI phải thiết kế relation rõ:

```text
RAW EVIDENCE / EVENT
      ↓
DAILY ATTENDANCE
      ↓
CONFIRMATION
      ↓
ATTENDANCE PERIOD / AGGREGATION
      ↓
FINANCIAL ELIGIBLE HOURS/DAYS
```

Không để:
- app event;
- imported factory attendance;
- manual correction

ghi đè lẫn nhau.

### Required source-of-truth hierarchy

Dev AI phải đề xuất và Business/Architecture review:

```text
raw event
external factory record
field confirmation
manager adjustment
locked period
```

---

# 14. ATTENDANCE APP LÀ SCOPE EXPANSION — KHÔNG AUTO BUILD

BA 1.5 Appendix C mô tả:

```text
worker login
device binding
GPS
accuracy
geofence
selfie
check-in
check-out
shift
daily attendance
adjustment
manager review
```

Đây là module đáng kể.

Nó còn liên quan dữ liệu nhạy cảm:

```text
GPS
selfie
device identity
attendance evidence
```

### Trước khi build phải chốt

```text
pilot factory coordinates
geofence radius
shift windows
device registration/change
Field/Manager users
factory attendance source
selfie/GPS retention period
privacy/legal policy
storage location/access
```

Không implement full module chỉ vì BA mô tả.

---

# 15. ATTENDANCE SECURITY / PRIVACY

Rule từ BA:

```text
không continuous tracking
GPS chỉ khi CHECK-IN/CHECK-OUT
selfie required
```

Dev AI phải thêm:

```text
tenant_id
worker_id
employment_id
device_id
captured_at
retention_until
access classification
```

Selfie không được:
- lưu public URL;
- cache localStorage;
- expose cho Sale không có permission;
- nằm trong public report.

GPS/selfie access phải có audit.

---

# 16. TENANT_ID — THIẾU TRONG BA LOGICAL TABLE LIST, PHẢI BỔ SUNG

Đây là correction bắt buộc của FCS SaaS architecture.

BA 1.5 mô tả logical entities nhưng không liệt kê `tenant_id` trên từng bảng.

FCS invariant:

> Every business record must respect tenant_id.

Dev AI phải đảm bảo mọi business/transaction table có tenant scope hoặc có FK chain được DB/backend enforce an toàn.

Ưu tiên explicit:

```text
tenant_id
```

trên:

```text
worker_profile
worker_phone
worker_address
worker_bank_account
worker_emergency_contact

recruitment_registration
registration_source
registration_assignment
registration_attribution
consultation_history
interview
status_history

employment
attendance_period
attendance_event
daily_attendance

referral_source

commission_policy
commission_transaction
commission_approval
commission_payment

reward_policy
worker_reward
reward_payment

audit_log
```

Master tables phải xác định:
- global catalog;
- tenant catalog;
- company-scoped catalog.

Không để tenant isolation chỉ dựa vào frontend.

---

# 17. USER / ROLE / PERMISSION / DATA SCOPE

BA 1.5 yêu cầu:

```text
Sale       OWN_DATA
Lead       TEAM_DATA
Manager    OFFICE/AREA_DATA
Field      assigned company/factory scope
Accounting financial scope
Director   management/all configured scope
Admin      system administration
```

Rule:

```text
User → Role → Permission → Data Scope
```

không hard-code theo screen.

### DEV AI PHẢI KIỂM TRA

- Firebase custom claims đang chứa gì?
- membership registry ở đâu?
- backend enforcement ở đâu?
- office/company scope được query như thế nào?
- cache có scope key chưa?
- export có enforce scope không?
- Approval Matrix có independent scope không?

---

# 18. FINANCIAL MODULES — BA CÓ, NHƯNG CURRENT PHASE PHẢI GATE

BA 1.5 bao gồm:

```text
Commission
Worker Reward
Payment
4-level Approval
Policy Versioning
```

Đây là business requirement hợp lệ của target system.

Nhưng Master Phase 1 trước đây từng đặt:

```text
Finance
Rewards
Payroll
```

ngoài phạm vi ưu tiên.

### DEV AI KHÔNG ĐƯỢC TỰ MỞ RỘNG

Phải tạo:

```text
PHASE/SCOPE MATRIX
```

classify:

```text
P1 REQUIRED NOW
P1 DATA FOUNDATION ONLY
P2/P3 LATER
BUSINESS APPROVAL REQUIRED
```

Có thể build schema contract trước mà chưa enable UI/business automation.

---

# 19. COMMISSION / REWARD — KHÔNG HARD-CODE

BA 1.5 đưa baseline:

```text
VEN:
12,000 VND × eligible_work_hours
up to 90 days

CTV:
500,000 VND / 26 workdays milestone
up to 90 days
```

Nhưng BA nói rõ:

> Đây là policy/configuration, không phải constant toàn hệ thống.

Không viết:

```javascript
const VEN_RATE = 12000;
const CTV_26_DAYS_AMOUNT = 500000;
const MAX_DAYS = 90;
```

trong business engine.

Required:

```text
commission_policy
commission_policy_version
rules/milestones
effective_from/to
```

Transaction snapshot:

```text
policy_id
version
rate
basis
eligible data
calculated amount
```

---

# 20. POLICY VERSIONING — PHẢI LÀ IMMUTABLE HISTORY

Once policy is active and used:

```text
DO NOT UPDATE OLD VERSION
```

Change creates:

```text
V2
```

Old Registration/Transaction keeps:

```text
V1
```

Required test:

```text
change rate today
→ yesterday's approved transaction unchanged
```

Không recalculate lịch sử âm thầm.

---

# 21. WORKER REWARD VÀ VEN/CTV COMMISSION PHẢI TÁCH

BA khóa:

```text
Worker Reward:
Company/FCS → Worker

Commission:
Enterprise/FCS → VEN/CTV
```

Không chung transaction.

Dev AI phải kiểm tra Settlement service hiện tại có trộn hai dòng tiền không.

Nếu có:

```text
SCHEMA SPLIT REQUIRED
```

---

# 22. APPROVAL 4 CẤP — KHÔNG HARD-CODE NGƯỜI

BA yêu cầu process được cấu hình:

```text
Lead
→ Manager
→ Accounting
→ Director
```

Nếu process yêu cầu 4 cấp:
- cả 4 phải duyệt;
- 1 reject → REJECTED + reason.

Approver resolved by:

```text
Approval Matrix
+ Role
+ Scope
+ effective period
```

Không:

```javascript
if (level === 1) email = "abc@...";
```

Approval events phải immutable/audited.

---

# 23. PAYMENT / APPROVAL DOUBLE ACTION

BA Appendix B yêu cầu:

```text
receive Data
approve
payment
```

phải chống xử lý đồng thời.

Dev AI phải dùng ít nhất một trong:

```text
transaction
optimistic version
idempotency key
LockService for Sheets implementation
unique constraints for DB
```

Example:

```text
2 managers click approve
→ only 1 valid transition
```

---

# 24. AUDIT LOG — PHẢI BAO PHỦ BUSINESS EVENT

Minimum fields:

```text
tenant_id
user_id
action
entity_type
entity_id
before_value
after_value
timestamp
reason
request_id
source_reference
```

Audit required for:

```text
identity / CCCD
merge
Sale reassignment
source/company/status change
attribution
policy
commission
reward
approval/reject
payment
attendance import
attendance correction
```

Không rely solely on Google Sheet Edit History.

Edit History là supporting evidence; application audit vẫn cần.

---

# 25. CURRENT V2 SHEETS VS BA 1.5 — AI PHẢI TẠO GAP MATRIX

Dev AI phải inspect tối thiểu:

```text
01_MASTER_WORKERS
02_CRM_DEALS_2026
03_AUDIT_LOG
04_LEADS_MARKETING
DM_COMPANY
DM_BRANCH
DM_LEVEL_SALE
```

và các module backend hiện tại.

Tạo table:

| BA Entity/Rule | V2 Current | Status | Gap | Action |
| --- | --- | --- | --- | --- |
| worker_profile | 01_MASTER_WORKERS | PARTIAL | dynamic fields mixed? | inspect |
| worker_phone | ? | MISSING/PARTIAL | history | design |
| recruitment_registration | 02_CRM_DEALS_2026 | LIKELY MATCH | naming/schema gap | map |
| registration_assignment | ? | MISSING/PARTIAL | history | add |
| interview dual report/confirm | ? | CHECK | overwrite risk | fix |
| employment | ? | CHECK | actual start | map |
| attendance_period | ? | CHECK | source/confirms | map |
| audit_log | 03_AUDIT_LOG | PARTIAL | domain coverage | extend |
| referral attribution | ? | CHECK | per-registration | fix |
| commission policy | current Settlement? | PHASE-GATED | versioning | review |
| reward policy | ? | PHASE-GATED | separate flow | review |

No implementation until this matrix is completed.

---

# 26. CANONICAL DATA MODEL — MINIMUM TARGET

## Identity / Access

```text
tenant
user
role
permission
user_role
role_permission
user_tenant_membership
approval_matrix
```

## Master Data

```text
company
factory
position
office
team
province
ward
bank
education_level
relationship_type
data_source
recruitment_status
working_status
referral_type
```

## Worker

```text
worker_profile
worker_phone
worker_address
worker_bank_account
worker_emergency_contact
worker_merge_history
```

## Recruitment

```text
recruitment_registration
registration_source
registration_assignment
registration_attribution
consultation_history
interview
recruitment_status_history
```

## Employment

```text
employment
worker_shift_assignment
```

## Attendance

```text
attendance_location
work_shift
worker_device
attendance_event
daily_attendance
attendance_adjustment_request
attendance_period
```

## Commission

```text
commission_policy
commission_policy_version/rule
commission_transaction
commission_approval
commission_payment
```

## Reward

```text
reward_policy
reward_policy_version
reward_policy_milestone
worker_reward
worker_reward_milestone
reward_payment
```

## Governance

```text
audit_log
outbox_event
sync_batch
sync_row_result
```

This is a logical model.

Physical implementation may remain Google Sheets for current scope or move toward PostgreSQL Data Hub.

---

# 27. PREPARE FOR POSTGRESQL DATA HUB — WITHOUT BIG BANG

BA 1.5's normalized model strongly suggests a relational storage target.

Dev AI must keep service contracts storage-agnostic.

Frontend must NOT depend on:

```text
sheetName
rowNumber
A1 range
column H
```

Frontend should depend on:

```text
worker
registration/deal
employment
attendance
status
```

Recommended gateway:

```typescript
interface WorkforceDataGateway {
  bootstrap(): Promise<Bootstrap>;
  listWorkers(query): Promise<Page<Worker>>;
  getWorker(id): Promise<Worker360>;
  listRegistrations(query): Promise<Page<Registration>>;
  createRegistration(payload): Promise<Registration>;
  moveRegistrationStatus(payload): Promise<Result>;
  getDashboard(query): Promise<Dashboard>;
}
```

Current:

```text
Sheets adapter
```

Future:

```text
Postgres adapter
```

Do not rewrite UI during migration.

---

# 28. SYNC / IMPORT REQUIREMENTS

Any Sheet/Excel import must have:

```text
sync_batch_id
source_system
source_file
source_sheet
started_at
completed_at
created_by

rows_total
rows_valid
rows_inserted
rows_updated
rows_skipped
rows_conflicted
rows_failed
```

Per row:

```text
source_row
external_id/source_key
payload_hash
target_entity
target_id
action
result
error_code
```

Required behavior:

```text
same source key + same payload
→ SKIP

same key + changed payload
→ controlled UPDATE

new key
→ INSERT
```

No duplicate from retry.

---

# 29. DATA OWNERSHIP MATRIX

Dev AI must define owner of fields.

Example:

| Data | Owner |
| --- | --- |
| worker_id | SYSTEM |
| registration_id/deal_id | SYSTEM |
| tenant_id | SYSTEM |
| phone | WORKER/CONTROLLED |
| assigned Sale | CRM |
| interview Sale report | SALE |
| interview Field confirm | FIELD |
| actual start | FIELD/EMPLOYMENT |
| attendance raw event | SYSTEM IMMUTABLE |
| confirmed workdays/hours | FIELD/MANAGER |
| policy version | POLICY ENGINE |
| calculated amount | SYSTEM |
| approved amount | APPROVAL FLOW |
| payment status | ACCOUNTING |
| audit | SYSTEM |

This prevents multiple modules writing the same truth.

---

# 30. UAT — BA 1.5 HAS 25 CRM CASES + 15 ATTENDANCE CASES

Dev AI must convert ALL BA cases into executable test matrix.

## CRM / Finance UAT

```text
UAT-01 ... UAT-25
```

Must map each to:

```text
requirement
preconditions
input
actor role
expected DB state
expected API response
expected audit
security expectation
automation status
```

## Attendance UAT

```text
ATT-01 ... ATT-15
```

Same structure.

No statement:

```text
"BA covered"
```

unless every case has test mapping.

---

# 31. ADDITIONAL UAT REQUIRED BY MULTI-TENANT ARCHITECTURE

BA 1.5 does not fully cover SaaS tenant-security tests.

Add mandatory:

```text
SEC-01 tenant A cannot read tenant B Worker
SEC-02 tenant A cannot update tenant B Registration
SEC-03 tenant A cannot export tenant B
SEC-04 forged tenant_id ignored/rejected
SEC-05 forged role rejected
SEC-06 Sale cannot access TEAM/Office data outside scope
SEC-07 Manager office scope enforced
SEC-08 Field factory/company scope enforced
SEC-09 finance endpoints inaccessible to non-finance role
SEC-10 cross-tenant cache leakage = 0
SEC-11 cross-tenant search lookup = 0
SEC-12 audit records tenant scoped
```

---

# 32. PERFORMANCE REQUIREMENTS FROM PREVIOUS HARDENING PLAN

BA completeness must not break performance.

Dev AI must preserve:

```text
minimal bootstrap
tenant-scoped versioned cache
lazy loading
bounded formulas
materialized KPI/read model
pagination
search index/fast-path
batch read/write
```

Normalized BA model does NOT mean frontend makes 20 API calls.

Backend should aggregate service data.

---

# 33. PERFORMANCE + BUSINESS INTEGRITY WARNING

Do not optimize by denormalizing authoritative facts incorrectly.

Example:

```text
registration.company_name
```

may be a display snapshot.

Canonical:

```text
company_id
```

must remain.

Similarly:

```text
worker_name_snapshot
```

may exist for report/history, but not replace worker FK.

---

# 34. PHASE SCOPE MATRIX — DEV AI MUST PRODUCE

BA 1.5 is broader than current production pilot.

Create matrix:

| Requirement | Phase | Build now? | Data foundation now? | Human approval |
| --- | --- | --- | --- | --- |
| Worker / Registration CRM | P1 | YES | YES | normal |
| Interview | P1 | YES | YES | normal |
| Employment / Start | P1 | YES | YES | normal |
| Attendance import/matching | P1 | YES | YES | normal |
| Device GPS Selfie Attendance App | SCOPE REVIEW | CONDITIONAL | schema possible | Victor/Business |
| VEN/CTV attribution | P1 data | likely | YES | business |
| Commission engine | P3 / scope review | NO by default | schema contract | business |
| Worker Reward | P3 / scope review | NO by default | schema contract | business |
| Payment | P3/P4 | NO | schema only | finance |
| 4-level finance approval | P3/P4 | NO unless prioritized | schema | business |
| Transport | OUT OF BA 1.5 | NO | NO | — |

Do not overbuild.

---

# 35. QUESTIONS / DECISIONS DEV AI MUST NOT INVENT

If evidence is missing, raise these explicitly.

## Business

1. Exact VWW definition.
2. Is L4 only fee-window end, or does any downstream rule depend on it?
3. When exactly is commission policy locked to Registration?
4. When exactly is reward policy locked?
5. Can one Registration have multiple Employment records?
6. Can one Worker hold concurrent Registrations at multiple companies?
7. Can referral attribution change after start?
8. Does attribution change require approval?
9. Which contact/profile fields require full temporal history?
10. What is authoritative source for final confirmed attendance when App and factory sheet differ?

## Security / Privacy

11. Selfie retention period.
12. GPS retention period.
13. Who can view selfie/GPS.
14. Device reset/change approval process.
15. Legal/privacy notice for attendance evidence.

## Phase

16. Are Commission/Reward being promoted into current Phase 1, or remain later phase?
17. Is worker mobile attendance app required now or pilot later?

---

# 36. REQUIRED AI DELIVERABLES BEFORE CODE CHANGE

Dev AI must produce the following artifacts.

## D1 — Requirement Traceability Matrix

File:

```text
FCS_BA1_5_REQUIREMENT_TRACEABILITY.md
```

For each BA requirement:

```text
REQ ID
BA section
Current V2 implementation
PASS/PARTIAL/MISSING/CONFLICT
Evidence file/function/sheet
Risk
Recommended action
Phase
```

## D2 — Schema Gap Matrix

```text
FCS_V2_SCHEMA_GAP_MATRIX.md
```

Must include all logical entities.

## D3 — Canonical ERD Proposal

```text
FCS_V2_CANONICAL_ERD.md
```

Show:
- PK
- FK
- tenant_id
- uniqueness
- temporal fields
- soft delete
- audit relation

## D4 — V2 Sheet → BA 1.5 Mapping

```text
FCS_V2_SHEET_TO_BA15_MAPPING.md
```

Every current column:

```text
current sheet/column
→ canonical entity/field
→ retain/move/deprecate
→ migration rule
```

## D5 — API Gap

```text
FCS_V2_API_GAP_MATRIX.md
```

Compare current endpoints against BA lifecycle.

## D6 — Phase/Security Plan

```text
FCS_BA15_PHASE_AND_SECURITY_PLAN.md
```

## D7 — UAT Matrix

```text
FCS_BA15_UAT_MATRIX.md
```

All 25 + 15 + tenant tests.

Only after D1–D7 are reviewed should implementation start.

---

# 37. IMPLEMENTATION PRIORITY AFTER REVIEW

Recommended order:

```text
P0. Resolve critical conflicts
    - L4 != VWW
    - tenant_id
    - status master
    - worker vs registration/deal semantics

P1. Worker/Profile normalization
    - phone/address temporal history
    - duplicate/merge

P2. Recruitment Registration core
    - source
    - assignment
    - status history
    - consultation

P3. Interview dual confirmation

P4. Employment / Start

P5. Attendance import / matching / confirmation

P6. VWW derived result

P7. CRM dashboards/reports

P8. Optional attendance mobile evidence pilot

P9. Phase-gated finance/reward/approval
```

Do not implement P9 before scope approval.

---

# 38. MIGRATION PRINCIPLE

No destructive migration.

Required process:

```text
current V2 backup
↓
schema snapshot
↓
source-to-target map
↓
dry-run migration
↓
row/count reconciliation
↓
ID reconciliation
↓
business reconciliation
↓
staging
↓
UAT
↓
controlled cutover
```

Do not change Worker IDs.

Do not change Deal/Registration IDs without mapping table.

---

# 39. REQUIRED DATABASE CONSTRAINTS WHEN MOVING TO POSTGRESQL

If/when Data Hub is implemented, minimum constraints:

```text
tenant_id NOT NULL
PK immutable
FK enforced
unique worker_code per tenant
unique registration_code per tenant
unique event IDs
unique active phone rules where applicable
policy version unique
one active attribution rule per registration/time window
one active assignment per defined business scope
idempotency keys for mutation/import
```

Identity/CCCD uniqueness must follow business/legal rule and merge flow; do not globally force blindly without validation.

---

# 40. OBSERVABILITY

Critical mutations need:

```text
request_id
tenant_id
actor_uid
action
entity
entity_id
duration_ms
result
error_code
```

Import:

```text
batch_id
rows total
inserted
updated
skipped
conflict
failed
```

Attendance:

```text
source
confirmation status
adjustment reference
```

Finance later:

```text
policy version
calculation snapshot
approval chain
payment reference
```

---

# 41. DEV AI STOP CONDITIONS

STOP implementation and request review if:

```text
L4/VWW conflict unresolved
tenant security cannot be proven
existing Sheet schema differs from README
production backend source unknown
migration would delete history
policy formula unclear
finance scope unclear
GPS/selfie retention undefined
a current production data field has no target mapping
UAT expected result conflicts with current behavior
```

Do not “make reasonable assumptions” on these.

---

# 42. REQUIRED OUTPUT AFTER REVIEW SESSION

Dev AI response format:

```text
BA 1.5 REVIEW STATUS:
PASS / PARTIAL / BLOCKED

CURRENT BASELINE:
repo:
branch:
commit:
sheet:
backend deployment:

CRITICAL CONFLICTS:
1.
2.
3.

SCHEMA:
PASS:
PARTIAL:
MISSING:

BUSINESS RULES:
CONFIRMED:
UNCONFIRMED:

TENANT SECURITY:
status:

PHASE SCOPE:
build now:
later:
needs approval:

UAT:
mapped:
missing:

DATA MIGRATION IMPACT:

PROPOSED NEXT CHANGE:
smallest reversible step

PRODUCTION CHANGED?
NO / YES

HUMAN DECISION REQUIRED:
```

---

# 43. DEFINITION OF COMPLETE FOR THIS REVIEW

This BA review is only complete when:

- every BA section maps to current implementation or marked missing;
- L4/VWW conflict is resolved;
- Worker/Registration mapping is approved;
- dynamic Worker child data is mapped;
- status master is single-source;
- state machine is server enforced;
- Sale report vs Field confirmation is preserved;
- Employment is separate;
- Attendance truth hierarchy is defined;
- tenant_id/data scope exists end-to-end;
- merge/history/audit design is complete;
- phase split prevents overbuilding finance/reward;
- all 40 BA UAT cases are mapped;
- additional tenant-security UAT is added;
- migration is reversible;
- no production data is lost.

---

# 44. FINAL DIRECTIVE

BA 1.5 should not be treated as “add more fields to CRM Deals”.

It defines a deeper architecture:

```text
ONE HUMAN
  ↓
ONE WORKER IDENTITY
  ↓
MANY RECRUITMENT REGISTRATIONS
  ↓
MANY OPERATIONAL EVENTS
  ↓
VERIFIED EMPLOYMENT / ATTENDANCE EVIDENCE
  ↓
DERIVED BUSINESS RESULTS
  ↓
VERSIONED FINANCIAL POLICIES
```

The immediate Dev AI mission is **not to code every module in BA 1.5**.

The immediate mission is:

> **PROVE WHAT CURRENT V2 ALREADY SATISFIES, IDENTIFY WHAT CONFLICTS, NORMALIZE THE CORE CRM/WORKFORCE DATA MODEL, PROTECT TENANT SECURITY, AND BUILD ONLY THE APPROVED PHASE.**

If a proposed change is fast but destroys history, attribution, audit, tenant isolation, policy versioning or source traceability:

**REJECT THE CHANGE.**
