import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Worker, Office, Staff, Partner, WorkerStatus } from '../types';
import { WorkerTable } from '../components/workers/WorkerTable';
import { ExcelSyncModal } from '../components/workers/ExcelSyncModal';
import { EditWorkerModal } from '../components/worker360/EditWorkerModal';
import { ReactivationInviteModal } from '../components/workers/ReactivationInviteModal';
import { WORKER_STATUS_LABELS } from '../utils/formatters';
import { Search, Plus, Filter, X, RefreshCw, UserCheck, Briefcase, FileSpreadsheet, Timer, Clock } from 'lucide-react';
import { hasPermission } from '../types/auth';

export const WorkersPage: React.FC = () => {
  const { navigateTo, routeParams, refreshKey, setShowCreateWorkerModal, showNotification, currentUser } = useApp();
  const [searchParams] = useSearchParams();

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [reactivatingWorker, setReactivatingWorker] = useState<Worker | null>(null);

  // Auto-Sync Interval Timer (0 = manual, 30s, 60s, 180s, 300s)
  const [syncInterval, setSyncInterval] = useState<number>(() => {
    const saved = localStorage.getItem('fcs_workers_sync_sec');
    return saved !== null ? parseInt(saved, 10) : 60;
  });
  const [countdown, setCountdown] = useState<number>(syncInterval);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (syncInterval <= 0) return;
    setCountdown(syncInterval);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setIsSyncing(true);
          fetchWorkers().finally(() => setIsSyncing(false));
          return syncInterval;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [syncInterval]);

  const handleInstantSync = async () => {
    setIsSyncing(true);
    try {
      await fetchWorkers();
      if (syncInterval > 0) setCountdown(syncInterval);
      showNotification('Đã đồng bộ tức thì với Google Sheets V2 Hub!', 'success');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleIntervalChange = (val: number) => {
    setSyncInterval(val);
    setCountdown(val);
    localStorage.setItem('fcs_workers_sync_sec', String(val));
  };

  // Filters state with support for URL query params and routeParams
  const initialSearch = searchParams.get('search') || routeParams.search || '';
  const initialStatus = searchParams.get('status') || routeParams.status || 'ALL';
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [officeFilter, setOfficeFilter] = useState('ALL');
  const [recruiterFilter, setRecruiterFilter] = useState('ALL');
  const [partnerFilter, setPartnerFilter] = useState('ALL');

  // Metadata dropdowns
  const [offices, setOffices] = useState<Office[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [offRes, stRes, ptRes] = await Promise.all([
          api.getOffices(),
          api.getStaff(),
          api.getPartners(),
        ]);
        if (offRes.data) setOffices(offRes.data);
        if (stRes.data) setStaff(stRes.data);
        if (ptRes.data) setPartners(ptRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadMetadata();
  }, []);

  useEffect(() => {
    const sStatus = searchParams.get('status') || routeParams.status;
    if (sStatus) {
      setStatusFilter(sStatus);
    }
    const sSearch = searchParams.get('search') || routeParams.search;
    if (sSearch) {
      setSearch(sSearch);
    }
  }, [searchParams, routeParams]);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const res = await api.getWorkers({
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        officeId: officeFilter !== 'ALL' ? officeFilter : undefined,
        recruiterId: recruiterFilter !== 'ALL' ? recruiterFilter : undefined,
        partnerId: partnerFilter !== 'ALL' ? partnerFilter : undefined,
      });
      if (res.data) {
        setWorkers(res.data);
      }
    } catch (err: any) {
      showNotification('Không thể tải danh sách lao động', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [search, statusFilter, officeFilter, recruiterFilter, partnerFilter, refreshKey]);

  const hasActiveFilters =
    search || statusFilter !== 'ALL' || officeFilter !== 'ALL' || recruiterFilter !== 'ALL' || partnerFilter !== 'ALL';

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setOfficeFilter('ALL');
    setRecruiterFilter('ALL');
    setPartnerFilter('ALL');
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-200">
      {/* 1. COMPACT HEADER BAR: Title + Tenant + Count + Actions in ONE sleek row */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Quản lý hồ sơ lao động</span>
          </h1>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
            {currentUser.tenantId || 'FCS-000001'}
          </span>
          <span className="text-xs font-medium text-slate-500 hidden sm:inline">
            • <strong className="text-slate-700">{workers.length}</strong> hồ sơ
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* Bộ hẹn giờ tự động đồng bộ Google Sheets */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 px-2 py-1 rounded-md border border-slate-200 text-xs">
            <Clock className="w-3 h-3 text-slate-500" />
            <select
              value={syncInterval}
              onChange={e => handleIntervalChange(Number(e.target.value))}
              className="bg-transparent text-[11px] font-semibold text-slate-700 focus:outline-none cursor-pointer"
              title="Tần suất đồng bộ tự động với Google Sheets"
            >
              <option value={0}>Đồng bộ: Tắt</option>
              <option value={30}>Tự đồng bộ: 30s</option>
              <option value={60}>Tự đồng bộ: 1 phút</option>
              <option value={180}>Tự đồng bộ: 3 phút</option>
              <option value={300}>Tự đồng bộ: 5 phút</option>
            </select>
            {syncInterval > 0 && (
              <span className="font-mono text-[10px] font-extrabold text-blue-700 bg-white px-1.5 py-0.2 rounded border border-blue-200">
                {countdown}s
              </span>
            )}
          </div>

          {/* Nút Đồng bộ ngay */}
          <button
            onClick={handleInstantSync}
            disabled={isSyncing || loading}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            title="Đồng bộ 2 chiều dữ liệu ngay lập tức với Google Sheets"
          >
            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden md:inline">{isSyncing ? 'ĐANG ĐỒNG BỘ...' : 'ĐỒNG BỘ NGAY'}</span>
          </button>
          <button
            onClick={() => navigateTo('/app/grid')}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-bold transition-colors cursor-pointer shadow-xs"
            title="Mở giao diện Bảng tính Lưới Excel toàn màn hình"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
            <span className="hidden sm:inline">LƯỚI EXCEL (GRID)</span>
            <span className="sm:hidden">GRID</span>
          </button>
          {hasPermission(currentUser, 'WORKER_EXPORT_EXCEL') && (
            <button
              onClick={() => setShowExcelModal(true)}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md text-xs font-bold transition-colors cursor-pointer"
              title="Đồng bộ file Excel Foxconn 22 cột (Nhập / Xuất)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
              <span className="hidden sm:inline">EXCEL FOXCONN (22 CỘT)</span>
              <span className="sm:hidden">EXCEL</span>
            </button>
          )}
          {hasPermission(currentUser, 'WORKER_CREATE') && (
            <button
              onClick={() => setShowCreateWorkerModal(true)}
              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-md shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>THÊM LAO ĐỘNG</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. COMPACT SEARCH & FILTER TOOLBAR */}
      <div className="bg-white border border-slate-200 rounded-xl p-2.5 sm:p-3 shadow-2xs space-y-2">
        {/* Row 1: Search + Quick Pills */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo Mã (WK-...), Họ tên, SĐT hoặc CCCD..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-0.5 pt-0.5 text-xs font-semibold no-scrollbar">
            {[
              { key: 'ALL', label: 'Tất cả' },
              { key: 'NEW', label: 'C3 Mới' },
              { key: 'ASSIGNED_TO_SALE', label: 'L1 Chia Sale' },
              { key: 'INTERVIEW_PENDING', label: 'L2 Chờ PV' },
              { key: 'PASSED', label: 'L2.1 Đã đậu' },
              { key: 'WORKING', label: 'L3 Đang làm' },
              { key: 'QUIT', label: 'L3.1 Nghỉ' },
              { key: 'FEE_EXPIRED', label: 'L4 Hết hạn phí' },
            ].map(pill => (
              <button
                key={pill.key}
                onClick={() => setStatusFilter(pill.key)}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap text-[11px] transition-colors cursor-pointer shrink-0 ${
                  statusFilter === pill.key
                    ? 'bg-blue-600 text-white font-bold shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: 4 Secondary Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả trạng thái</option>
            {Object.entries(WORKER_STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={officeFilter}
            onChange={e => setOfficeFilter(e.target.value)}
            className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả văn phòng</option>
            {offices.map(off => (
              <option key={off.id} value={off.id}>{off.name}</option>
            ))}
          </select>

          <select
            value={recruiterFilter}
            onChange={e => setRecruiterFilter(e.target.value)}
            className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả tuyển dụng</option>
            {staff.map(st => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>

          <select
            value={partnerFilter}
            onChange={e => setPartnerFilter(e.target.value)}
            className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả xưởng / đối tác</option>
            {partners.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
            <span className="text-slate-500 font-medium">Đang lọc kết quả</span>
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
            >
              Xóa lọc
            </button>
          </div>
        )}
      </div>

      {/* Main Workers Table */}
      <WorkerTable
        workers={workers}
        onSelectWorker={workerId => navigateTo(`/app/workers/${workerId}`)}
        onEditWorker={worker => setEditingWorker(worker)}
        onPrintWorker={() => window.print()}
        onSyncWorker={async () => {
          await fetchWorkers();
          showNotification('Đã đồng bộ hồ sơ từ Google Sheets thành công!', 'success');
        }}
        onReactivateWorker={worker => setReactivatingWorker(worker)}
        onCareWorker={worker => navigateTo(`/app/workers/${worker.workerId}?tab=care`)}
        loading={loading}
      />

      {/* Excel Foxconn Modal */}
      <ExcelSyncModal
        isOpen={showExcelModal}
        onClose={() => setShowExcelModal(false)}
        workers={workers}
        onImportSuccess={fetchWorkers}
      />

      {/* Modal Chỉnh sửa hồ sơ & Đồng bộ 2 chiều */}
      {editingWorker && (
        <EditWorkerModal
          isOpen={!!editingWorker}
          worker={editingWorker}
          onClose={() => setEditingWorker(null)}
          onSuccess={() => {
            setEditingWorker(null);
            fetchWorkers();
            showNotification('Đã cập nhật và đồng bộ 2 chiều hồ sơ lao động lên Google Sheets thành công!', 'success');
          }}
        />
      )}

      {/* Modal Mời Tái Kích Hoạt Cựu Lao Động (0đ Marketing Zalo) */}
      {reactivatingWorker && (
        <ReactivationInviteModal
          isOpen={!!reactivatingWorker}
          worker={reactivatingWorker}
          partners={partners}
          onClose={() => setReactivatingWorker(null)}
          onSuccess={note => {
            setReactivatingWorker(null);
            fetchWorkers();
            showNotification(`Đã ghi nhận kết quả tái kích hoạt lao động: ${note}`, 'success');
          }}
        />
      )}
    </div>
  );
};
