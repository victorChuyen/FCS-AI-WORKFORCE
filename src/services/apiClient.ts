import { API_BASE_URL } from '../config/env';
import { ApiResponse } from '../types';
import { getIdToken, getStoredUser } from './auth';

const initialStored = getStoredUser();

let currentUserMetadata = {
  firebaseUid: initialStored?.uid || '',
  email: initialStored?.email || '',
  role: initialStored?.role || 'GUEST',
  tenantId: initialStored?.tenantId || 'FCS-000001',
  officeId: initialStored?.officeId || 'OFF-01',
  staffId: initialStored?.staffId || '',
};

export const setApiUserMetadata = (meta: Partial<typeof currentUserMetadata>) => {
  currentUserMetadata = { ...currentUserMetadata, ...meta };
};

export const getApiUserMetadata = () => ({ ...currentUserMetadata });

export interface ApiStandardRequest<P = any> {
  action: string;
  requestId: string;
  timestamp: number;
  identity: {
    firebaseUid: string;
    email: string;
    role: string;
    staffId: string;
  };
  requestedTenantId: string;
  payload: P;
}

/**
 * Generic caller conforming strictly to FCS AI Workforce OS V4 Multi-Tenant Standard
 * 
 * Standard Request:
 * {
 *   "action": "worker.list",
 *   "requestId": "REQ-...",
 *   "timestamp": 1234567890,
 *   "identity": { "firebaseUid": "...", "email": "...", "role": "...", "staffId": "..." },
 *   "requestedTenantId": "FCS-000001",
 *   "payload": {}
 * }
 */
/**
 * Normalize legacy or V4 actions to V2 standard actions for full compatibility
 */
const ACTION_ALIAS_MAP: Record<string, string> = {
  'dashboard.summary': 'v2.dashboard.stats',
  'pipeline.funnel': 'v2.dashboard.stats',
  'results.summary': 'v2.dashboard.stats',
  'worker.list': 'v2.workers.list',
  'workers.list': 'v2.workers.list',
  'worker.get': 'v2.worker.get',
  'worker.create': 'v2.worker.create',
  'worker.update': 'v2.worker.update',
  'deal.list': 'v2.deals.list',
  'deals.list': 'v2.deals.list',
  'deal.create': 'v2.deal.create',
  'deal.move_stage': 'v2.deal.move_stage',
  'deal.update': 'v2.deal.update',
  'taxonomy.get': 'v2.taxonomy.get',
  'master.taxonomy': 'v2.taxonomy.get',
  'pipeline.events': 'v2.pipeline.events',
  'bootstrap': 'v2.bootstrap',
  'system.bootstrap': 'v2.bootstrap',
};

export async function callApi<T = any, P = any>(
  rawAction: string,
  payload: P = {} as P
): Promise<ApiResponse<T>> {
  const action = ACTION_ALIAS_MAP[rawAction] || rawAction;
  const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const timestamp = Date.now();

  if (!API_BASE_URL || API_BASE_URL.trim().length === 0) {
    return {
      success: false,
      data: null,
      error: {
        code: 'MISSING_API_URL',
        message: 'Chưa cấu hình URL kết nối Google Apps Script Web App trong biến VITE_API_BASE_URL.',
      },
      requestId,
    };
  }

  const requestBody: ApiStandardRequest<P> = {
    action,
    requestId,
    timestamp,
    identity: {
      firebaseUid: currentUserMetadata.firebaseUid || currentUserMetadata.staffId,
      email: currentUserMetadata.email,
      role: currentUserMetadata.role,
      staffId: currentUserMetadata.staffId,
    },
    requestedTenantId: currentUserMetadata.tenantId || 'FCS-000001',
    payload,
  };

  try {
    let token: string | null = null;
    try {
      token = await getIdToken();
    } catch {
      // Graceful fallback if token retrieval fails
    }

    if (token) {
      (requestBody as any).idToken = token;
      if (requestBody.identity) {
        (requestBody.identity as any).idToken = token;
      }
    }

    // Standard CORS-safe fetch: Append action to query parameters for Google Apps Script Web App parameter compatibility
    const url = API_BASE_URL.includes('?')
      ? `${API_BASE_URL}&action=${encodeURIComponent(action)}`
      : `${API_BASE_URL}?action=${encodeURIComponent(action)}`;

    const response = await fetch(url, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      return {
        success: false,
        data: null,
        error: {
          code: `HTTP_${response.status}`,
          message: 'Không thể kết nối đến máy chủ Google Apps Script. Mã phản hồi: ' + response.status,
        },
        requestId,
      };
    }

    const resJson = await response.json();

    if (resJson && typeof resJson === 'object') {
      let resolvedData = resJson.data;
      if (resolvedData === undefined && resJson.success) {
        if (resJson.items !== undefined) resolvedData = resJson.items;
        else if (resJson.worker !== undefined) resolvedData = resJson.worker;
        else if (resJson.deal !== undefined) resolvedData = resJson.deal;
        else if (resJson.metrics !== undefined) resolvedData = resJson.metrics;
        else resolvedData = resJson;
      }

      let resolvedError = null;
      if (!resJson.success) {
        if (typeof resJson.error === 'string') {
          resolvedError = {
            code: 'API_ERROR',
            message: resJson.error,
          };
        } else if (resJson.error && typeof resJson.error === 'object') {
          resolvedError = {
            code: resJson.error.code || 'API_ERROR',
            message: resJson.error.message || resJson.message || 'Hệ thống báo lỗi trong quá trình xử lý dữ liệu.',
            details: resJson.error.details,
          };
        } else if (resJson.message) {
          resolvedError = {
            code: 'API_ERROR',
            message: String(resJson.message),
          };
        } else {
          resolvedError = {
            code: 'API_ERROR',
            message: 'Hệ thống báo lỗi trong quá trình xử lý dữ liệu.',
          };
        }
      }

      return {
        success: Boolean(resJson.success),
        data: (resolvedData ?? null) as T | null,
        error: resolvedError,
        requestId: resJson.requestId || requestId,
      };
    }

    return {
      success: false,
      data: null,
      error: {
        code: 'INVALID_RESPONSE',
        message: 'Định dạng dữ liệu trả về từ Google Apps Script không hợp lệ.',
      },
      requestId,
    };
  } catch (err: any) {
    return {
      success: false,
      data: null,
      error: {
        code: 'NETWORK_ERROR',
        message: err?.message || 'Chưa kết nối được Google Apps Script backend.',
      },
      requestId,
    };
  }
}

export default callApi;
