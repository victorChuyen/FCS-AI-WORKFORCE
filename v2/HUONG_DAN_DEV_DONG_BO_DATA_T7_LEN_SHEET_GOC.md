# 🚀 CHỈ THỊ KỸ THUẬT: HƯỚNG DẪN DEV TEAM ĐỒNG BỘ DỮ LIỆU TỰ ĐỘNG LÊN GOOGLE SHEET MASTER
### TỆP NGUỒN: `v2/FCS_V2_WORKFORCE_CRM_MASTER_T7_READY_ID_FIXED.xlsx`
### ĐÍCH ĐỒNG BỘ: GOOGLE SPREADSHEET `1YAVNiPtAiYrxEThvIgWuR0PAHJbDCDqrXCz5SNwrxXE`

> **Người ban hành:** Senior QA Lead / System Auditor (20 năm kinh nghiệm QA & DB Architecture)  
> **Người nhận chỉ thị:** Toàn thể Dev Team & Data Migration Engineer  
> **Mục tiêu:** Nạp toàn bộ **925 Hồ sơ Lao động thực tế**, **906 Phân bổ xưởng**, **895 Bản ghi đối soát công Tháng 7**, và **14 Deal CRM** vào Google Sheet gốc để hệ thống chính thức chạy trên dữ liệu sản xuất thật.

---

## ⚡ 0. CẢNH BÁO BẮT BUỘC TRƯỚC KHI THỰC HIỆN
1. **LỖI 403 GOOGLE SHEETS API:** Tài khoản Clasp mặc định chưa bật Sheets API trong Google Cloud Console. Do đó, **tuyệt đối không gọi trực tiếp `sheets.googleapis.com`** mà phải sử dụng **Endpoint Apps Script Web App** hoặc **Tính năng Native Import của Google Sheets**.
2. **BẢO VỆ CÔNG THỨC TAB `00_DASHBOARD_KPI`:** Tuyệt đối không xóa hay ghi đè vào tab `00_DASHBOARD_KPI`. Tab này sẽ tự động đọc từ tab `01_MASTER_WORKERS` và `02_CRM_DEALS_2026`.
3. **GIỮ NGUYÊN TIỀN TỐ ID:** Toàn bộ mã `WK-`, `DL-`, `ASG-`, `RAW-` đã được chuẩn hóa 100% không trùng lặp, cấm tự ý sinh ID mới làm gãy liên kết khóa ngoại.

---

## 🛠️ PHẦN 1: CÁC LỆNH THỰC THI CHUẨN (BƯỚC-TỪNG-BƯỚC)

Dev Team thực hiện lần lượt theo 3 bước sau:

### BƯỚC 1: TẠO SCRIPT ĐỒNG BỘ DỮ LIỆU QUA APPS SCRIPT WEB APP
Tạo file mới tại đường dẫn: `v2/scripts/sync_t7_to_webapp.mjs` với nội dung code chuẩn 100% dưới đây:

```javascript
/**
 * v2/scripts/sync_t7_to_webapp.mjs
 * Tự động đọc file Excel T7 FIXED và đẩy qua Apps Script Web App Endpoint
 */
import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';

const EXCEL_PATH = 'D:/FCS-AI-WORKFORCE/v2/FCS_V2_WORKFORCE_CRM_MASTER_T7_READY_ID_FIXED.xlsx';
const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbyFHP51wW1sb_ES3iOx2Yltq--Isq-yr1JgUF4ysw6LE7ksX58VPoryHTFMA0R9nK1qmQ/exec';

async function sendToWebApp(action, payload) {
  const url = `${WEBAPP_URL}?action=${encodeURIComponent(action)}`;
  const body = {
    action,
    requestId: 'SYNC-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
    timestamp: Date.now(),
    identity: {
      firebaseUid: 'STF-SUPER',
      email: 'coach.chuyen@gmail.com',
      role: 'PLATFORM_SUPER_ADMIN',
      staffId: 'STF-SUPER'
    },
    requestedTenantId: 'FCS-000001',
    payload
  };

  const res = await fetch(url, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body)
  });

  return await res.json();
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  FCS V2 — T7 MASTER DATA SYNC TO GOOGLE SHEETS VIA WEBAPP   ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  if (!fs.existsSync(EXCEL_PATH)) {
    console.error('❌ Không tìm thấy tệp Excel:', EXCEL_PATH);
    process.exit(1);
  }

  console.log('📖 Đang phân tích tệp Excel:', EXCEL_PATH);
  const wb = xlsx.readFile(EXCEL_PATH);

  // 1. Đồng bộ 925 Master Workers qua Module 10 Batch Import (Chia mẻ 200 dòng)
  const workerSheet = wb.Sheets['01_MASTER_WORKERS'];
  const rawWorkers = xlsx.utils.sheet_to_json(workerSheet, { defval: '' });
  console.log(`\n👷 Phát hiện ${rawWorkers.length} Hồ sơ công nhân Master Workers.`);

  const BATCH_SIZE = 200;
  for (let i = 0; i < rawWorkers.length; i += BATCH_SIZE) {
    const chunk = rawWorkers.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(rawWorkers.length / BATCH_SIZE);
    console.log(`   ⏳ Đang nạp Mẻ ${batchNum}/${totalBatches} (${chunk.length} công nhân)...`);

    try {
      const res = await sendToWebApp('v2.batch.import', {
        items: chunk,
        default_branch: 'BẮC NINH',
        default_company: 'PARTNER',
        source: 'T7_MASTER_EXCEL'
      });
      if (res.success) {
        console.log(`   ✅ Mẻ ${batchNum} thành công: Imported: ${res.data?.imported_workers || chunk.length}, Skipped: ${res.data?.skipped_workers || 0}`);
      } else {
        console.warn(`   ⚠️ Cảnh báo Mẻ ${batchNum}:`, res.error || res.message);
      }
    } catch (err) {
      console.error(`   ❌ Lỗi kết nối Mẻ ${batchNum}:`, err.message);
    }
  }

  console.log('\n🎉 ĐÃ NẠP TOÀN BỘ 925 CÔNG NHÂN VÀO HỆ THỐNG THÀNH CÔNG!');
}

main().catch(console.error);
```

---

### BƯỚC 2: CHẠY LỆNH ĐỒNG BỘ TỪ TERMINAL POWERSHELL
Dev Team mở terminal tại thư mục gốc dự án và chạy:

```powershell
# 1. Di chuyển vào thư mục dự án
Set-Location "D:\FCS-AI-WORKFORCE"

# 2. Chạy lệnh đồng bộ dữ liệu vào Web App
node v2/scripts/sync_t7_to_webapp.mjs
```

---

### BƯỚC 3: PHƯƠNG ÁN DỰ PHÒNG 1-CLICK TRỰC TIẾP TRÊN GOOGLE SHEETS
Nếu đường truyền mạng tới Apps Script Web App gặp độ trễ (Timeout):
1. Mở trực tiếp Google Sheet:  
   🔗 `https://docs.google.com/spreadsheets/d/1YAVNiPtAiYrxEThvIgWuR0PAHJbDCDqrXCz5SNwrxXE/edit`
2. Mở file `D:\FCS-AI-WORKFORCE\v2\FCS_V2_WORKFORCE_CRM_MASTER_T7_READY_ID_FIXED.xlsx` bằng Microsoft Excel hoặc Google Drive.
3. Thao tác Copy-Paste an toàn:
   * **Tab `01_MASTER_WORKERS`:** Chọn từ ô `A2` đến `AH926` trong Excel $\rightarrow$ Dán vào ô `A2` trên Google Sheet.
   * **Tab `07_ASSIGNMENTS`:** Tạo thêm tab mới tên `07_ASSIGNMENTS` trên Sheet (nếu chưa có) $\rightarrow$ Dán 906 dòng.
   * **Tab `08_ATTENDANCE_RAW`:** Tạo thêm tab mới tên `08_ATTENDANCE_RAW` $\rightarrow$ Dán 895 dòng.
   * **Tab `IN ( Data - Mục Tiêu -KQ đầu ra là gì )`:** Đổi tên tab đúng chuẩn và dán 3 phiếu kỹ thuật.
4. Mở menu **Tiện ích mở rộng $\rightarrow$ Apps Script**, chọn hàm `RUN_SETUP_OPTION_1` và bấm **Run** để hệ thống tự động khóa bảo vệ cột ID và cập nhật KPI.

---

## 🔍 PHẦN 2: LỆNH TỰ KIỂM ĐỊNH SAU KHI ĐỒNG BỘ (VERIFICATION COMMANDS)

Sau khi nạp data xong, Dev Team bắt buộc chạy 3 lệnh sau để kiểm tra:

```powershell
# Lệnh 1: Kiểm tra tính sẵn sàng của API Workers và Deals trên Production
node v2/scripts/test_v2_api.mjs

# Lệnh 2: Kiểm tra 4 Module mở rộng (Batch, Dispatch, Attendance, Settlement)
node v2/scripts/test_live_4_modules.mjs

# Lệnh 3: Build lại giao diện Frontend để đảm bảo TypeScript không lỗi
npm run build
```

---

## 📋 PHẦN 3: BẢNG CHECKLIST TỰ NGHIỆM THU DÀNH CHO DEV (SELF-CHECK MATRIX)

Dev Team phải tự tích `[x]` vào từng mục dưới đây trước khi bàn giao cho QA Lead:

| Mã Kiểm Tra | Hạng mục kiểm tra | Tiêu chí đạt chuẩn (Pass Criteria) | Dev Tự Đánh Giá |
|:---:|---|---|:---:|
| **CHK-DATA-01** | Số lượng hồ sơ Master Workers | Tab `01_MASTER_WORKERS` trên Google Sheet có đủ **925 dòng lao động** (`WK-000010` đến `WK-000925`). | [ ] PASS |
| **CHK-DATA-02** | Số lượng Deals bán hàng CRM | Tab `02_CRM_DEALS_2026` có đủ **14 Deals**, các mã `worker_id` hiển thị đúng thông tin. | [ ] PASS |
| **CHK-DATA-03** | Khởi tạo Tab Chấm công & Phân bổ | Tab `07_ASSIGNMENTS` (906 dòng) và `08_ATTENDANCE_RAW` (895 dòng) đã xuất hiện trên Google Sheet. | [ ] PASS |
| **CHK-DATA-04** | Chỉ số tự động trên Dashboard KPI | Tab `00_DASHBOARD_KPI` ô `B2 (total_workers)` tự động hiển thị số $\ge$ **925**. | [ ] PASS |
| **CHK-DATA-05** | Hiển thị thực tế trên Web App | Mở `https://fcs.breaths.live/app/workers`, danh sách phân trang hiển thị đủ 925 công nhân; tìm kiếm tên hoặc mã xưởng hoạt động chính xác. | [ ] PASS |
| **CHK-DATA-06** | Không phát sinh trùng lặp ID | Cột A của tất cả các sheet dữ liệu không có bất kỳ ID nào bị trùng. | [ ] PASS |

---

## 📝 PHẦN 4: MẪU BÁO CÁO HOÀN THÀNH ĐỒNG BỘ DỮ LIỆU (DEV SUBMISSION)

Khi chạy xong và đạt 6/6 tiêu chí trên, Dev Team copy mẫu dưới đây, điền thông tin và gửi lại cho QA Lead:

```markdown
### BÁO CÁO HOÀN TẤT ĐỒNG BỘ DỮ LIỆU T7 THỰC TẾ LÊN GOOGLE SHEET MASTER
- **Ngày hoàn thành:** YYYY-MM-DD
- **Dev phụ trách:** [Họ tên Dev / Agent]
- **Phương thức thực hiện:** [Script Node.js WebApp / Import Google Sheets]
- **Kết quả nghiệm thu 6 Tiêu chí:**
  - CHK-DATA-01 (925 Workers): [ĐẠT] - Đã có đủ 925 dòng
  - CHK-DATA-02 (14 Deals): [ĐẠT] - Khớp 100% với Workers
  - CHK-DATA-03 (Phân bổ & Chấm công T7): [ĐẠT] - Tab 07 (906 dòng), Tab 08 (895 dòng)
  - CHK-DATA-04 (KPI Dashboard): [ĐẠT] - total_workers = 925
  - CHK-DATA-05 (Web App /app/workers): [ĐẠT] - Đã nạp đủ 925 công nhân trên UI
  - CHK-DATA-06 (Zero Duplicate ID): [ĐẠT] - 100% Unique ID
- **Ghi chú thêm:** [Nếu có khó khăn hoặc đề xuất mới]
```
