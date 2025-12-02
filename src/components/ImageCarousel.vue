<template>
  <div class="image-carousel-container">
    <transition :name="transitionName" mode="out-in">
      <div :key="currentImageIndex" class="image-slide">
        <img
          :src="currentImage.path"
          :alt="currentImage.name"
          class="carousel-image"
          @load="handleImageLoad"
          @error="handleImageError"
        />
      </div>
    </transition>

    <!-- Indicadores (máximo 3 puntos) -->
    <div v-if="images.length > 1" class="carousel-indicators">
      <button
        v-for="dot in 3"
        :key="dot"
        :class="{ active: isActiveDot(dot - 1) }"
        :aria-label="`Posición ${dot}`"
      ></button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    required: true,
    default: () => []
  },
  interval: {
    type: Number,
    default: 5000 // 5 segundos por defecto
  }
})

const emit = defineEmits(['cycle-complete'])

const currentImageIndex = ref(0)
const transitionName = ref('fade')
let intervalTimer = null

const currentImage = computed(() => {
  if (props.images.length === 0) return null
  return props.images[currentImageIndex.value]
})

function handleImageLoad() {
  console.log('✓ Imagen cargada:', currentImage.value?.name)
}

function handleImageError(event) {
  console.error('✗ Error cargando imagen:', currentImage.value?.name, event)
  // Si hay error, pasar a la siguiente imagen
  nextSlide()
}

function nextSlide() {
  const wasLastSlide = currentImageIndex.value === props.images.length - 1

  currentImageIndex.value = (currentImageIndex.value + 1) % props.images.length

  console.log(`Mostrando imagen ${currentImageIndex.value + 1} de ${props.images.length}`)

  // Si completamos un ciclo completo (volvimos al inicio), emitir evento
  if (wasLastSlide) {
    console.log('✓ Ciclo de imágenes completado')
    emit('cycle-complete')
  }
}

function prevSlide() {
  currentImageIndex.value = currentImageIndex.value === 0
    ? props.images.length - 1
    : currentImageIndex.value - 1
  console.log(`Mostrando imagen ${currentImageIndex.value + 1} de ${props.images.length}`)
}

function goToSlide(index) {
  if (index >= 0 && index < props.images.length) {
    currentImageIndex.value = index
    console.log(`Navegando a imagen ${index + 1}`)
    resetInterval()
  }
}

// Determinar cuál de los 3 puntos debe estar activo
function isActiveDot(dotIndex) {
  const totalImages = props.images.length
  const currentIndex = currentImageIndex.value

  if (totalImages <= 3) {
    // Si hay 3 o menos imágenes, mapear directamente
    return dotIndex === currentIndex
  }

  // Para más de 3 imágenes, distribuir en 3 secciones
  const sectionSize = totalImages / 3
  const currentSection = Math.floor(currentIndex / sectionSize)

  // El último punto representa todo lo que está más allá de la sección 2
  if (dotIndex === 2 && currentSection >= 2) {
    return true
  }

  return dotIndex === currentSection
}


function startInterval() {
  if (props.images.length <= 1) return

  console.log('Iniciando rotación de imágenes, intervalo:', props.interval / 1000, 'segundos')

  intervalTimer = setInterval(() => {
    nextSlide()
  }, props.interval)
}

function stopInterval() {
  if (intervalTimer) {
    clearInterval(intervalTimer)
    intervalTimer = null
  }
}

function resetInterval() {
  stopInterval()
  startInterval()
}

// Exponer métodos para control externo
defineExpose({
  next: nextSlide,
  prev: prevSlide,
  goTo: goToSlide,
  reset: () => {
    currentImageIndex.value = 0
    resetInterval()
  }
})

onMounted(() => {
  console.log('ImageCarousel montado con', props.images.length, 'imágenes')
  if (props.images.length > 0) {
    console.log('Primera imagen:', currentImage.value?.name)
    startInterval()
  }
})

// Reiniciar si cambian las imágenes
watch(() => props.images, (newImages) => {
  console.log('Lista de imágenes actualizada:', newImages.length, 'imágenes')
  currentImageIndex.value = 0
  resetInterval()
}, { deep: true })

onBeforeUnmount(() => {
  console.log('ImageCarousel desmontándose')
  stopInterval()
})
</script>

<style scoped>
.image-carousel-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-slide {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
}

.carousel-image {
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

/* Indicadores */
.carousel-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 10;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 25px;
  backdrop-filter: blur(8px);
  justify-content: center;
  align-items: center;
  margin-left: 10px;
}

.carousel-indicators button {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.3);
  cursor: default;
  transition: all 0.4s ease;
  padding: 0;
  pointer-events: none;
}

.carousel-indicators button.active {
  background: #C41E3A;
  border-color: #C41E3A;
  box-shadow: 0 0 12px rgba(196, 30, 58, 0.6);
  transform: scale(1.3);
}

/* Transición Fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s ease;
}

.fade-enter-from {
  opacity: 0;
}

.fade-leave-to {
  opacity: 0;
}

/* Transición Slide */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.6s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

/* Transición Zoom */
.zoom-enter-active,
.zoom-leave-active {
  transition: all 0.6s ease;
}

.zoom-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.zoom-leave-to {
  opacity: 0;
  transform: scale(1.2);
}

/* Responsive */
@media (max-width: 768px) {
  .carousel-indicators {
    bottom: 15px;
    padding: 8px 16px;
    gap: 10px;
  }

  .carousel-indicators button {
    width: 12px;
    height: 12px;
  }
}
</style>
