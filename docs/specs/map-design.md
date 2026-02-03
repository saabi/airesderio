# Map Component Design Specification

## Overview

This document defines the conceptual model and data structure for the SVG-based map component used in Aires de Río. The map displays an image-based representation of the area surrounding the development, with interactive zones (places) and a focal point (the main building).

## Coordinate System

The map uses a **pixel-based coordinate system** derived from the base image dimensions:

- **Origin**: Top-left corner of the base image `(0, 0)`
- **X-axis**: Grows positive → right
- **Y-axis**: Grows positive ↓ down
- **Units**: Pixels (matching the base image dimensions)

```
(0,0) ────────────────────────► X+
  │
  │    ┌─────────────────────┐
  │    │                     │
  │    │    BASE IMAGE       │
  │    │                     │
  │    │  width × height px  │
  │    │                     │
  │    └─────────────────────┘
  ▼
  Y+
```

The SVG `viewBox` is simply a rectangle in this coordinate space representing "what portion of the image we're viewing."

## Data Model

### Map (Root)

```typescript
interface Map {
  // Base image defines the coordinate space
  baseImage: {
    src: string;           // Path to image file, e.g., "/map/far.jpg"
    width: number;         // Image width in pixels
    height: number;        // Image height in pixels
  };
  
  // Optional higher-resolution overlay for a specific area
  detailImage?: {
    src: string;           // Path to detail image, e.g., "/map/near.jpg"
    x: number;             // X position in base image coordinates
    y: number;             // Y position in base image coordinates
    width: number;         // Width in base image coordinates
    height: number;        // Height in base image coordinates
  };
  
  // The main subject of the map (e.g., Aires de Río building)
  focal: Focal;
  
  // Optional explicit default view
  // If omitted → computed as radius fit around focal center
  defaultView?: ViewBox;
  
  // Radius for computed default view (when defaultView is omitted)
  // Default: derived from image dimensions
  defaultRadius?: number;
  
  // Interactive places/zones on the map
  places: Place[];
}
```

### Focal (Main Subject)

The focal represents the main subject of the map. It can be composed of multiple shapes forming a group.

```typescript
interface Focal {
  // Optional shapes that visually represent the focal subject
  shapes?: SvgShape[];
  
  // Center point for the focal
  // Used for: default view calculation, zoom animations, labels
  center: { cx: number; cy: number };
}
```

### Place (Interactive Zone)

Each place combines geometry (where it is) with content (what it is). Content fields can be empty for purely visual zones.

```typescript
interface Place {
  id: string;              // Unique identifier
  
  // === Geometry ===
  shape: SvgShape | SvgShape[];   // Zone outline(s) - single or composite
  pin: {                          // Anchor point for labels/tooltips
    cx: number;
    cy: number;
    r: number;
  };
  labels?: TextLabel[];           // Optional text annotations within the zone
  
  // === Content ===
  name: string;                   // Display name
  description?: string;           // Short description
  details?: string;               // Extended content (e.g., things to do)
  photos?: string[];              // Photo filenames (empty array = no gallery)
}
```

### SVG Shapes

```typescript
type SvgShape =
  | { type: 'path'; d: string }
  | { type: 'rect'; x: number; y: number; width: number; height: number }
  | { type: 'circle'; cx: number; cy: number; r: number };

interface TextLabel {
  type: 'text';
  x: number;
  y: number;
  content: string;
  xmlSpace?: 'preserve';
}
```

### ViewBox

```typescript
interface ViewBox {
  x: number;      // Top-left X
  y: number;      // Top-left Y
  width: number;  // View width
  height: number; // View height
}
```

## Default View Behavior

The default view determines what's shown initially and after a reset. The behavior depends on configuration:

| Scenario | Behavior |
|----------|----------|
| `defaultView` provided | Use the explicit view |
| `defaultView` omitted, `defaultRadius` provided | Compute view centered on `focal.center` with given radius |
| Both omitted | Compute view with sensible default radius (e.g., `min(width, height) * 0.2`) |

### Default View Calculation

When `defaultView` is omitted:

```
1. Take focal.center (cx, cy)
2. Use defaultRadius (or derive sensible default)
3. Compute initial viewBox:
   
   viewBox = {
     x: cx - radius,
     y: cy - radius,
     width: radius * 2,
     height: radius * 2
   }

4. Adjust for display aspect ratio to fit properly
```

```
┌─────────────────────────────────────────┐
│           BASE IMAGE                    │
│                                         │
│         ┌─────────────────┐             │
│         │   defaultView   │             │
│         │   (computed)    │             │
│         │                 │             │
│         │    ┌───────┐    │             │
│         │    │ FOCAL │    │             │
│         │    │shapes │    │             │
│         │    └───────┘    │             │
│         │        ●        │             │
│         │     center      │             │
│         │                 │             │
│         └─────────────────┘             │
│              ↑ radius ↑                 │
│                                         │
└─────────────────────────────────────────┘
```

## Derived Values

Since the coordinate system is image-based, some values can be derived:

```typescript
// Full viewBox encompasses the entire image
const fullViewBox: ViewBox = {
  x: 0,
  y: 0,
  width: map.baseImage.width,
  height: map.baseImage.height
};

// Detail image bounds (if present)
const detailViewBox: ViewBox | null = map.detailImage ? {
  x: map.detailImage.x,
  y: map.detailImage.y,
  width: map.detailImage.width,
  height: map.detailImage.height
} : null;
```

## JSON Schema Example

```json
{
  "baseImage": {
    "src": "/map/far.jpg",
    "width": 374.12082,
    "height": 225.68958
  },
  
  "detailImage": {
    "src": "/map/near.jpg",
    "x": 81.364487,
    "y": 52.243599,
    "width": 69.217209,
    "height": 41.755505
  },
  
  "focal": {
    "shapes": [
      {
        "type": "path",
        "d": "m 202.97288,409.90271 2.2931,0.0425 0.29238,0.2863..."
      },
      {
        "type": "circle",
        "cx": 203.69386,
        "cy": 413.82022,
        "r": 4.3814869
      }
    ],
    "center": { "cx": 203.69386, "cy": 413.82022 }
  },
  
  "defaultRadius": 50,
  
  "places": [
    {
      "id": "terminal",
      "name": "Terminal de Ómnibus de Santiago del Estero",
      "description": "Terminal principal de ómnibus de la ciudad",
      "details": "La Terminal de Ómnibus es tu conexión con el resto del país...",
      "photos": ["exterior.png", "interior.png"],
      "shape": {
        "type": "path",
        "d": "m 151.67143,316.93007 3.38155,3.56796..."
      },
      "pin": { "cx": 151.09848, "cy": 333.03827, "r": 2.1235924 }
    },
    {
      "id": "parque-aguirre",
      "name": "Parque Aguirre",
      "description": "Principal parque de la ciudad",
      "details": "El Parque Aguirre es el principal espacio verde...",
      "photos": ["aerea.png", "calecita.png", "deportes.png"],
      "shape": {
        "type": "path",
        "d": "m 333.45789,410.82288 -2.81949,4.5402..."
      },
      "pin": { "cx": 279.82251, "cy": 571.65515, "r": 2.1235924 },
      "labels": [
        { "type": "text", "x": 313.02628, "y": 359.36108, "content": "BALNEARIO 1", "xmlSpace": "preserve" },
        { "type": "text", "x": 326.16437, "y": 471.83643, "content": "BALNEARIO 2", "xmlSpace": "preserve" },
        { "type": "text", "x": 374.28116, "y": 699.82135, "content": "BALNEARIO 3", "xmlSpace": "preserve" }
      ]
    },
    {
      "id": "estadio-unico",
      "name": "Estadio Único",
      "description": "Estadio principal de la ciudad",
      "photos": [],
      "shape": {
        "type": "circle",
        "cx": 229.02405,
        "cy": 33.241516,
        "r": 22.39249
      },
      "pin": { "cx": 231.18658, "cy": 32.347748, "r": 2.1235924 }
    },
    {
      "id": "avenida-rivadavia",
      "name": "Avenida Rivadavia",
      "description": "Avenida principal donde se encuentra Aires de Río",
      "photos": [],
      "shape": {
        "type": "path",
        "d": "m 24.897591,411.24854 255.074059,0.15718..."
      },
      "pin": { "cx": 127.81216, "cy": 409.99713, "r": 2.1235924 }
    }
  ]
}
```

## Component Interactions

### Zooming to a Place

When zooming to a place:

1. Calculate the bounding box of `place.shape` (or union of shapes if composite)
2. Optionally include the focal in the bounding box calculation (`includeAiresderio` flag)
3. Apply zoom margin
4. Animate the viewBox to the calculated bounds
5. Position label at `place.pin` coordinates

### Reset

When resetting:

1. Animate viewBox back to `defaultView` (or computed default)
2. Clear any selected place state

### Navigation (Next/Prev)

Cycle through `places` array, zooming to each in sequence.

## Migration from Current Structure

| Current | New |
|---------|-----|
| `mapConfig.fullViewBox` | Derived from `baseImage.width/height` |
| `mapConfig.nearViewBox` | `detailImage` bounds or `defaultView` |
| `mapConfig.airesderioCenter` | `focal.center` |
| `mapConfig.farImage` | `baseImage.src` |
| `mapConfig.nearImage` | `detailImage.src` |
| `places[id].svg.elements` | `places[i].shape` |
| `places[id].svg.pin` | `places[i].pin` |
| `places[id].nombre` | `places[i].name` |
| `places[id].descripcion` | `places[i].description` |
| `places[id].thingstodo` | `places[i].details` |
| Nested `places` object by ID | Flat `places` array with `id` field |

## File Organization

```
static/
├── map/
│   ├── far.jpg           # Base image
│   └── near.jpg          # Detail overlay image
└── places/
    ├── map.json          # Map configuration + places data
    ├── terminal/         # Photos for terminal place
    │   ├── exterior.png
    │   └── interior.png
    ├── forum/            # Photos for forum place
    │   ├── 1_Forum 02.jpg
    │   └── ...
    └── ...
```

---

**Last Updated**: 2026-02-03  
**Status**: Proposal
