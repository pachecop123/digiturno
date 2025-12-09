Opción 1: Script BAT + Tarea Programada de Windows (Recomendado)
1. Crea un archivo start-digiturno.bat en C:\laragon\www\digiturno\:
bat@echo off
REM Iniciar Digiturno automáticamente
cd /d C:\laragon\www\digiturno
echo Iniciando Digiturno...

REM Esperar 10 segundos para asegurar que los servicios estén listos
timeout /t 10 /nobreak

REM Iniciar la aplicación
start cmd /k npm run start

REM Esperar 15 segundos para que el servidor inicie
timeout /t 15 /nobreak

REM Abrir el navegador predeterminado
start http://localhost:3000

exit
2. Configura la Tarea Programada:
Opción A: Usando el Programador de Tareas (GUI)

Presiona Win + R y escribe taskschd.msc
Clic derecho en "Biblioteca del Programador de tareas" → "Crear tarea..."
Pestaña General:

Nombre: Digiturno AutoStart
Descripción: Inicia automáticamente la aplicación Digiturno
Ejecutar con los privilegios más altos: ✓
Configurar para: Windows 10


Pestaña Desencadenadores:

Nuevo... → Iniciar la tarea: "Al iniciar"
Retrasar la tarea durante: 30 segundos
Aceptar


Pestaña Acciones:

Nuevo... → Acción: "Iniciar un programa"
Programa: C:\laragon\www\digiturno\start-digiturno.bat
Iniciar en: C:\laragon\www\digiturno
Aceptar


Pestaña Condiciones:

Desmarcar: "Iniciar la tarea solo si el equipo está conectado a la corriente alterna"


Aceptar para guardar

Opción B: Usando PowerShell (Más rápido)
Crea un archivo setup-autostart.ps1:
powershell# Ejecutar como Administrador
$action = New-ScheduledTaskAction -Execute "C:\laragon\www\digiturno\start-digiturno.bat" -WorkingDirectory "C:\laragon\www\digiturno"
$trigger = New-ScheduledTaskTrigger -AtStartup
$trigger.Delay = "PT30S"  # Retraso de 30 segundos
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType ServiceAccount -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Register-ScheduledTask -TaskName "Digiturno AutoStart" -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description "Inicia automáticamente Digiturno al arrancar el PC"

Write-Host "✓ Tarea programada creada exitosamente" -ForegroundColor Green
Ejecuta en PowerShell como Administrador:
powershellSet-ExecutionPolicy Bypass -Scope Process -Force
.\setup-autostart.ps1

Opción 2: Servicio de Windows con NSSM (Más profesional)
1. Descarga NSSM (Non-Sucking Service Manager):
powershell# Con Chocolatey
choco install nssm -y

# O descarga manual desde: https://nssm.cc/download
2. Crea un script start-service.bat:
bat@echo off
cd /d C:\laragon\www\digiturno
npm run start
3. Instala el servicio:
batnssm install Digiturno "C:\Program Files\nodejs\npm.cmd" "run start"
nssm set Digiturno AppDirectory "C:\laragon\www\digiturno"
nssm set Digiturno DisplayName "Digiturno Queue System"
nssm set Digiturno Description "Sistema de turnos Digiturno - Diego Éxito"
nssm set Digiturno Start SERVICE_AUTO_START
nssm set Digiturno AppExit Default Restart
nssm set Digiturno AppStdout "C:\laragon\www\digiturno\logs\service-output.log"
nssm set Digiturno AppStderr "C:\laragon\www\digiturno\logs\service-error.log"
4. Inicia el servicio:
batnssm start Digiturno

Opción 3: Script de Inicio en Carpeta Startup (Simple)
1. Crea start-digiturno.vbs (sin ventana visible):
vbscriptSet WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\laragon\www\digiturno"
WshShell.Run "cmd /c npm run start", 0, False
WScript.Sleep 15000
WshShell.Run "http://localhost:3000", 1
```

### 2. Copia el archivo a la carpeta de inicio:
```
C:\Users\TU_USUARIO\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\
O usa este comando:
batcopy "C:\laragon\www\digiturno\start-digiturno.vbs" "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\"

Opción 4: Para múltiples rutas (Ejemplo adicional)
Si necesitas agregar otra aplicación en otra ruta, crea start-multiple.bat:
bat@echo off
echo Iniciando aplicaciones...

REM Primera aplicación - Digiturno
start "Digiturno" cmd /k "cd /d C:\laragon\www\digiturno && npm run start"

REM Esperar 5 segundos
timeout /t 5 /nobreak

REM Segunda aplicación - Ejemplo
start "OtraApp" cmd /k "cd /d C:\laragon\www\otra-app && npm run start"

REM Esperar a que los servidores inicien
timeout /t 15 /nobreak

REM Abrir navegadores
start http://localhost:3000
start http://localhost:4000

exit

Verificación y Solución de Problemas
Verificar que Node.js esté en el PATH:
batwhere node
where npm
```

Si no aparece, agrega Node.js al PATH del sistema:
```
C:\Program Files\nodejs\
Script de verificación check-startup.bat:
bat@echo off
echo === Verificación de Configuración Digiturno ===
echo.
echo 1. Verificando Node.js...
node --version
npm --version
echo.
echo 2. Verificando ruta de la aplicación...
cd /d C:\laragon\www\digiturno
if exist package.json (
    echo ✓ package.json encontrado
) else (
    echo ✗ package.json NO encontrado
)
echo.
echo 3. Verificando tareas programadas...
schtasks /query /tn "Digiturno AutoStart" /fo LIST
echo.
pause