#!/usr/bin/env node
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import sanitize from "sanitize-filename";

const url = process.argv[2];
if (!url) {
  console.error("❌ Usage: splitit <YouTube URL>");
  process.exit(1);
}

// 📌 Récupère les infos de la vidéo (titre) via yt-dlp
const getTitle = async (videoUrl) => {
  return new Promise((resolve, reject) => {
    let data = "";
    const yt = spawn("yt-dlp", ["--get-title", videoUrl]);

    yt.stdout.on("data", (chunk) => {
      data += chunk.toString();
    });

    yt.stderr.on("data", (err) => {
      console.error("yt-dlp error:", err.toString());
    });

    yt.on("close", (code) => {
      if (code === 0) resolve(data.trim());
      else reject(new Error("yt-dlp failed to fetch title"));
    });
  });
};

try {
  const title = sanitize(await getTitle(url)) || "audio";
  const outputDir = path.join(process.cwd(), "output", title);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const outputFile = path.join(outputDir, `${title}.mp3`);
  console.log(`🎵 Downloading audio: ${title}`);

  const yt = spawn(
    "yt-dlp",
    ["-f", "bestaudio", "--extract-audio", "--audio-format", "mp3", "-o", outputFile, url],
    { stdio: "inherit" }
  );

  yt.on("close", (code) => {
    if (code === 0) console.log(`✅ Saved: ${outputFile}`);
    else console.error("❌ yt-dlp failed with code", code);
  });
} catch (err) {
  console.error("❌ Error:", err.message);
  process.exit(1);
}
