<template>
  <div class="kiosk-diegoexito">
    <div class="container-xl py-4">
      <!-- Encabezado -->
      <section class="tile">
        <header class="tile-head-carniceria">
          <div class="icon-wrapper-carniceria">
            <i class="bi bi-person-plus-fill"></i>
          </div>
          <span class="section-title">Tomar Turno - Seccion Carnes</span>

          <!-- Preferencias rápidas -->
          <div class="ms-auto d-flex align-items-center gap-3">
            <div class="form-check form-switch m-0 pref-switch">
              <input class="form-check-input" type="checkbox" id="soundSwitch" v-model="soundOn">
              <label class="form-check-label d-flex align-items-center gap-2" for="soundSwitch">
                <i :class="soundOn ? 'bi bi-volume-up' : 'bi bi-volume-mute'"></i>
                <span class="d-none d-sm-inline">Sonido</span>
              </label>
            </div>
          </div>
        </header>

        <!-- Body con stats + acción -->
        <div class="tile-body p-3 p-md-4">
          <!-- Stats -->
          <div class="row g-3 mb-3">
            <div class="col-12 col-md-6">
              <div class="mini-tile h-100">
                <div class="mini-icon bg-primary-subtle text-primary">
                  <i class="bi bi-upc-scan"></i>
                </div>
                <div>
                  <div class="text-muted small">Último emitido</div>
                  <div class="fs-3 fw-bold">{{ lastIssued }}</div>
                </div>
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="mini-tile h-100">
                <div class="mini-icon bg-success-subtle text-success">
                  <i class="bi bi-people"></i>
                </div>
                <div>
                  <div class="text-muted small">En espera</div>
                  <div class="fs-3 fw-bold">{{ queueLength }}</div>
                  <small class="text-muted">Personas antes que tú</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Acción principal -->
          <div class="action-tile">
            <p class="mb-3 text-muted">Presiona el botón para generar tu turno.</p>
            <button
              class="btn cta-btn btn-lg d-inline-flex align-items-center gap-2"
              :disabled="loading"
              @click="takeTicket"
            >
              <template v-if="!loading">
                <i class="bi bi-person-plus"></i> Tomar turno
              </template>
              <template v-else>
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Generando…
              </template>
            </button>
            <small class="text-muted d-block mt-2">
              Evita tocar varias veces: se protege contra clicks repetidos.
            </small>
          </div>

          <!-- Ticket emitido -->
          <div v-if="ticket" class="ticket-tile mt-4">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <h3 class="mb-0">
                Tu turno:
                <span class="badge bg-success fs-3 align-middle">{{ ticket }}</span>
              </h3>
              <div class="d-flex flex-wrap gap-2">
                <!-- <button class="btn btn-outline-secondary" @click="copyTicket">
                  <i class="bi bi-clipboard-check me-1"></i> Copiar
                </button>
                <button class="btn btn-outline-success" @click="shareWhatsApp">
                  <i class="bi bi-whatsapp me-1"></i> WhatsApp
                </button> -->
                <button class="btn btn-outline-dark" @click="printTicket">
                  <i class="bi bi-printer me-1"></i> Imprimir
                </button>
              </div>
            </div>
            <div class="mt-3 text-muted">
              <i class="bi bi-info-circle me-1"></i>
              Muestra este número cuando te llamen en la pantalla.
            </div>
          </div>
        </div>

        <!-- Footer -->
        <footer class="tile-foot-carniceria">
          <span class="live-indicator-carniceria"></span>
          Siempre Contigo - Listo para atenderte
        </footer>
      </section>
    </div>

    <!-- ====== TEMPLATE DE IMPRESIÓN 80mm ====== -->
    <div id="ticket-print" aria-hidden="true">
      <div class="tp-wrapper">
        <div class="tp-brand">DIEGO ÉXITO</div>
        <div class="tp-sub">Seccion Carnes</div>

        <div class="tp-sep">--------------------------------</div>

        <div class="tp-field">TURNO</div>
        <div class="tp-code">{{ ticket || '—' }}</div>

        <div class="tp-sep">--------------------------------</div>

        <div class="tp-row">
          <span>Fecha</span>
          <span>{{ printedAt }}</span>
        </div>
        <div class="tp-row">
          <span>En cola</span>
          <span>{{ queueLength }}</span>
        </div>
      </div>
    </div>
    <!-- ====== /TEMPLATE DE IMPRESIÓN ====== -->
  </div>
</template>

<script setup>
import store from '../store'
import Swal from 'sweetalert2'
import { computed, ref, nextTick } from 'vue'
import { jsPDF } from 'jspdf' // <= NUEVO

// Estado local
const ticket    = ref(null)
const loading   = ref(false)
const soundOn   = ref(true) // toggle de sonido
const printedAt = ref('')   // fecha/hora para la boleta

// Derivados del store (seguros)
const prefix = computed(() => store.state.prefix || 'C')
const queueLength = computed(() =>
  Array.isArray(store.state.queue) ? store.state.queue.length : 0
)

// Último emitido formateado
const lastIssued = computed(() => {
  const n = Number(store.state.lastIssued || 0)
  return !n ? '—' : `${prefix.value}-${String(n).padStart(3, '0')}`
})

// Beep simple (opcional)
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'; o.frequency.value = 880
    o.connect(g); g.connect(ctx.destination)
    g.gain.setValueAtTime(0.0001, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02)
    o.start()
    setTimeout(() => {
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15)
      setTimeout(() => { o.stop(); ctx.close() }, 180)
    }, 120)
  } catch {}
}

/* ===============================
   DESCARGA AUTOMÁTICA: PDF 80mm
   =============================== */
function downloadTicketPdf() {
  if (!ticket.value) return

  // Tamaño: 80mm x 120mm (ajusta la altura si quieres)
  const doc = new jsPDF({ unit: 'mm', format: [80, 120] })
  const cx = 40 // centro horizontal
  let y = 8

  // Encabezado
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('DIEGO ÉXITO', cx, y, { align: 'center' }); y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.text('Seccion carnes', cx, y, { align: 'center' }); y += 6

  // Separador
  doc.setDrawColor(0); doc.setLineWidth(0.2)
  doc.line(5, y, 75, y); y += 8

  // Título + Turno
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11)
  doc.text('TURNO', cx, y, { align: 'center' }); y += 10

  doc.setFont('courier', 'bold'); doc.setFontSize(34)
  doc.text(String(ticket.value || '—'), cx, y, { align: 'center' }); y += 10

  // Separador
  doc.setDrawColor(0); doc.setLineWidth(0.2)
  doc.line(5, y, 75, y); y += 6

  // Info
  const rows = [
    ['Fecha', printedAt.value || '—'],
    ['En cola', String(queueLength.value)]
  ]
  doc.setFont('courier', 'bold'); doc.setFontSize(11)
  rows.forEach(([k, v]) => {
    y += 7
    doc.text(k, 8, y)
    doc.setFont('courier', 'normal')
    doc.text(v, 72, y, { align: 'right' })
    doc.setFont('courier', 'bold')
  })

  y += 6
  doc.setDrawColor(0); doc.line(5, y, 75, y); y += 7

  const filename = `ticket_${String(ticket.value).replace(/\s+/g, '')}.pdf`
  doc.save(filename) // ← dispara la descarga
}

/* ====================================
   Generar ticket (imprime automáticamente)
   ==================================== */
async function takeTicket() {
  if (loading.value) return
  loading.value = true
  try {
    const t = store.issueTicket()
    ticket.value = t
    if (soundOn.value) beep()

    // Sella fecha/hora para la boleta de impresión
    const now = new Date()
    printedAt.value = now.toLocaleString('es-CO', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    })

    // Esperar a que Vue actualice el DOM con los datos del ticket
    await nextTick()

    // Imprimir automáticamente sin diálogo
    // Usar setTimeout para asegurar que el DOM está actualizado
    setTimeout(() => {
      window.print()
    }, 100)

    // Aviso corto (no bloquea la impresión)
    setTimeout(() => {
      Swal.fire({
        title: 'Turno generado',
        html: `<div style="font-size:1.2rem">Tu turno es <b>${t}</b></div>`,
        icon: 'success',
        timer: 1200,
        showConfirmButton: false
      })
    }, 150)
  } catch (e) {
    console.error(e)
    Swal.fire('Error', 'No se pudo generar el turno', 'error')
  } finally {
    setTimeout(() => (loading.value = false), 300)
  }
}

// Acciones rápidas
async function copyTicket() {
  if (!ticket.value) return
  try {
    await navigator.clipboard.writeText(ticket.value)
    Swal.fire({
      title: 'Copiado',
      text: `Turno ${ticket.value} copiado al portapapeles`,
      icon: 'success',
      timer: 1000,
      showConfirmButton: false
    })
  } catch {
    Swal.fire('Ups', 'No se pudo copiar. Intenta manualmente.', 'warning')
  }
}

function shareWhatsApp() {
  if (!ticket.value) return
  const msg = `Mi turno es ${ticket.value}.`
  const url = `https://wa.me/?text=${encodeURIComponent(msg)}`
  window.open(url, '_blank')
}

// Imprimir boleta térmica 80mm (opcional, como ya la tenías)
async function printTicket() {
  if (!ticket.value) return
  const now = new Date()
  printedAt.value = now.toLocaleString('es-CO', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
  await nextTick()
  window.print()
}
</script>


<style scoped>
/* =========================
   Paleta y base (alineada a Display Diego Éxito)
   ========================= */
.kiosk-diegoexito {
  --diego-red: #C41E3A;
  --diego-red-dark: #A61729;
  --diego-blue: #1E40AF;
  --diego-blue-dark: #1D4ED8;
  --diego-white: #ffffff;

  --tile-border: rgba(196, 30, 58, 0.25);
  --tile-shadow: rgba(196, 30, 58, 0.25);

  background: #fafafa;
  min-height: 100dvh;
  color: #212529;
}

/* ======= Tile base ======= */
.tile {
  background: rgba(255, 255, 255, .98);
  border: 2px solid var(--tile-border);
  border-radius: 20px;
  box-shadow: 0 12px 36px var(--tile-shadow);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Header y footer estilo carnicería */
.tile-head-carniceria {
  background: linear-gradient(135deg, var(--diego-red) 0%, var(--diego-red-dark) 100%);
  padding: 1.1rem 1.25rem;
  display: flex; align-items: center; gap: 1rem;
  color: #fff;
}
.tile-foot-carniceria {
  background: linear-gradient(135deg, var(--diego-blue) 0%, var(--diego-blue-dark) 100%);
  padding: .9rem 1.25rem;
  color: #fff; text-align: center; font-weight: 600;
  display: flex; align-items: center; justify-content: center; gap: .5rem;
}

.icon-wrapper-carniceria {
  background: #fff; color: var(--diego-red);
  padding: .65rem; border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,.12);
  display: grid; place-items: center;
}
.icon-wrapper-carniceria i { font-size: 1.15rem; }
.section-title { font-weight: 800; letter-spacing: .3px; }

/* Indicador en vivo */
.live-indicator-carniceria{
  width: 10px; height: 10px; border-radius: 50%; background: #10b981;
  animation: pulse 2s infinite; box-shadow: 0 0 12px rgba(16, 185, 129, .75);
}
@keyframes pulse { 0%,100%{opacity:1; transform:scale(1)} 50%{opacity:.65; transform:scale(1.2)} }

/* ======= Body ======= */
.tile-body { background: #fff; }

/* Mini tiles (stats) */
.mini-tile{
  display: flex; gap: .9rem; align-items: center;
  border: 1px solid #eef1f4; border-radius: 14px; padding: .9rem 1rem;
  background: #fff; box-shadow: 0 4px 18px rgba(16,24,40,.04);
}
.mini-icon{
  width: 44px; height: 44px; border-radius: 10px;
  display: grid; place-items: center; font-size: 1.25rem;
}

/* Acción principal */
.action-tile{
  border: 1px dashed rgba(0,0,0,.12);
  border-radius: 14px; padding: 1.25rem; background: #fff;
}

/* Botón gradiente */
.cta-btn{
  --g1: var(--diego-red);
  --g2: var(--diego-blue);
  background: linear-gradient(135deg, var(--g1), var(--g2));
  border: 0; color: #fff; font-weight: 800;
  border-radius: .8rem; padding-inline: 1.25rem;
  box-shadow: 0 10px 22px rgba(30,64,175,.22);
  transition: transform .15s ease, filter .15s ease, box-shadow .15s ease;
}
.cta-btn:hover{ filter: brightness(.98) saturate(1.05); transform: translateY(-1px); }
.cta-btn:active{ transform: translateY(0); box-shadow: 0 6px 14px rgba(30,64,175,.2); }

/* Ticket emitido (vista) */
.ticket-tile{
  border: 1px solid #eef1f4; border-radius: 14px; padding: 1.25rem; background: #fff;
  box-shadow: 0 6px 22px rgba(16,24,40,.05);
}

/* Switch estilo */
.pref-switch .form-check-input{
  width: 2.6rem; height: 1.4rem; cursor: pointer;
  background-color: rgba(255,255,255,.4); border-color: rgba(255,255,255,.6);
}
.pref-switch .form-check-input:checked{
  background-color: #10b981; border-color: #10b981;
}

/* =========================
   IMPRESIÓN TÉRMICA 80mm
   ========================= */

/* Oculta el template en pantalla */
#ticket-print { display: none; }

/* Solo impresión: muestra el ticket y oculta lo demás */
@media print {
  /* tamaño del papel térmico 80mm; margenes al mínimo */
  @page {
    size: 80mm auto;
    margin: 0;
  }

  /* oculta todo menos el contenedor del ticket */
  body * { visibility: hidden; }
  #ticket-print, #ticket-print * { visibility: visible; }

  /* posiciona el ticket arriba a la izquierda */
  #ticket-print {
    display: block !important;
    position: absolute; left: 0; top: 0;
    width: 80mm;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}

/* Estilos del ticket (se ven en impresión) */
#ticket-print .tp-wrapper {
  width: 72mm;           /* ancho útil típico */
  margin: 0 auto;
  padding: 6mm 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 12px;
  color: #000;
}
#ticket-print .tp-brand {
  text-align: center;
  font-weight: 900;
  font-size: 18px;
  letter-spacing: 1px;
}
#ticket-print .tp-sub {
  text-align: center;
  font-weight: 700;
  margin-bottom: 6px;
}
#ticket-print .tp-sep {
  text-align: center;
  font-weight: 400;
  letter-spacing: .5px;
  margin: 6px 0;
}
#ticket-print .tp-field {
  text-align: center;
  margin-top: 6px;
  font-weight: 700;
}
#ticket-print .tp-code {
  text-align: center;
  font-weight: 900;
  font-size: 28px;
  margin: 6px 0 4px;
}
#ticket-print .tp-row {
  display: flex;
  justify-content: space-between;
  padding: 2px 0;
  margin: 0 2mm;
}
#ticket-print .tp-note {
  text-align: center;
  margin-top: 6px;
}
#ticket-print .tp-thanks {
  text-align: center;
  margin-top: 8px;
  font-weight: 700;
}
#ticket-print .tp-cut {
  margin-top: 8px;
  border-top: 1px dashed #000;
  height: 0;
}

/* Accesibilidad / reduce motion */
@media (prefers-reduced-motion: reduce){
  .cta-btn, .tile { transition: none !important; }
  .live-indicator-carniceria { animation: none !important; }
}
</style>
