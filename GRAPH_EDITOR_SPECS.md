# Node-Graph Audio Editor — Design & Implementation Report (Svelte 5)

## Product goals (recap)

* **Aesthetic, compact, practical** node UI.
* **Ports directly under the header** (stable anchors; wiring unaffected by param-group collapses).
* **Waveform/Spectrogram previews** per node (optional; capability-aware).
* **Subgraphs (ingressable)** like TouchDesigner: named groups can be instanced elsewhere.
* **Exportable interface**: choose which **parameters** and **I/O connectors** of a group are visible on its instance.
* **Best-of-breed UX** borrowing from TouchDesigner, Unreal Blueprints, Blender Node Groups, Max/MSP, Grasshopper.

---

## UI principles

1. **Node layout**
   Header (title + flags) → **Ports strip (inputs left, outputs right)** → Body (param groups) → Preview (optional).
   Ports remain stable when groups collapse/expand.

2. **Flags** (per node)
   Bypass · Play/Preview · Waveform · Spectrogram · Lock · Open Subgraph (⧉).
   Waveform/Spectrogram auto-disable if unsupported by node capabilities.

3. **Previews**

   * Inline preview (small strip) **or** detachable floating panel.
   * Background preview underneath the grid is supported for TouchDesigner-style monitoring.

4. **Performance**
   Single `<svg>` EdgeLayer; HTML for nodes; debounced anchor recompute on pan/zoom; optional node virtualization.

---

## Exportable parameters & I/O (strategies)

**Goal:** When a named group is instanced, the “instance node” only shows **promoted parameters** and **exposed I/O**.

### Patterns we integrate

* **Manual promotion** (Unreal/Blender/Max): Right-click/inline **Promote** on a param to surface it in the group’s interface.
* **Interface Editor** (TouchDesigner-style): Group-level editor with tabs **Inputs**, **Outputs**, **Parameters**, **Version** (reorder, rename, section, type, units, etc.).
* **Specialized I/O nodes** (Blender’s Group Input/Output, Unreal Function Entry/Return, Houdini Subnet I/O):
  **`GroupInput`** and **`GroupOutput`** nodes **inside the subgraph** are the source of truth for exported pins.
* **Hybrid flow (recommended)**: “Promote” is a fast shortcut; **I/O nodes** keep exports explicit and visible. The Interface Editor mirrors the I/O nodes (two-way sync).
* **Sections for I/O**: purely **editor/inspector metadata** for grouping lists; **not** rendered in the compact ports strip.

### Why specialized I/O nodes?

* Explicit, visual contract; deterministic execution boundaries; easy to refactor.
* Drag-reorder pins on I/O nodes → instance strip order updates.
* Supports **optional** pins, **multi/variadic** pins, channel repeaters, preview tap designation.

---

## Data model (TypeScript)

```ts
// types/graph.ts
export type PortType  = 'audio' | 'cv' | 'event';
export type ParamType = 'float' | 'int' | 'bool' | 'enum' | 'time' | 'hz' | 'db' | 'text';

export type ExposedPort = {
  id: string;                  // stable UUID
  label: string;
  type: PortType;
  optional?: boolean;
  multi?: boolean;             // allow multi-connect / fan-out
  order?: number;
  section?: string;            // UI-only grouping (not rendered in the strip)
};

export type ExposedParam = {
  id: string;                  // stable UUID, maps to internal param path
  label: string;
  path: string;                // e.g., "Filter1.cutoff"
  type: ParamType;
  min?: number; max?: number; step?: number; unit?: 'Hz'|'dB'|'s'|'%';
  enum?: Array<{ label: string; value: string | number }>;
  readonly?: boolean;
  section?: string;            // UI grouping
  order?: number;
  default?: unknown;
};

export type GroupInterface = {
  version: string;             // semver
  inputs:  ExposedPort[];
  outputs: ExposedPort[];
  params:  ExposedParam[];
  presets?: Record<string, Partial<Record<string, unknown>>>;
  capabilities?: { waveform?: boolean; spectrogram?: boolean };
};

export type GroupAsset = {
  id: string;
  name: string;
  interface: GroupInterface;
  graph: SerializedGraph;      // internal subgraph
};

export type GroupInstance = {
  assetId: string;
  assetVersion: string;
  overrides?: Record<string, unknown>;   // ExposedParam.id -> value
  lockedPins?: string[];                  // prevent accidental removal
};
```

**Runtime helpers (examples):**

```ts
// types/runtime.ts
export type Anchor = { id: string; rect: DOMRectReadOnly };

export type Edge = {
  id: string;
  from: { nodeId: string; portId: string };
  to:   { nodeId: string; portId: string };
};

export type NodeModel = {
  id: string;
  kind: string;                       // 'Filter' | 'Envelope' | ...
  pos: { x: number; y: number };
  size?: { w: number; h: number };
  tone?: string;                      // header color
  capabilities?: { waveform?: boolean; spectrogram?: boolean };
  ioSignature?: { inputs: ExposedPort[]; outputs: ExposedPort[] };
  params: Record<string, unknown>;
};
```

**Sample instance contract JSON:**

```json
{
  "assetId": "grp.filter.voice",
  "assetVersion": "1.2.0",
  "interface": {
    "inputs": [
      { "id": "in-a", "label": "Audio In", "type": "audio" },
      { "id": "in-env", "label": "Env In", "type": "cv", "section": "Modulation" }
    ],
    "outputs": [
      { "id": "out-a", "label": "Audio Out", "type": "audio" }
    ],
    "params": [
      { "id": "p-cut", "label": "Cutoff", "path": "LPF.cutoff", "type": "hz", "min": 20, "max": 20000, "unit": "Hz", "section": "Frequency" },
      { "id": "p-res", "label": "Resonance", "path": "LPF.q", "type": "float", "min": 0, "max": 1, "step": 0.01, "section": "Frequency" }
    ],
    "capabilities": { "waveform": true, "spectrogram": true }
  }
}
```

---

## Versioning & migration

* **Minor bump**: add non-breaking param or pin.
* **Major bump**: remove/rename pins/params (breaking).
* Instances store `(assetId, assetVersion)`.
* `services/migration.diff(old, new)` flags breaking vs. additive changes; offers remap hints by stable **IDs** (labels can change safely).
* On major upgrades, show a **diff** and offer **auto-migrate** (with defaults).

---

## Capabilities (previews)

* `GroupInterface.capabilities = { waveform?: boolean; spectrogram?: boolean }`.
* Instance `NodeFlags` and `NodePreviewDock` enable/disable Wave/Spectro buttons based on capabilities.
* **Preview tap**: choose which exported output pin feeds preview (configurable in Interface Editor/I/O nodes).

---

## Svelte 5 component library (by layer)

### Canvas & graph

* `GraphCanvas.svelte` — pan/zoom grid, mouse/touch handlers.
* `EdgeLayer.svelte` — one SVG for all edges; reroutes on anchor change.
* `NodeHost.svelte` — absolute-position nodes; (optional) virtualization.
* `SelectionMarquee.svelte` — drag-to-select.
* `ContextMenu.svelte` — graph/node/port menus (Promote, Group, Ingress).

### Nodes (generic shell + specializations)

* `Node.svelte` — base shell (header → **ports strip** → body → preview).
* `NodeHeader.svelte` — title, flags, tone color; draggable.
* `NodePorts.svelte` — **ports strip directly under the header**; exposes `getPortAnchor(id)`.
* `NodeBody.svelte` — slots for param groups.
* `NodePreviewDock.svelte` — `mode: 'off'|'waveform'|'spectrogram'`, respects `capabilities`.
* `NodeFlags.svelte` — Bypass / Play / Wave / Spec / Lock / Open-Subgraph (⧉).

**Utility nodes (subgraph only):**

* `GroupInputNode.svelte` — editable exported **inputs** list.
* `GroupOutputNode.svelte` — editable exported **outputs** list.

**Example audio nodes:**

* `FilterNode.svelte`, `EnvelopeNode.svelte`, `MixerNode.svelte`, `SynthVoiceNode.svelte`
  (thin wrappers around `Node` that supply body params + tones + IO signatures).

### Parameters

* `ParamGroup.svelte` (collapsible)
* `ParamRow.svelte` (`[label][control][⤴ Promote]`)
* `ParamNumber.svelte`, `ParamRange.svelte`, `ParamSelect.svelte`, `ParamToggle.svelte`, `ParamTime.svelte`, `ParamHz.svelte`, `ParamDb.svelte`

### Interface authoring

* `InterfaceEditor.svelte` — drawer with tabs **Inputs**, **Outputs**, **Parameters**, **Version**.
* `InterfaceInputs.svelte`, `InterfaceOutputs.svelte`, `InterfaceParams.svelte`, `InterfaceVersion.svelte`
* `PresetPicker.svelte` — instance presets/overrides.

### Shared UI

* `UiLabel.svelte` — central label/typography
  Props: `variant: 'title'|'section'|'param'|'badge'`, `tone: 'neutral'|'accent'|'warn'|'muted'`, `size: 'xs'|'sm'|'md'|'lg'`, `mono?`, `truncate?`, `uppercase?`
* `Badge.svelte`, `IconButton.svelte`, `Popover.svelte`, `Dialog.svelte`, `Tabs.svelte`, `Tooltip.svelte`
* `FloatingPanel.svelte` (detached previews), `BackgroundPreview.svelte`

---

## Directory structure

```
src/lib/
  components/
    GraphCanvas.svelte
    EdgeLayer.svelte
    NodeHost.svelte
    SelectionMarquee.svelte
    ContextMenu.svelte

    nodes/
      Node.svelte
      NodeHeader.svelte
      NodePorts.svelte
      NodeBody.svelte
      NodePreviewDock.svelte
      NodeFlags.svelte
      GroupInputNode.svelte
      GroupOutputNode.svelte

      audio/
        FilterNode.svelte
        EnvelopeNode.svelte
        MixerNode.svelte
        SynthVoiceNode.svelte

    params/
      ParamGroup.svelte
      ParamRow.svelte
      ParamNumber.svelte
      ParamRange.svelte
      ParamSelect.svelte
      ParamToggle.svelte
      ParamTime.svelte
      ParamHz.svelte
      ParamDb.svelte

    interface/
      InterfaceEditor.svelte
      InterfaceInputs.svelte
      InterfaceOutputs.svelte
      InterfaceParams.svelte
      InterfaceVersion.svelte
      PresetPicker.svelte

    ui/
      UiLabel.svelte
      Badge.svelte
      IconButton.svelte
      Popover.svelte
      Dialog.svelte
      Tabs.svelte
      Tooltip.svelte
      FloatingPanel.svelte
      BackgroundPreview.svelte

  stores/
    graphState.ts
    anchors.ts
    interfaceState.ts
    history.ts
    presets.ts

  types/
    graph.ts
    runtime.ts

  services/
    router.ts
    migration.ts
    groupIO.ts
    preview.ts
    layout.ts

  utils/
    dom.ts
    ids.ts
    semver.ts
    geometry.ts
```

---

## Key runtime behaviors (Svelte 5 runes)

* `$state` for node positions, selection, zoom; `$derived` for viewport-filtered edges; `$effect` to re-measure port anchors on pan/zoom/header resize.
* `NodePorts.svelte` exposes `getPortAnchor(id)`; `anchors.ts` aggregates them for `EdgeLayer`.
* **Ports strip** remains under the header and **never** moves with param collapses.
* `GroupInputNode`/`GroupOutputNode` are **the source of truth** for exported pins; `InterfaceEditor` mirrors them via `services/groupIO.ts`.
* “Promote” on param rows inserts an `ExposedParam` (no effect on ports).
* Capabilities in `GroupInterface.capabilities` drive `NodeFlags` and `NodePreviewDock`.
* One SVG for edges; anchor measurements RA-F debounced; optional virtualization in `NodeHost`.

---

## UX flows (authoring)

* **Export input**: add pin on **GroupInputNode** → wire internally → instance shows that port in its strip.
* **Export output**: add pin on **GroupOutputNode** → connect from internal node → instance shows that port.
* **Promote param**: click **⤴ Promote** on a row → appears in Interface/instance panel (sectioned).
* **Reorder pins**: drag or ↑/↓ in I/O node/editor → instance strip order updates.
* **Versioning**: editor suggests **minor** for adds, **major** for removals/renames; instances can opt-in to migrate.

---

## Accessibility & keyboard (essentials)

* Ports: `role="button"`, `aria-label="Connect <label>"`, enlarged hit-areas.
* Keyboard wiring: `Tab` focus nodes/ports; `C` start a connection; `Esc` cancel.
* Node movement: arrows nudge; `Shift` for larger steps; grid snap optional.

---

## Future extensions

* Multi-channel pins (repeaters) with lane colorization.
* Auto-layout & pack frames to avoid overlaps.
* Edge diagnostics (meter overlays, level/clip badges).
* JSON exporter/importer for `GroupInterface` contracts and presets.

> **Note:**  
For visual and behavioral reference when implementing Svelte 5 components (such as group I/O nodes, param promotion, interface drawers, etc.), see the [`fe/static/mockups/node_graph.html`](fe/static/mockups/node_graph.html) mockup file—especially for detailed styling, DOM structure, and UI mechanics that are mirrored in the production editor.
