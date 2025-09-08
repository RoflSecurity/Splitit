#!/usr/bin/env node
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const url = process.argv[2];
if (!url) {
  console.log("Usage: splitit <youtube-url>");
  process.exit(1);
}

const outputDir = path.resolve(__dirname, "../output");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

const command = `python3 ${path.resolve(__dirname,"./spleeter-launcher.py")} "${url}" "${outputDir}"`;

exec(command, (err, stdout, stderr) => {
  if (err) console.error(err);
  else console.log(stdout);
});
