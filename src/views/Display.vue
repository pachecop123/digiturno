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

    <div class="container-xxl display-container">
      <!-- Banner de Fecha y Hora -->
      <section class="datetime-banner">
        <div class="datetime-banner-content">
          <div class="date-section">
            <i class="bi bi-calendar3"></i>
            <span>{{ currentDate }}</span>
          </div>
          <div class="time-section">
            <i class="bi bi-clock"></i>
            <span>{{ currentTime }}</span>
          </div>
        </div>
      </section>

      <div class="display-grid-enhanced">
        <!-- Turno -->
        <section class="tile tile-turn-carniceria">
          <header class="tile-head-carniceria">
            <div class="icon-wrapper-carniceria">
              <i class="bi bi-person-lines-fill"></i>
            </div>
            <span class="section-title">Turno Actual - Seccion Carnes</span>
          </header>

          <div class="tile-body-modern">
            <div class="turn-wrapper">
              <div class="turn-number-carniceria" :class="{ 'animate-number': popAnim }">
                {{ showing }}
              </div>
              <div class="turn-label-carniceria">Seccion Carnes</div>
            </div>
          </div>

          <footer class="tile-foot-carniceria">
            <span class="live-indicator-carniceria"></span>
            Siempre Contigo
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

          <!-- Reproductor de video cuando hay un video activo -->
          <div v-if="currentAd && currentAd.type === 'video'" class="tile-body-ads video-mode">
            <VideoPlayer
              :video-src="currentAd.path"
              @ended="handleVideoFinished"
              @error="handleVideoFinished"
            />
          </div>

          <!-- Carrusel de imágenes cuando no hay video activo -->
          <div v-else-if="showingImages && imageAds.length > 0" class="tile-body-ads image-mode">
            <ImageCarousel
              :images="imageAds"
              :interval="5000"
              @cycle-complete="handleImageCycleComplete"
            />
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
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import store from '../store'
import VideoPlayer from '../components/VideoPlayer.vue'
import ImageCarousel from '../components/ImageCarousel.vue'

/* Derivados del store */
const current      = computed(() => store.state?.current ?? null)
const lastAttended = computed(() => store.state?.lastAttended ?? null)
const prefix       = computed(() => store.state?.prefix || 'C')
const queue        = computed(() => Array.isArray(store.state?.queue) ? store.state.queue : [])

/* ===== Fecha y hora en tiempo real ===== */
const currentDate = ref('')
const currentTime = ref('')
let clockInterval = null

function updateClock() {
  const now = new Date()

  // Formato de fecha: "Lunes, 9 de Diciembre de 2025"
  currentDate.value = now.toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Formato de hora: "14:30:45"
  currentTime.value = now.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

/* ===== Publicidades ===== */
const ads = ref([])
const currentAd = ref(null) // Video actual que se está mostrando
const showingImages = ref(false) // Estado para mostrar el carrusel de imágenes

// Separar imágenes de videos
const imageAds = computed(() => ads.value.filter(ad => ad.type === 'image'))
const videoAds = computed(() => ads.value.filter(ad => ad.type === 'video'))

async function loadAds() {
  try {
    const response = await fetch('/api/ads', {
      cache: 'no-cache',
    })
    const data = await response.json()
    ads.value = data.filter(ad => ad.name !== 'logo.png')
    console.log('Publicidades cargadas:', ads.value.length, '- Imágenes:', imageAds.value.length, 'Videos:', videoAds.value.length)
  } catch (error) {
    console.error('Error cargando publicidades:', error)
    // Fallback a publicidades por defecto
    ads.value = [
      { path: '/ads/ad1.jpg', type: 'image', name: 'ad1.jpg' },
      { path: '/ads/ad2.jpg', type: 'image', name: 'ad2.jpg' },
      { path: '/ads/ad3.jpg', type: 'image', name: 'ad3.jpg' },
      { path: '/ads/video1.mp4', type: 'video', name: 'video1.mp4' }
    ]
  }
}

/* Prioridad de visualización */
const showing = computed(() =>
  current.value || lastAttended.value || queue.value[0] || `${prefix.value}-000`
)

/* Anunciar el turno por voz cuando cambia */
function announceTurn(turnNumber) {
  try {
    // Verificar si el navegador soporta Web Speech API
    if ('speechSynthesis' in window) {
      // Cancelar cualquier anuncio anterior
      window.speechSynthesis.cancel()
      
      // Crear el mensaje a pronunciar
      // Formatear el número del turno para que se pronuncie mejor
      const turnFormatted = String(turnNumber).replace(/-/g, ' ')
      const message = `Turno ${turnFormatted}. Por favor acérquese a la sección de carnes`
      
      // Crear el objeto de síntesis de voz
      const utterance = new SpeechSynthesisUtterance(message)
      
      // Configurar la voz (intentar usar español)
      const voices = window.speechSynthesis.getVoices()
      const spanishVoice = voices.find(voice => 
        voice.lang.startsWith('es') || voice.lang.includes('Spanish')
      )
      
      if (spanishVoice) {
        utterance.voice = spanishVoice
      } else {
        // Si no hay voz en español, usar la voz predeterminada
        utterance.lang = 'es-ES'
      }
      
      // Configurar propiedades de la voz
      utterance.rate = 0.9  // Velocidad (0.1 a 10)
      utterance.pitch = 1.0  // Tono (0 a 2)
      utterance.volume = 1.0  // Volumen (0 a 1)
      
      // Reproducir el anuncio
      window.speechSynthesis.speak(utterance)
      
      console.log('Anunciando turno:', turnNumber)
    } else {
      console.warn('El navegador no soporta síntesis de voz')
      // Fallback: reproducir sonido si no hay soporte de voz
      playFallbackSound()
    }
  } catch (error) {
    console.warn('Error al anunciar el turno:', error)
    // Fallback: reproducir sonido si hay error
    playFallbackSound()
  }
}

/* Sonido de respaldo si no hay soporte de voz */
function playFallbackSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const o1 = ctx.createOscillator()
    const o2 = ctx.createOscillator()
    const g = ctx.createGain()
    
    // Crear un sonido de notificación (dos tonos ascendentes)
    o1.type = 'sine'
    o1.frequency.value = 523.25 // Do5
    o2.type = 'sine'
    o2.frequency.value = 659.25 // Mi5
    
    o1.connect(g)
    o2.connect(g)
    g.connect(ctx.destination)
    
    // Configurar volumen
    g.gain.setValueAtTime(0, ctx.currentTime)
    g.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05)
    
    // Primer tono
    o1.start(ctx.currentTime)
    o1.stop(ctx.currentTime + 0.15)
    
    // Segundo tono (más agudo)
    o2.start(ctx.currentTime + 0.15)
    o2.stop(ctx.currentTime + 0.3)
    
    // Fade out
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3)
    
    // Limpiar contexto después de reproducir
    setTimeout(() => {
      ctx.close()
    }, 400)
  } catch (error) {
    console.warn('No se pudo reproducir el sonido de notificación:', error)
  }
}

/* Animación de número */
const popAnim = ref(false)
watch(showing, (n, o) => {
  if (n !== o) {
    popAnim.value = true
    setTimeout(() => (popAnim.value = false), 600)
    // Anunciar el turno por voz cuando cambia
    announceTurn(n)
  }
})

/* ===== Pantalla completa ===== */
const rootEl = ref(null)
const isFullscreen = ref(false)

function getFullscreenElement() {
  return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement
}

function requestFs(el) {
  return el.requestFullscreen?.() || el.webkitRequestFullscreen?.() || el.mozRequestFullScreen?.() || el.msRequestFullscreen?.()
}

function exitFs() {
  return document.exitFullscreen?.() || document.webkitExitFullscreen?.() || document.mozCancelFullScreen?.() || document.msExitFullscreen?.()
}

async function toggleFullscreen() {
  if (getFullscreenElement()) {
    try { await exitFs() } catch {}
  } else {
    const el = rootEl.value || document.documentElement
    try {
      const r = requestFs(el)
      if (r && typeof r.then === 'function') await r
    } catch {}
  }
}

function onFsChange() {
  const fs = !!getFullscreenElement()
  isFullscreen.value = fs
  document.body.classList.toggle('hide-navbar', fs)
  document.body.classList.toggle('fullscreen-mode', fs)
}

/* ===== Sistema de Rotación de Publicidades ===== */
let videoRotationIndex = ref(0)
const failedVideos = ref(new Set())

// Validar si un video existe y es accesible
async function validateVideo(videoPath) {
  try {
    const response = await fetch(videoPath, { method: 'HEAD' })
    return response.ok
  } catch (error) {
    console.error('Error validando video:', videoPath, error)
    return false
  }
}

// Mostrar el siguiente video
async function showNextVideo() {
  if (videoAds.value.length === 0) {
    console.log('No hay videos disponibles')
    showingImages.value = true
    currentAd.value = null
    return
  }

  // Buscar un video válido
  let attempts = 0
  const maxAttempts = videoAds.value.length

  while (attempts < maxAttempts) {
    const candidateVideo = videoAds.value[videoRotationIndex.value]

    // Avanzar al siguiente video para la próxima vez
    videoRotationIndex.value = (videoRotationIndex.value + 1) % videoAds.value.length
    attempts++

    // Si este video ya falló antes, intentar con el siguiente
    if (failedVideos.value.has(candidateVideo.path)) {
      console.log('Omitiendo video previamente fallido:', candidateVideo.name)
      continue
    }

    // Validar si el video existe
    const isValid = await validateVideo(candidateVideo.path)
    if (!isValid) {
      console.warn('Video no válido o no encontrado:', candidateVideo.name)
      failedVideos.value.add(candidateVideo.path)
      continue
    }

    // Video válido encontrado
    showingImages.value = false
    currentAd.value = candidateVideo
    console.log(`Mostrando video ${attempts} de ${videoAds.value.length}:`, currentAd.value.name)
    return
  }

  // Si llegamos aquí, todos los videos fallaron
  console.warn('Todos los videos fallaron, mostrando imágenes')
  showingImages.value = true
  currentAd.value = null
}

// Cuando un video termina o falla
function handleVideoFinished(error) {
  if (error) {
    console.warn('⚠ Video falló o no pudo cargarse, omitiendo...')
    // Marcar este video como fallido para no intentar reproducirlo de nuevo
    if (currentAd.value && currentAd.value.path) {
      failedVideos.value.add(currentAd.value.path)
    }
  } else {
    console.log('✓ Video terminado')
  }

  // Si hay imágenes, mostrarlas
  if (imageAds.value.length > 0) {
    console.log('Mostrando carrusel de imágenes')
    showingImages.value = true
    currentAd.value = null
  } else {
    // Si no hay imágenes, pasar al siguiente video
    console.log('No hay imágenes, pasando al siguiente video')
    showNextVideo()
  }
}

// Cuando el ciclo de imágenes se completa
function handleImageCycleComplete() {
  console.log('✓ Ciclo de imágenes completado')

  // Si hay videos, mostrar el siguiente
  if (videoAds.value.length > 0) {
    console.log('Pasando al siguiente video')
    showNextVideo()
  }
  // Si no hay videos, el carrusel seguirá rotando automáticamente
}

// Iniciar el sistema de rotación
function startRotation() {
  console.log('=== Iniciando sistema de rotación de publicidades ===')
  console.log('Total:', ads.value.length, '| Imágenes:', imageAds.value.length, '| Videos:', videoAds.value.length)

  videoRotationIndex.value = 0

  if (videoAds.value.length > 0) {
    // Si hay videos, comenzar con el primer video
    console.log('Comenzando con primer video')
    showNextVideo()
  } else if (imageAds.value.length > 0) {
    // Si solo hay imágenes, mostrar el carrusel
    console.log('Solo hay imágenes, mostrando carrusel')
    showingImages.value = true
    currentAd.value = null
  } else {
    console.log('No hay publicidades para mostrar')
  }
}

// Detener la rotación
function stopRotation() {
  console.log('Deteniendo rotación de publicidades')
  showingImages.value = false
  currentAd.value = null
  videoRotationIndex.value = 0
}

/* Auto-actualización de anuncios */
let adsRefreshInterval = null

onMounted(() => {
  document.addEventListener('fullscreenchange', onFsChange)
  document.addEventListener('webkitfullscreenchange', onFsChange)
  document.addEventListener('mozfullscreenchange', onFsChange)
  document.addEventListener('MSFullscreenChange', onFsChange)

  // Cargar voces para síntesis de voz (necesario en algunos navegadores)
  if ('speechSynthesis' in window) {
    // Algunos navegadores necesitan que se carguen las voces primero
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) {
        console.log('Voces disponibles:', voices.length)
        const spanishVoices = voices.filter(v => v.lang.startsWith('es'))
        if (spanishVoices.length > 0) {
          console.log('Voces en español encontradas:', spanishVoices.length)
        }
      }
    }
    
    // Cargar voces inmediatamente
    loadVoices()
    
    // Algunos navegadores cargan las voces de forma asíncrona
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }

  // Iniciar reloj
  updateClock()
  clockInterval = setInterval(updateClock, 1000)

  // Cargar publicidades e iniciar rotación
  loadAds().then(() => {
    nextTick(() => {
      startRotation()
    })
  })

  // Refrescar publicidades cada 5 minutos
  adsRefreshInterval = setInterval(() => {
    loadAds().then(() => {
      // Reiniciar rotación con las nuevas publicidades
      stopRotation()
      nextTick(() => {
        startRotation()
      })
    })
  }, 5 * 60 * 1000)
})

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', onFsChange)
  document.removeEventListener('webkitfullscreenchange', onFsChange)
  document.removeEventListener('mozfullscreenchange', onFsChange)
  document.removeEventListener('MSFullscreenChange', onFsChange)

  // Detener reloj
  if (clockInterval) {
    clearInterval(clockInterval)
  }

  // Detener rotación de publicidades
  stopRotation()

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
  display: flex;
  align-items: center;
  justify-content: center;
}

.display-diegoexito::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(196, 30, 58, 0.08) 0%, rgba(30, 64, 175, 0.08) 100%);
  -webkit-backdrop-filter: blur(0.5px);
  backdrop-filter: blur(0.5px);
}

.display-container {
  position: relative;
  z-index: 1;
  padding: 2rem 1rem;
  width: 100%;
}

@media (min-width: 768px) {
  .display-container {
    padding: 3rem 2rem;
  }
}

.display-grid-enhanced {
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr;
  grid-auto-rows: minmax(var(--panel-h), auto);
  max-width: 1800px;
  margin: 0 auto;
}
@media (min-width: 768px) {
  .display-grid-enhanced {
    grid-template-columns: 1fr 2fr;
    align-items: stretch;
  }
}
@media (min-width: 1400px) {
  .display-grid-enhanced {
    grid-template-columns: 1fr 2.5fr;
    gap: 3rem;
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

/* Banner de Fecha y Hora */
.datetime-banner {
  /* ========================================
     AJUSTES PERSONALIZABLES DEL BANNER
     Cambia estos valores a tu gusto:
     ======================================== */
  --banner-max-width: 100%;           /* Ancho máximo (ej: 1200px, 1400px, 100%) */
  --banner-margin-bottom: 2rem;       /* Espacio debajo del banner */
  --banner-border-radius: 20px;       /* Redondeo de esquinas */
  --banner-padding-vertical: 1.25rem; /* ALTURA interna (arriba/abajo) */
  --banner-padding-horizontal: 5rem;  /* ANCHO interno (izquierda/derecha) */
  --banner-gap: 2rem;                 /* Espacio entre fecha y hora */

  /* Tamaños de texto */
  --fecha-texto-size: 1.35rem;        /* Tamaño texto de la fecha */
  --hora-texto-size: 2.5rem;          /* Tamaño texto de la hora */
  --icono-size: 1.75rem;              /* Tamaño de los iconos */
  --icon-text-gap: 0.75rem;           /* Espacio entre icono y texto */
  /* ======================================== */

  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%);
  border: 2px solid rgba(196, 30, 58, 0.28);
  border-radius: var(--banner-border-radius);
  box-shadow: 10 8px 32px rgba(196, 30, 58, 0.25);
  margin-bottom: var(--banner-margin-bottom);
  max-width: var(--banner-max-width);
  overflow: hidden;
}

.datetime-banner-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--banner-padding-vertical) var(--banner-padding-horizontal);
  gap: var(--banner-gap);
  flex-wrap: wrap;
}

.date-section,
.time-section {
  display: flex;
  align-items: center;
  gap: var(--icon-text-gap);
}

.date-section {
  flex: 1;
  min-width: 300px;
}

.date-section i {
  font-size: var(--icono-size);
  color: var(--diego-red);
}

.date-section span {
  font-size: var(--fecha-texto-size);
  font-weight: 700;
  color: var(--diego-red);
  text-transform: capitalize;
  letter-spacing: 0.5px;
}

.time-section {
  flex-shrink: 0;
}

.time-section i {
  font-size: var(--icono-size);
  color: var(--diego-blue);
}

.time-section span {
  font-family: 'Courier New', monospace;
  font-size: var(--hora-texto-size);
  font-weight: 900;
  color: var(--diego-blue);
  letter-spacing: 0.1em;
  text-shadow: 0 2px 8px rgba(30, 64, 175, 0.2);
}

@media (max-width: 768px) {
  .datetime-banner-content {
    flex-direction: column;
    padding: 1rem 1.5rem;
    gap: 1rem;
  }

  .date-section {
    min-width: unset;
    width: 100%;
    justify-content: center;
  }

  .time-section {
    width: 100%;
    justify-content: center;
  }

  .date-section span {
    font-size: 1.1rem;
  }

  .time-section span {
    font-size: 2rem;
  }
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

/* Modo video - fondo negro */
.tile-body-ads.video-mode {
  background: #000;
}

/* Modo imagen - mantener gradiente */
.tile-body-ads.image-mode {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
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
