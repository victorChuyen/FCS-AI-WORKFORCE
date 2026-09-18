import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CurrentUser, TenantContext } from '../types';
import { UIProvider, useUI, AppNotification } from './UIContext';
import { ConnectionProvider, useConnection, ConnectionState, ConnectionStatusType } from './ConnectionContext';
import { TenantProvider, useTenant, TenantItem, DEFAULT_USER, DEFAULT_TENANT_CONTEXT } from './TenantContext';

export type { AppNotification, ConnectionState, ConnectionStatusType, TenantItem };
export { useUI, useConnection, useTenant, DEFAULT_USER, DEFAULT_TENANT_CONTEXT };

export interface AppContextType {
  // User & Tenant
  currentUser: CurrentUser;
  setCurrentUser: React.Dispatch<React.SetStateAction<CurrentUser>>;
  tenantContext: TenantContext;
  availableTenants: TenantItem[];
  switchTenant: (tenantId: string) => Promise<void>;

  // Routing (Unified for React Router & legacy consumers)
  currentRoute: string;
  navigateTo: (route: string, params?: Record<string, string>) => void;
  routeParams: Record<string, string>;

  // UI Modals & Notifications
  showDocsModal: boolean;
  setShowDocsModal: (open: boolean) => void;
  showCreateWorkerModal: boolean;
  setShowCreateWorkerModal: (open: boolean) => void;
  showGuideModal: boolean;
  setShowGuideModal: (open: boolean) => void;
  notification: AppNotification | null;
  showNotification: (
    message: string,
    type?: 'success' | 'info' | 'warning',
    action?: { label: string; onClick: () => void }
  ) => void;

  // Connection & Mock Data
  healthStatus: 'checking' | 'healthy' | 'error';
  healthError: string | null;
  checkHealth: () => Promise<void>;
  connectionState: ConnectionState;
  isMock: boolean;
  toggleMockMode: (forceMode?: boolean) => void;
  refreshKey: number;
  triggerRefresh: () => void;
}

const AppCombinedContext = createContext<AppContextType | undefined>(undefined);

const AppInternalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ui = useUI();
  const connection = useConnection();
  const tenant = useTenant();

  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return typeof window !== 'undefined' && window.location.pathname ? window.location.pathname : '/';
  });
  const [routeParams, setRouteParams] = useState<Record<string, string>>({});

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        setCurrentRoute(window.location.pathname);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = useCallback((route: string, params?: Record<string, string>) => {
    let finalUrl = route;
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) searchParams.append(k, v);
      });
      const separator = route.includes('?') ? '&' : '?';
      finalUrl = `${route}${separator}${searchParams.toString()}`;
    }
    setCurrentRoute(finalUrl);
    if (params) setRouteParams(params);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', finalUrl);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }, []);

  const handleCheckHealth = useCallback(async () => {
    await connection.checkHealth((tId, cName) => {
      tenant.setTenantContext(prev => ({
        ...prev,
        tenantId: tId,
        companyName: cName,
      }));
    });
  }, [connection, tenant]);

  return (
    <AppCombinedContext.Provider
      value={{
        currentUser: tenant.currentUser,
        setCurrentUser: tenant.setCurrentUser,
        tenantContext: tenant.tenantContext,
        availableTenants: tenant.availableTenants,
        switchTenant: tenant.switchTenant,

        currentRoute,
        navigateTo,
        routeParams,

        showDocsModal: ui.showDocsModal,
        setShowDocsModal: ui.setShowDocsModal,
        showCreateWorkerModal: ui.showCreateWorkerModal,
        setShowCreateWorkerModal: ui.setShowCreateWorkerModal,
        showGuideModal: ui.showGuideModal,
        setShowGuideModal: ui.setShowGuideModal,
        notification: ui.notification,
        showNotification: ui.showNotification,

        healthStatus: connection.healthStatus,
        healthError: connection.healthError,
        checkHealth: handleCheckHealth,
        connectionState: connection.connectionState,
        isMock: connection.isMock,
        toggleMockMode: connection.toggleMockMode,
        refreshKey: connection.refreshKey,
        triggerRefresh: connection.triggerRefresh,
      }}
    >
      {children}
    </AppCombinedContext.Provider>
  );
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <UIProvider>
      <TenantProvider>
        <ConnectionProvider>
          <AppInternalProvider>{children}</AppInternalProvider>
        </ConnectionProvider>
      </TenantProvider>
    </UIProvider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppCombinedContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContextType;
