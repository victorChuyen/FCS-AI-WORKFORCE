# 🎯 HƯỚNG DẪN KIỂM TRA & NGHIỆM THU NHANH GIAI ĐOẠN 1 & 2
## HỆ THỐNG ĐIỀU HÀNH LAO ĐỘNG FCS AI WORKFORCE OS V2
> **Dành cho:** Ban Giám Đốc, Trưởng Phòng Tuyển Dụng & Đội ngũ Vận hành Doanh nghiệp  
> **Thời lượng kiểm tra:** 10 Phút  
> **Mục tiêu:** Kiểm chứng tính năng thực tế, xác nhận hài lòng Giai đoạn 1 & 2 để kích hoạt Giai đoạn 3  
> **Hạ tầng kiểm tra:**  
> • Web Console Live: [https://fcs.breaths.live](https://fcs.breaths.live)  
> • Master Google Sheet: [FCS_V2_WORKFORCE_CRM_MASTER](https://docs.google.com/spreadsheets/d/1YAVNiPtAiYrxEThvIgWuR0PAHJbDCDqrXCz5SNwrxXE/edit)

---

## ⚡ 5 NGUYÊN TẮC BÀN GIAO & NGHIỆM THU BẮT BUỘC (CLIENT ACCEPTANCE RULES)

Để đảm bảo tiến độ triển khai thần tốc, tránh kéo dài dự án và bảo vệ quyền lợi tối cao của cả hai bên, quy trình nghiệm thu tuân thủ nghiêm ngặt **5 Nguyên Tắc Bất Biến**:

### 1. Nguyên Tắc Khóa Phạm Vi Từng Giai Đoạn (Scope-Lock & Phase Sign-Off)
- Nghiệm thu dứt điểm từng giai đoạn theo Hợp đồng: **Nghiệm thu hoàn tất GĐ1 & GĐ2 mới chuyển sang GĐ3 & GĐ4**.
- Mọi yêu cầu phát sinh tính năng mới ngoài bản đặc tả của GĐ1 & GĐ2 sẽ được ghi nhận vào danh sách cải tiến của các giai đoạn tiếp theo (GĐ3, 4, 5, 6) hoặc lập Change Request (CR) riêng, **tuyệt đối không dùng tính năng tương lai để trì hoãn nghiệm thu tính năng hiện tại**.

### 2. Nguyên Tắc Dữ Liệu Thực (Real Data Only — Zero Fake Fallback)
- Toàn bộ quá trình kiểm tra diễn ra trên **Dữ liệu thực tế 100%**: Mọi thao tác trên Web App (tạo mới, đổi trạng thái, chỉnh sửa) phải phản ánh trực tiếp và tức thì vào Google Sheets Master.
- Không nghiệm thu trên số liệu giả tưởng hay demo offline.

### 3. Nguyên Tắc Phân Loại Lỗi Chuẩn Quốc Tế (Bug Severity SLA)
- **Lỗi Chặn (Severity 1 - Blocker / P0):** Hệ thống sập, mất dữ liệu, không thể đăng nhập hoặc API ngừng hoạt động -> Đội ngũ kỹ thuật khắc phục ngay trong 4 giờ.
- **Lỗi Chức Năng (Severity 2 - Major / P1):** Tính năng chạy sai kết quả -> Khắc phục trong 12 giờ.
- **Góp ý Trải nghiệm (Severity 3 - Minor / P2/P3):** Thay đổi màu sắc, font chữ, bố cục hiển thị -> Ghi nhận tối ưu định kỳ, **không cấu thành lý do hoãn nghiệm thu**.

### 4. Thời Hạn Phản Hồi Nghiệm Thu (SLA 48 Giờ Làm Việc)
- Sau khi nhận thông báo bàn giao và File hướng dẫn này, Khách hàng có **48 giờ làm việc** để thực hiện kiểm tra theo 4 Kịch bản dưới đây.
- Nếu sau 48 giờ làm việc Khách hàng không có văn bản/email phản hồi lỗi P0/P1 thì Giai đoạn 1 & 2 được mặc định công nhận **Nghiệm thu Đạt chuẩn Hài lòng 100%**.

### 5. Biên Bản Nghiệm Thu Số (Digital Sign-Off)
- Xác nhận nghiệm thu nhanh gọn qua Email hoặc Tin nhắn nhóm Zalo chính thức của dự án theo mẫu biên bản ở Phần 4.

---

## 🗺️ TỔNG QUAN LỘ TRÌNH 6 GIAI ĐOẠN & VỊ TRÍ HIỆN TẠI

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        LỘ TRÌNH PHÁT TRIỂN 6 GIAI ĐOẠN FCS OS                          │
├────────────────────┬─────────────────────────────────────────────────┬─────────────────┤
│ GIAI ĐOẠN          │ TÍNH NĂNG & LỢI ÍCH DOANH NGHIỆP                │ TRẠNG THÁI      │
├────────────────────┼─────────────────────────────────────────────────┼─────────────────┤
│ GĐ 1: Core Data &  │ • Quản trị hồ sơ 34 cột VNeID & Deal 19 Level   │ ✅ HOÀN TẤT     │
│       CRM Pipeline │ • Lưới Excel Grid 2 chiều & Kanban trực quan    │ (BÀN GIAO NGAY) │
│                    │ • Đồng bộ Google Sheets Master real-time ACID   │                 │
├────────────────────┼─────────────────────────────────────────────────┼─────────────────┤
│ GĐ 2: AI Talent    │ • Chăm sóc công nhân 1-3-7 ngày giảm bỏ việc    │ ✅ HOÀN TẤT     │
│       & Retention  │ • Cảnh báo bất thường (ép ca, khó khăn, nợ cọc) │ (BÀN GIAO NGAY) │
│                    │ • Re-activation Zalo 0đ kéo lao động cũ tái làm │                 │
├────────────────────┼─────────────────────────────────────────────────┼─────────────────┤
│ GĐ 3: B2B Employer │ • Quản trị đơn hàng xưởng & Headcount KCN       │ 🟡 TIẾP THEO    │
│       & SLA        │ • Khớp công tự động North Star VWW (Foxconn...) │ (KÍCH HOẠT NGAY)│
│                    │ • Tự động tính hoa hồng tuyển dụng 4 cấp        │                 │
├────────────────────┼─────────────────────────────────────────────────┼─────────────────┤
│ GĐ 4: Tài Chính,   │ • Sổ cái công nợ CTV / Vendor tuyển dụng        │ ⚪ Theo lộ trình│
│       CTV & Đối Soát│ • Quản lý tạm ứng tiền xe, tiền ăn trọ lao động│                 │
│                    │ • Báo cáo P&L (Lãi/Lỗ) theo từng chi nhánh      │                 │
├────────────────────┼─────────────────────────────────────────────────┼─────────────────┤
│ GĐ 5: AI Marketing │ • Thu lead tự động Ads TikTok, FB về tầng C3    │ ⚪ Theo lộ trình│
│       & Lead Scale │ • Chia data tự động cho Telesale trong 1 giây   │                 │
├────────────────────┼─────────────────────────────────────────────────┼─────────────────┤
│ GĐ 6: Multi-Tenant │ • Đóng gói SaaS nhân bản cho hàng trăm chi nhánh│ ⚪ Theo lộ trình│
│       & Sàn KCN    │ • Sàn liên kết san sẻ lao động giữa các nhà máy │                 │
└────────────────────┴─────────────────────────────────────────────────┴─────────────────┘
```

---

## 🔬 4 BƯỚC KIỂM TRA NHANH NHẤT TRONG 10 PHÚT (QUICK TEST SUITE)

Khách hàng chỉ cần chuẩn bị trình duyệt (máy tính hoặc điện thoại) và làm theo 4 kịch bản sau:

### 🧪 KỊCH BẢN 1: KIỂM TRA TRUNG TÂM ĐIỀU HÀNH & 5 CHỈ SỐ KPI THỰC TẾ (2 Phút)
* **Thao tác:**
  1. Truy cập: [https://fcs.breaths.live/app](https://fcs.breaths.live/app)
  2. Quan sát hàng 5 thẻ KPI đầu trang:
     - **Đi làm đã xác minh (VWW):** Hiển thị số lượng lao động đã đi làm thực tế có phát sinh công.
     - **Chờ đi làm:** Số lượng hồ sơ đã qua phỏng vấn đang chờ ngày nhập xưởng.
     - **Đã phỏng vấn:** Số lượng ứng viên đã qua vòng phỏng vấn nhà máy.
     - **Cần xác nhận:** Số lượng bản ghi bất thường cần cán bộ can thiệp.
     - **Lao động mới:** Số lượng hồ sơ mới tiếp nhận trong kỳ.
* **Tiêu chuẩn nghiệm thu ĐẠT:**
  - 5 thẻ KPI hiển thị số liệu thực từ Google Sheets (không bị 0, không bị lỗi kết nối).
  - Có dòng tiêu đề thông minh: *"Hôm nay có X việc cần xử lý"*.

---

### 🧪 KỊCH BẢN 2: CHẠY MÔ PHỎNG GOLDEN FLOW CHUYỂN CẤP ĐỘ VWW THỜI GIAN THỰC (3 Phút)
* **Thao tác:**
  1. Tại trang [https://fcs.breaths.live/app](https://fcs.breaths.live/app), tìm khối đen viền vàng **"Chuỗi giá trị cốt lõi • Golden Flow"**.
  2. Bấm nút: **"Chạy mẫu Golden Flow (1-Click)"**.
  3. Quan sát: Các thanh tiến trình từ Bước 1 (Tiếp nhận) -> Bước 2 (Phỏng vấn) -> Bước 3 (Phân xưởng) -> Bước 6 (Đạt chuẩn VWW) sáng dần.
  4. Mở tab Google Sheet `02_CRM_DEALS_2026`: Kiểm tra deal vừa chạy đã được tự động cập nhật sang trạng thái `L3 (Bắt đầu đi làm - Đạt chuẩn VWW)`.
* **Tiêu chuẩn nghiệm thu ĐẠT:**
  - Nút bấm chạy mượt mà, hiển thị thông báo màu xanh: *"Đã hoàn tất toàn bộ chuỗi Golden Flow: Lao động đạt chuẩn VWW!"*.
  - Google Sheet cập nhật ngay lập tức mà không cần F5 thủ công.

---

### 🧪 KỊCH BẢN 3: KIỂM TRA PHỄU KANBAN 19 LEVEL SALE & LƯỚI EXCEL GRID 2 CHIỀU (3 Phút)
* **Thao tác 3.1 - Kanban Tuyển dụng:**
  1. Vào menu **"Phễu tuyển dụng"** (`/app/pipeline`).
  2. Xem các cột phễu: C3 (Tiếp nhận) -> L1 (Telesale nuôi dưỡng) -> L2 (Hẹn PV) -> L3 (Đi làm) -> L4 (Hoa hồng VWW).
  3. Bấm vào 1 Deal bất kỳ -> Chọn **"Chuyển trạng thái"** sang bước tiếp theo kèm lý do/ghi chú.
* **Thao tác 3.2 - Lưới Excel Grid Workspace:**
  1. Vào menu **"Lưới Excel CRM"** (`/app/grid`).
  2. Thử chỉnh sửa nhanh số điện thoại hoặc trạng thái của 1 lao động trực tiếp trên ô lưới như Excel.
  3. Mở tab Google Sheet `01_MASTER_WORKERS`: Kiểm tra dòng tương ứng đã nhận dữ liệu mới trong vòng 2 giây.
* **Tiêu chuẩn nghiệm thu ĐẠT:**
  - Giao diện kéo thả Kanban và Lưới Excel mượt mà, không giật lag.
  - Đồng bộ 2 chiều tức thì, có lưu nhật ký vào tab `03_AUDIT_LOG`.

---

### 🧪 KỊCH BẢN 4: HỒ SƠ WORKER 360 & TÍNH NĂNG CHĂM SÓC 1-3-7 NGÀY / RE-ACTIVATION (2 Phút)
* **Thao tác:**
  1. Vào menu **"Lao động"** (`/app/workers`) -> Bấm chọn 1 công nhân (ví dụ: `WK-T001`).
  2. Màn hình Hồ sơ 360 mở ra: Xem đầy đủ 34 trường thông tin VNeID, lịch sử phỏng vấn và nhà máy phân bổ.
  3. Kiểm tra khối **"Chăm sóc công nhân 1-3-7 ngày"**: Xem nhật ký hỏi thăm và cảnh báo tâm tư (khó khăn, cơm nước, ép ca).
  4. Bấm nút **"Mời tái làm xưởng mới (0đ)"**: Kiểm tra form kích hoạt tự động gửi tin Zalo/SMS cho công nhân cũ.
* **Tiêu chuẩn nghiệm thu ĐẠT:**
  - Hiển thị đầy đủ thông tin định danh 360 độ của công nhân.
  - Sẵn sàng kích hoạt tái tuyển dụng công nhân cũ mà không tốn chi phí quảng cáo.

---

## 📋 MẪU XÁC NHẬN NGHIỆM THU NHANH (CLIENT SIGN-OFF TEMPLATE)

Khi hoàn thành 4 kịch bản trên và hài lòng với chất lượng hệ thống, Quý Khách hàng chỉ cần copy đoạn văn bản dưới đây gửi vào nhóm Zalo dự án hoặc phản hồi qua Email:

```text
KÍNH GỬI: BAN ĐIỀU HÀNH DỰ ÁN FCS AI WORKFORCE OS
ĐẠI DIỆN KHÁCH HÀNG: [Tên Doanh Nghiệp / Trưởng Bộ Phận]

Tôi đã thực hiện kiểm tra thực tế hệ thống FCS AI WORKFORCE OS V2 theo 4 Kịch bản kiểm tra nhanh:
1. Trung tâm điều hành KPI & 5 chỉ số VWW: [ĐẠT]
2. Chuỗi Golden Flow 1-Click đồng bộ Google Sheets: [ĐẠT]
3. Phễu Kanban 19 Level Sale & Lưới Excel CRM Grid: [ĐẠT]
4. Hồ sơ 360 & Chăm sóc lao động 1-3-7 / Re-activation: [ĐẠT]

XÁC NHẬN: 
Tôi xác nhận NGHIỆM THU HOÀN THÀNH GIAI ĐOẠN 1 VÀ GIAI ĐOẠN 2. 
Hệ thống đạt yêu cầu về độ ổn định, dữ liệu thực tế và tốc độ xử lý.
Đề nghị Đội ngũ Kỹ thuật tiếp tục triển khai GIAI ĐOẠN 3: B2B Employer CRM & Tự động hóa Khớp công VWW / Doanh thu xưởng theo lộ trình.

Thời gian xác nhận: Ngày ..... Tháng ..... Năm 2026
Người xác nhận: [Họ và Tên / Chức vụ]
```

---
*FCS AI Workforce OS — Bản quyền thuộc về Ban Điều hành & Đội ngũ Kỹ thuật FCS.*
