#!/bin/bash
# Supprime node_modules, venv, dist, fichiers temporaires

echo "🧹 Nettoyage du projet..."
rm -rf node_modules venv dist *.egg-info
echo "✅ Nettoyage terminé"
