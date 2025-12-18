@echo off
REM ========================================
REM  Iniciador Kiosco Digiturno
REM  Abre la vista de kiosco en pantalla completa
REM ========================================

echo.
echo ================================================
echo   DIGITURNO - VISTA KIOSCO
echo   Abriendo en modo pantalla completa...
echo ================================================
echo.

REM Esperar 2 segundos para asegurar que el servidor esté listo
timeout /t 2 /nobreak > nul

REM Intentar abrir con Chrome en modo kiosk (pantalla completa sin navbar)
REM El parámetro --kiosk oculta la barra de navegación y pone pantalla completa
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    echo [OK] Abriendo con Google Chrome...
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --disable-infobars --disable-session-crashed-bubble --disable-restore-session-state http://localhost:3000/kiosk
    goto :end
)

REM Si Chrome no está disponible, intentar con Edge
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    echo [OK] Abriendo con Microsoft Edge...
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --kiosk --disable-infobars --disable-session-crashed-bubble --disable-restore-session-state http://localhost:3000/kiosk
    goto :end
)

REM Si Edge no está en la ruta x86, intentar en Program Files
if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    echo [OK] Abriendo con Microsoft Edge...
    start "" "C:\Program Files\Microsoft\Edge\Application\msedge.exe" --kiosk --disable-infobars --disable-session-crashed-bubble --disable-restore-session-state http://localhost:3000/kiosk
    goto :end
)

REM Si no se encuentra Chrome ni Edge, usar el navegador predeterminado
REM Nota: El modo kiosk solo funciona con Chrome/Edge, otros navegadores se abrirán normalmente
echo [ADVERTENCIA] Chrome/Edge no encontrado. Abriendo con navegador predeterminado...
echo [INFO] Para pantalla completa, presiona F11 manualmente
start http://localhost:3000/kiosk

:end
echo.
echo ================================================
echo   Kiosco abierto en modo pantalla completa
echo   Presiona ALT+F4 o ESC para salir
echo ================================================
echo.
timeout /t 2 /nobreak > nul
exit
