# Informe de cambios

## Cambios desde el 25 de febrero (tarde)

### Mapa y sección Ubicación

- **Pin fusionado con botón de galería:** El ícono de galería se integró directamente en el pin del mapa. El pin rojo actúa como botón de galería cuando el lugar tiene fotos; el ícono blanco se muestra centrado sobre el círculo. Se eliminó la lógica de posicionamiento heurístico.
- **Radio del pin:** Aumentado de 20 a 30 píxeles para mejorar visibilidad y usabilidad.
- **Ayuda del mapa:** Texto de ayuda con íconos (flechas, edificio, galería, ubicación, puntero) en formato dl/dt/dd; texto más corto.
- **Mapa en móvil:** Texto no desplazable, fondo distintivo para la ayuda, mapa siempre visible.
- **Texto de ayuda:** Indicaciones de clic para seleccionar zona y clic fuera para volver.
- **Estado inicial del mapa:** Zonas con etiquetas en estado home, clic para reiniciar, etiqueta focal, ajustes móviles.
- **Zona Peatonales:** Fusión de Irigoyen y Absalón Rojas en una sola zona Peatonales; descripciones unificadas y fotos de la propuesta.
- **Galería:** Restauración del ícono de galería en el pin de la zona seleccionada; botón deshabilitado cuando el lugar no tiene fotos.

### Imágenes y carruseles

- **Migración de imágenes:** Todas las imágenes pasaron de `src/lib/assets` a `static` (places, carrousel-hero, carrousel-interior, exteriores). Eliminados PLACE_PHOTOS_MAP y el índice de assets/places; uso de `/places/{id}/{file}`.
- **Hero:** Reemplazo de dos imágenes del carrusel; nueva 5.ª imagen (7-db-interior-01-5.jpg); nueva 4.ª imagen (6-db-exterior-01-5.jpg).
- **Interior:** Eliminadas refs 5/6/7-db-exterior; añadidas seis imágenes IMG-20250124-WA*.jpg.
- **Script:** Añadido `import-lugares-nuevos.js` y propuesta `lugares-nuevos.md`.

### Sección Equipamiento

- **Simplificación:** Eliminación de headers/tabs; columnas apiladas verticalmente; listas de ítems en dos columnas.
- **Estilos:** Eliminación de bordes naranjas; uso del componente Title; estilos de texto alineados con Interior.
- **Contenido:** Intro de terminaciones movida desde Interior; Ficha Técnica sobre el botón.
- **Regla temática:** Línea entre lista y párrafo con estilos del tema.
- **Móvil:** Ocultar panel no seleccionado vía CSS; breakpoint subido a 1080px; corrección de cascada CSS para ocultar header por panel.

### Características del edificio (BuildingFeatures)

- **Refactor:** Lista con íconos; nuevos componentes de íconos para BuildingFeatures.
- **Tema oscuro:** Corrección de --color-contrast-low, bf-cta, bf-frame.
- **Contenido:** Intro de Si buscas, CTA y ubicación actualizados.

### Componentes UI

- **Title:** Eliminado subrayado.
- **Highlight:** Nuevo componente; uso en Location, BuildingFeatures, Equipment.
- **IconTextRow:** Nuevo componente; refactor de BuildingFeatures y Equipment.

### Intro

- **KPI:** Eliminado el KPI de superficie.

### Otros

- **FloorPlans:** Eliminación de código superfluo.
- **Imports:** Eliminado @sveltejs/enhanced-img; uso de imports de imagen planos de Vite.
- **Íconos Harmony/Luxury:** Añadidos role y aria-label para accesibilidad.
- **Orden de secciones:** Equipment antes de FloorPlans y BuildingFeatures.
