const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');
const https = require('https');
const { pipeline } = require('stream');
const { promisify } = require('util');
const streamPipeline = promisify(pipeline);
const { spawnSync } = require('child_process');

const HOME = process.env.HOME || os.homedir();
const BIN_DIR = path.join(HOME, '.splitit', 'bin');

// Crée le répertoire bin s'il n'existe pas
if (!fs.existsSync(BIN_DIR)) fs.mkdirSync(BIN_DIR, { recursive: true });

// Ajoute le bin dir au PATH si pas déjà présent
const bashrcPath = path.join(HOME, '.bashrc');
const pathLine = `export PATH=$PATH:${BIN_DIR}\n`;
if (fs.existsSync(bashrcPath) && !fs.readFileSync(bashrcPath, 'utf8').includes(pathLine)) {
  fs.appendFileSync(bashrcPath, pathLine);
  console.log(`Répertoire ${BIN_DIR} ajouté au PATH.`);
}

// Détecte Termux/Android
const isTermux = os.platform() === 'android';

// Téléchargement avec stream
async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode !== 200) return reject(new Error(`Erreur HTTP ${res.statusCode} pour ${url}`));
      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        fs.chmodSync(dest, 0o755);
        resolve();
      });
    }).on('error', reject);
  });
}

// Décompression automatique si zip ou tar.xz
function extractArchive(archivePath, destDir) {
  if (archivePath.endsWith('.zip')) {
    spawnSync('unzip', ['-o', archivePath, '-d', destDir], { stdio: 'inherit' });
  } else if (archivePath.endsWith('.tar.xz')) {
    spawnSync('tar', ['-xJf', archivePath, '-C', destDir], { stdio: 'inherit' });
  } else {
    console.warn(`Format inconnu pour extraction : ${archivePath}`);
  }
}

// Installation Termux
function installTermuxBinaries() {
  try {
    if (!fs.existsSync('/data/data/com.termux/files/usr/bin/ffmpeg')) {
      console.log('Installation ffmpeg via pkg...');
      execSync('pkg install ffmpeg -y', { stdio: 'inherit' });
    } else console.log('ffmpeg déjà installé.');

    try {
      execSync('yt-dlp --version', { stdio: 'ignore' });
      console.log('yt-dlp déjà installé.');
    } catch {
      console.log('Installation yt-dlp via pip...');
      execSync('pip install -U yt-dlp', { stdio: 'inherit' });
    }
  } catch (err) {
    console.error('Erreur lors de l\'installation Termux :', err);
  }
}

// Installation multi-OS optimisée
async function installDefaultBinaries() {
  const platform = os.platform();
  const arch = os.arch();
  let ffmpegUrl, ytdlpUrl;

  if (platform === 'win32') {
    ffmpegUrl = 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip';
    ytdlpUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe';
  } else if (platform === 'linux') {
    if (arch === 'x64') ffmpegUrl = 'https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz';
    else if (arch === 'arm64') ffmpegUrl = 'https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-arm64-static.tar.xz';
    else if (arch === 'arm') ffmpegUrl = 'https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-armhf-static.tar.xz';
    else console.warn(`Architecture Linux non supportée : ${arch}`);
    ytdlpUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';
  } else if (platform === 'darwin') {
    ffmpegUrl = 'https://evermeet.cx/ffmpeg/ffmpeg-6.0.zip';
    ytdlpUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';
  } else {
    console.warn('OS non supporté pour installation automatique.');
    return;
  }

  // yt-dlp
  const ytdlpDest = path.join(BIN_DIR, platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
  if (!fs.existsSync(ytdlpDest)) {
    console.log('Téléchargement de yt-dlp...');
    await downloadFile(ytdlpUrl, ytdlpDest);
    console.log('yt-dlp installé.');
  } else console.log('yt-dlp déjà présent.');

  // ffmpeg
  const ffmpegArchive = path.join(BIN_DIR, path.basename(ffmpegUrl));
  if (!fs.existsSync(path.join(BIN_DIR, platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'))) {
    console.log('Téléchargement de ffmpeg...');
    await downloadFile(ffmpegUrl, ffmpegArchive);
    console.log('Extraction de ffmpeg...');
    extractArchive(ffmpegArchive, BIN_DIR);
    console.log('ffmpeg installé.');
  } else console.log('ffmpeg déjà présent.');
}

// Main
async function main() {
  if (isTermux) {
    console.log('Détection Termux/Android...');
    installTermuxBinaries();
  } else {
    await installDefaultBinaries();
  }
  console.log('Installation des binaires terminée.');
}

main();
