#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BIN_DIR = path.join(__dirname, '..', 'bin');
fs.mkdirSync(BIN_DIR, { recursive: true });

async function download(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, res => {
            if (res.statusCode === 302 || res.statusCode === 301) {
                // gérer redirection
                download(res.headers.location, dest).then(resolve).catch(reject);
                return;
            }
            if (res.statusCode !== 200) return reject(new Error(`Erreur HTTP ${res.statusCode} pour ${url}`));
            res.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', err => {
            fs.unlink(dest, () => reject(err));
        });
    });
}

async function installYtDlp() {
    const ytDlpFile = os.platform() === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
    const dest = path.join(BIN_DIR, ytDlpFile);
    if (fs.existsSync(dest)) return;
    console.log('Téléchargement de yt-dlp...');
    await download(
        'https://github.com/yt-dlp/yt-dlp/releases/latest/download/' + ytDlpFile,
        dest
    );
    if (os.platform() !== 'win32') {
        await new Promise(res => exec(`chmod +x "${dest}"`, res));
    }
    console.log('✅ yt-dlp installé:', dest);
}

async function installFfmpeg() {
    const ffmpegFile = os.platform() === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
    const dest = path.join(BIN_DIR, ffmpegFile);
    if (fs.existsSync(dest)) return;
    console.log('Téléchargement de ffmpeg...');
    // Simplification : tu peux remplacer cette URL par la dernière build officielle pour chaque OS
    const url = 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip';
    console.log('⚠️ Téléchargement manuel recommandé pour ffmpeg sur cette plateforme');
}

(async () => {
    try {
        await installYtDlp();
        await installFfmpeg();
        console.log('✅ Binaries installés dans:', BIN_DIR);
    } catch (err) {
        console.error('❌ Erreur lors de l’installation des binaries:', err);
        process.exit(1);
    }
})();
