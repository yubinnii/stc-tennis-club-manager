// Firebase 사용자를 관리자로 변경하는 스크립트
// 사용법: node server/make-admin.js <학번>

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Firebase Admin 초기화
if (!admin.apps.length) {
  const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.VITE_FIREBASE_PROJECT_ID
    });
  }
}

const db = admin.firestore();

async function makeAdmin() {
  const studentId = process.argv[2];
  
  if (!studentId) {
    console.log('❌ 사용법: node server/make-admin.js <학번>');
    console.log('예시: node server/make-admin.js 2020310054');
    process.exit(1);
  }

  try {
    console.log(`🔍 학번 ${studentId} 검색 중...`);
    
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('studentId', '==', studentId).get();
    
    if (snapshot.empty) {
      console.log('❌ 해당 학번의 사용자를 찾을 수 없습니다.');
      process.exit(1);
    }
    
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    
    await userDoc.ref.update({
      role: 'admin',
      isAdmin: true,
      status: 'approved'
    });
    
    console.log('✅ 관리자 권한이 부여되었습니다!');
    console.log(`   이름: ${userData.name}`);
    console.log(`   학번: ${userData.studentId}`);
    console.log(`   역할: admin`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
}

makeAdmin();
