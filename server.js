import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

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
  prefix: 'C',
  lastAttended: null,
  ts: Date.now()
}

// Middleware
app.use(cors())
app.use(express.json())

// Ruta para obtener el estado actual (opcional, para debugging)
app.get('/api/state', (req, res) => {
  res.json(sharedState)
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
    const ticket = `${sharedState.prefix}-${String(sharedState.lastIssued).padStart(3, '0')}`
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

  socket.on('setPrefix', (prefix) => {
    if (prefix) {
      sharedState.prefix = String(prefix).toUpperCase().slice(0, 2)
      sharedState.ts = Date.now()
      io.emit('state', sharedState)
    }
  })

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
