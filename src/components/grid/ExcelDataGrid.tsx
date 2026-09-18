import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Search, Calendar, RefreshCw, Download, Printer, Filter,
  Columns, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Plus, FileSpreadsheet, Check, ArrowUpDown, ArrowUp, ArrowDown,
  Maximize2, Minimize2, SlidersHorizontal, CheckCircle2, Clock,
  Edit3, Timer, Sparkles, HeartHandshake
} from 'lucide-react';
import { ColumnDef, ColumnGroup, COLUMN_GROUP_LABELS } from './types';
import { useGridPreferences } from './useGridPreferences';

interface ExcelDataGridProps {
  gridId: string;
  title?: string;
  subtitle?: string;
  defaultColumns: ColumnDef[];
  data: any[];
  totalRows?: number;
  loading?: boolean;
  onRefresh?: () => void;
  onAddNew?: () => void;
  onImportFile?: () => void;
  onExportFile?: () => void;
  onRowClick?: (row: any) => void;
  onEditRow?: (row: any) => void;
  onPrintRow?: (row: any) => void;
  onSyncRow?: (row: any) => Promise<void> | void;
  onReactivateRow?: (row: any) => void;
  onCareRow?: (row: any) => void;
  hasActionColumn?: boolean;
  liveStatusText?: string;
  customMetricSummary?: React.ReactNode;
}

export const ExcelDataGrid: React.FC<ExcelDataGridProps> = ({
  gridId,
  title = 'HỒ SƠ LAO ĐỘNG (GRID)',
  subtitle = 'V2.1 • DATA EXPLORER',
  defaultColumns,
  data,
  totalRows: customTotalRows,
  loading = false,
  onRefresh,
  onAddNew,
  onImportFile,
  onExportFile,
  onRowClick,
  onEditRow,
  onPrintRow,
  onSyncRow,
  onReactivateRow,
  onCareRow,
  hasActionColumn = true,
  liveStatusText = 'LIVE: Connected to System Hub',
  customMetricSummary,
}) => {
  // Auto-Sync Interval Timer (0 = manual, 30s, 60s, 180s, 300s)
  const [syncInterval, setSyncInterval] = useState<number>(() => {
    const saved = localStorage.getItem(`fcs_grid_sync_sec_${gridId}`);
    return saved !== null ? parseInt(saved, 10) : 60;
  });
  const [countdown, setCountdown] = useState<number>(syncInterval);
  const [lastSyncedTime, setLastSyncedTime] = useState<Date>(new Date());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    if (syncInterval <= 0) return;
    setCountdown(syncInterval);

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (onRefresh) {
            setIsSyncing(true);
            Promise.resolve(onRefresh())
              .then(() => setLastSyncedTime(new Date()))
              .finally(() => setIsSyncing(false));
          }
          return syncInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [syncInterval, onRefresh]);

  const handleInstantSync = async () => {
    if (onRefresh) {
      setIsSyncing(true);
      try {
        await Promise.resolve(onRefresh());
        setLastSyncedTime(new Date());
        if (syncInterval > 0) setCountdown(syncInterval);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleIntervalChange = (val: number) => {
    setSyncInterval(val);
    setCountdown(val);
    localStorage.setItem(`fcs_grid_sync_sec_${gridId}`, String(val));
  };

  // 1. Quản lý Tùy biến cột (Lưu LocalStorage)
  const {
    prefs,
    columns,
    setColumnWidth,
    reorderColumns,
    toggleColumnVisibility,
    showAllColumns,
    resetToDefault,
    setPageSize,
    setDensity,
  } = useGridPreferences(gridId, defaultColumns);

  // 2. Trạng thái Tìm kiếm & Phân trang
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showColPicker, setShowColPicker] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  // Kéo thả thay đổi kích thước cột (Resizing)
  const resizingRef = useRef<{ key: string; startX: number; startWidth: number } | null>(null);

  const startResize = (colKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const currentCol = columns.find(c => c.key === colKey);
    if (!currentCol) return;

    resizingRef.current = {
      key: colKey,
      startX: e.clientX,
      startWidth: currentCol.width,
    };

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!resizingRef.current) return;
      const diff = moveEvent.clientX - resizingRef.current.startX;
      const newWidth = Math.max(
        currentCol.minWidth || 60,
        Math.min(currentCol.maxWidth || 800, resizingRef.current.startWidth + diff)
      );
      setColumnWidth(colKey, newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      resizingRef.current = null;
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Kéo thả hoán đổi thứ tự cột (Drag & Drop Reordering)
  const [draggedColKey, setDraggedColKey] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, colKey: string) => {
    setDraggedColKey(colKey);
    e.dataTransfer.setData('text/plain', colKey);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColKey: string) => {
    e.preventDefault();
    if (draggedColKey && draggedColKey !== targetColKey) {
      reorderColumns(draggedColKey, targetColKey);
    }
    setDraggedColKey(null);
  };

  // Lọc dữ liệu client-side (khi có search / date filter)
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Tìm kiếm toàn cục
      if (searchTerm.trim()) {
        const s = searchTerm.toLowerCase();
        const match = Object.values(item).some(val =>
          val !== null && val !== undefined && String(val).toLowerCase().includes(s)
        );
        if (!match) return false;
      }

      // Lọc theo ngày (nếu item có created_at / start_date)
      const dateVal = item.created_at || item.start_date || item.createdAt;
      if (dateVal) {
        const itemDate = new Date(dateVal).getTime();
        if (fromDate && itemDate < new Date(fromDate).getTime()) return false;
        if (toDate && itemDate > new Date(toDate).getTime() + 86400000) return false;
      }

      return true;
    });
  }, [data, searchTerm, fromDate, toDate]);

  // Sắp xếp dữ liệu
  const sortedData = useMemo(() => {
    if (!sortCol) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = a[sortCol];
      const valB = b[sortCol];
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
  }, [filteredData, sortCol, sortAsc]);

  // Phân trang
  const totalItems = customTotalRows !== undefined ? customTotalRows : sortedData.length;
  const pageSize = prefs.pageSize || 50;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validPage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    // Nếu backend đã phân trang thì render trực tiếp sortedData, nếu chưa thì slice
    if (customTotalRows !== undefined && sortedData.length <= pageSize) {
      return sortedData;
    }
    const start = (validPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, validPage, pageSize, customTotalRows]);

  const handleSort = (key: string) => {
    if (sortCol === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(key);
      setSortAsc(true);
    }
  };

  // Chỉ lấy các cột đang được bật hiển thị
  const visibleColumns = useMemo(() => columns.filter(c => c.visible), [columns]);

  // Nhóm cột theo group để hiển thị trong Popover Chooser
  const columnsByGroup = useMemo(() => {
    const groups: Record<ColumnGroup, ColumnDef[]> = {
      identity: [],
      contact: [],
      workplace: [],
      pipeline: [],
      finance: [],
    };
    defaultColumns.forEach(c => {
      if (groups[c.group]) groups[c.group].push(c);
      else groups.identity.push(c);
    });
    return groups;
  }, [defaultColumns]);

  // Mật độ dòng (Padding)
  const rowHeightClass =
    prefs.density === 'compact' ? 'py-1.5' : prefs.density === 'normal' ? 'py-2.5' : 'py-3.5';

  return (
    <div
      className={`flex flex-col bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden ${
        isFullScreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full'
      }`}
      style={{ minHeight: isFullScreen ? '100vh' : '680px' }}
    >
      {/* ──────────────────────────────────────────────────────────── */}
      {/* 1. HEADER RIBBON TOOLBAR (Chuẩn ảnh mẫu Phiếu Cân Grid V.52) */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 select-none">
        {/* Khối Title & Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{title}</span>
            </h1>
            <p className="text-[11px] font-mono text-slate-500 font-semibold tracking-wider uppercase">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Khối Toolbar trung tâm: Tìm kiếm, Ngày tháng, Icons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Ô tìm kiếm toàn cục */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm mọi dữ liệu..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-lg w-52 sm:w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
            />
          </div>

          {/* Bộ lọc khoảng ngày */}
          <div className="hidden md:flex items-center gap-1.5 text-xs bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500 font-bold text-[11px]">TỪ:</span>
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="bg-transparent text-slate-700 outline-none text-xs"
            />
            <span className="text-slate-400">➔</span>
            <span className="text-slate-500 font-bold text-[11px]">ĐẾN:</span>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="bg-transparent text-slate-700 outline-none text-xs"
            />
          </div>

          {/* Cụm Action Icons & Đồng Bộ 2 Chiều: Instant Sync, Auto Timer, Export, Print, Column Chooser */}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-2">
            {/* Nút Đồng bộ ngay tức thì */}
            <button
              onClick={handleInstantSync}
              disabled={isSyncing || loading}
              title={`Đồng bộ 2 chiều tức thì với Google Sheets. Cập nhật cuối: ${lastSyncedTime.toLocaleTimeString('vi-VN')}`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing || loading ? 'animate-spin text-emerald-600' : 'text-emerald-700'}`} />
              <span className="hidden sm:inline">ĐỒNG BỘ NGAY</span>
            </button>

            {/* Bộ hẹn giờ tự động đồng bộ */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs">
              <Timer className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={syncInterval}
                onChange={e => handleIntervalChange(Number(e.target.value))}
                title="Tần suất tự động đồng bộ 2 chiều dữ liệu từ Google Sheets"
                className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value={0}>⏹️ Tắt tự động</option>
                <option value={30}>⏱️ Tự động: 30s</option>
                <option value={60}>⏱️ Tự động: 1 phút</option>
                <option value={180}>⏱️ Tự động: 3 phút</option>
                <option value={300}>⏱️ Tự động: 5 phút</option>
              </select>
              {syncInterval > 0 && (
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/90 px-1.5 py-0.2 rounded-full border border-emerald-300" title={`Lần đồng bộ kế tiếp sau ${countdown} giây`}>
                  {countdown}s
                </span>
              )}
            </div>

            {onExportFile && (
              <button
                onClick={onExportFile}
                title="Xuất file Excel / CSV"
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => window.print()}
              title="In bảng dữ liệu"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Nút Ẩn/Hiện Cột (Column Chooser Popover) */}
            <div className="relative">
              <button
                onClick={() => setShowColPicker(!showColPicker)}
                title="Tùy chỉnh ẩn/hiện cột"
                className={`p-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold ${
                  showColPicker
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Columns className="w-4 h-4" />
              </button>

              {/* Popover Menu Checkbox */}
              {showColPicker && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                    <span className="text-xs font-bold text-slate-900">
                      TÙY CHỌN CỘT ({visibleColumns.length}/{columns.length})
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={showAllColumns}
                        className="text-[10px] text-emerald-600 hover:underline font-bold"
                      >
                        Hiện hết
                      </button>
                      <span>•</span>
                      <button
                        onClick={resetToDefault}
                        className="text-[10px] text-rose-600 hover:underline font-bold"
                      >
                        Mặc định
                      </button>
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-3 pr-1 text-xs">
                    {(Object.keys(columnsByGroup) as ColumnGroup[]).map(grpKey => {
                      const grpCols = columnsByGroup[grpKey];
                      if (!grpCols || grpCols.length === 0) return null;

                      return (
                        <div key={grpKey} className="space-y-1">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            {COLUMN_GROUP_LABELS[grpKey]}
                          </p>
                          <div className="space-y-1 pl-1">
                            {grpCols.map(c => {
                              const isChecked = prefs.visibleColumns.includes(c.key);
                              return (
                                <label
                                  key={c.key}
                                  className="flex items-center gap-2 py-0.5 text-slate-700 hover:text-slate-900 cursor-pointer select-none"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleColumnVisibility(c.key)}
                                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                                  />
                                  <span className="text-xs truncate font-medium">{c.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Khối Badges Ticker & Nút Hành động */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Badge ROWS & DONE như ảnh mẫu */}
          <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1 bg-slate-50">
            <div className="flex flex-col text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">ROWS</span>
              <span className="text-xs font-black text-emerald-700">{totalItems}</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex flex-col text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">DONE</span>
              <span className="text-xs font-black text-emerald-700">
                {filteredData.filter(d => d.is_vww || d.status === 'DONE' || d.working_status === 'Đang đi làm').length}
              </span>
            </div>
          </div>

          {onImportFile && (
            <button
              onClick={onImportFile}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>NHẬP FILE</span>
            </button>
          )}

          {onAddNew && (
            <button
              onClick={onAddNew}
              className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>THÊM MỚI</span>
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg transition-colors cursor-pointer hidden lg:block"
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 2. MAIN TABLE CONTAINER (Nền Dark Navy Header #0B192C) */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto bg-white relative select-none">
        <table className="w-full border-collapse text-xs table-fixed">
          {/* Header Row */}
          <thead className="sticky top-0 z-20 bg-[#0B192C] text-white uppercase tracking-wider font-extrabold text-[11px] shadow-sm">
            <tr>
              {/* STT Cố định */}
              <th
                style={{ width: 56 }}
                className="sticky left-0 z-30 bg-[#0B192C] px-2 py-3 text-center border-r border-slate-800"
              >
                STT
              </th>

              {visibleColumns.map(col => {
                const isSorting = sortCol === col.key;
                return (
                  <th
                    key={col.key}
                    draggable
                    onDragStart={e => handleDragStart(e, col.key)}
                    onDragOver={handleDragOver}
                    onDrop={e => handleDrop(e, col.key)}
                    style={{ width: col.width }}
                    className={`relative px-3 py-3 text-left border-r border-slate-800 select-none group transition-colors hover:bg-slate-850 cursor-grab active:cursor-grabbing ${
                      col.pinned ? 'sticky left-14 z-30 bg-[#0B192C]' : ''
                    }`}
                  >
                    <div
                      onClick={() => handleSort(col.key)}
                      className="flex items-center justify-between gap-1 cursor-pointer pr-1"
                    >
                      <span className="truncate" title={col.label}>
                        {col.label}
                      </span>
                      <span className="shrink-0 text-slate-400 group-hover:text-white">
                        {isSorting ? (
                          sortAsc ? <ArrowUp className="w-3.5 h-3.5 text-emerald-400" /> : <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </span>
                    </div>

                    {/* Vạch Kéo Giãn Độ Rộng Cột (Column Resizer Handler) */}
                    <div
                      onMouseDown={e => startResize(col.key, e)}
                      onDoubleClick={() => setColumnWidth(col.key, col.minWidth || 120)}
                      title="Kéo thả để chỉnh độ rộng (nhấp đúp để đặt lại)"
                      className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-emerald-400 active:bg-emerald-500 group-hover:bg-slate-700 transition-colors z-10"
                    />
                  </th>
                );
              })}

              {/* Cột HÀNH ĐỘNG Cố định bên phải (Chuẩn ảnh mẫu Phiếu Cân Grid) */}
              {hasActionColumn && (
                <th
                  style={{ width: 110 }}
                  className="sticky right-0 z-30 bg-[#0B192C] text-center px-2 py-3 border-l border-slate-800 text-white font-extrabold text-[11px] shadow-[-6px_0_10px_-2px_rgba(0,0,0,0.3)]"
                >
                  HÀNH ĐỘNG
                </th>
              )}
            </tr>
          </thead>

          {/* Body Rows */}
          <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
            {loading ? (
              <tr>
                <td colSpan={visibleColumns.length + (hasActionColumn ? 2 : 1)} className="py-20 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-semibold">Đang nạp dữ liệu bảng tính...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + (hasActionColumn ? 2 : 1)} className="py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Filter className="w-8 h-8 text-slate-300" />
                    <span className="text-xs font-bold text-slate-600">Không tìm thấy bản ghi nào</span>
                    <span className="text-[11px] text-slate-400">Thử thay đổi từ khóa tìm kiếm hoặc xóa bộ lọc</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => {
                const globalIndex = (validPage - 1) * pageSize + rowIdx + 1;
                const isEven = rowIdx % 2 === 0;

                return (
                  <tr
                    key={row.worker_id || row.deal_id || row.id || rowIdx}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`border-b border-slate-100 hover:bg-emerald-50/50 transition-colors cursor-pointer group ${
                      isEven ? 'bg-white' : 'bg-slate-50/70'
                    }`}
                  >
                    {/* STT */}
                    <td className="px-2 py-2 text-center text-slate-400 font-mono text-[11px] border-r border-slate-100 sticky left-0 z-10 bg-inherit">
                      {globalIndex}
                    </td>

                    {/* Các cột dữ liệu */}
                    {visibleColumns.map(col => {
                      const val = row[col.key];

                      return (
                        <td
                          key={col.key}
                          style={{ width: col.width }}
                          className={`px-3 ${rowHeightClass} border-r border-slate-100 truncate text-[12px] ${
                            col.align === 'center'
                              ? 'text-center'
                              : col.align === 'right'
                              ? 'text-right font-mono'
                              : 'text-left'
                          } ${col.pinned ? 'sticky left-14 z-10 bg-inherit font-bold text-slate-900' : ''}`}
                        >
                          {col.render ? (
                            col.render(val, row, rowIdx)
                          ) : (
                            <span title={String(val || '')}>{val !== undefined && val !== null ? String(val) : '—'}</span>
                          )}
                        </td>
                      );
                    })}

                    {/* Cột HÀNH ĐỘNG Cố định bên phải (Chỉnh sửa, In, Đồng bộ 2 chiều, Tái kích hoạt 0đ, Chăm sóc) */}
                    {hasActionColumn && (
                      <td
                        className="sticky right-0 z-10 px-2 py-1.5 border-l border-slate-200 bg-white/95 group-hover:bg-emerald-50/90 backdrop-blur-xs text-center shadow-[-6px_0_10px_-2px_rgba(0,0,0,0.06)]"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center space-x-1.5">
                          {/* Nút Tái kích hoạt Zalo 0đ (nếu đủ điều kiện QUIT hoặc FEE_EXPIRED hoặc L3.1, L4) */}
                          {onReactivateRow && ['QUIT', 'FEE_EXPIRED', 'L3.1', 'L4'].some(s =>
                            String(row.status || row.level_sale_status || row.working_status || '').toUpperCase().includes(s)
                          ) && (
                            <button
                              type="button"
                              onClick={() => onReactivateRow(row)}
                              title="Tái kích hoạt cựu lao động (Marketing 0đ qua Zalo)"
                              className="p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                            </button>
                          )}

                          {/* Nút Chăm sóc Onboarding 1-3-7 ngày (nếu lao động đang đi làm) */}
                          {onCareRow && ['WORKING', 'STARTED', 'L3', 'VWW', 'ĐANG ĐI LÀM'].some(s =>
                            String(row.status || row.level_sale_status || row.working_status || '').toUpperCase().includes(s)
                          ) && (
                            <button
                              type="button"
                              onClick={() => onCareRow(row)}
                              title="Chăm sóc Onboarding AI (1-3-7 ngày)"
                              className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <HeartHandshake className="w-3.5 h-3.5 text-rose-600" />
                            </button>
                          )}

                          {/* Nút sửa */}
                          <button
                            type="button"
                            onClick={() => onEditRow ? onEditRow(row) : (onRowClick && onRowClick(row))}
                            title="Chỉnh sửa hồ sơ & Lưu đồng bộ 2 chiều"
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {/* Nút In */}
                          <button
                            type="button"
                            onClick={() => onPrintRow ? onPrintRow(row) : (onRowClick && onRowClick(row))}
                            title="In phiếu thông tin / Xem chi tiết 360"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          {/* Nút đồng bộ nhanh dòng này */}
                          <button
                            type="button"
                            onClick={async () => {
                              if (onSyncRow) await onSyncRow(row);
                              else handleInstantSync();
                            }}
                            title="Đồng bộ 2 chiều tức thì với Google Sheets"
                            className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 3. BOTTOM STATUS BAR & PAGINATION (Đúng chuẩn ảnh mẫu) */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border-t border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-slate-600 select-none">
        {/* Đèn báo LIVE */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-800 font-bold">{liveStatusText}</span>
        </div>

        {/* Thống kê ngữ cảnh ở giữa */}
        <div className="hidden lg:flex items-center gap-4 text-slate-500 text-xs">
          {customMetricSummary || (
            <>
              <span>
                Đang phỏng vấn: <strong className="text-amber-600">145</strong>
              </span>
              <span>•</span>
              <span>
                Đang đi làm: <strong className="text-emerald-600">890</strong>
              </span>
              <span>•</span>
              <span>
                Đạt chuẩn VWW: <strong className="text-indigo-600">520</strong>
              </span>
            </>
          )}
        </div>

        {/* Phân trang bên phải */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Chọn số dòng trên trang */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Hiển thị</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded px-2 py-1 font-bold text-slate-800 text-xs outline-none cursor-pointer"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={500}>500</option>
            </select>
            <span>dòng</span>
          </div>

          <span className="text-slate-500">
            Trang <strong className="text-slate-900">{validPage}</strong> / {totalPages} •{' '}
            <strong className="text-slate-800">{totalItems}</strong> dòng
          </span>

          {/* Nút lật trang */}
          <div className="flex items-center gap-0.5 bg-slate-100 border border-slate-200 rounded-lg p-0.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={validPage === 1}
              title="Trang đầu"
              className="p-1 hover:bg-white rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <ChevronsLeft className="w-3.5 h-3.5 text-slate-700" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={validPage === 1}
              title="Trang trước"
              className="p-1 hover:bg-white rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-slate-700" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={validPage >= totalPages}
              title="Trang sau"
              className="p-1 hover:bg-white rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={validPage >= totalPages}
              title="Trang cuối"
              className="p-1 hover:bg-white rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <ChevronsRight className="w-3.5 h-3.5 text-slate-700" />
            </button>
          </div>

          {/* Đổi mật độ hiển thị dòng */}
          <button
            onClick={() =>
              setDensity(
                prefs.density === 'compact'
                  ? 'normal'
                  : prefs.density === 'normal'
                  ? 'relaxed'
                  : 'compact'
              )
            }
            title={`Mật độ dòng: ${prefs.density}. Bấm để đổi.`}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 text-slate-600 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
