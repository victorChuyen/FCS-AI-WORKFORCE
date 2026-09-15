import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { onIdTokenChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured, getMissingFirebaseEnvVars } from '../services/firebase';
import {
  resolveFirebaseUser, logout as authLogout, reloadCurrentUser as authReloadUser,
  sendVerificationEmail as authSendVerificationEmail, saveStoredUser,
} from '../services/auth';
import { AppUser } from '../types/auth';

interface AuthContextType {
  user: AppUser | null; loading: boolean; isAuthenticated: boolean;
  logout: () => Promise<void>; refreshUser: () => Promise<AppUser | null>;
  sendVerificationEmail: () => Promise<void>; loginWithPreset: (email: string) => Promise<AppUser>;
  isConfigured: boolean; missingEnvVars: string[];
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isConfigured = isFirebaseConfigured();
  const missingEnvVars = isConfigured ? [] : getMissingFirebaseEnvVars();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const generation = useRef(0);
  useEffect(() => {
    saveStoredUser(null);
    setUser(null);
    if (!isConfigured || !auth) { setLoading(false); return; }
    const unsubscribe = onIdTokenChanged(auth, async firebaseUser => {
      const current = ++generation.current;
      setUser(null);
      setLoading(true);
      // A normal token refresh is not a logout and must not invalidate its own SDK call.
      if (!firebaseUser) saveStoredUser(null);
      try {
        const mapped = firebaseUser ? await resolveFirebaseUser(firebaseUser) : null;
        if (current === generation.current) setUser(mapped);
      } catch {
        if (current === generation.current) { saveStoredUser(null); setUser(null); }
      } finally {
        if (current === generation.current) setLoading(false);
      }
    }, () => {
      ++generation.current; saveStoredUser(null); setUser(null); setLoading(false);
    });
    return () => { ++generation.current; unsubscribe(); saveStoredUser(null); };
  }, [isConfigured]);
  const logout = async () => {
    ++generation.current; setUser(null); setLoading(false); await authLogout();
  };
  const refreshUser = async (): Promise<AppUser | null> => {
    const current = ++generation.current;
    setLoading(true);
    try {
      const updated = await authReloadUser();
      if (current === generation.current) setUser(updated);
      return current === generation.current ? updated : null;
    } catch {
      if (current === generation.current) { saveStoredUser(null); setUser(null); }
      return null;
    } finally {
      if (current === generation.current) setLoading(false);
    }
  };
  const loginWithPreset = async (_email: string): Promise<AppUser> => {
    throw Object.assign(new Error('auth/credentials-required'), { code: 'auth/credentials-required' });
  };
  return <AuthContext.Provider value={{
    user, loading, isAuthenticated: !loading && Boolean(user?.tenantId), logout, refreshUser,
    sendVerificationEmail: authSendVerificationEmail, loginWithPreset, isConfigured, missingEnvVars,
  }}>{children}</AuthContext.Provider>;
};
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
