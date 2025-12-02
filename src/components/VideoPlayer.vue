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

function handleVideoEnded() {
  console.log('✓ Video terminado:', props.videoSrc)
  emit('ended')
}

function handleVideoError(event) {
  console.error('✗ Error en el video:', event, props.videoSrc)
  emit('error', event)
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
  if (!video) return

  console.log('Intentando reproducir video:', props.videoSrc)

  // Resetear video
  video.currentTime = 0
  video.muted = true

  // Intentar reproducir
  const attemptPlay = () => {
    video.play()
      .then(() => {
        console.log('✓ Play() exitoso')
      })
      .catch(error => {
        console.error('✗ Error en play():', error)
        // Reintentar después de un pequeño delay
        setTimeout(() => {
          video.play().catch(err => {
            console.error('✗ Segundo intento fallido:', err)
            emit('error', err)
          })
        }, 200)
      })
  }

  // Si ya tiene metadata, reproducir inmediatamente
  if (video.readyState >= 1) {
    attemptPlay()
  } else {
    // Esperar a que cargue metadata
    console.log('Esperando metadata...')
    video.addEventListener('loadedmetadata', attemptPlay, { once: true })
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
