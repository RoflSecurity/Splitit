import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BIN_DIR = join(process.cwd(), "bin");
const PROOT_DISTRO = "debian";
const PROOT_HOME = join(BIN_DIR, "proot-debian");

function run(cmd) { console.log(`Running: ${cmd}`); execSync(cmd, { stdio: "inherit" }); }

const isTermux = !!process.env.PREFIX && process.env.TERM_PROGRAM !== "Apple_Terminal";

if (isTermux) {
  console.log("Termux detected: setting up Spleeter in Proot Debian.");
  try { run("pkg install -y proot-distro"); } catch(e){}
  if (!existsSync(PROOT_HOME)) { run(`proot-distro install ${PROOT_DISTRO} --override-root=${PROOT_HOME}`); }
  run(`proot-distro login ${PROOT_DISTRO} -- bash -c "apt update && apt install -y python3 python3-pip && pip install --no-cache-dir spleeter tensorflow-cpu"`);
  console.log("Spleeter installed inside Proot Debian.");
} else {
  console.log("Desktop detected: installing Spleeter globally.");
  try { run("python3 -m pip install --upgrade pip"); } catch(e){}
  run("python3 -m pip install --no-cache-dir spleeter tensorflow-cpu");
}
console.log("Binaries installation completed.");
