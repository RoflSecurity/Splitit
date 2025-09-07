#!/usr/bin/env node
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";

const args = process.argv.slice(2);
if(args.length<1){
 console.error("Usage: splitit <youtube_url>");
 process.exit(1);
}

const url=args[0];
const outDir=path.resolve("output");
if(!fs.existsSync(outDir)) fs.mkdirSync(outDir);

const binDir=path.resolve("bin");
const isTermux=process.env.PREFIX?.includes("/data/data/com.termux")||fs.existsSync("/data/data/com.termux");

const ytDlpBin=path.join(binDir,process.platform==="win32"?"yt-dlp.exe":"yt-dlp");
const ffmpegBin=path.join(binDir,process.platform==="win32"?"ffmpeg.exe":"ffmpeg");
const spleeterBin=path.join(binDir,process.platform==="win32"?"spleeter.exe":"spleeter");

execFileSync(ytDlpBin,["-x","--audio-format","wav","-o",`${outDir}/input.%(ext)s`,url],{stdio:"inherit"});

if(isTermux){
 console.log("Termux detected: running Spleeter via Python");
 try{
  execFileSync("python3",["-m","spleeter","separate","-p","spleeter:2stems","-o",outDir,`${outDir}/input.wav`],{stdio:"inherit"});
 }catch(err){
  console.error("Error running Spleeter on Termux. Ensure python3 and spleeter are installed.");
  process.exit(1);
 }
}else{
 execFileSync(spleeterBin,["separate","-p","spleeter:2stems","-o",outDir,`${outDir}/input.wav`],{stdio:"inherit"});
}

fs.copyFileSync(`${outDir}/input.wav`,`${outDir}/full.wav`);
console.log("Files generated in ./output/");
