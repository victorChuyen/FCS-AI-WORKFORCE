# FCS AI WORKFORCE OS
## Project Master Overview & Technical Onboarding

**Mục đích tài liệu:** Đây là tài liệu nhập môn chính thức để bất kỳ Founder/CEO, Product Manager, Developer, AI Coding Agent, QA, DevOps, Security hoặc đối tác kỹ thuật nào đọc cũng hiểu ngay mục tiêu, phạm vi, kiến trúc, trạng thái và quy tắc làm việc của dự án.

---

# 1. Project Identity

**Tên dự án:** FCS AI WORKFORCE OS

**Định vị:** AI Workforce Operating System dành cho doanh nghiệp cung ứng lao động, tuyển dụng số lượng lớn, văn phòng tuyển sinh và hệ sinh thái đối tác/KCN.

**Mục tiêu cốt lõi:** biến quy trình quản lý lao động phân mảnh thành một luồng dữ liệu thống nhất từ lúc tiếp nhận ứng viên đến lúc xác minh người lao động thực sự đi làm và phát sinh công.

---

# 2. Business Problem

Doanh nghiệp cung ứng lao động thường gặp:

- Dữ liệu nằm rải rác ở nhiều Excel/Google Sheets.
- Nhân viên lưu dữ liệu không đồng nhất.
- Khó đối chiếu danh sách phỏng vấn, đậu, phân xưởng, đi làm và chấm công.
- Dữ liệu từ đối tác/KCN gửi về không chuẩn.
- Có nguy cơ trùng SĐT/CCCD/họ tên.
- Quản lý phải dò thủ công.
- Không có một nguồn dữ liệu sự thật duy nhất.
- Khó xác định ai thực sự tạo ra doanh thu.
- Khó mở rộng nhiều văn phòng.
- Khó đảm bảo dữ liệu từng doanh nghiệp không bị lẫn.

---

# 3. North Star Metric — VWW

**VWW = Verified Working Worker**

Chuỗi giá trị chuẩn:

```text
Lead / Worker
→ Interview
→ Passed
→ Assignment
→ Start Work
→ Attendance
→ Matching
→ Verified Working Worker (VWW)
```

Chỉ khi dữ liệu đi làm được đối soát với dữ liệu chấm công thực tế và được xác minh, lao động mới được tính là VWW.

---

# 4. Roadmap 6 Giai Đoạn

## Giai đoạn 1 — Workforce Core & Data Management

- Tập trung dữ liệu đầu vào/đầu ra.
- Quản lý lao động.
- Quản lý phỏng vấn.
- Quản lý phân xưởng/đi làm.
- Nhập chấm công.
- Matching dữ liệu đối tác.
- Xác định lao động phát sinh công thực tế.

**Đây là scope production pilot hiện tại.**

## Giai đoạn 2 — AI Worker Care

- AI chăm sóc lao động.
- Duy trì tương tác.
- Tái kích hoạt khi lao động có nhu cầu tìm việc/chuyển việc.
- Kết nối Zalo và các kênh phù hợp.

## Giai đoạn 3 — Rewards & Revenue Automation

- Tính thưởng lao động.
- Tính thưởng nhân viên.
- Tính doanh thu theo từng đối tác.
- Xuất báo cáo hỗ trợ kế toán.

## Giai đoạn 4 — Internal Finance Reconciliation

- Quản lý thu/chi.
- Công nợ.
- Đối soát nội bộ.
- Báo cáo tài chính theo văn phòng.

## Giai đoạn 5 — AI Marketing Automation

- Mỗi văn phòng có kênh truyền thông riêng.
- Facebook, TikTok và nền tảng phù hợp.
- AI hỗ trợ nội dung, video, lập lịch và phân phối.

## Giai đoạn 6 — Optimization & Replication

- Tối ưu quy trình.
- Chuẩn hóa triển khai.
- Tự động hóa công việc lặp lại.
- Nhân bản nhanh cho nhiều văn phòng/doanh nghiệp.

---

# 5. Current Product Scope

Hiện tại tập trung:

```text
PHASE 1
WORKFORCE CORE
MULTI-TENANT SAAS
REAL DATA
PRODUCTION PILOT
```

Chưa overbuild:

- AI Worker Care
- Payroll
- Finance
- Rewards
- Marketing Automation
- Billing Gateway

Mục tiêu ngắn hạn:

> Có một tenant pilot thật, dữ liệu thật, luồng thật, đủ ổn định để demo khách hàng và chốt tiền đặt cọc.

---

# 6. Product Principles

## 6.1 Real Data First

Production không fallback về Mock Data.

Nếu backend mất kết nối:

```text
MẤT KẾT NỐI
```

Nguyên tắc:

> REAL ZERO IS BETTER THAN FAKE DEMO DATA.

## 6.2 One Operator Friendly

Hệ thống phải:

- dễ dùng,
- ít thao tác,
- rõ việc cần xử lý,
- giảm dò bảng thủ công,
- ưu tiên một người quản lý có thể vận hành.

## 6.3 Mobile First

Ưu tiên:

- Android
- iPhone
- mobile browser

UI phải touch-friendly, nút rõ, luồng ngắn, ít thuật ngữ kỹ thuật.

---

# 7. Multi-Tenant SaaS Architecture

```text
                 FCS PLATFORM
                      │
                      ▼
          FCS_SUPER_ADMIN_MASTER
                      │
           ┌──────────┴──────────┐
           │                     │
           ▼                     ▼
      FCS-000001            FCS-000002
           │                     │
     ┌─────┴─────┐         ┌─────┴─────┐
     │           │         │           │
     ▼           ▼         ▼           ▼
   DATA      MANAGEMENT   DATA      MANAGEMENT
```

Tenant ID chuẩn:

```text
FCS-000001
FCS-000002
FCS-000003
...
```

Mỗi doanh nghiệp là một tenant riêng.

---

# 8. Tenant Data Isolation

Mỗi tenant có 2 Google Spreadsheet riêng:

```text
FCS-000001_DATA
FCS-000001_MANAGEMENT
```

Lợi ích:

- bảo mật,
- backup độc lập,
- bàn giao độc lập,
- migrate dễ,
- khóa tenant dễ,
- không trộn dữ liệu giữa các công ty.

---

# 9. Super Admin Master

File platform trung tâm:

```text
FCS_SUPER_ADMIN_MASTER
```

File này không chứa dữ liệu lao động khách hàng.

Các tab chuẩn:

```text
01_TENANTS
02_TENANT_FILES
03_GLOBAL_USERS
04_USER_TENANT_ACCESS
05_PLANS
06_FEATURE_FLAGS
07_PLATFORM_CONFIG
08_SYSTEM_AUDIT
```

---

# 10. Tenant DATA Spreadsheet

Ví dụ:

```text
FCS-000001_DATA
```

Các bảng nghiệp vụ:

```text
01_WORKER_INBOX
02_INTERVIEW_INBOX
03_ASSIGNMENT_INBOX
04_WORKERS_MASTER
05_PIPELINE_EVENTS
06_INTERVIEWS
07_ASSIGNMENTS
08_ATTENDANCE_RAW
09_ATTENDANCE
10_MATCHING_REVIEW
11_ACTION_QUEUE
12_AUDIT_LOG
```

---

# 11. Tenant MANAGEMENT Spreadsheet

Ví dụ:

```text
FCS-000001_MANAGEMENT
```

Các bảng:

```text
01_COMPANY_PROFILE
02_OFFICES
03_STAFF
04_PARTNERS
05_JOBS
06_ROLES
07_ROLE_PERMISSIONS
08_CONFIG
09_SLA_RULES
10_FEATURE_CONFIG
11_INTEGRATIONS
12_SUBSCRIPTION_INFO
```

---

# 12. Golden Flow

Golden Flow là luồng chuẩn End-to-End:

```text
1. Worker Create
2. Interview Create
3. Interview Passed
4. Assignment Create
5. Assignment Start
6. Attendance Import
7. Matching
8. VWW
9. Dashboard Update
```

Golden Flow phải chạy xuyên suốt:

```text
Frontend
→ API
→ Apps Script
→ Tenant Resolver
→ Google Sheets
→ Business Logic
→ Dashboard
```

---

# 13. Pipeline Standard

```text
NEW
INTERVIEWED
PASSED
WAITING_START
WORKING
VWW
```

Tương ứng:

```text
Chặng 1 — Lao động mới
Chặng 2 — Phỏng vấn
Chặng 3 — Đã đậu
Chặng 4 — Chờ đi làm
Chặng 5 — Đang làm
Chặng 6 — Verified Working Worker
```

---

# 14. Attendance Matching

Matching dựa trên:

- Worker ID
- SĐT
- CCCD
- Họ tên
- Đơn vị/xưởng
- các trường liên quan

Nguyên tắc pilot:

```text
>= 90%  → Auto Match / Fast Confirm
75–89%  → Manager Review
< 75%   → Reject / Manual Review
```

Ngưỡng chính thức nên lấy từ config, không hardcode lâu dài.

---

# 15. Action Queue

Ví dụ:

- Chấm công chưa khớp.
- Lao động đã đậu chưa xác nhận đi làm.
- SLA quá hạn.
- Hồ sơ nghi trùng.
- Matching cần duyệt.

Mục tiêu:

> Quản lý mở app và biết ngay hôm nay cần xử lý việc gì.

---

# 16. Duplicate Control

Duplicate detection dựa trên:

- Phone
- CCCD
- Họ tên
- tín hiệu kết hợp

Khi nghi trùng:

- không tự tạo worker thứ hai,
- cảnh báo quản lý,
- cho xem hồ sơ hiện tại,
- chỉ tạo riêng khi người có quyền xác nhận.

---

# 17. Authentication

Sử dụng:

```text
Firebase Authentication
```

Hỗ trợ:

- Google login
- Email/password

Firebase là lớp identity, không thay thế authorization backend.

---

# 18. RBAC

Role chính:

```text
PLATFORM_SUPER_ADMIN
TENANT_ADMIN
TENANT_MANAGER
RECRUITER
VIEWER
```

Backend phải enforce quyền.

Ẩn nút trên frontend không được xem là authorization.

---

# 19. Canonical TenantContext

```json
{
  "firebaseUid": "...",
  "email": "...",
  "platformRole": "...",
  "tenantId": "FCS-000001",
  "tenantRole": "...",
  "staffId": "...",
  "allowedOfficeIds": [],
  "planCode": "PILOT",
  "features": [],
  "dataSpreadsheetId": "...",
  "managementSpreadsheetId": "..."
}
```

Không expose Google Sheet IDs ra customer UI.

---

# 20. Frontend

Frontend hiện dùng:

```text
Google AI Studio
React
Vite
TypeScript
```

Màn hình chính:

```text
Today / Command Center
Workers
Pipeline
Confirmations
Results
Worker 360
Account
Platform Tenants
```

---

# 21. Real Data States

```text
DỮ LIỆU THỰC
ĐANG KẾT NỐI DỮ LIỆU
MẤT KẾT NỐI
```

Production không tự fallback sang Mock.

---

# 22. Backend

Backend:

```text
Google Apps Script Web App
```

Vai trò:

- API
- business logic
- tenant resolution
- Google Sheets access
- matching
- duplicate detection
- dashboard aggregation
- audit
- security controls
- ID generation

---

# 23. Apps Script Modular Structure

Các file hiện tại:

```text
00_Main.gs
01_Config.gs
02_Router.gs
03_Response.gs
04_HealthService.gs
05_WorkerService.gs
06_DashboardService.gs
07_ActionService.gs
08_PipelineService.gs
09_SheetRepository.gs
10_ConfigRepository.gs
11_AuditRepository.gs
12_IdService.gs
13_NormalizeService.gs
14_DuplicateService.gs
15_SecurityService.gs
16_Utils.gs
17_Tests.gs
18_InterviewService.gs
19_AssignmentService.gs
20_AttendanceService.gs
21_MatchingService.gs
22_QADataReset.gs
```

---

# 24. Apps Script Config

Script Property quan trọng:

```text
SUPER_ADMIN_MASTER_ID
```

Giá trị là Spreadsheet ID của:

```text
FCS_SUPER_ADMIN_MASTER
```

Không lưu hàng loạt tenant Sheet ID thành Script Properties.

Tenant mapping phải nằm tại:

```text
FCS_SUPER_ADMIN_MASTER
→ 02_TENANT_FILES
```

---

# 25. Frontend Environment

Frontend chỉ nên biết:

```text
VITE_API_BASE_URL
Firebase public config
VITE_USE_MOCK_API=false
```

Không đưa vào frontend:

```text
FCS_000001_DATA_SHEET_ID
FCS_000001_MANAGEMENT_SHEET_ID
SUPER_ADMIN_MASTER_ID
```

---

# 26. Firebase

Firebase hiện dùng cho Authentication và identity.

Tenant authorization phải do backend/platform master kiểm soát.

---

# 27. Security Model

Đã có:

- Firebase Authentication
- Tenant UI context
- RBAC concept
- Separate tenant data files
- Apps Script backend
- Real Data mode
- No mock fallback

Cần tiếp tục hardening:

- server-side tenant resolution,
- cross-tenant isolation,
- server-side Firebase ID Token verification,
- optional Cloudflare Gateway/proxy sau này.

---

# 28. Current P0 Blocker

Production Acceptance Test gần nhất:

```text
FCS-000001 NOT READY
```

Nguyên nhân:

```text
Deployed backend = v3.2.0
Architecture = SINGLE TENANT
```

Trong khi frontend đã đi theo V4 Multi-Tenant.

Target health:

```json
{
  "version": "4.0.0",
  "architecture": "MULTI_TENANT",
  "dataMode": "REAL",
  "tenantIsolation": true
}
```

---

# 29. QA Data Reset

File:

```text
22_QADataReset.gs
```

Mục tiêu:

- reset test data,
- giữ header/schema,
- seed dataset QA nhỏ,
- không xóa Super Admin Master,
- không xóa Management config.

Dataset QA mục tiêu:

```text
NEW = 1
INTERVIEWED = 1
PASSED = 1
WAITING_START = 1
WORKING = 1
VWW = 1

TOTAL = 6
```

Sau đó chạy thêm một Golden Flow thật bằng UI/API.

---

# 30. Technology Stack

```text
Google AI Studio
React
Vite
TypeScript
Firebase Authentication
Google Apps Script
Google Sheets
Google Drive
GitHub
Cloudflare
Antigravity IDE
```

Tool hỗ trợ:

```text
clasp
Firebase CLI
Cloudflare Wrangler
GitHub Actions
```

---

# 31. Google-First Strategy

Giai đoạn đầu ngân sách hạn chế.

Ưu tiên:

- Google Sheets = data layer nhanh, dễ audit.
- Apps Script = backend/business automation chi phí thấp.
- Firebase = Authentication.
- Drive = file storage.
- AI Studio = prototype UI nhanh.

Không dùng Looker Studio.

Hạn chế dùng n8n cho việc đối chiếu đơn giản nếu Apps Script xử lý tốt.

---

# 32. Source Control Strategy

Từ giai đoạn hiện tại:

> GitHub = Source of Truth.

Không tiếp tục mô hình:

```text
Chat
→ copy code
→ paste browser
→ khó rollback
```

Mô hình mới:

```text
Antigravity IDE
→ Git
→ GitHub
→ Test
→ Deploy
```

---

# 33. Antigravity IDE

Antigravity được chọn làm môi trường development chính.

Mục tiêu:

- toàn repo trong một workspace,
- AI coding agent hiểu toàn project,
- search toàn repo,
- diff,
- branch,
- terminal,
- test,
- deployment,
- rollback.

---

# 34. Target Monorepo

```text
FCS_AI_WORKFORCE_OS/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── apps-script/
│   ├── 00_Main.gs
│   ├── 01_Config.gs
│   ├── ...
│   ├── 22_QADataReset.gs
│   └── appsscript.json
│
├── shared/
│   ├── types/
│   ├── schemas/
│   └── constants/
│
├── scripts/
│   ├── qa/
│   ├── deploy/
│   └── tenant/
│
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── security/
│   └── qa/
│
├── .github/
│   └── workflows/
│
├── .env.example
├── .gitignore
└── README.md
```

---

# 35. Git Branch Strategy

```text
main
develop
v4-multitenant
```

- `main` = production stable.
- `develop` = integration.
- `v4-multitenant` = feature branch hoàn thiện SaaS Multi-Tenant.

---

# 36. clasp

Apps Script nên sync bằng:

```bash
clasp login
clasp clone <SCRIPT_ID>
clasp pull
clasp push
```

Mục tiêu:

- không sửa nhiều file bằng browser,
- dễ quản lý version,
- dễ diff,
- dễ code trong Antigravity.

---

# 37. Cloudflare

Target domain:

```text
fcs.breaths.live
```

Cloudflare có thể đảm nhiệm:

- frontend deployment,
- DNS,
- caching,
- security edge,
- API gateway/proxy ở giai đoạn sau.

---

# 38. Deployment Strategy

Frontend:

```text
GitHub
→ build
→ Cloudflare
→ fcs.breaths.live
```

Backend:

```text
Antigravity
→ clasp push
→ Apps Script
→ NEW Web App deployment
```

Sau backend change lớn:

- tạo deployment mới,
- test `/exec`,
- chỉ update frontend khi health PASS.

---

# 39. Development Rules

## Full File / Versioned Change

Khi làm thủ công: ưu tiên full file để giảm copy lỗi.  
Khi đã dùng Git: dùng diff/branch/commit chuẩn.

## No Silent Fallback

Không fallback Mock.

## No Hardcoded Business Metrics

Không hardcode:

- VWW,
- pipeline count,
- dashboard count,
- tỷ lệ,
- tenant data.

## Backend Authorization

Không tin:

```text
tenantId
role
office
```

chỉ vì frontend gửi lên.

## No Cross-Tenant Leakage

Tenant không được thấy:

- worker tenant khác,
- office tenant khác,
- staff tenant khác,
- Sheet ID tenant khác.

## Test Before Deploy

Không deploy production khi chưa:

- self check,
- health check,
- Golden Flow test,
- tenant isolation test.

---

# 40. Release Gate

Production Pilot chỉ PASS khi:

```text
Backend Version = 4.0.0
Architecture = MULTI_TENANT
DataMode = REAL
TenantIsolation = true
```

Và:

```text
FCS_SUPER_ADMIN_MASTER = PASS
FCS-000001 registry = PASS
DATA file = PASS
MANAGEMENT file = PASS
Golden Flow = PASS
Cross Tenant Test = PASS
```

---

# 41. Production Acceptance

Tối thiểu phải test:

```text
system.health
tenant.health
worker.list
worker.get
worker.create
interview.create
interview.update
assignment.create
assignment.start
attendance.import
matching
dashboard.summary
action.list
```

---

# 42. Cross-Tenant Test

Tạo tenant QA:

```text
FCS-000002
```

File riêng:

```text
FCS-000002_DATA
FCS-000002_MANAGEMENT
```

Tạo một worker chỉ tồn tại ở FCS-000002.

Khi user chỉ có quyền FCS-000001 cố lấy dữ liệu FCS-000002:

```text
TENANT_ACCESS_DENIED
```

Không được trả dữ liệu.

---

# 43. Customer Pilot Strategy

Không cần import toàn bộ data khách trước đặt cọc.

Để demo:

- một tenant thật,
- vài record thật/QA kiểm soát,
- Golden Flow thật,
- dashboard thật,
- data isolation thật.

Sau đặt cọc mới:

- import dữ liệu hàng loạt,
- cấu hình office,
- staff,
- partners,
- jobs,
- SLA,
- phân quyền thực tế.

---

# 44. Phase 1 Demo Story

```text
1. Đăng nhập
2. Chọn Tenant
3. Xem Today Command Center
4. Thêm lao động
5. Tạo phỏng vấn
6. Mark Passed
7. Phân xưởng
8. Start Work
9. Import Attendance
10. Matching
11. Xác minh VWW
12. Dashboard tự cập nhật
```

Thông điệp demo:

> Từ dữ liệu tuyển dụng phân mảnh đến một luồng vận hành khép kín, xác định chính xác lao động thực sự đi làm và phát sinh công.

---

# 45. Out of Scope — Current Pilot

Chưa triển khai production:

```text
AI Worker Care
Payroll
Rewards
Finance
Marketing Automation
Billing
Advanced Analytics
Full AI Agent autonomy
```

---

# 46. Current Project Status

## Đã đạt

- UI Workforce OS.
- Mobile responsive.
- Firebase Auth.
- Role UI.
- Worker screens.
- Pipeline screens.
- Confirmation screens.
- Results screens.
- Golden Flow concept.
- Apps Script modular backend V3.x.
- Attendance service.
- Matching service.
- Real Data mode behavior.
- Multi-Tenant UI concept.
- Super Admin tenant management concept.
- QA reset/seed tooling.
- Google-first architecture.

## Đang hoàn thiện

- Backend V4 Multi-Tenant.
- Super Admin Registry operational.
- TenantContext server-side.
- Backend isolation.
- Cross-tenant test.
- Real Golden Flow V4.
- Production deployment.

---

# 47. Next Execution Priorities

```text
P0-1  Hoàn thiện FCS_SUPER_ADMIN_MASTER
P0-2  Đăng ký FCS-000001 tenant files
P0-3  Nâng Apps Script backend lên V4 MULTI_TENANT
P0-4  Tenant Resolver + backend RBAC
P0-5  Golden Flow trên dữ liệu thật
P0-6  Tạo FCS-000002 QA tenant
P0-7  Cross-tenant test
P0-8  Deploy Apps Script V4 mới
P0-9  Cập nhật VITE_API_BASE_URL
P0-10 Deploy fcs.breaths.live
P0-11 Customer Pilot
P0-12 Chốt đặt cọc
```

---

# 48. Onboarding Checklist

Trước khi code:

- [ ] Đọc toàn bộ tài liệu này.
- [ ] Kiểm tra branch.
- [ ] `git pull`.
- [ ] Kiểm tra `.env`.
- [ ] Không commit secrets.
- [ ] Kiểm tra Script Properties.
- [ ] Xác nhận `SUPER_ADMIN_MASTER_ID`.
- [ ] Xác nhận tenant hiện tại.
- [ ] Xác nhận API URL.
- [ ] Xác nhận backend version.
- [ ] Không bật Mock.
- [ ] Chạy health test.
- [ ] Chạy QA tests.

Sau khi code:

- [ ] Test.
- [ ] `git diff`.
- [ ] Review tenant security.
- [ ] Commit rõ ràng.
- [ ] Push branch.
- [ ] Deploy staging/pilot.
- [ ] Acceptance test.
- [ ] Chỉ merge `main` khi PASS.

---

# 49. Security Checklist

- [ ] Không commit Firebase private secrets.
- [ ] Không commit API keys bí mật.
- [ ] Không commit Apps Script credentials.
- [ ] Không public Spreadsheet IDs nếu không cần.
- [ ] Không tin `tenantId` từ client.
- [ ] Không tin `role` từ client.
- [ ] Backend enforce RBAC.
- [ ] Backend enforce office scope.
- [ ] Cross-tenant tests.
- [ ] Audit access denial.
- [ ] Review token verification.
- [ ] Disable Mock in production.

---

# 50. Definition of Done — Phase 1

Phase 1 hoàn thành khi:

> Một khách hàng có thể đăng nhập, chỉ thấy công ty của họ, quản lý người lao động, theo dõi pipeline từ tiếp nhận đến đi làm, nhập/đối chiếu chấm công, xác định VWW, xử lý ngoại lệ và xem kết quả — không nhìn thấy dữ liệu của bất kỳ tenant nào khác.

---

# 51. Final Project Statement

FCS AI WORKFORCE OS không phải một dashboard đơn thuần.

Nó là một Workforce Operating System:

```text
DATA
→ WORKFLOW
→ EXCEPTION
→ DECISION
→ VERIFIED RESULT
```

Giai đoạn 1 tập trung trả lời câu hỏi kinh doanh:

> Trong toàn bộ danh sách tuyển dụng, ai thực sự đã đi làm và phát sinh công?

Khi Workforce Core ổn định mới mở rộng sang:

```text
AI Worker Care
Rewards
Revenue
Finance
Marketing
Automation
Multi-Office Scale
```

---

# 52. Start Here for Any New Work

Bất kỳ người hoặc AI Agent nào bắt đầu dự án phải:

```text
1. Read this document
2. Inspect repository
3. Check branch
4. Check current backend version
5. Check tenant context
6. Run health tests
7. Confirm current P0
8. Make the smallest safe change
9. Test
10. Commit
11. Deploy only after PASS
```

**Project Principle**

> Build the stable Workforce Core first.  
> Prove the Golden Flow.  
> Protect tenant data.  
> Then scale.
