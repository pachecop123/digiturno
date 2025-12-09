<template>
  <div class="video-player-container">
    <video
      ref="videoRef"
      class="video-player"
      muted
      playsinline
      preload="auto"
      @ended="handleVideoEnded"
      @error="handleVideoError"
      @loadedmetadata="handleMetadataLoaded"
      @play="handlePlay"
      @pause="handlePause"
    >
      <source :src="videoSrc" />
      Tu navegador no soporta reproducción de video.
    </video>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  videoSrc: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['ended', 'error'])

const videoRef = ref(null)
const hasError = ref(false)
let errorTimeout = null
let errorCount = 0

function handleVideoEnded() {
  console.log('✓ Video terminado:', props.videoSrc)
  emit('ended')
}

function handleVideoError(event) {
  // Incrementar contador de errores
  errorCount++

  // Evitar reportar el mismo error múltiples veces
  if (hasError.value) return

  // Si es el primer error, esperar un momento para ver si hay más
  if (errorCount === 1) {
    if (errorTimeout) clearTimeout(errorTimeout)

    errorTimeout = setTimeout(() => {
      hasError.value = true
      console.error('✗ Error cargando video:', props.videoSrc)
      emit('error', event)
      errorCount = 0
    }, 100)
  }
}

function handleMetadataLoaded() {
  const video = videoRef.value
  if (video) {
    console.log('✓ Metadata cargada - Duración:', video.duration, 'segundos')
  }
}

function handlePlay() {
  console.log('✓ Video reproduciéndose:', props.videoSrc)
}

function handlePause() {
  console.log('⏸ Video pausado:', props.videoSrc)
}

function playVideo() {
  const video = videoRef.value
  if (!video || hasError.value) return

  console.log('Intentando reproducir video:', props.videoSrc)

  // Resetear estados de error
  hasError.value = false
  errorCount = 0
  if (errorTimeout) {
    clearTimeout(errorTimeout)
    errorTimeout = null
  }

  // Resetear video
  video.currentTime = 0
  video.muted = true

  // Intentar reproducir
  const attemptPlay = () => {
    if (hasError.value) return // No intentar si ya hubo error

    video.play()
      .then(() => {
        console.log('✓ Play() exitoso')
      })
      .catch(error => {
        // Solo reportar errores que no sean por pausa
        if (error.name !== 'AbortError') {
          console.error('✗ Error en play():', error.message)
        }
        // No reintentar si ya hubo un error de carga del archivo
        if (hasError.value) {
          return
        }
      })
  }

  // Si ya tiene metadata, reproducir inmediatamente
  if (video.readyState >= 1) {
    attemptPlay()
  } else {
    // Esperar a que cargue metadata con timeout
    console.log('Esperando metadata...')
    const timeoutId = setTimeout(() => {
      if (video.readyState < 1 && !hasError.value) {
        console.error('✗ Timeout esperando metadata del video')
        hasError.value = true
        emit('error', new Error('Timeout loading video'))
      }
    }, 5000) // 5 segundos de timeout

    video.addEventListener('loadedmetadata', () => {
      clearTimeout(timeoutId)
      attemptPlay()
    }, { once: true })
  }
}

// Reproducir cuando se monta el componente
onMounted(() => {
  console.log('VideoPlayer montado con src:', props.videoSrc)
  playVideo()
})

// Reproducir si cambia el src
watch(() => props.videoSrc, () => {
  console.log('Video src cambió a:', props.videoSrc)
  playVideo()
})

// Limpiar al desmontar
onBeforeUnmount(() => {
  const video = videoRef.value
  if (video) {
    video.pause()
    video.src = ''
  }

  // Limpiar timeout de errores
  if (errorTimeout) {
    clearTimeout(errorTimeout)
    errorTimeout = null
  }
})
</script>

<style scoped>
.video-player-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.video-player {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  object-position: center;
  display: block;
}
</style>
