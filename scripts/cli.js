#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const BIN_DIR = path.resolve(process.cwd(), 'bin');
const SCRIPTS_DIR = path.resolve(process.cwd(), 'scripts');

// Dépendances
let ytdl, sanitizeFilename;
try {
    ytdl = await import('ytdl-core');
    sanitizeFilename = (await import('sanitize-filename')).default;
} catch (err) {
    console.error('❌ Missing dependencies. Run `npm i ytdl-core sanitize-filename` first.');
    process.exit(1);
}

const args = process.argv.slice(2);

if (!args[0]) {
    console.error('❌ Usage: splitit "<YouTube URL>"');
    process.exit(1);
}

const url = args[0];

async function downloadAudio(url) {
    try {
        const info = await ytdl.getInfo(url);
        const title = sanitizeFilename(info.videoDetails.title);
        const outputFile = path.join(process.cwd(), 'output', `${title}.mp3`);

        fs.mkdirSync(path.dirname(outputFile), { recursive: true });

        const ffmpegPath = 'ffmpeg'; // doit être dans PATH

        const ffmpeg = spawn(ffmpegPath, [
            '-i', 'pipe:0',
            '-vn',
            '-acodec', 'libmp3lame',
            '-y',
            outputFile
        ]);

        const stream = ytdl(url, { quality: 'highestaudio' });

        stream.pipe(ffmpeg.stdin);

        ffmpeg.on('close', code => {
            if (code === 0) {
                console.log(`✅ Download complete: ${outputFile}`);
            } else {
                console.error('❌ Error during ffmpeg conversion');
            }
        });
    } catch (err) {
        console.error('❌ Error during processing:', err.message);
    }
}

downloadAudio(url);
