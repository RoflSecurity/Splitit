import { createWriteStream, mkdirSync, existsSync } from "fs";
import { get } from "https";
import { platform } from "os";
import path from "path";
import { execSync } from "child_process";

const binDir=path.resolve("bin");
mkdirSync(binDir,{recursive:true});

function download(url,output){
 return new Promise((resolve,reject)=>{
  const file=createWriteStream(output,{mode:0o755});
  get(url,res=>{
   if(res.statusCode!==200) return reject(new Error(`HTTP ${res.statusCode}`));
   res.pipe(file);
   file.on("finish",()=>file.close(resolve));
  }).on("error",reject);
 });
}

const os=platform();
const isTermux=process.env.PREFIX?.includes("/data/data/com.termux")||existsSync("/data/data/com.termux");

let ytDlpUrl,ffmpegUrl,pythonInstaller;

ytDlpUrl=os==="win32"?"https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe":"https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp";
ffmpegUrl=os==="win32"?"https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip":os==="linux"?"https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz":"https://evermeet.cx/ffmpeg/ffmpeg-6.1.zip";
if(os==="win32") pythonInstaller="https://www.python.org/ftp/python/3.9.18/python-3.9.18-embed-amd64.zip";

(async()=>{
 try{
  await download(ytDlpUrl,path.join(binDir,os==="win32"?"yt-dlp.exe":"yt-dlp"));
  await download(ffmpegUrl,path.join(binDir,"ffmpeg-archive"));
  if(ffmpegUrl.endsWith(".zip")) execSync(`unzip -o ${path.join(binDir,"ffmpeg-archive")} -d ${binDir}`);
  else if(ffmpegUrl.endsWith(".tar.xz")) execSync(`tar -xJf ${path.join(binDir,"ffmpeg-archive")} -C ${binDir}`);

  if(isTermux){
   console.log("Termux detected: installing Python and Spleeter via pip");
   execSync("pkg install -y python ffmpeg",{stdio:"inherit"});
   try{execSync("python3 -m pip --version");}catch{execSync("pkg install -y python-pip",{stdio:"inherit"});}
   execSync("python3 -m pip install --upgrade pip",{stdio:"inherit"});
   execSync("python3 -m pip install spleeter tensorflow-cpu",{stdio:"inherit"});
  }else{
   let pythonCmd="python3";
   if(os==="win32"){
    await download(pythonInstaller,path.join(binDir,"python.zip"));
    execSync(`powershell -Command "Expand-Archive -Force ${path.join(binDir,"python.zip")} ${binDir}/python"`);
    pythonCmd=path.join(binDir,"python","python.exe");
   }
   execSync(`${pythonCmd} -m pip install --upgrade pip`,{stdio:"inherit"});
   execSync(`${pythonCmd} -m pip install spleeter tensorflow-cpu pyinstaller`,{stdio:"inherit"});
   const pyLauncher=path.resolve("scripts","spleeter_launcher.py");
   const outName=os==="win32"?"spleeter.exe":"spleeter";
   execSync(`${pythonCmd} -m PyInstaller --onefile --name ${outName} ${pyLauncher} --distpath ${binDir}`,{stdio:"inherit"});
  }
  console.log("Installation complete");
 }catch(err){
  console.error("Error:",err);
  process.exit(1);
 }
})();
