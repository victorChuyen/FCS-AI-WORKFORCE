/**
 * Unified API Service Abstraction - FCS AI WORKFORCE OS V4
 * 
 * Rules:
 * - Default runtime is REAL API (Google Apps Script + Google Sheets Multi-Tenant)
 * - mockApiService is isolated for development-only fallback when explicitly requested.
 * - Production tenant mode connects directly to real Google Sheets data.
 */
import { USE_MOCK_API, API_BASE_URL } from '../config/env';
import { mockApiService } from './mockApi';
import { realApi } from './realApi';

const getInitialMockMode = (): boolean => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('fcs_use_mock_api');
    if (saved !== null) {
      return saved === 'true';
    }
  }
  // Default to REAL API (false) unless explicitly forced via env
  return USE_MOCK_API;
};

let currentMockMode = getInitialMockMode();

export const isUsingMockApi = (): boolean => currentMockMode;

export const setUsingMockApi = (mock: boolean): void => {
  currentMockMode = mock;
  if (typeof window !== 'undefined') {
    localStorage.setItem('fcs_use_mock_api', String(mock));
  }
};

/**
 * Unified API Proxy: Dynamically forwards calls to realApi (or mockApiService if dev-flagged).
 */
export const api = new Proxy({} as typeof realApi, {
  get(_target, prop) {
    const activeService = currentMockMode ? mockApiService : realApi;
    const value = (activeService as any)[prop];
    if (typeof value === 'function') {
      return value.bind(activeService);
    }
    return value;
  },
});

export { USE_MOCK_API, API_BASE_URL, realApi };
export default api;
