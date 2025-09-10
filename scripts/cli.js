#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import process from 'process';
import { spawn, spawnSync, execSync } from 'child_process';
import sanitize from 'sanitize-filename';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BIN_DIR = path.join(__dirname, '..', 'bin');
const FFMPEG_PATH = process.env.TERMUX_VERSION
  ? '/data/data/com.termux/files/usr/bin/ffmpeg'
  : path.join(BIN_DIR, os.platform() === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
const YTDLP_PATH = path.join(BIN_DIR, os.platform() === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');

const args = process.argv.slice(2);
if (!args.length) {
  console.error('❌ Please provide a YouTube URL');
  process.exit(1);
}
const url = args[0];

function ensureBinaries() {
  const missing = [];
  if (!fs.existsSync(FFMPEG_PATH)) missing.push('ffmpeg');
  if (!fs.existsSync(YTDLP_PATH)) missing.push('yt-dlp');

  if (missing.length > 0) {
    console.log(`⚠️  Missing binaries: ${missing.join(', ')} → reinstalling...`);
    execSync(`node ${path.join(__dirname, 'install-binaries.js')}`, { stdio: 'inherit' });
  }
}

ensureBinaries();

(async () => {
  try {
    console.log(`🎬 Downloading with yt-dlp: ${url}`);
    const outputDir = path.resolve(`output/${Date.now()}`);
    fs.mkdirSync(outputDir, { recursive: true });

    const ytdlpProc = spawn(YTDLP_PATH, ['-x', '--audio-format', 'mp3', '-o', path.join(outputDir, '%(title)s.%(ext)s'), url], { stdio: 'inherit' });

    ytdlpProc.on('close', async (code) => {
      if (code !== 0) {
        console.error('❌ yt-dlp failed');
        return;
      }

      console.log(`✅ Audio saved in ${outputDir}`);

      if (process.env.TERMUX_VERSION) {
        console.log('ℹ️ Separation skipped on Termux');
        return;
      }

      const audioFiles = fs.readdirSync(outputDir).filter(f => f.endsWith('.mp3'));
      for (const audioFileName of audioFiles) {
        const audioFilePath = path.join(outputDir, audioFileName);
        console.log(`🎚️  Separating stems for ${audioFileName}...`);

        const spleeterProc = spawn('spleeter', ['separate', '-p', 'spleeter:2stems', '-o', outputDir, audioFilePath]);

        await new Promise((resolve, reject) => {
          spleeterProc.stdout.on('data', data => process.stdout.write(data.toString()));
          spleeterProc.stderr.on('data', data => process.stderr.write(data.toString()));
          spleeterProc.on('close', (code) => {
            if (code !== 0) return reject(new Error(`Spleeter failed with code ${code}`));

            const separatedFolder = path.join(outputDir, path.basename(audioFileName, '.mp3'));
            if (fs.existsSync(separatedFolder)) {
              fs.renameSync(path.join(separatedFolder, 'accompaniment.wav'), path.join(outputDir, 'instrumentale.wav'));
              fs.renameSync(path.join(separatedFolder, 'vocals.wav'), path.join(outputDir, 'voix.wav'));
              fs.copyFileSync(audioFilePath, path.join(outputDir, 'mix.wav'));
              fs.rmSync(separatedFolder, { recursive: true, force: true });
              console.log(`✅ Stems generated for ${audioFileName}`);
            } else {
              console.warn(`⚠️  Folder ${separatedFolder} not found`);
            }
            resolve();
          });
        });
      }
    });

  } catch (err) {
    console.error('❌ Error during processing:', err.message);
    process.exit(1);
  }
})();

