@echo off
REM ========================================
REM  Iniciador Digiturno - Diego Exito
REM ========================================

echo.
echo ================================================
echo   DIGITURNO - SISTEMA DE TURNOS
echo   Iniciando aplicacion...
echo ================================================
echo.

REM Cambiar al directorio del proyecto
cd /d C:\Users\ESSENX\Documents\digiturno

REM Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo ERROR: No se encontro el archivo package.json
    echo Verifica que la ruta del proyecto sea correcta
    pause
    exit /b 1
)

echo [OK] Directorio: %CD%
echo.
echo ================================================
echo   INICIANDO SERVICIOS...
echo ================================================
echo.

REM Abrir el navegador después de 15 segundos en modo pantalla completa (pantalla Display)
set "DISPLAY_URL=http://localhost:3000/display"
start /MIN cmd /c "timeout /t 15 /nobreak > nul && if exist \"%LOCALAPPDATA%\\BraveSoftware\\Brave-Browser\\Application\\brave.exe\" (start \"\" \"%LOCALAPPDATA%\\BraveSoftware\\Brave-Browser\\Application\\brave.exe\" --kiosk --disable-infobars --disable-session-crashed-bubble --disable-restore-session-state --no-first-run --no-default-browser-check %DISPLAY_URL%) else if exist \"C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe\" (start \"\" \"C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe\" --kiosk --disable-infobars --disable-session-crashed-bubble --disable-restore-session-state --no-first-run --no-default-browser-check %DISPLAY_URL%) else if exist \"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe\" (start \"\" \"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe\" --kiosk --disable-infobars --disable-session-crashed-bubble --disable-restore-session-state --no-first-run --no-default-browser-check %DISPLAY_URL%) else if exist \"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe\" (start \"\" \"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe\" --kiosk --disable-infobars --disable-session-crashed-bubble --disable-restore-session-state --no-first-run --no-default-browser-check %DISPLAY_URL%) else if exist \"C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe\" (start \"\" \"C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe\" --kiosk --disable-infobars --disable-session-crashed-bubble --disable-restore-session-state --no-first-run --no-default-browser-check %DISPLAY_URL%) else (start %DISPLAY_URL%)"

echo [*] Navegador se abrira automaticamente en 15 segundos...
echo [*] Pantalla Display: %DISPLAY_URL% (modo pantalla completa)
echo [*] Frontend: http://localhost:3000
echo [*] Backend:  http://localhost:3002
echo.
echo ================================================
echo   LOGS DEL SERVIDOR
echo ================================================
echo.

REM Ejecutar npm start directamente en esta terminal (sin cerrar)
npm run start

REM Esta línea solo se ejecutará si npm start se detiene o falla
echo.
echo ================================================
echo   SERVIDOR DETENIDO
echo ================================================
echo.
pause
