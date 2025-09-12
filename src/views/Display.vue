<template>
  <div class="display-diegoexito">
    <div class="container-xl py-4">
      <div class="display-grid-enhanced">
        <!-- Turno -->
        <section class="tile tile-turn-carniceria">
          <header class="tile-head-carniceria">
            <div class="icon-wrapper-carniceria">
              <i class="bi bi-person-lines-fill"></i>
            </div>
            <span class="section-title">Turno Actual - Carnicería</span>
          </header>

          <div class="tile-body-modern">
            <div class="turn-wrapper">
              <!-- 👇 Mostrar SIEMPRE "showing" -->
              <div class="turn-number-carniceria" :class="{ 'animate-number': popAnim }">
                {{ showing }}
              </div>
              <div class="turn-label-carniceria">CARNICERÍA</div>
            </div>
          </div>

          <footer class="tile-foot-carniceria">
            <span class="live-indicator-carniceria"></span>
            Siempre Contigo - Actualizado en tiempo real
          </footer>
        </section>

        <!-- Publicidad Diego Éxito -->
        <section class="tile tile-ads-diegoexito">
          <header class="tile-head-carniceria">
            <div class="icon-wrapper-carniceria">
              <i class="bi bi-megaphone-fill"></i>
            </div>
            <span class="section-title">Diego Éxito - Ofertas</span>
          </header>

          <div class="tile-body-ads">
            <div class="ads-stage-diegoexito">
              <div id="adsCarousel" class="carousel slide h-100" data-bs-ride="carousel" data-bs-interval="6000">
                <div class="carousel-inner h-100">
                  <div class="carousel-item h-100 active">
                    <div class="ads-item">
                      <div class="offer-slide">
                        <div class="logo-container">
                          <div class="logo-circle">
                            <div class="logo-content">
                              <div class="people-icon">👥</div>
                              <div class="cart-icon">🛒</div>
                            </div>
                          </div>
                        </div>
                        <h2 class="offer-title">¡CARNES FRESCAS!</h2>
                        <p class="offer-subtitle">La mejor calidad al mejor precio</p>
                        <div class="offer-badge">SIEMPRE CONTIGO</div>
                      </div>
                    </div>
                  </div>

                  <div class="carousel-item h-100">
                    <div class="ads-item">
                      <div class="offer-slide offer-special">
                        <h1 class="special-title">PROMOCIÓN</h1>
                        <h2 class="special-product">CARNE DE RES</h2>
                        <div class="price-display">
                          <span class="price-old">$25.000</span>
                          <span class="price-new">$20.000</span>
                        </div>
                        <p class="price-unit">Por kilogramo</p>
                        <div class="offer-badge">¡OFERTA LIMITADA!</div>
                      </div>
                    </div>
                  </div>

                  <div class="carousel-item h-100">
                    <div class="ads-item">
                      <div class="offer-slide offer-info">
                        <div class="info-icon">🥩</div>
                        <h2 class="info-title">CARNICERÍA DIEGO ÉXITO</h2>
                        <ul class="info-list">
                          <li>✓ Carnes frescas diarias</li>
                          <li>✓ Cortes especializados</li>
                          <li>✓ Atención personalizada</li>
                          <li>✓ Los mejores precios</li>
                        </ul>
                        <div class="offer-badge">CALIDAD GARANTIZADA</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Controles -->
                <button class="carousel-control-prev carousel-control-diegoexito" type="button" data-bs-target="#adsCarousel" data-bs-slide="prev">
                  <span class="carousel-control-prev-icon control-icon-diegoexito" aria-hidden="true"></span>
                  <span class="visually-hidden">Anterior</span>
                </button>
                <button class="carousel-control-next carousel-control-diegoexito" type="button" data-bs-target="#adsCarousel" data-bs-slide="next">
                  <span class="carousel-control-next-icon control-icon-diegoexito" aria-hidden="true"></span>
                  <span class="visually-hidden">Siguiente</span>
                </button>
              </div>
            </div>
          </div>

          <footer class="tile-foot-carniceria">
            Diego Éxito - Siempre Contigo
          </footer>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import store from '../store'

/* Derivados seguros del store */
const current      = computed(() => store.state?.current ?? null)
const lastAttended = computed(() => store.state?.lastAttended ?? null)
const prefix       = computed(() => store.state?.prefix || 'C')
const queue        = computed(() => Array.isArray(store.state?.queue) ? store.state.queue : [])

/* Número a mostrar (prioridad):
   1) en atención
   2) último atendido
   3) primero en cola
   4) prefijo-000 (fallback)
*/
const showing = computed(() =>
  current.value
  || lastAttended.value
  || queue.value[0]
  || `${prefix.value}-000`
)

/* Animación cuando cambia lo que se muestra */
const popAnim = ref(false)
watch(showing, (n, o) => {
  if (n !== o) {
    popAnim.value = true
    setTimeout(() => (popAnim.value = false), 600)
  }
})

/* (Opcional) Auto-avanzar si no hay current */
const AUTO_ADVANCE = false
onMounted(() => {
  if (AUTO_ADVANCE && !current.value && queue.value.length) {
    store.callNext?.()
  }
})
</script>

<style scoped>
/* =========================
   Paleta y sizing (scoped)
   ========================= */
.display-diegoexito {
  --diego-red: #C41E3A;
  --diego-red-dark: #A61729;
  --diego-red-light: #DC143C;
  --diego-blue: #1E40AF;
  --diego-blue-dark: #1D4ED8;
  --diego-white: #FFFFFF;
  --diego-cream: #FEF7ED;

  --panel-h: clamp(400px, 72dvh, 920px);
}

/* Fondo y base */
.display-diegoexito {
  background: radial-gradient(ellipse at top, var(--diego-red) 0%, var(--diego-red-dark) 35%, #8B0000 100%);
  background-attachment: fixed;
  min-height: 100dvh;
  color: var(--diego-white);
  position: relative;
}
.display-diegoexito::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(196, 30, 58, 0.08) 0%, rgba(30, 64, 175, 0.08) 100%);
  -webkit-backdrop-filter: blur(0.5px);
  backdrop-filter: blur(0.5px);
}
.container-xl { position: relative; z-index: 1; }

/* Grid */
.display-grid-enhanced {
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr;
  grid-auto-rows: minmax(var(--panel-h), auto);
}
@media (min-width: 768px) {
  .display-grid-enhanced {
    grid-template-columns: 1.35fr 1fr;
    align-items: stretch;
  }
}

/* Tarjeta base */
.tile {
  background: rgba(255, 255, 255, 0.96);
  border: 2px solid rgba(196, 30, 58, 0.28);
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(196, 30, 58, 0.28);
  display: flex;
  flex-direction: column;
  min-height: var(--panel-h);
  overflow: hidden;
  transition: transform .28s ease, box-shadow .28s ease;
  position: relative;
}
.tile::before {
  content: '';
  position: absolute; left: 0; right: 0; top: 0; height: 3px;
  background: linear-gradient(90deg, var(--diego-red) 0%, var(--diego-blue) 50%, var(--diego-red) 100%);
}
.tile:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 50px rgba(196, 30, 58, 0.35);
}

/* Headers */
.tile-head-carniceria {
  background: linear-gradient(135deg, var(--diego-red) 0%, var(--diego-red-dark) 100%);
  padding: 1.25rem 1.5rem;
  display: flex; align-items: center; gap: 1rem;
  position: relative;
}
.icon-wrapper-carniceria {
  background: var(--diego-white); color: var(--diego-red);
  padding: .7rem; border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, .18);
  display: grid; place-items: center;
}
.icon-wrapper-carniceria i { font-size: 1.25rem; }
.section-title {
  font-weight: 800; font-size: 1.05rem; color: var(--diego-white);
  text-shadow: 0 2px 4px rgba(0, 0, 0, .28); letter-spacing: .5px;
}

/* Turno */
.tile-body-modern {
  flex: 1; display: grid; place-items: center;
  padding: 1.75rem; background: var(--diego-white);
}
.turn-wrapper { text-align: center; position: relative; }
.turn-number-carniceria {
  font-family: 'Arial Black', Arial, sans-serif;
  font-weight: 900;
  font-size: clamp(3.6rem, 11vw, 8rem);
  line-height: 1; letter-spacing: .05em;
  color: var(--diego-red);
  text-shadow: 0 4px 20px rgba(196, 30, 58, 0.26);
  position: relative; margin-bottom: .5rem;
}
.turn-number-carniceria::after {
  content: ''; position: absolute; bottom: -14px; left: 50%; transform: translateX(-50%);
  width: 96px; height: 6px; border-radius: 3px;
  background: linear-gradient(135deg, var(--diego-blue) 0%, var(--diego-blue-dark) 100%);
  box-shadow: 0 2px 15px rgba(30, 64, 175, .42);
}
.turn-label-carniceria {
  margin-top: 2rem; font-size: 1rem; font-weight: 800;
  letter-spacing: .3em; text-transform: uppercase; color: var(--diego-blue);
  text-shadow: 0 2px 4px rgba(30, 64, 175, .18);
}

/* Footer */
.tile-foot-carniceria {
  background: linear-gradient(135deg, var(--diego-blue) 0%, var(--diego-blue-dark) 100%);
  padding: .9rem 1.5rem; text-align: center; color: var(--diego-white);
  font-size: .92rem; font-weight: 600; display: flex; gap: .5rem; align-items: center; justify-content: center;
}
.live-indicator-carniceria {
  width: 10px; height: 10px; border-radius: 50%; background: #10b981;
  animation: pulse 2s infinite; box-shadow: 0 0 15px rgba(16, 185, 129, .75);
}
@keyframes pulse { 0%,100%{opacity:1; transform:scale(1)} 50%{opacity:.65; transform:scale(1.2)} }

/* Publicidad */
.tile-body-ads { flex: 1; position: relative; }
.ads-stage-diegoexito { height: 100%; background: var(--diego-white); overflow: hidden; }
.carousel-inner, .carousel-item { height: 100%; }
.carousel-item > img,
.carousel-item > video,
.ads-media {
  width: 100%; height: 100%;
  object-fit: contain; background: #000; display: block;
}
.ads-item { height: 100%; display: grid; place-items: center; padding: 2rem; }
.offer-slide { text-align: center; width: 100%; color: var(--diego-red); }

/* Slides (colores, títulos...) */
.logo-container { margin-bottom: 2rem; }
.logo-circle {
  width: 120px; height: 120px; margin: 0 auto; border-radius: 50%;
  background: radial-gradient(circle, var(--diego-red) 0%, var(--diego-red-dark) 100%);
  display: grid; place-items: center; box-shadow: 0 8px 25px rgba(196,30,58,.35);
}
.logo-content { color: #fff; font-size: 2rem; display: grid; gap: .5rem; place-items: center; }

.offer-title { font-size: clamp(1.7rem, 4vw, 2.4rem); font-weight: 900; color: var(--diego-red); margin-bottom: 1rem; text-shadow: 0 2px 4px rgba(196,30,58,.18); }
.offer-subtitle { font-size: 1.1rem; color: var(--diego-blue); font-weight: 600; margin-bottom: 1.6rem; }
.offer-badge {
  background: linear-gradient(135deg, var(--diego-blue) 0%, var(--diego-blue-dark) 100%);
  color: #fff; padding: .65rem 1.3rem; border-radius: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em;
  display: inline-block; box-shadow: 0 4px 15px rgba(30,64,175,.28);
}

/* Promoción */
.offer-special { background: linear-gradient(135deg, var(--diego-red) 0%, var(--diego-red-dark) 100%); color: #fff; border-radius: 14px; padding: 2.6rem 1.8rem; }
.special-title { font-size: 1.9rem; font-weight: 900; margin-bottom: .8rem; text-transform: uppercase; letter-spacing: .1em; }
.special-product { font-size: 1.4rem; font-weight: 700; margin-bottom: 1.6rem; color: var(--diego-cream); }
.price-display { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-bottom: .8rem; }
.price-old { font-size: 1.1rem; text-decoration: line-through; color: rgba(255,255,255,.7); }
.price-new { font-size: 2.2rem; font-weight: 900; color: var(--diego-cream); text-shadow: 0 2px 4px rgba(0,0,0,.25); }
.price-unit { font-size: .95rem; color: rgba(255,255,255,.9); margin-bottom: 1.6rem; }

/* Info */
.offer-info { padding: 2rem; }
.info-icon { font-size: 3.6rem; margin-bottom: 1rem; }
.info-title { font-size: 1.7rem; font-weight: 800; color: var(--diego-red); margin-bottom: 1.6rem; text-transform: uppercase; }
.info-list { list-style: none; padding: 0; margin-bottom: 1.6rem; }
.info-list li { font-size: 1.05rem; color: var(--diego-blue); font-weight: 600; margin-bottom: .7rem; text-align: left; }

/* Controles carrusel */
.carousel-control-diegoexito { width: 60px; opacity: 0; transition: opacity .25s ease; }
.ads-stage-diegoexito:hover .carousel-control-diegoexito { opacity: .85; }
.carousel-control-diegoexito:hover { opacity: 1 !important; }
.control-icon-diegoexito { width: 40px; height: 40px; background: var(--diego-red) !important; border-radius: 50%;
  box-shadow: 0 4px 15px rgba(196,30,58,.35); transition: transform .2s ease, background .2s ease; }
.carousel-control-diegoexito:hover .control-icon-diegoexito { background: var(--diego-red-dark) !important; transform: scale(1.06); }

/* Animación del turno */
.animate-number { animation: popCarniceria .6s cubic-bezier(.68,-.55,.265,1.55); }
@keyframes popCarniceria { 0%{transform:scale(.85);opacity:.85} 50%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }

/* Responsive tweaks */
@media (max-width: 767px) {
  .display-grid-enhanced { gap: 1.25rem; }
  .tile { min-height: 360px; }
  .tile-body-modern { padding: 1.25rem; }
  .turn-number-carniceria { font-size: clamp(3rem, 14vw, 6.4rem); }
  .logo-circle { width: 86px; height: 86px; }
}

/* Accesibilidad / motion */
@media (prefers-reduced-motion: reduce) {
  .tile, .tile:hover, .animate-number, .carousel { animation: none !important; transition: none !important; }
}
</style>
