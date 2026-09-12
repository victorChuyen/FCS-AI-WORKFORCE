# 🏆 FCS AI WORKFORCE OS — MASTER DIRECTIVE & OPERATING SYSTEM
> **MANDATORY SYSTEM DIRECTIVE — SINGLE SOURCE OF TRUTH CHO TOÀN BỘ DỰ ÁN**  
> **Executive Leadership:** Chairman Victor Chuyen & AI CEO Lucky  
> **Cập nhật lần cuối:** 2026-09-12 (Chuẩn hóa V4 Multi-Tenant, Firebase Admin SDK, Real Sheets Data Engine)

---

## ⚡ 6 NGUYÊN TẮC BẮT BUỘC TUÂN THỦ (NON-NEGOTIABLE LAWS)

### 🔴 ĐIỀU 1: ĐỌC FILE NÀY ĐẦU TIÊN KHI BẮT ĐẦU MỌI PHIÊN LÀM VIỆC
Tất cả AI Agent khi khởi động phiên làm việc mới tại `D:\FCS-AI-WORKFORCE` **BẮT BUỘC PHẢI ĐỌC FILE NÀY (`D:\FCS-AI-WORKFORCE\.agents\AGENTS.md`)** và `FCS_AI_WORKFORCE_OS_PROJECT_MASTER.md`. Không đoán mò, không làm sai lệch kiến trúc lõi.

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
