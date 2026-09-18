# 🏆 FCS AI WORKFORCE OS V2 — ENTERPRISE CRM & WORKFORCE OS (CLEAN SLATE)
> **MANDATORY SYSTEM DIRECTIVE — SINGLE SOURCE OF TRUTH CHO PHÂN HỆ V2**  
> **Executive Leadership:** Chairman Victor Chuyen (Founder) & AI CEO Lucky (Antigravity)  
> **Ngày cập nhật:** 2026-09-17 | **Kiến trúc:** Dual-Engine Clean Architecture (Gauzy Inspired)  
> **Trạng thái kiểm định:** 🟢 **38/38 Tests Diagnostic Suite Đạt 100% — TypeScript Clean (0 Lỗi)**  
> **Tài liệu Handoff:** [FCS_ANTIGRAVITY_EXECUTION_HANDOFF_2026-09-17.md](file:///D:/FCS-AI-WORKFORCE/FCS_ANTIGRAVITY_EXECUTION_HANDOFF_2026-09-17.md)  
> **Mục tiêu triển khai:** Tên miền mới độc lập **`https://fcs-v2.breaths.live`** (hoặc `fcs-crm.breaths.live`) để so sánh đối chứng song song với V1.

---

## ⚡ 4 NGUYÊN TẮC BẤT BIẾN CỦA V2 (NON-NEGOTIABLE LAWS)

### 🔴 ĐIỀU 1: TÔN TRỌNG SỨC MẠNH BẢN ĐỊA CỦA GOOGLE SHEETS (ZERO OVER-THINKING CODE)
- Việc gì Google Sheets làm được bằng công cụ bản địa (Native Tools) thì để Google Sheets làm:
  - Phân quyền khóa dải ô theo Gmail (`coach.chuyen@gmail.com`) qua **Protected Ranges**.
  - Dropdown danh mục và từ chối nhập sai (**Data Validation & Reject Input**) cho CCCD 12 số, SĐT 10 số.
  - Tự động tính toán công thức tổng hợp, đếm, tính tuổi qua **ARRAYFORMULA, DATEDIF, COUNTIFS**.
  - Truy vết lịch sử sửa đổi từng ô qua tính năng **Show edit history** của Google Sheets.
- Tuyệt đối cấm viết code phức tạp để làm lại những gì Google Sheets đã có sẵn!

### 🔴 ĐIỀU 2: TÁCH BẠCH 2 TẦNG DỮ LIỆU CỐT LÕI (2-TIER DATA SEPARATION)
1. **Tầng 1: Master Worker Profile (Hồ sơ gốc con người):**
   - 34 cột chuẩn VNeID (`PROFILE.html`).
   - Mỗi người chỉ có duy nhất 1 bản ghi bất biến trong đời, định danh bằng CCCD 12 số và `worker_id` tuần tự (`WK-000001`...).
2. **Tầng 2: CRM Recruitment Deal (Đợt ứng tuyển tuyển dụng):**
   - 22 cột theo dõi toàn diện vòng đời 19 Level Sale (`C3` → `L4`).
   - Mỗi lần người lao động ứng tuyển vào 1 trong 29 nhà máy là 1 Deal độc lập (`DL-2026-000001`...).

### 🔴 ĐIỀU 3: KHÓA BẤT BIẾN KHÓA CHÍNH (PRIMARY KEY ID)
- Cột A (`worker_id` và `deal_id`) bị khóa cứng qua Protected Range. Chỉ có tài khoản của Chairman Victor (`coach.chuyen@gmail.com`) và API Backend mới có quyền ghi.
- Mọi ID sinh ra qua `LockService.getScriptLock(30000)` chống trùng lặp và nhảy cóc ID tuyệt đối.

### 🔴 ĐIỀU 4: VẬN HÀNH ĐỘC LẬP & TÊN MIỀN RIÊNG BIỆT
- V2 hoạt động trên hạ tầng Google Sheets riêng, Backend Apps Script riêng, và Cloudflare Pages riêng: **`fcs-v2.breaths.live`**.
- Không làm ảnh hưởng hay gián đoạn hệ thống V1 (`fcs.breaths.live`).

---

## 🗺️ CẤU TRÚC THƯ MỤC V2 — MODULAR ARCHITECTURE (V2 REPOSITORY MAP)

```
D:/FCS-AI-WORKFORCE/v2/
├── README.md                                    ← [SINGLE SOURCE OF TRUTH] Bản chỉ thị tối cao V2
├── schema/                                     ← Đặc tả cấu trúc dữ liệu & Danh mục chuẩn
│   ├── MASTER_WORKERS_SCHEMA.json              ← 34 Cột VNeID + Định dạng + Khóa bảo vệ
│   ├── CRM_DEALS_SCHEMA.json                   ← 22 Cột CRM Deals 19 Level Sale + VLOOKUP
│   ├── TAXONOMY_COMPANIES.json                 ← 29 Công ty đối tác (WNC, Foxconn, Luxshare...)
│   ├── TAXONOMY_BRANCHES.json                  ← 8 Chi nhánh tuyển dụng (Hà Nam, Bắc Giang...)
│   └── TAXONOMY_LEVEL_SALES.json               ← 19 Trạng thái Level Sale (C3 -> L4)
├── backend/                                    ← Backend Engine Apps Script V2 (10 Module)
│   ├── 00_Config.gs                            ← Cấu hình hệ thống, Spreadsheet ID, Helpers
│   ├── 01_Router.gs                            ← REST API Gateway (doGet/doPost + 15 Action Routes)
│   ├── 02_WorkerService.gs                     ← Master Worker: Create, Get (360°), Update, Soft Delete, List (Paginated)
│   ├── 03_DealService.gs                       ← CRM Deal: Create, Move Stage, Update, Soft Delete, List (Kanban)
│   ├── 04_TaxonomyService.gs                   ← Taxonomy: 29 Companies, 8 Branches, 19 Level Sale
│   ├── 05_SecurityService.gs                   ← Protected Ranges: Lock Col A IDs, Lock Taxonomy, Lock Audit
│   ├── 06_ValidationService.gs                 ← Validation 2 tầng: API Reject + Dropdown Reject Input
│   ├── 07_AuditService.gs                      ← Audit Trail: LOG-YYYYMMDD-XXXX, CDC, List paginated
│   ├── 08_TriggerService.gs                    ← onEdit Trigger: Revert ID/Audit, Auto-log Sheet edits
│   ├── 09_DashboardService.gs                  ← KPI Dashboard: Funnel, VWW, Branch/Company distribution
│   ├── Code.gs                                 ← Bundle tổng hợp toàn bộ module (dùng cho Paste 1-Click)
│   └── appsscript.json                         ← Manifest Google Apps Script (timezone, OAuth scopes)
├── apps_script_api_payload.json                ← Payload JSON để push lên Apps Script API
├── backend_files.json                          ← Bundle tất cả file dạng JSON cho backup/restore
└── scripts/                                    ← Công cụ tự động hóa & Kiểm thử
    ├── push_v2_to_apps_script.mjs              ← Inventory & hướng dẫn push lên Apps Script
    └── test_v2_api.mjs                         ← Kiểm thử chẩn đoán toàn diện API V2
```

---

## 📊 APPS SCRIPT V2 — MODULAR FILE INVENTORY (14 SERVICE MODULES)

| # | File | Lines | Chức năng | Tính năng Enterprise |
|---|---|:---:|---|---|
| 0 | `00_Config.gs` | 95 | Cấu hình, Spreadsheet ID, Helpers, renameSheetsToOption1 | Tab Names: `01_MASTER_WORKERS`, `02_CRM_DEALS_2026`, `03_AUDIT_LOG`, `04_LEADS_MARKETING`, `DM_*` |
| 1 | `01_Router.gs` | 234 | HTTP Gateway 23 Endpoints, Setup Platform orchestrator | `doGet`, `doPost`, Action-based routing |
| 2 | `02_WorkerService.gs` | 470 | Master Worker CRUD đầy đủ + Pagination + Search + Filter | Create (Atomic Lock), Get (360° + Deals History), Update (Audit Trail), Soft Delete, List |
| 3 | `03_DealService.gs` | 410 | CRM Deal CRUD + Move Stage + VLOOKUP + Kanban Filters | Create, Move Stage (auto VWW on L4), Update, Soft Delete, List |
| 4 | `04_TaxonomyService.gs` | 131 | Taxonomy init: 29 Companies, 8 Branches, 19 Levels | handleGetTaxonomyV2_ API |
| 5 | `05_SecurityService.gs` | 55 | Protected Ranges: Lock Col A, Lock Taxonomy, Lock Audit | Gmail-based permissions (`coach.chuyen@gmail.com`) |
| 6 | `06_ValidationService.gs` | 233 | Validation 2 tầng: API Reject + 13 Dropdown Rules + Plain Text | validateWorkerPayloadOrReject_, validateDealPayloadOrReject_, applyNativeDataValidations_ |
| 7 | `07_AuditService.gs` | 94 | Audit Trail: `LOG-YYYYMMDD-XXXX`, CDC, List paginated | logAuditActionV2_, handleListAuditLogsV2_ (filter by record_id, sheet_name) |
| 8 | `08_TriggerService.gs` | 85 | onEdit Simple Trigger: Revert ID/Audit, Auto-log edits | Auto-update `updated_at` & `updated_by` on Sheet edits |
| 9 | `09_DashboardService.gs` | 134 | KPI: Funnel Conversion, VWW, Branch/Company distribution | North Star VWW, 19-Stage breakdown, Conversion rates |
| 10 | `10_BatchImportService.gs` | 244 | Tiếp nhận hàng loạt 100-500 ứng viên, khử trùng O(1) RAM | Tự động phân loại C3 / C3.1 / C3.2 trong bộ nhớ |
| 11 | `11_FieldDispatchService.gs` | 260 | Lập Roster phỏng vấn xưởng, check-in cổng nhà máy 1 chạm | Quét CCCD check-in C3.2 -> L1 phỏng vấn |
| 12 | `12_AttendanceMatchingService.gs` | 255 | Đối soát bảng chấm công ca/ngày, tự động kích hoạt VWW | Tự động nâng stage L4 khi đạt 3-7 ngày làm |
| 13 | `13_SettlementService.gs` | 230 | Đối soát doanh thu, tính hoa hồng Recruiter/CTV | Báo cáo commission và duyệt chi minh bạch |
| 14 | `14_LeadMarketingService.gs` | 320 | Lưu Lead vào 04_LEADS_MARKETING, gửi mail tức thì | Tích hợp MailApp gửi Coach.Chuyen@gmail.com + link Zalo 1 chạm |
| | `Code.gs` | 3,443 | Master Bundle chứa toàn bộ 14 Modules theo thứ tự phụ thuộc | Tối ưu 100% cho 1-Click Paste lên Apps Script |
| | `appsscript.json` | 11 | Manifest (timezone Asia/Ho_Chi_Minh, OAuth scopes) | |
| | **TỔNG CỘNG** | **~3,443** | **14 Modular Service Files + 1 Manifest + Master Bundle** | |

---

## 📋 DANH MỤC API GATEWAY V2 (15 ENDPOINTS)

### Worker Endpoints (5)
| Endpoint Action | Method | Mô tả chức năng |
|---|:---:|---|
| `v2.workers.list` | `GET` | Danh sách Workers có phân trang (`offset`, `limit`), tìm kiếm (`search`) & lọc (`branch`, `company`, `status`, `include_deleted`) |
| `v2.worker.get` | `GET` | Worker 360° View: Hồ sơ gốc 34 cột + Toàn bộ lịch sử Deals (lookup by `worker_id`, `phone`, hoặc `cccd`) |
| `v2.worker.create` | `POST` | Tiếp nhận hồ sơ mới (Atomic Lock + Validation 2 tầng + Dedup Phone/CCCD) |
| `v2.worker.update` | `POST` | Cập nhật thông tin worker kèm Audit Trail từng trường (32 editable fields) |
| `v2.worker.soft_delete` | `POST` | Xóa mềm (bắt buộc lý do, ghi `ĐÃ XÓA (DELETED)`, log Audit) |

### CRM Deal Endpoints (5)
| Endpoint Action | Method | Mô tả chức năng |
|---|:---:|---|
| `v2.deals.list` | `GET` | Danh sách Deals có phân trang & lọc Kanban (`stage`, `branch`, `company`, `assigned_sale`, `include_deleted`) |
| `v2.deal.create` | `POST` | Tạo Deal mới (Atomic Lock + VLOOKUP bản địa cho full_name/phone/cccd) |
| `v2.deal.move_stage` | `POST` | Chuyển trạng thái Level Sale (auto set VWW=true khi L4, ghi Audit) |
| `v2.deal.update` | `POST` | Cập nhật Deal kèm Audit Trail (13 editable fields) |
| `v2.deal.soft_delete` | `POST` | Xóa mềm Deal (bắt buộc lý do, đánh dấu DELETED, log Audit) |

### Platform & Analytics (5)
| Endpoint Action | Method | Mô tả chức năng |
|---|:---:|---|
| `v2.health` | `GET` | Kiểm tra tình trạng hoạt động V2 Engine |
| `v2.system.setup` | `POST` | Khởi tạo toàn bộ: tabs, taxonomy, dropdown, protected ranges |
| `v2.taxonomy.get` | `GET` | Lấy danh mục 29 Công ty, 8 Chi nhánh, 19 Level Sale |
| `v2.audit.list` | `GET` | Sổ cái kiểm toán (filter by `record_id`, `sheet_name`, `limit`) |
| `v2.dashboard.stats` | `GET` | KPI Dashboard: Total Workers/Deals, VWW, Funnel Conversion, Branch/Company distribution |

---

## 🔧 GOOGLE SPREADSHEET V2 LIVE

- **Tên:** `FCS_V2_WORKFORCE_CRM_MASTER`
- **Spreadsheet ID:** `1YAVNiPtAiYrxEThvIgWuR0PAHJbDCDqrXCz5SNwrxXE`
- **URL:** [Mở Google Sheet V2](https://docs.google.com/spreadsheets/d/1YAVNiPtAiYrxEThvIgWuR0PAHJbDCDqrXCz5SNwrxXE/edit)
- **Tabs chuẩn Phương án 1:**

  | Tab | Mô tả | Trạng thái |
  |---|---|:---:|
  | `01_MASTER_WORKERS` | Hồ sơ Master Worker 34 cột VNeID | ✅ |
  | `02_CRM_DEALS_2026` | CRM Deals phễu tuyển dụng 19 Level Sale | ✅ |
  | `03_AUDIT_LOG` | Sổ cái kiểm toán bất biến (LOG-YYYYMMDD-XXXX) | ✅ |
  | `DM_COMPANY` | 29 Công ty đối tác | ✅ |
  | `DM_BRANCH` | 8 Chi nhánh tuyển dụng | ✅ |
  | `DM_LEVEL_SALE` | 19 Trạng thái Level Sale (C3 → L4) | ✅ |
  | `INFO` | Thông tin hệ thống & Hướng dẫn | ✅ |

---

## 🔑 APPS SCRIPT PROJECT V2

- **Script ID:** `1qJJxG_Q6QUZys6BUPhdVdk7DqNFOxSQTy6BRA85R2J50eoMwG-fCp0lP`
- **Owner:** `coach.chuyen@gmail.com`
- **Type:** Container-bound (gắn với Spreadsheet V2)
- **URL Editor:** [Mở Apps Script Editor](https://script.google.com/u/0/home/projects/1qJJxG_Q6QUZys6BUPhdVdk7DqNFOxSQTy6BRA85R2J50eoMwG-fCp0lP/edit)

---

## 🛠️ LỆNH THỰC THI CHUẨN (STANDARD COMMANDS)

```bash
# Kiểm kê và xem hướng dẫn push lên Apps Script
node v2/scripts/push_v2_to_apps_script.mjs

# Copy từng file lên clipboard để paste vào Apps Script Editor
Get-Content "d:\FCS-AI-WORKFORCE\v2\backend\00_Config.gs" -Raw | Set-Clipboard
# ... (lặp lại cho mỗi file)

# Push qua clasp (nếu có quyền)
cd v2/backend && npx @google/clasp push --force

# Bundle toàn bộ module thành 1 file Code.gs
node v2/scripts/push_v2_to_apps_script.mjs --bundle
```

---

## 📌 TỔNG KẾT ĐẶC TRƯNG ENTERPRISE V2

| Đặc trưng Enterprise | Trạng thái | Chi tiết |
|---|:---:|---|
| Atomic Sequential Lock (ID) | ✅ | `LockService.getScriptLock(30000)` trên Worker & Deal |
| Validation 2 tầng | ✅ | API `validatePayloadOrReject_()` + 13 Dropdown Reject Input |
| Audit Trail CDC | ✅ | `LOG-YYYYMMDD-XXXX` format, ghi từng trường thay đổi |
| Soft Delete (Zero Hard Delete) | ✅ | `handleSoftDeleteWorkerV2_` & `handleSoftDeleteDealV2_` |
| Pagination & Filter | ✅ | `offset`, `limit`, `search`, `branch`, `company`, `status` |
| onEdit Trigger (Revert + Log) | ✅ | `08_TriggerService.gs` — Revert Col A & Audit, auto-log |
| Dashboard KPI | ✅ | Funnel Conversion, VWW North Star, Branch/Company stats |
| Protected Ranges | ✅ | Col A locked, Taxonomy locked, Audit Log locked |
| Worker 360° View | ✅ | Hồ sơ gốc + Toàn bộ Deals history |
| VLOOKUP Bản địa | ✅ | Deal tự động kéo full_name/phone/cccd từ Master Workers |
