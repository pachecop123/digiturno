<template>
  <nav class="navbar navbar-expand-lg app-navbar sticky-top" :class="{ elevated: scrolled }">
    <div class="container-xl">
      <!-- Brand -->
      <RouterLink class="navbar-brand brand d-flex align-items-center gap-2" to="/">
        <img src="/logo.png" alt="Diego Éxito" class="brand-logo">
        <span class="brand-text">DIEGO EXITO</span>
      </RouterLink>

      <!-- Toggler -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#mainNavbar"
        aria-controls="mainNavbar"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <i class="bi bi-list fs-3"></i>
      </button>

      <!-- Links -->
      <div class="collapse navbar-collapse" id="mainNavbar">
        <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-2">
          <li class="nav-item">
            <RouterLink
              class="nav-link nav-pill"
              :class="{ active: isActive('/kiosk') }"
              to="/kiosk"
            >
              <i class="bi bi-person-plus me-1"></i> Kiosco
            </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink
              class="nav-link nav-pill"
              :class="{ active: isActive('/display') }"
              to="/display"
            >
              <i class="bi bi-display me-1"></i> Pantalla
            </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink
              class="nav-link nav-pill"
              :class="{ active: isActive('/admin') }"
              to="/admin"
            >
              <i class="bi bi-shield-lock me-1"></i> Admin
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { RouterLink, useRoute } from 'vue-router'
import { ref, onMounted, onBeforeUnmount } from 'vue'

const route = useRoute()

// Activo (soporta subrutas)
const isActive = (path) => route.path === path || route.path.startsWith(path + '/')

// Elevación al hacer scroll
const scrolled = ref(false)
const onScroll = () => { scrolled.value = window.scrollY > 4 }
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

// Tema simple
const isDark = ref(false)
onMounted(() => {
  isDark.value = document.body.classList.contains('theme-dark')
})
function toggleTheme() {
  isDark.value = !isDark.value
  document.body.classList.toggle('theme-dark', isDark.value)
}
</script>

<style scoped>
/* ========= Paleta local (alineada al display Diego Éxito) ========= */
.app-navbar {
  --accent-1: #C41E3A;   /* rojo */
  --accent-2: #1E40AF;   /* azul */
  --nav-bg: rgba(255,255,255,.72);
  --nav-border: rgba(0,0,0,.06);
  --nav-text: #1f2937;

  color: var(--nav-text);
  backdrop-filter: blur(10px);
  background: var(--nav-bg);
  border-bottom: 1px solid var(--nav-border);
  transition: background .2s ease, box-shadow .2s ease, border-color .2s ease;
  z-index: 1030;
}
.app-navbar.elevated {
  background: rgba(255,255,255,.86);
  box-shadow: 0 10px 25px rgba(16,24,40,.08);
}

/* Si estamos dentro de la vista display “Diego Éxito”, dale un toque más vítreo */
:global(.display-diegoexito) .app-navbar {
  --nav-bg: rgba(255,255,255,.14);
  --nav-border: rgba(255,255,255,.2);
  color: #f8fafc;
}
:global(.display-diegoexito) .app-navbar.elevated {
  background: rgba(255,255,255,.2);
  box-shadow: 0 12px 28px rgba(0,0,0,.18);
}

/* Modo oscuro global */
:global(.theme-dark) .app-navbar {
  --nav-bg: rgba(22,22,22,.65);
  --nav-border: rgba(255,255,255,.08);
  --nav-text: #e5e7eb;
}

/* ========= Brand ========= */
.brand-text { font-weight: 800; letter-spacing: .2px; }
.brand-logo {
  height: 40px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,.15));
  transition: transform 0.2s ease;
}
.brand:hover .brand-logo {
  transform: scale(1.05);
}
.brand-mark {
  width: 28px; height: 28px; border-radius: 10px;
  display: grid; place-items: center;
  color: #fff;
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  box-shadow: 0 6px 14px rgba(30,64,175,.28), 0 4px 12px rgba(196,30,58,.22);
}

/* ========= Links ========= */
.nav-link {
  padding: .55rem .85rem;
  border-radius: .65rem;
  transition: color .15s ease, background-color .15s ease, box-shadow .15s ease;
}
.nav-link:hover {
  color: var(--accent-2);
  background: rgba(30,64,175,.08);
}
:global(.theme-dark) .nav-link:hover {
  background: rgba(255,255,255,.08);
}

/* pastilla activa con gradiente */
.nav-pill.active {
  color: #fff !important;
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  box-shadow: 0 10px 20px rgba(30,64,175,.22);
}

/* ========= Toggle tema ========= */
.theme-btn { border-radius: .65rem; }

/* === Legibilidad del link activo (texto + iconos) === */
.app-navbar .navbar-nav .nav-link.nav-pill.active {
  /* gradiente oscuro y consistente */
  background: linear-gradient(135deg, var(--accent-1) 0%, var(--accent-2) 100%) !important;
  color: #fff !important;
  font-weight: 800;
  /* bordes suaves y mejor contraste del texto */
  text-shadow: 0 1px 0 rgba(0,0,0,.35);
  -webkit-text-stroke: .25px rgba(0,0,0,.25); /* mejora legibilidad sobre fondos vivos */
}
.app-navbar .navbar-nav .nav-link.nav-pill.active .bi {
  color: #fff !important;
}

/* Estado hover/focus del activo (no perder legibilidad) */
.app-navbar .navbar-nav .nav-link.nav-pill.active:hover,
.app-navbar .navbar-nav .nav-link.nav-pill.active:focus {
  filter: brightness(.98) saturate(1.05);
  color: #fff !important;
}

/* Opcional: forzar color de los no activos para que no “desaparezcan” en fondos claros */
.app-navbar .navbar-nav .nav-link.nav-pill {
  color: var(--nav-text);
}
:global(.theme-dark) .app-navbar .navbar-nav .nav-link.nav-pill {
  color: #e5e7eb;
}

/* Si estás en la vista Display Diego Éxito, el fondo es más vivo → mantenemos texto claro */
:global(.display-diegoexito) .app-navbar .navbar-nav .nav-link.nav-pill {
  color: #f8fafc;
}
:global(.display-diegoexito) .app-navbar .navbar-nav .nav-link.nav-pill.active {
  /* mismo gradiente, pero con un leve sombreado extra para separar del fondo */
  box-shadow: 0 0 0 1px rgba(255,255,255,.15) inset, 0 8px 18px rgba(0,0,0,.22);
}
</style>
