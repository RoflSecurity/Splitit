#!/usr/bin/env node
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const BIN_DIR = join(process.cwd(), 'bin');
const FF_BIN = join(BIN_DIR, 'ffmpeg');
const YTDLP_BIN = join(BIN_DIR, 'yt-dlp');

const url = process.argv[2];
if (!url) {
  console.error('Usage: splitit <YouTube URL>');
  process.exit(1);
}

if (!existsSync(FF_BIN) || !existsSync(YTDLP_BIN)) {
  console.error('Binaries missing, run npm install again.');
  process.exit(1);
}

try {
  console.log('Downloading audio...');
  execSync(`${YTDLP_BIN} -f bestaudio -o "audio.%(ext)s" ${url}`, { stdio: 'inherit' });

  const mp3File = 'audio.webm'; // yt-dlp default bestaudio
  console.log('Converting to mp3...');
  execSync(`${FF_BIN} -i ${mp3File} -vn -ar 44100 -ac 2 -b:a 192k audio.mp3`, { stdio: 'inherit' });

  console.log('Splitit complete. Run ./bin/splitit-spleeter audio.mp3 to separate stems.');
} catch (e) {
  console.error('Error:', e.message);
}
