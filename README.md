# Splitit - RoflSec Edition

Splitit is the ultimate YouTube audio splitter for chaos lovers. Download any YouTube video and automatically separate it into **vocals**, **instrumental**, and **full audio**. Works on **Windows, Linux, Mac**, and **Termux**. Everything is automatic, zero hassle, full Lulz.

## Installation

```bash
npm install -g @roflsec/splitit

During installation:

yt-dlp and ffmpeg are downloaded automatically for your OS.

Spleeter is installed and built as a binary via PyInstaller for Windows/Linux/Mac.

On Termux, Python + Spleeter + TensorFlow CPU are installed automatically.

No Python, TensorFlow, or Spleeter required from the user side.


Usage

splitit <youtube_url>

Example:

splitit https://www.youtube.com/watch?v=dQw4w9WgXcQ

This generates in output/:

full.wav – the original audio

vocals.wav – isolated vocals

accompaniment.wav – isolated instrumental


Notes

On Termux, Spleeter runs directly via Python.

On other platforms, the pre-built Spleeter binary is used.

Output folder is created automatically.

Works on x86, x64, and ARM (Termux) for maximum mayhem.


License

MIT


---

RoflSec tip: Install, run, and let the chaos unfold. Perfect for audio hackers, music magicians, or anyone who loves Lulz.

---
splitit/
├── bin/
│   ├── cli.js
│   ├── yt-dlp
│   ├── ffmpeg
│   └── spleeter
├── scripts/
│   ├── install-binaries.js
│   └── spleeter_launcher.py
├── package.json
└── README.md

