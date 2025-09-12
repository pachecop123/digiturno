<template>
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-12 col-xxl-10">
        <!-- Card principal -->
        <div class="card card-modern shadow-soft admin-card">
          <!-- Header -->
          <div class="card-header admin-head d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div class="d-flex align-items-center gap-2">
              <div class="head-icon">
                <i class="bi bi-speedometer2"></i>
              </div>
              <div>
                <h1 class="h4 mb-0">Panel de administración</h1>
                <small class="text-white-50">Gestiona la cola de turnos en tiempo real</small>
              </div>
            </div>

            <div class="d-flex align-items-center gap-2 flex-wrap">
              <div class="form-check form-switch m-0 text-white">
                <input class="form-check-input" type="checkbox" id="soundSwitch" v-model="soundOn">
                <label class="form-check-label d-flex align-items-center gap-2" for="soundSwitch">
                  <i :class="soundOn ? 'bi bi-volume-up' : 'bi bi-volume-mute'"></i>
                  <span class="d-none d-sm-inline">Sonido</span>
                </label>
              </div>

              <button class="btn btn-success" :disabled="calling" @click="callNext" title="N">
                <i class="bi bi-megaphone-fill me-1"></i> Siguiente
              </button>
              <button class="btn btn-outline-light" :disabled="!current" @click="clearCurrent" title="Esc">
                <i class="bi bi-stop-circle me-1"></i> Finalizar
              </button>
              <button class="btn btn-danger" @click="resetAll" title="R">
                <i class="bi bi-arrow-counterclockwise me-1"></i> Reiniciar
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="card-body">
            <!-- Stats -->
            <div class="row g-3 mb-3">
              <div class="col-12 col-md-4">
                <div class="stat-tile h-100">
                  <div class="stat-icon text-primary bg-primary-subtle">
                    <i class="bi bi-people"></i>
                  </div>
                  <div class="stat-info">
                    <div class="text-muted small">En espera</div>
                    <div class="fs-3 fw-bold">{{ queueLength }}</div>
                  </div>
                </div>
              </div>

              <div class="col-12 col-md-4">
                <div class="stat-tile h-100">
                  <div class="stat-icon text-success bg-success-subtle">
                    <i class="bi bi-person-workspace"></i>
                  </div>
                  <div class="stat-info">
                    <div class="text-muted small">En atención</div>
                    <div class="fs-3 fw-bold turn-now" :class="{'animate-pop': current}">
                      {{ current || '—' }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-12 col-md-4">
                <div class="stat-tile h-100">
                  <div class="stat-icon text-dark bg-dark-subtle">
                    <i class="bi bi-upc-scan"></i>
                  </div>
                  <div class="stat-info">
                    <div class="text-muted small">Último emitido</div>
                    <div class="fs-3 fw-bold">{{ lastIssuedFormatted }}</div>
                    <div class="small text-muted mt-1">
                      Prefijo: <span class="badge bg-secondary">{{ prefix }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Cola y acciones -->
            <div class="row g-3">
              <!-- Cola -->
              <div class="col-12 col-lg-7">
                <div class="card card-modern h-100">
                  <div class="card-header d-flex align-items-center justify-content-between">
                    <strong>En espera</strong>
                    <span class="badge bg-primary-subtle text-primary">{{ queueLength }} turnos</span>
                  </div>

                  <div class="card-body p-0">
                    <template v-if="queueLength">
                      <ul class="list-group list-group-flush queue-scroll">
                        <li
                          v-for="q in queue"
                          :key="q"
                          class="list-group-item d-flex align-items-center justify-content-between"
                        >
                          <div class="d-flex align-items-center gap-2">
                            <i class="bi bi-ticket-perforated text-muted"></i>
                            <span class="fw-semibold">{{ q }}</span>
                          </div>
                          <span class="badge bg-light text-muted">En cola</span>
                        </li>
                      </ul>
                    </template>

                    <div v-else class="p-5 text-center text-muted">
                      <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                      No hay turnos en espera
                    </div>
                  </div>

                  <div class="card-footer small text-muted">
                    Desliza si la lista es larga
                  </div>
                </div>
              </div>

              <!-- Acciones rápidas -->
              <div class="col-12 col-lg-5">
                <div class="card card-modern h-100">
                  <div class="card-header d-flex align-items-center justify-content-between">
                    <strong>Acciones rápidas</strong>
                    <span class="kbd-hint">N • Esc • R</span>
                  </div>
                  <div class="card-body d-grid gap-2">
                    <button class="btn btn-outline-primary" :disabled="calling" @click="callNext">
                      <i class="bi bi-megaphone-fill me-1"></i> Llamar siguiente
                    </button>
                    <button class="btn btn-outline-secondary" :disabled="!current" @click="clearCurrent">
                      <i class="bi bi-stop-circle me-1"></i> Finalizar atención
                    </button>
                    <button class="btn btn-outline-danger" @click="resetAll">
                      <i class="bi bi-trash3 me-1"></i> Reiniciar cola
                    </button>
                    <button class="btn btn-outline-dark" @click="logoutAdmin">
                      <i class="bi bi-door-closed me-1"></i> Cerrar sesión admin
                    </button>
                  </div>
                  <div class="card-footer small text-muted">
                    Al cerrar sesión se pedirá clave nuevamente al ingresar a Admin.
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- /card-body -->
        </div>
        <!-- /card -->
      </div>
    </div>
  </div>
</template>

<script setup>
import store from '../store'
import Swal from 'sweetalert2'
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'

/* Estado local */
const soundOn = ref(true)
const calling = ref(false)

/* Derivados seguros */
const queue = computed(() => Array.isArray(store.state.queue) ? store.state.queue : [])
const queueLength = computed(() => queue.value.length)
const current = computed(() => store.state.current ?? null)
const prefix  = computed(() => store.state.prefix ?? 'C')

const lastIssuedFormatted = computed(() => {
  const n = Number(store.state.lastIssued || 0)
  if (!n) return '—'
  return `${prefix.value}-${String(n).padStart(3, '0')}`
})

/* Beep breve */
function beep() {
  if (!soundOn.value) return
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'; o.frequency.value = 880
    o.connect(g); g.connect(ctx.destination)
    g.gain.setValueAtTime(0.0001, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02)
    o.start()
    setTimeout(() => {
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15)
      setTimeout(() => { o.stop(); ctx.close() }, 180)
    }, 120)
  } catch {}
}

/* Acciones */
async function callNext() {
  if (calling.value) return
  calling.value = true
  try {
    const next = store.callNext?.()
    if (!next) {
      Swal.fire('Sin turnos', 'La cola está vacía', 'info')
      return
    }
    beep()
    Swal.fire({ title: 'Llamando', text: `Turno ${next}`, icon: 'info', timer: 1100, showConfirmButton: false })
  } finally {
    setTimeout(() => (calling.value = false), 200)
  }
}

function clearCurrent() {
  if (!current.value) return
  Swal.fire({
    title: 'Finalizar atención',
    text: `¿Marcar como finalizado el turno ${current.value}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, finalizar'
  }).then(res => {
    if (res.isConfirmed) {
      store.state.current = null
      localStorage.setItem('digiturno_state_v1', JSON.stringify({
        queue: Array.isArray(store.state.queue) ? store.state.queue : [],
        current: store.state.current,
        lastIssued: Number(store.state.lastIssued) || 0,
        prefix: store.state.prefix || 'C'
      }))
      Swal.fire('Finalizado', '', 'success')
    }
  })
}

function resetAll() {
  Swal.fire({
    title: '¿Reiniciar cola?',
    text: 'Se borrarán todos los turnos',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, reiniciar'
  }).then(res => {
    if (res.isConfirmed) {
      store.resetQueue?.()
      Swal.fire('Reiniciado', '', 'success')
    }
  })
}

function logoutAdmin() {
  localStorage.removeItem('admin_pass_ok')
  Swal.fire({ title: 'Sesión cerrada', text: 'Se solicitará clave la próxima vez.', icon: 'success', timer: 1200, showConfirmButton: false })
}

/* Atajos de teclado: N siguiente, Esc finalizar, R reiniciar */
function onKey(e) {
  if (['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName)) return
  if (e.key.toLowerCase() === 'n') { e.preventDefault(); callNext() }
  else if (e.key === 'Escape') { e.preventDefault(); clearCurrent() }
  else if (e.key.toLowerCase() === 'r') { e.preventDefault(); resetAll() }
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
/* Header estilizado */
.admin-head {
  background: linear-gradient(135deg, #C41E3A 0%, #1E40AF 100%);
  color: #fff;
  border-radius: .8rem .8rem 0 0;
}
.admin-card {
  border: 1px solid rgba(196, 30, 58, .18);
  overflow: hidden;
}
.head-icon{
  width: 42px; height: 42px; border-radius: 12px;
  display: grid; place-items: center;
  background: rgba(255,255,255,.15);
  border: 1px solid rgba(255,255,255,.25);
}

/* Stats */
.stat-tile{
  display:flex; align-items:center; gap:.9rem;
  border: 1px solid #eef1f4; border-radius: 14px; padding: .9rem 1rem;
  background:#fff; box-shadow: 0 4px 18px rgba(16,24,40,.04);
}
.stat-icon{
  width:48px; height:48px; border-radius:12px;
  display:grid; place-items:center; font-size:1.25rem;
}
.turn-now{
  letter-spacing: .5px;
}
.animate-pop { animation: pop .35s ease-in-out; }
@keyframes pop { 0%{transform:scale(.92);opacity:.9} 60%{transform:scale(1.06);opacity:1} 100%{transform:scale(1)} }

/* Lista con scroll */
.queue-scroll {
  max-height: 360px;
  overflow: auto;
  scrollbar-width: thin;
}
.queue-scroll::-webkit-scrollbar { height: 8px; width: 8px; }
.queue-scroll::-webkit-scrollbar-thumb { background: #cfd4da; border-radius: 8px; }

/* Píldora de atajos */
.kbd-hint{
  font-family: ui-monospace, Menlo, Consolas, monospace;
  font-size: .8rem;
  color: #667085;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  padding: .15rem .45rem;
  border-radius: .5rem;
}

/* Botones del header sobre gradiente */
.admin-head .btn-outline-light{
  --bs-btn-color:#fff; --bs-btn-border-color:rgba(255,255,255,.6);
  --bs-btn-hover-bg:rgba(255,255,255,.1); --bs-btn-hover-border-color:#fff;
}
</style>
