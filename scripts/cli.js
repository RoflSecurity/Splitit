#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import ytdl from 'ytdl-core';
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
const FLAGS = args.slice(1);

const BIN_DIR = path.join(__dirname, '..', 'bin');
let FFMPEG_PATH = path.join(BIN_DIR, os.platform() === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
let YTDLP_PATH = path.join(BIN_DIR, os.platform() === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');

// --- DEBUT LOGIQUE TERMUX ---
if (process.env.TERMUX_VERSION) {
  const termuxFfmpeg = '/data/data/com.termux/files/usr/bin/ffmpeg';
  console.log(`📦 Termux detected, using ffmpeg at ${termuxFfmpeg}`);
  FFMPEG_PATH = termuxFfmpeg;
}
// --- FIN LOGIQUE TERMUX ---

if (!fs.existsSync(FFMPEG_PATH)) {
  console.error('❌ ffmpeg not found. Please use install-binaries first.');
  process.exit(1);
}

if (!fs.existsSync(YTDLP_PATH)) {
  console.error('❌ yt-dlp not found. Please use install-binaries first.');
  process.exit(1);
}

(async () => {
  try {
    console.log(`🎬 Downloading with yt-dlp: ${url}`);

    const title = sanitize(url.split('v=')[1] || 'audio');
    const outputDir = path.resolve(`output/${title}`);
    fs.mkdirSync(outputDir, { recursive: true });

    const audioPath = path.join(outputDir, `${title}.mp3`);

    const ytdlpProc = spawn(YTDLP_PATH, ['-x', '--audio-format', 'mp3', '-o', audioPath, url], { stdio: 'inherit' });

    ytdlpProc.on('close', (code) => {
      if (code === 0) console.log(`✅ Audio saved: ${audioPath}`);
      else console.error('❌ yt-dlp failed');
    });
  } catch (err) {
    console.error('❌ Error during processing:', err.message);
    process.exit(1);
  }
})();
