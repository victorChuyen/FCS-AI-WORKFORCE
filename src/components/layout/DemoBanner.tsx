import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Play, AlertTriangle, X, ChevronDown, ChevronUp, Trash2, RotateCcw, Database } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { isMock, triggerRefresh, showNotification, navigateTo, setShowCreateWorkerModal, toggleMockMode } = useApp();
  const [isRunning, setIsRunning] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [showMobileTestDrawer, setShowMobileTestDrawer] = useState<boolean>(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState<boolean>(false);

  if (!isMock) return null;

  const handleRunFlow = async (flowId: 'GF-001' | 'GF-002' | 'GF-003' | 'GF-004' | 'GF-005') => {
    setIsRunning(flowId);
    setShowMobileTestDrawer(false);
    try {
      if (flowId === 'GF-002') {
        showNotification(
          'GF-002: Đang mở form tạo lao động. Thử nhập SĐT 0912345678 để xem cảnh báo trùng lặp!',
          'warning'
        );
        setShowCreateWorkerModal(true);
        setIsRunning(null);
        return;
      }

      const res = await api.runGoldenFlow(flowId);
      showNotification(res.message, 'success');
      triggerRefresh();

      if (flowId === 'GF-001' && res.workerId) {
        navigateTo(`/workers/${res.workerId}`);
      } else if (flowId === 'GF-003') {
        navigateTo('/review?tab=matching');
      } else if (flowId === 'GF-004') {
        navigateTo('/review?tab=matching');
      } else if (flowId === 'GF-005') {
        navigateTo('/review?tab=followup');
      }
    } catch (err: any) {
      showNotification(err.message || 'Lỗi kiểm thử', 'warning');
    } finally {
      setIsRunning(null);
    }
  };

  const handleClearDemoData = async () => {
    try {
      const res = await (api as any).clearDemoData();
      showNotification(
        res.data?.message || 'Đã xóa toàn bộ dữ liệu demo về 0. Bạn có thể tự thêm lao động mới để trải nghiệm!',
        'success'
      );
      triggerRefresh();
      setConfirmClearOpen(false);
    } catch (err: any) {
      showNotification(err.message || 'Lỗi xóa dữ liệu demo', 'warning');
    }
  };

  const handleReloadDemoData = async () => {
    try {
      const res = await (api as any).reloadDemoData();
      showNotification(
        res.data?.message || 'Đã nạp lại bộ dữ liệu demo 6 lao động chuẩn Golden Flow VWW!',
        'success'
      );
      triggerRefresh();
    } catch (err: any) {
      showNotification(err.message || 'Lỗi nạp lại dữ liệu demo', 'warning');
    }
  };

  const handleSwitchToRealData = () => {
    toggleMockMode(false);
    showNotification('Đang kích hoạt chế độ REAL DATA FIRST. Hệ thống sẽ kết nối trực tiếp Google Sheets doanh nghiệp.', 'info');
  };

  if (collapsed) {
    return (
      <div className="bg-amber-500 text-amber-950 px-3 sm:px-4 py-1 text-xs flex items-center justify-between font-medium">
        <span className="truncate">⚡ Chế độ DỮ LIỆU DEMO (Thử nghiệm khách hàng)</span>
        <button
          onClick={() => setCollapsed(false)}
          className="underline hover:text-white font-bold cursor-pointer ml-2 shrink-0 text-[11px]"
        >
          Mở thanh điều khiển demo
        </button>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-3 sm:px-6 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        {/* Banner Title */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm font-extrabold bg-amber-200 text-amber-950 border border-amber-300 uppercase tracking-wide text-[10px]">
              DỮ LIỆU DEMO
            </span>
            <span className="font-semibold text-slate-800 text-xs sm:text-sm">
              Trải nghiệm Demo tùy chỉnh
            </span>
          </div>

          {/* Mobile Test Drawer Toggle */}
          <div className="flex items-center space-x-1 md:hidden">
            <button
              onClick={() => setShowMobileTestDrawer(!showMobileTestDrawer)}
              className="px-2 py-1 bg-amber-200 text-amber-950 font-bold rounded text-[11px] flex items-center space-x-1"
            >
              <span>Điều khiển demo</span>
              {showMobileTestDrawer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            <button
              onClick={() => setCollapsed(true)}
              className="p-1 text-slate-400 hover:text-slate-600"
              title="Ẩn thanh test"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* DESKTOP Action Buttons */}
        <div className="hidden md:flex items-center flex-wrap gap-1.5">
          {/* Action: Clear Demo Data */}
          {!confirmClearOpen ? (
            <button
              onClick={() => setConfirmClearOpen(true)}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold transition-colors flex items-center space-x-1 cursor-pointer shadow-xs"
              title="Xóa toàn bộ hồ sơ demo về 0 để tự nhập dữ liệu tùy biến"
            >
              <Trash2 className="w-3 h-3" />
              <span>Xóa Demo (Về 0)</span>
            </button>
          ) : (
            <div className="flex items-center space-x-1 bg-rose-100 p-0.5 rounded border border-rose-300">
              <span className="text-[11px] text-rose-900 font-bold px-1">Xác nhận xóa về 0?</span>
              <button
                onClick={handleClearDemoData}
                className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold hover:bg-rose-700 cursor-pointer"
              >
                Xóa ngay
              </button>
              <button
                onClick={() => setConfirmClearOpen(false)}
                className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] hover:bg-slate-300 cursor-pointer"
              >
                Hủy
              </button>
            </div>
          )}

          {/* Action: Reload Demo Data */}
          <button
            onClick={handleReloadDemoData}
            className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-900 border border-blue-300 rounded font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
            title="Nạp lại 6 hồ sơ lao động mẫu chuẩn Golden Flow VWW"
          >
            <RotateCcw className="w-3 h-3 text-blue-600" />
            <span>Nạp lại Demo</span>
          </button>

          <span className="text-slate-300">|</span>

          {/* Quick Flow: GF-001 */}
          <button
            onClick={() => handleRunFlow('GF-001')}
            disabled={!!isRunning}
            className="px-2 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
            title="GF-001: Happy Path Đăng ký -> Phỏng vấn -> Đi làm -> Khớp công -> Đạt VWW"
          >
            <Play className="w-3 h-3 text-emerald-600 fill-emerald-600" />
            <span>GF-001 VWW Chuẩn</span>
          </button>

          {/* Quick Flow: GF-002 */}
          <button
            onClick={() => handleRunFlow('GF-002')}
            disabled={!!isRunning}
            className="px-2 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
            title="GF-002: Kiểm tra phát hiện trùng lặp SĐT/CCCD"
          >
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>GF-002 Check Trùng</span>
          </button>

          <span className="text-slate-300">|</span>

          {/* Switch to Real Data */}
          <button
            onClick={handleSwitchToRealData}
            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold transition-colors flex items-center space-x-1 cursor-pointer shadow-xs"
            title="Chuyển sang kết nối Google Sheets thực tế của doanh nghiệp"
          >
            <Database className="w-3 h-3" />
            <span>Chuyển sang Real Data</span>
          </button>

          <button
            onClick={() => setCollapsed(true)}
            className="p-1 text-slate-400 hover:text-slate-600 ml-1 cursor-pointer"
            title="Thu nhỏ thanh thông báo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* MOBILE Collapsible Buttons */}
        {showMobileTestDrawer && (
          <div className="w-full md:hidden grid grid-cols-2 gap-1.5 pt-2 border-t border-amber-200 animate-in fade-in duration-150">
            <button
              onClick={handleClearDemoData}
              className="px-2.5 py-2 bg-rose-600 text-white rounded font-bold text-xs flex items-center justify-center space-x-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Xóa Demo (Về 0)</span>
            </button>

            <button
              onClick={handleReloadDemoData}
              className="px-2.5 py-2 bg-white active:bg-blue-50 text-blue-900 border border-blue-300 rounded font-bold text-xs flex items-center justify-center space-x-1"
            >
              <RotateCcw className="w-3 h-3 text-blue-600" />
              <span>Nạp lại Demo</span>
            </button>

            <button
              onClick={() => handleRunFlow('GF-001')}
              disabled={!!isRunning}
              className="px-2.5 py-2 bg-white active:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded font-bold text-xs flex items-center justify-center space-x-1"
            >
              <Play className="w-3 h-3 text-emerald-600 fill-emerald-600" />
              <span>GF-001 VWW Chuẩn</span>
            </button>

            <button
              onClick={handleSwitchToRealData}
              className="px-2.5 py-2 bg-emerald-700 text-white rounded font-bold text-xs flex items-center justify-center space-x-1"
            >
              <Database className="w-3 h-3" />
              <span>Dữ liệu thực</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoBanner;
