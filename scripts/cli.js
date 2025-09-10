#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import sanitize from 'sanitize-filename';
import os from 'os';
import process from 'process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
if (!args.length) {
  console.error('❌ Please provide a YouTube URL');
  process.exit(1);
}

const url = args[0];

const BIN_DIR = path.join(__dirname, '..', 'bin');
let FFMPEG_PATH = path.join(BIN_DIR, os.platform() === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
const YTDLP_PATH = path.join(BIN_DIR, os.platform() === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');

// Termux détecté
if (process.env.TERMUX_VERSION) {
  FFMPEG_PATH = '/data/data/com.termux/files/usr/bin/ffmpeg';
  console.log(`📦 Termux detected, using ffmpeg at ${FFMPEG_PATH}`);
}

if (!fs.existsSync(FFMPEG_PATH)) {
  console.error('❌ ffmpeg not found. Please run install-binaries or install ffmpeg manually.');
  process.exit(1);
}

if (!fs.existsSync(YTDLP_PATH)) {
  console.error('❌ yt-dlp not found. Please run install-binaries first.');
  process.exit(1);
}

(async () => {
  try {
    console.log(`🎬 Downloading with yt-dlp: ${url}`);
    const outputDir = path.resolve(`output/${sanitize(url.split('v=')[1] || 'video')}`);
    fs.mkdirSync(outputDir, { recursive: true });

    const ytdlpProc = spawn(YTDLP_PATH, ['-x', '--audio-format', 'mp3', '-o', path.join(outputDir, '%(title)s.%(ext)s'), url], { stdio: 'inherit' });

    ytdlpProc.on('close', (code) => {
      if (code === 0) console.log(`✅ Audio saved in ${outputDir}`);
      else console.error('❌ yt-dlp failed');
    });
  } catch (err) {
    console.error('❌ Error during processing:', err.message);
    process.exit(1);
  }
})();
