import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Trash2, CheckCircle2, RefreshCw, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../auth/AuthProvider';

interface SuperAdminResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SuperAdminResetModal: React.FC<SuperAdminResetModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentUser, showNotification } = useApp();
  const { user: authUser } = useAuth();

  const [confirmCode, setConfirmCode] = useState('');
  const [seedCleanSample, setSeedCleanSample] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const userEmail = (authUser?.email || currentUser.email || '').toLowerCase();
  const isSuperAdmin =
    currentUser.role === 'PLATFORM_SUPER_ADMIN' ||
    currentUser.isSuperAdmin ||
    userEmail === 'coach.chuyen@gmail.com' ||
    userEmail === 'victorchuyen68@gmail.com';

  const handleExecuteReset = async () => {
    if (confirmCode.trim() !== 'RESET-FCS-2026') {
      setError('Mã xác nhận chưa chính xác. Vui lòng nhập đúng: RESET-FCS-2026');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://script.google.com/macros/s/AKfycbyFHP51wW1sb_ES3iOx2Yltq--Isq-yr1JgUF4ysw6LE7ksX58VPoryHTFMA0R9nK1qmQ/exec';
      const endpoint = apiBaseUrl.includes('?')
        ? `${apiBaseUrl}&action=v2.system.reset`
        : `${apiBaseUrl}?action=v2.system.reset`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'v2.system.reset',
          confirm_code: confirmCode.trim(),
          seed_clean_sample: seedCleanSample,
          actor_email: userEmail,
          is_super_admin: true,
          tenantId: 'FCS-000001'
        }),
        redirect: 'follow'
      });

      const resJson = await response.json();

      if (resJson.success) {
        showNotification(
          seedCleanSample
            ? 'Đã xóa sạch dữ liệu cũ và nạp lại 10 hồ sơ & deal mẫu chuẩn không lỗi!'
            : 'Đã xóa sạch hoàn toàn dữ liệu nghiệp vụ! Hệ thống đã ở trạng thái Clean Slate 100%.',
          'success'
        );
        onClose();
        if (onSuccess) {
          onSuccess();
        } else {
          // Tự động reload lại trang sau 1.5s để cập nhật giao diện
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } else {
        setError(resJson.error || 'Có lỗi xảy ra khi thực hiện reset dữ liệu.');
      }
    } catch (err: any) {
      setError(`Lỗi kết nối tới hệ thống: ${err.message || 'Không thể phản hồi'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-rose-200">
        {/* Header Nguy Hiểm */}
        <div className="bg-gradient-to-r from-rose-600 to-red-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-black text-base tracking-wide">
                KHU VỰC NGUY HIỂM: RESET HỆ THỐNG
              </h3>
              <p className="text-xs text-rose-100 font-medium">
                Dành riêng cho Platform Super Admin (Coach Chuyên)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-rose-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung cảnh báo */}
        <div className="p-6 space-y-4">
          {!isSuperAdmin ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-bold">Từ chối truy cập</p>
                <p className="text-xs mt-1">
                  Chỉ tài khoản Super Admin (<span className="font-mono font-bold">coach.chuyen@gmail.com</span>) mới có thẩm quyền thực thi thao tác xóa dữ liệu này.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs leading-relaxed space-y-2">
                <p className="font-bold flex items-center gap-1.5 text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Hành động này sẽ thực hiện đồng bộ:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-amber-800">
                  <li>Xóa sạch dòng 2+ trên 11 bảng: <span className="font-mono font-bold">01_MASTER_WORKERS</span>, <span className="font-mono font-bold">02_CRM_DEALS_2026</span>, <span className="font-mono font-bold">05_PIPELINE_EVENTS</span>...</li>
                  <li>Loại bỏ 100% các dòng rác bị gãy công thức VLOOKUP (<span className="font-mono text-rose-600 font-bold">#ERROR!</span>).</li>
                  <li>Bảo toàn nguyên vẹn dòng Tiêu đề (Header) và các bảng danh mục chuẩn (<span className="font-mono">DM_BRANCH</span>, <span className="font-mono">DM_COMPANY</span>, <span className="font-mono">DM_LEVEL_SALE</span>).</li>
                </ul>
              </div>

              {/* Tùy chọn nạp 10 mẫu chuẩn */}
              <label className="flex items-start space-x-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={seedCleanSample}
                  onChange={(e) => setSeedCleanSample(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                />
                <div className="text-xs text-slate-700">
                  <span className="font-bold text-slate-900 block">
                    Đồng thời nạp 10 hồ sơ & deal mẫu chuẩn V2 (Không lỗi công thức)
                  </span>
                  <span className="text-slate-500">
                    Bao gồm 10 lao động VNeID chuẩn và 10 CRM Deals trải rộng 10 giai đoạn phễu để nghiệm thu ngay. Nếu không chọn, hệ thống sẽ để trắng 100% để bạn cập nhật file mới.
                  </span>
                </div>
              </label>

              {/* Ô nhập mã xác nhận */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Để xác nhận, vui lòng gõ chính xác mã: <span className="font-mono text-rose-600 font-black select-all bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">RESET-FCS-2026</span>
                </label>
                <input
                  type="text"
                  value={confirmCode}
                  onChange={(e) => {
                    setConfirmCode(e.target.value);
                    setError(null);
                  }}
                  placeholder="Nhập: RESET-FCS-2026"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>

          {isSuperAdmin && (
            <button
              type="button"
              onClick={handleExecuteReset}
              disabled={confirmCode.trim() !== 'RESET-FCS-2026' || loading}
              className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md flex items-center space-x-2 transition-all ${
                confirmCode.trim() === 'RESET-FCS-2026' && !loading
                  ? 'bg-rose-600 hover:bg-rose-700 cursor-pointer shadow-rose-200'
                  : 'bg-slate-300 cursor-not-allowed opacity-60'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang dọn dẹp hệ thống...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>XÁC NHẬN XÓA & RESET CLEAN SLATE</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
