# Firebase + Vercel 배포 가이드

## 1단계: Firebase 프로젝트 생성

### 1.1 Firebase Console 접속
- [Firebase Console](https://console.firebase.google.com) 방문
- "프로젝트 만들기" 클릭
- 프로젝트 이름: "STC Tennis Club"
- Google Analytics 비활성화 (무료 버전)

### 1.2 Web 앱 등록
- Firebase 프로젝트 > 설정 > 일반
- "STC Tennis Club Manager" 웹앱 등록
- 설정 정보 복사

## 2단계: Firestore 데이터베이스 설정

### 2.1 Firestore 생성
- Firebase Console > Firestore Database
- "데이터베이스 만들기"
- 위치: asia-southeast1 (또는 가장 가까운 지역)
- 시작 모드: **테스트 모드** (초기 개발용)

### 2.2 보안 규칙 설정 (나중에 변경)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 승인 대기 사용자는 자신의 데이터만 읽을 수 있음
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // 관리자는 모든 사용자 데이터 읽을 수 있음
    match /users/{userId} {
      allow read: if isAdmin();
    }
    
    // 매치 기록
    match /matches/{matchId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    // 승인 요청 (공개, 실제로는 읽기 제한 필요)
    match /approvals/{approvalId} {
      allow read: if isAdmin();
      allow create: if request.auth != null;
    }
    
    // Can Ball 풀
    match /canball_pool/{docId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    match /canball_user/{docId} {
      allow read, write: if request.auth.uid == resource.data.userId || isAdmin();
    }
  }
  
  function isAdmin() {
    return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
  }
}
```

## 3단계: 환경 변수 설정

### 3.1 .env.local 파일 생성 (로컬 개발용)
프로젝트 루트에 `.env.local` 파일 생성:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_GEMINI_API_KEY=your_gemini_api_key
```

값은 Firebase Console > 프로젝트 설정에서 복사

## 4단계: 로컬 테스트

```bash
# 의존성 설치
npm install

# 로컬 개발 서버 실행
npm run dev
```

## 5단계: Vercel 배포

### 5.1 GitHub에 푸시
```bash
git add .
git commit -m "feat: migrate to Firebase"
git push
```

### 5.2 Vercel에 배포
- [Vercel](https://vercel.com) 접속
- GitHub 계정으로 로그인
- "Import Project" 클릭
- 저장소 선택
- 환경 변수 입력 (Firebase 설정값)
- "Deploy" 클릭

### 5.3 배포 완료
- Vercel에서 배포 URL 제공
- PWA 설치 가능 (HTTPS 자동 지원)

## 6단계: 초기 관리자 설정

배포 후:
1. 웹사이트 접속 → 회원가입 (student ID, 비밀번호)
2. 첫 가입자가 자동 admin 권한 받도록 설정 (선택사항)

또는 Firebase Console에서 직접 수정:
- Firestore > users > 첫 사용자 선택
- role: "admin", status: "approved" 로 수정

## 주의사항

⚠️ **테스트 모드에서 프로덕션 모드로 전환 시 보안 규칙 필수**

⚠️ **민감한 데이터가 있다면 인증 강화 필요**

⚠️ **사용자가 증가하면 Firestore 읽기/쓰기 비용 발생**

## 비용 예상

- Firestore: 무료 (50K 읽기/일, 20K 쓰기/일)
- Vercel: 무료
- 총 비용: **무료** 🎉

## 트러블슈팅

### "VITE_FIREBASE_*가 정의되지 않았습니다" 에러
→ .env.local 파일 확인

### "Permission denied" 에러
→ Firestore 보안 규칙 확인

### "Firebase is not initialized"
→ 환경 변수 재설정 후 `npm install` 실행
