<template>
  <AppNavbar v-if="!isKioskRoute" />
  <router-view />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'

const route = useRoute()

// Ocultar navbar en la ruta de kiosco
const isKioskRoute = computed(() => route.path === '/kiosk')
</script>
