// Firebase Firestore 데이터 초기화 스크립트
// 사용법: node server/reset-db.js

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// 환경 변수 로드
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Firebase Admin 초기화
if (!admin.apps.length) {
  // Service Account Key가 있으면 사용, 없으면 환경 변수로 초기화
  const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Service Account Key로 Firebase 초기화');
  } else {
    // 환경 변수로 초기화 (Vercel 등에서 사용)
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.VITE_FIREBASE_PROJECT_ID
    });
    console.log('✅ 환경 변수로 Firebase 초기화');
  }
}

const db = admin.firestore();
const auth = admin.auth();

async function deleteCollection(collectionName) {
  const collectionRef = db.collection(collectionName);
  const query = collectionRef.limit(500);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve, reject);
  });
}

async function deleteQueryBatch(query, resolve, reject) {
  try {
    const snapshot = await query.get();

    if (snapshot.size === 0) {
      resolve();
      return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`  - ${snapshot.size}개 문서 삭제됨`);

    // 다음 배치 삭제
    process.nextTick(() => {
      deleteQueryBatch(query, resolve, reject);
    });
  } catch (error) {
    reject(error);
  }
}

async function deleteAllUsers() {
  const listUsersResult = await auth.listUsers();
  const uids = listUsersResult.users.map(user => user.uid);
  
  if (uids.length === 0) {
    console.log('  - 삭제할 사용자 없음');
    return;
  }

  await auth.deleteUsers(uids);
  console.log(`  - ${uids.length}명의 사용자 삭제됨`);
}

async function resetDatabase() {
  console.log('🔥 Firebase 데이터베이스 초기화 중...\n');

  try {
    // Firestore 컬렉션 삭제
    console.log('📦 Firestore 컬렉션 삭제 중...');
    await deleteCollection('users');
    console.log('✅ users 컬렉션 삭제 완료');
    
    await deleteCollection('matches');
    console.log('✅ matches 컬렉션 삭제 완료');
    
    await deleteCollection('approvals');
    console.log('✅ approvals 컬렉션 삭제 완료');
    
    await deleteCollection('canball_pool');
    console.log('✅ canball_pool 컬렉션 삭제 완료');
    
    await deleteCollection('canball_user');
    console.log('✅ canball_user 컬렉션 삭제 완료');

    // Authentication 사용자 삭제
    console.log('\n🔐 Authentication 사용자 삭제 중...');
    await deleteAllUsers();
    console.log('✅ Authentication 사용자 삭제 완료');

    console.log('\n✅ 모든 데이터가 삭제되었습니다!');
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
}

resetDatabase();
