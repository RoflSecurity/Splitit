#!/bin/bash

# Chemins
BIN="$(dirname "$0")/../bin"
ROOT="$(dirname "$0")/.."

# Supprimer les binaires
for f in yt-dlp spleeter ffmpeg ffprobe manpages readme.txt GPLv3.txt qt-faststart model; do
    if [ -e "$BIN/$f" ]; then
        rm -rf "$BIN/$f"
        echo "Deleted $f"
    else
        echo "$f not found"
    fi
done

# Supprimer les artefacts Node.js
if [ -d "$ROOT/node_modules" ]; then
    rm -rf "$ROOT/node_modules"
    echo "Deleted node_modules"
fi

for f in package-lock.json yarn.lock; do
    if [ -f "$ROOT/$f" ]; then
        rm -f "$ROOT/$f"
        echo "Deleted $f"
    fi
done

echo "✅ Cleanup done!"
