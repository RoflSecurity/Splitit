#!/usr/bin/env node
import { execSync } from "child_process";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);

if (args.length < 1) {
  console.error("❌ Utilisation : splitit <url_youtube>");
  process.exit(1);
}

const url = args[0];
const cwd = process.cwd(); // dossier où splitit est lancé
const outputDir = path.join(cwd, "output");

// Scripts absolus
const downloadScript = path.join(__dirname, "download.sh");
const spleeterLauncher = path.join(__dirname, "spleeter-launcher.py");

// Détection Termux
const isTermux =
  process.env.PREFIX && process.env.PREFIX.includes("com.termux");

try {
  if (isTermux) {
    console.log("📱 Termux détecté : téléchargement MP3 + conversion WAV seulement...");
    execSync(`bash "${downloadScript}" "${url}" "${outputDir}"`, {
      stdio: "inherit",
    });
  } else {
    console.log("💻 OS standard détecté : téléchargement + séparation avec Spleeter...");
    execSync(`python3 "${spleeterLauncher}" "${url}" "${outputDir}"`, {
      stdio: "inherit",
    });
  }

  console.log(`✅ Traitement terminé dans ${outputDir}`);
} catch (err) {
  console.error("❌ Erreur lors du traitement :", err.message);
  process.exit(1);
}
