import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Play, AlertTriangle, X, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { isMock, triggerRefresh, showNotification, navigateTo, setShowCreateWorkerModal } = useApp();
  const [isRunning, setIsRunning] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [showMobileTestDrawer, setShowMobileTestDrawer] = useState<boolean>(false);

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

  if (collapsed) {
    return (
      <div className="bg-amber-500 text-amber-950 px-3 sm:px-4 py-1 text-xs flex items-center justify-between font-medium">
        <span className="truncate">⚡ Chế độ DỮ LIỆU DEMO (Sprint 01)</span>
        <button
          onClick={() => setCollapsed(false)}
          className="underline hover:text-white font-bold cursor-pointer ml-2 shrink-0 text-[11px]"
        >
          Mở kịch bản test
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
              Mock API Golden Flow
            </span>
            <span className="text-slate-600 hidden lg:inline text-xs">
              — 5 kịch bản chuẩn VWW:
            </span>
          </div>

          {/* Mobile Test Drawer Toggle */}
          <div className="flex items-center space-x-1 md:hidden">
            <button
              onClick={() => setShowMobileTestDrawer(!showMobileTestDrawer)}
              className="px-2 py-1 bg-amber-200 text-amber-950 font-bold rounded text-[11px] flex items-center space-x-1"
            >
              <span>Chạy kịch bản</span>
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

        {/* DESKTOP Quick Test Runners */}
        <div className="hidden md:flex items-center flex-wrap gap-1.5">
          <button
            onClick={() => handleRunFlow('GF-001')}
            disabled={!!isRunning}
            className="px-2 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
            title="GF-001: Happy Path Đăng ký -> Phỏng vấn -> Đi làm -> Khớp công -> Đạt VWW"
          >
            <Play className="w-3 h-3 text-emerald-600 fill-emerald-600" />
            <span>GF-001 VWW Chuẩn</span>
          </button>

          <button
            onClick={() => handleRunFlow('GF-002')}
            disabled={!!isRunning}
            className="px-2 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
            title="GF-002: Kiểm tra phát hiện trùng lặp SĐT/CCCD"
          >
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>GF-002 Check Trùng</span>
          </button>

          <button
            onClick={() => handleRunFlow('GF-003')}
            disabled={!!isRunning}
            className="px-2 py-1 bg-white hover:bg-blue-50 text-blue-900 border border-blue-300 rounded font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
            title="GF-003: Chấm công chỉ có tên, không có SĐT -> Bắt buộc người duyệt (75-89%)"
          >
            <span>GF-003 Duyệt 75-89%</span>
          </button>

          <button
            onClick={() => handleRunFlow('GF-005')}
            disabled={!!isRunning}
            className="px-2 py-1 bg-white hover:bg-rose-50 text-rose-900 border border-rose-300 rounded font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
            title="GF-005: Đã đỗ quá 24h chưa đi làm -> Tự động kích hoạt Action P1"
          >
            <span>GF-005 SLA &gt;24h</span>
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
              onClick={() => handleRunFlow('GF-001')}
              disabled={!!isRunning}
              className="px-2.5 py-2 bg-white active:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded font-bold text-xs flex items-center justify-center space-x-1"
            >
              <Play className="w-3 h-3 text-emerald-600 fill-emerald-600" />
              <span>GF-001 VWW Chuẩn</span>
            </button>

            <button
              onClick={() => handleRunFlow('GF-002')}
              disabled={!!isRunning}
              className="px-2.5 py-2 bg-white active:bg-amber-100 text-amber-900 border border-amber-300 rounded font-bold text-xs flex items-center justify-center space-x-1"
            >
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>GF-002 Check Trùng</span>
            </button>

            <button
              onClick={() => handleRunFlow('GF-003')}
              disabled={!!isRunning}
              className="px-2.5 py-2 bg-white active:bg-blue-50 text-blue-900 border border-blue-300 rounded font-bold text-xs flex items-center justify-center"
            >
              <span>GF-003 Duyệt 75-89%</span>
            </button>

            <button
              onClick={() => handleRunFlow('GF-005')}
              disabled={!!isRunning}
              className="px-2.5 py-2 bg-white active:bg-rose-50 text-rose-900 border border-rose-300 rounded font-bold text-xs flex items-center justify-center"
            >
              <span>GF-005 SLA &gt;24h</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
