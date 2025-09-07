# Splitit - RoflSec Edition

Splitit is the ultimate YouTube audio splitter for chaos lovers. Download any YouTube video and automatically separate it into **vocals**, **instrumental**, and **full audio**. Works on **Windows, Linux, Mac**, and **Termux**. Everything is automatic, zero hassle, full Lulz.

## Installation

```bash
npm install -g @roflsec/splitit
```

- **Termux (Android)**: yt-dlp and ffmpeg installed automatically. Spleeter requires Python <=3.10 in Proot Debian. Interactive prompt guides installation.
- **Windows/Linux/Mac**: full installation of Python, Spleeter, and TensorFlow CPU.

## Usage

```bash
splitit <YouTube URL>
```

- Downloads audio in mp3 format.
- Separate stems with:

```bash
./bin/splitit-spleeter <file.mp3>
```

Output saved in `./output`.

Works on x86, x64, and ARM (Termux) for maximum mayhem.


License

MIT


---

RoflSec tip: Install, run, and let the chaos unfold. Perfect for audio hackers, music magicians, or anyone who loves Lulz.

---
