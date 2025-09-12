// src/store.js
import { reactive } from 'vue'

const STORAGE_KEY  = 'digiturno_state_v1'
const CHANNEL_NAME = 'digiturno_channel_v1'

const state = reactive({
  queue: [],         // turnos en espera
  current: null,     // en atención
  lastIssued: 0,     // contador
  prefix: 'C',       // prefijo
  ts: 0,             // marca de tiempo para ordenar estados
})

// Canal entre pestañas (misma URL/origen)
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
    ts: Date.now(),
  }
}

function apply(data) {
  if (!data || typeof data !== 'object') return
  // evita aplicar estados más antiguos
  if (state.ts && data.ts && data.ts <= state.ts) return

  const nextQueue = Array.isArray(data.queue) ? data.queue : []
  state.queue.splice(0, state.queue.length, ...nextQueue)
  state.current    = data.current ?? null
  state.lastIssued = Number(data.lastIssued || 0)
  state.prefix     = data.prefix || 'C'
  state.ts         = data.ts || Date.now()
}

function saveAndSync() {
  const payload = toPlain()
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)) } catch {}
  try { channel?.postMessage({ type: 'SYNC', payload }) } catch {}
}

/* Acciones */
function issueTicket() {
  state.lastIssued++
  const ticket = format(state.lastIssued)
  state.queue.push(ticket)
  saveAndSync()
  return ticket
}

function callNext() {
  if (!state.queue.length) return null
  const next = state.queue.shift()
  state.current = next
  saveAndSync()
  return next
}

function resetQueue() {
  state.queue.splice(0)
  state.current    = null
  state.lastIssued = 0
  saveAndSync()
}

/* (Opcional) Cambiar prefijo y sincronizar */
function setPrefix(p) {
  if (!p) return
  state.prefix = String(p).toUpperCase().slice(0, 2)
  saveAndSync()
}

/* Carga inicial */
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    apply(JSON.parse(raw))
  } catch {}
}
load()

/* Eventos de sincronía */
window.addEventListener('storage', (e) => {
  if (e.key !== STORAGE_KEY || !e.newValue) return
  try { apply(JSON.parse(e.newValue)) } catch {}
})

if (channel) {
  channel.onmessage = (ev) => {
    if (ev?.data?.type === 'SYNC') apply(ev.data.payload)
  }
}

/* Fallback de seguridad por si el navegador bloquea algo */
const ENABLE_POLL = true
if (ENABLE_POLL) {
  let lastSeenTS = state.ts
  setInterval(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const data = JSON.parse(raw)
      if (data?.ts && data.ts > lastSeenTS) {
        apply(data)
        lastSeenTS = state.ts
      }
    } catch {}
  }, 2500)
}

export default { state, issueTicket, callNext, resetQueue, setPrefix }
