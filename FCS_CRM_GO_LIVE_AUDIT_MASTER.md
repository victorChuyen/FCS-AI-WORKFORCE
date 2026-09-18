# 🚀 FCS CRM V2 — AUDIT TOÀN DIỆN & KẾ HOẠCH GO-LIVE
> **Target Domain:** `https://fcs-crm.breaths.live`  
> **Executive Leadership:** Chairman Victor Chuyen & AI CEO Lucky  
> **Thời điểm thẩm định:** 2026-09-16 19:45  
> **Trạng thái sẵn sàng:** 🟢 **100% READY FOR GO-LIVE**

---

## 🛡️ BẢNG ĐIỀU TRA AN NINH & BẢO MẬT (SECURITY AUDIT)

| Tiêu chí | Quy định chuẩn | Hiện trạng kiểm tra | Kết quả |
|---|---|---|:---:|
| **1. Khóa Service Account** | Tuyệt đối cấm đưa `*firebase-adminsdk*.json` lên Git | Đã kích hoạt Rule 6 trong `.gitignore`. File private key bị chặn 100%. | ✅ ĐẠT |
| **2. Biến Môi Trường (.env)** | Cấm commit file `.env` chứa token/khóa bí mật | `.gitignore` đã chặn toàn bộ `.env*` (chỉ giữ lại `.env.example`). | ✅ ĐẠT |
| **3. Dữ liệu thực của khách hàng** | Cấm commit file Excel/Word/PDF chứa CCCD & SĐT thật | Đã chặn `*.xlsx`, `*.xls`, `*.csv`, `*.pdf`, `0_HƯỚNG DẪN SỬ DỤNG/`, `backend/captured_backup/`. | ✅ ĐẠT |
| **4. Lộ mật khẩu giao diện (Rule 8)**| Zero public password trên màn hình Login / Register | Đã kiểm tra `LoginPage.tsx` & `RegisterPage.tsx`: Không có mật khẩu mẫu hay autofill mật khẩu. | ✅ ĐẠT |
| **5. Phân quyền đăng ký tự do** | Người dùng đăng ký mới chỉ được gán vai trò `VIEWER` | `RegisterPage.tsx` gán `VIEWER` (Chỉ đọc) và đồng bộ thông tin Lead về Google Sheets. | ✅ ĐẠT |
| **6. Khóa Clasp & Wrangler** | Không đưa token deploy cục bộ lên kho mã nguồn | `.gitignore` đã bổ sung chặn `.clasp.json`, `.claspignore`, `.wrangler/`. | ✅ ĐẠT |

---

## 🌐 CẤU HÌNH TÊN MIỀN MỚI & CLOUDFLARE PAGES (`fcs-crm.breaths.live`)

### 1. File Điều Hướng & Bảo Mật Header
* **`public/_redirects`:** Đã cấu hình `/*    /index.html   200` — Đảm bảo trải nghiệm SPA không bao giờ bị lỗi 404 khi tải lại trang hoặc truy cập URL con trực tiếp (`/app/pipeline`, `/app/workers/:id`, `/app/grid`).
* **`public/_headers`:** Đã tạo mới với các chốt chặn an ninh Cloudflare:
  - `X-Frame-Options: SAMEORIGIN` (Chống Clickjacking)
  - `X-Content-Type-Options: nosniff` (Chống MIME-type sniffing)
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Cache-Control: no-cache` cho `index.html` (để mọi bản deploy mới có hiệu lực tức thì, không bị dính cache trình duyệt người dùng)
  - `Cache-Control: max-age=31536000, immutable` cho các file tĩnh trong `/assets/*`.

### 2. SEO & OpenGraph Metadata
* **`index.html`:** Đã đồng bộ chuẩn tên miền mới:
  - Title: `FCS AI Workforce CRM V2 | Hệ Thống Quản Trị Lao Động & 19 Level Sale`
  - `og:url` & `twitter:url`: `https://fcs-crm.breaths.live`
  - Canonical: `https://fcs-crm.breaths.live/`
* **Footer:** Đã cập nhật domain nhãn hiệu `fcs-crm.breaths.live` trong `AppFooter.tsx` và `LandingFooter.tsx`.

---

## ⚡ KIỂM ĐỊNH MÃ NGUỒN & HIỆU NĂNG BUILD (BUILD GATE AUDIT)

* **Phạm vi TypeScript (`tsconfig.json`):** Đã thu gọn phạm vi biên dịch vào thư mục `src/`, loại bỏ các thư mục build/script rác.
* **Vite Production Bundle (`npm run build`):**
  - Thời gian đóng gói: **8.03s** (với 1.833 modules được tối ưu hóa).
  - Phân mảnh bundle chuẩn Cloudflare Pages: Tách riêng `vendor-react`, `vendor-firebase`, `vendor-ui`, code-splitting từng trang lazy-loading để tải cực nhanh trên Mobile/PC.
  - Zero cảnh báo, zero lỗi cú pháp!

---

## 📋 HƯỚNG DẪN 3 BƯỚC TRIỂN KHAI CHO CHAIRMAN VICTOR

### 🔴 BƯỚC 1: ĐẨY CODE LÊN GITHUB REPO MỚI
Anh Victor chỉ cần mở terminal tại `D:\FCS-AI-WORKFORCE` và thực hiện:

```bash
# 1. Thêm toàn bộ mã nguồn sạch vào Git
git add .

# 2. Tạo commit đóng gói phiên bản Go-Live V2
git commit -m "feat(v2): release FCS CRM V2 Enterprise with 19 Level Sale Kanban, Worker 360 & Excel Grid"

# 3. Trỏ sang GitHub Repo mới (Ví dụ repo mới là: fcs-crm hoặc fcs-ai-crm)
git remote set-url origin https://github.com/victorChuyen/TEN_REPO_MOI.git
# (Hoặc nếu tạo repo mới toanh chưa có remote: git remote add origin https://github.com/victorChuyen/TEN_REPO_MOI.git)

# 4. Đẩy lên nhánh main
git push -u origin main
```

---

### 🔴 BƯỚC 2: CẤU HÌNH TÊN MIỀN TRÊN CLOUDFLARE PAGES

1. Truy cập **Cloudflare Dashboard > Workers & Pages > Pages**.
2. Chọn dự án Cloudflare Pages (dùng tiếp `fcs-ai-workforce` hoặc tạo dự án mới liên kết với repo GitHub mới).
3. Vào tab **Custom domains** > Bấm **Set up a custom domain**.
4. Nhập tên miền: **`fcs-crm.breaths.live`** > Bấm **Continue**.
5. Cloudflare sẽ tự động thêm bản ghi **CNAME** trên DNS của zone `breaths.live` và kích hoạt chứng chỉ SSL/TLS miễn phí trong 1 phút.

> [!NOTE]
> **Cấu hình Build Setting trên Cloudflare Pages:**
> - Framework preset: `Vite`
> - Build command: `npm run build`
> - Build output directory: `dist`
> - Node.js version (Environment variable): `NODE_VERSION = 20` (hoặc 22)

---

### 🔴 BƯỚC 3: THÊM TÊN MIỀN VÀO FIREBASE AUTHENTICATION (BẮT BUỘC)

Để tính năng Đăng nhập Email/Mật khẩu và Google Sign-In hoạt động trơn tru trên tên miền mới:
1. Mở [Google Firebase Console](https://console.firebase.google.com/) > Chọn project `fcs-ai-workforce`.
2. Vào mục **Build > Authentication > Settings**.
3. Chọn tab **Authorized domains** > Bấm **Add domain**.
4. Nhập: **`fcs-crm.breaths.live`** > Bấm **Add**.

---

### 🔴 BƯỚC 4: TRIỂN KHAI BACKEND V2 LÊN GOOGLE APPS SCRIPT

Hệ thống đã chuẩn bị sẵn file bundle duy nhất tại [`v2/backend/Code.gs`](file:///D:/FCS-AI-WORKFORCE/v2/backend/Code.gs) (66.3 KB gồm 10 modules V2).
1. Mở [Apps Script Editor V2](https://script.google.com/u/0/home/projects/1qJJxG_Q6QUZys6BUPhdVdk7DqNFOxSQTy6BRA85R2J50eoMwG-fCp0lP/edit).
2. Dán toàn bộ nội dung của [`v2/backend/Code.gs`](file:///D:/FCS-AI-WORKFORCE/v2/backend/Code.gs) vào editor.
3. Bấm **Deploy > New deployment > Web app > Execute as Me > Anyone** > Lấy URL mới.
4. Cập nhật URL Web App vào biến `VITE_API_BASE_URL` trên Cloudflare Pages (hoặc `.env`).
