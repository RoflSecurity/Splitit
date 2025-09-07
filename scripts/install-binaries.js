import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import os from "os";
import readline from "readline";

const BIN_DIR = "./bin";
if (!existsSync(BIN_DIR)) mkdirSync(BIN_DIR);

const platform = os.platform();
const isTermux = platform === "android";

function download(url, dest) {
  console.log(`Downloading: ${url}`);
  try {
    execSync(`curl -L ${url} -o ${dest}`, { stdio: "inherit" });
    execSync(`chmod +x ${dest}`);
  } catch (err) {
    console.error(`Failed to download ${url}`);
    process.exit(1);
  }
}

try {
  download("https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp", `${BIN_DIR}/yt-dlp`);

  if (isTermux) {
    console.log("Termux detected: using system ffmpeg and setting up Spleeter via Proot container.");
    execSync("pkg install -y ffmpeg python proot-distro", { stdio: "inherit" });

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(
      "Install Debian Proot with Python <=3.10 and Spleeter? [y/N]: ",
      (answer) => {
        if (answer.toLowerCase() === "y") {
          if (!existsSync(`${BIN_DIR}/proot-debian`)) {
            console.log("Installing Debian Proot environment...");
            execSync("proot-distro install debian", { stdio: "inherit" });
          }
          console.log("Setting up Python <=3.10 and Spleeter inside Proot...");
          execSync(
            `proot-distro login debian -- bash -c "apt update && apt install -y python3.10 python3-pip ffmpeg && python3.10 -m pip install spleeter tensorflow-cpu"`,
            { stdio: "inherit" }
          );
          console.log("Spleeter ready in Proot container. Use ./bin/splitit-spleeter <file.mp3>");
        } else {
          console.log("Skipping Spleeter installation on Termux.");
        }
        rl.close();
      }
    );
  } else {
    console.log("Non-Termux OS: downloading ffmpeg binary and installing Python packages.");
    let ffmpegUrl = platform === "darwin"
      ? "https://evermeet.cx/ffmpeg/ffmpeg-6.1.zip"
      : "https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz";

    download(ffmpegUrl, `${BIN_DIR}/ffmpeg-archive`);
    execSync(`unzip -o ${BIN_DIR}/ffmpeg-archive -d ${BIN_DIR} || tar -xf ${BIN_DIR}/ffmpeg-archive -C ${BIN_DIR}`, { stdio: "inherit" });
    execSync(`chmod +x ${BIN_DIR}/ffmpeg`);

    execSync("python3 -m pip install --upgrade pip", { stdio: "inherit" });
    execSync("python3 -m pip install spleeter tensorflow-cpu", { stdio: "inherit" });
  }

  console.log("Installation completed successfully!");
} catch (err) {
  console.error("Error during installation:", err);
  process.exit(1);
}
