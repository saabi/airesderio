# Informe de cambios

## 2025-02-26 — Pin y botón de galería fusionados en el mapa

### Cambios realizados

**Mapa (Map.svelte):**
- El ícono de galería se fusionó directamente con el pin del mapa.
- El pin rojo actúa como botón de galería cuando el lugar tiene fotos.
- El ícono de galería (blanco) se muestra centrado sobre el círculo del pin.
- Se eliminó toda la lógica de posicionamiento heurístico del ícono de galería (iconOffset, iconDx, arrowPosition).
- El pin permanece rojo; el ícono de galería es blanco sobre el círculo del pin.

**Ubicación (Location.svelte):**
- Se aumentó el radio del pin de 20 a 30 píxeles para mejorar la visibilidad y usabilidad del botón fusionado.
