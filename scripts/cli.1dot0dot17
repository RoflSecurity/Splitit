#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import sanitize from 'sanitize-filename';
import os from 'os';
import process from 'process';

// Fix cross-platform path for ES Modules
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
const FFMPEG_PATH = process.env.TERMUX_VERSION
  ? 'ffmpeg'
  : os.platform() === 'win32'
    ? 'ffmpeg.exe'
    : path.join(BIN_DIR, 'ffmpeg');
const YTDLP_PATH = path.join(BIN_DIR, os.platform() === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');

function checkBinary(binPath, name) {
  try {
    const { spawnSync } = await import('child_process');
    const result = spawnSync(binPath, ['-version'], { stdio: 'ignore' });
    if (result.error) throw result.error;
    return true;
  } catch {
    return false;
  }
}

if (!checkBinary(FFMPEG_PATH, 'ffmpeg')) {
  console.error('❌ ffmpeg not found. Please run install-binaries first.');
  process.exit(1);
}

if (!fs.existsSync(YTDLP_PATH)) {
  console.error('❌ yt-dlp not found. Please use install-binaries first.');
  process.exit(1);
}

(async () => {
  try {
    console.log(`🎬 Downloading with yt-dlp: ${url}`);

    const titleSafe = sanitize(url.split('v=')[1] || 'video');
    const outputDir = path.resolve(`output/${titleSafe}`);
    fs.mkdirSync(outputDir, { recursive: true });

    const audioPath = path.join(outputDir, `${titleSafe}.mp3`);

    const ytdlpProc = spawn(YTDLP_PATH, ['-x', '--audio-format', 'mp3', '-o', audioPath, url], { stdio: 'inherit' });

    ytdlpProc.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Audio saved: ${audioPath}`);
      } else {
        console.error('❌ yt-dlp failed');
      }
    });
  } catch (err) {
    console.error('❌ Error during processing:', err.message);
    process.exit(1);
  }
})();
