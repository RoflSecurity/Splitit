#!/usr/bin/env python3
import sys
from spleeter.separator import Separator
from pathlib import Path

if len(sys.argv) < 2:
    print("Usage: spleeter-launcher.py <audio file>")
    sys.exit(1)

audio_file = sys.argv[1]
output_dir = str(Path(audio_file).with_suffix(''))

separator = Separator('spleeter:2stems')
separator.separate_to_file(audio_file, output_dir)

print(f"✅ Séparation terminée : {output_dir}")
