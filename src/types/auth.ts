/**
 * FCS AI WORKFORCE OS - V4 MULTI-TENANT SAAS ROLE MODEL & AUTH TYPES
 * Standard Role Model:
 * - PLATFORM_SUPER_ADMIN: Cross-platform governance, tenant provisioning, system health
 * - TENANT_ADMIN: Full tenant control (FCS-000001, offices, staff, workers, pipeline, attendance)
 * - TENANT_MANAGER: Permitted office scope, workers, pipeline, actions, attendance, results
 * - RECRUITER: Workers assigned to them, permitted office, interview & assignment actions
 * - VIEWER: Read-only access
 */

export type AppRole =
  | 'PLATFORM_SUPER_ADMIN'
  | 'TENANT_ADMIN'
  | 'TENANT_MANAGER'
  | 'RECRUITER'
  | 'VIEWER'
  // Legacy aliases for backward-compatibility with UI icons/filters
  | 'ADMIN'
  | 'MANAGER'
  | 'STAFF';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified?: boolean;
  role: AppRole;
  tenantId?: string;
  companyName?: string;
  companySlug?: string;
  companyCode?: string;
  officeId?: string;
  allowedOfficeIds?: string[];
  staffId?: string;
  isSuperAdmin?: boolean;
}

export interface AuthState {
  user: AppUser | null;
  loading: boolean;
  isAuthenticated: boolean;
}
