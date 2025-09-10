#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import process from 'process';
import https from 'https';
import { pipeline } from 'stream';
import { promisify } from 'util';
import unzipper from 'unzipper';
import { execSync, spawnSync } from 'child_process';

const streamPipeline = promisify(pipeline);
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BIN_DIR = path.join(__dirname, '..', 'bin');

if (!fs.existsSync(BIN_DIR)) fs.mkdirSync(BIN_DIR, { recursive: true });

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      } else if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(destPath);
        res.pipe(fileStream);
        fileStream.on('finish', () => fileStream.close(resolve));
        fileStream.on('error', reject);
      } else {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
    }).on('error', reject);
  });
}

async function installFfmpeg() {
  const ffmpegPath = path.join(BIN_DIR, os.platform() === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');

  if (fs.existsSync(ffmpegPath)) {
    console.log(`✅ ffmpeg already exists at ${ffmpegPath}`);
    return ffmpegPath;
  }

  if (process.env.TERMUX_VERSION) {
    try {
      console.log('📦 Termux detected, installing ffmpeg via pkg...');
      execSync('pkg install -y ffmpeg', { stdio: 'inherit' });
      console.log('✅ ffmpeg installed via pkg');
      return '/data/data/com.termux/files/usr/bin/ffmpeg';
    } catch {
      console.warn('⚠️ pkg install failed, falling back to download...');
    }
  }

  console.log('⬇️ Downloading ffmpeg...');
  const urls = os.platform() === 'win32'
    ? ['https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip']
    : ['https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-essentials.zip'];

  for (const url of urls) {
    try {
      const tmpPath = path.join(BIN_DIR, 'ffmpeg.zip');
      await downloadFile(url, tmpPath);
      console.log(`📦 Extracting ffmpeg...`);
      await fs.createReadStream(tmpPath).pipe(unzipper.Extract({ path: BIN_DIR })).promise();
      fs.unlinkSync(tmpPath);
      console.log(`✅ ffmpeg installed at ${ffmpegPath}`);
      return ffmpegPath;
    } catch (err) {
      console.warn(`⚠️ Failed to download/extract ffmpeg from ${url}: ${err.message}`);
    }
  }
  throw new Error('❌ Could not install ffmpeg');
}

async function installYtdlp() {
  const ytdlpPath = path.join(BIN_DIR, os.platform() === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');

  if (fs.existsSync(ytdlpPath)) {
    console.log(`✅ yt-dlp already exists at ${ytdlpPath}`);
    return ytdlpPath;
  }

  const url = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp' + (os.platform() === 'win32' ? '.exe' : '');
  console.log(`⬇️ Downloading yt-dlp from ${url}...`);
  await downloadFile(url, ytdlpPath);
  if (os.platform() !== 'win32') fs.chmodSync(ytdlpPath, 0o755);
  console.log(`✅ yt-dlp installed at ${ytdlpPath}`);
  return ytdlpPath;
}

function installSpleeter() {
  if (process.env.TERMUX_VERSION) {
    console.log('ℹ️ Termux detected, skipping Spleeter installation.');
    return;
  }

  try {
    console.log('⬇️ Installing Spleeter via pip...');
    const python = spawnSync('python', ['-m', 'pip', '--version'], { stdio: 'ignore' });
    if (python.error) throw python.error;

    // Installation Spleeter
    execSync('python -m pip install --user --upgrade pip', { stdio: 'inherit' });
    execSync('python -m pip install --user spleeter==2.1.0', { stdio: 'inherit' });
    console.log('✅ Spleeter installed.');
  } catch (err) {
    console.warn(`⚠️ Failed to install Spleeter: ${err.message}`);
  }
}

(async () => {
  try {
    await installFfmpeg();
    await installYtdlp();
    installSpleeter();

    // --- Add BIN_DIR to PATH on Windows for session ---
    if (os.platform() === 'win32') {
      process.env.PATH = `${BIN_DIR};${process.env.PATH}`;
      console.log(`🔧 Added ${BIN_DIR} to PATH for this session`);
    }

  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
})();
