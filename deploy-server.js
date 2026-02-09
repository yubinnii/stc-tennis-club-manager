// 배포용 서버 (Frontend 빌드 결과도 함께 제공)
import express from 'express';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Backend 서버 실행
spawn('node', [path.join(__dirname, 'server/index.js')], {
  stdio: 'inherit'
});

// Frontend 정적 파일 제공
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// 모든 요청을 index.html로 리다이렉트 (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
