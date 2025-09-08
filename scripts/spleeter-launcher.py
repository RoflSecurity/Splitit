#!/usr/bin/env python3
from spleeter.separator import Separator
import sys, os

def main():
    args = sys.argv[1:]
    if len(args) == 0:
        print("Usage: spleeter [separate options]")
        return

    # Séparation en 2 stems par défaut
    input_file = args[0]
    output_dir = os.path.join(os.path.dirname(input_file), os.path.splitext(os.path.basename(input_file))[0])
    separator = Separator('spleeter:2stems')
    separator.separate_to_file(input_file, output_dir)

    # Renommage des fichiers en vocals, accompaniment, full
    vocals_path = os.path.join(output_dir, "vocals.wav")
    accompaniment_path = os.path.join(output_dir, "accompaniment.wav")
    full_path = input_file  # la vidéo convertie en WAV avant

    print(f"✅ Fichiers générés : {vocals_path}, {accompaniment_path}, {full_path}")

if __name__ == "__main__":
    main()
