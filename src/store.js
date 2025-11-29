// src/store.js
import { reactive } from 'vue'
import { io } from 'socket.io-client'

const STORAGE_KEY  = 'digiturno_state_v1'
const CHANNEL_NAME = 'digiturno_channel_v1'

const state = reactive({
  queue: [],         // turnos en espera
  current: null,     // en atención
  lastIssued: 0,     // contador
  prefix: 'C',       // prefijo
  lastAttended: null,// último atendido ✅
  ts: 0,             // marca de tiempo para ordenar estados
})

// Conexión Socket.IO - conectar al mismo host pero puerto del servidor
const serverPort = 3002
const serverUrl = `${window.location.protocol}//${window.location.hostname}:${serverPort}`
const socket = io(serverUrl, {
  transports: ['polling'], // Solo usar polling para evitar problemas de WebSocket
  forceNew: true,
  timeout: 20000,
  upgrade: false, // Deshabilitar upgrade a websocket
  // Para desarrollo, permitir conexiones inseguras
  rejectUnauthorized: false,
  // Configuraciones adicionales para estabilidad
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
})

// Canal entre pestañas (fallback para misma máquina)
let channel = null
try {
  if ('BroadcastChannel' in window) {
    channel = new BroadcastChannel(CHANNEL_NAME)
  }
} catch {}

/* Helpers */
function format(n) {
  return `${state.prefix}-${String(n).padStart(3, '0')}`
}

function toPlain() {
  return {
    queue: Array.isArray(state.queue) ? [...state.queue] : [],
    current: state.current ?? null,
    lastIssued: Number(state.lastIssued) || 0,
    prefix: state.prefix || 'C',
    lastAttended: state.lastAttended ?? null,     // ✅ incluir en payload
    ts: Date.now(),
  }
}

function apply(data) {
  if (!data || typeof data !== 'object') return
  if (state.ts && data.ts && data.ts <= state.ts) return

  const nextQueue = Array.isArray(data.queue) ? data.queue : []
  state.queue.splice(0, state.queue.length, ...nextQueue)
  state.current      = data.current ?? null
  state.lastIssued   = Number(data.lastIssued || 0)
  state.prefix       = data.prefix || 'C'
  state.lastAttended = data.lastAttended ?? null  // ✅ aplicar remoto
  state.ts           = data.ts || Date.now()
}

function saveAndSync() {
  const payload = toPlain()
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)) } catch {}
  try { channel?.postMessage({ type: 'SYNC', payload }) } catch {}
}

/* Acciones */
function issueTicket() {
  console.log('Cliente: Emitiendo issueTicket')
  socket.emit('issueTicket')
  // El estado se actualizará vía socket
  return format(state.lastIssued + 1) // Estimado, se confirmará con el estado del servidor
}

function callNext() {
  console.log('Cliente: Emitiendo callNext')
  socket.emit('callNext')
  // El estado se actualizará vía socket
}

function finalizeCurrent() {
  console.log('Cliente: Emitiendo finalizeCurrent')
  socket.emit('finalizeCurrent')
  // El estado se actualizará vía socket
}

function resetQueue() {
  console.log('Cliente: Emitiendo resetQueue')
  socket.emit('resetQueue')
  // El estado se actualizará vía socket
}

/* (Opcional) Cambiar prefijo y sincronizar */
function setPrefix(p) {
  if (!p) return
  console.log('Cliente: Emitiendo setPrefix', p)
  socket.emit('setPrefix', String(p).toUpperCase().slice(0, 2))
  // El estado se actualizará vía socket
}

// Escuchar actualizaciones del servidor
socket.on('state', (data) => {
  console.log('Cliente: Recibido estado del servidor:', data)
  apply(data)
  // Guardar en localStorage como respaldo
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
})

// Eventos de conexión
socket.on('connect', () => {
  console.log('Cliente: Conectado al servidor Socket.IO')
})

socket.on('disconnect', () => {
  console.log('Cliente: Desconectado del servidor Socket.IO')
})

socket.on('connect_error', (error) => {
  console.error('Cliente: Error de conexión Socket.IO:', error)
})

// Carga inicial desde localStorage (por si el servidor no está disponible)
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    apply(JSON.parse(raw))
  } catch {}
}
load()

/* Eventos de sincronía (fallback para misma máquina) */
window.addEventListener('storage', (e) => {
  if (e.key !== STORAGE_KEY || !e.newValue) return
  try { apply(JSON.parse(e.newValue)) } catch {}
})

if (channel) {
  channel.onmessage = (ev) => {
    if (ev?.data?.type === 'SYNC') apply(ev.data.payload)
  }
}

export default { state, issueTicket, callNext, finalizeCurrent, resetQueue, setPrefix }
