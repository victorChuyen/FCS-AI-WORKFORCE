import { LevelSaleCode, LevelSaleGroup, LevelSaleItem } from '../../types/deal.types';

export interface FunnelGroupMeta {
  key: LevelSaleGroup;
  title: string;
  shortTitle: string;
  badgeClass: string;
  borderClass: string;
  headerBg: string;
  dotColor: string;
  description: string;
}

export const FUNNEL_GROUPS: Record<LevelSaleGroup, FunnelGroupMeta> = {
  LEAD_INTAKE: {
    key: 'LEAD_INTAKE',
    title: '1. TIẾP NHẬN LEAD',
    shortTitle: 'Tiếp nhận',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    borderClass: 'border-blue-300',
    headerBg: 'bg-blue-50/80 text-blue-900 border-blue-200',
    dotColor: 'bg-blue-500',
    description: 'Nguồn data đổ về từ Facebook, TikTok, MKT, Người quen',
  },
  SALE_NURTURE: {
    key: 'SALE_NURTURE',
    title: '2. CHĂM SÓC & TƯ VẤN',
    shortTitle: 'Chăm sóc',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    borderClass: 'border-indigo-300',
    headerBg: 'bg-indigo-50/80 text-indigo-900 border-indigo-200',
    dotColor: 'bg-indigo-500',
    description: 'Sale gọi điện tư vấn đơn hàng, giải đáp thắc mắc, lọc điều kiện',
  },
  INTERVIEW: {
    key: 'INTERVIEW',
    title: '3. PHỎNG VẤN XƯỞNG',
    shortTitle: 'Phỏng vấn',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-200',
    borderClass: 'border-amber-300',
    headerBg: 'bg-amber-50/80 text-amber-900 border-amber-200',
    dotColor: 'bg-amber-500',
    description: 'Dẫn đoàn đi phỏng vấn tại xưởng / KCN đối tác',
  },
  EMPLOYMENT: {
    key: 'EMPLOYMENT',
    title: '4. ĐI LÀM & XÁC MINH (VWW)',
    shortTitle: 'Đi làm VWW',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    borderClass: 'border-emerald-400',
    headerBg: 'bg-emerald-50/80 text-emerald-900 border-emerald-200',
    dotColor: 'bg-emerald-500',
    description: 'Lao động đi làm thực tế, đối soát chấm công xưởng, giữ chân',
  },
  SETTLEMENT: {
    key: 'SETTLEMENT',
    title: '5. NGHIỆM THU & HOA HỒNG',
    shortTitle: 'Nghiệm thu',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-200',
    borderClass: 'border-purple-300',
    headerBg: 'bg-purple-50/80 text-purple-900 border-purple-200',
    dotColor: 'bg-purple-500',
    description: 'Đạt SLA tính phí nhà máy, kế toán chi trả hoa hồng Sale/CTV',
  },
};

export const LEVEL_SALE_LIST: LevelSaleItem[] = [
  // 1. LEAD_INTAKE
  {
    code: 'C3',
    name: 'C3. Lao động mới',
    group: 'LEAD_INTAKE',
    role_scope: ['Leader Sale', 'Sale', 'MKT', 'Manager'],
    description: 'Lead mới tiếp nhận từ hệ thống quảng cáo / CTV',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    code: 'C3.1',
    name: 'C3.1. Số trùng',
    group: 'LEAD_INTAKE',
    role_scope: ['Leader Sale', 'Sale', 'MKT'],
    description: 'Đã có trong cơ sở dữ liệu trong vòng 30 ngày',
    badgeBg: 'bg-slate-100 text-slate-600 border-slate-300',
  },
  {
    code: 'C3.2',
    name: 'C3.2. Số rác / Sai số',
    group: 'LEAD_INTAKE',
    role_scope: ['Leader Sale', 'Sale', 'MKT'],
    description: 'Số điện thoại không có thực hoặc sai đối tượng',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
  },

  // 2. SALE_NURTURE
  {
    code: 'L1',
    name: 'L1. Chia cho sale',
    group: 'SALE_NURTURE',
    role_scope: ['Leader Sale', 'Manager', 'Sale'],
    description: 'Đã phân bổ về nhân viên tuyển dụng phụ trách',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    code: 'L1.1',
    name: 'L1.1. Tham khảo',
    group: 'SALE_NURTURE',
    role_scope: ['Sale', 'Leader Sale'],
    description: 'Cần cân nhắc mức lương, chế độ, chưa quyết định đi ngay',
    badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  {
    code: 'L1.2',
    name: 'L1.2. Chăm sóc lại',
    group: 'SALE_NURTURE',
    role_scope: ['Sale', 'Leader Sale'],
    description: 'Hẹn liên hệ lại vào dịp khác thích hợp hơn',
    badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  {
    code: 'L1.3',
    name: 'L1.3. Từ chối / Ko nhu cầu',
    group: 'SALE_NURTURE',
    role_scope: ['Sale', 'Leader Sale'],
    description: 'Đã tìm được việc hoặc không có ý định đi làm',
    badgeBg: 'bg-zinc-100 text-zinc-600 border-zinc-300',
  },
  {
    code: 'L1.4',
    name: 'L1.4. TB / KNM / MB',
    group: 'SALE_NURTURE',
    role_scope: ['Sale', 'Leader Sale'],
    description: 'Thuê bao, không nghe máy, máy bận 3 cuộc',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    code: 'L1.5',
    name: 'L1.5. Thừa tuổi (≥45)',
    group: 'SALE_NURTURE',
    role_scope: ['Sale', 'Leader Sale'],
    description: 'Vượt trần tuổi tuyển dụng của đơn hàng hiện tại',
    badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  {
    code: 'L1.6',
    name: 'L1.6. Hẹn gọi lại',
    group: 'SALE_NURTURE',
    role_scope: ['Sale', 'Leader Sale'],
    description: 'Lao động hẹn giờ cụ thể để tư vấn kỹ hơn',
    badgeBg: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  {
    code: 'L1.8',
    name: 'L1.8. Thiếu tuổi (<18)',
    group: 'SALE_NURTURE',
    role_scope: ['Sale', 'Leader Sale'],
    description: 'Chưa đủ 18 tuổi theo quy định pháp luật lao động',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
  },

  // 3. INTERVIEW
  {
    code: 'L2',
    name: 'L2. Hẹn phỏng vấn',
    group: 'INTERVIEW',
    role_scope: ['Hiện trường', 'Sale', 'Manager'],
    description: 'Đã chốt lịch hẹn phỏng vấn xưởng / công ty đối tác',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    code: 'L2.1',
    name: 'L2.1. Đỗ phỏng vấn',
    group: 'INTERVIEW',
    role_scope: ['Hiện trường', 'Sale', 'Manager'],
    description: 'Doanh nghiệp đối tác đồng ý tiếp nhận làm việc',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
  },
  {
    code: 'L2.2',
    name: 'L2.2. Trượt phỏng vấn',
    group: 'INTERVIEW',
    role_scope: ['Hiện trường', 'Sale', 'Manager'],
    description: 'Không đạt tiêu chí tay nghề / ngoại hình / sức khỏe',
    badgeBg: 'bg-red-50 text-red-700 border-red-200',
  },
  {
    code: 'L2.3',
    name: 'L2.3. Hẹn không đến',
    group: 'INTERVIEW',
    role_scope: ['Hiện trường', 'Sale', 'Manager'],
    description: 'Lao động không có mặt tại buổi phỏng vấn đã hẹn',
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-300',
  },

  // 4. EMPLOYMENT
  {
    code: 'L3',
    name: 'L3. Đang đi làm (VWW)',
    group: 'EMPLOYMENT',
    role_scope: ['Hiện trường', 'Manager'],
    description: 'Đã vào ca làm việc thực tế, đối soát chấm công hợp lệ',
    badgeBg: 'bg-emerald-600 text-white border-emerald-700 font-extrabold shadow-2xs',
  },
  {
    code: 'L3.1',
    name: 'L3.1. Nghỉ ngang',
    group: 'EMPLOYMENT',
    role_scope: ['Hiện trường', 'Manager'],
    description: 'Bỏ việc tự do, vi phạm kỷ luật hoặc không tiếp tục',
    badgeBg: 'bg-red-100 text-red-800 border-red-300',
  },
  {
    code: 'L3.2',
    name: 'L3.2. Muốn đổi công ty',
    group: 'EMPLOYMENT',
    role_scope: ['Hiện trường', 'Manager', 'Sale'],
    description: 'Lao động muốn điều chuyển sang nhà máy khác phù hợp hơn',
    badgeBg: 'bg-yellow-50 text-yellow-800 border-yellow-300',
  },

  // 5. SETTLEMENT
  {
    code: 'L4',
    name: 'L4. Hết thời gian phí',
    group: 'SETTLEMENT',
    role_scope: ['Kế toán', 'Manager', 'Admin'],
    description: 'Hoàn tất thời gian tính phí quy định, sẵn sàng thanh toán hoa hồng',
    badgeBg: 'bg-purple-600 text-white border-purple-700 font-extrabold shadow-2xs',
  },
];

export const getStageMeta = (code: string): LevelSaleItem => {
  const found = LEVEL_SALE_LIST.find(s => s.code === code);
  if (found) return found;
  return {
    code: code as LevelSaleCode,
    name: code,
    group: 'LEAD_INTAKE',
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
  };
};

export const getGroupForStage = (code: string): LevelSaleGroup => {
  const meta = getStageMeta(code);
  return meta.group;
};

/**
 * Ma trận chuyển trạng thái 19 Level Sale hợp lệ (Finite State Machine)
 * Chống nhảy cóc trạng thái và đảm bảo tính toàn vẹn của phễu tuyển dụng BA 1.5
 */
export const VALID_STAGE_TRANSITIONS: Record<LevelSaleCode, LevelSaleCode[]> = {
  // 1. LEAD INTAKE
  'C3': ['C3.1', 'C3.2', 'L1', 'L1.3'],
  'C3.1': ['C3', 'L1'],
  'C3.2': ['C3', 'L1'],

  // 2. SALE NURTURE
  'L1': ['L1.1', 'L1.2', 'L1.3', 'L1.4', 'L1.5', 'L1.6', 'L1.8', 'L2'],
  'L1.1': ['L1', 'L1.2', 'L1.3', 'L1.4', 'L1.6', 'L2'],
  'L1.2': ['L1', 'L1.1', 'L1.3', 'L1.4', 'L1.6', 'L2'],
  'L1.3': ['L1', 'L1.2'], // Có thể chăm sóc lại nếu có nhu cầu mới
  'L1.4': ['L1', 'L1.2', 'L1.3', 'L1.6', 'L2'],
  'L1.5': ['L1.2', 'L1.3', 'L2'], // Nếu tìm được xưởng chấp nhận tuổi cao
  'L1.6': ['L1', 'L1.1', 'L1.2', 'L1.3', 'L2'],
  'L1.8': ['L1.2', 'L1.3'], // Giữ liên hệ khi đủ tuổi

  // 3. INTERVIEW
  'L2': ['L2.1', 'L2.2', 'L2.3', 'L1.2', 'L1.3'],
  'L2.1': ['L3', 'L3.1', 'L3.2', 'L1.2'],
  'L2.2': ['L1.2', 'L1.3', 'L2'],
  'L2.3': ['L1.2', 'L1.3', 'L2'],

  // 4. EMPLOYMENT
  'L3': ['L3.1', 'L3.2', 'L4'],
  'L3.1': ['L1', 'L1.2', 'L2'], // Tái kích hoạt Zalo 0đ
  'L3.2': ['L1', 'L1.2', 'L2'], // Đổi xưởng mới

  // 5. SETTLEMENT
  'L4': ['L1', 'L2'], // Hết hạn phí, có thể tái tuyển dụng đơn mới

  // 6. TERMINAL — Không thể chuyển sang bất kỳ trạng thái nào (Admin thực hiện xóa mềm)
  'DELETED': [],
};

export interface StageTransitionValidationResult {
  isValid: boolean;
  error?: string;
  requiresReason?: boolean;
}

export const validateDealStageTransition = (
  fromStage: LevelSaleCode,
  toStage: LevelSaleCode,
  payload: {
    interviewDate?: string;
    startDate?: string;
    notes?: string;
    isAdminOverride?: boolean;
  }
): StageTransitionValidationResult => {
  if (fromStage === toStage) {
    return { isValid: false, error: 'Trạng thái đích trùng với trạng thái hiện tại.' };
  }

  // Quyền Super Admin / Admin Override nếu có lý do xác đáng
  if (payload.isAdminOverride) {
    if (!payload.notes || payload.notes.trim().length < 5) {
      return {
        isValid: false,
        error: 'Quyền Admin Override bắt buộc phải nhập lý do chi tiết (tối thiểu 5 ký tự) để ghi nhận Audit Trail.',
      };
    }
    return { isValid: true };
  }

  const allowedTransitions = VALID_STAGE_TRANSITIONS[fromStage] || [];
  if (!allowedTransitions.includes(toStage)) {
    return {
      isValid: false,
      error: `Không thể chuyển trực tiếp từ ${fromStage} sang ${toStage}. Vui lòng tuân thủ quy trình phễu hoặc bật quyền Quản trị viên (Admin Override).`,
    };
  }

  // Invariant validations
  if (toStage.startsWith('L2') && toStage === 'L2') {
    if (!payload.interviewDate) {
      return {
        isValid: false,
        error: 'Chuyển sang "L2. Hẹn phỏng vấn" bắt buộc phải chọn Ngày hẹn phỏng vấn tại xưởng.',
      };
    }
  }

  if (toStage === 'L3') {
    if (!payload.startDate) {
      return {
        isValid: false,
        error: 'Chuyển sang "L3. Đang đi làm (VWW)" bắt buộc phải chọn Ngày bắt đầu làm việc thực tế.',
      };
    }
  }

  if (toStage === 'L3.1') {
    if (!payload.notes || payload.notes.trim().length < 3) {
      return {
        isValid: false,
        error: 'Chuyển sang "L3.1. Nghỉ ngang" bắt buộc phải nhập lý do nghỉ việc để phục vụ chăm sóc và tái kích hoạt.',
      };
    }
  }

  return { isValid: true };
};

