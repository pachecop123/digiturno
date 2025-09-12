import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Kiosk from '../views/Kiosk.vue'
import Display from '../views/Display.vue'
import Admin from '../views/Admin.vue'
import Swal from 'sweetalert2'

const routes = [
  { path: '/', component: Home },
  { path: '/kiosk', component: Kiosk },
  { path: '/display', component: Display },
  { 
    path: '/admin', 
    component: Admin,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Guard global para clave
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    const pass = localStorage.getItem('admin_pass_ok')
    if (pass === 'true') {
      next()
      return
    }

    const { value: clave } = await Swal.fire({
      title: 'Acceso restringido',
      input: 'password',
      inputLabel: 'Ingrese la clave de administrador',
      inputPlaceholder: '••••••',
      showCancelButton: true,
      confirmButtonText: 'Entrar'
    })

    if (clave === '1234') { // 🔑 aquí defines la clave
      localStorage.setItem('admin_pass_ok', 'true')
      next()
    } else {
      Swal.fire('Acceso denegado', 'Clave incorrecta', 'error')
      next(false)
    }
  } else {
    next()
  }
})

export default router
