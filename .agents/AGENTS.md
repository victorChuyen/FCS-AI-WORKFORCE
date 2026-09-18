# 🏆 FCS AI WORKFORCE OS — MASTER DIRECTIVE & OPERATING SYSTEM
> **MANDATORY SYSTEM DIRECTIVE — SINGLE SOURCE OF TRUTH CHO TOÀN BỘ DỰ ÁN**  
> **Executive Leadership:** Chairman Victor Chuyen & AI CEO Lucky  
> **Cập nhật lần cuối:** 2026-09-18 (Nghiệm thu toàn diện 10 Lao động & 10 Deals Real Data, 7 Sheets P0 hoàn tất, OAuth Scopes & New Deployment)

---

## ⚡ 6 NGUYÊN TẮC BẮT BUỘC TUÂN THỦ (NON-NEGOTIABLE LAWS)

### 🔴 ĐIỀU 1: ĐỌC FILE NÀY ĐẦU TIÊN KHI BẮT ĐẦU MỌI PHIÊN LÀM VIỆC
Tất cả AI Agent khi khởi động phiên làm việc mới tại `D:\FCS-AI-WORKFORCE` **BẮT BUỘC PHẢI ĐỌC FILE NÀY (`D:\FCS-AI-WORKFORCE\.agents\AGENTS.md`)**, `FCS_AI_WORKFORCE_OS_PROJECT_MASTER.md` và `FCS_ANTIGRAVITY_EXECUTION_HANDOFF_2026-09-17.md`. Không đoán mò, không làm sai lệch kiến trúc lõi.

### 🔴 ĐIỀU 2: CƠ CHẾ ĐIỀU HÀNH TỰ ĐỘNG (CHAIRMAN ĐỊNH HƯỚNG - LUCKY THỰC THI TOÀN DIỆN)
- **Chairman Victor Chuyen:** Chỉ huy tối cao, định hướng chiến lược, phê duyệt các mốc quan trọng.
- **AI CEO Lucky:** Chủ động khảo sát, phát hiện lỗi, lập kế hoạch, code, build, audit bảo mật, kiểm tra tự động và báo cáo tổng kết chi tiết.

### 🔴 ĐIỀU 3: TÔN CHỈ DỮ LIỆU THỰC (REAL DATA FIRST — ZERO FAKE FALLBACK)
- **Nguyên tắc bất biến:** *"REAL ZERO IS BETTER THAN FAKE DEMO DATA."*
- Tuyệt đối KHÔNG tự ý fallback về Mock Data khi ở chế độ Production. Nếu backend mất kết nối, hệ thống phải hiển thị trạng thái `MẤT KẾT NỐI` minh bạch.

### 🔴 ĐIỀU 4: CÔ LẬP DỮ LIỆU ĐA DOANH NGHIỆP (STRICT MULTI-TENANT ISOLATION)
- Mỗi doanh nghiệp khách hàng là một Tenant độc lập (`FCS-000001`, `FCS-000002`...).
- Mỗi Tenant sở hữu 2 Google Spreadsheets riêng biệt:
  - `{TENANT_ID}_DATA`: 12 bảng nghiệp vụ (Workers, Interviews, Assignments, Attendance, Matching, VWW...).
  - `{TENANT_ID}_MANAGEMENT`: 12 bảng quản trị (Offices, Staff, Partners, Jobs, Roles, Config...).
- Nền tảng trung tâm quản lý tập trung qua `FCS_SUPER_ADMIN_MASTER` (8 bảng danh mục, cấm chứa dữ liệu lao động của khách hàng).

### 🔴 ĐIỀU 5: THƯỚC ĐO TỐI THƯỢNG (NORTH STAR METRIC — VWW)
- **VWW = Verified Working Worker (Lao động đi làm đã xác minh)**.
- Chuỗi giá trị: `Worker → Interview → Passed → Assignment → Start Work → Attendance → Matching → VWW`.
- Chỉ ghi nhận VWW khi dữ liệu đi làm thực tế khớp với dữ liệu chấm công từ KCN/đối tác.

### 🔴 ĐIỀU 6: BẢO MẬT & PHÂN QUYỀN CHẶT CHẼ (RBAC & IDENTITY)
- Danh tính (Identity): Google Firebase Authentication (Email/Password & Google Sign-In).
- Phân quyền (Authorization): Custom Claims RBAC được quản lý bởi Firebase Admin SDK Service Account.
- Các vai trò chuẩn: `PLATFORM_SUPER_ADMIN`, `TENANT_ADMIN`, `TENANT_MANAGER`, `RECRUITER`, `TENANT_VIEWER`.
- Cấm tuyệt đối commit file private key `*firebase-adminsdk*.json` lên Git.

### 🔴 ĐIỀU 7: QUY TRÌNH TRIỂN KHAI APPS SCRIPT & CẬP NHẬT WEB APP URL (MANDATORY NEW DEPLOYMENT)
- **Bản chất Google Apps Script:** URL dạng `/exec` chỉ gắn với một phiên bản triển khai cố định (Deployment Version). Mọi chỉnh sửa trong `backend/Code.gs` KHÔNG tự động phản ánh vào URL cũ trừ khi thực hiện Triển khai mới (New Deployment).
- **Quy trình 3 bước bắt buộc khi sửa backend:**
  1. **Deploy New Version:** Trên Apps Script, tạo New Deployment và lấy URL Web App mới (`https://script.google.com/macros/s/.../exec`).
  2. **Cập nhật Biến Môi Trường:** Cập nhật URL mới vào `VITE_API_BASE_URL` tại cả 2 nơi:
     - Local `.env`
     - Cloudflare Pages (`fcs-ai-workforce`) cho cả **Production** và **Preview**.
  3. **Re-build & Deploy Frontend:** Chạy `npm run build` và deploy lên Cloudflare Pages (`fcs.breaths.live`) để client nhận diện version mới 100%.

### 🔴 ĐIỀU 8: BẢO MẬT ĐĂNG KÝ TỰ DO & CHỐNG LỘ MẬT KHẨU (STRICT VIEWER INTAKE & ZERO CREDENTIAL LEAK)
- **Tuyệt đối cấm hiển thị mật khẩu trên giao diện công khai (Zero Public Password):** Cấm in mật khẩu mẫu, mật khẩu test, hoặc gợi ý mật khẩu thật lên màn hình Login (`LoginPage.tsx`) hay bất kỳ nơi nào trên giao diện public. Thông tin tài khoản nội bộ chỉ lưu trong tài liệu bàn giao bảo mật (`HUONG_DAN_SU_DUNG_FCS_WORKFORCE.md`).
- **Phân quyền mặc định an toàn tuyệt đối (Strict Read-Only Viewer):** Mọi tài khoản đăng ký mới qua Web / Google Sign-in BẮT BUỘC chỉ được cấp vai trò `VIEWER` (Người xem - Chỉ đọc).
  - Cấm tuyệt đối tự động nâng quyền lên `TENANT_MANAGER`, `TENANT_ADMIN`, hoặc `RECRUITER` khi chưa có phê duyệt từ Ban Điều hành.
  - Khi ở vai trò `VIEWER`: Khóa toàn bộ các nút sửa/thêm/xóa dữ liệu, không được tạo Worker, không được chạy Golden Flow, không được duyệt phỏng vấn hoặc phân bổ xưởng của doanh nghiệp khách hàng (`FCS-000001`).
- **Thu thập mục đích & Đồng bộ Lead về Google Sheets:** Mọi đăng ký mới bắt buộc phải khai báo Họ tên, Email, SĐT, Doanh nghiệp và Mục đích sử dụng. Dữ liệu này được tự động ghi nhận về Google Sheets quản trị để theo dõi và phê duyệt nâng cấp tài khoản.

### 🔴 ĐIỀU 9: SIÊU HẠ TẦNG 9ROUTER AI GATEWAY & ĐIỀU PHỐI ĐA MODEL (AI INFRASTRUCTURE)
- **Cổng kết nối chuẩn (AI Gateway):** Toàn bộ các tác vụ AI thông minh (Audit, CV Parsing, Email Soạn thảo, Matching Score, Phân tích dữ liệu lao động) được điều phối qua **9Router Local AI Proxy** (`http://localhost:20128/v1`) với kênh dự phòng Public Tunnel (`https://ruvxwm8.abc-tunnel.us/v1`).
- **API Key Định Danh Dự Án:** `sk-7c1f91635f52dc7e-fcsworkforce-2026` (Dành riêng cho FCS Workforce OS V2).
- **🏆 Combo Trọng Tâm Dự Án (`fcs-astra`):** Combo ưu tiên hàng đầu là `cx/gpt-6-astra` kết hợp cơ chế tự động xoay vòng (fallback) sang `cx/gpt-5.6-luna`, `ag/claude-sonnet-4-6`, `ag/gemini-3.8-flash`, `kr/qwen3-coder-next` đảm bảo xử lý code và logic phức tạp nhất mà không bao giờ nghẽn.
- **Chiến lược Phân tầng Model (Model Tiering Strategy):**
  - 👑 **Combo Trực tiếp & Code Lõi (`fcs-astra`):** `cx/gpt-6-astra` (Sức mạnh logic & giải thuật tối thượng)
  - ⚡ **Code Implementation & UI Refactor (~2s):** `ag/claude-sonnet-4-6`
  - 📑 **Mass Processing & Worker CV Parsing (1M Context):** `ag/gemini-3.8-flash`
  - 🛠️ **Apps Script & Database Automation:** `kr/qwen3-coder-next`
  - 🚀 **Ultra-fast Micro-tasks (500+ tokens/s):** `groq/llama-3.3-70b-versatile`
- **Cụm tài nguyên nền tảng:** 31 Provider Connections xoay vòng (11 Antigravity OAuths, 2 Codex OAuths, 4 GitHub OAuths, 3 Nvidia NIM, 3 Groq, 4 Ollama Nodes, 1 Kiro, 1 BytePlus) đảm bảo 0% gián đoạn và chống 429 tuyệt đối.

---

## 🗺️ CÂY THƯ MỤC CHUẨN CỦA HỆ THỐNG

```
D:/FCS-AI-WORKFORCE/
├── .agents/
│   ├── AGENTS.md                                     ← [SINGLE SOURCE OF TRUTH] Master directive
│   └── skills/
│       └── fcs-ai-workforce-orchestrator/            ← Skill điều phối tự động toàn diện
├── backend/
│   └── Code.gs                                       ← Mã nguồn lõi Google Apps Script V4 Multi-Tenant (49.4 KB)
├── credentials / root
│   ├── .env                                          ← Biến môi trường local (Firebase Client + Admin SDK + API)
│   ├── .env.example                                  ← Mẫu cấu hình chuẩn
│   └── fcs-ai-workforce-firebase-adminsdk-*.json    ← Khóa Service Account Google Cloud (bảo mật tuyệt đối)
├── scripts/
│   ├── extract_backend_code.mjs                      ← Trích xuất Code.gs tự động
│   ├── seed_firebase_users.mjs                       ← Khởi tạo & đồng bộ 4 tài khoản nòng cốt lên Firebase
│   └── test_live_api_suite.mjs                       ← Bộ kiểm tra chẩn đoán toàn diện API & Google Sheets
├── src/
│   ├── auth/                                         ← AuthProvider & ProtectedRoute (hỗ trợ Custom Claims)
│   ├── config/                                       ← env.ts & cấu hình hệ thống
│   ├── context/                                      ← AppContext (quản lý trạng thái Real Data & Multi-Tenant)
│   ├── server/                                       ← firebaseAdmin.ts (Module Admin SDK bảo mật chuẩn)
│   ├── services/                                     ← api.ts, realApi.ts, auth.ts, apiClient.ts, appsScriptSuite.ts
│   ├── pages/                                        ← TodayPage, WorkersPage, PipelinePage, ReviewPage...
│   └── components/                                   ← Dashboard, Worker360, Layout, Landing...
└── package.json                                      ← Đã tối ưu Rollup code splitting & vendor isolation
```

---

## 🛠️ LỆNH THỰC THI CHUẨN (STANDARD COMMANDS)

* **Kiểm tra chẩn đoán toàn diện API & Google Sheets:**  
  `node scripts/test_live_api_suite.mjs`
* **Đồng bộ 4 tài khoản nòng cốt vào Google Firebase:**  
  `node scripts/seed_firebase_users.mjs`
* **Kiểm tra kiểu dữ liệu TypeScript (Zero errors):**  
  `npx tsc --noEmit`
* **Build gói Production tối ưu hóa (Zero warnings):**  
  `npm run build`
* **Chạy môi trường phát triển cục bộ:**  
  `npm run dev`

---

## 📌 BÁO CÁO BÀN GIAO PHIÊN LÀM VIỆC & KẾ HOẠCH PHIÊN TIẾP THEO (HANDOVER 2026-09-18)
> **Thời gian chốt phiên:** 2026-09-18 00:42 (Chairman Victor Chuyen & AI CEO Lucky)

### 1. Hiện trạng đã hoàn thành 100%:
1. **Kiểm tra kiểu dữ liệu TypeScript:** Đã sửa triệt để các enum status và exhaustiveness trong `MoveDealStageModal.tsx` và `kanbanData.ts`. Chạy `npx tsc --noEmit` đạt chuẩn **Exit code 0, ZERO ERROR**.
2. **Khởi tạo 7 Sheet P0 cốt lõi:** Bổ sung trọn vẹn 7 sheet nghiệp vụ còn thiếu trên Google Spreadsheet Master (`FCS_V2_WORKFORCE_CRM_MASTER` - `1YAVNiPtAiYrxEThvIgWuR0PAHJbDCDqrXCz5SNwrxXE`):
   - `05_PIPELINE_EVENTS`: Nhật ký kiểm toán chuyển cấp độ sale & VWW.
   - `06_INTERVIEWS`: Lịch & kết quả phỏng vấn đối tác nhà máy.
   - `07_ASSIGNMENTS`: Hợp đồng phân bổ đi làm xưởng.
   - `08_ATTENDANCE_RAW`: Dữ liệu chấm công thô đối tác gửi về.
   - `09_ATTENDANCE`: Chấm công xác minh chuẩn VWW.
   - `10_MATCHING_REVIEW`: Đối soát dữ liệu để tính hoa hồng.
   - `11_ACTION_QUEUE`: Hàng đợi hành động cảnh báo cần xử lý.
3. **Xóa sạch dữ liệu demo lỗi & nạp 10 mẫu chuẩn hóa (Clean Slate Data):**
   - Xóa bỏ 100% các dòng demo cũ bị lỗi `#ERROR!` do phụ thuộc công thức VLOOKUP.
   - Nạp thành công 10 hồ sơ lao động thực tế (`WK-T001` → `WK-T010`) đủ 34 cột chuẩn VNeID vào `01_MASTER_WORKERS`.
   - Nạp thành công 10 Deal (`DL-2026-T001` → `DL-2026-T010`) đủ 22 cột vào `02_CRM_DEALS_2026`, phủ trọn 10 giai đoạn phễu trọng tâm (`C3`, `L1`, `L1.2`, `L1.3`, `L2`, `L2.1`, `L3`, `L3.1`, `L3.2`, `L4`).
   - Khớp 100% quy chuẩn Data Validation của `DM_BRANCH` (`HÀ NAM`, `BẮC GIANG`, `HƯNG YÊN`, `QUẢNG NINH`, `HẢI PHÒNG`...) và `DM_COMPANY` (`FUYU`, `LUXSHARE`...).
4. **Bảo mật OAuth & Manifest:**
   - Cập nhật `appsscript.json` bổ sung đầy đủ 4 phạm vi `oauthScopes` (`spreadsheets`, `script.send_mail`, `script.external_request`, `userinfo.email`).
   - Đã tạo New Deployment cho Google Apps Script Web App.
   - Đã dọn dẹp sạch ô K2 trên tab `04_LEADS_MARKETING` về trạng thái chuẩn: `CHỜ GỬI MAIL (ĐÃ LƯU LEAD)`.
5. **Nghiệm thu toàn diện:**
   - Chạy bộ kiểm thử tự động `test_live_api_suite.mjs` đạt **5/5 PASS (100% Real Data)**.
   - Xác nhận hiển thị trực quan thực tế trên Web Console Production (`https://fcs.breaths.live`): Trang Quản lý Lao động (10 hồ sơ), Kanban Pipeline (10 deals, 2 VWW, 25tr hoa hồng dự kiến), Lưới Excel Grid Workspace (đồng bộ 2 chiều thời gian thực).

### 2. Kế hoạch trọng tâm cho phiên làm việc ngày mai:
- [ ] **Kiểm thử Golden Flow:** Thực hiện thao tác kéo thả deal trên Kanban chuyển trạng thái lao động từ `L2 (Hẹn PV)` → `L2.1 (Đỗ PV)` → `L3 (VWW Đi làm)` và kiểm tra việc tự động ghi nhận sự kiện vào sheet `05_PIPELINE_EVENTS`.
- [ ] **Worker 360 & Hồ sơ số:** Kiểm tra tính năng tạo hợp đồng, checklist nhận việc và xuất file in ấn.
- [ ] **Kiểm thử tích hợp Lead Marketing:** Kiểm tra luồng gửi email tự động khi có lead mới đăng ký qua Landing Page Blueprint Modal.
