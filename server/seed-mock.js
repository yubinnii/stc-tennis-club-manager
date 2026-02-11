// Firebase Firestore + Auth 목데이터 생성 스크립트
// 사용법: node server/seed-mock.js

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// 환경 변수 로드
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Firebase Admin 초기화
if (!admin.apps.length) {
  const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Service Account Key로 Firebase 초기화');
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.VITE_FIREBASE_PROJECT_ID
    });
    console.log('✅ 환경 변수로 Firebase 초기화');
  }
}

const db = admin.firestore();
const auth = admin.auth();

const calculateTier = (singlesPoint, doublesPoint) => {
  const avgPoint = (singlesPoint + doublesPoint) / 2;
  if (avgPoint >= 1550) return 'Gold';
  if (avgPoint >= 1450) return 'Silver';
  return 'Bronze';
};

const users = [
  { name: '이유빈', studentId: '2023310054', password: 'yubin1004', role: 'admin' },
  { name: '서경태', studentId: '2020310054', password: 'yubin1004', role: 'member' },
  { name: '김선우', studentId: '2024310054', password: 'yubin1004', role: 'member' },
  { name: '김종헌', studentId: '2025310054', password: 'yubin1004', role: 'member' }
];

async function upsertUser({ name, studentId, password, role }) {
  const email = `${studentId}@stc-tennis.local`;

  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(email);
    await auth.updateUser(userRecord.uid, { password });
    console.log(`ℹ️  기존 사용자 업데이트: ${name} (${studentId})`);
  } catch (e) {
    userRecord = await auth.createUser({ email, password });
    console.log(`✅ 새 사용자 생성: ${name} (${studentId})`);
  }

  const singlesPoint = 1500;
  const doublesPoint = 1500;

  const userDoc = {
    id: userRecord.uid,
    name,
    studentId,
    rank: 0,
    tier: calculateTier(singlesPoint, doublesPoint),
    singlesPoint,
    doublesPoint,
    isAdmin: role === 'admin',
    avatar: '/default-profile.png',
    role,
    status: 'approved'
  };

  await db.collection('users').doc(userRecord.uid).set(userDoc, { merge: true });
  console.log(`📝 Firestore users 업데이트: ${name}`);
}

async function seed() {
  console.log('🌱 목데이터 생성 시작...');
  for (const u of users) {
    await upsertUser(u);
  }
  console.log('✅ 목데이터 생성 완료!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ 목데이터 생성 실패:', err);
  process.exit(1);
});
