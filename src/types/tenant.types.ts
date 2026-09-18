export type TenantStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
export type UserAccessStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED';

export interface TenantContext {
  firebaseUid: string;
  email: string;
  tenantId: string;
  companyName: string;
  companySlug: string;
  companyCode: string;
  role: 'PLATFORM_SUPER_ADMIN' | 'TENANT_ADMIN' | 'TENANT_MANAGER' | 'RECRUITER' | 'VIEWER';
  staffId: string;
  allowedOfficeIds: string[];
  planCode: string;
  features: string[];
  dataSpreadsheetId?: string;
  managementSpreadsheetId?: string;
  isSuperAdmin?: boolean;
}

export interface TenantSummary {
  tenantId: string;
  companyName: string;
  companySlug: string;
  companyCode: string;
  planCode: string;
  status: TenantStatus;
  ownerEmail: string;
  createdAt?: string;
  activatedAt?: string;
}

export interface TenantFilesConfig {
  tenantId: string;
  dataSpreadsheetId: string;
  managementSpreadsheetId: string;
  dataSpreadsheetName: string;
  managementSpreadsheetName: string;
  driveFolderId?: string;
  schemaVersion: string;
}

export interface UserTenantAccess {
  accessId: string;
  firebaseUid: string;
  tenantId: string;
  role: string;
  officeScope: string[];
  staffId: string;
  status: UserAccessStatus;
}
