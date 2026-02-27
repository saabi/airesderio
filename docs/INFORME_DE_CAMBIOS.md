# Informe de cambios

## Cambios desde el 25 de febrero (tarde)

### Mapa y sección Ubicación

- **Galería:** Restauración del ícono de galería en el pin de la zona seleccionada; botón deshabilitado cuando el lugar no tiene fotos.
- **Pin fusionado con botón de galería:** El ícono de galería se integró directamente en el pin del mapa. El pin rojo actúa como botón de galería cuando el lugar tiene fotos; el ícono blanco se muestra centrado sobre el círculo. Se eliminó la lógica de posicionamiento heurístico.
- **Radio del pin:** Aumentado de 20 a 30 píxeles para mejorar visibilidad y usabilidad.
- **Ayuda del mapa:** Texto de ayuda con íconos (flechas, edificio, galería, ubicación, puntero) en formato dl/dt/dd; texto más corto.
- **Zona Peatonales:** Fusión de Irigoyen y Absalón Rojas en una sola zona Peatonales; descripciones unificadas y fotos de la propuesta.

### Sección Equipamiento

- **Simplificación:** Eliminación de headers/tabs y logos; columnas apiladas verticalmente; listas de ítems en dos columnas.
- **Estilos:** Eliminación de bordes naranjas; uso del componente Title; estilos de texto alineados con Interior.
- **Contenido:** Intro de terminaciones movida desde Interior; Ficha Técnica sobre el botón.
- **Regla temática:** Línea entre lista y párrafo con estilos del tema.

### Características del edificio (BuildingFeatures)

- **Tema oscuro:** Corrección de --color-contrast-low, bf-cta, bf-frame.
- **Contenido:** Intro de Si buscas, CTA y ubicación actualizados.

### Componentes UI

- **Title:** Eliminado subrayado.

### Intro

- **KPI:** Eliminado el KPI de superficie (2500 m2).

### Otros

- **Orden de secciones:** Equipment antes de FloorPlans y BuildingFeatures.

---

*Próximo informe: continuar desde `c1bc99c`*
