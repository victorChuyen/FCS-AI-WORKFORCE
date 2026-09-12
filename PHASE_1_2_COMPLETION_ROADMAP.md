# 🏆 FCS AI WORKFORCE OS — KẾ HOẠCH BÀN GIAO HOÀN THÀNH GIAI ĐOẠN 1 & 2
> **EXECUTIVE STRATEGIC BLUEPRINT — BẢN KẾ HOẠCH HÀNH ĐỘNG CỦA AI CEO LUCKY**  
> **Chỉ huy tối cao:** Chairman Victor Chuyen | **Điều hành thực thi:** AI CEO Lucky  
> **Cập nhật:** 2026-09-12 | **Phiên bản:** 1.0 — Production Ready

---

## 🎯 TÔN CHỈ ĐIỀU HÀNH: TỰ ĐỘNG THỰC THI — CHỦ ĐỘNG TIẾN ĐỘ
*"Không hỏi vụn vặt — Không chờ đợi cầm tay chỉ việc. CEO Lucky tự thiết lập Definition of Done (DoD), tự kiểm thử, tự đóng gói và báo cáo kết quả thực chất cho Chairman phê duyệt."*

---

## 🏁 GIAI ĐOẠN 1: WORKFORCE CORE & DATA MANAGEMENT (SCOPE PRODUCTION PILOT)
> **Mục tiêu tối thượng:** Vận hành trơn tru chuỗi giá trị từ lúc tiếp nhận lao động đến khi đối soát chấm công phát sinh **VWW (Verified Working Worker)** trên dữ liệu Google Sheets thực tế 100%.

### 📌 Tiêu Chí Hoàn Thành Tuyệt Đối (Definition of Done - DoD Phase 1)

| STT | Hạng mục cốt lõi | Chi tiết kỹ thuật & Nghiệp vụ | Tiêu chí hoàn thành (DoD) | Trạng thái hiện tại |
|:---:|---|---|---|:---:|
| **1** | **Workforce Ingestion & Master** | Quản lý hồ sơ lao động tập trung, tự động phát hiện nghi trùng SĐT/CCCD | Hồ sơ tạo mới không bị trùng, lưu vào `04_WORKERS_MASTER`. | ✅ **Đã hoàn thành** (6 hồ sơ thật đang chạy) |
| **2** | **Interview Management** | Đặt lịch phỏng vấn, ghi nhận kết quả ĐẬU/TRƯỢT theo xưởng | Cập nhật chặng `INTERVIEWED` → `PASSED`, lưu vào `06_INTERVIEWS`. | ✅ **Đã hoàn thành** |
| **3** | **Assignment & Start Work** | Phân xưởng đối tác (Foxconn, Luxshare...), phân bổ ca làm và ngày đi làm | Trạng thái chuyển sang `WAITING_START` → `WORKING`, lưu `07_ASSIGNMENTS`. | ✅ **Đã hoàn thành** |
| **4** | **Attendance Ingestion** | Tiếp nhận dữ liệu chấm công từ KCN/đối tác (File Excel/CSV thô) | Bảng `08_ATTENDANCE_RAW` & `09_ATTENDANCE` ghi nhận số công thực. | ✅ **Đã hoàn thành** |
| **5** | **Matching Engine & Review** | Thuật toán đối soát tự động theo Worker ID / CCCD / SĐT | Khớp công >= 90% auto-match, < 90% đưa vào `10_MATCHING_REVIEW`. | ✅ **Đã hoàn thành** |
| **6** | **North Star Metric: VWW** | Xác minh lao động thực tế phát sinh công tại xưởng | Đóng dấu `isVww = true`, nhảy số VWW trên Dashboard. | ✅ **Đã hoàn thành** (VWW = 1 thật) |
| **7** | **Command Center (Today)** | Màn hình điều hành duy nhất cho 1 Operator | Hiển thị Action Queue, việc tồn đọng trong ngày, gợi ý hành động. | ✅ **Đã hoàn thành** |
| **8** | **Bảo mật & RBAC Multi-Tenant** | Phân quyền 4 vai trò qua Firebase Auth & Admin SDK | 4 tài khoản nòng cốt phân quyền chuẩn, token giải mã tức thì. | ✅ **Đã hoàn thành 100%** |
| **9** | **Nâng cấp Backend V4 Multi-Tenant** | Tách biệt `FCS_SUPER_ADMIN_MASTER` và 2 Sheet Tenant | Đã đóng gói xong `backend/Code.gs` (49.4 KB), sẵn sàng triển khai. | ⏳ **Chờ deploy Web App V4** |

---

## 🤖 GIAI ĐOẠN 2: AI WORKER CARE (CHĂM SÓC & TÁI KÍCH HOẠT LAO ĐỘNG TỰ ĐỘNG)
> **Mục tiêu tối thượng:** Biến hệ điều hành từ *"Phần mềm quản lý tĩnh"* thành *"Cỗ máy tự động giữ chân lao động"*, giảm 80% tỷ lệ bỏ việc trong 7 ngày đầu và tự động tái tuyển dụng lao động cũ mà không tốn chi phí quảng cáo.

### 📌 Tiêu Chí Hoàn Thành Tuyệt Đối (Definition of Done - DoD Phase 2)

| STT | Trụ cột tính năng | Kịch bản tự động hóa (AI Automation) | Tiêu chí hoàn thành (DoD) |
|:---:|---|---|---|
| **1** | **Worker 360 AI Insight** | Phân tích hành vi, cảnh báo sớm nguy cơ bỏ việc (Churn Risk) dựa trên số buổi nghỉ, đi trễ hoặc biến động chấm công | Hồ sơ chi tiết mỗi lao động có cột điểm sức khỏe (Worker Health Score 1-100) và gợi ý can thiệp kịp thời. |
| **2** | **Trợ Lý Chăm Sóc Theo Chặng (Lifecycle Nurture)** | Tự động gửi thông điệp chăm sóc đúng thời điểm: <br>• *Ngày 0:* Hướng dẫn chuẩn bị giấy tờ & xe đưa đón.<br>• *Ngày 1:* Hỏi thăm ngày làm việc đầu tiên.<br>• *Ngày 3 & 7:* Khảo sát môi trường xưởng & ký túc xá.<br>• *Ngày 15 & 30:* Chúc mừng và nhắc nhở thưởng chuyên cần. | Tích hợp webhook/queue tự động sinh kịch bản tin nhắn cá nhân hóa theo từng lao động mà Recruiter chỉ cần bấm 1 chạm để gửi. |
| **3** | **Cổng Kết Nối Đa Kênh (Zalo OA / ZNS / SMS)** | Kết nối Zalo Official Account hoặc SMS Brandname | Gửi thông báo trực tiếp đến điện thoại người lao động có tracking trạng thái đọc/nhận. |
| **4** | **Re-activation Engine (Tái Tuyển Dụng 0 Đồng)** | Quét kho lao động đã kết thúc hợp đồng hoặc thôi việc trước đó khi có đơn tuyển mới phù hợp với kỹ năng/địa phương cũ | Hệ thống tự động lọc ra danh sách ứng viên tiềm năng và đề xuất chiến dịch nhắn tin mời quay lại làm việc. |
| **5** | **AI Khảo Sát & Giải Quyết Khiếu Nại Nhanh** | Thu thập phản hồi nhanh về tiền lương, cơm ca, môi trường làm việc | Dashboard phân tích tâm lý lao động (Sentiment Analysis) theo từng nhà máy đối tác. |

---

## 🗓️ LỘ TRÌNH TRIỂN KHAI & THỜI GIAN BIỂU (EXECUTION TIMELINE)

```
Sprints & Mốc Bàn Giao
├─ Sprint 1 (Hôm nay - Ngày 1): HOÀN THÀNH TOÀN DIỆN GIAI ĐOẠN 1
│  ├─ [x] Sửa 12 lỗi bảo mật, logic, bundle và routing
│  ├─ [x] Tích hợp Firebase Admin SDK & Seed 4 tài khoản doanh nghiệp thực tế
│  ├─ [x] Kiểm tra chẩn đoán 5/5 API endpoints Google Sheets kết nối thành công
│  ├─ [x] Đóng gói trọn vẹn backend/Code.gs (49.4 KB)
│  └─ [ ] Triển khai Web App V4 Multi-Tenant & Chạy Acceptance Test cuối cùng
│
├─ Sprint 2 (Ngày 2 - Ngày 3): XÂY DỰNG WORKER 360 & CHURN RISK AI (GIAI ĐOẠN 2 - BƯỚC 1)
│  ├─ Tích hợp thuật toán tính điểm Worker Health Score & Churn Risk vào Worker Detail
│  ├─ Xây dựng Action Card tự động trên Today Page: "Lao động có nguy cơ nghỉ việc"
│  └─ Tạo thư viện mẫu tin nhắn Zalo/SMS chuẩn theo 5 giai đoạn vòng đời lao động
│
└─ Sprint 3 (Ngày 4 - Ngày 5): KÍCH HOẠT RE-ACTIVATION ENGINE & ZALO OA (GIAI ĐOẠN 2 - BƯỚC 2)
   ├─ Xây dựng bộ lọc 1-Click: "Tìm lại lao động cũ phù hợp đơn hàng"
   ├─ Kết nối webhook gửi tin nhắn Zalo OA / ZNS
   └─ Bàn giao trọn gói Giai đoạn 1 & 2 sẵn sàng cho Sales chốt cọc khách hàng
```

---

## 📋 NGUYÊN TẮC BÁO CÁO CỦA CEO LUCKY
* **Ca sáng (Trước 11:00):** Báo cáo tiến độ các tính năng đã code và kết quả build.
* **Ca chiều (Trước 16:00):** Báo cáo nghiệm thu thực tế trên dữ liệu Google Sheets và các đề xuất tối ưu.
* **Chỉ gọi Chairman khi:** Cần quyền truy cập cấp cao của bên thứ 3 (OAuth client, billing, cổng nạp tiền). Toàn bộ phần kỹ thuật, code, bug, test, kiến trúc Lucky tự động xử lý 100%.
