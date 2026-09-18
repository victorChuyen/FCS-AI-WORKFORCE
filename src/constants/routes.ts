export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  APP: '/app',
  TODAY: '/today',
  WORKERS: '/app/workers',
  WORKER_DETAIL: '/app/workers/:workerId',
  PIPELINE: '/app/pipeline',
  REVIEW: '/app/confirmations',
  RESULTS: '/app/results',
  PLATFORM_TENANTS: '/platform/tenants',
} as const;
