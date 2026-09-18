import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, isFirebaseConfigured, getMissingFirebaseEnvVars } from '../services/firebase';
import {
  mapFirebaseUser,
  logout as authLogout,
  reloadCurrentUser as authReloadUser,
  sendVerificationEmail as authSendVerificationEmail,
  getStoredUser,
  saveStoredUser,
} from '../services/auth';
import { setApiUserMetadata } from '../services/apiClient';
import { setUsingMockApi } from '../services/api';
import { AppUser } from '../types/auth';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AppUser | null>;
  sendVerificationEmail: () => Promise<void>;
  isConfigured: boolean;
  missingEnvVars: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isConfigured = isFirebaseConfigured();
  const missingEnvVars = isConfigured ? [] : getMissingFirebaseEnvVars();

  // Initialize with stored user for persistent session
  const [user, setUser] = useState<AppUser | null>(() => {
    const stored = getStoredUser();
    if (stored) {
      setApiUserMetadata({
        firebaseUid: stored.uid,
        email: stored.email,
        role: stored.role,
        tenantId: stored.tenantId,
        officeId: stored.officeId,
        staffId: stored.staffId,
      });
    }
    return stored;
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          const mapped = mapFirebaseUser(firebaseUser);
          setUser(mapped);
          saveStoredUser(mapped);
          if (mapped) {
            if (mapped.role === 'VIEWER') {
              setUsingMockApi(true);
            }
            setApiUserMetadata({
              firebaseUid: firebaseUser.uid,
              email: mapped.email,
              role: mapped.role,
              tenantId: mapped.tenantId,
              officeId: mapped.officeId,
              staffId: mapped.staffId,
            });
          }
        } else {
          setUser(null);
          saveStoredUser(null);
          setApiUserMetadata({
            firebaseUid: '',
            email: '',
            role: 'GUEST',
            tenantId: 'FCS-000001',
            officeId: '',
            staffId: '',
          });
        }
        setLoading(false);
      },
      (error) => {
        console.error('Firebase onAuthStateChanged notice:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isConfigured]);

  const logout = async () => {
    try {
      await authLogout();
      setUser(null);
      saveStoredUser(null);
      setApiUserMetadata({
        firebaseUid: '',
        email: '',
        role: 'GUEST',
        tenantId: 'FCS-000001',
        officeId: '',
        staffId: '',
      });
    } catch (error) {
      console.error('Error logging out:', error);
      setUser(null);
      saveStoredUser(null);
    }
  };

  const refreshUser = async (): Promise<AppUser | null> => {
    try {
      const updated = await authReloadUser();
      if (updated) {
        setUser(updated);
        saveStoredUser(updated);
        setApiUserMetadata({
          firebaseUid: updated.uid,
          email: updated.email,
          role: updated.role,
          tenantId: updated.tenantId,
          officeId: updated.officeId,
          staffId: updated.staffId,
        });
        return updated;
      }
      return user;
    } catch (error) {
      console.error('Error refreshing user state:', error);
      return user;
    }
  };

  const sendVerificationEmail = async (): Promise<void> => {
    await authSendVerificationEmail();
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    logout,
    refreshUser,
    sendVerificationEmail,
    isConfigured,
    missingEnvVars,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
