#!/usr/bin/env python3
import sys
import subprocess
from pathlib import Path
from yt_dlp import YoutubeDL

url = sys.argv[1]
output_dir = Path(sys.argv[2])
output_dir.mkdir(exist_ok=True)

# Télécharger l'audio
ydl_opts = {
    'format': 'bestaudio/best',
    'outtmpl': str(output_dir / '%(title)s.%(ext)s'),
    'quiet': True
}

with YoutubeDL(ydl_opts) as ydl:
    info = ydl.extract_info(url, download=True)
    mp3_path = str(output_dir / f"{info['title']}.mp3")

# Spleeter : séparer voix / instrument
subprocess.run(["spleeter", "separate", "-p", "spleeter:2stems", "-o", str(output_dir), mp3_path])
