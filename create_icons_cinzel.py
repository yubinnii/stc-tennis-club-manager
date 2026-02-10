#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import urllib.request
import os

# 색상 정의
GREEN = (11, 91, 65)  # #0B5B41
WHITE = (255, 255, 255)

# Cinzel 폰트 다운로드 (로컬에 없으면)
font_path = '/tmp/Cinzel-Bold.ttf'
if not os.path.exists(font_path):
    print("📥 Cinzel 폰트 다운로드 중...")
    url = "https://github.com/googlefonts/cinzel/raw/main/fonts/ttf/Cinzel-Bold.ttf"
    try:
        urllib.request.urlretrieve(url, font_path)
        print("✅ 다운로드 완료")
    except:
        print("⚠️  다운로드 실패, 기본 폰트 사용")
        font_path = "/System/Library/Fonts/Helvetica.ttc"

# 1. 앱 아이콘 (512x512px, Cinzel Bold)
try:
    icon = Image.new('RGB', (512, 512), GREEN)
    draw = ImageDraw.Draw(icon)
    font = ImageFont.truetype(font_path, 140)
    
    bbox = draw.textbbox((0, 0), "STC", font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (512 - text_width) // 2
    y = (512 - text_height) // 2
    
    draw.text((x, y), "STC", font=font, fill=WHITE)
    icon.save('public/icon.png')
    print("✅ 앱 아이콘 생성 완료 (Cinzel 폰트)")
except Exception as e:
    print(f"❌ 아이콘 생성 실패: {e}")

# 2. 스플래시 스크린 (2732x2732px, Cinzel Bold)
try:
    splash = Image.new('RGB', (2732, 2732), WHITE)
    draw = ImageDraw.Draw(splash)
    font_splash = ImageFont.truetype(font_path, 380)
    
    bbox = draw.textbbox((0, 0), "STC", font=font_splash)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (2732 - text_width) // 2
    y = (2732 - text_height) // 2
    
    draw.text((x, y), "STC", font=font_splash, fill=GREEN)
    splash.save('public/splash.png')
    print("✅ 스플래시 스크린 생성 완료 (Cinzel 폰트)")
except Exception as e:
    print(f"❌ 스플래시 생성 실패: {e}")

print("\n✨ Cinzel 글씨체로 디자인 완료!")
