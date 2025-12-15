@echo off
echo 正在创建桌面快捷方式...
echo.

set URL=https://codebanana-desktop-app.codebanana.app
set SHORTCUT_NAME=CodeBanana桌面应用

set DESKTOP=%USERPROFILE%\Desktop

echo [InternetShortcut] > "%DESKTOP%\%SHORTCUT_NAME%.url"
echo URL=%URL% >> "%DESKTOP%\%SHORTCUT_NAME%.url"
echo IconIndex=0 >> "%DESKTOP%\%SHORTCUT_NAME%.url"

echo.
echo ✓ 快捷方式已创建在桌面！
echo.
echo 双击桌面上的 "%SHORTCUT_NAME%" 即可打开应用
echo.
pause