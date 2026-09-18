import React from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { useApp } from '../../context/AppContext';
import { API_BASE_URL } from '../../config/env';
import { Modal } from './Modal';
import { Mail, Shield, Building2, CheckCircle2, Key, LogOut, Briefcase, Database, RefreshCw, ExternalLink } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, onLogout }) => {
  const { user } = useAuth();
  const { currentUser, tenantContext, isMock, toggleMockMode, healthStatus, checkHealth } = useApp();

  if (!isOpen) return null;

  const isSuperAdmin = currentUser.isSuperAdmin || (user?.email || currentUser.email) === 'coach.chuyen@gmail.com';
  const isViewer = currentUser.role === 'VIEWER';
  const isStaff = currentUser.role === 'RECRUITER' || currentUser.role === 'STAFF';

  const formatRoleName = (role: string) => {
    switch (role) {
      case 'PLATFORM_SUPER_ADMIN':
        return 'Platform Super Admin (Quản trị toàn nền tảng)';
      case 'TENANT_ADMIN':
      case 'ADMIN':
        return 'Tenant Admin / Giám đốc (Toàn quyền điều hành FCS)';
      case 'ACCOUNTANT':
        return 'Kế toán Đối soát & Hoa hồng (Duyệt chi Cấp 3)';
      case 'TENANT_MANAGER':
      case 'MANAGER':
        return 'Trưởng phòng Vận hành (Quản lý chi nhánh & Duyệt Cấp 2)';
      case 'FIELD_OFFICER':
        return 'Cán bộ Hiện trường (Duyệt PV & Đi làm tại xưởng)';
      case 'LEADER_SALE':
        return 'Trưởng nhóm Tuyển dụng (Chia data & Duyệt Cấp 1)';
      case 'RECRUITER':
      case 'STAFF':
        return 'Chuyên viên Tuyển dụng (Tư vấn L1 & Hẹn PV L2)';
      case 'MARKETING':
        return 'Chuyên viên Marketing (Tiếp nhận data C3)';
      case 'VIEWER':
        return 'Người xem (Chỉ đọc)';
      default:
        return role;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thông tin định danh & Doanh nghiệp">
      <div className="space-y-6 text-slate-800">
        {/* Profile Card Header */}
        <div className="flex items-center space-x-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'Avatar'}
              className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-sm">
              {(user?.displayName || currentUser.name || 'U').charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900 truncate">
                {user?.displayName || currentUser.name}
              </h3>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                  isSuperAdmin
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}
              >
                {isSuperAdmin ? 'PLATFORM SUPER ADMIN' : currentUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email || currentUser.email}</p>
            <div className="flex items-center space-x-1 text-[11px] text-emerald-600 font-medium mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Đã xác thực Firebase Authentication</span>
            </div>
          </div>
        </div>

        {/* Tenant & RBAC Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Tenant Information */}
          <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
            <span className="text-slate-400 font-medium text-[11px] flex items-center space-x-1">
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              <span>Doanh nghiệp sở hữu (Tenant)</span>
            </span>
            <p className="font-bold text-slate-900">
              {currentUser.companyName || tenantContext.companyName || 'FCS Pilot Workforce Corp'}
            </p>
            <p className="font-mono text-[11px] text-blue-700">
              ID: {currentUser.tenantId || tenantContext.tenantId || 'FCS-000001'} • Gói:{' '}
              {tenantContext.planCode || 'PILOT'}
            </p>
          </div>

          {/* RBAC Role */}
          <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
            <span className="text-slate-400 font-medium text-[11px] flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Phân quyền RBAC</span>
            </span>
            <p className="font-bold text-slate-900">{formatRoleName(currentUser.role)}</p>
            <p className="text-[11px] text-slate-500">Mã nhân sự: {currentUser.staffId || currentUser.id}</p>
          </div>

          {/* User Email */}
          <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
            <span className="text-slate-400 font-medium text-[11px] flex items-center space-x-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Email tài khoản</span>
            </span>
            <p className="font-semibold text-slate-900 break-all">{user?.email || currentUser.email}</p>
          </div>

          {/* Office Scope */}
          <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
            <span className="text-slate-400 font-medium text-[11px] flex items-center space-x-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Phạm vi văn phòng (Office Scope)</span>
            </span>
            <p className="font-semibold text-slate-900">
              {currentUser.allowedOfficeIds?.includes('*') || isSuperAdmin
                ? 'Toàn bộ văn phòng (Tất cả đơn vị)'
                : `${currentUser.officeId || 'OFF-01'} (Chỉ định)`}
            </p>
          </div>
        </div>

        {/* Data Source Configuration & Status - Phân quyền hiển thị nghiêm ngặt */}
        {isViewer ? (
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 flex items-center space-x-1.5">
                <Database className="w-4 h-4 text-amber-600" />
                <span>Chế độ dữ liệu vận hành:</span>
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold bg-amber-200 text-amber-900 border border-amber-300">
                Dữ liệu Mẫu (Mock Demo Sandbox)
              </span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Tài khoản Người xem (Viewer) được cấp quyền tham quan trải nghiệm trên môi trường dữ liệu mẫu chuẩn Verified Working Worker (VWW).
            </p>
          </div>
        ) : isStaff && !isSuperAdmin ? (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                <Database className="w-4 h-4 text-blue-600" />
                <span>Nguồn dữ liệu vận hành:</span>
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Doanh nghiệp ({currentUser.tenantId || 'FCS-000001'})
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Phạm vi dữ liệu: Hồ sơ lao động thuộc văn phòng phụ trách ({currentUser.officeId || 'OFF-01'}).
            </p>
          </div>
        ) : (
          /* Chỉ Quản trị viên cấp cao (Super Admin / Tenant Admin) mới thấy thông số kỹ thuật */
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                <Database className="w-4 h-4 text-blue-600" />
                <span>Nguồn dữ liệu quản trị:</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-extrabold ${
                  isMock
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : healthStatus === 'healthy'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {isMock ? 'Dữ liệu Demo (Mock)' : healthStatus === 'healthy' ? 'Google Sheet (Kết nối tốt)' : 'Google Sheet (Lỗi kết nối)'}
              </span>
            </div>

            <div className="text-[11px] text-slate-600 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-500 shrink-0">Endpoint Quản trị:</span>
                <span className="font-mono text-[10px] text-slate-700 break-all text-right select-all bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  {API_BASE_URL || 'Chưa cấu hình (Trống)'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500">Chuyển chế độ:</span>
                <button
                  type="button"
                  onClick={() => toggleMockMode()}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-blue-700 border border-blue-200 rounded font-bold text-[11px] cursor-pointer shadow-2xs transition-colors"
                >
                  {isMock ? 'Thử kết nối Google Sheet' : 'Chuyển về Dữ liệu Demo'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Security & Multi-tenant isolation Note */}
        <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-slate-600 space-y-1">
          <span className="font-bold text-blue-900 flex items-center space-x-1.5">
            <Shield className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Chính sách phân lập dữ liệu Multi-Tenant:</span>
          </span>
          <p className="text-[11px] leading-relaxed text-slate-600">
            Dữ liệu của doanh nghiệp được lưu trữ trong Google Sheets độc lập (FCS-000001_DATA &amp;
            FCS-000001_MANAGEMENT). Định danh và quyền truy cập được phân giải 100% tại máy chủ dựa trên Firebase UID,
            ngăn chặn hoàn toàn rò rỉ dữ liệu chéo giữa các doanh nghiệp.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>ĐĂNG XUẤT</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            ĐÓNG
          </button>
        </div>
      </div>
    </Modal>
  );
};
