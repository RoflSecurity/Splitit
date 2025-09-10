#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BIN_DIR = path.join(__dirname, '..', 'bin');
if (!fs.existsSync(BIN_DIR)) {
  fs.mkdirSync(BIN_DIR);
}

function isTermux() {
  return Boolean(process.env.TERMUX_VERSION || process.env.PREFIX?.includes('com.termux'));
}

async function installTermux() {
  console.log('📦 Termux detected, installing ffmpeg via pkg...');
  try {
    execSync('pkg install -y ffmpeg', { stdio: 'inherit' });
    console.log('✅ ffmpeg installed via pkg');
  } catch (err) {
    console.error('❌ Failed to install ffmpeg via pkg:', err.message);
  }

  console.log('📦 Installing yt-dlp via pip...');
  try {
    execSync('pip install --upgrade yt-dlp', { stdio: 'inherit' });
    console.log('✅ yt-dlp installed via pip');
  } catch (err) {
    console.error('❌ Failed to install yt-dlp via pip:', err.message);
  }
}

async function installDesktop() {
  const isWin = os.platform() === 'win32';
  const ffmpegUrl = isWin
    ? 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip'
    : 'https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz';
  const ytDlpUrl = isWin
    ? 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe'
    : 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';

  const ffmpegPath = path.join(BIN_DIR, isWin ? 'ffmpeg.exe' : 'ffmpeg');
  const ytDlpPath = path.join(BIN_DIR, isWin ? 'yt-dlp.exe' : 'yt-dlp');

  if (!fs.existsSync(ffmpegPath)) {
    console.log('⬇️ Downloading ffmpeg...');
    execSync(`curl -L ${ffmpegUrl} -o ${ffmpegPath}`, { stdio: 'inherit' });
    fs.chmodSync(ffmpegPath, 0o755);
  }

  if (!fs.existsSync(ytDlpPath)) {
    console.log('⬇️ Downloading yt-dlp...');
    execSync(`curl -L ${ytDlpUrl} -o ${ytDlpPath}`, { stdio: 'inherit' });
    fs.chmodSync(ytDlpPath, 0o755);
  }

  console.log('✅ Binaries installed in bin/');
}

(async () => {
  if (isTermux()) {
    await installTermux();
  } else {
    await installDesktop();
  }
})();
