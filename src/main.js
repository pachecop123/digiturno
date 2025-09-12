import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// CSS de terceros
import 'bootstrap/dist/css/bootstrap.min.css'
import 'sweetalert2/dist/sweetalert2.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'

// Tu CSS global centralizado
import './assets/styles.css'

createApp(App).use(router).mount('#app')
