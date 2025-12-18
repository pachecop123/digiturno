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

REM Abrir el navegador después de 15 segundos en segundo plano (pantalla Display)
start /MIN cmd /c "timeout /t 15 /nobreak > nul && start http://localhost:3000/display"

echo [*] Navegador se abrira automaticamente en 15 segundos...
echo [*] Pantalla Display: http://localhost:3000/display
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
