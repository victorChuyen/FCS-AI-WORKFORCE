/**
 * Application environment configuration for FCS AI WORKFORCE OS
 * 
 * Rules:
 * - VITE_USE_MOCK_API:
 *   - 'true' => true (uses mockApi.ts)
 *   - 'false' or default => false (uses Real API)
 * - VITE_API_BASE_URL:
 *   - Google Apps Script Web App API endpoint (Backend 3.2.0 Golden Flow)
 */

export const USE_MOCK_API: boolean =
  import.meta.env.VITE_USE_MOCK_API === 'true';

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ||
  'https://script.google.com/macros/s/AKfycbzBMRgBxNuO-rhxuJDl-YPJgLTVvXBQ9u0ZoIc70PKt06U_phLpPUH_xkvtOA6kjnc-/exec';

export const IS_CONFIG_VALID: boolean =
  USE_MOCK_API || Boolean(API_BASE_URL && API_BASE_URL.trim().length > 0);

/**
 * Super Admin emails authorized for full platform governance.
 * Can be configured via VITE_SUPER_ADMIN_EMAILS (comma-separated).
 */
export const SUPER_ADMIN_EMAILS: string[] = (
  import.meta.env.VITE_SUPER_ADMIN_EMAILS || 'coach.chuyen@gmail.com,ceo-fcs@breaths.live'
)
  .split(',')
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean);
