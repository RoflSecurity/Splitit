#!/usr/bin/env node
import { execSync } from "node:child_process";
import path from "node:path";
import fs from "fs";

if (process.argv.length < 3) {
  console.log("Usage: splitit <youtube_url>");
  process.exit(1);
}

const url = process.argv[2];
const tempDir = path.join(process.cwd(), "temp");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

const ffmpegPath = path.join(process.cwd(), "bin", "ffmpeg");
const ytDlpPath = path.join(process.cwd(), "bin", "yt-dlp");
const spleeterScript = path.join(process.cwd(), "scripts", "spleeter-launcher.py");

try {
  console.log("📥 Téléchargement de la vidéo...");
  execSync(`"${ytDlpPath}" -f bestaudio -o "${tempDir}/%(title)s.%(ext)s" "${url}"`, { stdio: 'inherit' });

  const files = fs.readdirSync(tempDir).filter(f => f.endsWith('.webm') || f.endsWith('.mp4'));
  if (!files.length) throw new Error("Aucune vidéo téléchargée");

  const videoFile = path.join(tempDir, files[0]);
  console.log("🎛️ Vidéo téléchargée :", videoFile);

  console.log("🎚️ Séparation avec Spleeter...");
  execSync(`proot-distro login debian -- python3 "${spleeterScript}" "${videoFile}"`, { stdio: 'inherit' });

  const baseName = path.basename(videoFile, path.extname(videoFile));
  const outputDir = path.join(tempDir, baseName);

  ["vocals", "accompaniment", "full"].forEach(track => {
    const wavPath = path.join(outputDir, track + ".wav");
    if (fs.existsSync(wavPath)) {
      const mp3Path = path.join(outputDir, track + ".mp3");
      console.log(`🔊 Conversion ${track} -> MP3`);
      execSync(`"${ffmpegPath}" -i "${wavPath}" -q:a 0 "${mp3Path}"`, { stdio: 'inherit' });
    }
  });

  console.log("✅ Toutes les pistes MP3 sont prêtes dans :", outputDir);
} catch (e) {
  console.error("❌ Erreur :", e.message);
  process.exit(1);
}
