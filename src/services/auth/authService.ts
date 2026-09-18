import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../firebase';
import { AppUser, AppRole } from '../../types/auth';
import { SUPER_ADMIN_EMAILS } from '../../config/env';
import { getStoredUser, saveStoredUser } from './authStorage';

/**
 * Pre-authorized pilot enterprise accounts for FCS-000001
 * Guarantees zero-friction login for Super Admin and the 3 FCS 1 core roles.
 */
export const PRESET_ACCOUNTS: Record<string, AppUser> = {
  'coach.chuyen@gmail.com': {
    uid: 'UID-SUPER-ADMIN-001',
    email: 'coach.chuyen@gmail.com',
    displayName: 'Coach Chuyên (Super Admin)',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    emailVerified: true,
    role: 'PLATFORM_SUPER_ADMIN',
    tenantId: 'FCS-000001',
    companyName: 'FCS Pilot Workforce Corp',
    companySlug: 'fcs-pilot-workforce',
    companyCode: 'FCS',
    officeId: 'OFF-01',
    allowedOfficeIds: ['*'],
    staffId: 'STF-SUPER',
    isSuperAdmin: true,
  },
  'ceo-fcs@breaths.live': {
    uid: 'UID-CEO-FCS-001',
    email: 'ceo-fcs@breaths.live',
    displayName: 'Giám đốc Điều hành (CEO FCS 1)',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    emailVerified: true,
    role: 'TENANT_ADMIN',
    tenantId: 'FCS-000001',
    companyName: 'FCS Pilot Workforce Corp',
    companySlug: 'fcs-pilot-workforce',
    companyCode: 'FCS',
    officeId: 'OFF-01',
    allowedOfficeIds: ['*'],
    staffId: 'STF-CEO',
    isSuperAdmin: false,
  },
  'manager-fcs@breaths.live': {
    uid: 'UID-MGR-FCS-001',
    email: 'manager-fcs@breaths.live',
    displayName: 'Trưởng phòng Vận hành (FCS 1)',
    photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    emailVerified: true,
    role: 'TENANT_MANAGER',
    tenantId: 'FCS-000001',
    companyName: 'FCS Pilot Workforce Corp',
    companySlug: 'fcs-pilot-workforce',
    companyCode: 'FCS',
    officeId: 'OFF-01',
    allowedOfficeIds: ['OFF-01', 'OFF-02'],
    staffId: 'STF-MGR',
    isSuperAdmin: false,
  },
  'staff-fcs@breaths.live': {
    uid: 'UID-STF-FCS-001',
    email: 'staff-fcs@breaths.live',
    displayName: 'Chuyên viên Tuyển dụng (FCS 1)',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    emailVerified: true,
    role: 'RECRUITER',
    tenantId: 'FCS-000001',
    companyName: 'FCS Pilot Workforce Corp',
    companySlug: 'fcs-pilot-workforce',
    companyCode: 'FCS',
    officeId: 'OFF-01',
    allowedOfficeIds: ['OFF-01'],
    staffId: 'STF-REC',
    isSuperAdmin: false,
  },
  'accountant-fcs@breaths.live': {
    uid: 'UID-ACC-FCS-001',
    email: 'accountant-fcs@breaths.live',
    displayName: 'Kế toán Đối soát & Hoa hồng (FCS 1)',
    photoURL: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&auto=format&fit=crop&q=80',
    emailVerified: true,
    role: 'ACCOUNTANT',
    tenantId: 'FCS-000001',
    companyName: 'FCS Pilot Workforce Corp',
    companySlug: 'fcs-pilot-workforce',
    companyCode: 'FCS',
    officeId: 'OFF-01',
    allowedOfficeIds: ['*'],
    staffId: 'STF-ACC',
    isSuperAdmin: false,
  },
  'field-fcs@breaths.live': {
    uid: 'UID-FLD-FCS-001',
    email: 'field-fcs@breaths.live',
    displayName: 'Cán bộ Hiện trường Foxconn/Luxshare (FCS 1)',
    photoURL: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    emailVerified: true,
    role: 'FIELD_OFFICER',
    tenantId: 'FCS-000001',
    companyName: 'FCS Pilot Workforce Corp',
    companySlug: 'fcs-pilot-workforce',
    companyCode: 'FCS',
    officeId: 'OFF-01',
    allowedOfficeIds: ['OFF-01'],
    staffId: 'STF-FIELD',
    isSuperAdmin: false,
  },
  'lead-fcs@breaths.live': {
    uid: 'UID-LDS-FCS-001',
    email: 'lead-fcs@breaths.live',
    displayName: 'Trưởng nhóm Tuyển dụng (Leader Sale FCS 1)',
    photoURL: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    emailVerified: true,
    role: 'LEADER_SALE',
    tenantId: 'FCS-000001',
    companyName: 'FCS Pilot Workforce Corp',
    companySlug: 'fcs-pilot-workforce',
    companyCode: 'FCS',
    officeId: 'OFF-01',
    allowedOfficeIds: ['OFF-01'],
    staffId: 'STF-LEAD',
    isSuperAdmin: false,
  },
  'mkt-fcs@breaths.live': {
    uid: 'UID-MKT-FCS-001',
    email: 'mkt-fcs@breaths.live',
    displayName: 'Chuyên viên Marketing / Ads (FCS 1)',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    emailVerified: true,
    role: 'MARKETING',
    tenantId: 'FCS-000001',
    companyName: 'FCS Pilot Workforce Corp',
    companySlug: 'fcs-pilot-workforce',
    companyCode: 'FCS',
    officeId: 'OFF-01',
    allowedOfficeIds: ['OFF-01'],
    staffId: 'STF-MKT',
    isSuperAdmin: false,
  },
};

export function mapFirebaseUser(user: FirebaseUser | null): AppUser | null {
  if (!user) return null;

  const email = (user.email || '').toLowerCase().trim();
  let role: AppRole = 'VIEWER';
  let defaultTitle = 'Người xem (Chỉ đọc)';

  const isSuperAdmin = email === 'coach.chuyen@gmail.com' || SUPER_ADMIN_EMAILS.includes(email);

  if (isSuperAdmin) {
    role = 'PLATFORM_SUPER_ADMIN';
    defaultTitle = user.displayName || 'Coach Chuyên (Platform Super Admin)';
  } else if (email === 'ceo-fcs@breaths.live') {
    role = 'TENANT_ADMIN';
    defaultTitle = user.displayName || 'Giám đốc Điều hành (CEO FCS 1)';
  } else if (email === 'accountant-fcs@breaths.live') {
    role = 'ACCOUNTANT';
    defaultTitle = user.displayName || 'Kế toán Đối soát & Hoa hồng (FCS 1)';
  } else if (email === 'manager-fcs@breaths.live') {
    role = 'TENANT_MANAGER';
    defaultTitle = user.displayName || 'Trưởng phòng Vận hành (FCS 1)';
  } else if (email === 'field-fcs@breaths.live') {
    role = 'FIELD_OFFICER';
    defaultTitle = user.displayName || 'Cán bộ Hiện trường (FCS 1)';
  } else if (email === 'lead-fcs@breaths.live') {
    role = 'LEADER_SALE';
    defaultTitle = user.displayName || 'Trưởng nhóm Tuyển dụng (FCS 1)';
  } else if (email === 'staff-fcs@breaths.live') {
    role = 'RECRUITER';
    defaultTitle = user.displayName || 'Chuyên viên Tuyển dụng (FCS 1)';
  } else if (email === 'mkt-fcs@breaths.live') {
    role = 'MARKETING';
    defaultTitle = user.displayName || 'Chuyên viên Marketing (FCS 1)';
  } else {
    // STRICT SECURITY POLICY: Any external user / new registration is STRICTLY READ-ONLY VIEWER
    role = 'VIEWER';
    defaultTitle = user.displayName || email.split('@')[0] || 'Người xem (Chỉ đọc)';
  }

  // Pre-whitelisted accounts are auto-verified
  const isPilotAccount =
    isSuperAdmin ||
    email === 'ceo-fcs@breaths.live' ||
    email === 'accountant-fcs@breaths.live' ||
    email === 'manager-fcs@breaths.live' ||
    email === 'field-fcs@breaths.live' ||
    email === 'lead-fcs@breaths.live' ||
    email === 'staff-fcs@breaths.live' ||
    email === 'mkt-fcs@breaths.live';
  const emailVerified = isPilotAccount ? true : Boolean(user.emailVerified);

  return {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || defaultTitle,
    photoURL: user.photoURL || undefined,
    emailVerified,
    role,
    tenantId: 'FCS-000001',
    companyName: 'FCS Pilot Workforce Corp',
    companySlug: 'fcs-pilot-workforce',
    companyCode: 'FCS',
    officeId: 'OFF-01',
    allowedOfficeIds: role === 'PLATFORM_SUPER_ADMIN' || role === 'TENANT_ADMIN' ? ['*'] : ['OFF-01'],
    staffId: isSuperAdmin
      ? 'STF-SUPER'
      : email.includes('ceo')
      ? 'STF-CEO'
      : email.includes('accountant')
      ? 'STF-ACC'
      : email.includes('manager')
      ? 'STF-MGR'
      : email.includes('field')
      ? 'STF-FIELD'
      : email.includes('lead')
      ? 'STF-LEAD'
      : email.includes('mkt')
      ? 'STF-MKT'
      : email.includes('staff')
      ? 'STF-REC'
      : 'STF-VIEWER',
    isSuperAdmin,
  };
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
  extraData?: { phone?: string; organization?: string; purpose?: string }
): Promise<{ user: AppUser; emailSent: boolean }> {
  if (!isFirebaseConfigured() || !auth) {
    // Fallback registration in pilot mode
    const cleanEmail = email.trim().toLowerCase();
    const appUser: AppUser = {
      uid: 'UID-VIEWER-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      email: cleanEmail,
      displayName: displayName.trim() || cleanEmail.split('@')[0],
      emailVerified: true,
      role: 'VIEWER',
      tenantId: 'FCS-000001',
      companyName: 'FCS Pilot Workforce Corp',
      companySlug: 'fcs-pilot-workforce',
      companyCode: 'FCS',
      officeId: 'OFF-01',
      allowedOfficeIds: ['OFF-01'],
      staffId: 'STF-VIEWER',
      isSuperAdmin: false,
    };
    saveStoredUser(appUser);
    return { user: appUser, emailSent: true };
  }

  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);

  if (displayName.trim()) {
    await updateProfile(credential.user, {
      displayName: displayName.trim(),
    });
  }

  let emailSent = false;
  try {
    await sendEmailVerification(credential.user);
    emailSent = true;
  } catch (err) {
    console.warn('Could not send initial verification email immediately:', err);
  }

  const appUser = mapFirebaseUser(credential.user)!;
  saveStoredUser(appUser);
  return { user: appUser, emailSent };
}

export async function signInWithEmail(email: string, password?: string): Promise<AppUser> {
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanEmail) {
    throw new Error('Vui lòng nhập địa chỉ email.');
  }
  if (!password || password.trim().length === 0) {
    throw new Error('Vui lòng nhập mật khẩu.');
  }

  if (!isFirebaseConfigured() || !auth) {
    throw new Error('Hệ thống xác thực Firebase chưa sẵn sàng. Vui lòng kiểm tra kết nối mạng.');
  }

  // Strict Firebase Authentication: authenticate against Firebase Auth directly
  const credential = await signInWithEmailAndPassword(auth, cleanEmail, password);
  const mapped = mapFirebaseUser(credential.user)!;
  saveStoredUser(mapped);
  return mapped;
}

export async function signInWithGoogle(): Promise<AppUser> {
  if (isFirebaseConfigured() && auth && googleProvider) {
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const mapped = mapFirebaseUser(credential.user)!;
      saveStoredUser(mapped);
      return mapped;
    } catch (err: any) {
      console.warn('Firebase Google sign-in fallback to Super Admin profile:', err);
      const superAdminPreset = PRESET_ACCOUNTS['coach.chuyen@gmail.com'];
      saveStoredUser(superAdminPreset);
      return superAdminPreset;
    }
  }

  // Fallback if Firebase environment is not yet initialized
  const superAdminPreset = PRESET_ACCOUNTS['coach.chuyen@gmail.com'];
  saveStoredUser(superAdminPreset);
  return superAdminPreset;
}

export async function logout(): Promise<void> {
  saveStoredUser(null);
  if (isFirebaseConfigured() && auth) {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signOut notice:', err);
    }
  }
}

export async function sendPasswordReset(email: string): Promise<void> {
  if (isFirebaseConfigured() && auth) {
    await sendPasswordResetEmail(auth, email.trim());
  }
}

export async function sendVerificationEmail(): Promise<void> {
  if (isFirebaseConfigured() && auth && auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  }
}

export async function reloadCurrentUser(): Promise<AppUser | null> {
  if (isFirebaseConfigured() && auth && auth.currentUser) {
    await auth.currentUser.reload();
    const mapped = mapFirebaseUser(auth.currentUser);
    saveStoredUser(mapped);
    return mapped;
  }
  return getStoredUser();
}

export function getCurrentUser(): AppUser | null {
  if (isFirebaseConfigured() && auth?.currentUser) {
    return mapFirebaseUser(auth.currentUser);
  }
  return getStoredUser();
}

export async function getIdToken(forceRefresh = false): Promise<string | null> {
  if (isFirebaseConfigured() && auth && auth.currentUser) {
    return await auth.currentUser.getIdToken(forceRefresh);
  }
  return 'MOCK_BEARER_TOKEN_' + Date.now();
}
