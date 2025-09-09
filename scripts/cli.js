// cli.js
#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import ytdl from 'ytdl-core';
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
const FFMPEG_PATH = path.join(BIN_DIR, os.platform() === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
const YTDLP_PATH = path.join(BIN_DIR, os.platform() === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');

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
    console.log('🎵 Fetching video info...');
    const info = await ytdl.getInfo(url);
    const title = sanitize(info.videoDetails.title);
    const outputDir = path.resolve(`output/${title}`);
    fs.mkdirSync(outputDir, { recursive: true });

    console.log(`🎬 Downloading: ${title}`);
    const audioPath = path.join(outputDir, `${title}.mp3`);

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
