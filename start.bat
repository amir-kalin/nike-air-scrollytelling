@echo off
title NIKE Air Jordan IV - React Scrollytelling
echo Starting React Vite preview server...
cd /d "%~dp0"
start http://localhost:5173/
npm run preview -- --port 5173 --host
pause
