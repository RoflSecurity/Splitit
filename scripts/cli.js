#!/usr/bin/env node
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import ytdl from "ytdl-core";
import sanitize from "sanitize-filename";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const url = process.argv[2];
if (!url) {
  console.error("❌ No YouTube URL provided.");
  process.exit(1);
}

async function checkCommand(cmd) {
  return new Promise((resolve) => {
    exec(`${cmd} --version`, (err) => resolve(!err));
  });
}

async function main() {
  const platform = process.platform;
  const isTermux = platform === "android";

  const ffmpegInstalled = await checkCommand("ffmpeg");
  if (!ffmpegInstalled) {
    console.error("❌ ffmpeg not found. Please install it first.");
    process.exit(1);
  }

  if (!isTermux) {
    const spleeterInstalled = await checkCommand("spleeter");
    if (!spleeterInstalled) {
      console.error("❌ Spleeter not found. Please install it first.");
      process.exit(1);
    }
  }

  let info;
  try {
    info = await ytdl.getInfo(url);
  } catch (err) {
    console.error("❌ Error fetching video info:", err.message);
    process.exit(1);
  }

  const title = sanitize(info.videoDetails.title || "audio");
  const outputBase = path.resolve(process.cwd(), "output", title);
  fs.mkdirSync(outputBase, { recursive: true });

  const mp3Path = path.join(outputBase, `${title}.mp3`);
  console.log("🎬 Downloading audio...");

  ytdl(url, { filter: "audioonly" })
    .pipe(fs.createWriteStream(mp3Path))
    .on("finish", async () => {
      console.log(`✅ Download complete: ${mp3Path}`);

      if (isTermux) {
        console.log("📱 Termux detected: skipping Spleeter separation...");
        process.exit(0);
      }

      console.log("🎛️ Separating audio with Spleeter...");
      const cmd = `spleeter separate -p spleeter:5stems -o "${outputBase}" "${mp3Path}"`;

      exec(cmd, async (err) => {
        if (err) {
          console.error("❌ Error during separation:", err.message);
          process.exit(1);
        }

        // Dynamically rename stems
        const stemsDir = path.join(outputBase, title);
        if (!fs.existsSync(stemsDir)) {
          console.error("❌ Expected stems folder not found:", stemsDir);
          process.exit(1);
        }

        const files = fs.readdirSync(stemsDir);
        for (const file of files) {
          const ext = path.extname(file);
          const base = path.basename(file, ext);
          const newName = `${title}-${base}${ext}`;
          fs.renameSync(path.join(stemsDir, file), path.join(stemsDir, newName));
        }

        console.log(`✅ Separation complete. Files are in ${stemsDir}`);
      });
    })
    .on("error", (err) => {
      console.error("❌ Error downloading audio:", err.message);
      process.exit(1);
    });
}

main();
