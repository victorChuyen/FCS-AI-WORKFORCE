export type AppRole =
  | 'PLATFORM_SUPER_ADMIN'
  | 'TENANT_ADMIN'
  | 'ACCOUNTANT'
  | 'TENANT_MANAGER'
  | 'FIELD_OFFICER'
  | 'LEADER_SALE'
  | 'RECRUITER'
  | 'MARKETING'
  | 'VIEWER'
  // Legacy aliases for backward-compatibility with UI icons/filters
  | 'ADMIN'
  | 'MANAGER'
  | 'STAFF';

export type UserRole = AppRole;

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId?: string;
  companyName?: string;
  companySlug?: string;
  companyCode?: string;
  officeId: string;
  allowedOfficeIds?: string[];
  staffId?: string;
  isSuperAdmin?: boolean;
}

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified?: boolean;
  role: AppRole;
  tenantId?: string;
  companyName?: string;
  companySlug?: string;
  companyCode?: string;
  officeId?: string;
  allowedOfficeIds?: string[];
  staffId?: string;
  isSuperAdmin?: boolean;
}

export interface AuthState {
  user: AppUser | null;
  loading: boolean;
  isAuthenticated: boolean;
}

/**
 * 18 GRANULAR PERMISSION CAPABILITIES (BA 1.5 ALIGNED)
 * Chốt chặn phân quyền chi tiết độc lập với Role
 */
export type PermissionCapability =
  // Worker profile capabilities
  | 'WORKER_VIEW_ALL'
  | 'WORKER_VIEW_SENSITIVE' // Xem CCCD, STK Vietcombank, BHXH
  | 'WORKER_CREATE' // Tạo hồ sơ mới
  | 'WORKER_EDIT_PROFILE' // Sửa thông tin định danh VNeID
  | 'WORKER_EXPORT_EXCEL' // Xuất file Excel/CSV ra máy (Khóa với Sale chống mất data)
  // Deal & 19 Level Sale Kanban capabilities
  | 'DEAL_ASSIGN_SALE' // Phân bổ data C3 -> L1 cho Sale
  | 'DEAL_MOVE_NURTURE' // Chuyển trạng thái L1.1 - L1.8
  | 'INTERVIEW_SCHEDULE' // Đặt lịch hẹn phỏng vấn L2
  | 'INTERVIEW_CONFIRM_RESULT' // Duyệt Đỗ/Trượt L2.1, L2.2 (Hiện trường/Manager, Cấm Sale tự duyệt)
  | 'EMPLOYMENT_CONFIRM_STARTED' // Xác nhận lên xe đi làm L3 (Hiện trường/Manager)
  | 'EMPLOYMENT_TERMINATION' // Ghi nhận nghỉ ngang/đổi xưởng L3.1, L3.2
  // Attendance & VWW capabilities
  | 'ATTENDANCE_IMPORT' // Nạp bảng chấm công nhà máy
  | 'ATTENDANCE_MATCH_VWW' // Mở khóa Verified Working Worker
  // Finance & Commission capabilities (Quy trình duyệt 4 cấp BA 1.5)
  | 'FINANCE_VIEW_REPORTS' // Xem báo cáo doanh thu/hoa hồng
  | 'COMMISSION_APPROVE_LV1' // Leader Sale duyệt Cấp 1
  | 'COMMISSION_APPROVE_LV2' // Manager duyệt Cấp 2
  | 'COMMISSION_APPROVE_LV3' // Kế toán duyệt Cấp 3
  | 'COMMISSION_APPROVE_LV4' // Giám đốc phê duyệt chi Cấp 4
  // Governance
  | 'AUDIT_LOG_VIEW' // Xem vết sửa đổi kiểm toán
  | 'SYSTEM_CONFIGURE'; // Quản trị tham số toàn nền tảng

/**
 * MA TRẬN MAPPING QUYỀN HẠN CHI TIẾT THEO VAI TRÒ (BA 1.5)
 */
export const ROLE_CAPABILITIES_MAP: Record<AppRole, PermissionCapability[]> = {
  PLATFORM_SUPER_ADMIN: [
    'WORKER_VIEW_ALL',
    'WORKER_VIEW_SENSITIVE',
    'WORKER_CREATE',
    'WORKER_EDIT_PROFILE',
    'WORKER_EXPORT_EXCEL',
    'DEAL_ASSIGN_SALE',
    'DEAL_MOVE_NURTURE',
    'INTERVIEW_SCHEDULE',
    'INTERVIEW_CONFIRM_RESULT',
    'EMPLOYMENT_CONFIRM_STARTED',
    'EMPLOYMENT_TERMINATION',
    'ATTENDANCE_IMPORT',
    'ATTENDANCE_MATCH_VWW',
    'FINANCE_VIEW_REPORTS',
    'COMMISSION_APPROVE_LV1',
    'COMMISSION_APPROVE_LV2',
    'COMMISSION_APPROVE_LV3',
    'COMMISSION_APPROVE_LV4',
    'AUDIT_LOG_VIEW',
    'SYSTEM_CONFIGURE',
  ],
  TENANT_ADMIN: [
    'WORKER_VIEW_ALL',
    'WORKER_VIEW_SENSITIVE',
    'WORKER_CREATE',
    'WORKER_EDIT_PROFILE',
    'WORKER_EXPORT_EXCEL',
    'DEAL_ASSIGN_SALE',
    'DEAL_MOVE_NURTURE',
    'INTERVIEW_SCHEDULE',
    'INTERVIEW_CONFIRM_RESULT',
    'EMPLOYMENT_CONFIRM_STARTED',
    'EMPLOYMENT_TERMINATION',
    'ATTENDANCE_IMPORT',
    'ATTENDANCE_MATCH_VWW',
    'FINANCE_VIEW_REPORTS',
    'COMMISSION_APPROVE_LV4', // Duyệt chi tối cao
    'AUDIT_LOG_VIEW',
  ],
  ADMIN: [
    'WORKER_VIEW_ALL',
    'WORKER_VIEW_SENSITIVE',
    'WORKER_CREATE',
    'WORKER_EDIT_PROFILE',
    'WORKER_EXPORT_EXCEL',
    'DEAL_ASSIGN_SALE',
    'DEAL_MOVE_NURTURE',
    'INTERVIEW_SCHEDULE',
    'INTERVIEW_CONFIRM_RESULT',
    'EMPLOYMENT_CONFIRM_STARTED',
    'EMPLOYMENT_TERMINATION',
    'ATTENDANCE_IMPORT',
    'ATTENDANCE_MATCH_VWW',
    'FINANCE_VIEW_REPORTS',
    'COMMISSION_APPROVE_LV4',
    'AUDIT_LOG_VIEW',
  ],
  ACCOUNTANT: [
    'WORKER_VIEW_ALL',
    'WORKER_VIEW_SENSITIVE', // Kế toán cần xem STK/CCCD đối soát chi
    'WORKER_EXPORT_EXCEL', // Xuất bảng lương/hoa hồng
    'ATTENDANCE_IMPORT',
    'ATTENDANCE_MATCH_VWW',
    'FINANCE_VIEW_REPORTS',
    'COMMISSION_APPROVE_LV3', // Duyệt tài chính Cấp 3
    'AUDIT_LOG_VIEW',
  ],
  TENANT_MANAGER: [
    'WORKER_VIEW_ALL',
    'WORKER_VIEW_SENSITIVE',
    'WORKER_CREATE',
    'WORKER_EDIT_PROFILE',
    'WORKER_EXPORT_EXCEL',
    'DEAL_ASSIGN_SALE',
    'DEAL_MOVE_NURTURE',
    'INTERVIEW_SCHEDULE',
    'INTERVIEW_CONFIRM_RESULT',
    'EMPLOYMENT_CONFIRM_STARTED',
    'EMPLOYMENT_TERMINATION',
    'ATTENDANCE_IMPORT',
    'ATTENDANCE_MATCH_VWW',
    'FINANCE_VIEW_REPORTS',
    'COMMISSION_APPROVE_LV2', // Duyệt Cấp 2 chi nhánh
    'AUDIT_LOG_VIEW',
  ],
  MANAGER: [
    'WORKER_VIEW_ALL',
    'WORKER_VIEW_SENSITIVE',
    'WORKER_CREATE',
    'WORKER_EDIT_PROFILE',
    'WORKER_EXPORT_EXCEL',
    'DEAL_ASSIGN_SALE',
    'DEAL_MOVE_NURTURE',
    'INTERVIEW_SCHEDULE',
    'INTERVIEW_CONFIRM_RESULT',
    'EMPLOYMENT_CONFIRM_STARTED',
    'EMPLOYMENT_TERMINATION',
    'ATTENDANCE_IMPORT',
    'ATTENDANCE_MATCH_VWW',
    'FINANCE_VIEW_REPORTS',
    'COMMISSION_APPROVE_LV2',
    'AUDIT_LOG_VIEW',
  ],
  FIELD_OFFICER: [
    'WORKER_VIEW_ALL',
    'INTERVIEW_CONFIRM_RESULT', // Cán bộ hiện trường độc lập duyệt phỏng vấn tại xưởng
    'EMPLOYMENT_CONFIRM_STARTED', // Xác nhận lao động lên xe đến xưởng
    'EMPLOYMENT_TERMINATION', // Báo cáo nghỉ việc tại nhà máy
  ],
  LEADER_SALE: [
    'WORKER_VIEW_ALL',
    'WORKER_CREATE',
    'DEAL_ASSIGN_SALE', // Chia C3 cho Sale trong team
    'DEAL_MOVE_NURTURE',
    'INTERVIEW_SCHEDULE',
    'FINANCE_VIEW_REPORTS', // Xem chỉ tiêu team
    'COMMISSION_APPROVE_LV1', // Duyệt Cấp 1 hoa hồng
  ],
  RECRUITER: [
    'WORKER_CREATE',
    'DEAL_MOVE_NURTURE', // L1.1 - L1.8
    'INTERVIEW_SCHEDULE', // Hẹn phỏng vấn L2
  ],
  STAFF: [
    'WORKER_CREATE',
    'DEAL_MOVE_NURTURE',
    'INTERVIEW_SCHEDULE',
  ],
  MARKETING: [
    'WORKER_CREATE', // Nhập data C3 từ Ads
    'DEAL_ASSIGN_SALE', // Cấp data vào kho
  ],
  VIEWER: [],
};

/**
 * Kiểm tra xem người dùng có quyền thực hiện Capability cụ thể không
 */
export function hasPermission(
  userOrRole: AppUser | CurrentUser | AppRole | string | null | undefined,
  capability: PermissionCapability
): boolean {
  if (!userOrRole) return false;
  const role: AppRole =
    typeof userOrRole === 'string'
      ? (userOrRole as AppRole)
      : (userOrRole.role as AppRole);

  if (role === 'PLATFORM_SUPER_ADMIN') return true;
  const allowed = ROLE_CAPABILITIES_MAP[role] || [];
  return allowed.includes(capability);
}

/**
 * Kiểm tra quyền tương tác với từng Stage Level Sale trên Kanban (BA 1.5)
 */
export function canAccessLevelSale(
  userOrRole: AppUser | CurrentUser | AppRole | string | null | undefined,
  stageCode: string
): boolean {
  if (!userOrRole) return false;
  const role: AppRole =
    typeof userOrRole === 'string'
      ? (userOrRole as AppRole)
      : (userOrRole.role as AppRole);

  if (role === 'PLATFORM_SUPER_ADMIN' || role === 'TENANT_ADMIN' || role === 'ADMIN') return true;
  if (role === 'VIEWER') return false;

  const code = (stageCode || '').toUpperCase();

  // Nhóm C3: Tiếp nhận lead
  if (code.startsWith('C3')) {
    return ['MARKETING', 'LEADER_SALE', 'RECRUITER', 'STAFF', 'TENANT_MANAGER', 'MANAGER'].includes(role);
  }

  // Nhóm L1: Chăm sóc sale
  if (code.startsWith('L1')) {
    if (code === 'L1') {
      // Chia số cho Sale: Chỉ Leader Sale hoặc Manager
      return ['LEADER_SALE', 'TENANT_MANAGER', 'MANAGER'].includes(role);
    }
    return ['RECRUITER', 'STAFF', 'LEADER_SALE', 'TENANT_MANAGER', 'MANAGER'].includes(role);
  }

  // Nhóm L2: Phỏng vấn
  if (code === 'L2') {
    return ['RECRUITER', 'STAFF', 'LEADER_SALE', 'FIELD_OFFICER', 'TENANT_MANAGER', 'MANAGER'].includes(role);
  }
  if (code.startsWith('L2.')) {
    // Kết quả phỏng vấn L2.1, L2.2, L2.3: Chỉ Hiện trường hoặc Manager mới được duyệt chính thức!
    return ['FIELD_OFFICER', 'TENANT_MANAGER', 'MANAGER'].includes(role);
  }

  // Nhóm L3: Đi làm
  if (code.startsWith('L3')) {
    return ['FIELD_OFFICER', 'TENANT_MANAGER', 'MANAGER'].includes(role);
  }

  // Nhóm L4: Nghiệm thu tính phí & VWW
  if (code === 'L4') {
    return ['ACCOUNTANT', 'TENANT_MANAGER', 'MANAGER'].includes(role);
  }

  return false;
}

/**
 * Che dấu thông tin nhạy cảm cho nhân sự không có quyền xem trực tiếp
 */
export function maskSensitiveInfo(val: string | undefined | null, type: 'phone' | 'cccd' | 'bank'): string {
  if (!val) return '';
  const str = String(val).trim();
  if (!str) return '';

  if (type === 'phone') {
    if (str.length <= 6) return '0988***';
    return `${str.slice(0, 4)}***${str.slice(-3)}`;
  }

  if (type === 'cccd') {
    if (str.length <= 6) return '0340***';
    return `${str.slice(0, 4)}****${str.slice(-3)}`;
  }

  if (type === 'bank') {
    if (str.length <= 4) return '****';
    return `****${str.slice(-4)}`;
  }

  return str;
}

/**
 * Lấy tên chức danh tiếng Việt chuẩn mực của vai trò
 */
export function getRoleDisplayName(role: AppRole | string | undefined): string {
  switch (role) {
    case 'PLATFORM_SUPER_ADMIN':
      return 'Platform Super Admin';
    case 'TENANT_ADMIN':
    case 'ADMIN':
      return 'Giám đốc Điều hành (CEO)';
    case 'ACCOUNTANT':
      return 'Kế toán Đối soát & Hoa hồng';
    case 'TENANT_MANAGER':
    case 'MANAGER':
      return 'Trưởng phòng Vận hành';
    case 'FIELD_OFFICER':
      return 'Cán bộ Hiện trường (KCN)';
    case 'LEADER_SALE':
      return 'Trưởng nhóm Tuyển dụng';
    case 'RECRUITER':
    case 'STAFF':
      return 'Chuyên viên Tuyển dụng';
    case 'MARKETING':
      return 'Chuyên viên Marketing';
    case 'VIEWER':
      return 'Người xem (Chỉ đọc)';
    default:
      return role || 'Chưa xác định';
  }
}

