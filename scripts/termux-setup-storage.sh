#!/bin/bash
# termux-setup-storage.sh
# Lance la configuration du stockage partagé pour Termux

echo "🔧 Lancement de termux-setup-storage..."
termux-setup-storage
echo "✅ Termux storage prêt. Les fichiers partagés sont accessibles via \$HOME/storage/shared/"
