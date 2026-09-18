/**
 * FCS AI WORKFORCE OS V2 — CRM DEAL & 19 LEVEL SALE TYPES
 */

export type LevelSaleCode =
  | 'C3'
  | 'C3.1'
  | 'C3.2'
  | 'L1'
  | 'L1.1'
  | 'L1.2'
  | 'L1.3'
  | 'L1.4'
  | 'L1.5'
  | 'L1.6'
  | 'L1.8'
  | 'L2'
  | 'L2.1'
  | 'L2.2'
  | 'L2.3'
  | 'L3'
  | 'L3.1'
  | 'L3.2'
  | 'L4'
  | 'DELETED';

export type LevelSaleGroup =
  | 'LEAD_INTAKE'     // Tiếp nhận lead (C3, C3.1, C3.2)
  | 'SALE_NURTURE'    // Chăm sóc & Phân bổ sale (L1, L1.1 -> L1.8)
  | 'INTERVIEW'       // Phỏng vấn xưởng (L2, L2.1, L2.2, L2.3)
  | 'EMPLOYMENT'      // Đi làm & VWW (L3, L3.1, L3.2)
  | 'SETTLEMENT';     // Nghiệm thu hoa hồng (L4)

export interface LevelSaleItem {
  code: LevelSaleCode;
  name: string;
  group: LevelSaleGroup;
  role_scope?: string[];
  description?: string;
  color?: string;
  badgeBg?: string;
  badgeText?: string;
}

export interface CrmDeal {
  deal_id: string;
  worker_id: string;
  full_name: string;
  phone: string;
  cccd?: string;
  target_company: string;
  branch: string;
  level_sale_status: LevelSaleCode;
  assigned_sale?: string;
  referral_ven_ctv?: string;
  interview_date?: string;
  interview_result?: string;
  start_date?: string;
  actual_work_status?: string;
  is_vww?: boolean;
  commission_policy?: string;
  commission_amount?: number;
  commission_status?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  updated_by?: string;
}

export interface MoveDealStagePayload {
  deal_id: string;
  new_stage: LevelSaleCode;
  notes?: string;
  actor_email?: string;
}

export interface CreateDealPayload {
  worker_id: string;
  full_name?: string;
  phone?: string;
  cccd?: string;
  target_company: string;
  branch: string;
  level_sale_status?: LevelSaleCode;
  assigned_sale?: string;
  referral_ven_ctv?: string;
  interview_date?: string;
  interview_result?: string;
  start_date?: string;
  actual_work_status?: string;
  commission_amount?: number;
  notes?: string;
  actor_email?: string;
}

export interface DealFilterParams {
  limit?: number;
  offset?: number;
  search?: string;
  stage?: string;
  level_sale_status?: string;
  branch?: string;
  company?: string;
  assigned_sale?: string;
  include_deleted?: boolean;
}
