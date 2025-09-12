import { reactive } from 'vue'


const STORAGE_KEY = 'digiturno_state_v1'


const state = reactive({
queue: [], // lista de turnos en espera
current: null, // turno que está en atención / mostrado
lastIssued: 0, // contador
prefix: 'C' // prefijo: C = Carnicería
})


function formatNumber(n) {
return `${state.prefix}-${String(n).padStart(3, '0')}`
}


function issueTicket() {
state.lastIssued++
const ticket = formatNumber(state.lastIssued)
state.queue.push(ticket)
save()
// también guardamos en localStorage para disparar evento storage y sincronizar otras pestañas
localStorage.setItem(STORAGE_KEY, JSON.stringify(toPlain()))
return ticket
}


function callNext() {
if (state.queue.length === 0) return null
const next = state.queue.shift()
state.current = next
save()
localStorage.setItem(STORAGE_KEY, JSON.stringify(toPlain()))
return next
}


function resetQueue() {
state.queue.splice(0)
state.current = null
state.lastIssued = 0
save()
localStorage.setItem(STORAGE_KEY, JSON.stringify(toPlain()))
}


function toPlain() {
return {
queue: state.queue,
current: state.current,
lastIssued: state.lastIssued,
prefix: state.prefix
}
}


function save() {
try {
localStorage.setItem(STORAGE_KEY, JSON.stringify(toPlain()))
} catch (e) {}
}


function load() {
try {
const raw = localStorage.getItem(STORAGE_KEY)
if (!raw) return
const data = JSON.parse(raw)
state.queue.splice(0, state.queue.length, ...(data.queue || []))
state.current = data.current || null
state.lastIssued = data.lastIssued || 0
state.prefix = data.prefix || 'C'
} catch (e) {}
}


// sincroniza entre pestañas (cuando otra pestaña escribe localStorage)
window.addEventListener('storage', (e) => {
if (e.key !== STORAGE_KEY) return
load()
})


load()


export default { state, issueTicket, callNext, resetQueue }