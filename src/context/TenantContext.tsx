import React, { createContext, useContext, useState, useEffect } from 'react';
import { CurrentUser, TenantContext, UserRole } from '../types';
import { useAuth } from '../auth/AuthProvider';
import { setApiUserMetadata } from '../services/apiClient';
import { realApi } from '../services/api';

export interface TenantItem {
  tenantId: string;
  companyName: string;
  status?: string;
  planCode?: string;
}

export interface TenantContextType {
  currentUser: CurrentUser;
  setCurrentUser: React.Dispatch<React.SetStateAction<CurrentUser>>;
  tenantContext: TenantContext;
  setTenantContext: React.Dispatch<React.SetStateAction<TenantContext>>;
  availableTenants: TenantItem[];
  setAvailableTenants: React.Dispatch<React.SetStateAction<TenantItem[]>>;
  switchTenant: (tenantId: string) => Promise<void>;
}

export const DEFAULT_TENANT_CONTEXT: TenantContext = {
  firebaseUid: 'UID-COACH-CHUYEN',
  email: 'coach.chuyen@gmail.com',
  tenantId: 'FCS-000001',
  companyName: 'FCS Pilot Workforce Corp',
  companySlug: 'fcs-pilot',
  companyCode: 'FCS1',
  role: 'PLATFORM_SUPER_ADMIN',
  staffId: 'STF-001',
  allowedOfficeIds: ['*'],
  planCode: 'PILOT',
  features: ['CORE_WORKFORCE', 'PIPELINE', 'ATTENDANCE_MATCHING', 'VWW_VERIFICATION'],
  isSuperAdmin: true,
};

export const DEFAULT_USER: CurrentUser = {
  id: 'STF-001',
  name: 'Coach Chuyền',
  email: 'coach.chuyen@gmail.com',
  role: 'PLATFORM_SUPER_ADMIN',
  tenantId: 'FCS-000001',
  companyName: 'FCS Pilot Workforce Corp',
  companySlug: 'fcs-pilot',
  companyCode: 'FCS1',
  officeId: 'OFF-01',
  allowedOfficeIds: ['*'],
  staffId: 'STF-001',
  isSuperAdmin: true,
};

const TenantStateContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser } = useAuth();
  const [currentUser, setCurrentUser] = useState<CurrentUser>(DEFAULT_USER);
  const [tenantContext, setTenantContext] = useState<TenantContext>(DEFAULT_TENANT_CONTEXT);
  const [availableTenants, setAvailableTenants] = useState<TenantItem[]>([
    { tenantId: 'FCS-000001', companyName: 'FCS Pilot Workforce Corp' },
    { tenantId: 'FCS-000002', companyName: 'ABC Staffing Bắc Giang' },
  ]);

  // Synchronize authenticated user and tenant information
  useEffect(() => {
    if (authUser) {
      const role = (authUser.role as UserRole) || 'PLATFORM_SUPER_ADMIN';
      const isSuper = Boolean(authUser.isSuperAdmin || role === 'PLATFORM_SUPER_ADMIN');
      const tenantId = authUser.tenantId || 'FCS-000001';
      const companyName = authUser.companyName || 'FCS Pilot Workforce Corp';
      const allowedOffices = authUser.allowedOfficeIds || (isSuper || role === 'TENANT_ADMIN' ? ['*'] : ['OFF-01']);

      setCurrentUser(prev => ({
        ...prev,
        id: authUser.staffId || authUser.uid.substring(0, 8),
        name: authUser.displayName || authUser.email.split('@')[0] || 'Ban Giám Đốc FCS',
        email: authUser.email,
        role,
        tenantId,
        companyName,
        companySlug: authUser.companySlug || 'fcs-pilot',
        companyCode: authUser.companyCode || 'FCS1',
        officeId: authUser.officeId || prev.officeId || 'OFF-01',
        allowedOfficeIds: allowedOffices,
        staffId: authUser.staffId || authUser.uid.substring(0, 8).toUpperCase(),
        isSuperAdmin: isSuper,
      }));

      setTenantContext(prev => ({
        ...prev,
        firebaseUid: authUser.uid,
        email: authUser.email,
        tenantId,
        companyName,
        companySlug: authUser.companySlug || 'fcs-pilot',
        companyCode: authUser.companyCode || 'FCS1',
        role: role as any,
        staffId: authUser.staffId || authUser.uid.substring(0, 8).toUpperCase(),
        allowedOfficeIds: allowedOffices,
        planCode: 'PILOT',
        features: ['CORE_WORKFORCE', 'PIPELINE', 'ATTENDANCE_MATCHING', 'VWW_VERIFICATION'],
        isSuperAdmin: isSuper,
      }));
    }
  }, [authUser]);

  // Keep API Client identity metadata up to date
  useEffect(() => {
    setApiUserMetadata({
      firebaseUid: currentUser.id,
      email: currentUser.email,
      role: currentUser.role,
      tenantId: tenantContext.tenantId,
      officeId: currentUser.officeId,
      staffId: currentUser.id,
    });
  }, [currentUser, tenantContext]);

  // Super Admin: Switch tenant context
  const switchTenant = async (targetTenantId: string) => {
    try {
      const res = await realApi.selectTenant(targetTenantId);
      if (res.success && res.data) {
        setTenantContext(prev => ({
          ...prev,
          tenantId: res.data!.tenantId,
          companyName: res.data!.companyName,
          role: (res.data!.tenantRole as any) || prev.role,
        }));
        setCurrentUser(prev => ({
          ...prev,
          tenantId: res.data!.tenantId,
          companyName: res.data!.companyName,
          role: (res.data!.tenantRole as any) || prev.role,
        }));
      }
    } catch {
      // Keep state resilient
    }
  };

  return (
    <TenantStateContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        tenantContext,
        setTenantContext,
        availableTenants,
        setAvailableTenants,
        switchTenant,
      }}
    >
      {children}
    </TenantStateContext.Provider>
  );
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantStateContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
