#!/bin/bash
# Copies SplitIt output to Termux shared storage from current directory

OUTPUT_DIR="./output"
DEST="$HOME/storage/shared/output"

if [ -d "$OUTPUT_DIR" ]; then
    mkdir -p "$DEST"
    cp -r "$OUTPUT_DIR/"* "$DEST"
    echo "✅ Files copied to $DEST"
else
    echo "⚠️ Output folder not found in current directory"
fi
