#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import https from 'https';
import { pipeline } from 'stream';
import { promisify } from 'util';
import os from 'os';
import process from 'process';

const streamPipeline = promisify(pipeline);

// Fix cross-platform path: utilise import.meta.url pour ES Modules
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BIN_DIR = path.join(__dirname, '..', 'bin');

const BINARIES = [
  {
    name: 'ffmpeg',
    url: 'https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-essentials.zip',
    filename: os.platform() === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'
  },
  {
    name: 'yt-dlp',
    url: 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp' + (os.platform() === 'win32' ? '.exe' : ''),
    filename: os.platform() === 'win32' ? 'yt-dlp.exe' : 'yt-dlp'
  }
];

async function downloadBinary(bin) {
  const destPath = path.join(BIN_DIR, bin.filename);
  if (fs.existsSync(destPath)) {
    console.log(`✅ ${bin.name} already exists at ${destPath}`);
    return;
  }

  console.log(`⬇️ Downloading ${bin.name}...`);
  await new Promise((resolve, reject) => {
    https.get(bin.url, (res) => {
      // Suivi des redirections
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.log(`🔀 Redirected to ${res.headers.location}`);
        https.get(res.headers.location, res2 =>
          res2.pipe(fs.createWriteStream(destPath)).on('finish', resolve)
        ).on('error', reject);
      } else if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(destPath)).on('finish', resolve);
      } else {
        reject(new Error(`Erreur HTTP ${res.statusCode} pour ${bin.url}`));
      }
    }).on('error', reject);
  });

  if (os.platform() !== 'win32') {
    fs.chmodSync(destPath, 0o755);
  }
  console.log(`✅ ${bin.name} installed at ${destPath}`);
}

async function installAll() {
  if (!fs.existsSync(BIN_DIR)) {
    fs.mkdirSync(BIN_DIR, { recursive: true });
  }
  for (const bin of BINARIES) {
    try {
      await downloadBinary(bin);
    } catch (err) {
      console.error(`❌ Failed to install ${bin.name}:`, err.message);
    }
  }
}

installAll();
