import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readdir, unlink, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import multer from 'multer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

// Estado compartido del sistema de turnos
let sharedState = {
  queue: [],
  current: null,
  lastIssued: 0,
  // prefix: 'C',
  prefix: '',
  lastAttended: null,
  ts: Date.now()
}

// Middleware
app.use(cors())
app.use(express.json())

// Servir archivos estáticos de la carpeta public
app.use(express.static(join(__dirname, 'public')))

// Configurar multer para carga de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, join(__dirname, 'public', 'ads'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = file.originalname.split('.').pop()
    cb(null, 'ad-' + uniqueSuffix + '.' + ext)
  }
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB max
  fileFilter: function (req, file, cb) {
    // Aceptar todos los tipos de imagen y video
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true)
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes y videos'))
    }
  }
})

// Ruta para obtener el estado actual (opcional, para debugging)
app.get('/api/state', (req, res) => {
  res.json(sharedState)
})

// API para gestión de publicidad
app.get('/api/ads', async (req, res) => {
  try {
    const adsDir = join(__dirname, 'public', 'ads')
    if (!existsSync(adsDir)) {
      return res.json([])
    }

    const files = await readdir(adsDir)

    // Extensiones comunes de imagen y video
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tiff', 'tif']
    const videoExts = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'mkv', 'webm', 'mpeg', 'mpg', 'm4v', '3gp']

    const ads = files
      .filter(file => {
        const ext = file.toLowerCase().split('.').pop()
        return imageExts.includes(ext) || videoExts.includes(ext)
      })
      .map(file => {
        const ext = file.toLowerCase().split('.').pop()
        return {
          name: file,
          path: `/ads/${file}`,
          type: videoExts.includes(ext) ? 'video' : 'image'
        }
      })

    res.json(ads)
  } catch (error) {
    console.error('Error listando publicidades:', error)
    res.status(500).json({ error: 'Error al listar publicidades' })
  }
})

app.post('/api/ads/upload', upload.single('ad'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo' })
    }

    res.json({
      message: 'Archivo subido exitosamente',
      filename: req.file.filename,
      path: `/ads/${req.file.filename}`
    })
  } catch (error) {
    console.error('Error subiendo publicidad:', error)
    res.status(500).json({ error: 'Error al subir publicidad' })
  }
})

app.delete('/api/ads/:filename', async (req, res) => {
  try {
    const filename = req.params.filename

    // Proteger el logo
    if (filename === 'logo.png') {
      return res.status(403).json({ error: 'El logo no puede ser eliminado' })
    }

    // Prevenir eliminación de archivos originales
    if (['ad1.jpg', 'ad2.jpg', 'ad3.jpg', 'video1.mp4'].includes(filename)) {
      return res.status(403).json({ error: 'Los archivos de ejemplo no pueden ser eliminados' })
    }

    const filePath = join(__dirname, 'public', 'ads', filename)

    if (!existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo no encontrado' })
    }

    await unlink(filePath)
    res.json({ message: 'Archivo eliminado exitosamente' })
  } catch (error) {
    console.error('Error eliminando publicidad:', error)
    res.status(500).json({ error: 'Error al eliminar publicidad' })
  }
})

// Solo para producción: servir archivos estáticos
// app.use(express.static(join(__dirname, 'dist')))
// app.get('*', (req, res) => {
//   res.sendFile(join(__dirname, 'dist', 'index.html'))
// })

// WebSocket connections
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id)

  // Enviar estado inicial al cliente
  socket.emit('state', sharedState)

  // Escuchar acciones del cliente
  socket.on('issueTicket', () => {
    sharedState.lastIssued++
    const ticketNumber = String(sharedState.lastIssued).padStart(3, '0')
    const ticket = sharedState.prefix ? `${sharedState.prefix}-${ticketNumber}` : ticketNumber
    sharedState.queue.push(ticket)
    sharedState.ts = Date.now()
    io.emit('state', sharedState) // Emitir a todos los clientes
  })

  socket.on('callNext', () => {
    console.log('Servidor: Recibido callNext, cola actual:', sharedState.queue)
    if (sharedState.queue.length > 0) {
      const next = sharedState.queue.shift()
      sharedState.current = next
      sharedState.ts = Date.now()
      console.log('Servidor: Llamando turno:', next, 'Nueva cola:', sharedState.queue)
      io.emit('state', sharedState)
    } else {
      console.log('Servidor: Cola vacía, no se puede llamar siguiente')
    }
  })

  socket.on('finalizeCurrent', () => {
    if (sharedState.current) {
      sharedState.lastAttended = sharedState.current
      sharedState.current = null
      sharedState.ts = Date.now()
      io.emit('state', sharedState)
    }
  })

  socket.on('resetQueue', () => {
    sharedState.queue = []
    sharedState.current = null
    sharedState.lastIssued = 0
    sharedState.lastAttended = null
    sharedState.ts = Date.now()
    io.emit('state', sharedState)
  })

  /*
  socket.on('setPrefix', (prefix) => {
    if (prefix) {
      sharedState.prefix = String(prefix).toUpperCase().slice(0, 2)
      sharedState.ts = Date.now()
      io.emit('state', sharedState)
    }
  })
  */

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id)
  })
})



const PORT = process.env.PORT || 3002
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`)
  console.log(`Accesible en la red local en: http://<tu-ip-local>:${PORT}`)
  console.log(`Frontend de desarrollo en: http://localhost:3000`)
  console.log(`Para producción, ejecuta: npm run build && npm run server`)
})
