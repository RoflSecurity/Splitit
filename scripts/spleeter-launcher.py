#!/usr/bin/env python3
import subprocess
import sys
from pathlib import Path
import yt_dlp

url = sys.argv[1]
output_dir = Path(sys.argv[2])
output_dir.mkdir(exist_ok=True)

# Télécharger audio
mp3_path = output_dir / "audio.mp3"
ydl_opts = {"format": "bestaudio/best", "outtmpl": str(mp3_path)}
with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    ydl.download([url])

# Séparer les pistes avec Spleeter
try:
    subprocess.run(["spleeter", "separate", "-p", "spleeter:2stems", "-o", str(output_dir), str(mp3_path)], check=True)
except FileNotFoundError:
    print("⚠️ Spleeter non trouvé. Installez-le via 'pip install spleeter'")
    sys.exit(1)
