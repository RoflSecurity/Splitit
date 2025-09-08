#!/bin/bash
url="$1"
output="$2"
mkdir -p "$output"

yt-dlp -f bestaudio "$url" -o "$output/audio.%(ext)s"
ffmpeg -i "$output/audio.webm" -vn -acodec libmp3lame "$output/audio.mp3"
ffmpeg -i "$output/audio.mp3" "$output/audio.wav"
rm "$output/audio.webm"
