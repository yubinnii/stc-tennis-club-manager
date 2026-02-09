# 배포 가이드

## Railway 배포 방법

### 1. Railway 계정 생성
https://railway.app 접속 후 GitHub로 로그인

### 2. 새 프로젝트 생성
- "New Project" → "Deploy from GitHub"
- 이 저장소 선택

### 3. 환경 변수 설정
Railway 대시보드에서 `Variables` 탭:
```
GEMINI_API_KEY=your_api_key_here
NODE_ENV=production
PORT=4000
```

### 4. 배포 스크립트 설정
Railway 프로젝트 설정에서:
- **Build Command:** `npm run deploy-build`
- **Start Command:** `npm start`

### 5. 배포 실행
커밋 및 푸시하면 자동으로 배포됨

---

## Vercel + Railway 분리 배포 (Frontend/Backend 분리)

### Frontend (Vercel)
1. Vercel에서 새 프로젝트 생성
2. 이 저장소 연결
3. Build Command: `npm run build`
4. Output Directory: `dist`

### Backend (Railway)
1. `server` 디렉토리를 별도 Git 저장소로 분리
2. Railway에 `server` 저장소 배포

### API 엔드포인트 수정
`src/components/*.tsx`, `src/pages/*.tsx` 파일에서:
```javascript
// 변경 전
const resp = await fetch('http://localhost:4000/...');

// 변경 후 (환경 변수 사용)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const resp = await fetch(`${API_URL}/...`);
```

---

## Render 배포 (Railway 대안)

https://render.com 접속:
1. "New" → "Web Service"
2. GitHub 연결 → 저장소 선택
3. Build Command: `npm run deploy-build`
4. Start Command: `npm start`
5. Environment 탭에서 환경 변수 설정

---

## 로컬 빌드 & 테스트

```bash
# 로컬에서 빌드
npm run build

# 빌드 결과 미리보기
npm start
```

그러면 http://localhost:4000 에서 배포 버전을 테스트할 수 있습니다.
