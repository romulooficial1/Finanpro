@echo off
cd /d "%~dp0"
set PYTHON_EXE=C:\Users\stanp\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe

start "FinanPro servidor" "%PYTHON_EXE%" -m http.server 8765 --bind 127.0.0.1
timeout /t 1 >nul
start "" "http://127.0.0.1:8765/index.html"
exit
