<template>
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-12 col-xxl-10">
        <!-- Card principal -->
        <div class="card card-modern shadow-soft">
          <!-- Header -->
          <div class="card-header ads-manager-head d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div class="d-flex align-items-center gap-2">
              <div class="head-icon">
                <i class="bi bi-images"></i>
              </div>
              <div>
                <h1 class="h4 mb-0">Gestor de Publicidad</h1>
                <small class="text-white-50">Administra las imágenes y videos del display</small>
              </div>
            </div>

            <div class="d-flex align-items-center gap-2">
              <router-link to="/admin" class="btn btn-outline-light btn-sm">
                <i class="bi bi-arrow-left me-1"></i> Volver a Admin
              </router-link>
              <label class="btn btn-success btn-sm mb-0">
                <i class="bi bi-upload me-1"></i> Cargar nueva
                <input type="file" ref="fileInput" @change="uploadAd" accept="image/*,video/*" style="display: none;">
              </label>
            </div>
          </div>

          <!-- Body -->
          <div class="card-body">
            <!-- Estadísticas -->
            <div class="row g-3 mb-4">
              <div class="col-md-4">
                <div class="stat-card">
                  <div class="stat-icon bg-primary-subtle text-primary">
                    <i class="bi bi-collection"></i>
                  </div>
                  <div>
                    <div class="stat-label">Total de archivos</div>
                    <div class="stat-value">{{ ads.length }}</div>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="stat-card">
                  <div class="stat-icon bg-success-subtle text-success">
                    <i class="bi bi-image"></i>
                  </div>
                  <div>
                    <div class="stat-label">Imágenes</div>
                    <div class="stat-value">{{ imageCount }}</div>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="stat-card">
                  <div class="stat-icon bg-info-subtle text-info">
                    <i class="bi bi-play-circle"></i>
                  </div>
                  <div>
                    <div class="stat-label">Videos</div>
                    <div class="stat-value">{{ videoCount }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Grid de publicidades -->
            <div v-if="loadingAds" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="mt-3 text-muted">Cargando publicidades...</p>
            </div>

            <div v-else-if="ads.length === 0" class="text-center py-5">
              <i class="bi bi-folder-x fs-1 text-muted d-block mb-3"></i>
              <h5 class="text-muted">No hay publicidades cargadas</h5>
              <p class="text-muted small">Haz clic en "Cargar nueva" para agregar tu primera publicidad</p>
            </div>

            <div v-else class="ads-grid-manager">
              <div v-for="ad in ads" :key="ad.name" class="ad-card-manager">
                <div class="ad-preview-manager">
                  <img v-if="ad.type === 'image'" :src="ad.path" :alt="ad.name" class="ad-thumbnail-manager" loading="lazy">
                  <video v-else-if="ad.type === 'video'" :src="ad.path" class="ad-thumbnail-manager" preload="metadata"></video>

                  <!-- Badges -->
                  <div class="ad-badges">
                    <div class="ad-type-badge-manager" :class="ad.type === 'image' ? 'bg-success' : 'bg-info'">
                      <i :class="ad.type === 'image' ? 'bi bi-image' : 'bi bi-play-circle'"></i>
                      <span class="ms-1">{{ ad.type === 'image' ? 'Imagen' : 'Video' }}</span>
                    </div>
                    <div v-if="isProtectedFile(ad.name)" class="ad-protected-badge-manager">
                      <i class="bi bi-shield-fill me-1"></i>
                      <span>Protegido</span>
                    </div>
                  </div>

                  <!-- Overlay con acciones -->
                  <div class="ad-overlay-manager">
                    <button @click="viewAd(ad)" class="btn btn-light btn-sm">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button @click="deleteAd(ad.name)"
                            class="btn btn-sm"
                            :class="isProtectedFile(ad.name) ? 'btn-secondary' : 'btn-danger'">
                      <i :class="isProtectedFile(ad.name) ? 'bi bi-shield-lock' : 'bi bi-trash'"></i>
                    </button>
                  </div>
                </div>

                <div class="ad-info-manager">
                  <div class="ad-name-manager" :title="ad.name">
                    <i class="bi bi-file-earmark me-1"></i>
                    {{ ad.name }}
                  </div>
                  <div class="ad-size-manager text-muted small">
                    {{ formatFileSize(ad.name) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer con información -->
          <div class="card-footer">
            <div class="d-flex flex-wrap gap-3 align-items-center justify-content-between">
              <div class="text-muted small">
                <i class="bi bi-info-circle me-1"></i>
                Acepta todos los formatos de imagen y video (máx. 1GB)
              </div>
              <div class="text-muted small">
                <i class="bi bi-shield-fill me-1"></i>
                Los archivos con escudo están protegidos del sistema
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para vista previa -->
    <div v-if="previewAd" class="modal-preview" @click="closePreview">
      <div class="modal-preview-content" @click.stop>
        <button class="btn-close-preview" @click="closePreview">
          <i class="bi bi-x-lg"></i>
        </button>
        <div class="modal-preview-body">
          <img v-if="previewAd.type === 'image'" :src="previewAd.path" :alt="previewAd.name" class="preview-media">
          <video v-else :src="previewAd.path" class="preview-media" controls autoplay loop></video>
        </div>
        <div class="modal-preview-footer">
          <h5>{{ previewAd.name }}</h5>
          <span class="badge" :class="previewAd.type === 'image' ? 'bg-success' : 'bg-info'">
            {{ previewAd.type === 'image' ? 'Imagen' : 'Video' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'

const ads = ref([])
const loadingAds = ref(false)
const fileInput = ref(null)
const previewAd = ref(null)

const imageCount = computed(() => ads.value.filter(ad => ad.type === 'image').length)
const videoCount = computed(() => ads.value.filter(ad => ad.type === 'video').length)

function isProtectedFile(filename) {
  const protectedFiles = ['logo.png', 'ad1.jpg', 'ad2.jpg', 'ad3.jpg', 'video1.mp4']
  return protectedFiles.includes(filename)
}

function formatFileSize(filename) {
  // Placeholder - podrías implementar tamaño real si lo expones desde el servidor
  return 'Archivo'
}

async function loadAds() {
  loadingAds.value = true
  try {
    const response = await fetch('/api/ads')
    const data = await response.json()
    ads.value = data
  } catch (error) {
    console.error('Error cargando publicidades:', error)
    Swal.fire('Error', 'No se pudieron cargar las publicidades', 'error')
  } finally {
    loadingAds.value = false
  }
}

async function uploadAd(event) {
  const file = event.target.files?.[0]
  if (!file) return

  // Validar tamaño
  const maxSize = 1024 * 1024 * 1024 // 1GB
  if (file.size > maxSize) {
    Swal.fire('Archivo muy grande', 'El archivo no debe superar 1GB', 'warning')
    if (fileInput.value) fileInput.value.value = ''
    return
  }

  const formData = new FormData()
  formData.append('ad', file)

  try {
    Swal.fire({
      title: 'Subiendo...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })

    const response = await fetch('/api/ads/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) throw new Error('Error en la carga')

    Swal.fire({
      title: '¡Éxito!',
      text: 'Publicidad cargada correctamente',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    })

    loadAds()
    if (fileInput.value) fileInput.value.value = ''
  } catch (error) {
    console.error('Error subiendo publicidad:', error)
    Swal.fire('Error', 'No se pudo cargar la publicidad', 'error')
  }
}

async function deleteAd(filename) {
  if (isProtectedFile(filename)) {
    const isLogo = filename === 'logo.png'
    Swal.fire({
      title: isLogo ? 'Logo protegido' : 'Archivo protegido',
      html: isLogo
        ? '<p>El logo no puede ser eliminado.</p><p class="text-muted small">Es parte del branding del sistema.</p>'
        : `<p><strong>${filename}</strong> es un archivo de ejemplo del sistema.</p>
           <p class="text-muted small">Los archivos de ejemplo están protegidos para garantizar contenido base.</p>
           <p class="text-info small mt-2"><i class="bi bi-info-circle"></i> Puedes subir y eliminar tus propios archivos.</p>`,
      icon: 'info',
      confirmButtonText: 'Entendido'
    })
    return
  }

  const result = await Swal.fire({
    title: '¿Eliminar publicidad?',
    html: `<p>Se eliminará <strong>${filename}</strong></p><p class="text-muted small">Esta acción no se puede deshacer.</p>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    confirmButtonColor: '#dc3545',
    cancelButtonText: 'Cancelar'
  })

  if (!result.isConfirmed) return

  try {
    const response = await fetch(`/api/ads/${filename}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error al eliminar')
    }

    Swal.fire({
      title: 'Eliminado',
      text: 'Publicidad eliminada correctamente',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    })
    loadAds()
  } catch (error) {
    console.error('Error eliminando publicidad:', error)
    Swal.fire({
      title: 'Error',
      text: error.message || 'No se pudo eliminar la publicidad',
      icon: 'error'
    })
  }
}

function viewAd(ad) {
  previewAd.value = ad
}

function closePreview() {
  previewAd.value = null
}

onMounted(() => {
  loadAds()
})
</script>

<style scoped>
/* Header */
.ads-manager-head {
  background: linear-gradient(135deg, #C41E3A 0%, #1E40AF 100%);
  color: #fff;
  border-radius: .8rem .8rem 0 0;
}

.head-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(255,255,255,.15);
  border: 1px solid rgba(255,255,255,.25);
}

/* Stats */
.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,.04);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 1.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  line-height: 1;
}

/* Grid de publicidades */
.ads-grid-manager {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.ad-card-manager {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.ad-card-manager:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  border-color: #C41E3A;
}

.ad-preview-manager {
  position: relative;
  aspect-ratio: 16/9;
  background: #f3f4f6;
  overflow: hidden;
}

.ad-thumbnail-manager {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.ad-card-manager:hover .ad-thumbnail-manager {
  transform: scale(1.05);
}

/* Badges */
.ad-badges {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  right: 0.75rem;
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  pointer-events: none;
}

.ad-type-badge-manager {
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.ad-protected-badge-manager {
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Overlay con acciones */
.ad-overlay-manager {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.ad-card-manager:hover .ad-overlay-manager {
  opacity: 1;
}

.ad-overlay-manager .btn {
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-size: 1.25rem;
}

/* Info */
.ad-info-manager {
  padding: 1rem;
  background: #fff;
}

.ad-name-manager {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 0.25rem;
}

.ad-size-manager {
  font-size: 0.75rem;
}

/* Modal Preview */
.modal-preview {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  animation: fadeIn 0.3s ease;
}

.modal-preview-content {
  max-width: 1200px;
  width: 100%;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: scaleIn 0.3s ease;
}

.btn-close-preview {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
}

.btn-close-preview:hover {
  background: #fff;
  transform: scale(1.1);
}

.modal-preview-body {
  position: relative;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  max-height: 70vh;
}

.preview-media {
  width: 100%;
  height: 100%;
  max-height: 70vh;
  object-fit: contain;
  display: block;
}

.modal-preview-footer {
  padding: 1.5rem;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-preview-footer h5 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Responsive */
@media (max-width: 768px) {
  .ads-grid-manager {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
}
</style>
