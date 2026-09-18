import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { isUsingMockApi, setUsingMockApi, realApi } from '../services/api';

export type ConnectionStatusType = 'CONNECTED' | 'CONNECTING' | 'ERROR';

export interface ConnectionState {
  status: ConnectionStatusType;
  label: string;
  color: 'emerald' | 'amber' | 'rose';
  detail?: string;
}

export interface ConnectionContextType {
  healthStatus: 'checking' | 'healthy' | 'error';
  healthError: string | null;
  checkHealth: (onTenantResolved?: (tenantId: string, companyName: string) => void) => Promise<void>;
  isMock: boolean;
  toggleMockMode: (forceMode?: boolean) => void;
  connectionState: ConnectionState;
  refreshKey: number;
  triggerRefresh: () => void;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export const ConnectionProvider: React.FC<{
  tenantId?: string;
  onTenantResolved?: (tenantId: string, companyName: string) => void;
  children: React.ReactNode;
}> = ({ tenantId = 'FCS-000001', onTenantResolved, children }) => {
  const [healthStatus, setHealthStatus] = useState<'checking' | 'healthy' | 'error'>('checking');
  const [healthError, setHealthError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState<boolean>(isUsingMockApi());
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const triggerRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const toggleMockMode = useCallback((forceMode?: boolean) => {
    const nextMode = forceMode !== undefined ? forceMode : !isUsingMockApi();
    setUsingMockApi(nextMode);
    setIsMock(nextMode);
    setRefreshKey(prev => prev + 1);
  }, []);

  const checkHealth = useCallback(
    async (callback?: (tId: string, cName: string) => void) => {
      if (isUsingMockApi()) {
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
          const resolveCb = callback || onTenantResolved;
          if (res.data?.companyName && res.data?.activeTenant && resolveCb) {
            resolveCb(res.data.activeTenant, res.data.companyName);
          }
        } else {
          setHealthStatus('error');
          setHealthError(res.error?.message || 'Chưa kết nối được Google Apps Script.');
        }
      } catch {
        setHealthStatus('error');
        setHealthError('Chưa kết nối được Google Apps Script.');
      }
    },
    [onTenantResolved]
  );

  const connectionState: ConnectionState = useMemo(() => {
    if (isMock) {
      return {
        status: 'CONNECTING',
        label: 'MOCK DEMO',
        color: 'amber',
        detail: 'Chế độ giả lập thử nghiệm (Sprint 01)',
      };
    }
    if (healthStatus === 'checking') {
      return {
        status: 'CONNECTING',
        label: 'ĐANG KẾT NỐI DỮ LIỆU',
        color: 'amber',
        detail: 'Đang kết nối Google Sheets doanh nghiệp...',
      };
    }
    if (healthStatus === 'healthy') {
      return {
        status: 'CONNECTED',
        label: 'DỮ LIỆU THỰC',
        color: 'emerald',
        detail: `Kết nối thành công ${tenantId}`,
      };
    }
    return {
      status: 'ERROR',
      label: 'MẤT KẾT NỐI',
      color: 'rose',
      detail: healthError || 'Không thể liên kết Google Sheets',
    };
  }, [isMock, healthStatus, healthError, tenantId]);

  return (
    <ConnectionContext.Provider
      value={{
        healthStatus,
        healthError,
        checkHealth,
        isMock,
        toggleMockMode,
        connectionState,
        refreshKey,
        triggerRefresh,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = (): ConnectionContextType => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
};
