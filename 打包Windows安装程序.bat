@echo off
echo ========================================
echo CodeBanana Windows 安装程序打包工具
echo ========================================
echo.
echo 正在安装依赖...
call npm install electron-builder --save-dev
echo.
echo 正在打包 Windows 安装程序...
echo 这可能需要几分钟时间，请耐心等待...
echo.
call npm run build:electron
echo.
echo ========================================
echo 打包完成！
echo.
echo 安装程序位置：dist\CodeBanana Setup 1.0.0.exe
echo.
echo 双击安装程序即可安装到电脑
echo 安装后可以像微信一样使用！
echo ========================================
pause