/**
 * FCS AI WORKFORCE OS — Enterprise Firebase Admin SDK Module
 * 
 * Provides server-side user management, token verification, and role-based access control (RBAC).
 * Service Account: firebase-adminsdk-fbsvc@fcs-ai-workforce.iam.gserviceaccount.com
 */

import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth, DecodedIdToken, UserRecord } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';

export interface EnterpriseClaims {
  role: 'PLATFORM_SUPER_ADMIN' | 'TENANT_ADMIN' | 'TENANT_MANAGER' | 'RECRUITER' | 'TENANT_VIEWER';
  tenantId: string;
  officeId?: string;
  allowedOfficeIds?: string[];
  staffId?: string;
  isSuperAdmin?: boolean;
}

export interface CreateEnterpriseUserParams {
  email: string;
  password: string;
  displayName: string;
  photoURL?: string;
  claims: EnterpriseClaims;
}

let adminApp: App | null = null;
let adminAuth: Auth | null = null;

export function getFirebaseAdmin(): { app: App; auth: Auth } {
  if (adminApp && adminAuth) {
    return { app: adminApp, auth: adminAuth };
  }

  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    path.resolve(process.cwd(), 'fcs-ai-workforce-firebase-adminsdk-fbsvc-d674a43d01.json');

  if (!fs.existsSync(keyPath)) {
    throw new Error(`Firebase Admin Service Account file not found at: ${keyPath}`);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

  adminApp = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });

  adminAuth = getAuth(adminApp);
  return { app: adminApp, auth: adminAuth };
}

/**
 * Server-side token verification.
 * Decodes the Firebase ID token and ensures validity, expiration, and claims.
 */
export async function verifyFirebaseIdToken(idToken: string): Promise<DecodedIdToken> {
  const { auth } = getFirebaseAdmin();
  return auth.verifyIdToken(idToken, true);
}

/**
 * Create a new enterprise workforce user with verified status and custom claims.
 */
export async function createEnterpriseUser(
  params: CreateEnterpriseUserParams
): Promise<UserRecord> {
  const { auth } = getFirebaseAdmin();

  const userRecord = await auth.createUser({
    email: params.email.trim().toLowerCase(),
    password: params.password,
    displayName: params.displayName.trim(),
    photoURL: params.photoURL,
    emailVerified: true,
  });

  await auth.setCustomUserClaims(userRecord.uid, params.claims);
  return userRecord;
}

/**
 * Update or set custom claims for an existing user (RBAC role assignment).
 */
export async function setEnterpriseUserClaims(
  uid: string,
  claims: EnterpriseClaims
): Promise<void> {
  const { auth } = getFirebaseAdmin();
  await auth.setCustomUserClaims(uid, claims);
}

/**
 * Lookup user by email.
 */
export async function getEnterpriseUserByEmail(email: string): Promise<UserRecord | null> {
  const { auth } = getFirebaseAdmin();
  try {
    return await auth.getUserByEmail(email.trim().toLowerCase());
  } catch (err: any) {
    if (err.code === 'auth/user-not-found') return null;
    throw err;
  }
}

/**
 * List all registered enterprise users.
 */
export async function listEnterpriseUsers(maxResults = 100): Promise<UserRecord[]> {
  const { auth } = getFirebaseAdmin();
  const listResult = await auth.listUsers(maxResults);
  return listResult.users;
}

/**
 * Revoke all refresh tokens for a user (force logout across all devices).
 */
export async function revokeUserSessions(uid: string): Promise<void> {
  const { auth } = getFirebaseAdmin();
  await auth.revokeRefreshTokens(uid);
}
