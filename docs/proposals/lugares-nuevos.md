# Lugares nuevos: folder → place ID mapping and gallery import

This document defines how proposal folders under `docs/proposals/lugares-nuevos/` map to app place IDs in [fe/static/places/map.json](../../fe/static/places/map.json), and how filenames are normalized for use as gallery photos.

## Folder → place ID mapping

| Proposal folder | App place id | Notes |
|-----------------|--------------|--------|
| AV. ALVEAR-FORUM | `forum` | Forum building photos; some filenames match existing |
| AV. RIVADAVIA | `avenida-rivadavia` | Currently `photos: []` |
| CALLE ROCA | `avenida-roca` | Filenames may match existing (1_Untitled-1.jpg, etc.) |
| CASA DE GOBIERNO | `casa-de-gobierno` | New file: CASA DE GOBIERNO_03 de Tripadvisor.jpg |
| CCB-CENTRO | `ccb` | Currently `photos: []` |
| ESTADIO UNICO | `estadio-unico` | Currently `photos: []` |
| MERCADO ARMONIA | `mercado` | Currently `photos: []` |
| PARQUE AGUIRRE | `parque-aguirre` | New filenames; skip non-image (e.g. .url) |
| PLAZA LIBERTAD | `plaza-libertad` | Currently `photos: []` |
| TEATRO 25 DE MAYO | `teatro-25-de-mayo` | Currently `photos: []` |
| TERMINAL DE OMNIBUS NESTOR KIRCHNER | `terminal` | Add as extra photos (frente-00.jpg, interior-00.jpg, etc.); keep existing exterior.png, interior.png |
| TRIBUNALES | `tribunales` | Currently `photos: []` |

## Folders not mapped (no current place)

The following proposal folders have no corresponding place in the map and are skipped by the import:

- ESCALERA DE INCENDIOS
- ETAPAS DE LA CONSTRUCCION
- OTROS RENDERS EDIFICIO
- PEATONALES
- PLACARD PARA LAVARROPAS
- PLAYAS RIO DULCE
- SISTEMA CONSTRUCTIVO

## Filename normalization rule

When copying from proposal folders into `fe/static/places/{placeId}/`, filenames are normalized so they are URL-safe and consistent:

1. **Lowercase** the whole filename (including extension).
2. Replace **spaces** and **consecutive punctuation** (underscores, dots other than extension, etc.) with a **single hyphen**.
3. Keep the **extension** as-is (e.g. `.jpg`, `.jpeg`, `.png`).
4. Skip **non-image** files (e.g. `.url`).

Example: `1_ESTA VA_PARQUE-Juegos cpn chicos_03.jpg` → `1-esta-va-parque-juegos-cpn-chicos-03.jpg`

Example: `CASA DE GOBIERNO_03 de Tripadvisor.jpg` → `casa-de-gobierno-03-de-tripadvisor.jpg`

## Import script

Run from the repository root:

```bash
node fe/scripts/import-lugares-nuevos.js
```

The script copies image files from each mapped proposal folder into `fe/static/places/{placeId}/` with normalized names and appends new filenames to `places[].photos` in `map.json` (without duplicating entries already present).
