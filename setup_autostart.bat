@echo off
title Setup Auto-Start
color 0A

echo.
echo  Adding AI Excel Analyst to Windows Startup...
echo.

set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "TARGET=%~dp0start.bat"
set "WORKDIR=%~dp0"

powershell -NoProfile -Command ^
  "$ws = New-Object -ComObject WScript.Shell;" ^
  "$s = $ws.CreateShortcut('%STARTUP%\AI Excel Analyst.lnk');" ^
  "$s.TargetPath = '%TARGET%';" ^
  "$s.WorkingDirectory = '%WORKDIR%';" ^
  "$s.WindowStyle = 7;" ^
  "$s.Save();"

if exist "%STARTUP%\AI Excel Analyst.lnk" (
    echo  [OK] Done! App will start automatically on every Windows login.
) else (
    echo  [ERROR] Something went wrong. Try running as Administrator.
)

echo.
pause
