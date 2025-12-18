@echo off
REM ========================================
REM  Iniciador Independiente - Vista Kiosco
REM  Digiturno - Diego Éxito
REM ========================================
REM
REM  Este script abre la vista de kiosco en
REM  modo pantalla completa sin navbar
REM ========================================

title Digiturno - Vista Kiosco

echo.
echo ================================================
echo   DIGITURNO - VISTA KIOSCO
echo   Modo Pantalla Completa
echo ================================================
echo.

REM URL del kiosco
set KIOSCO_URL=http://172.16.11.211:3000/kiosk

REM Esperar 3 segundos para asegurar que el servidor esté listo
echo [*] Esperando que el servidor esté listo...
timeout /t 3 /nobreak > nul

REM Detectar y abrir con el navegador compatible en modo kiosk
echo [*] Detectando navegador compatible...

REM Opción 1: Brave Browser (Prioridad)
if exist "%LOCALAPPDATA%\BraveSoftware\Brave-Browser\Application\brave.exe" (
    echo [OK] Brave Browser detectado
    echo [*] Abriendo vista kiosco en modo pantalla completa...
    echo [*] Impresión silenciosa habilitada
    start "" "%LOCALAPPDATA%\BraveSoftware\Brave-Browser\Application\brave.exe" --kiosk --kiosk-printing --disable-infobars --disable-session-crashed-bubble --disable-restore-session-state --no-first-run --no-default-browser-check %KIOSCO_URL%
    echo.
    echo ================================================
    echo   Kiosco abierto en modo pantalla completa
    echo   URL: %KIOSCO_URL%
    echo   Presiona ALT+F4 para salir
    echo ================================================
    timeout /t 2 /nobreak > nul
    exit /b 0
)

REM Opción 2: Brave Browser (Program Files)
if exist "C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe" (
    echo [OK] Brave Browser detectado
    echo [*] Abriendo vista kiosco en modo pantalla completa...
    echo [*] Impresión silenciosa habilitada
    start "" "C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe" --kiosk --kiosk-printing --disable-infobars --disable-session-crashed-bubble --disable-restore-session-state --no-first-run --no-default-browser-check %KIOSCO_URL%
    echo.
    echo ================================================
    echo   Kiosco abierto en modo pantalla completa
    echo   URL: %KIOSCO_URL%
    echo   Presiona ALT+F4 para salir
    echo ================================================
    timeout /t 2 /nobreak > nul
    exit /b 0
)

REM Opción 3: Google Chrome
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    echo [OK] Google Chrome detectado
    echo [*] Abriendo vista kiosco en modo pantalla completa...
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --disable-infobars --disable-session-crashed-bubble --disable-restore-session-state --no-first-run --no-default-browser-check %KIOSCO_URL%
    echo.
    echo ================================================
    echo   Kiosco abierto en modo pantalla completa
    echo   URL: %KIOSCO_URL%
    echo   Presiona ALT+F4 para salir
    echo ================================================
    timeout /t 2 /nobreak > nul
    exit /b 0
)

REM Opción 4: Microsoft Edge (x86)
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    echo [OK] Microsoft Edge detectado
    echo [*] Abriendo vista kiosco en modo pantalla completa...
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --kiosk --disable-infobars --disable-session-crashed-bubble --disable-restore-session-state --no-first-run --no-default-browser-check %KIOSCO_URL%
    echo.
    echo ================================================
    echo   Kiosco abierto en modo pantalla completa
    echo   URL: %KIOSCO_URL%
    echo   Presiona ALT+F4 para salir
    echo ================================================
    timeout /t 2 /nobreak > nul
    exit /b 0
)

REM Opción 5: Microsoft Edge (Program Files)
if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    echo [OK] Microsoft Edge detectado
    echo [*] Abriendo vista kiosco en modo pantalla completa...
    start "" "C:\Program Files\Microsoft\Edge\Application\msedge.exe" --kiosk --disable-infobars --disable-session-crashed-bubble --disable-restore-session-state --no-first-run --no-default-browser-check %KIOSCO_URL%
    echo.
    echo ================================================
    echo   Kiosco abierto en modo pantalla completa
    echo   URL: %KIOSCO_URL%
    echo   Presiona ALT+F4 para salir
    echo ================================================
    timeout /t 2 /nobreak > nul
    exit /b 0
)

REM Si no se encuentra ningún navegador compatible
echo [ERROR] No se encontró Brave, Chrome ni Edge instalado
echo.
echo ================================================
echo   ADVERTENCIA
echo ================================================
echo   Para usar el modo kiosk (pantalla completa
echo   sin navbar) necesitas Brave, Chrome o Edge.
echo.
echo   Abriendo con navegador predeterminado...
echo   URL: %KIOSCO_URL%
echo   Presiona F11 manualmente para pantalla completa
echo ================================================
echo.
timeout /t 2 /nobreak > nul

start %KIOSCO_URL%

timeout /t 2 /nobreak > nul
exit /b 1

