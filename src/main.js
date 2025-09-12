import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Estilos Bootstrap y SweetAlert2
import 'bootstrap/dist/css/bootstrap.min.css'
import 'sweetalert2/dist/sweetalert2.min.css'

// JS de Bootstrap (para modal, dropdown, etc.)
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

createApp(App).use(router).mount('#app')
