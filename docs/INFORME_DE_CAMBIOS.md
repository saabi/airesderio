# Informe de cambios

## Cambios desde el 4 de marzo

### Backend: SMTP, Base de datos y gestión de leads

- **Reemplazo de Resend por SMTP:** Se reemplazó el servicio Resend por envío directo vía SMTP (DreamHost) usando Nodemailer. Configuración con soporte para puerto 465 (SSL) y 587 (STARTTLS).
- **Base de datos PostgreSQL:** Integración con PostgreSQL usando Drizzle ORM. Esquema con tablas `leads` y `pdf_access_tokens`. Docker Compose para desarrollo local; soporte para servidor de producción en Linode.
- **Separación nombre/apellido:** Los campos de nombre se separaron en `first_name` y `last_name` tanto en la base de datos como en los formularios. Migración incluida.
- **Validación de email estricta:** El regex de validación de email se reemplazó por un patrón basado en RFC 5322 que valida caracteres permitidos, formato de dominio y requiere al menos un punto en el dominio.
- **Scripts de diagnóstico:** Scripts `test-smtp.js` (con opciones `--debug`, `--587`, `--465`) y `test-db.js` para verificar conexión SMTP y PostgreSQL respectivamente.

### Gatekeeping de PDFs y emails a leads

- **Tokens de acceso:** Al solicitar un PDF, se genera un token de un solo uso (24h) almacenado en `pdf_access_tokens`. El PDF no se descarga inmediatamente; se envía un email con el enlace de descarga.
- **Emails a leads:** Los interesados en PDFs reciben un email con enlace de descarga estilizado. Los que solicitan contacto directo reciben un email de agradecimiento. Ambos con template HTML branded (Aires de Río).
- **Verificación de email:** La descarga exitosa del PDF marca el email como verificado en la base de datos.

### Formularios

- **Formulario popup (PdfRequestModal):** Nuevo componente modal para solicitar PDFs. Fondo con blur (backdrop-filter), contenido opaco. Campos: nombre, apellido, correo, teléfono (WhatsApp), mensaje.
- **PhoneNumberInput configurable:** Nuevos props `label` (por defecto "Número de teléfono") y `showHint` (off por defecto) para personalizar el componente.
- **Botones PDF:** Todos los botones de solicitud de PDF ahora comienzan con "SOLICITAR" (SOLICITAR FICHA TÉCNICA, SOLICITAR PLANOS).
- **Formulario de contacto:** Campos nombre y apellido en fila, campo teléfono con label "Contacto de WhatsApp".

### Área de administración

- **Autenticación:** Login por email (whitelist en .env) y contraseña compartida. Sesiones con cookies firmadas (HMAC-SHA256).
- **Lista de contactos:** Ruta `/admin/contactos` con tabla de leads (fecha, nombre, apellido, correo, teléfono, intención, verificación, mensaje).
- **Header con controles admin:** Cuando un admin está logueado, el header muestra enlaces a "Contactos" y botón de "Salir".

### Planos

- **Escala uniforme:** Las tres imágenes de planos se normalizaron a un canvas común de 2016×2112px para que todas compartan la misma escala métrica.
- **Recorte SVG (clipPath):** Se implementó recorte por SVG `<clipPath>` usando los perfiles de `perfiles.svg`. Los JPG mantienen fondo blanco pero se recortan visualmente, evitando el peso de PNG con alpha.
- **Títulos actualizados:** "1 hab con balcón ● Frente", "1 hab ● Contrafrente", "2 hab + estudio".

### Dominio y activos

- **Dominio final:** `airesderio.com` configurado como dominio principal (tras cambio previo a habitat-prime.com.ar).
- **PWA y social:** Manifiesto `site.webmanifest`, favicon e iconos (192px, 512px) con el isotipo de Aires de Río, imagen OG (1200×630).
- **SVG del logotipo:** Archivos `airesderio-isotype.svg` y `airesderio-logotype.svg` en `/static`.
- **Logo configurable:** Props `showDepartamentos`, `showIsotype`, `fitViewBox` en AiresDeRioLogo para variantes inline y sin subtítulo.

### Imágenes y carruseles

- **Interiores:** Nuevas imágenes de renders (lobby, cocina, habitación, baño, lavadero). Eliminación de fotos provisorias.
- **Viewport vertical:** Hook `verticalViewport` para cargar imágenes alternativas en pantallas verticales (Hero, Interior, FloorPlans).
- **Exterior:** Imagen exterior_03 optimizada.

### Layout

- **Links absolutos:** Los enlaces del header y footer usan rutas absolutas (`/#proyecto`, `/#equipados`, etc.) para funcionar correctamente desde cualquier página.
- **Orden de secciones:** BuildingFeatures se movió antes de Interior.
- **ContactSection:** Fix de grid con `grid-template-columns: max-content`.

---

*Próximo informe: continuar desde `06e327f`*


---
---

## Cambios desde el 25 de febrero (tarde) hasta el 4 de marzo

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
