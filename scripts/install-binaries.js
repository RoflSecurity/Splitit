#!/usr/bin/env node
import { execSync } from "child_process";
import { existsSync, chmodSync } from "fs";
import { join } from "path";

const BIN_DIR = join(process.cwd(), "bin");

function log(msg) { console.log(msg); }
function warn(msg) { console.warn(msg); }

function commandExists(cmd) {
  try { execSync(`command -v ${cmd}`, { stdio: "ignore" }); return true; }
  catch { return false; }
}

// Termux + Proot Debian + Spleeter
function installProotDebian() {
  if (process.env.TERMUX_VERSION) {
    log("⚠️ Détection Termux avec Python incompatible si nécessaire...");
    try {
      execSync("proot-distro install debian", { stdio: "inherit" });
    } catch (err) {
      if (err.message.includes("already installed")) {
        warn("⚠️ Debian déjà installé, passage à l'étape suivante...");
      } else {
        warn("Erreur Proot Debian / Spleeter : " + err.message);
      }
    }
  }
}

// Téléchargements binaires
function downloadFile(url, dest) {
  try {
    execSync(`curl -L ${url} -o ${dest}`, { stdio: "inherit" });
    chmodSync(dest, 0o755);
  } catch (err) {
    warn(`Erreur téléchargement ${url} : ${err.message}`);
  }
}

function installBinaries() {
  log("✅ Téléchargement de yt-dlp...");
  downloadFile("https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp", join(BIN_DIR, "yt-dlp"));

  log("✅ Téléchargement de FFmpeg...");
  // exemple générique pour FFmpeg, adapter si besoin
  downloadFile("https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-i686-static.tar.xz", join(BIN_DIR, "ffmpeg"));

  log("✅ Tout est installé et prêt pour Splitit !");
  log("⛵ - Utilise 'splitit <yt url>' pour commencer.");
}

function main() {
  installProotDebian();
  installBinaries();
}

main();
