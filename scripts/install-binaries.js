#!/usr/bin/env node
const { execSync } = require("child_process");

try {
  execSync("pip install spleeter yt-dlp ffmpeg", { stdio: "inherit" });
  console.log("Binaries installed successfully!");
} catch (err) {
  console.error("Error installing binaries:", err);
}
