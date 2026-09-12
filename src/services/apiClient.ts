import { API_BASE_URL } from '../config/env';
import { ApiResponse } from '../types';
import { getIdToken } from './auth';

let currentUserMetadata = {
  firebaseUid: 'UID-COACH-CHUYEN',
  email: 'coach.chuyen@gmail.com',
  role: 'PLATFORM_SUPER_ADMIN',
  tenantId: 'FCS-000001',
  officeId: 'OFF-01',
  staffId: 'STF-001',
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
export async function callApi<T = any, P = any>(
  action: string,
  payload: P = {} as P
): Promise<ApiResponse<T>> {
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
    let authHeaders: Record<string, string> = {};
    try {
      const token = await getIdToken();
      if (token) {
        authHeaders['Authorization'] = `Bearer ${token}`;
      }
    } catch {
      // Graceful fallback if token retrieval fails
    }

    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
        ...authHeaders,
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
      return {
        success: Boolean(resJson.success),
        data: (resJson.data ?? null) as T | null,
        error: resJson.error || (resJson.success ? null : {
          code: 'API_ERROR',
          message: 'Hệ thống báo lỗi trong quá trình xử lý dữ liệu.',
        }),
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
