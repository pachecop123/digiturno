<template>
  <div class="display-diegoexito" ref="rootEl">
    <!-- Botón flotante: Pantalla completa / Salir -->
    <button
      class="fs-btn btn btn-light btn-sm shadow"
      type="button"
      @click="toggleFullscreen"
      :title="isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'"
    >
      <i :class="isFullscreen ? 'bi bi-fullscreen-exit' : 'bi bi-arrows-fullscreen'"></i>
    </button>

    <div class="container-xl py-4">
      <div class="display-grid-enhanced">
        <!-- Turno -->
        <section class="tile tile-turn-carniceria">
          <header class="tile-head-carniceria">
            <div class="icon-wrapper-carniceria">
              <i class="bi bi-person-lines-fill"></i>
            </div>
            <span class="section-title">Turno Actual - Carnicería</span>
          </header>

          <div class="tile-body-modern">
            <div class="turn-wrapper">
              <div class="turn-number-carniceria" :class="{ 'animate-number': popAnim }">
                {{ showing }}
              </div>
              <div class="turn-label-carniceria">CARNICERÍA</div>
            </div>
          </div>

          <footer class="tile-foot-carniceria">
            <span class="live-indicator-carniceria"></span>
            Siempre Contigo - Actualizado en tiempo real
          </footer>
        </section>

        <!-- Publicidad -->
        <section class="tile tile-ads-diegoexito">
          <header class="tile-head-carniceria">
            <div class="icon-wrapper-carniceria">
              <i class="bi bi-megaphone-fill"></i>
            </div>
            <span class="section-title">Diego Éxito - Ofertas</span>
          </header>

          <div class="tile-body-ads" v-if="ads.length === 0">
            <div class="ads-loading">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando publicidad...</span>
              </div>
              <p class="mt-3">Cargando publicidad...</p>
            </div>
          </div>

          <div v-else id="adsCarousel" class="tile-body-ads carousel slide" data-bs-ride="false">
            <div class="carousel-inner" ref="carouselInner">
              <div v-for="(ad, index) in ads" :key="`ad-${index}-${ad.name}`" class="carousel-item" :class="{ active: index === 0 }">
                <img v-if="ad.type === 'image'" :src="ad.path" class="ads-media" :alt="ad.name" loading="lazy" />
                <video v-else-if="ad.type === 'video'" :ref="`video-${index}`" class="ads-media" muted loop playsinline>
                  <source :src="ad.path" type="video/mp4">
                </video>
              </div>
            </div>

            <button v-if="ads.length > 1" class="carousel-control-prev carousel-control-diegoexito" type="button" data-bs-target="#adsCarousel" data-bs-slide="prev">
              <span class="carousel-control-prev-icon control-icon-diegoexito" aria-hidden="true"></span>
              <span class="visually-hidden">Anterior</span>
            </button>
            <button v-if="ads.length > 1" class="carousel-control-next carousel-control-diegoexito" type="button" data-bs-target="#adsCarousel" data-bs-slide="next">
              <span class="carousel-control-next-icon control-icon-diegoexito" aria-hidden="true"></span>
              <span class="visually-hidden">Siguiente</span>
            </button>
          </div>

          <footer class="tile-foot-carniceria">
            Diego Éxito - Siempre Contigo
          </footer>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import store from '../store'

/* Derivados del store */
const current      = computed(() => store.state?.current ?? null)
const lastAttended = computed(() => store.state?.lastAttended ?? null)
const prefix       = computed(() => store.state?.prefix || 'C')
const queue        = computed(() => Array.isArray(store.state?.queue) ? store.state.queue : [])

/* Publicidades */
const ads = ref([])

async function loadAds() {
  try {
    const response = await fetch('/api/ads', {
      cache: 'no-cache', // Asegurar que siempre obtenemos la lista actualizada
    })
    const data = await response.json()

    // Filtrar el logo de la lista de anuncios
    ads.value = data.filter(ad => ad.name !== 'logo.png')

    // Pre-cargar imágenes para mejor rendimiento
    ads.value.forEach(ad => {
      if (ad.type === 'image') {
        const img = new Image()
        img.src = ad.path
      }
    })
  } catch (error) {
    console.error('Error cargando publicidades:', error)
    // No hay imágenes por defecto, solo se muestran las subidas
    ads.value = []
  }
}

/* Prioridad de visualización:
   1) en atención
   2) último atendido
   3) primero en cola
   4) prefijo-000
*/
const showing = computed(() =>
  current.value
  || lastAttended.value
  || queue.value[0]
  || `${prefix.value}-000`
)

/* Animación de número */
const popAnim = ref(false)
watch(showing, (n, o) => {
  if (n !== o) {
    popAnim.value = true
    setTimeout(() => (popAnim.value = false), 600)
  }
})

/* ===== Pantalla completa ===== */
const rootEl = ref(null)
const isFullscreen = ref(false)
const carouselInner = ref(null)

function getFullscreenElement() {
  return document.fullscreenElement
    || document.webkitFullscreenElement
    || document.mozFullScreenElement
    || document.msFullscreenElement
}

function requestFs(el) {
  return (
    el.requestFullscreen?.()
    || el.webkitRequestFullscreen?.()
    || el.mozRequestFullScreen?.()
    || el.msRequestFullscreen?.()
  )
}

function exitFs() {
  return (
    document.exitFullscreen?.()
    || document.webkitExitFullscreen?.()
    || document.mozCancelFullScreen?.()
    || document.msExitFullscreen?.()
  )
}

async function enterFullscreen() {
  const el = rootEl.value || document.documentElement
  try {
    const r = requestFs(el)
    if (r && typeof r.then === 'function') await r
  } catch {
    // Si falla (p.ej. iOS Safari), hacemos modo "kiosco" visual
  }
  // Forzamos ocultar navbar aunque el FS no esté disponible
  document.body.classList.add('hide-navbar')
  isFullscreen.value = !!getFullscreenElement() || true
}

async function leaveFullscreen() {
  try { await exitFs() } catch {}
  document.body.classList.remove('hide-navbar')
  isFullscreen.value = !!getFullscreenElement() && false
}

function onFsChange() {
  const fs = !!getFullscreenElement()
  isFullscreen.value = fs
  document.body.classList.toggle('hide-navbar', fs)
}

function toggleFullscreen() {
  if (isFullscreen.value || getFullscreenElement()) {
    leaveFullscreen()
  } else {
    enterFullscreen()
  }
}

/* Control de videos en carrusel */
function handleCarouselSlide() {
  if (!carouselInner.value) return

  const videos = carouselInner.value.querySelectorAll('video')
  videos.forEach((video, index) => {
    const item = video.closest('.carousel-item')
    if (item?.classList.contains('active')) {
      video.play().catch(() => {})
    } else {
      video.pause()
      video.currentTime = 0
    }
  })
}

/* Auto-actualización de anuncios cada 5 minutos */
let adsRefreshInterval = null
let carouselInstance = null

function initCarousel() {
  const carouselEl = document.getElementById('adsCarousel')
  if (!carouselEl) return

  // Destruir instancia anterior si existe
  if (carouselInstance) {
    try {
      carouselInstance.dispose()
    } catch (e) {}
  }

  // Importar Bootstrap Carousel dinámicamente
  import('bootstrap/dist/js/bootstrap.bundle.min.js').then((bootstrap) => {
    carouselInstance = new bootstrap.Carousel(carouselEl, {
      interval: 6000,
      ride: 'carousel',
      pause: false,
      wrap: true
    })

    // Configurar evento de slide
    carouselEl.addEventListener('slide.bs.carousel', handleCarouselSlide)

    // Iniciar videos si es el primer slide
    handleCarouselSlide()
  })
}

onMounted(() => {
  document.addEventListener('fullscreenchange', onFsChange)
  document.addEventListener('webkitfullscreenchange', onFsChange)
  document.addEventListener('mozfullscreenchange', onFsChange)
  document.addEventListener('MSFullscreenChange', onFsChange)

  loadAds().then(() => {
    // Esperar a que Vue renderice el DOM
    setTimeout(() => {
      initCarousel()
    }, 150)
  })

  // Auto-actualizar anuncios cada 5 minutos
  adsRefreshInterval = setInterval(() => {
    loadAds().then(() => {
      setTimeout(() => {
        initCarousel()
      }, 200)
    })
  }, 5 * 60 * 1000)
})

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', onFsChange)
  document.removeEventListener('webkitfullscreenchange', onFsChange)
  document.removeEventListener('mozfullscreenchange', onFsChange)
  document.removeEventListener('MSFullscreenChange', onFsChange)

  const carousel = document.getElementById('adsCarousel')
  if (carousel) {
    carousel.removeEventListener('slide.bs.carousel', handleCarouselSlide)
  }

  // Destruir instancia de carousel
  if (carouselInstance) {
    try {
      carouselInstance.dispose()
    } catch (e) {}
  }

  // Limpiar intervalo de actualización
  if (adsRefreshInterval) {
    clearInterval(adsRefreshInterval)
  }
})
</script>

<style scoped>
/* ===== Botón flotante de pantalla completa ===== */
.fs-btn {
  position: fixed;
  top: 14px;
  right: 14px;
  z-index: 1060; /* por encima de carousel */
  border-radius: 10px;
  padding: .4rem .6rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.fs-btn i { font-size: 1.1rem; }

/* =========================
   Paleta y sizing (scoped)
   ========================= */
.display-diegoexito {
  --diego-red: #C41E3A;
  --diego-red-dark: #A61729;
  --diego-red-light: #DC143C;
  --diego-blue: #1E40AF;
  --diego-blue-dark: #1D4ED8;
  --diego-white: #FFFFFF;
  --diego-cream: #FEF7ED;
  --panel-h: clamp(400px, 72dvh, 920px);
}

.display-diegoexito {
  background: radial-gradient(ellipse at top, var(--diego-red) 0%, var(--diego-red-dark) 35%, #8B0000 100%);
  background-attachment: fixed;
  min-height: 100dvh;
  color: var(--diego-white);
  position: relative;
}

.display-diegoexito::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(196, 30, 58, 0.08) 0%, rgba(30, 64, 175, 0.08) 100%);
  -webkit-backdrop-filter: blur(0.5px);
  backdrop-filter: blur(0.5px);
}

.container-xl { position: relative; z-index: 1; }

.display-grid-enhanced {
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr;
  grid-auto-rows: minmax(var(--panel-h), auto);
}
@media (min-width: 768px) {
  .display-grid-enhanced {
    grid-template-columns: 1fr 2fr;
    align-items: stretch;
  }
}

/* Tarjetas */
.tile {
  background: rgba(255, 255, 255, 0.96);
  border: 2px solid rgba(196, 30, 58, 0.28);
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(196, 30, 58, 0.28);
  display: flex;
  flex-direction: column;
  min-height: var(--panel-h);
  overflow: hidden;
  transition: transform .28s ease, box-shadow .28s ease;
  position: relative;
}
.tile::before {
  content: '';
  position: absolute; left: 0; right: 0; top: 0; height: 3px;
  background: linear-gradient(90deg, var(--diego-red) 0%, var(--diego-blue) 50%, var(--diego-red) 100%);
}
.tile:hover { transform: translateY(-4px); box-shadow: 0 18px 50px rgba(196, 30, 58, 0.35); }

/* Header */
.tile-head-carniceria {
  background: linear-gradient(135deg, var(--diego-red) 0%, var(--diego-red-dark) 100%);
  padding: 1.25rem 1.5rem;
  display: flex; align-items: center; gap: 1rem;
}
.icon-wrapper-carniceria {
  background: var(--diego-white); color: var(--diego-red);
  padding: .7rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(0, 0, 0, .18);
  display: grid; place-items: center;
}
.icon-wrapper-carniceria i { font-size: 1.25rem; }
.section-title {
  font-weight: 800; font-size: 1.05rem; color: var(--diego-white);
  text-shadow: 0 2px 4px rgba(0, 0, 0, .28); letter-spacing: .5px;
}

/* Turno */
.tile-body-modern {
  flex: 1; display: grid; place-items: center;
  padding: 1.75rem; background: var(--diego-white);
}
.turn-wrapper { text-align: center; position: relative; }
.turn-number-carniceria {
  font-family: 'Arial Black', Arial, sans-serif;
  font-weight: 900;
  font-size: clamp(3.6rem, 11vw, 8rem);
  line-height: 1; letter-spacing: .05em;
  color: var(--diego-red);
  text-shadow: 0 4px 20px rgba(196, 30, 58, 0.26);
  position: relative; margin-bottom: .5rem;
}
.turn-number-carniceria::after {
  content: ''; position: absolute; bottom: -14px; left: 50%; transform: translateX(-50%);
  width: 96px; height: 6px; border-radius: 3px;
  background: linear-gradient(135deg, var(--diego-blue) 0%, var(--diego-blue-dark) 100%);
  box-shadow: 0 2px 15px rgba(30, 64, 175, .42);
}
.turn-label-carniceria {
  margin-top: 2rem; font-size: 1rem; font-weight: 800;
  letter-spacing: .3em; text-transform: uppercase; color: var(--diego-blue);
  text-shadow: 0 2px 4px rgba(30, 64, 175, .18);
}

/* Footer */
.tile-foot-carniceria {
  background: linear-gradient(135deg, var(--diego-blue) 0%, var(--diego-blue-dark) 100%);
  padding: .9rem 1.5rem; text-align: center; color: var(--diego-white);
  font-size: .92rem; font-weight: 600; display: flex; gap: .5rem; align-items: center; justify-content: center;
}
.live-indicator-carniceria {
  width: 10px; height: 10px; border-radius: 50%; background: #10b981;
  animation: pulse 2s infinite; box-shadow: 0 0 15px rgba(16, 185, 129, .75);
}
@keyframes pulse { 0%,100%{opacity:1; transform:scale(1)} 50%{opacity:.65; transform:scale(1.2)} }

/* Publicidad - Contenedor principal */
.tile-body-ads {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  flex-direction: column;
}

/* Estado de carga */
.tile-body-ads .ads-loading {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6c757d;
}

/* Carrusel ocupa todo el espacio */
.tile-body-ads.carousel {
  width: 100%;
  height: 100%;
  flex: 1;
}

.tile-body-ads .carousel-inner {
  width: 100%;
  height: 100%;
  position: relative;
}

.tile-body-ads .carousel-item {
  width: 100%;
  height: 100%;
  display: flex !important;
  align-items: center;
  justify-content: center;
}

/* Bootstrap ya maneja position y transitions, solo agregamos flex */
.tile-body-ads .carousel-item.active,
.tile-body-ads .carousel-item-next,
.tile-body-ads .carousel-item-prev {
  display: flex !important;
}

/* Imágenes y videos se ajustan al contenedor */
.tile-body-ads .ads-media {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  object-position: center;
  display: block;
  /* Optimización de renderizado */
  transform: translateZ(0);
  backface-visibility: hidden;
}
.ads-item { height: 100%; display: grid; place-items: center; padding: 2rem; }
.offer-slide { text-align: center; width: 100%; color: var(--diego-red); }
.logo-container { margin-bottom: 2rem; }
.logo-circle {
  width: 120px; height: 120px; margin: 0 auto; border-radius: 50%;
  background: radial-gradient(circle, var(--diego-red) 0%, var(--diego-red-dark) 100%);
  display: grid; place-items: center; box-shadow: 0 8px 25px rgba(196,30,58,.35);
}
.logo-content { color: #fff; font-size: 2rem; display: grid; gap: .5rem; place-items: center; }
.offer-title { font-size: clamp(1.7rem, 4vw, 2.4rem); font-weight: 900; color: var(--diego-red); margin-bottom: 1rem; text-shadow: 0 2px 4px rgba(196,30,58,.18); }
.offer-subtitle { font-size: 1.1rem; color: var(--diego-blue); font-weight: 600; margin-bottom: 1.6rem; }
.offer-badge {
  background: linear-gradient(135deg, var(--diego-blue) 0%, var(--diego-blue-dark) 100%);
  color: #fff; padding: .65rem 1.3rem; border-radius: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em;
  display: inline-block; box-shadow: 0 4px 15px rgba(30,64,175,.28);
}

/* Controles carrusel */
.carousel-control-diegoexito { width: 60px; opacity: 0; transition: opacity .25s ease; }
.ads-stage-diegoexito:hover .carousel-control-diegoexito { opacity: .85; }
.carousel-control-diegoexito:hover { opacity: 1 !important; }
.control-icon-diegoexito { width: 40px; height: 40px; background: var(--diego-red) !important; border-radius: 50%;
  box-shadow: 0 4px 15px rgba(196,30,58,.35); transition: transform .2s ease, background .2s ease; }
.carousel-control-diegoexito:hover .control-icon-diegoexito { background: var(--diego-red-dark) !important; transform: scale(1.06); }

/* Animación del turno */
.animate-number { animation: popCarniceria .6s cubic-bezier(.68,-.55,.265,1.55); }
@keyframes popCarniceria { 0%{transform:scale(.85);opacity:.85} 50%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }

/* Responsive tweaks */
@media (max-width: 767px) {
  .display-grid-enhanced { gap: 1.25rem; }
  .tile { min-height: 360px; }
  .tile-body-modern { padding: 1.25rem; }
  .turn-number-carniceria { font-size: clamp(3rem, 14vw, 6.4rem); }
  .logo-circle { width: 86px; height: 86px; }
}

/* Accesibilidad / motion */
@media (prefers-reduced-motion: reduce) {
  .tile, .tile:hover, .animate-number, .carousel { animation: none !important; transition: none !important; }
}
</style>

<!-- ❗️Regla GLOBAL para ocultar el navbar cuando haya fullscreen -->
<style>
.hide-navbar .app-navbar { display: none !important; }
</style>
