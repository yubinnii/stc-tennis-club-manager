#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont

GREEN = (11, 91, 65)
WHITE = (255, 255, 255)
font_path = '/tmp/Cinzel-Bold.ttf'

print("🎨 Cinzel 글씨체로 아이콘 생성 중...")

# 1. 앱 아이콘 (512x512px)
try:
    icon = Image.new('RGB', (512, 512), GREEN)
    draw = ImageDraw.Draw(icon)
    font = ImageFont.truetype(font_path, 140)
    bbox = draw.textbbox((0, 0), "STC", font=font)
    x = (512 - (bbox[2] - bbox[0])) // 2
    y = (512 - (bbox[3] - bbox[1])) // 2
    draw.text((x, y), "STC", font=font, fill=WHITE)
    icon.save('public/icon.png')
    print("✅ 앱 아이콘 생성 완료 (Cinzel)")
except Exception as e:
    print(f"❌ 앱 아이콘 오류: {e}")

# 2. 스플래시 스크린 (2732x2732px)
try:
    splash = Image.new('RGB', (2732, 2732), WHITE)
    draw = ImageDraw.Draw(splash)
    font_splash = ImageFont.truetype(font_path, 380)
    bbox = draw.textbbox((0, 0), "STC", font=font_splash)
    x = (2732 - (bbox[2] - bbox[0])) // 2
    y = (2732 - (bbox[3] - bbox[1])) // 2
    draw.text((x, y), "STC", font=font_splash, fill=GREEN)
    splash.save('public/splash.png')
    print("✅ 스플래시 스크린 생성 완료 (Cinzel)")
except Exception as e:
    print(f"❌ 스플래시 오류: {e}")

print("\n✨ Cinzel 글씨체로 모든 디자인 완료!")
