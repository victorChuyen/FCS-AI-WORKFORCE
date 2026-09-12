---
name: fcs-ai-workforce-orchestrator
description: Master orchestration skill for FCS AI WORKFORCE OS. Coordinates Firebase Auth provisioning, live Google Sheets API diagnostics, multi-tenant spreadsheet management, and autonomous operations.
---

# FCS AI WORKFORCE OS — Orchestration Playbook

Skill này cung cấp các kịch bản thực thi tự động cho AI Agent và Team Leader Lucky để vận hành trơn tru toàn bộ hệ thống FCS AI WORKFORCE OS dưới sự chỉ huy của Chairman Victor Chuyen.

## 1. Kiểm tra chẩn đoán toàn diện API & Dữ liệu thực tế
```bash
node scripts/test_live_api_suite.mjs
```
Kiểm tra tuần tự:
- `system.health`: Phiên bản backend và tên Spreadsheet đang kết nối.
- `dashboard.summary`: Chỉ số North Star VWW và phân bổ 6 chặng Pipeline.
- `worker.list`: Truy xuất danh sách hồ sơ lao động thực tế từ Google Sheets.
- `action.list`: Danh sách việc cần giải quyết trong ngày (Action Queue).
- `matching.list`: Danh sách hồ sơ phỏng vấn / phân xưởng cần khớp với chấm công.

## 2. Quản trị danh tính & Cấp quyền Firebase Admin SDK
```bash
node scripts/seed_firebase_users.mjs
```
Tự động xác thực qua Service Account `firebase-adminsdk-fbsvc@fcs-ai-workforce.iam.gserviceaccount.com`, khởi tạo 4 tài khoản nòng cốt, gán mật khẩu chuẩn `Fcs@2026!`, đặt `emailVerified: true` và phân quyền Custom Claims (`role`, `tenantId`, `isSuperAdmin`).

## 3. Triển khai nâng cấp Google Apps Script V4 Multi-Tenant
File mã nguồn độc lập đã được chuẩn bị tại:
`D:\FCS-AI-WORKFORCE\backend\Code.gs` (49.4 KB)

Các bước triển khai trên Google Apps Script:
1. Mở dự án Apps Script tại [script.google.com](https://script.google.com).
2. Dán toàn bộ nội dung file `backend/Code.gs` vào `Code.gs`.
3. Chọn hàm `setupSuperAdminMaster` từ danh sách Run và bấm Chạy để tạo bảng `FCS_SUPER_ADMIN_MASTER` (8 tab).
4. Chọn hàm `registerPilotTenantFiles` và bấm Chạy để liên kết/tạo bảng `FCS-000001_DATA` (12 tab) và `FCS-000001_MANAGEMENT` (12 tab).
5. Triển khai bản cập nhật (Deploy as Web App, Execute as: Me, Who has access: Anyone).
6. Cập nhật URL mới vào `.env` (`VITE_API_BASE_URL`).

## 4. Kiểm thử chất lượng mã nguồn & Build sản phẩm
```bash
npx tsc --noEmit
npm run build
```
Đảm bảo 0 lỗi TypeScript và bundle phân tách tối ưu (< 500KB per chunk).
