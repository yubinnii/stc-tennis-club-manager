#!/bin/bash
# Frontend 빌드
npm run build

# Backend 디렉토리로 이동
cd server

# Backend 의존성 설치
npm install

# 메인 디렉토리로 돌아가기
cd ..
