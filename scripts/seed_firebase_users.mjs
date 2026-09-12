/**
 * FCS AI WORKFORCE OS — Firebase Auth User Seeder & Admin Provisioner
 * 
 * Uses Firebase Admin SDK with Service Account:
 * firebase-adminsdk-fbsvc@fcs-ai-workforce.iam.gserviceaccount.com
 * Key: fcs-ai-workforce-firebase-adminsdk-fbsvc-d674a43d01.json
 * 
 * Seeds and configures the 4 pilot enterprise accounts with verified emails,
 * standard enterprise passwords (Fcs@2026!), and Custom Claims (roles & tenant).
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const serviceAccountPath = path.join(
  rootDir,
  'fcs-ai-workforce-firebase-adminsdk-fbsvc-d674a43d01.json'
);

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`❌ Service account file not found at: ${serviceAccountPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin
const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });

const auth = getAuth(app);

export const PILOT_USERS = [
  {
    uid: 'fcs-super-admin-chuyen',
    email: 'coach.chuyen@gmail.com',
    password: 'Fcs@2026!',
    displayName: 'Coach Chuyên (Super Admin)',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    emailVerified: true,
    claims: {
      role: 'PLATFORM_SUPER_ADMIN',
      tenantId: 'FCS-000001',
      officeId: 'OFF-01',
      allowedOfficeIds: ['*'],
      staffId: 'STF-SUPER',
      isSuperAdmin: true,
    },
  },
  {
    uid: 'fcs-ceo-fcs1',
    email: 'ceo-fcs@breaths.live',
    password: 'Fcs@2026!',
    displayName: 'Giám đốc Điều hành (CEO FCS 1)',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    emailVerified: true,
    claims: {
      role: 'TENANT_ADMIN',
      tenantId: 'FCS-000001',
      officeId: 'OFF-01',
      allowedOfficeIds: ['*'],
      staffId: 'STF-CEO',
      isSuperAdmin: false,
    },
  },
  {
    uid: 'fcs-manager-fcs1',
    email: 'manager-fcs@breaths.live',
    password: 'Fcs@2026!',
    displayName: 'Trưởng phòng Vận hành (FCS 1)',
    photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    emailVerified: true,
    claims: {
      role: 'TENANT_MANAGER',
      tenantId: 'FCS-000001',
      officeId: 'OFF-01',
      allowedOfficeIds: ['OFF-01', 'OFF-02'],
      staffId: 'STF-MGR',
      isSuperAdmin: false,
    },
  },
  {
    uid: 'fcs-recruiter-fcs1',
    email: 'staff-fcs@breaths.live',
    password: 'Fcs@2026!',
    displayName: 'Chuyên viên Tuyển dụng (FCS 1)',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    emailVerified: true,
    claims: {
      role: 'RECRUITER',
      tenantId: 'FCS-000001',
      officeId: 'OFF-01',
      allowedOfficeIds: ['OFF-01'],
      staffId: 'STF-REC',
      isSuperAdmin: false,
    },
  },
];

async function seedUsers() {
  console.log('🚀 Đang kết nối Firebase Auth (Project:', serviceAccount.project_id, ')...');
  console.log('👤 Service Account:', serviceAccount.client_email);

  for (const userConfig of PILOT_USERS) {
    try {
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(userConfig.email);
        console.log(`\n🔄 Tài khoản đã tồn tại: ${userConfig.email} (UID: ${userRecord.uid}) -> Đang cập nhật...`);
        userRecord = await auth.updateUser(userRecord.uid, {
          password: userConfig.password,
          displayName: userConfig.displayName,
          photoURL: userConfig.photoURL,
          emailVerified: userConfig.emailVerified,
        });
      } catch (notFoundErr) {
        if (notFoundErr.code === 'auth/user-not-found') {
          console.log(`\n✨ Tạo mới tài khoản: ${userConfig.email}...`);
          userRecord = await auth.createUser({
            uid: userConfig.uid,
            email: userConfig.email,
            password: userConfig.password,
            displayName: userConfig.displayName,
            photoURL: userConfig.photoURL,
            emailVerified: userConfig.emailVerified,
          });
        } else {
          throw notFoundErr;
        }
      }

      // Set Custom Claims for standard RBAC authorization
      await auth.setCustomUserClaims(userRecord.uid, userConfig.claims);
      console.log(`✅ Đã thiết lập Custom Claims: role=${userConfig.claims.role}, tenant=${userConfig.claims.tenantId}`);
      console.log(`   Email: ${userConfig.email} | Mật khẩu: ${userConfig.password}`);
    } catch (err) {
      console.error(`❌ Lỗi khi thiết lập tài khoản ${userConfig.email}:`, err.message);
    }
  }

  console.log('\n🎉 Hoàn tất đồng bộ người dùng vào Firebase Authentication!');
}

seedUsers().catch(err => {
  console.error('Fatal error seeding users:', err);
  process.exit(1);
});
