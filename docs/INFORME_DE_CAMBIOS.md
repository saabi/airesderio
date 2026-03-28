# Informe de cambios

*Actualizado: 28 de marzo de 2026.*

## Cambios del 4 al 28 de marzo de 2026

### Copy y ubicación (propuesta 18 de marzo)

- **Texto de la sección Ubicación:** Alineado con la propuesta del 18 de marzo (Rivadavia, Puente Nuevo, terminal, fórum, Roca, Parque Aguirre, Plaza Vea, párrafo de “punto estratégico”).
- **Mapa:** Eliminados los pins de Estadio Único, Avenida Rivadavia, Avenida Alvear y Registro Civil del dataset de lugares.
- **Radio visible del mapa:** `defaultRadius` en `map.json` subido a **0,33** y `zoomMargin` **0,11** en `Location.svelte` para mostrar ~10 % más de contexto alrededor de la zona activa (complementa el acercamiento sin habilitar aún pan/zoom libre).
- **Galerías en `map.json`:** Curación parcial según criterios de la reunión (p. ej. terminal, parque Aguirre, peatonales, mercado, casa de gobierno); **Plaza Libertad** con nombre y textos acordes (título “Plaza Libertad”, no genérico).
- **Equipamiento e interiores:** Bloque **Harmony** sin subtítulo “Harmony Style”; títulos **EQUIPAMIENTO** / **e interiores** y lista de bullets según copy aprobado; **Luxury** como “Equipamiento opcional” / “Luxury Style” y párrafo introductorio largo; íconos alineados a la **primera línea** del texto (`IconTextRow`).
- **Galería modal:** La galería muestra fotos y contador; no se muestran bloques largos de descripción en el modal (los campos `description`/`details` siguen en JSON por si se reutilizan).

### Formularios, email y cola de reintentos (propuesta `mas-cambios` §5)

- **Feedback fijo:** Store global de toasts (`formToast`) y componente `FormToast` en el layout; formulario de contacto y modal de PDF muestran éxito/error sin mensaje que desaparezca al instante; éxito en PDF cierra el modal y dispara toast.
- **Plantillas de email:** Eliminada la línea del PDF sobre validez 24 h / un solo uso; firma unificada: *Aires de Río - Departamentos de uno y dos habitaciones en Santiago del Estero*.
- **Reintentos SMTP:** Tabla `email_outbound_jobs`, encolado en fallo de envío tras persistir el lead (respuesta **200** al usuario), endpoint interno `POST /api/internal/retry-email-queue` protegido con `Authorization: Bearer` + `CRON_SECRET`; documentación en `fe/README.md` y `fe/.env.example`.

### Base de datos

- Migraciones Drizzle para jobs de email; cadena de migraciones y meta actualizadas (incl. variante idempotente **0004** coherente con el snapshot de Drizzle).

---

## Pendientes frente a las propuestas (marzo 2026)

Referencias: [Cambios de copy sitio web - 18_Marzo.md](proposals/Cambios%20de%20copy%20sitio%20web%20-%2018_Marzo.md), [mas-cambios.md](proposals/mas-cambios.md) (reunión 17 mar 2026).

### Brechas respecto al copy del **18 de marzo**

| Tema | Estado |
|------|--------|
| Navegación **“Equipamiento e Interiores”** (header/footer en lugar de solo “Equipamiento”) | Pendiente |
| Misma nomenclatura **“Planos y Distribución”** vs actual **“Planos”** | Pendiente (también en §3 de mas-cambios) |
| Header usa **“Interior”**; footer **“Interiores”** — unificar si se busca consistencia total con la propuesta | Revisión menor |
| Título de sección: copy propone **“E INTERIORES”**; implementado **“e interiores”** en `Title` | Detalle de mayúsculas |
| Galería: sigue mostrando el **nombre del lugar** en el encabezado del modal (coherente con UX; si se quisiera solo fotos sin título, habría que acotarlo explícitamente) | Opcional |

### Pendientes principales de **mas-cambios.md** (aún no cubiertos o solo parcialmente)

- **§1 Imágenes y video:** compresión/lazy load, caché, objetivo de carga en móvil bajo 3 s; estrategia de video (foto estática 3 s antes del autoplay, etc.).
- **§2 Modo oscuro:** artefactos visuales, menú y contraste; revisión de paleta (cian como acento, etc.).
- **§3 Navegación:** enlaces footer/header alineados a títulos de sección (incl. “Equipamiento e Interiores”, “Planos y Distribución”).
- **§4 Mapa:** **pan y zoom** libres (arrastre, rueda / gestos); algoritmo de **etiquetas siempre arriba del pin** (salvo excepción Aires de Río); **ícono de galería pequeño** dentro de la caja de etiqueta (hoy la galería va por pin/botones de navegación).
- **§5 Formularios:** texto explícito tipo “Revisa tu correo…” en toast (si se exige literal de la propuesta); **cron en producción** que llame al endpoint de reintentos con `CRON_SECRET`; intervalo de reintento documentado vs “cada 5 minutos” de la reunión.
- **§6 Scroll y responsive:** scroll suave a anclas sin saltos bruscos; más ancho útil en móvil; formulario que no desplace el centrado ni genere scroll horizontal; **umbrales de animación al scroll** más tempranos.
- **§7 Galerías por lugar:** curación pendiente o incompleta en varios puntos (Plaza Vea, Tribunales, Rivadavia, Bicentenario, Roca, etc.); reemplazos de calidad donde se pidió.
- **§8 Interiores:** texto puente sobre **dos diseños a elegir**; diferenciación visual Luxury (marca de agua triquetra); verificación foto por estilo; **§8.5:** en la reunión el párrafo largo de terminaciones debía ir **después** de “Equipamiento opcional” y “Looks Freestyle” y **antes** del botón de ficha — hoy el párrafo está **antes** de la lista Luxury y no hay bloque explícito “Looks Freestyle” en el sitio; conviene cerrar estructura vs. copy.
- **§9 Texto ubicación (mas-cambios):** redacción alternativa más larga sobre convenciones / Parque Aguirre / Puente / Plaza Vea — el sitio ya tiene el texto del 18 mar; conviene cruzar con §9 si se quiere unificar criterios.

### Operación

- Configurar **`CRON_SECRET`** y tarea programada en el servidor que ejecute el reintento de cola de emails.
- Ejecutar **`npm run db:migrate`** en cada entorno tras desplegar.

---

## Cambios hasta el 4 de marzo (informe anterior)

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

*Próximo informe: continuar desde `dc001b5`*


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
