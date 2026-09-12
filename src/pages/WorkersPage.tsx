import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Worker, Office, Staff, Partner, WorkerStatus } from '../types';
import { WorkerTable } from '../components/workers/WorkerTable';
import { WORKER_STATUS_LABELS } from '../utils/formatters';
import { Search, Plus, Filter, X, RefreshCw, UserCheck, Briefcase } from 'lucide-react';

export const WorkersPage: React.FC = () => {
  const { navigateTo, routeParams, refreshKey, setShowCreateWorkerModal, showNotification, currentUser } = useApp();

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(routeParams.search || '');
  const [statusFilter, setStatusFilter] = useState(routeParams.status || 'ALL');
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
    if (routeParams.status) {
      setStatusFilter(routeParams.status);
    }
    if (routeParams.search) {
      setSearch(routeParams.search);
    }
  }, [routeParams]);

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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5">
            <span className="font-extrabold text-blue-700 uppercase tracking-wider">Hồ sơ lao động</span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
              {currentUser.tenantId || 'FCS-000001'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-medium">{workers.length} hồ sơ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Quản lý hồ sơ lao động
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tra cứu nhanh theo Worker ID, Họ tên, Số điện thoại hoặc số CCCD trong cơ sở dữ liệu riêng của doanh nghiệp.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchWorkers}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowCreateWorkerModal(true)}
            className="inline-flex items-center space-x-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">THÊM LAO ĐỘNG</span>
            <span className="sm:hidden">LAO ĐỘNG</span>
          </button>
        </div>
      </div>

      {/* Search Bar and 4 Filter Dropdowns */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo Mã Worker ID (WK-...), Họ và tên, Số điện thoại hoặc CCCD..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Filter Pills (Horizontally scrollable for mobile & PC) */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 pt-0.5 text-xs font-semibold no-scrollbar">
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'INTERVIEW_PENDING', label: 'Chờ phỏng vấn' },
            { key: 'PASSED', label: 'Đã đậu' },
            { key: 'WAITING_START', label: 'Chờ đi làm' },
            { key: 'WORKING', label: 'Đang làm việc' },
            { key: 'QUIT', label: 'Nghỉ việc' },
          ].map(pill => (
            <button
              key={pill.key}
              onClick={() => setStatusFilter(pill.key)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs transition-colors cursor-pointer shrink-0 min-h-[34px] flex items-center ${
                statusFilter === pill.key
                  ? 'bg-blue-600 text-white font-bold shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* 4 Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {/* Status filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full text-xs py-2 px-2.5 bg-white border border-slate-200 rounded-md text-slate-800 focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Tất cả trạng thái</option>
              {Object.entries(WORKER_STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Office filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Văn phòng
            </label>
            <select
              value={officeFilter}
              onChange={e => setOfficeFilter(e.target.value)}
              className="w-full text-xs py-2 px-2.5 bg-white border border-slate-200 rounded-md text-slate-800 focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Tất cả văn phòng</option>
              {offices.map(off => (
                <option key={off.id} value={off.id}>
                  {off.name}
                </option>
              ))}
            </select>
          </div>

          {/* Recruiter filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Tuyển dụng phụ trách
            </label>
            <select
              value={recruiterFilter}
              onChange={e => setRecruiterFilter(e.target.value)}
              className="w-full text-xs py-2 px-2.5 bg-white border border-slate-200 rounded-md text-slate-800 focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Tất cả nhân viên</option>
              {staff.map(st => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.officeName.replace('Văn phòng ', '')})
                </option>
              ))}
            </select>
          </div>

          {/* Partner filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Đối tác / Xưởng
            </label>
            <select
              value={partnerFilter}
              onChange={e => setPartnerFilter(e.target.value)}
              className="w-full text-xs py-2 px-2.5 bg-white border border-slate-200 rounded-md text-slate-800 focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Tất cả đối tác</option>
              {partners.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">Đang áp dụng bộ lọc</span>
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Main Workers Table */}
      <WorkerTable
        workers={workers}
        onSelectWorker={workerId => navigateTo(`/workers/${workerId}`)}
        loading={loading}
      />
    </div>
  );
};
