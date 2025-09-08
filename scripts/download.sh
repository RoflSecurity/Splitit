#!/bin/bash
url="$1"
output_dir="./output"
mkdir -p "$output_dir"

echo "⬇️ Téléchargement MP3..."
yt-dlp -x --audio-format mp3 -o "$output_dir/%(title)s.%(ext)s" "$url"

echo "🎵 Conversion MP3 → WAV..."
for f in "$output_dir"/*.mp3; do
    ffmpeg -i "$f" "${f%.mp3}.wav"
done
