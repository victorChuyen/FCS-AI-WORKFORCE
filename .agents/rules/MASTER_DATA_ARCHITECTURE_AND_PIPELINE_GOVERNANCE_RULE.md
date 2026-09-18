# 🏆 FCS AI WORKFORCE OS — MASTER DATA ARCHITECTURE & PIPELINE GOVERNANCE RULE
> **MANDATORY SYSTEM DIRECTIVE — BẢN QUY TẮC BẮT BUỘC TUÂN THỦ TỐI CAO**  
> **Executive Leadership:** Chairman Victor Chuyen & AI CEO Lucky  
> **Ban hành:** 2026-09-18 (Quyết định kỷ luật kiến trúc & Chuẩn hóa toàn diện dữ liệu)

---

## 🛑 BẢN TỰ PHÊ BÌNH CỦA AI CEO LUCKY: NHẬN DIỆN LỖI SƠ ĐẢNG
> *"Một AI CEO điều hành hệ thống quy mô doanh nghiệp mà để bảng Deal sinh ra lỗi `#ERROR!` trong khi bảng Master Workers lại trống rỗng là một **LỖI SƠ ĐẢNG VỀ TƯ DUY KIẾN TRÚC DỮ LIỆU**. Đây là bài học xương máu không được phép tái phạm!"*

### ⚠️ 3 Lỗi sơ đảng đã mắc phải:
1. **Lộn xộn giữa GỐC (Ground Truth) và NGỌN (Operational Events):**
   - Không hiểu rằng **Con người (`01_MASTER_WORKERS`) là thực thể gốc độc lập**, tồn tại trước mọi giao dịch.
   - Vội vàng sinh Deal mà không đảm bảo Master Data đã được nạp đầy đủ và kiểm tra toàn vẹn trước tiên.
2. **Nhầm lẫn tai hại giữa "Hồ sơ công nhân xưởng lịch sử" và "Lead Marketing Inbound":**
   - Đem 925 công nhân từ bảng lương xưởng Tháng 7 nạp qua luồng `v2.batch.import` (vốn chỉ dành cho lead marketing mới từ Facebook/TikTok).
   - Bộ lọc kiểm tra SĐT bắt buộc (`phone.length >= 10`) đã thẳng tay loại bỏ 906 công nhân xưởng (do danh sách nhà máy chỉ có tên và mã thẻ), biến họ thành "lead rác" và không ghi vào `01_MASTER_WORKERS`, trong khi vẫn sinh deal mồ côi!
3. **Dùng công thức động (`=VLOOKUP`) trong bảng giao dịch (`02_CRM_DEALS_2026`):**
   - Giao dịch phải lưu **Giá trị tĩnh (Snapshot Value)** tại thời điểm phát sinh.
   - Việc chèn chuỗi công thức `=IFERROR(VLOOKUP(...))` là sai lầm căn bản: vừa gây sụp đổ `#ERROR!` dây chuyền khi bảng Worker trống, vừa gây lỗi parser do khác biệt dấu phân cách (`,` vs `;`) giữa các vùng ngôn ngữ (Locale) của Google Sheets.

---

## ⚡ 5 NGUYÊN TẮC BẮT BIẾN VỀ KIẾN TRÚC DỮ LIỆU (NON-NEGOTIABLE LAWS)

### 🔴 ĐIỀU 1: NGUYÊN TẮC GỐC — NGỌN (MASTER DATA IS SOVEREIGN GROUND TRUTH)
1. **BẢNG GỐC (`01_MASTER_WORKERS`) LÀ TỐI THƯỢNG:**
   - Mỗi con người là một thực thể vật lý duy nhất, mang mã bất biến `WK-XXXXXX` với 34 cột thông tin chuẩn VNeID/CCCD.
   - Bảng Gốc **PHẢI LUÔN ĐƯỢC NẠP VÀ KIỂM TRA TOÀN VẸN TRƯỚC TIÊN** làm nền móng vững chắc.
   - **CẤM TUYỆT ĐỐI tình trạng bảng Deal hoặc bảng phân bổ có dữ liệu mà bảng Master Workers lại trống rỗng!**
2. **BẢNG GIAO DỊCH (`02_CRM_DEALS_2026`) LÀ NGỌN (DERIVED TRANSACTIONS):**
   - Deal **KHÔNG PHẢI LÀ CON NGƯỜI**. Deal là một **tiến trình ứng tuyển** của người lao động vào một xưởng/đối tác theo thời gian.
   - Một người (`WK-000010`) có thể có nhiều Deal qua các đợt tuyển dụng khác nhau.
   - Deal mang khóa ngoại trỏ về `worker_id`. Nếu không có `worker_id` hợp lệ trong `01_MASTER_WORKERS`, giao dịch đó là **VÔ GIÁ TRỊ (INVALID TRANSACTION)**.
3. **CÁC TIẾN TRÌNH HỆ QUẢ CỦA VẬN HÀNH:**
   - `06_INTERVIEWS`: Sinh ra khi Deal chuyển sang phỏng vấn (`L2`).
   - `07_ASSIGNMENTS`: Sinh ra khi Deal đỗ phỏng vấn và xuất quân đi làm xưởng (`L2.1` -> `L3`).
   - `08_ATTENDANCE_RAW`: Dữ liệu bảng công khách quan từ máy chấm công đối tác nhà máy gửi về hàng tháng.

---

### 🔴 ĐIỀU 2: CẤM TUYỆT ĐỐI CÔNG THỨC TRONG BẢNG GIAO DỊCH (ZERO FORMULA — STATIC SNAPSHOT ONLY)
- **Tôn chỉ bất biến:** Sổ cái giao dịch (`02_CRM_DEALS_2026`) **BẮT BUỘC PHẢI LƯU DỮ LIỆU SNAPSHOT TĨNH (STATIC SNAPSHOT VALUES)**.
- Khi tạo Deal hoặc cập nhật Deal:
  - Cột Họ tên (`full_name`), SĐT (`phone`), CCCD (`cccd`) phải được gán trực tiếp bằng chuỗi giá trị thực lấy từ Worker Object tại thời điểm đó.
  - **NGHIÊM CẤM 100% việc chèn công thức `=IFERROR(VLOOKUP(...), "")` hay bất kỳ công thức động nào vào các ô dữ liệu của bảng Deal.**
- **3 Lý do kỹ thuật cốt tử:**
  1. Chống lỗi dây chuyền: VLOOKUP sụp đổ thành `#ERROR!` hoặc `#REF!` khi bảng nguồn bị lọc, sắp xếp lại hoặc chậm tải.
  2. Chống xung đột Locale: Google Sheets tiếng Việt dùng dấu chấm phẩy `;` làm phân cách tham số, trong khi tiếng Anh dùng dấu phẩy `,`. Công thức viết bằng code sẽ vỡ trận ngay lập tức.
  3. Tính toàn vẹn lịch sử (Audit Trail): Nếu 2 năm sau công nhân đổi SĐT, hồ sơ Deal của đợt tuyển dụng năm 2026 vẫn phải giữ nguyên số điện thoại giao dịch năm 2026.

---

### 🔴 ĐIỀU 3: PHÂN TÁCH HOÀN TOÀN 2 LUỒNG NẠP DỮ LIỆU (DUAL-INTAKE SEPARATION)
- Tuyệt đối không dùng chung một logic xử lý cho hai tập dữ liệu có bản chất khác nhau:
  1. **Luồng A — Nạp Master Data (Factory Roster / Historical Migration):**
     - Dành cho danh sách công nhân thực tế từ các nhà máy, xưởng sản xuất (như gói 925 hồ sơ Tháng 7).
     - Đặc thù: Nhiều hồ sơ chỉ có Họ tên, Quê quán, Mã thẻ công nhân, không có SĐT/CCCD.
     - **Quy tắc xử lý:** Nạp thẳng vào `01_MASTER_WORKERS`, `07_ASSIGNMENTS`, `08_ATTENDANCE_RAW`. **CẤM áp dụng bộ lọc SĐT marketing để loại bỏ công nhân! CẤM tự động sinh Deal ảo!**
  2. **Luồng B — Inbound Marketing Intake (`v2.batch.import`):**
     - Chỉ áp dụng cho ứng viên mới tiếp nhận qua Form Marketing / Fanpage / Zalo / Website.
     - Ứng viên mới chưa có mã công nhân ➔ Hệ thống cấp mã `WK-` mới và sinh đúng 1 Deal ở phễu `C3` để nhân viên Sale gọi điện tư vấn.

---

### 🔴 ĐIỀU 4: THƯỚC ĐO VWW LÀ KẾT QUẢ ĐỐI SOÁT TỰ ĐỘNG (RECONCILIATION ENGINE)
- **VWW = Verified Working Worker (Lao động đi làm đã xác minh)**:
  - VWW **KHÔNG PHẢI LÀ DỮ LIỆU ĐƯỢC PHÉP GÕ TAY HAY SUY DIỄN MOCK**.
  - VWW là **kết quả toán học của logic đối soát tự động**:
    $$\text{Lệnh phân bổ xưởng (07\_ASSIGNMENTS)} \quad \bigcap \quad \text{Dữ liệu chấm công nhà máy (08\_ATTENDANCE\_RAW)} \ge 15 \text{ công}$$
  - Khi và chỉ khi 2 tập dữ liệu này khớp mã `worker_id`, mã nhà máy, và đạt đủ ngưỡng công quy định trong tháng, hệ thống mới tự động kích hoạt `is_vww = true` trên Deal và chuyển sang giai đoạn `L4`.

---

### 🔴 ĐIỀU 5: TỰ ĐỘNG ĐỒNG BỘ QUYỀN HẠN DRIVE NATIVE (ZERO HARDCODED ADMINS)
- Code Google Apps Script **TUYỆT ĐỐI KHÔNG ĐƯỢC HARDCODE CỨNG 1 EMAIL**, mà phải tự động kế thừa (map) toàn bộ danh sách **Chủ sở hữu (Owner)** và **Người chỉnh sửa (Editors)** mà Chairman đã chia sẻ trên Google Drive.
- Mọi tài khoản Admin (`coach.chuyen@gmail.com`, `dathao.188@gmail.com`, `tuanluong.51pm1@gmail.com`, `tranngocchuyen1980@gmail.com`) đều có quyền Thêm / Sửa / Xóa dữ liệu ngang hàng nhau.
- Cơ chế khóa dải ô (Range Protection) chỉ được phép chạy ở chế độ **Cảnh báo nhắc nhở (`setWarningOnly(true)`)**, cấm tuyệt đối lệnh `removeEditors()` tước quyền của Admin.

---

## 📋 BẢNG DANH MỤC TRÁCH NHIỆM KIỂM ĐỊNH (AUDIT CHECKLIST)

Mỗi khi Dev Team hoặc AI Agent thao tác trên dữ liệu hệ thống, bắt buộc phải đối chiếu:

| Bước | Hạng mục kiểm định | Quy chuẩn bắt buộc | Trạng thái xác nhận |
|:---:|---|---|:---:|
| **1** | Kiểm tra Thực thể Gốc | `01_MASTER_WORKERS` phải có đầy đủ dữ liệu trước khi sinh bất kỳ Deal nào. | [ ] ĐÃ DUYỆT |
| **2** | Kiểm tra Định dạng Deal | Cột Họ tên, SĐT, CCCD trên `02_CRM_DEALS_2026` là text thuần (Snapshot), ZERO formula `=VLOOKUP`. | [ ] ĐÃ DUYỆT |
| **3** | Quét sạch Lỗi công thức | Tuyệt đối không có ô nào trên toàn bộ 12 Sheet hiển thị lỗi đỏ `#ERROR!` hoặc `#REF!`. | [ ] ĐÃ DUYỆT |
| **4** | Toàn vẹn Khóa ngoại | Toàn bộ mã công nhân trên `07_ASSIGNMENTS` phải tồn tại trong `01_MASTER_WORKERS`. | [ ] ĐÃ DUYỆT |
| **5** | Đối soát Chấm công | `08_ATTENDANCE_RAW` phải khớp mã `worker_id` và kỳ làm việc thực tế của nhà máy. | [ ] ĐÃ DUYỆT |
| **6** | Phân quyền Quản trị | Cả 3 Admin (`coach.chuyen@gmail.com`, `dathao.188@gmail.com`, `tuanluong.51pm1@gmail.com`) đều chỉnh sửa được sheet. | [ ] ĐÃ DUYỆT |
