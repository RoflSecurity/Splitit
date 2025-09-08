#!/usr/bin/env node
import { execSync } from "node:child_process";
import path from "node:path";
import fs from "fs";

const BIN_DIR = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "bin");
if (!fs.existsSync(BIN_DIR)) fs.mkdirSync(BIN_DIR);

function createSpinner(text) {
  const frames = ["⠋","⠙","⠹","⠸","⠼","⠴","⠦","⠧","⠇","⠏"];
  let i = 0;
  const interval = setInterval(() => process.stdout.write(`\r${frames[i % frames.length]} ${text}`), 100);
  return () => { clearInterval(interval); process.stdout.write(`\r✅ ${text}\n`); };
}

function downloadFile(url, dest, label) {
  const stop = createSpinner(label);
  execSync(`curl -L "${url}" -o "${dest}"`, { stdio: "inherit" });
  stop();
}

function setupProotDebian() {
  if (process.env.TERMUX_VERSION) {
    console.log("⚠️ Termux avec Python incompatible détecté !");
    console.log("Installation de Proot Debian pour Spleeter...");
    try {
      execSync("pkg install -y proot-distro bzip2 xz-utils python git", { stdio: "inherit" });
      execSync("proot-distro install debian || true", { stdio: "inherit" });
      console.log("\n✅ Proot Debian installé. Pour utiliser Spleeter :");
      console.log("    proot-distro login debian");
      console.log("    python3 -m pip install --upgrade pip setuptools wheel");
      console.log("    pip install spleeter");
    } catch {
      console.warn("\n⚠️ Impossible d'installer Proot Debian automatiquement.");
    }
  }
}

function setupDebianSpleeter() {
  try {
    const isDebian = fs.existsSync("/etc/debian_version") && !process.env.TERMUX_VERSION;
    if (isDebian) {
      console.log("Debian détecté : installation Python & Spleeter...");
      execSync("sudo apt update && sudo apt install -y python3 python3-pip python3-venv ffmpeg git", { stdio: "inherit" });
      execSync("python3 -m pip install --upgrade pip setuptools wheel", { stdio: "inherit" });
      execSync("python3 -m pip install spleeter", { stdio: "inherit" });
      console.log("\n✅ Spleeter installé avec succès sur Debian !");
    }
  } catch {
    console.warn("\n⚠️ Impossible d'installer Spleeter automatiquement sur Debian.");
  }
}

try {
  const YTDLP_URL = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp";
  const FFMPEG_URL = "https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz";

  const ytPath = path.join(BIN_DIR, "yt-dlp");
  if (!fs.existsSync(ytPath)) downloadFile(YTDLP_URL, ytPath, "Téléchargement de yt-dlp...");
  fs.chmodSync(ytPath, 0o755);

  const ffPath = path.join(BIN_DIR, "ffmpeg");
  if (!fs.existsSync(ffPath)) {
    const archivePath = path.join(BIN_DIR, "ffmpeg.tar.xz");
    downloadFile(FFMPEG_URL, archivePath, "Téléchargement de FFmpeg...");
    execSync(`tar -xf "${archivePath}" -C "${BIN_DIR}" --strip-components=1`);
    fs.chmodSync(ffPath, 0o755);
    fs.unlinkSync(archivePath);
  }

  setupProotDebian();
  setupDebianSpleeter();

  console.log("\n✅ Tout est installé et prêt pour Splitit !");
  console.log("⛵ - Made by RoflSec! Utilise 'splitit <yt url>' pour commencer.");
} catch (err) {
  console.error("Erreur lors de l'installation :", err);
  process.exit(1);
}
