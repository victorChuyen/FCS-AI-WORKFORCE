import { API_BASE_URL } from '../config/env';
import { ApiResponse } from '../types';
import { getAuthenticatedSession, getCurrentUser } from './auth';
// Metadata is a routing hint, NEVER identity or authorization.
let currentUserMetadata = { firebaseUid: '', email: '', role: '', tenantId: '', officeId: '', staffId: '' };
let metadataVersion = 0;
export const setApiUserMetadata = (meta: Partial<typeof currentUserMetadata>) => {
  metadataVersion++;
  currentUserMetadata = { ...currentUserMetadata, ...meta };
};
export const getApiUserMetadata = () => ({ ...currentUserMetadata });
export interface ApiStandardRequest<P = any> {
  action: string; requestId: string; timestamp: number; idToken: string;
  identity: { firebaseUid: string; email: string; role: string; staffId: string };
  requestedTenantId: string; payload: P;
}
export async function callApi<T = any, P = any>(action: string, payload: P = {} as P): Promise<ApiResponse<T>> {
  const requestId = `REQ-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const failure = (code: string, message: string): ApiResponse<T> => ({ success: false, data: null, error: { code, message }, requestId });
  let session: Awaited<ReturnType<typeof getAuthenticatedSession>>;
  try { session = await getAuthenticatedSession(); }
  catch { return failure('UNAUTHENTICATED', 'Vui l\u00f2ng \u0111\u0103ng nh\u1eadp l\u1ea1i.'); }
  const { user, token } = session;
  if (!token || !user?.tenantId || !user.uid || user.emailVerified !== true) return failure('UNAUTHENTICATED', 'Phi\u00ean x\u00e1c th\u1ef1c kh\u00f4ng h\u1ee3p l\u1ec7.');
  const version = metadataVersion;
  const requestedTenantId = currentUserMetadata.tenantId || user.tenantId;
  if (!/^FCS-\d{6}$/.test(requestedTenantId) || (!user.isSuperAdmin && requestedTenantId !== user.tenantId)) return failure('FORBIDDEN', 'Kh\u00f4ng c\u00f3 quy\u1ec1n truy c\u1eadp tenant.');
  if (action === 'tenant.select' && !user.isSuperAdmin) return failure('FORBIDDEN', 'Kh\u00f4ng c\u00f3 quy\u1ec1n chuy\u1ec3n tenant.');
  let target: URL;
  try { target = new URL(API_BASE_URL); }
  catch { return failure('MISSING_API_URL', 'Ch\u01b0a c\u1ea5u h\u00ecnh API h\u1ee3p l\u1ec7.'); }
  if (target.protocol !== 'https:') return failure('INSECURE_API_URL', 'API ph\u1ea3i s\u1eed d\u1ee5ng HTTPS.');
  const requestBody: ApiStandardRequest<P> = {
    action, requestId, timestamp: Date.now(), idToken: token,
    identity: { firebaseUid: user.uid, email: user.email, role: user.role, staffId: user.staffId || '' },
    requestedTenantId, payload,
  };
  const isAppsScript = target.hostname === 'script.google.com';
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST', redirect: 'follow',
      // A paired backend MUST verify idToken before using any identity/tenant hint.
      headers: { 'Content-Type': 'text/plain;charset=utf-8', ...(isAppsScript ? {} : { Authorization: `Bearer ${token}` }) },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) return failure(`HTTP_${response.status}`, 'M\u00e1y ch\u1ee7 t\u1eeb ch\u1ed1i y\u00eau c\u1ea7u.');
    const json = await response.json();
    if (version !== metadataVersion || getCurrentUser()?.uid !== user.uid) return failure('SESSION_CHANGED', 'Phi\u00ean truy c\u1eadp \u0111\u00e3 thay \u0111\u1ed5i.');
    if (!json || typeof json.success !== 'boolean') return failure('INVALID_RESPONSE', 'Ph\u1ea3n h\u1ed3i API kh\u00f4ng h\u1ee3p l\u1ec7.');
    return {
      success: json.success, data: json.success ? (json.data ?? null) : null,
      error: json.success ? null : (json.error || { code: 'API_ERROR', message: 'Y\u00eau c\u1ea7u kh\u00f4ng th\u00e0nh c\u00f4ng.' }),
      requestId: json.requestId || requestId,
    };
  } catch { return failure('NETWORK_ERROR', 'Kh\u00f4ng k\u1ebft n\u1ed1i \u0111\u01b0\u1ee3c API.'); }
}
export default callApi;
