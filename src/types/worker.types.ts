/**
 * WorkerStatus — 17 mã trạng thái chuẩn Foxconn FCS
 *
 * Hệ thống phân chia 4 giai đoạn chính:
 *   C3  = Thu hút & Sàng lọc (Marketing)
 *   L1  = Chia cho Sale & Chăm sóc
 *   L2  = Phỏng vấn (Hiện trường)
 *   L3  = Đang đi làm
 *   L4  = Hết thời gian tính phí
 */
export enum WorkerStatus {
  // ── C3: Thu hút & Sàng lọc ──
  NEW = 'NEW',                           // C3   (0)  Lao động mới
  DUPLICATE = 'DUPLICATE',               // C3.1 (1)  Số trùng
  JUNK = 'JUNK',                         // C3.2 (2)  Số rác (bị loại bỏ)

  // ── L1: Chia cho Sale & Chăm sóc ──
  ASSIGNED_TO_SALE = 'ASSIGNED_TO_SALE', // L1   (10) Chia cho Sale
  REFERENCE = 'REFERENCE',               // L1.1 (11) Tham khảo
  FOLLOW_UP = 'FOLLOW_UP',               // L1.2 (12) Chăm sóc lại
  REJECTED = 'REJECTED',                 // L1.3 (13) Từ chối tiếp xúc / Không có nhu cầu
  UNREACHABLE = 'UNREACHABLE',           // L1.4 (14) TB / KNM / MB (Thuê bao, Không nghe máy, Máy bận)
  OVERAGE = 'OVERAGE',                   // L1.5 (15) Thừa tuổi (≥45)
  CALLBACK = 'CALLBACK',                 // L1.6 (16) Hẹn gọi lại
  UNDERAGE = 'UNDERAGE',                 // L1.8 (18) Thiếu tuổi

  // ── L2: Phỏng vấn (Hiện trường) ──
  INTERVIEW_PENDING = 'INTERVIEW_PENDING', // L2   (20) Hẹn phỏng vấn
  INTERVIEWED = 'INTERVIEWED',             // (giữ tương thích) — trạng thái chuyển tiếp
  PASSED = 'PASSED',                       // L2.1 (21) Đỗ phỏng vấn
  FAILED = 'FAILED',                       // L2.2 (22) Trượt phỏng vấn
  NO_SHOW = 'NO_SHOW',                     // L2.3 (23) Hẹn không đến phỏng vấn

  // ── L3: Đang đi làm ──
  WAITING_START = 'WAITING_START',         // Chờ xác nhận đi làm (giữ tương thích)
  WORKING = 'WORKING',                     // L3   (30) Đang đi làm
  QUIT = 'QUIT',                           // L3.1 (31) Nghỉ ngang
  TRANSFER_REQUEST = 'TRANSFER_REQUEST',   // L3.2 (32) Muốn chuyển công ty khác

  // ── L4: Hết thời gian tính phí ──
  FEE_EXPIRED = 'FEE_EXPIRED',             // L4        Hết thời gian tính phí

  // ── Trạng thái hệ thống ──
  INACTIVE = 'INACTIVE',                   // Không hoạt động (giữ tương thích)
}

/**
 * Nhãn hiển thị tiếng Việt cho từng mã trạng thái
 */
export const WORKER_STATUS_LABEL: Record<WorkerStatus, string> = {
  [WorkerStatus.NEW]: 'Lao động mới',
  [WorkerStatus.DUPLICATE]: 'Số trùng',
  [WorkerStatus.JUNK]: 'Số rác',
  [WorkerStatus.ASSIGNED_TO_SALE]: 'Chia cho Sale',
  [WorkerStatus.REFERENCE]: 'Tham khảo',
  [WorkerStatus.FOLLOW_UP]: 'Chăm sóc lại',
  [WorkerStatus.REJECTED]: 'Từ chối / Không nhu cầu',
  [WorkerStatus.UNREACHABLE]: 'TB / KNM / MB',
  [WorkerStatus.OVERAGE]: 'Thừa tuổi (≥45)',
  [WorkerStatus.CALLBACK]: 'Hẹn gọi lại',
  [WorkerStatus.UNDERAGE]: 'Thiếu tuổi',
  [WorkerStatus.INTERVIEW_PENDING]: 'Hẹn phỏng vấn',
  [WorkerStatus.INTERVIEWED]: 'Đã phỏng vấn',
  [WorkerStatus.PASSED]: 'Đỗ phỏng vấn',
  [WorkerStatus.FAILED]: 'Trượt phỏng vấn',
  [WorkerStatus.NO_SHOW]: 'Không đến phỏng vấn',
  [WorkerStatus.WAITING_START]: 'Chờ đi làm',
  [WorkerStatus.WORKING]: 'Đang đi làm',
  [WorkerStatus.QUIT]: 'Nghỉ ngang',
  [WorkerStatus.TRANSFER_REQUEST]: 'Xin chuyển công ty',
  [WorkerStatus.FEE_EXPIRED]: 'Hết thời gian tính phí',
  [WorkerStatus.INACTIVE]: 'Không hoạt động',
};

/**
 * Mã số Foxconn (sortKey) cho từng trạng thái — dùng để sắp xếp pipeline
 */
export const WORKER_STATUS_CODE: Record<WorkerStatus, number> = {
  [WorkerStatus.NEW]: 0,
  [WorkerStatus.DUPLICATE]: 1,
  [WorkerStatus.JUNK]: 2,
  [WorkerStatus.ASSIGNED_TO_SALE]: 10,
  [WorkerStatus.REFERENCE]: 11,
  [WorkerStatus.FOLLOW_UP]: 12,
  [WorkerStatus.REJECTED]: 13,
  [WorkerStatus.UNREACHABLE]: 14,
  [WorkerStatus.OVERAGE]: 15,
  [WorkerStatus.CALLBACK]: 16,
  [WorkerStatus.UNDERAGE]: 18,
  [WorkerStatus.INTERVIEW_PENDING]: 20,
  [WorkerStatus.INTERVIEWED]: 20,
  [WorkerStatus.PASSED]: 21,
  [WorkerStatus.FAILED]: 22,
  [WorkerStatus.NO_SHOW]: 23,
  [WorkerStatus.WAITING_START]: 25,
  [WorkerStatus.WORKING]: 30,
  [WorkerStatus.QUIT]: 31,
  [WorkerStatus.TRANSFER_REQUEST]: 32,
  [WorkerStatus.FEE_EXPIRED]: 40,
  [WorkerStatus.INACTIVE]: 99,
};

/**
 * Màu sắc Tailwind CSS cho badge trạng thái
 */
export const WORKER_STATUS_COLOR: Record<WorkerStatus, string> = {
  [WorkerStatus.NEW]: 'bg-blue-100 text-blue-800 border-blue-300',
  [WorkerStatus.DUPLICATE]: 'bg-rose-100 text-rose-800 border-rose-300',
  [WorkerStatus.JUNK]: 'bg-slate-200 text-slate-600 border-slate-300',
  [WorkerStatus.ASSIGNED_TO_SALE]: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  [WorkerStatus.REFERENCE]: 'bg-sky-100 text-sky-800 border-sky-300',
  [WorkerStatus.FOLLOW_UP]: 'bg-amber-100 text-amber-800 border-amber-300',
  [WorkerStatus.REJECTED]: 'bg-rose-50 text-rose-700 border-rose-200',
  [WorkerStatus.UNREACHABLE]: 'bg-orange-100 text-orange-800 border-orange-300',
  [WorkerStatus.OVERAGE]: 'bg-purple-100 text-purple-800 border-purple-300',
  [WorkerStatus.CALLBACK]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  [WorkerStatus.UNDERAGE]: 'bg-pink-100 text-pink-800 border-pink-300',
  [WorkerStatus.INTERVIEW_PENDING]: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  [WorkerStatus.INTERVIEWED]: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  [WorkerStatus.PASSED]: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  [WorkerStatus.FAILED]: 'bg-red-100 text-red-800 border-red-300',
  [WorkerStatus.NO_SHOW]: 'bg-stone-100 text-stone-800 border-stone-300',
  [WorkerStatus.WAITING_START]: 'bg-teal-100 text-teal-800 border-teal-300',
  [WorkerStatus.WORKING]: 'bg-green-100 text-green-800 border-green-300',
  [WorkerStatus.QUIT]: 'bg-red-50 text-red-700 border-red-200',
  [WorkerStatus.TRANSFER_REQUEST]: 'bg-violet-100 text-violet-800 border-violet-300',
  [WorkerStatus.FEE_EXPIRED]: 'bg-zinc-200 text-zinc-700 border-zinc-400',
  [WorkerStatus.INACTIVE]: 'bg-gray-100 text-gray-500 border-gray-300',
};

/**
 * Worker — Hồ sơ lao động đầy đủ 22 cột chuẩn Foxconn FCS
 */
export interface Worker {
  // ── Định danh hệ thống ──
  workerId: string;

  // ── Thông tin cá nhân (Cột B–G trong Excel Foxconn) ──
  department?: string;                // BỘ PHẬN (Dept) — mã phòng ban tại KCN
  fullName: string;                   // HỌ TÊN (Full name) — In hoa có dấu
  gender?: 'Nam' | 'Nữ' | 'Khác';    // GIỚI TÍNH (M/F)
  dateOfBirth?: string;               // NGÀY SINH (dd/mm/yyyy)
  phone: string;                      // SỐ ĐIỆN THOẠI lao động

  // ── Giấy tờ tùy thân (Cột H–I) ──
  cccd?: string;                      // SỐ CMTND / CCCD (12 số)
  cccdIssuedDate?: string;            // NGÀY CẤP CCCD

  // ── Học vấn (Cột J–L) ──
  school?: string;                    // TRƯỜNG TỐT NGHIỆP (Bằng cao nhất)
  major?: string;                     // CHUYÊN NGÀNH (THCS/THPT nếu không có)
  graduationYear?: string;            // NĂM TỐT NGHIỆP

  // ── Địa chỉ & Quê quán (Cột M–Q) ──
  province: string;                   // TỈNH / THÀNH PHỐ (trích từ quê quán)
  district?: string;                  // QUẬN / HUYỆN
  hometown?: string;                  // QUÊ QUÁN (giống trên CCCD)
  ethnicity?: string;                 // DÂN TỘC (KINH, TÀY, MƯỜNG...)
  birthPlace?: string;                // NƠI SINH (đầy đủ xã/phường/tỉnh)
  permanentAddress?: string;          // Địa chỉ thường trú theo VNEID (3 cấp)
  currentAddress?: string;            // NƠI Ở HIỆN NAY (3 cấp)
  address?: string;                   // Địa chỉ gộp (giữ tương thích v1)

  // ── Bảo hiểm & Hôn nhân (Cột R–S) ──
  socialInsuranceNo?: string;         // SỐ SỔ BHXH
  maritalStatus?: '1' | '2' | '3';   // 1=Đã kết hôn, 2=Chưa kết hôn, 3=Ly hôn

  // ── Liên lạc khẩn cấp (Cột T–U) ──
  emergencyContactName?: string;      // NGƯỜI LIÊN LẠC KHẨN CẤP
  emergencyContactPhone?: string;     // SĐT NGƯỜI THÂN

  // ── Ngân hàng (Cột W) ──
  bankAccountNo?: string;             // SỐ TÀI KHOẢN VIETCOMBANK
  bankName?: string;                  // Tên ngân hàng (mặc định Vietcombank)

  // ── Nghiệp vụ tuyển dụng & phân bổ ──
  currentNeed: string;                // Nhu cầu hiện tại của lao động
  desiredJob?: string;                // Vị trí mong muốn
  source: string;                     // Nguồn tuyển dụng (Zalo, Facebook, Giới thiệu...)
  recruiterId: string;                // Mã nhân viên Sale phụ trách
  recruiterName: string;              // Tên nhân viên Sale
  officeId: string;                   // Mã văn phòng
  officeName: string;                 // Tên văn phòng
  partnerId?: string;                 // Mã đối tác (Foxconn, Luxshare...)
  partnerName?: string;               // Tên đối tác

  // ── Trạng thái & Theo dõi ──
  status: WorkerStatus;               // Mã trạng thái 17 cấp chuẩn Foxconn
  statusCode?: number;                // Mã số Foxconn (0, 1, 2, 10, 11...)
  isVerifiedWorking: boolean;         // Đạt chuẩn VWW chưa
  vwwAchievedAt?: string;             // Thời điểm đạt VWW
  lastActivity: string;               // Hoạt động gần nhất
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface DuplicateWorkerInfo {
  workerId: string;
  fullName: string;
  phone: string;
  currentStatus: string;
  matchReason?: string;
  province?: string;
  recruiterName?: string;
  cccd?: string;
  isVerifiedWorking?: boolean;
}

export interface DuplicateSuspect {
  id: string;
  workerA: {
    workerId: string;
    fullName: string;
    phone: string;
    cccd?: string;
    province: string;
    recruiterName: string;
  };
  workerB: {
    workerId: string;
    fullName: string;
    phone: string;
    cccd?: string;
    province: string;
    recruiterName: string;
  };
  reason: string;
  detectedAt: string;
}

export interface FollowUpItem {
  id: string;
  workerId: string;
  workerName: string;
  phone: string;
  partnerName?: string;
  currentStatus: WorkerStatus;
  slaHours: number;
  reason: string;
  dueAt: string;
}
