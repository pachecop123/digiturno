import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000, // <-- cambia el puerto aquí
    host: true, // permite acceso desde la red local (opcional)
  }
})
