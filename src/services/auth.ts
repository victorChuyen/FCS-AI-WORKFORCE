import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup,
  signOut, sendPasswordResetEmail, sendEmailVerification, updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from './firebase';
import { AppUser, AppRole } from '../types/auth';

const LOCAL_STORAGE_KEY = 'fcs_active_user';
let sessionUser: AppUser | null = null;
let sessionExpiresAt = 0;
let sessionRevision = 0;
let explicitlySignedOut = false;

// Compatibility export only. A preset is never an authentication credential.
export const PRESET_ACCOUNTS: Record<string, AppUser> = {};

function authError(code: string): Error & { code: string } {
  return Object.assign(new Error(code), { code });
}
function requireFirebase(): void {
  if (!isFirebaseConfigured() || !auth) throw authError('auth/configuration-missing');
}
function discardLegacySession(): void {
  try {
    if (typeof window !== 'undefined') window.localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch { /* Browser storage is optional, never an authority. */ }
}
export function getStoredUser(): AppUser | null {
  discardLegacySession();
  return null;
}
// Retained for existing callers; supplied browser profiles cannot create a session.
export function saveStoredUser(user: AppUser | null): void {
  discardLegacySession();
  if (!user) {
    sessionRevision++;
    sessionUser = null;
    sessionExpiresAt = 0;
  }
}
export function getFriendlyAuthErrorMessage(errorCodeOrMessage: string): string {
  const code = String(errorCodeOrMessage || '').toLowerCase();
  if (code.includes('configuration-missing')) return 'Ch\u01b0a c\u1ea5u h\u00ecnh x\u00e1c th\u1ef1c. Vui l\u00f2ng li\u00ean h\u1ec7 qu\u1ea3n tr\u1ecb vi\u00ean.';
  if (code.includes('access-not-provisioned')) return 'T\u00e0i kho\u1ea3n ch\u01b0a \u0111\u01b0\u1ee3c c\u1ea5p quy\u1ec1n doanh nghi\u1ec7p. Vui l\u00f2ng li\u00ean h\u1ec7 qu\u1ea3n tr\u1ecb vi\u00ean.';
  if (code.includes('email-not-verified')) return 'Vui l\u00f2ng x\u00e1c minh email tr\u01b0\u1edbc khi truy c\u1eadp d\u1eef li\u1ec7u.';
  if (code.includes('unauthenticated') || code.includes('session-changed')) return 'Phi\u00ean \u0111\u0103ng nh\u1eadp kh\u00f4ng c\u00f2n h\u1ee3p l\u1ec7. Vui l\u00f2ng \u0111\u0103ng nh\u1eadp l\u1ea1i.';
  if (code.includes('credentials-required')) return 'Vui l\u00f2ng nh\u1eadp email v\u00e0 m\u1eadt kh\u1ea9u.';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) return 'Email ho\u1eb7c m\u1eadt kh\u1ea9u kh\u00f4ng ch\u00ednh x\u00e1c.';
  if (code.includes('user-disabled')) return 'T\u00e0i kho\u1ea3n \u0111\u00e3 b\u1ecb v\u00f4 hi\u1ec7u h\u00f3a. Vui l\u00f2ng li\u00ean h\u1ec7 qu\u1ea3n tr\u1ecb vi\u00ean.';
  if (code.includes('too-many-requests')) return 'Qu\u00e1 nhi\u1ec1u y\u00eau c\u1ea7u. Vui l\u00f2ng th\u1eed l\u1ea1i sau.';
  if (code.includes('email-already-in-use')) return 'Email n\u00e0y \u0111\u00e3 \u0111\u01b0\u1ee3c s\u1eed d\u1ee5ng.';
  if (code.includes('weak-password')) return 'M\u1eadt kh\u1ea9u qu\u00e1 y\u1ebfu (t\u1ed1i thi\u1ec3u 6 k\u00fd t\u1ef1).';
  if (code.includes('invalid-email')) return '\u0110\u1ecbnh d\u1ea1ng email kh\u00f4ng h\u1ee3p l\u1ec7.';
  if (code.includes('popup-closed-by-user') || code.includes('cancelled-popup-request')) return '\u0110\u0103ng nh\u1eadp Google ch\u01b0a ho\u00e0n t\u1ea5t.';
  if (code.includes('network-request-failed')) return 'Kh\u00f4ng k\u1ebft n\u1ed1i \u0111\u01b0\u1ee3c m\u00e1y ch\u1ee7 x\u00e1c th\u1ef1c. Vui l\u00f2ng ki\u1ec3m tra m\u1ea1ng.';
  if (code.includes('requires-recent-login')) return 'Vui l\u00f2ng \u0111\u0103ng nh\u1eadp l\u1ea1i \u0111\u1ec3 th\u1ef1c hi\u1ec7n thao t\u00e1c n\u00e0y.';
  return 'Kh\u00f4ng th\u1ec3 x\u00e1c th\u1ef1c. Vui l\u00f2ng th\u1eed l\u1ea1i.';
}
function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}
/** UI projection ONLY. Backend must independently verify token and membership. */
export function mapFirebaseUser(user: FirebaseUser | null, claims: Record<string, unknown> = {}): AppUser | null {
  if (!user) return null;
  const role = claims.role === 'TENANT_VIEWER' ? 'VIEWER' : claims.role;
  const roles: AppRole[] = ['PLATFORM_SUPER_ADMIN', 'TENANT_ADMIN', 'TENANT_MANAGER', 'RECRUITER', 'VIEWER'];
  const tenantId = optionalString(claims.tenantId);
  if (typeof role !== 'string' || !roles.includes(role as AppRole) || !tenantId || !/^FCS-\d{6}$/.test(tenantId)) {
    throw authError('auth/access-not-provisioned');
  }
  return {
    uid: user.uid, email: user.email || '', displayName: user.displayName || user.email || '',
    photoURL: user.photoURL || undefined, emailVerified: user.emailVerified === true,
    role: role as AppRole, tenantId,
    companyName: optionalString(claims.companyName), companySlug: optionalString(claims.companySlug),
    companyCode: optionalString(claims.companyCode), officeId: optionalString(claims.officeId),
    allowedOfficeIds: Array.isArray(claims.allowedOfficeIds)
      ? claims.allowedOfficeIds.filter((v): v is string => typeof v === 'string' && v.trim().length > 0).map(v => v.trim()) : [],
    staffId: optionalString(claims.staffId), isSuperAdmin: role === 'PLATFORM_SUPER_ADMIN',
  };
}
async function readFirebaseSession(user: FirebaseUser, forceRefresh = false): Promise<{ user: AppUser; token: string }> {
  requireFirebase();
  if (explicitlySignedOut) throw authError('auth/unauthenticated');
  const revision = sessionRevision;
  const result = await user.getIdTokenResult(forceRefresh);
  if (revision !== sessionRevision || auth.currentUser?.uid !== user.uid) throw authError('auth/session-changed');
  const expiresAt = Date.parse(result.expirationTime);
  if (!result.token || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) throw authError('auth/unauthenticated');
  const mapped = mapFirebaseUser(user, result.claims)!;
  sessionUser = mapped;
  sessionExpiresAt = expiresAt;
  discardLegacySession();
  return { user: mapped, token: result.token };
}
export async function resolveFirebaseUser(user: FirebaseUser): Promise<AppUser> {
  return (await readFirebaseSession(user)).user;
}
/** Obtain a mutually consistent identity, claims and SDK token for each API call. */
export async function getAuthenticatedSession(forceRefresh = false): Promise<{ user: AppUser; token: string }> {
  requireFirebase();
  if (!auth.currentUser) throw authError('auth/unauthenticated');
  if (!auth.currentUser.emailVerified) throw authError('auth/email-not-verified');
  return readFirebaseSession(auth.currentUser, forceRefresh);
}
export async function signUpWithEmail(email: string, password: string, displayName: string): Promise<{ user: AppUser; emailSent: boolean }> {
  requireFirebase();
  if (!email.trim() || !password) throw authError('auth/credentials-required');
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  if (displayName.trim()) await updateProfile(credential.user, { displayName: displayName.trim() });
  let emailSent = false;
  try { await sendEmailVerification(credential.user); emailSent = true; } catch { /* Report delivery outcome. */ }
  // Registration creates identity only. It does not enroll anyone in a tenant.
  return { user: {
    uid: credential.user.uid, email: credential.user.email || '',
    displayName: credential.user.displayName || displayName.trim(),
    emailVerified: credential.user.emailVerified === true, role: 'VIEWER', isSuperAdmin: false,
  }, emailSent };
}
export async function signInWithEmail(email: string, password?: string): Promise<AppUser> {
  requireFirebase();
  if (!(email || '').trim() || !password) throw authError('auth/credentials-required');
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  explicitlySignedOut = false;
  return resolveFirebaseUser(credential.user);
}
export async function signInWithGoogle(): Promise<AppUser> {
  requireFirebase();
  if (!googleProvider) throw authError('auth/configuration-missing');
  const credential = await signInWithPopup(auth, googleProvider);
  explicitlySignedOut = false;
  return resolveFirebaseUser(credential.user);
}
export async function logout(): Promise<void> {
  explicitlySignedOut = true;
  saveStoredUser(null);
  if (isFirebaseConfigured() && auth) await signOut(auth);
}
export async function sendPasswordReset(email: string): Promise<void> {
  requireFirebase();
  await sendPasswordResetEmail(auth, email.trim());
}
export async function sendVerificationEmail(): Promise<void> {
  requireFirebase();
  if (!auth.currentUser) throw authError('auth/unauthenticated');
  await sendEmailVerification(auth.currentUser);
}
export async function reloadCurrentUser(): Promise<AppUser | null> {
  if (!isFirebaseConfigured() || !auth?.currentUser) { saveStoredUser(null); return null; }
  const user = auth.currentUser;
  await user.reload();
  return (await readFirebaseSession(user, true)).user;
}
export function getCurrentUser(): AppUser | null {
  return !explicitlySignedOut && isFirebaseConfigured() && auth?.currentUser?.uid === sessionUser?.uid && Date.now() < sessionExpiresAt ? sessionUser : null;
}
export async function getIdToken(forceRefresh = false): Promise<string | null> {
  return (await getAuthenticatedSession(forceRefresh)).token;
}
