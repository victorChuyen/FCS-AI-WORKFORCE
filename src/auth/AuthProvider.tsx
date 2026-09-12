import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, isFirebaseConfigured, getMissingFirebaseEnvVars } from '../services/firebase';
import {
  mapFirebaseUser,
  logout as authLogout,
  reloadCurrentUser as authReloadUser,
  sendVerificationEmail as authSendVerificationEmail,
  signInWithEmail,
  getStoredUser,
  saveStoredUser,
} from '../services/auth';
import { AppUser } from '../types/auth';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AppUser | null>;
  sendVerificationEmail: () => Promise<void>;
  loginWithPreset: (email: string) => Promise<AppUser>;
  isConfigured: boolean;
  missingEnvVars: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isConfigured = isFirebaseConfigured();
  const missingEnvVars = isConfigured ? [] : getMissingFirebaseEnvVars();

  // Initialize with stored user for persistent session
  const [user, setUser] = useState<AppUser | null>(() => getStoredUser());
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

  const loginWithPreset = async (email: string): Promise<AppUser> => {
    setLoading(true);
    try {
      const appUser = await signInWithEmail(email);
      setUser(appUser);
      saveStoredUser(appUser);
      return appUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authLogout();
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
      setUser(null);
    }
  };

  const refreshUser = async (): Promise<AppUser | null> => {
    try {
      const updated = await authReloadUser();
      if (updated) {
        setUser(updated);
        saveStoredUser(updated);
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
    loginWithPreset,
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
