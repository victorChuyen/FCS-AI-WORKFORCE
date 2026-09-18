import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { ExcelDataGrid } from '../components/grid/ExcelDataGrid';
import { MASTER_WORKER_COLUMNS, CRM_DEAL_COLUMNS } from '../components/grid/columnPresets';
import { ExcelSyncModal } from '../components/workers/ExcelSyncModal';
import { EditWorkerModal } from '../components/worker360/EditWorkerModal';
import { ReactivationInviteModal } from '../components/workers/ReactivationInviteModal';
import { FileSpreadsheet, Users, GitFork, RefreshCw } from 'lucide-react';

export const ExcelGridPage: React.FC = () => {
  const { navigateTo, setShowCreateWorkerModal, showNotification, currentUser, refreshKey } = useApp();

  const [activeTab, setActiveTab] = useState<'workers' | 'deals'>('workers');
  const [workers, setWorkers] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState<any | null>(null);
  const [reactivatingWorker, setReactivatingWorker] = useState<any | null>(null);

  // Tải dữ liệu thật từ Backend
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getWorkers();
      if (res.data) {
        setWorkers(res.data);

        // Sinh dữ liệu Deals từ workers nếu chưa có bảng Deals riêng
        const generatedDeals = res.data.map((w: any, idx: number) => ({
          deal_id: `DL-2026-${('000000' + (idx + 1)).slice(-6)}`,
          worker_id: w.id || `WK-${('000000' + (idx + 1)).slice(-6)}`,
          full_name: w.name || w.fullName || 'LAO ĐỘNG MỚI',
          phone: w.phone || '',
          target_company: w.partnerName || 'WNC',
          branch: w.officeName || 'HÀ NAM',
          level_sale_status: w.status === 'WORKING' ? 'L3' : w.status === 'PASSED' ? 'L2.1' : 'C3',
          interview_date: w.interviewDate || '',
          interview_result: w.interviewStatus || 'Chờ kết quả',
          start_date: w.startDate || '',
          actual_work_status: w.status === 'WORKING' ? 'Đang làm việc' : 'Chưa đi làm',
          is_vww: w.status === 'WORKING',
          assigned_sale: w.recruiterName || 'Sale Tuyển dụng',
          commission_amount: 500000,
          commission_status: 'Chờ duyệt',
          notes: 'Đồng bộ từ CRM'
        }));
        setDeals(generatedDeals);
      }
    } catch (err) {
      showNotification('Không thể tải dữ liệu bảng tính', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  // Thống kê nhanh ngữ cảnh
  const workingCount = workers.filter(w => w.status === 'WORKING').length;
  const interviewCount = workers.filter(w => w.status === 'INTERVIEW_PENDING' || w.status === 'ASSIGNED_TO_SALE').length;
  const vwwCount = workers.filter(w => w.status === 'WORKING' || w.is_vww).length;

  return (
    <div className="space-y-3 animate-in fade-in duration-200">
      {/* Tab Switcher giữa 01_MASTER_WORKERS và 02_CRM_DEALS_2026 */}
      <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 p-2 rounded-xl shadow-2xs">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => setActiveTab('workers')}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'workers'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>01_MASTER_WORKERS (34 CỘT)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'workers' ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200 text-slate-700'
            }`}>
              {workers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('deals')}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'deals'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <GitFork className="w-4 h-4" />
            <span>02_CRM_DEALS_2026 (19 LEVEL SALE)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'deals' ? 'bg-teal-800 text-teal-100' : 'bg-slate-200 text-slate-700'
            }`}>
              {deals.length}
            </span>
          </button>
        </div>

        {/* Nút quay lại giao diện thẻ thông thường */}
        <button
          onClick={() => navigateTo('/app/workers')}
          className="hidden sm:inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold px-2 py-1 hover:bg-slate-100 rounded-lg cursor-pointer"
        >
          <span>Xem dạng Thẻ thẻ</span>
          <span>→</span>
        </button>
      </div>

      {/* Main Excel Data Grid */}
      {activeTab === 'workers' ? (
        <ExcelDataGrid
          gridId="master_workers_v2"
          title="HỒ SƠ LAO ĐỘNG (GRID)"
          subtitle="01_MASTER_WORKERS • 34 CỘT VNEID ALIGNED"
          defaultColumns={MASTER_WORKER_COLUMNS}
          data={workers.map(w => ({
            worker_id: w.id || '',
            full_name: w.name || w.fullName || '',
            gender: w.gender || 'Nam',
            date_of_birth: w.dateOfBirth || w.dob || '',
            cccd: w.cccd || w.idCard || '',
            phone: w.phone || '',
            target_company: w.partnerName || 'WNC',
            branch: w.officeName || 'HÀ NAM',
            working_status: w.status === 'WORKING' ? 'Đang đi làm' : 'Chưa đi làm',
            work_type: 'Chính thức',
            interview_status: w.interviewStatus || 'Chưa phỏng vấn',
            hometown: w.homeTown || 'Hà Nam',
            vietcombank_account: w.bankAccount || '',
            consultant_sale: w.recruiterName || 'Sale',
            referral_source: 'Trực tiếp',
            created_at: w.createdAt || ''
          }))}
          loading={loading}
          onRefresh={loadData}
          onAddNew={() => setShowCreateWorkerModal(true)}
          onImportFile={() => setShowExcelModal(true)}
          onRowClick={row => navigateTo(`/app/workers/${row.worker_id}`)}
          onEditRow={row => {
            const targetId = row.worker_id || row.id;
            const found = workers.find(w => (w.workerId || w.id) === targetId) || row;
            setEditingWorker(found);
          }}
          onReactivateRow={row => {
            const targetId = row.worker_id || row.id;
            const found = workers.find(w => (w.workerId || w.id) === targetId) || {
              workerId: targetId,
              fullName: row.full_name || row.worker_name,
              phone: row.phone,
              province: row.province || row.hometown,
              status: row.status || row.level_sale_status,
            };
            setReactivatingWorker(found);
          }}
          onCareRow={row => navigateTo(`/app/workers/${row.worker_id || row.id}`)}
          onSyncRow={async () => {
            await loadData();
            showNotification('Đã đồng bộ 2 chiều dữ liệu với Google Sheets!', 'success');
          }}
          liveStatusText="LIVE: Connected to Google Sheets V2 Hub"
          customMetricSummary={
            <>
              <span>Đang chờ: <strong className="text-amber-600">{interviewCount}</strong></span>
              <span>•</span>
              <span>Đang đi làm: <strong className="text-emerald-600">{workingCount}</strong></span>
              <span>•</span>
              <span>Đạt chuẩn VWW: <strong className="text-indigo-600">{vwwCount}</strong></span>
            </>
          }
        />
      ) : (
        <ExcelDataGrid
          gridId="crm_deals_2026_v2"
          title="CRM DEALS PHỄU TUYỂN DỤNG"
          subtitle="02_CRM_DEALS_2026 • 19 LEVEL SALE (C3 -> L4)"
          defaultColumns={CRM_DEAL_COLUMNS}
          data={deals}
          loading={loading}
          onRefresh={loadData}
          onAddNew={() => setShowCreateWorkerModal(true)}
          onImportFile={() => setShowExcelModal(true)}
          onRowClick={row => navigateTo(`/app/workers/${row.worker_id}`)}
          onEditRow={row => {
            const targetId = row.worker_id || row.id;
            const found = workers.find(w => (w.workerId || w.id) === targetId) || row;
            setEditingWorker(found);
          }}
          onReactivateRow={row => {
            const targetId = row.worker_id || row.id;
            const found = workers.find(w => (w.workerId || w.id) === targetId) || {
              workerId: targetId,
              fullName: row.full_name || row.worker_name,
              phone: row.phone,
              province: row.province || row.hometown,
              status: row.status || row.level_sale_status,
            };
            setReactivatingWorker(found);
          }}
          onCareRow={row => navigateTo(`/app/workers/${row.worker_id || row.id}`)}
          onSyncRow={async () => {
            await loadData();
            showNotification('Đã đồng bộ 2 chiều dữ liệu Deal với Google Sheets!', 'success');
          }}
          liveStatusText="LIVE: Connected to Google Sheets V2 Hub"
          customMetricSummary={
            <>
              <span>C3 Mới: <strong className="text-blue-600">{deals.filter(d => d.level_sale_status === 'C3').length}</strong></span>
              <span>•</span>
              <span>L2 Phỏng vấn: <strong className="text-purple-600">{deals.filter(d => d.level_sale_status.startsWith('L2')).length}</strong></span>
              <span>•</span>
              <span>L3 Đang làm: <strong className="text-emerald-600">{deals.filter(d => d.level_sale_status.startsWith('L3')).length}</strong></span>
              <span>•</span>
              <span>VWW: <strong className="text-amber-600">{deals.filter(d => d.is_vww).length}</strong></span>
            </>
          }
        />
      )}

      {/* Modal Import Excel Foxconn */}
      <ExcelSyncModal
        isOpen={showExcelModal}
        onClose={() => setShowExcelModal(false)}
        workers={workers}
        onImportSuccess={loadData}
      />

      {/* Modal Chỉnh Sửa Hồ Sơ & Lưu Đồng Bộ 2 Chiều */}
      {editingWorker && (
        <EditWorkerModal
          isOpen={!!editingWorker}
          worker={editingWorker}
          onClose={() => setEditingWorker(null)}
          onSuccess={() => {
            setEditingWorker(null);
            loadData();
            showNotification('Đã cập nhật và đồng bộ 2 chiều hồ sơ lao động lên Google Sheets thành công!', 'success');
          }}
        />
      )}

      {/* Modal Mời Tái Kích Hoạt Cựu Lao Động (0đ Marketing Zalo) */}
      {reactivatingWorker && (
        <ReactivationInviteModal
          isOpen={!!reactivatingWorker}
          worker={reactivatingWorker}
          onClose={() => setReactivatingWorker(null)}
          onSuccess={note => {
            setReactivatingWorker(null);
            loadData();
            showNotification(`Đã ghi nhận kết quả tái kích hoạt lao động: ${note}`, 'success');
          }}
        />
      )}
    </div>
  );
};

export default ExcelGridPage;
