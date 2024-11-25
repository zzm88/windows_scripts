@echo off
taskkill /F /IM Unity.exe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Unity.exe was successfully terminated.
) else (
    echo No Unity.exe process found.
)

taskkill /F /IM UnityEditor.exe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo UnityEditor.exe was successfully terminated.
) else (
    echo No UnityEditor.exe process found.
)

pause