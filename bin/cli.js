#!/usr/bin/env node
import { execSync } from "child_process";
import axios from "axios";

const url = process.argv[2];

if (!url) {
  console.error("❌ Merci de fournir une URL YouTube.");
  process.exit(1);
}

(async () => {
  try {
    console.log(`⛵ Téléchargement de ${url}...`);
    
    // Télécharge la vidéo avec yt-dlp
    execSync(`yt-dlp -f bestaudio "${url}" -o "%(title)s.%(ext)s"`, { stdio: "inherit" });

    console.log("✅ Téléchargement terminé !");
    
    // Séparation audio avec Spleeter
    console.log("🎚️ Séparation audio via Spleeter...");
    execSync(`spleeter separate -i "*.mp3" -p spleeter:2stems -o output`, { stdio: "inherit" });

    console.log("✅ Séparation terminée !");
  } catch (err) {
    console.error("❌ Une erreur est survenue :", err.message);
    process.exit(1);
  }
})();
