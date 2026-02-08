@echo off
setlocal
cd /d "%~dp0"
echo Starting Nikke Build Search Development Environment...
echo.
echo [1/2] Opening browser to http://localhost:5173
start "" http://localhost:5173
echo [2/2] Running Vite and Backend Server (via concurrently)
npm run dev
pause
endlocal
