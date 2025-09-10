#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// --- ES Modules __dirname workaround ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const BIN_DIR = path.join(ROOT_DIR, 'bin');

// --- Helpers ---
function removeIfExists(target) {
  if (fs.existsSync(target)) {
    console.log(`🗑️ Removing ${target}`);
    try {
      execSync(process.platform === 'win32'
        ? `rmdir /s /q "${target}"` // Windows
        : `rm -rf "${target}"`     // Linux/macOS/Termux
      , { stdio: 'inherit' });
    } catch (err) {
      console.warn(`⚠️ Failed to remove ${target}: ${err.message}`);
    }
  }
}

function getDirSize(dirPath) {
  try {
    const output = execSync(process.platform === 'win32'
      ? `powershell -command "(Get-ChildItem -Recurse '${dirPath}' | Measure-Object -Property Length -Sum).Sum"`
      : `du -sb "${dirPath}" | cut -f1`
    ).toString().trim();
    return Number(output);
  } catch {
    return 0;
  }
}

function bumpVersion(version) {
  const parts = version.split('.').map(Number);
  parts[2]++; // patch bump
  return parts.join('.');
}

// --- Remove old artifacts ---
removeIfExists(path.join(ROOT_DIR, 'node_modules'));
removeIfExists(path.join(ROOT_DIR, 'output'));
removeIfExists(path.join(ROOT_DIR, 'package-lock.json'));

// --- Remove yt-dlp if exists ---
const ytdlpPath = path.join(BIN_DIR, process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
removeIfExists(ytdlpPath);

// --- Update version in package.json ---
const packageJsonPath = path.join(ROOT_DIR, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const oldVersion = packageJson.version;
packageJson.version = bumpVersion(oldVersion);
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log(`📦 Version bumped: ${oldVersion} → ${packageJson.version}`);

// --- Update version & size in README.md ---
const readmePath = path.join(ROOT_DIR, 'README.md');
let readme = fs.readFileSync(readmePath, 'utf-8');

// Update version dynamically
readme = readme.replace(/Version:\s*`[^`]+`/, `Version: \`${packageJson.version}\``);

// Update project size dynamically
const sizeBytes = getDirSize(ROOT_DIR);
const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
if (/<!-- project size: .* -->/.test(readme)) {
  readme = readme.replace(/<!-- project size: .* -->/, `<!-- project size: ${sizeMB} MB -->`);
} else {
  // Add size comment if not exists
  readme = readme.replace(/---\n/, `---\n<!-- project size: ${sizeMB} MB -->\n`);
}

fs.writeFileSync(readmePath, readme);
console.log(`📄 README.md updated (size: ${sizeMB} MB)`);

console.log('✅ Clean complete!');
