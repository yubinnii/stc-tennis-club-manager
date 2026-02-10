#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont

# 색상 정의
GREEN = (11, 91, 65)  # #0B5B41
WHITE = (255, 255, 255)

print("🎨 STC 테니스 클럽 아이콘 생성 중...")

# 1. 앱 아이콘 (512x512px, 초록 배경 + 흰 STC) - 글자 크기 줄임
try:
    icon = Image.new('RGB', (512, 512), GREEN)
    draw = ImageDraw.Draw(icon)
    font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 140)  # 220 → 140으로 줄임
    
    bbox = draw.textbbox((0, 0), "STC", font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (512 - text_width) // 2
    y = (512 - text_height) // 2
    
    draw.text((x, y), "STC", font=font, fill=WHITE)
    icon.save('public/icon.png')
    print("✅ 앱 아이콘 생성 완료: public/icon.png (512x512px)")
except Exception as e:
    print(f"❌ 아이콘 생성 실패: {e}")

# 2. 스플래시 스크린 (2732x2732px, 흰 배경 + 초록 STC만) - 글자 크기 줄임
try:
    splash = Image.new('RGB', (2732, 2732), WHITE)
    draw = ImageDraw.Draw(splash)
    font_splash = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 380)  # 600 → 380으로 줄임
    
    bbox = draw.textbbox((0, 0), "STC", font=font_splash)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (2732 - text_width) // 2
    y = (2732 - text_height) // 2
    
    draw.text((x, y), "STC", font=font_splash, fill=GREEN)
    splash.save('public/splash.png')
    print("✅ 스플래시 스크린 생성 완료: public/splash.png (2732x2732px)")
except Exception as e:
    print(f"❌ 스플래시 생성 실패: {e}")

print("\n✨ 디자인 완료!")
