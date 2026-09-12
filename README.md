# 🏆 FCS AI WORKFORCE OS
> **Hệ Điều Hành Quản Lý & Vận Hành Lao Động Bằng Trí Tuệ Nhân Tạo (AI)**  
> **Executive Leadership:** Chairman Victor Chuyen & AI CEO Lucky  
> **Production Domain:** [https://fcs.breaths.live](https://fcs.breaths.live)  
> **Version:** 4.0.0 — Enterprise Multi-Tenant & AI Retention Engine

---

## ⚡ TỔNG QUAN HỆ THỐNG
FCS AI Workforce OS là nền tảng quản trị và điều hành toàn diện chuỗi cung ứng lao động cho các khu công nghiệp (Foxconn, Luxshare, Hana Micron...), kết nối trực tiếp với Google Sheets và Google Firebase.

Hệ thống được thiết kế theo tôn chỉ:
1. **Real Data First:** Dữ liệu thực tế 100% từ Google Sheets, nói không với dữ liệu ảo.
2. **North Star Metric (VWW):** Chỉ ghi nhận **Verified Working Worker** khi số liệu đi làm thực tế khớp với dữ liệu chấm công từ nhà máy.
3. **AI Worker Care & Churn Risk Radar:** Dự báo sớm nguy cơ bỏ việc trong 7 ngày đầu, cắt giảm 80% tỷ lệ nghỉ việc tự ý.
4. **Re-activation Engine (0đ Tuyển Dụng):** Tái khai thác kho cựu lao động để lấp đầy đơn hàng mới với chi phí tuyển dụng 0 đồng.

---

## 🛠️ CÔNG NGHỆ LÕI (TECH STACK)
* **Frontend:** React 19, TypeScript, Vite 6, Tailwind CSS v4, Lucide Icons, Motion.
* **Bảo mật & Phân quyền:** Google Firebase Authentication & Firebase Admin SDK (Custom Claims RBAC 5 cấp bậc).
* **Backend:** Google Apps Script V4 Multi-Tenant Engine (`backend/Code.gs`), hỗ trợ độc lập `FCS_SUPER_ADMIN_MASTER` và 2 bảng tính riêng biệt cho mỗi Tenant (`{TENANT_ID}_DATA` & `{TENANT_ID}_MANAGEMENT`).
* **Hạ tầng Golive:** Cloudflare Pages + Cloudflare Edge CDN & SSL tự động.

---

## 🚀 CẤU TRÚC THƯ MỤC
```
├── .agents/                                     # Single Source of Truth & Orchestrator Skill
├── backend/
│   └── Code.gs                                  # Mã nguồn lõi Google Apps Script V4 (49.4 KB)
├── public/
│   ├── _redirects                               # Cloudflare Pages SPA Routing Rule
│   └── favicon.svg, og-image.svg
├── scripts/
│   ├── seed_firebase_users.mjs                  # Đồng bộ 4 tài khoản nòng cốt lên Firebase
│   └── test_live_api_suite.mjs                  # Bộ kiểm tra chẩn đoán 5/5 API endpoints
├── src/
│   ├── auth/                                    # AuthProvider & ProtectedRoute (Custom Claims)
│   ├── components/                              # Worker 360, Today Retention, Table, Modals
│   ├── pages/                                   # Today, Workers, Pipeline, Review, Tenants
│   └── services/                                # apiClient (CORS-safe), api, realApi, auth
└── package.json                                 # Code splitting Rollup vendor chunks < 390KB
```

---

## 📦 TRIỂN KHAI & VẬN HÀNH (DEPLOYMENT)

### 1. Cài đặt môi trường
```bash
npm install
```

### 2. Kiểm tra TypeScript & Chẩn đoán API
```bash
npx tsc --noEmit
node scripts/test_live_api_suite.mjs
```

### 3. Build gói Production
```bash
npm run build
```

### 4. Triển khai Cloudflare Pages
```bash
npx wrangler pages deploy dist --project-name fcs-ai-workforce
```

---

## 🔒 BẢO MẬT & PHÂN QUYỀN (RBAC)
* `PLATFORM_SUPER_ADMIN`: Toàn quyền quản trị nền tảng đa doanh nghiệp.
* `TENANT_ADMIN`: Quản trị doanh nghiệp, xưởng, nhân sự và cấu hình tenant.
* `TENANT_MANAGER`: Điều hành quản lý lao động, duyệt kết quả đối soát chấm công VWW.
* `RECRUITER`: Tiếp nhận hồ sơ, đặt lịch phỏng vấn và gửi tin nhắn AI chăm sóc Zalo/SMS.
* `TENANT_VIEWER`: Xem báo cáo điều hành thời gian thực.
