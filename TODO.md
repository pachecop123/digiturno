# TODO: Corregir problema del carrusel de imágenes

## Problema identificado
- El carrusel se inicializa pero no avanza automáticamente
- Parece intentar avanzar pero se queda en la primera imagen
- Posible causa: conflicto entre `data-bs-ride="false"` en HTML y configuración JS

## Pasos a realizar
- [x] Revisar configuración del carrusel en Display.vue
- [x] Corregir inicialización del carrusel
- [ ] Probar funcionamiento del carrusel
- [ ] Verificar manejo de videos en el carrusel
- [ ] Realizar pruebas exhaustivas

## Archivos a modificar
- src/views/Display.vue

## Cambios realizados
- Cambié `data-bs-ride="false"` a `data-bs-ride="carousel"` para habilitar auto-play
- Aumenté el timeout de inicialización de 150ms a 500ms para asegurar que el DOM esté listo
- Simplifiqué la función `initCarousel()` para dejar que Bootstrap maneje el auto-play automáticamente
