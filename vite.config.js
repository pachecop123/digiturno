import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000, // Frontend en puerto 3000
    host: true, // permite acceso desde la red local
    strictPort: true, // Forzar el puerto 3000
  }
})
