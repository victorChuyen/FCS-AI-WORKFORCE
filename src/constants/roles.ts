import type { UserRole } from '../types';

export const ROLES = {
  PLATFORM_SUPER_ADMIN: 'PLATFORM_SUPER_ADMIN' as UserRole,
  TENANT_ADMIN: 'TENANT_ADMIN' as UserRole,
  TENANT_MANAGER: 'TENANT_MANAGER' as UserRole,
  RECRUITER: 'RECRUITER' as UserRole,
  VIEWER: 'VIEWER' as UserRole,
} as const;

export const ADMIN_ROLES: UserRole[] = ['PLATFORM_SUPER_ADMIN', 'TENANT_ADMIN'];
export const MANAGER_ROLES: UserRole[] = ['PLATFORM_SUPER_ADMIN', 'TENANT_ADMIN', 'TENANT_MANAGER'];

export function isAdminRole(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role);
}

export function isManagerOrAbove(role: UserRole): boolean {
  return MANAGER_ROLES.includes(role);
}
