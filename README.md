# ![SplitIt Logo](./misc/logo.png) SplitIt 🎵💥

**Author:** RoflSec  
**Version:** `0.0.10`  <!-- dynamically updated by clean.sh -->

---
<!-- project size: 63.58 MB -->

## Installation 🌍

**From NPM (global):**
```bash
npm install -g @roflsec/splitit
```
**From GitHub:**
```
git clone https://github.com/RoflSecurity/Splitit
cd splitit
npm i -g .
```
> ✅ Now splitit is globally available, wherever you run it.




---

What is this? 🤔

SplitIt is your ultimate music tool to separate audio tracks from any YouTube URL.

🎹 Stems (vocals & instrumental) for Windows/Linux/Mac

📱 Termux-friendly: just MP3 + WAV to avoid headaches


No more fuss with Spleeter, Docker, or broken paths.


---

Usage 🚀
```
splitit "<YouTube URL>"
```
Example:
```
splitit "https://youtu.be/SJjBXzSc-IA?feature=shared"
```
Termux → MP3 download + WAV conversion only

Windows/Linux/Mac → Full Spleeter separation (2–3 stems depending on mode)


Output: 0 files in output/
The output folder is created in the current working directory and contains your processed audio files.


---

Architecture 🏗️

splitit/
├─ bin/                     # CLI wrapper
│  └─ splitit
├─ scripts/                 # Main scripts
│  ├─ cli.js                # Node CLI
│  ├─ download.sh           # Download + convert audio
│  ├─ spleeter-launcher.py  # Spleeter wrapper
│  ├─ install-binaries.js   # Install necessary binaries
│  └─ clean.sh              # Dev cleanup & README version bump
├─ output/                  # Audio output
├─ misc/                    # Logo etc.
├─ package.json
└─ README.md


---

Tips & Tricks 💡

npm run clean → cleans the repo & updates README version automatically

chmod +x bin/splitit if you get permission errors

Spleeter is optional on Termux → no errors if missing



---

Lulz Status 😎

Plug’n’play for Windows/Linux/Mac

Termux supported without Spleeter

Author: RoflSec, the reference for robust infra protection & testing


---
