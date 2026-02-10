@echo off
:: ──────────────────────────────────────────────────────────
:: Creates a shortcut to start.bat in the Windows Startup
:: folder so Structura ERP launches on every login.
::
:: Run this ONCE as your normal user (no admin needed).
:: To undo: delete the shortcut from the Startup folder.
:: ──────────────────────────────────────────────────────────
title Install Structura ERP Startup

set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SCRIPT_DIR=%~dp0"
set "SHORTCUT=%STARTUP_FOLDER%\Structura ERP.lnk"

echo Creating startup shortcut...
echo   Target : %SCRIPT_DIR%start.bat
echo   Startup: %STARTUP_FOLDER%

:: Use PowerShell to create a .lnk shortcut
powershell -NoProfile -Command ^
  "$ws = New-Object -ComObject WScript.Shell;" ^
  "$sc = $ws.CreateShortcut('%SHORTCUT%');" ^
  "$sc.TargetPath = '%SCRIPT_DIR%start.bat';" ^
  "$sc.WorkingDirectory = '%SCRIPT_DIR%';" ^
  "$sc.WindowStyle = 7;" ^
  "$sc.Description = 'Structura ERP Dev Server';" ^
  "$sc.Save()"

if exist "%SHORTCUT%" (
    echo.
    echo Done! Structura ERP will start automatically on next login.
    echo.
    echo To remove: open the Startup folder and delete "Structura ERP.lnk"
    echo   Run "shell:startup" in Windows Explorer to open it.
) else (
    echo.
    echo ERROR: Failed to create shortcut.
)

pause
