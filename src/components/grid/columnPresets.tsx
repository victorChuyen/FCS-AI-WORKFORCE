import React from 'react';
import { ColumnDef } from './types';
import { CheckCircle2, AlertCircle, Phone, CreditCard, Factory, MapPin } from 'lucide-react';

/**
 * Cấu hình 34 cột chuẩn Master Workers (01_MASTER_WORKERS)
 */
export const MASTER_WORKER_COLUMNS: ColumnDef[] = [
  {
    key: 'worker_id',
    label: 'MÃ LAO ĐỘNG',
    group: 'identity',
    width: 130,
    minWidth: 100,
    pinned: true,
    visible: true,
    render: (val) => (
      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
        {val || '—'}
      </span>
    )
  },
  {
    key: 'full_name',
    label: 'HỌ VÀ TÊN',
    group: 'identity',
    width: 190,
    minWidth: 140,
    pinned: true,
    visible: true,
    render: (val) => (
      <span className="font-bold text-slate-900 uppercase">
        {val || '—'}
      </span>
    )
  },
  {
    key: 'gender',
    label: 'GIỚI TÍNH',
    group: 'identity',
    width: 90,
    minWidth: 70,
    visible: true,
    align: 'center',
    render: (val) => {
      const isFemale = val === 'Nữ' || val === 'F';
      return (
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
          isFemale ? 'bg-pink-50 text-pink-700 border border-pink-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {val || 'Nam'}
        </span>
      );
    }
  },
  {
    key: 'date_of_birth',
    label: 'NGÀY SINH',
    group: 'identity',
    width: 110,
    minWidth: 90,
    visible: true,
    align: 'center',
    render: (val) => <span className="font-mono text-slate-700">{val || '—'}</span>
  },
  {
    key: 'cccd',
    label: 'SỐ CCCD (VNeID)',
    group: 'identity',
    width: 140,
    minWidth: 120,
    visible: true,
    render: (val) => (
      <span className="font-mono font-semibold text-slate-800 tracking-wider">
        {val ? String(val).replace("'", "") : '—'}
      </span>
    )
  },
  {
    key: 'phone',
    label: 'SỐ ĐIỆN THOẠI',
    group: 'contact',
    width: 130,
    minWidth: 110,
    visible: true,
    render: (val) => (
      <span className="font-mono font-bold text-emerald-700 flex items-center gap-1">
        <Phone className="w-3 h-3 text-emerald-500" />
        {val ? String(val).replace("'", "") : '—'}
      </span>
    )
  },
  {
    key: 'target_company',
    label: 'CÔNG TY ĐỐI TÁC',
    group: 'workplace',
    width: 150,
    minWidth: 110,
    visible: true,
    render: (val) => (
      <span className="font-bold text-slate-800 flex items-center gap-1 truncate">
        <Factory className="w-3 h-3 text-slate-400 shrink-0" />
        <span>{val || 'WNC'}</span>
      </span>
    )
  },
  {
    key: 'branch',
    label: 'CHI NHÁNH',
    group: 'workplace',
    width: 120,
    minWidth: 90,
    visible: true,
    render: (val) => (
      <span className="font-medium text-slate-700 flex items-center gap-1">
        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
        <span>{val || 'HÀ NAM'}</span>
      </span>
    )
  },
  {
    key: 'working_status',
    label: 'TÌNH TRẠNG ĐI LÀM',
    group: 'pipeline',
    width: 140,
    minWidth: 110,
    visible: true,
    align: 'center',
    render: (val) => {
      const isWorking = val === 'Đang đi làm' || val === 'WORKING';
      const isQuit = val === 'Nghỉ việc' || val === 'ĐÃ XÓA (DELETED)';
      return (
        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
          isWorking
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            : isQuit
            ? 'bg-rose-100 text-rose-800 border border-rose-300'
            : 'bg-slate-100 text-slate-700 border border-slate-300'
        }`}>
          {val || 'Chưa đi làm'}
        </span>
      );
    }
  },
  {
    key: 'work_type',
    label: 'HÌNH THỨC',
    group: 'workplace',
    width: 110,
    minWidth: 90,
    visible: true,
    align: 'center',
    render: (val) => (
      <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-bold">
        {val || 'Chính thức'}
      </span>
    )
  },
  {
    key: 'interview_status',
    label: 'TRẠNG THÁI PV',
    group: 'pipeline',
    width: 120,
    minWidth: 90,
    visible: true,
    align: 'center',
    render: (val) => {
      const isPassed = val === 'Đỗ' || val === 'PASSED';
      const isFailed = val === 'Trượt' || val === 'FAILED';
      return (
        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
          isPassed
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : isFailed
            ? 'bg-rose-50 text-rose-700 border border-rose-200'
            : 'bg-slate-100 text-slate-600'
        }`}>
          {val || 'Chưa PV'}
        </span>
      );
    }
  },
  {
    key: 'hometown',
    label: 'QUÊ QUÁN',
    group: 'contact',
    width: 140,
    minWidth: 100,
    visible: true,
  },
  {
    key: 'vneid_address',
    label: 'ĐỊA CHỈ VNEID',
    group: 'contact',
    width: 220,
    minWidth: 140,
    visible: false,
  },
  {
    key: 'vietcombank_account',
    label: 'SỐ TK VIETCOMBANK',
    group: 'finance',
    width: 160,
    minWidth: 120,
    visible: true,
    render: (val) => (
      <span className="font-mono text-slate-800 flex items-center gap-1">
        <CreditCard className="w-3 h-3 text-slate-400" />
        {val ? String(val).replace("'", "") : '—'}
      </span>
    )
  },
  {
    key: 'social_insurance_no',
    label: 'SỐ SỔ BHXH',
    group: 'finance',
    width: 130,
    minWidth: 100,
    visible: false,
  },
  {
    key: 'relative_name',
    label: 'NGƯỜI THÂN LIÊN HỆ',
    group: 'contact',
    width: 160,
    minWidth: 110,
    visible: false,
  },
  {
    key: 'relative_phone',
    label: 'SĐT NGƯỜI THÂN',
    group: 'contact',
    width: 130,
    minWidth: 100,
    visible: false,
  },
  {
    key: 'consultant_sale',
    label: 'SALE PHỤ TRÁCH',
    group: 'workplace',
    width: 140,
    minWidth: 100,
    visible: true,
  },
  {
    key: 'referral_source',
    label: 'NGUỒN / CTV',
    group: 'workplace',
    width: 130,
    minWidth: 90,
    visible: true,
  },
  {
    key: 'created_at',
    label: 'NGÀY TẠO HỒ SƠ',
    group: 'pipeline',
    width: 150,
    minWidth: 110,
    visible: true,
    render: (val) => (
      <span className="font-mono text-slate-500 text-[11px]">
        {val ? new Date(val).toLocaleDateString('vi-VN') : '—'}
      </span>
    )
  }
];

/**
 * Cấu hình 22 cột CRM Deals Phễu tuyển dụng (02_CRM_DEALS_2026)
 */
export const CRM_DEAL_COLUMNS: ColumnDef[] = [
  {
    key: 'deal_id',
    label: 'MÃ DEAL 2026',
    group: 'pipeline',
    width: 140,
    minWidth: 110,
    pinned: true,
    visible: true,
    render: (val) => (
      <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
        {val || '—'}
      </span>
    )
  },
  {
    key: 'worker_id',
    label: 'MÃ LAO ĐỘNG',
    group: 'identity',
    width: 130,
    minWidth: 100,
    pinned: true,
    visible: true,
    render: (val) => (
      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
        {val || '—'}
      </span>
    )
  },
  {
    key: 'full_name',
    label: 'HỌ VÀ TÊN',
    group: 'identity',
    width: 180,
    minWidth: 130,
    pinned: true,
    visible: true,
    render: (val) => (
      <span className="font-bold text-slate-900 uppercase">
        {val || '—'}
      </span>
    )
  },
  {
    key: 'phone',
    label: 'SỐ ĐIỆN THOẠI',
    group: 'contact',
    width: 130,
    minWidth: 100,
    visible: true,
    render: (val) => (
      <span className="font-mono font-bold text-emerald-700">
        {val ? String(val).replace("'", "") : '—'}
      </span>
    )
  },
  {
    key: 'level_sale_status',
    label: 'LEVEL SALE (19 CẤP)',
    group: 'pipeline',
    width: 160,
    minWidth: 120,
    visible: true,
    align: 'center',
    render: (val) => {
      const s = String(val || 'C3');
      let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-300';

      if (s.startsWith('C3')) badgeStyle = 'bg-blue-50 text-blue-800 border-blue-300';
      else if (s.startsWith('L1')) badgeStyle = 'bg-amber-50 text-amber-800 border-amber-300';
      else if (s.startsWith('L2')) badgeStyle = 'bg-purple-50 text-purple-800 border-purple-300';
      else if (s.startsWith('L3')) badgeStyle = 'bg-emerald-100 text-emerald-900 border-emerald-400';
      else if (s.startsWith('L4')) badgeStyle = 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black border-amber-500 shadow-2xs';

      return (
        <span className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold border ${badgeStyle}`}>
          {s}
        </span>
      );
    }
  },
  {
    key: 'target_company',
    label: 'NHÀ MÁY ĐỐI TÁC',
    group: 'workplace',
    width: 150,
    minWidth: 110,
    visible: true,
    render: (val) => <span className="font-bold text-slate-800">{val || 'WNC'}</span>
  },
  {
    key: 'branch',
    label: 'CHI NHÁNH',
    group: 'workplace',
    width: 120,
    minWidth: 90,
    visible: true,
    render: (val) => <span className="font-medium text-slate-700">{val || 'HÀ NAM'}</span>
  },
  {
    key: 'is_vww',
    label: 'CHUẨN VWW',
    group: 'finance',
    width: 120,
    minWidth: 90,
    visible: true,
    align: 'center',
    render: (val) => {
      const isVww = val === true || val === 'TRUE' || val === 1;
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
          isVww
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            : 'bg-slate-100 text-slate-500'
        }`}>
          {isVww ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : null}
          <span>{isVww ? 'ĐẠT VWW' : 'Chưa'}</span>
        </span>
      );
    }
  },
  {
    key: 'interview_date',
    label: 'NGÀY PHỎNG VẤN',
    group: 'pipeline',
    width: 130,
    minWidth: 100,
    visible: true,
  },
  {
    key: 'interview_result',
    label: 'KẾT QUẢ PV',
    group: 'pipeline',
    width: 140,
    minWidth: 100,
    visible: true,
  },
  {
    key: 'start_date',
    label: 'NGÀY NHẬN VIỆC',
    group: 'pipeline',
    width: 130,
    minWidth: 100,
    visible: true,
  },
  {
    key: 'actual_work_status',
    label: 'TÌNH TRẠNG THỰC TẾ',
    group: 'pipeline',
    width: 150,
    minWidth: 110,
    visible: true,
  },
  {
    key: 'assigned_sale',
    label: 'SALE PHỤ TRÁCH',
    group: 'workplace',
    width: 140,
    minWidth: 100,
    visible: true,
  },
  {
    key: 'commission_amount',
    label: 'HOA HỒNG (VNĐ)',
    group: 'finance',
    width: 140,
    minWidth: 110,
    visible: true,
    align: 'right',
    render: (val) => (
      <span className="font-mono font-bold text-emerald-700">
        {val ? Number(val).toLocaleString('vi-VN') + ' đ' : '0 đ'}
      </span>
    )
  },
  {
    key: 'commission_status',
    label: 'DUYỆT HOA HỒNG',
    group: 'finance',
    width: 130,
    minWidth: 100,
    visible: true,
    align: 'center',
  },
  {
    key: 'notes',
    label: 'GHI CHÚ TIẾN ĐỘ',
    group: 'pipeline',
    width: 200,
    minWidth: 130,
    visible: true,
  }
];
