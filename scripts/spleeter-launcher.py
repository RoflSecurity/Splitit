#!/usr/bin/env python3
from spleeter.separator import Separator
import sys,os

def main():
 args=sys.argv[1:]
 if len(args)==0:
  print("Usage: spleeter [separate options]")
  return
 os.system(" ".join(["spleeter"]+args))

if __name__=="__main__":
 main()
