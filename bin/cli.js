#!/usr/bin/env node
import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import process from "process";

const url = process.argv[2];
if (!url) {
  console.log("Usage: splitit <YouTube URL>");
  process.exit(1);
}

const BIN_DIR = "./bin";
if (!existsSync(BIN_DIR)) mkdirSync(BIN_DIR);
const OUTPUT_DIR = "./output";
if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR);

console.log(`Downloading and processing ${url}...`);
try {
  execSync(`${BIN_DIR}/yt-dlp -x --audio-format mp3 ${url}`, { stdio: "inherit" });
  console.log("Download complete. You can now separate audio using ./bin/splitit-spleeter <file.mp3>");
} catch (err) {
  console.error("Download failed:", err);
  process.exit(1);
}
