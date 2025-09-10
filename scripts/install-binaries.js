#!/usr/bin/env node
import { createWriteStream } from 'fs';
import { mkdir, chmod } from 'fs/promises';
import { pipeline } from 'stream/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import os from 'os';
import https from 'https';
import unzipper from 'unzipper';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BIN_DIR = path.resolve(__dirname, '../bin');

async function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}. Status code: ${res.statusCode}`));
        return;
      }
      const fileStream = createWriteStream(outputPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close(resolve);
      });
    }).on('error', reject);
  });
}

async function extractArchive(archivePath, targetDir) {
  if (archivePath.endsWith('.zip')) {
    console.log(`📦 Extracting ${archivePath}...`);
    await new Promise((resolve, reject) => {
      createReadStream(archivePath)
        .pipe(unzipper.Extract({ path: targetDir }))
        .on('close', resolve)
        .on('error', reject);
    });
  } else if (archivePath.endsWith('.tar.xz')) {
    console.log(`📦 Extracting ${archivePath}...`);
    execSync(`tar -xf "${archivePath}" -C "${targetDir}"`);
  }
}

async function downloadBinary() {
  await mkdir(BIN_DIR, { recursive: true });

  // --- DEBUT LOGIQUE TERMUX ---
  if (process.env.TERMUX_VERSION) {
    try {
      console.log('📦 Termux detected, installing ffmpeg via pkg...');
      execSync('pkg install -y ffmpeg', { stdio: 'inherit' });
      console.log('✅ ffmpeg installed via pkg');
      return; // Skip download
    } catch (err) {
      console.warn('⚠️ pkg install failed, falling back to download...');
    }
  }
  // --- FIN LOGIQUE TERMUX ---

  let ffmpegUrl;
  let ytdlpUrl;
  let ffmpegArchive;

  switch (os.platform()) {
    case 'win32':
      ffmpegUrl = 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip';
      ytdlpUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe';
      ffmpegArchive = path.join(BIN_DIR, 'ffmpeg.zip');
      break;
    case 'darwin':
      ffmpegUrl = 'https://evermeet.cx/ffmpeg/ffmpeg-6.0.zip';
      ytdlpUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos';
      ffmpegArchive = path.join(BIN_DIR, 'ffmpeg.zip');
      break;
    default: // Linux
      ffmpegUrl = 'https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz';
      ytdlpUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';
      ffmpegArchive = path.join(BIN_DIR, 'ffmpeg.tar.xz');
      break;
  }

  console.log(`⬇️ Downloading ffmpeg from ${ffmpegUrl}`);
  await downloadFile(ffmpegUrl, ffmpegArchive);
  await extractArchive(ffmpegArchive, BIN_DIR);

  console.log(`⬇️ Downloading yt-dlp from ${ytdlpUrl}`);
  const ytdlpPath = path.join(BIN_DIR, os.platform() === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
  await downloadFile(ytdlpUrl, ytdlpPath);

  if (os.platform() !== 'win32') {
    await chmod(ytdlpPath, 0o755);
  }

  console.log('✅ Binaries installed successfully');
}

downloadBinary().catch((err) => {
  console.error('❌ Failed to install binaries:', err);
  process.exit(1);
});
