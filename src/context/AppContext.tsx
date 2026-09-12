import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CurrentUser, TenantContext, UserRole } from '../types';
import { api, isUsingMockApi, setUsingMockApi, realApi } from '../services/api';
import { setApiUserMetadata } from '../services/apiClient';
import { useAuth } from '../auth/AuthProvider';

interface AppNotification {
  message: string;
  type: 'success' | 'info' | 'warning';
  action?: { label: string; onClick: () => void };
}

export type ConnectionStatusType = 'CONNECTED' | 'CONNECTING' | 'ERROR';

export interface ConnectionState {
  status: ConnectionStatusType;
  label: string;
  color: 'emerald' | 'amber' | 'rose';
  detail?: string;
}

interface TenantItem {
  tenantId: string;
  companyName: string;
  status?: string;
  planCode?: string;
}

interface AppContextType {
  currentUser: CurrentUser;
  setCurrentUser: (user: CurrentUser) => void;
  tenantContext: TenantContext;
  currentRoute: string;
  navigateTo: (route: string, params?: Record<string, string>) => void;
  routeParams: Record<string, string>;
  isMock: boolean;
  toggleMockMode: (forceMode?: boolean) => void;
  refreshKey: number;
  triggerRefresh: () => void;
  showDocsModal: boolean;
  setShowDocsModal: (open: boolean) => void;
  showCreateWorkerModal: boolean;
  setShowCreateWorkerModal: (open: boolean) => void;
  notification: AppNotification | null;
  showNotification: (
    message: string,
    type?: 'success' | 'info' | 'warning',
    action?: { label: string; onClick: () => void }
  ) => void;
  healthStatus: 'checking' | 'healthy' | 'error';
  healthError: string | null;
  checkHealth: () => Promise<void>;
  connectionState: ConnectionState;
  availableTenants: TenantItem[];
  switchTenant: (tenantId: string) => Promise<void>;
}

const DEFAULT_TENANT_CONTEXT: TenantContext = {
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

const DEFAULT_USER: CurrentUser = {
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

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser } = useAuth();
  const [currentUser, setCurrentUser] = useState<CurrentUser>(DEFAULT_USER);
  const [tenantContext, setTenantContext] = useState<TenantContext>(DEFAULT_TENANT_CONTEXT);
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return typeof window !== 'undefined' && window.location.pathname ? window.location.pathname : '/';
  });
  const [routeParams, setRouteParams] = useState<Record<string, string>>({});
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const [showDocsModal, setShowDocsModal] = useState<boolean>(false);
  const [showCreateWorkerModal, setShowCreateWorkerModal] = useState<boolean>(false);
  const [notification, setNotification] = useState<AppNotification | null>(null);
  
  const [healthStatus, setHealthStatus] = useState<'checking' | 'healthy' | 'error'>('checking');
  const [healthError, setHealthError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState<boolean>(isUsingMockApi());
  
  const [availableTenants, setAvailableTenants] = useState<TenantItem[]>([
    { tenantId: 'FCS-000001', companyName: 'FCS Pilot Workforce Corp' },
    { tenantId: 'FCS-000002', companyName: 'ABC Staffing Bắc Giang' }
  ]);

  // Derived connection state as per Section 19:
  // GREEN: DỮ LIỆU THỰC
  // YELLOW: ĐANG KẾT NỐI DỮ LIỆU
  // RED: MẤT KẾT NỐI
  const connectionState: ConnectionState = React.useMemo(() => {
    if (isMock) {
      return {
        status: 'CONNECTING',
        label: 'MOCK DEMO',
        color: 'amber',
        detail: 'Chế độ giả lập thử nghiệm'
      };
    }
    if (healthStatus === 'checking') {
      return {
        status: 'CONNECTING',
        label: 'ĐANG KẾT NỐI DỮ LIỆU',
        color: 'amber',
        detail: 'Đang kết nối Google Sheets doanh nghiệp...'
      };
    }
    if (healthStatus === 'healthy') {
      return {
        status: 'CONNECTED',
        label: 'DỮ LIỆU THỰC',
        color: 'emerald',
        detail: `Kết nối thành công ${tenantContext.tenantId}`
      };
    }
    return {
      status: 'ERROR',
      label: 'MẤT KẾT NỐI',
      color: 'rose',
      detail: healthError || 'Không thể liên kết Google Sheets'
    };
  }, [isMock, healthStatus, healthError, tenantContext.tenantId]);

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
        role: (role as any),
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

  const toggleMockMode = (forceMode?: boolean) => {
    const nextMode = forceMode !== undefined ? forceMode : !isMock;
    setUsingMockApi(nextMode);
    setIsMock(nextMode);
    setRefreshKey(prev => prev + 1);
  };

  const checkHealth = useCallback(async () => {
    if (isMock) {
      setHealthStatus('healthy');
      setHealthError(null);
      return;
    }
    setHealthStatus('checking');
    try {
      const res = await realApi.checkHealth();
      if (res.success) {
        setHealthStatus('healthy');
        setHealthError(null);
        if (res.data?.companyName && res.data?.activeTenant) {
          setTenantContext(prev => ({
            ...prev,
            tenantId: res.data?.activeTenant || prev.tenantId,
            companyName: res.data?.companyName || prev.companyName,
          }));
        }
      } else {
        setHealthStatus('error');
        setHealthError(res.error?.message || 'Chưa kết nối được Google Apps Script.');
      }
    } catch {
      setHealthStatus('error');
      setHealthError('Chưa kết nối được Google Apps Script.');
    }
  }, [isMock]);

  // Super Admin: Switch tenant context
  const switchTenant = async (targetTenantId: string) => {
    try {
      setHealthStatus('checking');
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
        }));
        setHealthStatus('healthy');
        setRefreshKey(k => k + 1);
      } else {
        // Fallback local switch if endpoint returned default
        const found = availableTenants.find(t => t.tenantId === targetTenantId);
        setTenantContext(prev => ({
          ...prev,
          tenantId: targetTenantId,
          companyName: found ? found.companyName : targetTenantId,
        }));
        setHealthStatus('healthy');
        setRefreshKey(k => k + 1);
      }
    } catch {
      setHealthStatus('healthy');
      setRefreshKey(k => k + 1);
    }
  };

  // Fetch registered tenants if user is Super Admin
  useEffect(() => {
    if (currentUser.isSuperAdmin || currentUser.role === 'PLATFORM_SUPER_ADMIN') {
      realApi.listTenants().then(res => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setAvailableTenants(res.data.map(t => ({
            tenantId: t.tenantId,
            companyName: t.companyName,
            status: t.status,
            planCode: t.planCode,
          })));
        }
      }).catch(() => {});
    }
  }, [currentUser.isSuperAdmin, currentUser.role]);

  useEffect(() => {
    checkHealth();
  }, [checkHealth, refreshKey]);

  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const showNotification = (
    message: string,
    type: 'success' | 'info' | 'warning' = 'info',
    action?: { label: string; onClick: () => void }
  ) => {
    setNotification({ message, type, action });
    setTimeout(() => {
      setNotification(prev => (prev?.message === message ? null : prev));
    }, action ? 8000 : 4500);
  };

  const navigateTo = (route: string, params: Record<string, string> = {}) => {
    if (route.includes('?')) {
      const [path, query] = route.split('?');
      const urlParams = new URLSearchParams(query);
      const parsed: Record<string, string> = { ...params };
      urlParams.forEach((val, key) => {
        parsed[key] = val;
      });
      setCurrentRoute(path);
      setRouteParams(parsed);
      window.history.pushState({}, '', route);
    } else {
      setCurrentRoute(route);
      setRouteParams(params);
      window.history.pushState({}, '', route);
    }
  };

  useEffect(() => {
    const path = window.location.pathname;
    const search = window.location.search;
    if (path && path !== '/') {
      const urlParams = new URLSearchParams(search);
      const parsed: Record<string, string> = {};
      urlParams.forEach((val, key) => {
        parsed[key] = val;
      });
      setCurrentRoute(path);
      setRouteParams(parsed);
    }

    const onPopState = () => {
      const p = window.location.pathname || '/';
      const s = window.location.search;
      const urlParams = new URLSearchParams(s);
      const parsed: Record<string, string> = {};
      urlParams.forEach((val, key) => {
        parsed[key] = val;
      });
      setCurrentRoute(p);
      setRouteParams(parsed);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        tenantContext,
        currentRoute,
        navigateTo,
        routeParams,
        isMock,
        toggleMockMode,
        refreshKey,
        triggerRefresh,
        showDocsModal,
        setShowDocsModal,
        showCreateWorkerModal,
        setShowCreateWorkerModal,
        notification,
        showNotification,
        healthStatus,
        healthError,
        checkHealth,
        connectionState,
        availableTenants,
        switchTenant,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
