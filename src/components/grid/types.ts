import React from 'react';

export type ColumnGroup = 'identity' | 'contact' | 'workplace' | 'pipeline' | 'finance';

export interface ColumnDef {
  key: string;
  label: string;
  group: ColumnGroup;
  width: number;
  minWidth: number;
  maxWidth?: number;
  pinned?: boolean;
  visible: boolean;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (val: any, row: any, index: number) => React.ReactNode;
}

export interface GridPreferences {
  columnWidths: Record<string, number>;
  visibleColumns: string[];
  columnOrder: string[];
  density: 'compact' | 'normal' | 'relaxed';
  pageSize: number;
}

export interface GridFilterState {
  search: string;
  fromDate: string;
  toDate: string;
  branch: string;
  company: string;
  status: string;
}

export const COLUMN_GROUP_LABELS: Record<ColumnGroup, string> = {
  identity: '1. Định danh nhân thân (VNeID)',
  contact: '2. Thông tin liên lạc & Địa chỉ',
  workplace: '3. Phân bổ Xưởng & Chi nhánh',
  pipeline: '4. Tiến độ tuyển dụng & Phỏng vấn',
  finance: '5. Tài chính, BHXH & VWW'
};
