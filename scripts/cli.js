#!/usr/bin/env node
import { exec } from "child_process";
import os from "os";

const url = process.argv[2];
if (!url) {
  console.error("Usage: splitit <youtube-url>");
  process.exit(1);
}

const isTermux = os.platform() === "android";

if (isTermux) {
  console.log("📱 Termux détecté : téléchargement MP3 + conversion WAV seulement...");
  exec(`bash ./scripts/download.sh "${url}"`, (err, stdout, stderr) => {
    if (err) return console.error(stderr);
    console.log(stdout);
    console.log("✅ Termux : MP3 + WAV téléchargés dans ./output");
  });
} else {
  console.log("💻 Linux/Windows détecté : téléchargement + séparation Spleeter...");
  exec(`python3 ./scripts/spleeter-launcher.py "${url}" "./output"`, (err, stdout, stderr) => {
    if (err) return console.error(stderr);
    console.log(stdout);
    console.log("✅ Séparation terminée, fichiers dans ./output");
  });
}
