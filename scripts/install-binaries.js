#!/usr/bin/env node
import fs from 'fs';
import https from 'https';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';

const BIN_DIR = path.join(__dirname, '..', 'bin');
const YTDLP_URL = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';
const FFMPEG_URL = 'https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-i686-static.tar.xz';

const isWin = os.platform() === 'win32';
const isLinux = os.platform() === 'linux';
const isTermux = isLinux && fs.existsSync('/data/data/com.termux/files/usr');

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} - ${url}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
};

const installYtdlp = async () => {
  const ytdlpDest = path.join(BIN_DIR, isWin ? 'yt-dlp.exe' : 'yt-dlp');
  if (fs.existsSync(ytdlpDest)) {
    console.log('✅ yt-dlp déjà installé.');
    return;
  }
  console.log('⬇️ Téléchargement de yt-dlp...');
  await downloadFile(YTDLP_URL, ytdlpDest);
  if (!isWin) {
    fs.chmodSync(ytdlpDest, 0o755);
  }
  console.log('✅ yt-dlp installé.');
};

const installFfmpeg = async () => {
  if (!isLinux || isTermux) return;
  const ffmpegDest = path.join(BIN_DIR, 'ffmpeg');
  if (fs.existsSync(ffmpegDest)) {
    console.log('✅ ffmpeg déjà installé.');
    return;
  }
  console.log('⬇️ Téléchargement de ffmpeg...');
  await downloadFile(FFMPEG_URL, ffmpegDest);
  if (isLinux) {
    fs.chmodSync(ffmpegDest, 0o755);
  }
  console.log('✅ ffmpeg installé.');
};

const installBinaries = async () => {
  try {
    if (!fs.existsSync(BIN_DIR)) {
      fs.mkdirSync(BIN_DIR);
    }
    await installYtdlp();
    await installFfmpeg();
    console.log('✅ Installation terminée.');
  } catch (err) {
    console.error('❌ Erreur lors de l\'installation des binaires:', err.message);
    process.exit(1);
  }
};

installBinaries();
