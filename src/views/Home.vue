<template>
  <div class="home-view">
    <!-- HERO -->
    <section class="hero-diego text-white">
      <div class="container py-5">
        <div class="row align-items-center g-4">
          <!-- Intro + CTAs -->
          <div class="col-12 col-lg-7">
            <div class="d-flex align-items-center gap-2 mb-2">
              <span class="live-dot"></span>
              <span class="small text-white-50">Sincronizado en tiempo real</span>
            </div>

            <h1 class="display-6 fw-black mb-2">Digiturno – Carnicería</h1>
            <p class="lead mb-4">
              Rápido, claro y sincronizado entre <strong>kiosco</strong>, <strong>pantalla</strong> y <strong>administración</strong>.
            </p>

            <div class="d-flex flex-wrap gap-2">
              <RouterLink class="btn btn-light text-primary fw-semibold" to="/kiosk">
                <i class="bi bi-person-plus me-1"></i> Abrir Kiosco
              </RouterLink>
              <RouterLink class="btn btn-outline-light" to="/display">
                <i class="bi bi-display me-1"></i> Abrir Pantalla
              </RouterLink>
              <RouterLink class="btn btn-outline-light" to="/admin">
                <i class="bi bi-shield-lock me-1"></i> Ir a Administración
              </RouterLink>
            </div>
          </div>

          <!-- Tarjeta de estado -->
          <div class="col-12 col-lg-5">
            <div class="hero-card glass-card p-4">
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="icon-wrap text-primary">
                  <i class="bi bi-activity fs-2"></i>
                </div>
                <div>
                  <div class="small text-muted">Estado en tiempo real</div>
                  <div class="fw-semibold">
                    Prefijo: <span class="badge bg-secondary">{{ prefix }}</span>
                  </div>
                </div>
              </div>

              <div class="row g-3">
                <div class="col-12 col-sm-4">
                  <div class="mini-stat rounded-3 p-3 h-100">
                    <div class="text-muted small">En espera</div>
                    <div class="fs-4 fw-bold">{{ queueLength }}</div>
                  </div>
                </div>
                <div class="col-12 col-sm-4">
                  <div class="mini-stat rounded-3 p-3 h-100">
                    <div class="text-muted small">En atención</div>
                    <div class="fs-5 fw-bold">{{ currentOrDash }}</div>
                  </div>
                </div>
                <div class="col-12 col-sm-4">
                  <div class="mini-stat rounded-3 p-3 h-100">
                    <div class="text-muted small">Último emitido</div>
                    <div class="fs-5 fw-bold">{{ lastIssued }}</div>
                  </div>
                </div>
              </div>

              <div class="mt-3 small text-muted">
                <i class="bi bi-info-circle me-1"></i>
                Abre el Kiosco para tomar turnos y la Pantalla para mostrarlos.
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Onda decorativa -->
      <div class="hero-wave"></div>
    </section>

    <!-- ACCESOS RÁPIDOS -->
    <div class="container pb-5">
      <div class="row g-4">
        <div class="col-12 col-md-4">
          <RouterLink to="/kiosk" class="card card-modern card-link h-100 p-4">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <h5 class="mb-0">Kiosco</h5>
              <i class="bi bi-person-plus fs-3 text-primary"></i>
            </div>
            <p class="text-muted mb-0">Genera un nuevo turno en un clic.</p>
          </RouterLink>
        </div>

        <div class="col-12 col-md-4">
          <RouterLink to="/display" class="card card-modern card-link h-100 p-4">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <h5 class="mb-0">Pantalla</h5>
              <i class="bi bi-display fs-3 text-primary"></i>
            </div>
            <p class="text-muted mb-0">Muestra el turno actual y anuncios.</p>
          </RouterLink>
        </div>

        <div class="col-12 col-md-4">
          <RouterLink to="/admin" class="card card-modern card-link h-100 p-4">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <h5 class="mb-0">Administración</h5>
              <i class="bi bi-shield-lock fs-3 text-primary"></i>
            </div>
            <p class="text-muted mb-0">Gestiona la cola y llama el siguiente.</p>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import store from '../store'

/* Derivados seguros (evitan errores si el estado no existe aún) */
const prefix = computed(() => store.state?.prefix || 'C')
const queueLength = computed(() => Array.isArray(store.state?.queue) ? store.state.queue.length : 0)
const currentOrDash = computed(() => store.state?.current || '—')
const lastIssued = computed(() => {
  const n = Number(store.state?.lastIssued || 0)
  return !n ? '—' : `${prefix.value}-${String(n).padStart(3, '0')}`
})
</script>

<style scoped>
/* =========================
   HERO Diego Éxito (rojo/azul)
   ========================= */
.hero-diego {
  position: relative;
  background:
    radial-gradient(1000px 500px at -5% -20%, rgba(30,64,175,.35), transparent 60%),
    linear-gradient(135deg, #C41E3A 0%, #1E40AF 100%);
  overflow: hidden;
}
.hero-wave {
  position: absolute; left: 0; right: 0; bottom: -1px;
  height: 60px;
  background: radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,.25), transparent 60%);
}

/* Titulado */
.fw-black { font-weight: 900; }

/* Indicador live */
.live-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: #10b981; box-shadow: 0 0 12px rgba(16,185,129,.9);
  display: inline-block; animation: pulse 2s infinite;
}
@keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.2);opacity:.7} }

/* Tarjeta de estado (glass) */
.glass-card {
  border: 1px solid rgba(255,255,255,.22);
  background: rgba(255,255,255,.96);
  border-radius: 16px;
  box-shadow: 0 18px 40px rgba(0,0,0,.12);
}

/* Icono de cabecera estado */
.icon-wrap {
  width: 48px; height: 48px; border-radius: 12px;
  display: grid; place-items: center;
  background: #eef2ff; /* primario suave */
}

/* Mini stats */
.mini-stat { background: #f8f9fa; border: 1px solid #eef1f4; }
:global(.theme-dark) .mini-stat { background: #1a1a1a; border-color: #2a2a2a; }

/* Tarjetas clicables */
.card-link {
  transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
  border: 1px solid #eef1f4;
}
.card-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(0,0,0,.06);
  border-color: rgba(13,110,253,.3);
}

/* Ajustes responsivos */
@media (max-width: 768px) {
  .hero-diego { padding-top: .5rem; padding-bottom: .5rem; }
}
</style>
