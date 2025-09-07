import { execSync } from 'child_process';
import { existsSync, chmodSync } from 'fs';
import { join } from 'path';
import https from 'https';
import { createWriteStream } from 'fs';

const BIN_DIR = join(process.cwd(), 'bin');
const FF_URL = 'https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz';
const YTDLP_URL = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';
const FF_BIN = join(BIN_DIR, 'ffmpeg');
const YTDLP_BIN = join(BIN_DIR, 'yt-dlp');

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode === 302 && res.headers.location) {
        downloadFile(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        chmodSync(dest, 0o755);
        resolve();
      });
    }).on('error', reject);
  });
}

async function setupBinaries() {
  if (!existsSync(YTDLP_BIN)) {
    console.log('Downloading yt-dlp...');
    await downloadFile(YTDLP_URL, YTDLP_BIN);
  }

  if (!existsSync(FF_BIN)) {
    console.log('Downloading FFmpeg static...');
    await downloadFile(FF_URL, FF_BIN);
  }
}

function setupTermuxProot() {
  try {
    execSync('pkg install -y proot-distro bzip2 xz-utils', { stdio: 'inherit' });
    console.log('Installing Debian in Proot...');
    execSync('proot-distro install debian', { stdio: 'inherit' });
    console.log('Proot Debian ready. To enter: proot-distro login debian --user root');
    console.log('Install Python <=3.10 and Spleeter inside Proot.');
  } catch (e) {
    console.error('Error setting up Termux Proot:', e.message);
  }
}

async function main() {
  const isTermux = process.env.PREFIX && process.env.HOME && process.env.TERMUX_VERSION;
  await setupBinaries();
  if (isTermux) {
    console.log('Termux detected: setting up Proot Debian for Spleeter...');
    setupTermuxProot();
  } else {
    console.log('Non-Termux system: assume Python + Spleeter + TensorFlow installed.');
  }
  console.log('Installation finished.');
}

main().catch(console.error);
