# ================================================================
# FCS V2 — HƯỚNG DẪN ĐỒNG BỘ THỦ CÔNG 8 FILE LÊN APPS SCRIPT
# ================================================================
# 
# TRẠNG THÁI HIỆN TẠI (16/09/2026 14:15):
# ✅ 00_Config.gs         — Đã có + đã lưu
# ✅ 01_Router.gs         — Đã có + đã lưu  
# ✅ 02_WorkerService.gs  — Đã có + đã lưu
# ✅ 03_DealService.gs    — Đã có + đã lưu
# ⚠️ 04_TaxonomyService.gs — Đã có + CHƯA LƯU (chấm cam)
# ⚠️ 05_SecurityService.gs — Đã có + CHƯA LƯU (chấm cam)
# ✅ 06_ValidationService.gs — Đã có + đã lưu code thật
# ❌ 07_AuditService.gs   — CHƯA TẠO
#
# CÁCH THAO TÁC:
# 1. Mở PowerShell
# 2. Chạy lệnh Set-Clipboard bên dưới cho file cần sửa
# 3. Qua Apps Script editor:
#    - Click vào file trong sidebar (hoặc click [+] > Tệp tập lệnh nếu tạo mới)
#    - Click vào vùng code editor
#    - Ctrl+A (chọn tất cả)
#    - Ctrl+V (dán code)
#    - Ctrl+S (lưu)
# ================================================================

# --- FILE 1: 04_TaxonomyService (CẦN LƯU LẠI - chấm cam) ---
# Click vào file 04_TaxonomyService.gs trong sidebar rồi Ctrl+A, Ctrl+V, Ctrl+S
Get-Content "d:\FCS-AI-WORKFORCE\v2\backend\04_TaxonomyService.gs" -Raw | Set-Clipboard

# --- FILE 2: 05_SecurityService (CẦN LƯU LẠI - chấm cam) ---
# Click vào file 05_SecurityService.gs trong sidebar rồi Ctrl+A, Ctrl+V, Ctrl+S
Get-Content "d:\FCS-AI-WORKFORCE\v2\backend\05_SecurityService.gs" -Raw | Set-Clipboard

# --- FILE 3: 07_AuditService (CẦN TẠO MỚI) ---
# Click [+] bên cạnh "Tệp" > "Tệp tập lệnh" > gõ "07_AuditService" > Enter
# Rồi Ctrl+A, Ctrl+V, Ctrl+S
Get-Content "d:\FCS-AI-WORKFORCE\v2\backend\07_AuditService.gs" -Raw | Set-Clipboard

# ================================================================
# SAU KHI XONG 8 FILE, TRIỂN KHAI WEB APP:
# 1. Click nút "Triển khai" (xanh dương) góc trên phải
# 2. Chọn "Tùy chọn triển khai mới" 
# 3. Click biểu tượng bánh răng > chọn "Ứng dụng web"
# 4. Mô tả: "FCS V2 Enterprise CRM Release 1"
# 5. Thực thi dưới danh nghĩa: "Tôi" (coach.chuyen@gmail.com)
# 6. Người có quyền truy cập: "Bất kỳ ai"
# 7. Click "Triển khai"
# 8. Copy URL Web App mới
# ================================================================
