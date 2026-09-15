/** Real API is mandatory in production. Mocking is an explicit development option. */
import { USE_MOCK_API, API_BASE_URL } from '../config/env';
import { mockApiService } from './mockApi';
import { realApi } from './realApi';
const mockAllowed = import.meta.env.DEV === true;
const getInitialMockMode = (): boolean => {
  if (!mockAllowed) return false;
  try {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('fcs_use_mock_api');
      if (saved !== null) return saved === 'true';
    }
  } catch { /* Storage is optional. */ }
  return USE_MOCK_API;
};
let currentMockMode = getInitialMockMode();
export const isUsingMockApi = (): boolean => mockAllowed && currentMockMode;
export const setUsingMockApi = (mock: boolean): void => {
  if (!mockAllowed && mock) throw new Error('MOCK_API_DISABLED_IN_PRODUCTION');
  currentMockMode = mockAllowed && mock;
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem('fcs_use_mock_api', String(currentMockMode));
  } catch { /* Storage is optional. */ }
};
export const api = new Proxy({} as typeof realApi, {
  get(_target, prop) {
    const activeService = isUsingMockApi() ? mockApiService : realApi;
    const value = (activeService as any)[prop];
    return typeof value === 'function' ? value.bind(activeService) : value;
  },
});
export { USE_MOCK_API, API_BASE_URL, realApi };
export default api;
