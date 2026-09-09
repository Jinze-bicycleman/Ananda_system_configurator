// Ananda E-Drive System Configurator — Fixed-layout System Diagram geometry
//
// Static geometry, connection topology and localStorage persistence for the
// Stage 7 "System Diagram" view (mid-drive). Distinct from the photographic
// bicycle-overlay diagram (`ananda-system-diagram.ts`) and the radial
// engineering diagram (`ananda-system-topology.ts`) — this is the approved
// fixed 1000×900 layout with 7 component cards and 6 cable/interface labels.

export type FrameKey = "hmi" | "accessories" | "motor" | "speedSensor" | "battery" | "cage" | "chargingPort"
export type ConnectionKey = "hmi" | "accessories" | "speedSensor" | "cageToMotor" | "batteryDock" | "chargingPortLead"
export type CardOrientation = "image-left" | "image-top"
export type LabelMode = "compact" | "expanded"

export interface FrameRect {
  x: number
  y: number
  w: number
  h: number
  orientation: CardOrientation
}

export interface LabelRect {
  x: number
  y: number
  w: number
  h: number
  mode: LabelMode
}

export const CANVAS_W = 1000
export const CANVAS_H = 900

export const DEFAULT_FRAMES: Record<FrameKey, FrameRect> = {
  hmi: { x: 50, y: 40, w: 230, h: 140, orientation: "image-left" },
  accessories: { x: 50, y: 230, w: 230, h: 300, orientation: "image-top" },
  motor: { x: 480, y: 380, w: 220, h: 170, orientation: "image-top" },
  speedSensor: { x: 820, y: 230, w: 180, h: 140, orientation: "image-left" },
  battery: { x: 480, y: 640, w: 210, h: 150, orientation: "image-left" },
  cage: { x: 720, y: 640, w: 140, h: 150, orientation: "image-top" },
  chargingPort: { x: 880, y: 640, w: 110, h: 150, orientation: "image-top" },
}

// Label boxes size to their content (see DiagramCableLabel's `min-h`), so
// these heights are minimums, not hard clips — positions below are chosen
// so no label's *minimum* box footprint overlaps a component card even
// before it grows for longer content.
export const DEFAULT_LABELS: Record<ConnectionKey, LabelRect> = {
  hmi: { x: 290, y: 200, w: 180, h: 92, mode: "compact" },
  accessories: { x: 290, y: 440, w: 180, h: 92, mode: "compact" },
  speedSensor: { x: 770, y: 460, w: 180, h: 92, mode: "compact" },
  cageToMotor: { x: 560, y: 570, w: 170, h: 64, mode: "compact" },
  batteryDock: { x: 660, y: 800, w: 150, h: 40, mode: "compact" },
  chargingPortLead: { x: 850, y: 800, w: 150, h: 88, mode: "compact" },
}

export type Side = "top" | "right" | "bottom" | "left"
export type RouteOrder = "vh" | "hv"
export type ConnectionKind = "cable" | "docking" | "orphan"

export interface ConnectionTopologyEntry {
  from: FrameKey
  to: FrameKey
  fromSide: Side
  toSide: Side
  route: RouteOrder
  color: string
  kind: ConnectionKind
  editable: boolean
}

// Colors are explicit hex values independent of the brand chart palette, so
// each connection reads consistently regardless of theme tokens elsewhere.
export const CONNECTION_TOPOLOGY: Record<ConnectionKey, ConnectionTopologyEntry> = {
  hmi: { from: "hmi", to: "motor", fromSide: "bottom", toSide: "top", route: "vh", color: "#2563eb", kind: "cable", editable: true },
  accessories: {
    from: "accessories",
    to: "motor",
    fromSide: "right",
    toSide: "left",
    route: "hv",
    color: "#7c3aed",
    kind: "cable",
    editable: true,
  },
  speedSensor: {
    from: "speedSensor",
    to: "motor",
    fromSide: "bottom",
    toSide: "right",
    route: "vh",
    color: "#ea580c",
    kind: "cable",
    editable: false,
  },
  cageToMotor: { from: "cage", to: "motor", fromSide: "left", toSide: "bottom", route: "hv", color: "#16a34a", kind: "cable", editable: true },
  batteryDock: {
    from: "battery",
    to: "cage",
    fromSide: "right",
    toSide: "left",
    route: "hv",
    color: "#71717a",
    kind: "docking",
    editable: false,
  },
  chargingPortLead: {
    from: "chargingPort",
    to: "chargingPort",
    fromSide: "bottom",
    toSide: "bottom",
    route: "hv",
    color: "#0d9488",
    kind: "orphan",
    editable: true,
  },
}

const LAYOUT_VERSION = "v1"

export function diagramLayoutStorageKey(topology: "mid-drive" | "hub-motor") {
  return `ananda-diagram-layout::${topology}::${LAYOUT_VERSION}`
}

export interface DiagramLayout {
  frames: Record<FrameKey, FrameRect>
  labels: Record<ConnectionKey, LabelRect>
}

function isValidFrameRect(value: unknown): value is FrameRect {
  if (!value || typeof value !== "object") return false
  const rect = value as Record<string, unknown>
  return (
    typeof rect.x === "number" &&
    typeof rect.y === "number" &&
    typeof rect.w === "number" &&
    typeof rect.h === "number" &&
    (rect.orientation === "image-left" || rect.orientation === "image-top")
  )
}

function isValidLabelRect(value: unknown): value is LabelRect {
  if (!value || typeof value !== "object") return false
  const rect = value as Record<string, unknown>
  return (
    typeof rect.x === "number" &&
    typeof rect.y === "number" &&
    typeof rect.w === "number" &&
    typeof rect.h === "number" &&
    (rect.mode === "compact" || rect.mode === "expanded")
  )
}

/** Loads a saved layout override from localStorage; returns null if absent, invalid, or storage is unavailable. */
export function loadDiagramLayout(topology: "mid-drive" | "hub-motor" = "mid-drive"): DiagramLayout | null {
  try {
    if (typeof window === "undefined") return null
    const raw = window.localStorage.getItem(diagramLayoutStorageKey(topology))
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<DiagramLayout>
    if (!parsed.frames || !parsed.labels) return null
    const frameKeys = Object.keys(DEFAULT_FRAMES) as FrameKey[]
    const labelKeys = Object.keys(DEFAULT_LABELS) as ConnectionKey[]
    const framesValid = frameKeys.every((k) => isValidFrameRect(parsed.frames?.[k]))
    const labelsValid = labelKeys.every((k) => isValidLabelRect(parsed.labels?.[k]))
    if (!framesValid || !labelsValid) return null
    return parsed as DiagramLayout
  } catch {
    return null
  }
}

/** Saves a layout override to localStorage; silently no-ops if storage is unavailable. */
export function saveDiagramLayout(layout: DiagramLayout, topology: "mid-drive" | "hub-motor" = "mid-drive") {
  try {
    if (typeof window === "undefined") return
    window.localStorage.setItem(diagramLayoutStorageKey(topology), JSON.stringify(layout))
  } catch {
    // Storage unavailable (private browsing, quota, etc) — edits stay in-memory only.
  }
}

/** Clears any saved layout override; silently no-ops if storage is unavailable. */
export function clearDiagramLayout(topology: "mid-drive" | "hub-motor" = "mid-drive") {
  try {
    if (typeof window === "undefined") return
    window.localStorage.removeItem(diagramLayoutStorageKey(topology))
  } catch {
    // Storage unavailable — nothing to clear.
  }
}

/** `≥1000` mm formats as meters (e.g. "1.5 m"), otherwise as centimeters (e.g. "50 cm"). Mirrors `formatCableLength` in ananda-system-topology.ts. */
export function formatLeadLength(lengthMm: number): string {
  if (lengthMm >= 1000) {
    const meters = lengthMm / 1000
    return `${Number.isInteger(meters) ? meters.toFixed(0) : meters.toFixed(1)} m`
  }
  const cm = lengthMm / 10
  return `${Number.isInteger(cm) ? cm.toFixed(0) : cm.toFixed(1)} cm`
}
