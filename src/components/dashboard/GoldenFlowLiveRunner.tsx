import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Calendar,
  Briefcase,
  Clock,
  GitCompare,
  Award,
  BarChart3,
  ShieldCheck,
  Database,
  Building2,
  Layers,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export const GoldenFlowLiveRunner: React.FC = () => {
  const { navigateTo, triggerRefresh, showNotification, currentUser } = useApp();
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [lastWorkerId, setLastWorkerId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showArchDetails, setShowArchDetails] = useState<boolean>(false);

  const steps = [
    {
      step: 1,
      name: 'Tiếp nhận hồ sơ',
      table: '01_MASTER_WORKERS',
      desc: 'Cấp mã Worker ID duy nhất, kiểm tra trùng lặp SĐT & CCCD',
      icon: UserCheck,
    },
    {
      step: 2,
      name: 'Phỏng vấn xưởng',
      table: '06_INTERVIEWS',
      desc: 'Đặt lịch phỏng vấn và ghi nhận kết quả ĐẬU (Passed)',
      icon: Calendar,
    },
    {
      step: 3,
      name: 'Phân bổ xưởng',
      table: '07_ASSIGNMENTS',
      desc: 'Gán nhà máy đối tác (Foxconn/Luxshare), ca làm việc',
      icon: Briefcase,
    },
    {
      step: 4,
      name: 'Chấm công đối tác',
      table: '08_ATTENDANCE_RAW',
      desc: 'Tiếp nhận dữ liệu chấm công 22 công từ đối tác xưởng',
      icon: Clock,
    },
    {
      step: 5,
      name: 'Khớp công tự động',
      table: '10_MATCHING_REVIEW',
      desc: 'Thuật toán đối soát CCCD/SĐT khớp nối hồ sơ',
      icon: GitCompare,
    },
    {
      step: 6,
      name: 'Đạt chuẩn VWW',
      table: '02_CRM_DEALS_2026',
      desc: 'Đóng dấu kiểm định Verified Working Worker (VWW)',
      icon: Award,
    },
    {
      step: 7,
      name: 'Dashboard kết quả',
      table: '09_ATTENDANCE',
      desc: 'Đồng bộ tức thì lên Trung tâm điều hành & Báo cáo VWW',
      icon: BarChart3,
    },
  ];

  const handleRunGoldenFlow = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setSuccessMessage(null);
    setCurrentStep(1);

    // Smooth visual progression
    const timer1 = setTimeout(() => setCurrentStep(2), 250);
    const timer2 = setTimeout(() => setCurrentStep(3), 500);
    const timer3 = setTimeout(() => setCurrentStep(4), 750);
    const timer4 = setTimeout(() => setCurrentStep(5), 1000);
    const timer5 = setTimeout(() => setCurrentStep(6), 1300);
    const timer6 = setTimeout(() => setCurrentStep(7), 1600);

    try {
      const res = await api.runGoldenFlow('GF-001');
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);
      setCurrentStep(7);
      setLastWorkerId(res.workerId || 'WK-000101');
      setSuccessMessage(res.message || 'Đã hoàn tất toàn bộ chuỗi Golden Flow: Lao động đạt chuẩn VWW!');
      triggerRefresh();
      showNotification('Đã thực thi thành công Golden Flow cho FCS-000001!', 'success');
    } catch (err: any) {
      showNotification('Có lỗi khi chạy mô phỏng Golden Flow', 'warning');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-4 sm:p-6 shadow-md border border-slate-700/80">
      {/* Header Badge & Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-700/80">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
              <span>Chuỗi giá trị cốt lõi • Golden Flow</span>
            </span>
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <ShieldCheck className="w-3 h-3" />
              <span>Pilot FCS-000001</span>
            </span>
            <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
              <Building2 className="w-3 h-3 text-blue-400" />
              <span>{currentUser.companyName || 'FCS Pilot Workforce Corp'}</span>
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
            Chứng minh luồng vận hành thực tế khép kín (End-to-End)
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 max-w-3xl leading-relaxed">
            Chứng minh kiến trúc SaaS độc lập bằng chuỗi dữ liệu thực chất từ tiếp nhận ứng viên đến khi đối soát chấm công đạt chuẩn <strong className="text-emerald-300">Verified Working Worker (VWW)</strong>.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2.5 self-start lg:self-center">
          {currentUser.role === 'VIEWER' ? (
            <div className="px-3.5 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5">
              <span>Chế độ Người xem (Chỉ đọc)</span>
            </div>
          ) : (
            <button
              onClick={handleRunGoldenFlow}
              disabled={isRunning}
              className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold shadow-lg transition-all cursor-pointer ${
                isRunning
                  ? 'bg-blue-600/70 text-white/80 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:shadow-emerald-500/25 active:scale-95'
              }`}
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Đang xử lý luồng...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Chạy mẫu Golden Flow (1-Click)</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 7-Step Visual Progression Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-5 pb-2">
        {steps.map(s => {
          const Icon = s.icon;
          const isActive = currentStep === s.step;
          const isDone = currentStep > s.step || (!isRunning && currentStep === 7);

          return (
            <div
              key={s.step}
              className={`relative flex flex-col justify-between p-3 rounded-xl border transition-all duration-300 ${
                isActive
                  ? 'bg-blue-600/30 border-blue-400 ring-2 ring-blue-400/40 shadow-md scale-[1.02]'
                  : isDone
                  ? 'bg-slate-800/80 border-emerald-500/40 text-slate-200'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isDone
                        ? 'bg-emerald-500 text-slate-950'
                        : isActive
                        ? 'bg-blue-400 text-slate-950 animate-bounce'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.step}
                  </span>
                  <Icon
                    className={`w-4 h-4 ${
                      isDone
                        ? 'text-emerald-400'
                        : isActive
                        ? 'text-blue-300 animate-pulse'
                        : 'text-slate-500'
                    }`}
                  />
                </div>

                <div className="text-[12px] font-bold text-white leading-snug">{s.name}</div>
                <div className="text-[9px] font-mono text-blue-300/80 mt-0.5 truncate">{s.table}</div>
              </div>

              <div className="text-[10px] text-slate-300 mt-2 line-clamp-2 leading-tight">
                {s.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Success Notification & Quick Links */}
      {successMessage && (
        <div className="mt-4 p-3.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-start sm:items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-extrabold text-emerald-200">Thành công: </span>
              <span className="text-emerald-100">{successMessage}</span>
              {lastWorkerId && (
                <span className="ml-2 font-mono font-black text-amber-300 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-500/30">
                  {lastWorkerId}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {lastWorkerId && (
              <button
                onClick={() => navigateTo(`/workers/${lastWorkerId}`)}
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition-colors cursor-pointer"
              >
                <span>Xem Worker 360</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={() => navigateTo('/results')}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] border border-slate-600 transition-colors cursor-pointer"
            >
              <span>Xem Thước đo VWW</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Accordion: Architecture Proof (3 Data Layers & Isolation) */}
      <div className="mt-4 pt-3 border-t border-slate-700/60">
        <button
          onClick={() => setShowArchDetails(!showArchDetails)}
          className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 font-semibold cursor-pointer transition-colors"
        >
          <span className="flex items-center space-x-2">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>Xem chứng chỉ phân lập dữ liệu FCS-000001 (Data Isolation & RBAC Proof)</span>
          </span>
          {showArchDetails ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showArchDetails && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            {/* Layer 1 */}
            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
              <div className="flex items-center space-x-1.5 text-amber-300 font-bold mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Tầng 1: Master Danh mục</span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono">FCS_SAAS_MASTER</p>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Đăng ký tenant FCS-000001, liên kết tài khoản Firebase <code>{currentUser.email}</code>, hoàn toàn không chứa hồ sơ lao động khách hàng.
              </p>
            </div>

            {/* Layer 2 */}
            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
              <div className="flex items-center space-x-1.5 text-emerald-300 font-bold mb-1">
                <Database className="w-3.5 h-3.5" />
                <span>Tầng 2: Data Riêng Biệt</span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono">FCS-000001_FCS_DATA</p>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                12 bảng giao dịch nhân lực độc lập: Workers Master, Interviews, Assignments, Attendance Raw, Matching Queue, Action Queue.
              </p>
            </div>

            {/* Layer 3 */}
            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
              <div className="flex items-center space-x-1.5 text-blue-300 font-bold mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Tầng 3: Cấu hình & RBAC</span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono">FCS-000001_FCS_MANAGEMENT</p>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                12 bảng danh mục quản trị: Văn phòng chi nhánh, Staff tuyển dụng, Danh sách xưởng đối tác, Phân quyền RBAC.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
