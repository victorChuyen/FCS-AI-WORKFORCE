import { useState, useEffect, useCallback } from 'react';
import { ColumnDef, GridPreferences } from './types';

const STORAGE_KEY_PREFIX = 'FCS_EXCEL_GRID_PREFS_';

export function useGridPreferences(gridId: string, defaultColumns: ColumnDef[]) {
  const storageKey = STORAGE_KEY_PREFIX + gridId;

  // Lấy trạng thái lưu trữ từ LocalStorage
  const [prefs, setPrefs] = useState<GridPreferences>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          columnWidths: parsed.columnWidths || {},
          visibleColumns: Array.isArray(parsed.visibleColumns)
            ? parsed.visibleColumns
            : defaultColumns.filter(c => c.visible).map(c => c.key),
          columnOrder: Array.isArray(parsed.columnOrder)
            ? parsed.columnOrder
            : defaultColumns.map(c => c.key),
          density: parsed.density || 'compact',
          pageSize: parsed.pageSize || 50,
        };
      }
    } catch (e) {
      console.error('Lỗi đọc LocalStorage Grid Prefs:', e);
    }

    return {
      columnWidths: {},
      visibleColumns: defaultColumns.filter(c => c.visible).map(c => c.key),
      columnOrder: defaultColumns.map(c => c.key),
      density: 'compact',
      pageSize: 50,
    };
  });

  // Tự động lưu LocalStorage mỗi khi prefs thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(prefs));
    } catch (e) {
      console.error('Lỗi lưu LocalStorage Grid Prefs:', e);
    }
  }, [prefs, storageKey]);

  // Cập nhật độ rộng cột (Column Resizing)
  const setColumnWidth = useCallback((key: string, width: number) => {
    setPrefs(prev => ({
      ...prev,
      columnWidths: {
        ...prev.columnWidths,
        [key]: Math.round(width)
      }
    }));
  }, []);

  // Đổi thứ tự cột (Column Reordering)
  const reorderColumns = useCallback((sourceKey: string, targetKey: string) => {
    setPrefs(prev => {
      const currentOrder = [...prev.columnOrder];
      const fromIndex = currentOrder.indexOf(sourceKey);
      const toIndex = currentOrder.indexOf(targetKey);
      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return prev;

      currentOrder.splice(fromIndex, 1);
      currentOrder.splice(toIndex, 0, sourceKey);

      return {
        ...prev,
        columnOrder: currentOrder
      };
    });
  }, []);

  // Bật / tắt hiển thị cột (Column Visibility)
  const toggleColumnVisibility = useCallback((key: string) => {
    setPrefs(prev => {
      const isVisible = prev.visibleColumns.includes(key);
      const nextVisible = isVisible
        ? prev.visibleColumns.filter(k => k !== key)
        : [...prev.visibleColumns, key];

      // Đảm bảo không cho ẩn hết 100% cột
      if (nextVisible.length === 0) return prev;

      return {
        ...prev,
        visibleColumns: nextVisible
      };
    });
  }, []);

  // Hiện tất cả cột
  const showAllColumns = useCallback(() => {
    setPrefs(prev => ({
      ...prev,
      visibleColumns: defaultColumns.map(c => c.key)
    }));
  }, [defaultColumns]);

  // Khôi phục mặc định
  const resetToDefault = useCallback(() => {
    const defaultPrefs: GridPreferences = {
      columnWidths: {},
      visibleColumns: defaultColumns.filter(c => c.visible).map(c => c.key),
      columnOrder: defaultColumns.map(c => c.key),
      density: 'compact',
      pageSize: 50
    };
    setPrefs(defaultPrefs);
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {}
  }, [defaultColumns, storageKey]);

  // Đổi Page Size
  const setPageSize = useCallback((size: number) => {
    setPrefs(prev => ({ ...prev, pageSize: size }));
  }, []);

  // Đổi Density
  const setDensity = useCallback((density: 'compact' | 'normal' | 'relaxed') => {
    setPrefs(prev => ({ ...prev, density }));
  }, []);

  // Tính toán danh sách cột hiển thị theo thứ tự & độ rộng đã lưu
  const computedColumns: ColumnDef[] = prefs.columnOrder
    .map(key => {
      const baseCol = defaultColumns.find(c => c.key === key);
      if (!baseCol) return null;
      return {
        ...baseCol,
        visible: prefs.visibleColumns.includes(key),
        width: prefs.columnWidths[key] || baseCol.width
      };
    })
    .filter(Boolean) as ColumnDef[];

  return {
    prefs,
    columns: computedColumns,
    setColumnWidth,
    reorderColumns,
    toggleColumnVisibility,
    showAllColumns,
    resetToDefault,
    setPageSize,
    setDensity
  };
}
