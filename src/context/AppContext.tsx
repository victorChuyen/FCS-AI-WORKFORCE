import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { CurrentUser, TenantContext } from '../types';
import { isUsingMockApi, setUsingMockApi, realApi } from '../services/api';
import { setApiUserMetadata } from '../services/apiClient';
import { useAuth } from '../auth/AuthProvider';
interface AppNotification { message: string; type: 'success' | 'info' | 'warning'; action?: { label: string; onClick: () => void }; }
export type ConnectionStatusType = 'CONNECTED' | 'CONNECTING' | 'ERROR';
export interface ConnectionState { status: ConnectionStatusType; label: string; color: 'emerald' | 'amber' | 'rose'; detail?: string; }
interface TenantItem { tenantId: string; companyName: string; status?: string; planCode?: string; }
interface AppContextType {
  currentUser: CurrentUser; setCurrentUser: (user: CurrentUser) => void; tenantContext: TenantContext;
  currentRoute: string; navigateTo: (route: string, params?: Record<string, string>) => void;
  routeParams: Record<string, string>; isMock: boolean; toggleMockMode: (forceMode?: boolean) => void;
  refreshKey: number; triggerRefresh: () => void; showDocsModal: boolean; setShowDocsModal: (open: boolean) => void;
  showCreateWorkerModal: boolean; setShowCreateWorkerModal: (open: boolean) => void;
  notification: AppNotification | null;
  showNotification: (message: string, type?: 'success' | 'info' | 'warning', action?: { label: string; onClick: () => void }) => void;
  healthStatus: 'checking' | 'healthy' | 'error'; healthError: string | null;
  checkHealth: () => Promise<void>; connectionState: ConnectionState; availableTenants: TenantItem[];
  switchTenant: (tenantId: string) => Promise<void>;
}
const EMPTY_TENANT: TenantContext = {
  firebaseUid: '', email: '', tenantId: '', companyName: '', companySlug: '', companyCode: '',
  role: 'VIEWER', staffId: '', allowedOfficeIds: [], planCode: '', features: [], isSuperAdmin: false,
};
const EMPTY_USER: CurrentUser = {
  id: '', name: '', email: '', role: 'VIEWER', tenantId: '', companyName: '', companySlug: '',
  companyCode: '', officeId: '', allowedOfficeIds: [], staffId: '', isSuperAdmin: false,
};
const AppContext = createContext<AppContextType | undefined>(undefined);
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser, loading: authLoading } = useAuth();
  const [currentUser, setCurrentUser] = useState<CurrentUser>(EMPTY_USER);
  const [tenantContext, setTenantContext] = useState<TenantContext>(EMPTY_TENANT);
  const [currentRoute, setCurrentRoute] = useState(() => typeof window !== 'undefined' ? window.location.pathname || '/' : '/');
  const [routeParams, setRouteParams] = useState<Record<string, string>>({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [showCreateWorkerModal, setShowCreateWorkerModal] = useState(false);
  const [notification, setNotification] = useState<AppNotification | null>(null);
  const [healthStatus, setHealthStatus] = useState<'checking' | 'healthy' | 'error'>('checking');
  const [healthError, setHealthError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(isUsingMockApi());
  const [availableTenants, setAvailableTenants] = useState<TenantItem[]>([]);
  const scopeVersion = useRef(0);
  const switching = useRef(false);
  const canQuery = !authLoading && Boolean(authUser?.tenantId) && authUser?.emailVerified === true;

  const showNotification = (message: string, type: 'success' | 'info' | 'warning' = 'info', action?: { label: string; onClick: () => void }) => {
    setNotification({ message, type, action });
    setTimeout(() => setNotification(prev => prev?.message === message ? null : prev), action ? 8000 : 4500);
  };
  useEffect(() => {
    ++scopeVersion.current;
    setAvailableTenants([]);
    setApiUserMetadata({ firebaseUid: '', email: '', role: '', tenantId: '', officeId: '', staffId: '' });
    if (!canQuery || !authUser) {
      setCurrentUser(EMPTY_USER); setTenantContext(EMPTY_TENANT); setHealthStatus('error');
      setHealthError('Vui l\u00f2ng \u0111\u0103ng nh\u1eadp v\u00e0 x\u00e1c minh email.');
      return;
    }
    const role = authUser.role as TenantContext['role'];
    const tenantId = authUser.tenantId!;
    const isSuperAdmin = role === 'PLATFORM_SUPER_ADMIN';
    const user: CurrentUser = {
      id: authUser.staffId || authUser.uid, name: authUser.displayName, email: authUser.email,
      role, tenantId, companyName: authUser.companyName || tenantId,
      companySlug: authUser.companySlug || '', companyCode: authUser.companyCode || '',
      officeId: authUser.officeId || '', allowedOfficeIds: authUser.allowedOfficeIds || [],
      staffId: authUser.staffId || '', isSuperAdmin,
    };
    setCurrentUser(user);
    setTenantContext({
      ...EMPTY_TENANT, firebaseUid: authUser.uid, email: user.email, tenantId,
      companyName: user.companyName!, companySlug: user.companySlug!, companyCode: user.companyCode!,
      role, staffId: user.staffId!, allowedOfficeIds: user.allowedOfficeIds!, isSuperAdmin,
    });
    setApiUserMetadata({ firebaseUid: authUser.uid, email: user.email, role, tenantId, officeId: user.officeId, staffId: user.staffId! });
  }, [authUser, canQuery]);

  const checkHealth = useCallback(async () => {
    if (!canQuery) return;
    const version = scopeVersion.current;
    if (isUsingMockApi()) { setHealthStatus('healthy'); setHealthError(null); return; }
    setHealthStatus('checking');
    try {
      const res = await realApi.checkHealth();
      if (version !== scopeVersion.current) return;
      if (!res.success) throw new Error('API_UNAVAILABLE');
      setHealthStatus('healthy'); setHealthError(null);
      // Health cannot silently change the authorized tenant.
      if (res.data?.companyName) setTenantContext(prev => res.data?.activeTenant === prev.tenantId
        ? { ...prev, companyName: res.data.companyName! } : prev);
    } catch {
      if (version === scopeVersion.current) {
        setHealthStatus('error'); setHealthError('Kh\u00f4ng k\u1ebft n\u1ed1i \u0111\u01b0\u1ee3c API.');
      }
    }
  }, [canQuery, authUser, isMock]);
  useEffect(() => { void checkHealth(); }, [checkHealth, refreshKey]);

  const toggleMockMode = (forceMode?: boolean) => {
    if (import.meta.env.DEV !== true) {
      showNotification('Production ch\u1ec9 s\u1eed d\u1ee5ng d\u1eef li\u1ec7u th\u1eadt.', 'warning'); return;
    }
    setUsingMockApi(forceMode !== undefined ? forceMode : !isMock);
    setIsMock(isUsingMockApi()); setRefreshKey(k => k + 1);
  };
  const switchTenant = async (targetTenantId: string) => {
    if (!canQuery || authUser?.role !== 'PLATFORM_SUPER_ADMIN') {
      showNotification('Kh\u00f4ng c\u00f3 quy\u1ec1n chuy\u1ec3n tenant.', 'warning'); return;
    }
    if (switching.current) return;
    switching.current = true;
    const version = scopeVersion.current;
    setHealthStatus('checking');
    try {
      const res = await realApi.selectTenant(targetTenantId);
      if (version !== scopeVersion.current) return;
      if (!res.success || !res.data || res.data.tenantId !== targetTenantId) throw new Error('TENANT_SWITCH_DENIED');
      ++scopeVersion.current;
      setTenantContext(prev => ({ ...prev, tenantId: res.data!.tenantId, companyName: res.data!.companyName }));
      setCurrentUser(prev => ({ ...prev, tenantId: res.data!.tenantId, companyName: res.data!.companyName }));
      setApiUserMetadata({ tenantId: res.data.tenantId });
      setHealthStatus('healthy'); setHealthError(null); setRefreshKey(k => k + 1);
    } catch {
      if (version === scopeVersion.current) {
        setApiUserMetadata({ tenantId: tenantContext.tenantId });
        setHealthStatus('error'); setHealthError('Chuy\u1ec3n tenant kh\u00f4ng th\u00e0nh c\u00f4ng.');
      }
    } finally { switching.current = false; }
  };
  useEffect(() => {
    let active = true;
    if (canQuery && authUser?.role === 'PLATFORM_SUPER_ADMIN') {
      realApi.listTenants().then(res => {
        if (active && res.success && Array.isArray(res.data)) setAvailableTenants(res.data.map(t => ({
          tenantId: t.tenantId, companyName: t.companyName, status: t.status, planCode: t.planCode,
        })));
      }).catch(() => {});
    }
    return () => { active = false; };
  }, [canQuery, authUser]);
  useEffect(() => () => { ++scopeVersion.current; }, []);

  const connectionState = React.useMemo<ConnectionState>(() => {
    if (isMock) return { status: 'CONNECTING', label: 'MOCK DEMO', color: 'amber', detail: 'Development only' };
    if (healthStatus === 'checking') return { status: 'CONNECTING', label: '\u0110ANG K\u1ebeT N\u1ed0I D\u1eee LI\u1ec6U', color: 'amber' };
    if (healthStatus === 'healthy') return { status: 'CONNECTED', label: 'D\u1eee LI\u1ec6U TH\u1ef0C', color: 'emerald', detail: tenantContext.tenantId };
    return { status: 'ERROR', label: 'M\u1ea4T K\u1ebeT N\u1ed0I', color: 'rose', detail: healthError || '' };
  }, [isMock, healthStatus, healthError, tenantContext.tenantId]);
  const triggerRefresh = () => setRefreshKey(k => k + 1);
  const navigateTo = (route: string, params: Record<string, string> = {}) => {
    const [path, query = ''] = route.split('?');
    const parsed = { ...params };
    new URLSearchParams(query).forEach((value, key) => { parsed[key] = value; });
    setCurrentRoute(path); setRouteParams(parsed); window.history.pushState({}, '', route);
  };
  useEffect(() => {
    const onPopState = () => {
      const parsed: Record<string, string> = {};
      new URLSearchParams(window.location.search).forEach((value, key) => { parsed[key] = value; });
      setCurrentRoute(window.location.pathname || '/'); setRouteParams(parsed);
    };
    onPopState(); window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  return <AppContext.Provider value={{
    currentUser, setCurrentUser, tenantContext, currentRoute, navigateTo, routeParams, isMock, toggleMockMode,
    refreshKey, triggerRefresh, showDocsModal, setShowDocsModal, showCreateWorkerModal, setShowCreateWorkerModal,
    notification, showNotification, healthStatus, healthError, checkHealth, connectionState, availableTenants, switchTenant,
  }}>{children}</AppContext.Provider>;
};
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
export default AppContext;
