# DigiTurno - Sistema de Gestión de Turnos

Sistema de gestión de turnos en tiempo real con pantalla de visualización y publicidad dinámica.

## Requisitos Previos

- Node.js (versión 16 o superior)
- npm o yarn
- Puerto 3000 disponible para el servidor backend
- Puerto 5173 disponible para el servidor de desarrollo Vite

## Instalación

1. **Clonar el repositorio o descomprimir el proyecto**

```bash
cd digiturno
```

2. **Instalar dependencias**

```bash
npm install
```

Esto instalará todas las dependencias necesarias:
- **Vue 3**: Framework frontend
- **Vite**: Herramienta de desarrollo y build
- **Express**: Servidor backend
- **Socket.IO**: Comunicación en tiempo real
- **Bootstrap 5**: Framework CSS
- **Multer**: Carga de archivos
- **jsPDF**: Generación de reportes PDF
- **SweetAlert2**: Alertas personalizadas

## Configuración

### Estructura de Directorios

El sistema requiere las siguientes carpetas (se crean automáticamente al iniciar):

```
digiturno/
├── src/                    # Código fuente Vue
├── public/
│   └── ads/               # Carpeta para publicidad (imágenes/videos)
├── server.js              # Servidor backend
└── package.json
```

### Carpeta de Publicidad

La carpeta `public/ads/` es donde debes colocar las imágenes y videos que deseas mostrar en la pantalla de visualización:

- **Formatos soportados**:
  - Imágenes: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
  - Videos: `.mp4`, `.webm`

- **Recomendaciones**:
  - Resolución recomendada: 1920x1080 (Full HD)
  - Tamaño máximo de archivo: 50MB por imagen/video
  - Los videos deben estar optimizados para web (codec H.264)

## Ejecución del Sistema

### Modo Desarrollo

Para ejecutar en modo desarrollo (frontend + backend simultáneamente):

```bash
npm start
```

Esto iniciará:
- Servidor Vite en `http://localhost:5173` (frontend)
- Servidor Express en `http://localhost:3000` (backend/API)

### Ejecutar Solo el Frontend

```bash
npm run dev
```

### Ejecutar Solo el Backend

```bash
npm run server
```

### Modo Producción

1. **Construir el proyecto**:

```bash
npm run build
```

2. **Previsualizar la build**:

```bash
npm run preview
```

## Uso del Sistema

### Acceso a la Aplicación

Después de iniciar el sistema, accede a:

- **Interfaz de Administración**: `http://localhost:5173`
- **Pantalla de Visualización**: `http://localhost:5173/display`

### Pantalla de Visualización (Display)

La pantalla de visualización muestra:
- **Turno actual** en tiempo real
- **Carrusel de publicidad** con las imágenes/videos subidos

**Características**:
- **Sin imágenes por defecto**: La pantalla solo muestra publicidad cuando subes archivos
- Si no hay publicidad, muestra un mensaje de "Cargando publicidad..."
- Los archivos se actualizan automáticamente cada 5 minutos
- Soporte para pantalla completa (botón en la esquina superior derecha)

### Gestión de Publicidad

1. Ve a la sección de **Gestión de Publicidad** en la aplicación
2. Sube imágenes o videos desde tu computadora
3. Los archivos se guardan automáticamente en `public/ads/`
4. La pantalla de visualización se actualiza automáticamente

### Gestión de Turnos

- **Generar turno**: Crea un nuevo turno en la cola
- **Llamar turno**: Marca el siguiente turno como "en atención"
- **Atender turno**: Marca el turno actual como completado
- **Cola de espera**: Visualiza todos los turnos pendientes

## Comunicación en Tiempo Real

El sistema utiliza WebSocket (Socket.IO) para sincronización en tiempo real:

- Los cambios en turnos se reflejan instantáneamente en todas las pantallas
- Las actualizaciones de publicidad se sincronizan automáticamente
- Múltiples dispositivos pueden estar conectados simultáneamente

## Estructura del Proyecto

```
digiturno/
├── src/
│   ├── views/
│   │   ├── Display.vue          # Pantalla de visualización
│   │   ├── Home.vue             # Gestión de turnos
│   │   └── Ads.vue              # Gestión de publicidad
│   ├── router/
│   │   └── index.js             # Configuración de rutas
│   ├── store/
│   │   └── index.js             # Estado global (Vuex-like)
│   ├── App.vue                  # Componente raíz
│   └── main.js                  # Punto de entrada
├── server.js                    # Servidor Express + Socket.IO
├── public/
│   └── ads/                     # Archivos de publicidad
├── package.json
└── vite.config.js              # Configuración de Vite
```

## Solución de Problemas

### Puerto ya en uso

Si recibes un error de que el puerto está ocupado:

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Problemas con la publicidad

- Verifica que la carpeta `public/ads/` existe
- Asegúrate de que los archivos sean de formatos soportados
- Revisa la consola del navegador para ver errores de carga

### Problemas de conexión WebSocket

- Verifica que el servidor backend esté corriendo en el puerto 3000
- Revisa la configuración de CORS en `server.js`
- Asegúrate de que no haya firewalls bloqueando las conexiones

## Scripts Disponibles

```json
{
  "dev": "vite",                    // Inicia servidor de desarrollo Vite
  "build": "vite build",            // Construye para producción
  "preview": "vite preview",        // Previsualiza build de producción
  "server": "node server.js",       // Inicia servidor backend
  "start": "concurrently \"npm run dev\" \"npm run server\""  // Inicia ambos
}
```

## Tecnologías Utilizadas

- **Frontend**: Vue 3, Vue Router, Bootstrap 5, Socket.IO Client
- **Backend**: Express, Socket.IO, Multer, CORS
- **Build Tool**: Vite
- **Estilos**: Bootstrap 5 + CSS personalizado
- **Comunicación**: WebSocket (Socket.IO)

## Soporte

Para reportar problemas o solicitar ayuda:
- Revisa la documentación en este README
- Verifica los logs del servidor y del navegador
- Asegúrate de tener todas las dependencias instaladas correctamente

## Licencia

Proyecto privado - Todos los derechos reservados
