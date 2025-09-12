<template>
<div class="vh-100 d-flex flex-column bg-dark text-white">
<div class="flex-fill d-flex align-items-center justify-content-center">
<div class="text-center">
<div class="display-number">{{ current || '—' }}</div>
<div class="lead">TURNO</div>
</div>
</div>


<div class="p-2 bg-white text-dark">
<!-- Carrusel de Bootstrap: coloca imágenes en public/ads/ad1.jpg ... ad3.jpg -->
<div id="adsCarousel" class="carousel slide" data-bs-ride="carousel">
<div class="carousel-inner">
<div class="carousel-item active">
<img src="/ads/ad1.jpg" class="d-block w-100" alt="ad1" />
</div>
<div class="carousel-item">
<img src="/ads/ad2.jpg" class="d-block w-100" alt="ad2" />
</div>
<div class="carousel-item">
<img src="/ads/ad3.jpg" class="d-block w-100" alt="ad3" />
</div>
</div>
</div>
</div>
</div>
</template>


<script setup>
import { computed } from 'vue'
import store from '../store'


const current = computed(() => store.state.current)
</script>


<style scoped>
.display-number {
font-size: 8rem;
font-weight: 800;
}
</style>