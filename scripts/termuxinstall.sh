#!/bin/bash
if [ "$EUID" -eq 0 ]; then
  echo "⚠️ Exécute ce script avec ton utilisateur Termux, pas root."
  exit 1
fi

pkg update -y && pkg upgrade -y
pkg install -y python ffmpeg git curl

python3 -m ensurepip --upgrade
pip install --upgrade pip
pip install spleeter tensorflow-cpu

echo "🎵 Test de Spleeter..."
python3 -c "from spleeter.separator import Separator; print('Spleeter OK ✅')"

if [ "$1" ]; then
    echo "🚀 Test de splitit avec l'URL : $1"
    splitit "$1"
else
    echo "ℹ️ Aucun URL fourni pour test."
fi
