import { AppUser } from '../../types/auth';

const LOCAL_STORAGE_KEY = 'fcs_active_user';

export function getStoredUser(): AppUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppUser;
  } catch (err) {
    console.warn('Failed to parse cached FCS user:', err);
    return null;
  }
}

export function saveStoredUser(user: AppUser | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  } catch (err) {
    console.warn('Failed to save cached FCS user:', err);
  }
}
