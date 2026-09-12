import React, { useEffect, useState } from 'react';
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
import { AddInterviewModal } from '../components/worker360/AddInterviewModal';
import { AddAssignmentModal } from '../components/worker360/AddAssignmentModal';
import {
  ArrowLeft,
  User,
  GitCommit,
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
} from 'lucide-react';

export const WorkerDetailPage: React.FC = () => {
  const { currentRoute, navigateTo, showNotification, refreshKey, triggerRefresh, isMock } = useApp();

  // Extract workerId from route /app/workers/:workerId or /workers/:workerId
  const cleanPath = currentRoute.split('?')[0];
  const parts = cleanPath.split('/').filter(Boolean);
  const workersIdx = parts.indexOf('workers');
  const workerId = (workersIdx !== -1 && parts[workersIdx + 1]) ? parts[workersIdx + 1] : (parts[parts.length - 1] || '');

  const [worker, setWorker] = useState<Worker | null>(null);
  const [events, setEvents] = useState<PipelineEvent[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [actions, setActions] = useState<ActionQueueItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'info' | 'journey' | 'interviews' | 'assignments' | 'attendance' | 'actions'
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
    if (!isMock) {
      showNotification('Đang hoàn thiện kết nối. Hệ thống đang ở chế độ Chỉ đọc (Read Only).', 'warning');
      return;
    }
    try {
      await api.recordInterviewResult(interviewId, result);
      showNotification(
        result === 'PASSED' ? 'Đã ghi nhận ĐẬU phỏng vấn' : 'Đã ghi nhận KHÔNG ĐẠT',
        'success'
      );
      triggerRefresh();
    } catch (err: any) {
      showNotification('Không thể ghi nhận kết quả', 'warning');
    }
  };

  const handleConfirmStarted = async (assignmentId: string) => {
    if (!isMock) {
      showNotification('Đang hoàn thiện kết nối. Hệ thống đang ở chế độ Chỉ đọc (Read Only).', 'warning');
      return;
    }
    try {
      await api.confirmWorkerStarted(assignmentId);
      showNotification('Đã xác nhận lao động bắt đầu làm việc tại nhà máy (STARTED)', 'success');
      triggerRefresh();
    } catch (err: any) {
      showNotification('Lỗi xác nhận đi làm', 'warning');
    }
  };

  const isWorkerVww = Boolean((worker as any).isVww || worker.isVerifiedWorking);

  const tabs = [
    { id: 'journey', label: '2. HÀNH TRÌNH', icon: GitCommit, count: events.length },
    { id: 'info', label: '1. THÔNG TIN', icon: User },
    { id: 'interviews', label: '3. PHỎNG VẤN', icon: Calendar, count: interviews.length },
    { id: 'assignments', label: '4. ĐI LÀM', icon: Briefcase, count: assignments.length },
    { id: 'attendance', label: '5. CHẤM CÔNG', icon: FileCheck2, count: attendances.length },
    { id: 'actions', label: '6. CẦN XỬ LÝ', icon: AlertCircle, count: actions.length },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigateTo('/workers')}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách lao động</span>
        </button>
      </div>

      {/* HEADER: Worker ID, Name, Phone, Current Status, VWW Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xl font-black shrink-0 shadow-sm">
              {worker.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  {worker.workerId}
                </span>
                <StatusBadge status={worker.status} />
                {isWorkerVww && <VWWBadge isVWW={true} showSecondary={true} />}
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                {worker.fullName}
              </h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-600 mt-1">
                <a
                  href={`tel:${worker.phone}`}
                  className="flex items-center space-x-1 font-bold text-blue-600 hover:underline"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-500" />
                  <span>{formatPhone(worker.phone)}</span>
                </a>
                <span className="text-slate-300">•</span>
                <span className="flex items-center space-x-1 font-medium">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatCccd(worker.cccd)}</span>
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
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full md:w-auto self-start md:self-center">
            <button
              onClick={() => setShowAddInterview(true)}
              className="px-3 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer min-h-[42px] flex items-center justify-center text-center shadow-2xs"
            >
              + Đặt phỏng vấn
            </button>
            <button
              onClick={() => setShowAddAssignment(true)}
              className="px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs min-h-[42px] flex items-center justify-center text-center"
            >
              + Phân bổ xưởng
            </button>
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

      {/* 6 SECTION TABS */}
      <div className="border-b border-slate-200">
        <div className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-px">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
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
        {/* 1. THÔNG TIN */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Hồ sơ chi tiết & Nhu cầu lao động
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-400 block mb-1">Nhu cầu hiện tại:</span>
                <span className="font-bold text-slate-900 text-sm">{worker.currentNeed}</span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-400 block mb-1">Công việc mong muốn:</span>
                <span className="font-bold text-slate-900 text-sm">{worker.desiredJob || 'Lao động phổ thông'}</span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-400 block mb-1">Nguồn tiếp nhận:</span>
                <span className="font-bold text-slate-900 text-sm">{worker.source}</span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-400 block mb-1">Ngày sinh & Giới tính:</span>
                <span className="font-semibold text-slate-800">
                  {worker.dateOfBirth ? formatDate(worker.dateOfBirth) : 'Chưa cập nhật'} • {worker.gender || 'Chưa rõ'}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-400 block mb-1">Địa chỉ chi tiết:</span>
                <span className="font-semibold text-slate-800">
                  {worker.address ? `${worker.address}, ${worker.district || ''}` : `${worker.district || ''}, ${worker.province}`}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-400 block mb-1">Nhân viên phụ trách:</span>
                <span className="font-semibold text-slate-800">
                  {worker.recruiterName} ({worker.officeName})
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2. HÀNH TRÌNH (Timeline) */}
        {activeTab === 'journey' && <WorkerJourneyTimeline events={events} />}

        {/* 3. PHỎNG VẤN */}
        {activeTab === 'interviews' && (
          <WorkerInterviewsSection
            interviews={interviews}
            onAddInterview={() => setShowAddInterview(true)}
            onRecordResult={handleRecordResult}
          />
        )}

        {/* 4. ĐI LÀM */}
        {activeTab === 'assignments' && (
          <WorkerAssignmentsSection
            assignments={assignments}
            onAddAssignment={() => setShowAddAssignment(true)}
            onConfirmStarted={handleConfirmStarted}
          />
        )}

        {/* 5. CHẤM CÔNG */}
        {activeTab === 'attendance' && <WorkerAttendanceSection attendances={attendances} />}

        {/* 6. CẦN XỬ LÝ */}
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
    </div>
  );
};
