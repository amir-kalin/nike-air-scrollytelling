@echo off
title NIKE Air Jordan IV - React Dev Server
echo Starting React Vite Dev Server with HMR...
cd /d "%~dp0"
start http://localhost:5173/
npm run dev -- --port 5173 --host
pause
