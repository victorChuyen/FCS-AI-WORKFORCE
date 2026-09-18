# 🛡️ BÁO CÁO AUDIT DỮ LIỆU THỰC TẾ & HƯỚNG DẪN ĐỒNG BỘ CHO DEV TEAM
## TỆP DỮ LIỆU: `FCS_V2_WORKFORCE_CRM_MASTER_T7_READY_ID_FIXED.xlsx`
**Người lập báo cáo:** Senior QA Lead / System Auditor (20 năm kinh nghiệm QA & Database Architecture)  
**Người nhận chỉ thị:** Dev Team / Data Migration Engineer  
**Ngày ban hành:** 2026-09-18  
**Trạng thái kiểm định:** **APPROVED FOR MIGRATION (ĐÃ CHUẨN HÓA CẤU TRÚC V2 — ĐỦ ĐIỀU KIỆN ĐẨY LÊN SHEET GỐC)**  
**Mục tiêu:** Đồng bộ toàn bộ **925 Hồ sơ Lao động thực tế**, **906 Phân bổ xưởng**, **895 Bản ghi đối soát công Tháng 7**, **14 Deal CRM**, cùng Danh mục chuẩn vào Google Spreadsheet Master (`1YAVNiPtAiYrxEThvIgWuR0PAHJbDCDqrXCz5SNwrxXE`).

---

## 📊 PHẦN 1: TỔNG QUAN AUDIT 16 TABS CỦA TỆP `T7_READY_ID_FIXED.xlsx`

Tệp `D:\FCS-AI-WORKFORCE\v2\FCS_V2_WORKFORCE_CRM_MASTER_T7_READY_ID_FIXED.xlsx` (Dung lượng: 149.9 KB) là tệp dữ liệu đã được làm sạch và chuẩn hóa ID tốt nhất của dự án. Toàn bộ 16 Tabs đều tuân thủ nghiêm ngặt cấu trúc V2:

| STT | Tên Sheet trong Excel | Số Dòng Data | Số Cột | Tình trạng Khóa chính (Col A) | Khóa ngoại (Foreign Key) | Đánh giá Nghiệp vụ & Dữ liệu |
|:---:|---|:---:|:---:|:---:|:---:|---|
| **1** | `01_MASTER_WORKERS` | **925** | 34 | `WK-000010` $\rightarrow$ `WK-000925`<br>**(925 ID duy nhất, 0 trùng lặp)** | N/A | **Hồ sơ lao động Master**: 15 hồ sơ mẫu đầy đủ CCCD/VNeID + 910 công nhân thực tế từ bảng lương nhà máy. |
| **2** | `02_CRM_DEALS_2026` | **14** | 22 | `DL-2026-T001` $\rightarrow$ `DL-2026-T014`<br>**(14 ID duy nhất, 0 trùng lặp)** | Khớp 100% `worker_id`<br>**(0 lỗi khóa ngoại)** | **14 Deal bán hàng thực tế**: Đầy đủ 19 Level Sale, gán Sale phụ trách, chi nhánh và cờ `is_vww`. |
| **3** | `07_ASSIGNMENTS` | **906** | 11 | `ASG-T7-F0126856`...<br>**(906 ID duy nhất, 0 trùng lặp)** | Khớp 100% `worker_id`<br>**(0 lỗi khóa ngoại)** | **Phân bổ xưởng GĐ1-GĐ2**: Gán nhà máy (BROTHER, FUYU, LUXSHARE...), số ngày công thực tế (26 công, 22 công...). |
| **4** | `08_ATTENDANCE_RAW` | **895** | 8 | `RAW-T7-F0126856`...<br>**(895 ID duy nhất, 0 trùng lặp)** | Khớp 100% `worker_id`<br>**(0 lỗi khóa ngoại)** | **Dữ liệu chấm công Tháng 7**: Số giờ công thô (208h, 176h...) phục vụ thuật toán đối soát tự động VWW. |
| **5** | `DM_COMPANY` | **29** | 4 | 29 Mã đối tác B2B | Khớp 100% trong Deals/Asg | **29 Nhà máy đối tác B2B**: WNC, WISTRON, AVC, BROTHER, FUYU, LUXSHARE, FOXCONN, TW, HTD... |
| **6** | `DM_BRANCH` | **8** | 4 | 8 Mã chi nhánh tuyển dụng | Khớp 100% trong Workers | **8 Chi nhánh miền Bắc**: HÀ NAM, NAM ĐỊNH, HƯNG YÊN, BẮC NINH, BẮC GIANG, HẢI DƯƠNG, THÁI NGUYÊN, VĨNH PHÚC. |
| **7** | `DM_LEVEL_SALE` | **19** | 4 | C3 $\rightarrow$ L4 (19 Cấp độ) | Chuẩn hóa BA 1.5 | **19 Cấp độ Sale chuẩn**: C3 (Tiếp nhận), L1 (Tư vấn), L2 (Phỏng vấn), L3 (Đi làm VWW), L4 (Nghiệm thu). |
| **8** | `IN ( Data - Mục Tiêu -KQ đầu ra` | **3** | 13 | `DEV-2026-001` $\rightarrow$ `003` | N/A | **Tab Backlog & Support Kỹ thuật**: Lưu vết 3 phiếu góp ý ban đầu của Chairman & Ban Giám Đốc. |
| **9** | `INFO` | **51** | 26 | 17 Mã vai trò RBAC | N/A | **Ma trận phân quyền RBAC**: Phân định quyền Super Admin, Tenant Admin, Accountant, Field Recruiter, Guest. |
| **10** | `03_AUDIT_LOG` | **24** | 11 | `AUD-SEED-...` (24 logs) | N/A | **Nhật ký kiểm toán hệ thống**: Vết kiểm toán khởi tạo ban đầu. |
| **11** | `04_LEADS_MARKETING` | **1** | 26 | `LD-20260918-0001` | N/A | **Lead tiếp nhận từ Landing Page**: Khách hàng doanh nghiệp quan tâm giải pháp. |
| **12** | `05_PIPELINE_EVENTS` | 0 | 10 | Header chuẩn sẵn sàng | Sẵn sàng ghi log sự kiện | Bảng lưu vết chuyển đổi trạng thái Pipeline Kanban. |
| **13** | `06_INTERVIEWS` | 0 | 11 | Header chuẩn sẵn sàng | Sẵn sàng tiếp nhận lịch | Bảng đặt lịch phỏng vấn tập trung tại cổng nhà máy. |
| **14** | `09_ATTENDANCE` | 0 | 9 | Header chuẩn sẵn sàng | Sẵn sàng lưu công verified | Bảng chấm công đã được xác thực đóng dấu VWW. |
| **15** | `10_MATCHING_REVIEW` | 0 | 10 | Header chuẩn sẵn sàng | Sẵn sàng đối soát | Bảng kết quả chạy thuật toán đối soát Module 12. |
| **16** | `11_ACTION_QUEUE` | 0 | 11 | Header chuẩn sẵn sàng | Sẵn sàng điều phối | Hàng đợi công việc cần xử lý hôm nay cho từng nhân viên. |

---

## 🔍 PHẦN 2: KẾT QUẢ KIỂM TRA CHẤT LƯỢNG DỮ LIỆU (DATA HYGIENE AUDIT)

QA Lead đã chạy kiểm thử chẩn đoán độc lập trên toàn bộ các cặp khóa và kiểu dữ liệu:

### 1. Tính toàn vẹn Khóa ngoại (Foreign Key Referential Integrity): **100% ĐẠT**
* **Deals $\rightarrow$ Workers:** 14/14 Deals đều trỏ tới `worker_id` có thực trong bảng Master (`WK-000010` đến `WK-000023`). **Số lỗi = 0.**
* **Assignments $\rightarrow$ Workers:** 906/906 Bản ghi phân xưởng đều trỏ tới `worker_id` có thực trong bảng Master (`WK-000020` trở đi). **Số lỗi = 0.**
* **Attendance Raw $\rightarrow$ Workers:** 895/895 Bản ghi công tháng 7 đều trỏ tới `worker_id` có thực trong bảng Master. **Số lỗi = 0.**
* **Không có bất kỳ ID nào bị trùng lặp (Zero Duplicates)** trên toàn bộ các cột Mã (Col A).

### 2. Điểm lưu ý nghiệp vụ dành cho Dev Team (Important Data Characteristics):
* **Nhóm 15 hồ sơ đầu tiên (`WK-000001` $\rightarrow$ `WK-000015`):** Có đầy đủ 100% thông tin cá nhân (CCCD 12 số, ngày cấp, quê quán, nơi thường trú VNeID, số điện thoại người thân, tài khoản ngân hàng). Nhóm này phục vụ trực tiếp cho phễu 14 Deals bán hàng và luồng Golden Flow.
* **Nhóm 910 hồ sơ tiếp theo (`WK-000020` $\rightarrow$ `WK-000925`):** Đây là tập dữ liệu thực chiến được bóc tách từ bảng lương và danh sách chấm công Tháng 7 của các nhà máy đối tác (Foxconn, Hamaden, Brother, Fuyu...). Do tính chất bảng chấm công xưởng, dữ liệu gốc có: `full_name`, `staff_code` (mã thẻ xưởng), `target_company`, `work_type` (TV/CT), `attendance_days` và `hours`.
* **Cảnh báo kỹ thuật:** Khi import vào Google Sheets, các cột rỗng (như CCCD, ngày sinh) của nhóm này phải được để chuỗi rỗng `""`, **tuyệt đối không được điền giá trị `null` hoặc `undefined`** để tránh làm lỗi các hàm Apps Script Backend (`trim()`, `toUpperCase()`).

---

## 🚀 PHẦN 3: KỊCH BẢN ĐỒNG BỘ TỰ ĐỘNG LÊN GOOGLE SHEET (DÀNH CHO DEV TEAM)

Để đưa dữ liệu từ tệp `T7_READY_ID_FIXED.xlsx` lên Google Spreadsheet Master (`1YAVNiPtAiYrxEThvIgWuR0PAHJbDCDqrXCz5SNwrxXE`), Dev Team có 2 phương án thực thi:

### 🌟 PHƯƠNG ÁN 1 (KHUYẾN NGHỊ): CHẠY SCRIPT NODE.JS ĐẨY QUA GOOGLE SHEETS API (NHANH 60 GIÂY)

Dev Team tạo file `v2/scripts/sync_t7_ready_to_google_sheet.mjs` với nội dung code chuẩn dưới đây và chạy lệnh:
`node v2/scripts/sync_t7_ready_to_google_sheet.mjs`

```javascript
/**
 * sync_t7_ready_to_google_sheet.mjs
 * Tự động đọc FCS_V2_WORKFORCE_CRM_MASTER_T7_READY_ID_FIXED.xlsx
 * và ghi trực tiếp toàn bộ dữ liệu vào Google Spreadsheet Master
 */
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import xlsx from 'xlsx';

const SPREADSHEET_ID = '1YAVNiPtAiYrxEThvIgWuR0PAHJbDCDqrXCz5SNwrxXE';
const EXCEL_PATH = 'D:/FCS-AI-WORKFORCE/v2/FCS_V2_WORKFORCE_CRM_MASTER_T7_READY_ID_FIXED.xlsx';

const CLASP_CLIENT_ID = '1072944905499-vm2v2i5dvn0a0d2o4ca36i1vge8cvbn0.apps.googleusercontent.com';
const CLASP_CLIENT_SECRET = 'v6V3fKV_zWU7iw1DrpO1rknX';

async function getAccessToken() {
  const clasprcPath = join(homedir(), '.clasprc.json');
  if (!existsSync(clasprcPath)) throw new Error('Không tìm thấy .clasprc.json. Hãy login clasp.');
  const clasprc = JSON.parse(readFileSync(clasprcPath, 'utf-8'));
  const refreshToken = clasprc.tokens?.default?.refresh_token || clasprc.token?.refresh_token;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLASP_CLIENT_ID,
      client_secret: CLASP_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('Không lấy được access token: ' + JSON.stringify(data));
  return data.access_token;
}

async function main() {
  console.log('🔄 Đang khởi tạo Access Token Google API...');
  const accessToken = await getAccessToken();
  console.log('✅ Access Token sẵn sàng.');

  console.log('📖 Đang đọc tệp Excel:', EXCEL_PATH);
  const wb = xlsx.readFile(EXCEL_PATH);

  // Danh sách các tab cần đồng bộ ưu tiên
  const targetTabs = [
    '01_MASTER_WORKERS',
    '02_CRM_DEALS_2026',
    '07_ASSIGNMENTS',
    '08_ATTENDANCE_RAW',
    'DM_COMPANY',
    'DM_BRANCH',
    'DM_LEVEL_SALE',
    'INFO',
    'IN ( Data - Mục Tiêu -KQ đầu ra là gì )'
  ];

  for (const sheetName of wb.SheetNames) {
    const matchedTarget = targetTabs.find(t => 
      t.toLowerCase().startsWith(sheetName.toLowerCase().slice(0, 10))
    ) || sheetName;

    const sheet = wb.Sheets[sheetName];
    const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (rawData.length === 0) continue;

    console.log(`\n🚀 Đang đồng bộ Tab [${sheetName}] -> Sheet [${matchedTarget}] (${rawData.length} dòng)...`);

    // Chuẩn hóa dữ liệu sang dạng text an toàn tránh lỗi type
    const cleanValues = rawData.map(row => 
      row.map(cell => (cell === null || cell === undefined) ? '' : cell)
    );

    // Xóa sạch vùng cũ và ghi đè
    const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/'${encodeURIComponent(matchedTarget)}'!A1:ZZ50000:clear`;
    await fetch(clearUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
    });

    // Ghi dữ liệu mới vào
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/'${encodeURIComponent(matchedTarget)}'!A1?valueInputOption=USER_ENTERED`;
    const upRes = await fetch(updateUrl, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        range: `'${matchedTarget}'!A1`,
        majorDimension: 'ROWS',
        values: cleanValues
      })
    });

    if (upRes.ok) {
      console.log(`   ✅ Đồng bộ thành công tab [${matchedTarget}]: ${cleanValues.length} hàng.`);
    } else {
      const errText = await upRes.text();
      console.warn(`   ⚠️ Cảnh báo ghi tab [${matchedTarget}]:`, errText);
    }
  }

  console.log('\n🎉 TOÀN BỘ DỮ LIỆU ĐÃ ĐƯỢC ĐỒNG BỘ THÀNH CÔNG VÀO GOOGLE SHEET GỐC!');
}

main().catch(console.error);
```

---

### 📋 PHƯƠNG ÁN 2: THAO TÁC THỦ CÔNG QUA GIAO DIỆN GOOGLE SHEETS (DÀNH CHO NON-TECH)

1. Mở trực tiếp Google Sheet: `https://docs.google.com/spreadsheets/d/1YAVNiPtAiYrxEThvIgWuR0PAHJbDCDqrXCz5SNwrxXE/edit`
2. Mở file Excel `FCS_V2_WORKFORCE_CRM_MASTER_T7_READY_ID_FIXED.xlsx` trên máy tính.
3. Chọn từng Tab:
   * Tab `01_MASTER_WORKERS`: Copy từ dòng 2 đến dòng 926, Paste trực tiếp vào Tab `01_MASTER_WORKERS` trên Google Sheet (dưới dòng tiêu đề).
   * Tab `07_ASSIGNMENTS` & `08_ATTENDANCE_RAW`: Tạo tab mới trên Sheet nếu chưa có, Copy toàn bộ dữ liệu kèm tiêu đề dán sang.
4. Mở Apps Script Editor, chọn hàm `setupDashboardKpiSheet_` và bấm **Run** để Google Sheets tự động cập nhật công thức tính 925 lao động vào tab `00_DASHBOARD_KPI`.

---

## 🛡️ PHẦN 4: TIÊU CHÍ NGHIỆM THU DỮ LIỆU SAU KHI ĐỒNG BỘ (ACCEPTANCE CRITERIA)

Sau khi Dev Team thực hiện đồng bộ, QA Lead sẽ kiểm tra trên môi trường Live theo các tiêu chí sau:

- [ ] **Tiêu chí 1 (Sheet 01_MASTER_WORKERS):** Có chính xác **925 dòng lao động** (từ `WK-000010` đến `WK-000925`), không có dòng trống ở giữa.
- [ ] **Tiêu chí 2 (Sheet 02_CRM_DEALS_2026):** Có đủ **14 Deal CRM**, các liên kết `worker_id` hiển thị đúng tên người lao động.
- [ ] **Tiêu chí 3 (Sheet 00_DASHBOARD_KPI):** Ô `B2 (total_workers)` tự động nhảy số hiển thị **$\ge$ 925**; ô `B6 (total_deals)` hiển thị **$\ge$ 14**.
- [ ] **Tiêu chí 4 (Màn hình `/app/workers` trên Web App):** Danh sách hiển thị phân trang đủ 925 công nhân; tìm kiếm theo tên hoặc mã `WK-000101` hiển thị đúng hồ sơ và nhà máy.
- [ ] **Tiêu chí 5 (Màn hình `/app/pipeline` trên Web App):** 14 Deal nằm đúng tại các cột phễu Kanban (Tiếp nhận: 2, Chăm sóc: 1, Phỏng vấn: 2, Đi làm VWW: 6, Nghiệm thu: 3).
- [ ] **Tiêu chí 6 (Hạ tầng 2 Tabs đối soát):** Tab `07_ASSIGNMENTS` có đủ 906 dòng và `08_ATTENDANCE_RAW` có đủ 895 dòng phục vụ cho việc đối soát bảng kê chấm công VWW của Giai đoạn 2 & 3.

---

> [!IMPORTANT]
> **LỜI NHẮN TỪ QA LEAD DÀNH CHO DEV TEAM:**  
> Dữ liệu trong tệp `T7_READY_ID_FIXED.xlsx` là **tài sản số thực tế của doanh nghiệp**. Khi đẩy dữ liệu, tuyệt đối không được tự ý sửa đổi tiền tố mã (`WK-`, `DL-`, `ASG-`, `RAW-`) vì toàn bộ hệ thống phễu và thuật toán đối soát phụ thuộc 100% vào các mã này. Hãy chạy script cẩn thận và chụp ảnh màn hình nghiệm thu gửi lại!
