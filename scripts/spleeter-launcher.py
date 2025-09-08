#!/usr/bin/env python3
import sys
import os
import subprocess
from pathlib import Path

url = sys.argv[1]
output_dir = sys.argv[2]

Path(output_dir).mkdir(parents=True, exist_ok=True)

# Télécharger le mp3 depuis YouTube
mp3_path = os.path.join(output_dir, "audio.mp3")
subprocess.run(["yt-dlp", "-x", "--audio-format", "mp3", "-o", mp3_path, url])

# Détecter l'OS
is_termux = "ANDROID_ROOT" in os.environ

# Spleeter
if is_termux:
    # Termux: seulement 2 pistes (mix mp3 + wav)
    subprocess.run(["spleeter", "separate", "-p", "spleeter:2stems", "-o", output_dir, mp3_path])
else:
    # Linux/Windows/macOS: 6 pistes (vocals/instrument/mix)
    subprocess.run(["spleeter", "separate", "-p", "spleeter:4stems", "-o", output_dir, mp3_path])
