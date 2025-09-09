#!/bin/bash
# SplitIt Ultimate Clean & README Updater
# Author: RoflSec

set -e

PROJECT_ROOT="$(dirname "$0")/.."
PACKAGE_JSON="$PROJECT_ROOT/package.json"
README="$PROJECT_ROOT/README.md"
OUTPUT_DIR="$PROJECT_ROOT/output"
LOGO_PATH="./misc/logo.png"

echo "🧹 Cleaning project..."
rm -rf "$PROJECT_ROOT/node_modules" "$PROJECT_ROOT/venv" "$PROJECT_ROOT/dist" "$PROJECT_ROOT"/*.egg-info
echo "✅ Project cleaned"

# Check for package.json
if [ ! -f "$PACKAGE_JSON" ]; then
  echo "⚠️ package.json not found. Exiting."
  exit 1
fi

# Version bump using node
if command -v node >/dev/null 2>&1; then
  CURRENT_VERSION=$(node -p "require('$PACKAGE_JSON').version")
  IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"
  NEW_PATCH=$((PATCH + 1))
  NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"

  # Update package.json
  node -e "
    const fs = require('fs');
    const pkg = require('$PACKAGE_JSON');
    pkg.version = '$NEW_VERSION';
    fs.writeFileSync('$PACKAGE_JSON', JSON.stringify(pkg, null, 2));
  "

  echo "📦 package.json version updated: $CURRENT_VERSION → $NEW_VERSION"

  # Update README.md dynamically
  OUTPUT_SIZE="N/A"
  if [ -d "$OUTPUT_DIR" ]; then
    OUTPUT_SIZE=$(du -sh "$OUTPUT_DIR" | cut -f1)
  fi

  cat > "$README" <<EOF
# ![SplitIt Logo]($LOGO_PATH) SplitIt 🎵💥

**Author:** RoflSec
**Version:** $NEW_VERSION

---

## Installation 🌍

**From NPM (global):**
```bash
npm install -g @roflsec/splitit
```

**From GitHub:**
```bash
git clone https://github.com/RoflSecurity/Splitit
cd splitit
npm i -g .
```

> ✅ Now `splitit` is globally available, wherever you run it.

---

## What is this? 🤔

SplitIt is your **ultimate music tool** to separate audio tracks from any YouTube URL.

- 🎹 **Stems** (vocals & instrumental) for Windows/Linux/Mac  
- 📱 **Termux-friendly**: just MP3 + WAV to avoid headaches  

No more fuss with Spleeter, Docker, or broken paths.

---

## Usage 🚀

```bash
splitit "<YouTube URL>"
```

**Example:**

```bash
splitit "https://youtu.be/SJjBXzSc-IA?feature=shared"
```

- **Termux** → MP3 download + WAV conversion only
- **Windows/Linux/Mac** → Full Spleeter separation (2–3 stems depending on mode)

**Output:**
The `output` folder is created in the **current working directory** and contains your processed audio files.  
Current output size: $OUTPUT_SIZE

---

## Architecture 🏗️

```
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
```

---

## Tips & Tricks 💡

- `npm run clean` → cleans the repo & updates README version automatically
- `chmod +x bin/splitit` if you get permission errors
- Spleeter is optional on Termux → no errors if missing

---

## Lulz Status 😎

- Plug’n’play for Windows/Linux/Mac
- Termux supported without Spleeter
- Author: **RoflSec**, the reference for robust infra protection & testing
EOF

  echo "📄 README.md dynamically updated with version, logo, and output size"

else
  echo "⚠️ Node.js is required to update the version. Skipping version bump."
fi
