@echo off
cd /d "%~dp0"
echo Starting Eldritch Sanctuary game server...
echo Running from: %CD%
echo.
echo Server will run on: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
python -m http.server 8000
pause

