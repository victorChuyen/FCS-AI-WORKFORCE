import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  Worker,
  PipelineEvent,
  Interview,
  Assignment,
  Attendance,
  ActionQueueItem,
  WorkerStatus,
} from '../types';
import { StatusBadge, VWWBadge } from '../components/common/Badge';
import { formatPhone, formatCccd, formatDate, formatDateTime } from '../utils/formatters';
import { WorkerJourneyTimeline } from '../components/worker360/WorkerJourneyTimeline';
import { WorkerInterviewsSection } from '../components/worker360/WorkerInterviewsSection';
import { WorkerAssignmentsSection } from '../components/worker360/WorkerAssignmentsSection';
import { WorkerAttendanceSection } from '../components/worker360/WorkerAttendanceSection';
import { WorkerDealsSection } from '../components/worker360/WorkerDealsSection';
import { WorkerAuditSection } from '../components/worker360/WorkerAuditSection';
import { WorkerCareSection } from '../components/worker360/WorkerCareSection';
import { EditWorkerModal } from '../components/worker360/EditWorkerModal';
import { ReactivationInviteModal } from '../components/workers/ReactivationInviteModal';
import { dealApi } from '../services/api/dealApi';
import { CrmDeal } from '../types/deal.types';
import { AddInterviewModal } from '../components/worker360/AddInterviewModal';
import { AddAssignmentModal } from '../components/worker360/AddAssignmentModal';
import { hasPermission, maskSensitiveInfo } from '../types/auth';
import {
  ArrowLeft,
  User,
  GitCommit,
  GitFork,
  Calendar,
  Briefcase,
  FileCheck2,
  AlertCircle,
  Building,
  Phone,
  CreditCard,
  MapPin,
  RefreshCw,
  Plus,
  CheckCircle2,
  Share2,
  ShieldCheck,
  Edit3,
  HeartHandshake,
  Sparkles,
} from 'lucide-react';

export const WorkerDetailPage: React.FC = () => {
  const { currentRoute, navigateTo, showNotification, refreshKey, triggerRefresh, isMock, currentUser } = useApp();
  const routeParamsHook = useParams<{ workerId: string }>();

  // Extract workerId from route params or fallback to path parsing
  const cleanPath = currentRoute.split('?')[0];
  const parts = cleanPath.split('/').filter(Boolean);
  const workersIdx = parts.indexOf('workers');
  const pathWorkerId = (workersIdx !== -1 && parts[workersIdx + 1]) ? parts[workersIdx + 1] : (parts[parts.length - 1] || '');
  const workerId = routeParamsHook.workerId || pathWorkerId;

  const [worker, setWorker] = useState<Worker | null>(null);
  const [events, setEvents] = useState<PipelineEvent[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [actions, setActions] = useState<ActionQueueItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deals, setDeals] = useState<CrmDeal[]>([]);
  const [showEditWorker, setShowEditWorker] = useState(false);
  const [showReactivationModal, setShowReactivationModal] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'info' | 'journey' | 'deals' | 'interviews' | 'assignments' | 'attendance' | 'audit' | 'actions' | 'care'
  >('journey');

  const [loading, setLoading] = useState(true);
  const [showAddInterview, setShowAddInterview] = useState(false);
  const [showAddAssignment, setShowAddAssignment] = useState(false);

  const fetchWorkerData = async () => {
    if (!workerId) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const wRes = await api.getWorker(workerId);

      if (wRes.success && wRes.data) {
        const d: any = wRes.data;
        setWorker(d);
        setEvents(d.pipelineEvents || []);
        setInterviews(d.interviews || []);
        setAssignments(d.assignments || []);
        setAttendances(d.attendance || []);
        setActions(d.actions || []);
      } else {
        setWorker(null);
        setErrorMessage(wRes.error?.message || 'Không tìm thấy hồ sơ lao động.');
      }

      // Tải danh sách Deal ứng tuyển (19 Level Sale) của lao động này
      try {
        const dRes = await dealApi.getDeals({ search: workerId });
        if (dRes.data) {
          const myDeals = dRes.data.filter(
            (dl: any) =>
              (dl.worker_id || '').toLowerCase() === workerId.toLowerCase() ||
              (dl.workerId || '').toLowerCase() === workerId.toLowerCase()
          );
          setDeals(myDeals);
        }
      } catch (errDeals) {
        console.warn('Không thể tải Deal của worker:', errDeals);
      }
    } catch {
      setWorker(null);
      setErrorMessage('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkerData();
  }, [workerId, refreshKey]);

  if (loading && !worker) {
    return (
      <div className="py-20 text-center">
        <RefreshCw className="w-8 h-8 mx-auto text-blue-600 animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-medium">Đang tải hồ sơ Worker 360...</p>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-lg mx-auto my-8">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h3 className="text-base sm:text-lg font-bold text-slate-900">
          {errorMessage || 'Không tìm thấy hồ sơ lao động.'}
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Mã lao động: <span className="font-mono font-bold text-slate-700">{workerId}</span>
        </p>
        <div className="flex items-center justify-center space-x-3">
          <button
            onClick={fetchWorkerData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
          >
            THỬ LẠI
          </button>
          <button
            onClick={() => navigateTo('/workers')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-colors"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const handleRecordResult = async (interviewId: string, result: 'PASSED' | 'FAILED') => {
    try {
      const res = await api.recordInterviewResult(interviewId, result);
      if (res && (res as any).success === false) {
        showNotification((res as any).error?.message || 'Không thể ghi nhận kết quả', 'warning');
        return;
      }
      showNotification(
        result === 'PASSED' ? 'Đã ghi nhận ĐẬU phỏng vấn thành công' : 'Đã ghi nhận KHÔNG ĐẠT',
        'success'
      );
      triggerRefresh();
    } catch (err: any) {
      showNotification(err?.message || 'Không thể ghi nhận kết quả', 'warning');
    }
  };

  const handleConfirmStarted = async (assignmentId: string) => {
    try {
      const res = await api.confirmWorkerStarted(assignmentId);
      if (res && (res as any).success === false) {
        showNotification((res as any).error?.message || 'Lỗi xác nhận đi làm', 'warning');
        return;
      }
      showNotification('Đã xác nhận lao động bắt đầu làm việc tại nhà máy (STARTED)', 'success');
      triggerRefresh();
    } catch (err: any) {
      showNotification(err?.message || 'Lỗi xác nhận đi làm', 'warning');
    }
  };

  const isWorkerVww = Boolean((worker as any).isVww || worker.isVerifiedWorking);
  const isSuperAdmin = Boolean(currentUser.isSuperAdmin);
  const canViewSensitive = hasPermission(currentUser, 'WORKER_VIEW_SENSITIVE');
  const canEditProfile = hasPermission(currentUser, 'WORKER_EDIT_PROFILE');
  const canScheduleInterview = hasPermission(currentUser, 'INTERVIEW_SCHEDULE');
  const canConfirmStarted = hasPermission(currentUser, 'EMPLOYMENT_CONFIRM_STARTED');

  const displayPhone = canViewSensitive ? formatPhone(worker.phone) : maskSensitiveInfo(worker.phone, 'phone');
  const displayCccd = canViewSensitive ? formatCccd(worker.cccd) : maskSensitiveInfo(worker.cccd, 'cccd');

  const isReactivationEligible = ['QUIT', 'FEE_EXPIRED', 'L3.1', 'L4'].some(s =>
    (worker.status || '').toUpperCase().includes(s)
  );

  const tabs = [
    { id: 'journey', label: '1. HÀNH TRÌNH', icon: GitCommit, count: events.length },
    { id: 'deals', label: '2. 19 LEVEL SALE', icon: GitFork, count: deals.length },
    { id: 'info', label: '3. THÔNG TIN (34 CỘT)', icon: User },
    { id: 'interviews', label: '4. PHỎNG VẤN', icon: Calendar, count: interviews.length },
    { id: 'assignments', label: '5. ĐI LÀM', icon: Briefcase, count: assignments.length },
    { id: 'attendance', label: '6. CHẤM CÔNG', icon: FileCheck2, count: attendances.length },
    { id: 'audit', label: '7. KIỂM TOÁN', icon: ShieldCheck },
    { id: 'actions', label: '8. CẦN XỬ LÝ', icon: AlertCircle, count: actions.length },
    { id: 'care', label: '9. CHĂM SÓC AI (1-3-7 NGÀY)', icon: HeartHandshake },
  ];

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* 1. TOP HEADER & IDENTITY HERO CARD */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Back button + Worker Name & Key Badges */}
          <div className="flex items-start sm:items-center space-x-3.5">
            <button
              onClick={() => navigateTo('/app/workers')}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0 mt-0.5 sm:mt-0"
              title="Quay lại danh sách lao động"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="font-mono text-xs font-black bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md border border-blue-200">
                  {worker.workerId}
                </span>
                <StatusBadge status={worker.status} size="sm" />
                {isWorkerVww && <VWWBadge isVWW={true} showSecondary={true} />}
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                {worker.fullName}
              </h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-600 mt-1">
                <a
                  href={canViewSensitive ? `tel:${worker.phone}` : undefined}
                  className="flex items-center space-x-1 font-bold text-blue-600 hover:underline"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-500" />
                  <span>{displayPhone}</span>
                </a>
                <span className="text-slate-300">•</span>
                <span className="flex items-center space-x-1 font-medium">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>{displayCccd}</span>
                </span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="flex items-center space-x-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{worker.province}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto self-start md:self-center">
            {currentUser.role !== 'VIEWER' ? (
              <>
                {/* Nút Tái kích hoạt 0đ cho lao động cũ đã nghỉ việc hoặc hết phí */}
                {isReactivationEligible && (
                  <button
                    onClick={() => setShowReactivationModal(true)}
                    className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs min-h-[40px] flex items-center justify-center space-x-1.5"
                    title="Mời cựu lao động quay lại làm việc (Marketing 0đ qua Zalo)"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                    <span>Tái Kích Hoạt (Zalo 0đ)</span>
                  </button>
                )}
                {canEditProfile && (
                  <button
                    onClick={() => setShowEditWorker(true)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors cursor-pointer min-h-[40px] flex items-center justify-center space-x-1.5 shadow-2xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                    <span>Sửa hồ sơ</span>
                  </button>
                )}
                {canScheduleInterview && (
                  <button
                    onClick={() => setShowAddInterview(true)}
                    className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer min-h-[40px] flex items-center justify-center text-center shadow-2xs"
                  >
                    + Đặt phỏng vấn
                  </button>
                )}
                {canConfirmStarted && (
                  <button
                    onClick={() => setShowAddAssignment(true)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs min-h-[40px] flex items-center justify-center text-center"
                  >
                    + Phân bổ xưởng
                  </button>
                )}
              </>
            ) : (
              <div className="px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 text-xs font-semibold">
                Chế độ xem (Chỉ đọc)
              </div>
            )}
          </div>
        </div>

        {/* VWW Status Explanation Box */}
        <div className={`p-3.5 rounded-lg border text-xs flex items-center justify-between ${
          isWorkerVww
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className={`w-4 h-4 ${isWorkerVww ? 'text-emerald-600' : 'text-slate-400'}`} />
            <div>
              <span className="font-bold">Tiêu chuẩn Đi làm đã xác minh (Verified Working — VWW): </span>
              {isWorkerVww ? (
                <span>
                  Worker ID + Assignment STARTED + Attendance đã xác nhận = <strong>ĐI LÀM ĐÃ XÁC MINH (VWW)</strong>.
                </span>
              ) : (
                <span>
                  Chưa đạt VWW. Tiêu chuẩn: <strong>Worker ID + Assignment STARTED + Chấm công đã xác nhận</strong>.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 6 SECTION TABS - CỐ ĐỊNH STICKY TOP TRÊN PC & MOBILE */}
      <div className="sticky top-14 sm:top-16 z-30 bg-white/95 backdrop-blur-md border-y border-slate-200 shadow-2xs -mx-3 sm:-mx-6 px-3 sm:px-6 py-0.5 transition-all">
        <div className="flex space-x-1 sm:space-x-3 overflow-x-auto pb-px no-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer min-h-[44px] shrink-0 ${
                  active
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full ${
                      active ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Display */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-2xs min-h-[300px]">
        {/* 1. THÔNG TIN (Chuẩn Foxconn FCS 22 cột) */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-2">
                <span>Hồ sơ lao động chi tiết chuẩn Foxconn FCS</span>
                {worker.department && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {worker.department}
                  </span>
                )}
              </h3>
              <span className="text-xs text-slate-500 font-medium">Mã hồ sơ: <strong className="font-mono text-slate-800">{worker.workerId}</strong></span>
            </div>

            {/* Nhóm 1: Thông tin nhân thân */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase flex items-center space-x-1.5 text-blue-800">
                <span>1. Thông tin cá nhân & Nhân thân</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Họ và tên:</span>
                  <span className="font-bold text-slate-900 text-sm">{worker.fullName}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Bộ phận (Dept):</span>
                  <span className="font-bold text-indigo-700">{worker.department || 'Chưa gán bộ phận'}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Ngày sinh & Giới tính:</span>
                  <span className="font-semibold text-slate-800">
                    {worker.dateOfBirth ? formatDate(worker.dateOfBirth) : 'Chưa cập nhật'} • {worker.gender || 'Chưa rõ'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Dân tộc:</span>
                  <span className="font-semibold text-slate-800">{worker.ethnicity || 'KINH'}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Quê quán (theo CCCD):</span>
                  <span className="font-semibold text-slate-800">{worker.hometown || worker.province || 'Chưa cập nhật'}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Nơi sinh:</span>
                  <span className="font-semibold text-slate-800">{worker.birthPlace || 'Chưa cập nhật'}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Tình trạng hôn nhân:</span>
                  <span className="font-semibold text-slate-800">
                    {worker.maritalStatus === '1' ? 'Đã kết hôn (1)' : worker.maritalStatus === '2' ? 'Chưa kết hôn (2)' : worker.maritalStatus === '3' ? 'Ly hôn (3)' : 'Chưa cập nhật'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Số điện thoại chính:</span>
                  <a href={`tel:${worker.phone}`} className="font-bold text-blue-600 hover:underline">
                    {formatPhone(worker.phone)}
                  </a>
                </div>
              </div>
            </div>

            {/* Nhóm 2: Giấy tờ & Bảo hiểm */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase flex items-center space-x-1.5 text-blue-800">
                <span>2. Giấy tờ tùy thân & Bảo hiểm xã hội</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Số CCCD / CMTND (12 số):</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{formatCccd(worker.cccd)}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Ngày cấp CCCD:</span>
                  <span className="font-semibold text-slate-800">{worker.cccdIssuedDate || 'Chưa cập nhật'}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Số sổ Bảo hiểm xã hội (BHXH):</span>
                  <span className="font-mono font-semibold text-slate-800">{worker.socialInsuranceNo || 'Chưa tham gia'}</span>
                </div>
              </div>
            </div>

            {/* Nhóm 3: Địa chỉ cư trú 3 cấp VNeID */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase flex items-center space-x-1.5 text-blue-800">
                <span>3. Địa chỉ cư trú (Chuẩn VNeID)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Địa chỉ thường trú (theo VNeID):</span>
                  <span className="font-medium text-slate-800">{worker.permanentAddress || worker.address || 'Chưa cập nhật'}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Nơi ở hiện nay (Ký túc xá / Nhà trọ):</span>
                  <span className="font-medium text-slate-800">{worker.currentAddress || worker.address || 'Chưa cập nhật'}</span>
                </div>
              </div>
            </div>

            {/* Nhóm 4: Học vấn & Chuyên môn */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase flex items-center space-x-1.5 text-blue-800">
                <span>4. Trình độ học vấn & Chuyên môn</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Trường tốt nghiệp cao nhất:</span>
                  <span className="font-semibold text-slate-800">{worker.school || 'THPT'}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Chuyên ngành:</span>
                  <span className="font-semibold text-slate-800">{worker.major || 'THPT'}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Năm tốt nghiệp:</span>
                  <span className="font-semibold text-slate-800">{worker.graduationYear || 'Chưa rõ'}</span>
                </div>
              </div>
            </div>

            {/* Nhóm 5: Liên lạc khẩn cấp & Ngân hàng */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase flex items-center space-x-1.5 text-blue-800">
                <span>5. Liên hệ khẩn cấp & Tài khoản nhận lương</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Người liên lạc khẩn cấp:</span>
                  <span className="font-bold text-slate-800">{worker.emergencyContactName || 'Chưa cập nhật'}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">SĐT người thân:</span>
                  {worker.emergencyContactPhone ? (
                    <a href={`tel:${worker.emergencyContactPhone}`} className="font-bold text-blue-600 hover:underline">
                      {formatPhone(worker.emergencyContactPhone)}
                    </a>
                  ) : (
                    <span className="text-slate-400">Chưa cập nhật</span>
                  )}
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Số tài khoản Vietcombank:</span>
                  <span className="font-mono font-bold text-slate-800">{worker.bankAccountNo || 'Chưa mở TK'}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Ngân hàng chi lương:</span>
                  <span className="font-semibold text-emerald-700">{worker.bankName || 'Vietcombank'}</span>
                </div>
              </div>
            </div>

            {/* Nhóm 6: Tuyển dụng & Vận hành */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase flex items-center space-x-1.5 text-blue-800">
                <span>6. Quản lý Tuyển dụng & Nhà máy</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Nhu cầu hiện tại:</span>
                  <span className="font-bold text-slate-900">{worker.currentNeed}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Vị trí mong muốn:</span>
                  <span className="font-semibold text-slate-800">{worker.desiredJob || 'Lao động phổ thông'}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Nguồn ứng tuyển:</span>
                  <span className="font-semibold text-slate-800">{worker.source}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Nhân viên Sale phụ trách:</span>
                  <span className="font-semibold text-slate-800">{worker.recruiterName}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Văn phòng tiếp nhận:</span>
                  <span className="font-semibold text-slate-800">{worker.officeName}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Đối tác / Nhà máy:</span>
                  <span className="font-semibold text-indigo-800">{worker.partnerName || 'Chưa phân bổ'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1. HÀNH TRÌNH (Timeline) */}
        {activeTab === 'journey' && <WorkerJourneyTimeline events={events} />}

        {/* 2. ĐỢT ỨNG TUYỂN (19 LEVEL SALE) */}
        {activeTab === 'deals' && (
          <WorkerDealsSection
            workerId={worker.workerId}
            workerName={worker.fullName}
            workerPhone={worker.phone}
            deals={deals}
            onRefresh={fetchWorkerData}
            canEdit={currentUser.role !== 'VIEWER'}
          />
        )}

        {/* 4. PHỎNG VẤN */}
        {activeTab === 'interviews' && (
          <WorkerInterviewsSection
            interviews={interviews}
            onAddInterview={hasPermission(currentUser, 'INTERVIEW_SCHEDULE') ? () => setShowAddInterview(true) : undefined}
            onRecordResult={hasPermission(currentUser, 'INTERVIEW_CONFIRM_RESULT') ? handleRecordResult : undefined}
          />
        )}

        {/* 5. ĐI LÀM */}
        {activeTab === 'assignments' && (
          <WorkerAssignmentsSection
            assignments={assignments}
            onAddAssignment={hasPermission(currentUser, 'EMPLOYMENT_CONFIRM_STARTED') ? () => setShowAddAssignment(true) : undefined}
            onConfirmStarted={hasPermission(currentUser, 'EMPLOYMENT_CONFIRM_STARTED') ? handleConfirmStarted : undefined}
          />
        )}

        {/* 6. CHẤM CÔNG */}
        {activeTab === 'attendance' && <WorkerAttendanceSection attendances={attendances} />}

        {/* 7. SỔ CÁI KIỂM TOÁN (AUDIT TRAIL) */}
        {activeTab === 'audit' && (
          <WorkerAuditSection workerId={worker.workerId} />
        )}

        {/* 8. CẦN XỬ LÝ */}
        {activeTab === 'actions' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Các nhiệm vụ liên quan đến lao động này ({actions.length})
            </h3>
            {actions.length === 0 ? (
              <div className="p-8 border border-dashed border-slate-300 rounded-xl text-center bg-slate-50/50">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">Không có việc tồn đọng</p>
                <p className="text-xs text-slate-500 mt-0.5">Hồ sơ lao động đang diễn biến thuận lợi theo tiến độ</p>
              </div>
            ) : (
              <div className="space-y-3">
                {actions.map(act => (
                  <div key={act.actionId} className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900">{act.title}</span>
                      <span className="text-[11px] font-semibold text-slate-500">{act.dueAt}</span>
                    </div>
                    <p className="text-xs text-slate-600">{act.reason}</p>
                    <div className="text-xs text-slate-700 bg-white p-2 rounded border border-amber-200 font-medium">
                      Gợi ý: {act.recommendedAction}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 9. CHĂM SÓC AI (1-3-7 NGÀY) */}
        {activeTab === 'care' && (
          <WorkerCareSection
            worker={worker}
            workerId={worker.workerId}
            workerName={worker.fullName}
            phone={worker.phone}
            currentStatus={worker.status}
            factoryName={worker.partnerName || 'Foxconn KCN Quang Châu'}
            startDate={worker.createdAt}
            onRefresh={fetchWorkerData}
          />
        )}
      </div>

      {/* Modals for interview and assignment */}
      <AddInterviewModal
        isOpen={showAddInterview}
        onClose={() => setShowAddInterview(false)}
        workerId={worker.workerId}
        workerName={worker.fullName}
        onSuccess={triggerRefresh}
      />

      <AddAssignmentModal
        isOpen={showAddAssignment}
        onClose={() => setShowAddAssignment(false)}
        workerId={worker.workerId}
        workerName={worker.fullName}
        onSuccess={triggerRefresh}
      />

      {/* Modal Chỉnh Sửa Hồ Sơ (V2 34 Cột) */}
      <EditWorkerModal
        isOpen={showEditWorker}
        onClose={() => setShowEditWorker(false)}
        worker={worker}
        onSuccess={() => {
          showNotification('Cập nhật hồ sơ và ghi nhận vết kiểm toán thành công', 'success');
          fetchWorkerData();
        }}
      />

      {/* Modal Mời Tái Kích Hoạt Cựu Lao Động (Marketing 0đ qua Zalo) */}
      <ReactivationInviteModal
        isOpen={showReactivationModal}
        onClose={() => setShowReactivationModal(false)}
        worker={worker}
        onSuccess={note => {
          showNotification(`Đã ghi nhận kết quả liên hệ tái kích hoạt: ${note}`, 'success');
          fetchWorkerData();
        }}
      />
    </div>
  );
};
