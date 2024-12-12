@echo off
cd /d C:\Users\zzm88\Documents
for /f "delims=" %%i in ('powershell -command "Get-Clipboard"') do set "repourl=%%i"

:: Check if URL contains github.com and ends with .git
echo %repourl% | findstr /i /c:"github.com" /c:".git" > nul
if errorlevel 1 (
    echo Error: The clipboard content does not appear to be a valid GitHub repository URL.
    echo Current clipboard: %repourl%
    pause
    exit /b 1
)

git clone %repourl%

:: Extract the repository name from the URL (removes .git extension if present)
for %%i in (%repourl%) do set "reponame=%%~ni"
if "%reponame:~-4%" == ".git" set "reponame=%reponame:~0,-4%"

:: Open the cloned repository in File Explorer
start "" "C:\Users\zzm88\Documents\%reponame%"