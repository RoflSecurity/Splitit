#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import https from 'https';
import { pipeline } from 'stream';
import { promisify } from 'util';
import os from 'os';

const streamPipeline = promisify(pipeline);

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BIN_DIR = path.join(__dirname, '..', 'bin');

const BINARIES = [
  {
    name: 'ffmpeg',
    urls: [
      'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip',
      'https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-essentials.zip'
    ],
    filename: os.platform() === 'win32' ? 'ffmpeg.exe' : 'ffmpeg',
    zip: true
  },
  {
    name: 'yt-dlp',
    urls: [
      'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp' + (os.platform() === 'win32' ? '.exe' : '')
    ],
    filename: os.platform() === 'win32' ? 'yt-dlp.exe' : 'yt-dlp',
    zip: false
  }
];

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

async function downloadBinary(bin) {
  const destPath = path.join(BIN_DIR, bin.filename);
  if (fs.existsSync(destPath)) {
    console.log(`✅ ${bin.name} already exists at ${destPath}`);
    return;
  }

  // --- DEBUT LOGIQUE TERMUX ---
  if (process.env.TERMUX_VERSION && bin.name === 'ffmpeg') {
    const { execSync } = await import('child_process');
    try {
      console.log('📦 Termux detected, installing ffmpeg via pkg...');
      execSync('pkg install -y ffmpeg', { stdio: 'inherit' });
      console.log('✅ ffmpeg installed via pkg');
      return; // Skip download
    } catch {
      console.warn('⚠️ pkg install failed, falling back to download...');
    }
  }
  // --- FIN LOGIQUE TERMUX ---

  for (const url of bin.urls) {
    try {
      console.log(`⬇️ Downloading ${bin.name} from ${url}...`);
      const tmpPath = path.join(BIN_DIR, bin.zip ? `${bin.name}.zip` : bin.filename);
      await downloadFile(url, tmpPath);

      if (bin.zip) {
        console.log(`📦 Extracting ${bin.name}...`);
        const unzipper = await import('unzipper');
        await fs.createReadStream(tmpPath).pipe(unzipper.Extract({ path: BIN_DIR })).promise();
        fs.unlinkSync(tmpPath);
      }

      if (os.platform() !== 'win32') fs.chmodSync(destPath, 0o755);

      console.log(`✅ ${bin.name} installed at ${destPath}`);
      return;
    } catch (err) {
      console.warn(`⚠️ Failed to download ${bin.name} from ${url}: ${err.message}`);
    }
  }

  console.error(`❌ Could not install ${bin.name}, all sources failed.`);
}

async function installAll() {
  if (!fs.existsSync(BIN_DIR)) fs.mkdirSync(BIN_DIR, { recursive: true });
  for (const bin of BINARIES) {
    await downloadBinary(bin);
  }
}

installAll();
