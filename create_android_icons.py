#!/usr/bin/env python3
from PIL import Image

# 원본 아이콘 로드
original_icon = Image.open('/Users/yubinnii/Desktop/SKKU/stc-tennis-club-manager/public/icon.png')

# Android 아이콘 크기들 (DPI별)
icon_sizes = {
    'ldpi': 36,
    'mdpi': 48,
    'hdpi': 72,
    'xhdpi': 96,
    'xxhdpi': 144,
    'xxxhdpi': 192,
}

base_path = '/Users/yubinnii/Desktop/SKKU/stc-tennis-app/android/app/src/main/res'

print("🎨 Android 아이콘 생성 중...")

for dpi, size in icon_sizes.items():
    try:
        # 리사이즈
        resized = original_icon.resize((size, size), Image.Resampling.LANCZOS)
        
        # 디렉토리 경로
        dir_name = f"mipmap-{dpi}"
        dir_path = f"{base_path}/{dir_name}"
        
        # 저장
        file_path = f"{dir_path}/ic_launcher_foreground.png"
        resized.save(file_path)
        print(f"✅ {dpi} ({size}x{size}px) 아이콘 생성 완료")
        
    except Exception as e:
        print(f"⚠️  {dpi} 생성 중 오류: {e}")

print("\n✨ 모든 아이콘 생성 완료!")
