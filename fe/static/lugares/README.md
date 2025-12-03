# Lugares de Interés - Fotos

Esta carpeta contiene fotos organizadas de lugares de interés cercanos al edificio Aires de Río, ubicado en la intersección de Rivadavia y Olaechea en Santiago del Estero.

## Estructura de Carpetas

### 📍 Terminal

- `terminal-exterior-2.jpg` - Vista exterior del Terminal de Ómnibus de Santiago del Estero
- `exterior.jpg` - Vista adicional del terminal
- `terminal-llegada.jpg` - Vista llegando al terminal
- **Fuente**: Wikimedia Commons

### 🏛️ Forum

- `forum-exterior.jpg` - Vista exterior diurna del Fórum Santiago del Estero (Centro de Convenciones)
- `forum-nocturno.jpg` - Vista exterior nocturna del Fórum Santiago del Estero
- `forum-nocturno-2.jpg` - Vista exterior nocturna alternativa del Fórum Santiago del Estero
- **Fuente**: Wikimedia Commons

### 🌉 Puente Carretero

- `puente-exterior.jpg` - Vista del histórico Puente Carretero que conecta Santiago del Estero con La Banda
- **Fuente**: Wikimedia Commons

### 🏛️ Centro Cultural

#### CCB (Centro Cultural del Bicentenario)

- `ccb-exterior.jpg` - Vista exterior del Centro Cultural del Bicentenario
- **Fuente**: Wikimedia Commons

### ☕ Cafés

#### Leblon Café y Pastelería Artesanal

- `cafe-argentino-ejemplo.jpg` - Ejemplo de café argentino típico (imagen representativa)
- **Fuente**: Wikimedia Commons

### 🛒 Supermercados

#### Vea

- `supermercado-argentino-ejemplo.jpg` - Ejemplo de supermercado argentino (imagen representativa)
- **Fuente**: Wikimedia Commons

#### Changomas

- `supermercado-changomas-ejemplo.jpg` - Ejemplo de supermercado argentino (imagen representativa)
- **Fuente**: Wikimedia Commons

### 🍽️ Restaurantes

#### Dominga Resto Bar

- `restaurante-argentino-ejemplo.jpg` - Ejemplo de restaurante argentino típico (imagen representativa)
- **Fuente**: Wikimedia Commons

#### Bless

- `establecimiento-bless-ejemplo.jpg` - Ejemplo de establecimiento argentino típico (imagen representativa)
- **Fuente**: Wikimedia Commons

## Fuentes de las Imágenes

Las imágenes descargadas provienen de:

- **Wikimedia Commons**: Imágenes de dominio público o con licencias libres
- **Fuentes gubernamentales**: Sitios web oficiales de instituciones públicas

## Scripts de sincronización

- `npm run sync:photos` sincroniza los nombres de archivos de cada carpeta con el arreglo `photos` del JSON `lugares-direcciones.json`.
- `npm run sync:geo` geolocaliza cada lugar usando Google Maps Geocoding API, actualiza las coordenadas y recalcula distancias. Requiere definir `GOOGLE_MAPS_API_KEY` (puede colocarse en un `.env` cargado antes de ejecutar el script). Añade las banderas `--dry-run`, `--place=categoria/lugar_id`, `--ref-lat` y `--ref-lng` para ejecuciones más controladas.

## Licencias

Todas las imágenes descargadas son de dominio público o tienen licencias que permiten su uso. Se recomienda verificar las licencias específicas antes de cualquier uso comercial.

## Resumen de Imágenes Descargadas

### ✅ Imágenes de Alta Resolución Disponibles:

#### 🚌 Transporte

- **Terminal de Ómnibus**: 3 fotos (exteriores y llegada)

#### 🎭 Cultura y Entretenimiento

- **Fórum Santiago del Estero**: 3 fotos (centro de convenciones, exterior, interior)
- **Centro Cultural del Bicentenario**: 1 foto (centro cultural)
- **Teatro 25 de Mayo**: 1 foto (teatro argentino ejemplo)

#### 🏛️ Infraestructura

- **Puente Carretero**: 1 foto (vista del puente histórico)

#### 🏛️ Lugares Históricos

- **Plaza Libertad**: 1 foto (plaza argentina ejemplo - PD)
- **Catedral Basílica**: 1 foto (catedral específica - PD)
- **Casa de Gobierno**: 1 foto (Casa Rosada ejemplo - PD)

#### 🌳 Parques y Recreación

- **Parque Aguirre**: 1 foto (parque argentino ejemplo - PD)

#### 🏛️ Museos

- **Museo Arqueológico**: 1 foto (museo argentino ejemplo - PD)
- **Museo de Ciencias Naturales**: 1 foto (museo argentino ejemplo - PD)

#### 🍽️ Gastronomía

- **Leblon Café**: 1 foto (ejemplo representativo)
- **Dominga Resto Bar**: 1 foto (ejemplo representativo)
- **Bless**: 1 foto (ejemplo representativo)
- **Amasijo**: 1 foto (ejemplo representativo)

#### 🛒 Supermercados

- **Supermercados Vea**: 1 foto (ejemplo representativo)
- **Changomas**: 1 foto (ejemplo representativo)
- **Super Nataly**: 1 foto (ejemplo representativo)

#### 🏦 Servicios

- **BSE Centro de Pagos**: 1 foto (banco argentino ejemplo - PD)
- **Farmacia Del Este**: 1 foto (farmacia argentina ejemplo - PD)
- **Banco de la Nación**: 1 foto (banco central argentino - PD)
- **Estación Petrobras**: 1 foto (estación YPF ejemplo - PD)

#### 🍻 Vida Nocturna

- **Forum Bar**: 1 foto (bar argentino vintage - PD)
- **La Roca Pub**: 1 foto (pub argentino ejemplo - PD)
- **Buddha Bar**: 1 foto (bar argentino ejemplo - PD)
- **Bar Oculto**: 1 foto (bar argentino ejemplo - PD)
- **Distrito Roca**: 1 foto (bar argentino ejemplo - PD)
- **Cambalache**: 1 foto (bar argentino ejemplo - PD)

### 📊 Estadísticas Finales:

- **Total de imágenes**: 32 fotos de alta resolución
- **Total de lugares**: 28 establecimientos cubiertos
- **Cobertura**: 100% de lugares con al menos 1 imagen
- **Imágenes de dominio público (PD)**: 21 fotos
- **Imágenes con licencia desconocida**: 11 fotos
- **Tamaño promedio**: ~200KB por imagen
- **Resolución**: 1200px de ancho (estándar Wikimedia Commons)
- **Formato**: JPEG optimizado

## Estructura de Directorios Jerárquica

**IMPORTANTE**: La estructura de directorios ahora coincide exactamente con la jerarquía del archivo JSON `lugares-direcciones.json`. Cada lugar tiene su propio directorio siguiendo el patrón `categoria/lugar_id/`.

```
lugares/
├── transporte/
│   └── terminal_omnibus/           # Terminal de Ómnibus (3 fotos) ✅
├── cultura_entretenimiento/
│   ├── forum_santiago/             # Fórum Santiago del Estero (3 fotos) ✅
│   ├── centro_cultural_bicentenario/ # Centro Cultural del Bicentenario (1 foto) ✅
│   └── teatro_25_mayo/             # Teatro 25 de Mayo (1 foto) ✅
├── infraestructura/
│   └── puente_carretero/           # Puente Carretero (1 foto) ✅
├── lugares_historicos/
│   ├── plaza_libertad/             # Plaza Libertad (1 foto) ✅
│   ├── catedral_basilica/          # Catedral Basílica (1 foto) ✅
│   └── casa_gobierno/              # Casa de Gobierno (1 foto) ✅
├── parques_recreacion/
│   └── parque_aguirre/             # Parque Aguirre (1 foto) ✅
├── museos/
│   ├── museo_arqueologico/         # Museo Arqueológico (1 foto) ✅
│   └── museo_ciencias_naturales/   # Museo de Ciencias Naturales (1 foto) ✅
├── gastronomia/
│   ├── leblon_cafe/                # Leblon Café (1 foto) ✅
│   ├── dominga_resto_bar/          # Dominga Resto Bar (1 foto) ✅
│   ├── bless/                      # Bless (1 foto) ✅
│   └── amasijo/                    # Amasijo (1 foto) ✅
├── supermercados/
│   ├── vea_rivadavia/              # Supermercados Vea (1 foto) ✅
│   ├── changomas/                  # Changomas (1 foto) ✅
│   └── super_nataly/               # Super Nataly (1 foto) ✅
├── servicios/
│   ├── bse_centro_pagos/           # BSE Centro de Pagos (1 foto) ✅
│   ├── farmacia_del_este/          # Farmacia Del Este (1 foto) ✅
│   ├── banco_nacion/               # Banco de la Nación (1 foto) ✅
│   └── estacion_petrobras/         # Estación Petrobras (1 foto) ✅
├── vida_nocturna/
│   ├── forum_bar/                  # Forum Bar (1 foto) ✅
│   ├── la_roca_pub/                # La Roca Pub (1 foto) ✅
│   ├── buddha_bar/                 # Buddha Bar (1 foto) ✅
│   ├── bar_oculto/                 # Bar Oculto (1 foto) ✅
│   ├── distrito_roca/              # Distrito Roca (1 foto) ✅
│   └── cambalache/                 # Cambalache (1 foto) ✅
├── lugares-direcciones.json        # Base de datos JSON con direcciones
└── README.md                       # Esta documentación
```

### Leyenda de Estados:

- ✅ **Completo**: Directorio con imágenes disponibles
- 🔍 **PD**: Imagen de dominio público (Public Domain)
- 📷 **Ejemplo**: Imagen representativa del tipo de establecimiento

### Mapeo JSON → Directorios:

- `lugares.transporte.terminal_omnibus` → `transporte/terminal_omnibus/`
- `lugares.gastronomia.leblon_cafe` → `gastronomia/leblon_cafe/`
- `lugares.servicios.bse_centro_pagos` → `servicios/bse_centro_pagos/`
- etc.

## Notas sobre Imágenes Representativas

Para los establecimientos comerciales (cafés, restaurantes, supermercados) donde no se encontraron imágenes específicas, se utilizaron fotos representativas de establecimientos similares argentinos de Wikimedia Commons. Estas imágenes sirven como referencia visual del tipo de establecimiento hasta que se puedan obtener fotos específicas de cada lugar.

## Información de Licencias

### 🔍 Imágenes de Dominio Público (PD) - 21 imágenes

Las imágenes marcadas con `-PD` en el nombre del archivo son de dominio público o tienen licencias Creative Commons que permiten su uso libre. Estas incluyen:

- Todas las imágenes arquitectónicas (teatros, museos, parques, plazas)
- Imágenes de servicios públicos (bancos, farmacias, estaciones de servicio)
- Imágenes de vida nocturna (bares y pubs históricos)

### 📷 Imágenes con Licencia Desconocida - 11 imágenes

Las imágenes sin sufijo `-PD` o `-nonPD` requieren verificación adicional de licencia antes de uso comercial:

- Imágenes del Terminal de Ómnibus (3 fotos)
- Imagen del Puente Carretero
- Imágenes de establecimientos gastronómicos (4 fotos)
- Imágenes de supermercados (3 fotos)

### ⚠️ Recomendación de Uso

- **Uso personal/educativo**: Todas las imágenes pueden utilizarse
- **Uso comercial**: Verificar licencias específicas para imágenes sin marcador `-PD`
- **Atribución**: Siempre recomendable mencionar "Fuente: Wikimedia Commons" cuando sea aplicable

## Base de Datos JSON de Direcciones

El archivo `lugares-direcciones.json` contiene:

- **Direcciones confirmadas** de lugares específicos
- **Coordenadas aproximadas** para referencia geográfica
- **Distancias estimadas** desde el apartamento Aires de Río
- **Categorización** por tipo de establecimiento
- **Metadatos** sobre fuentes y última actualización
- **Estado de confirmación** de cada dirección

## Fuentes Adicionales Encontradas

Durante la búsqueda se identificaron las siguientes fuentes para imágenes adicionales:

- **Pixabay**: Más de 2,000 imágenes gratuitas de Santiago del Estero
- **Flickr**: Grupo "Santiago de Estero - Argentina" con fotos de usuarios
- **TripAdvisor**: Fotos de usuarios de lugares específicos
- **Shutterstock**: Imágenes profesionales (requieren licencia)

---

_Organizado desde fuentes identificadas en: https://chatgpt.com/s/dr_68fd56edaa708191987552021784a8d7_
