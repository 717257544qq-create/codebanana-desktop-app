@echo off
echo Starting CodeBanana Desktop Application...
echo.

REM 检查是否已安装Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed. Please install Node.js first.
if errorlevel 1 pause
exit /b 1
)

REM 启动Next.js开发服务器
cd /d "%~dp0"
start "" "http://localhost:3000"
echo CodeBanana Desktop App is starting...
echo.
pause