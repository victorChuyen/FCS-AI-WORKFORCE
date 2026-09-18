/**
 * Re-export the single unified apiClient instance from services/apiClient.ts
 * Ensuring unified currentUserMetadata state and singleton across the entire app.
 */
export * from '../apiClient';
export { default } from '../apiClient';
