// Bike overview templates, transcribed from the Figma file "Ebike display UI
// design" (frames 1016:2 "city" and 1020:4 "mountain"). Every coordinate below
// is in that frame's own pixel space, so relative positions match Figma
// exactly. `viewBox` only crops dead whitespace around the artwork.

export type BikeTemplateId = "city" | "mountain"
export type ProductRole = "motor" | "battery" | "display" | "speedSensor"
export type CableKey = "hmi" | "power" | "sensor"

export interface Box {
  x: number
  y: number
  w: number
  h: number
}

export interface ProductPlacement {
  /** Image box on the template canvas. */
  box: Box
  /** Top-left of the product's text label. Absent when the Figma frame has no label for it. */
  label?: { x: number; y: number }
  /** Reference product shown in the Figma frame (used when nothing is selected). */
  defaultModel: string
  defaultSrc: string
}

export interface CablePlacement {
  /** Route through the bike, converted from the Figma vector. Smoothed at render time. */
  points: [number, number][]
  /** Top-left of the cable's text label. */
  label: { x: number; y: number }
  /** Optional leader line from the cable to its label. */
  leader?: { x1: number; y1: number; x2: number; y2: number }
  /** Connector designation printed in the label (literal Figma copy). */
  connectorLabel: string
  /** Reference length shown in Figma, in millimetres. */
  defaultLengthMm: number
  /** Standard lengths offered in the picker, in millimetres. */
  standardLengthsMm: number[]
}

export interface BikeTemplate {
  id: BikeTemplateId
  name: string
  figmaNode: string
  canvas: { w: number; h: number }
  viewBox: Box
  silhouette: { src: string; box: Box; opacity: number; stretch: boolean }
  /** Paint order of product images, bottom to top (matches Figma layer order). */
  productOrder: ProductRole[]
  products: Record<ProductRole, ProductPlacement>
  cables: Record<CableKey, CablePlacement>
}

export interface CableMeta {
  key: CableKey
  title: string
  colorName: string
  stroke: string
  /** Store key shared with the report and the system-diagram tab. */
  connection: string
  from: string
  to: string
  requires: ProductRole
}

// Colours come from the Figma cable strokes. Power uses the mountain frame's
// pure red because the label reads "Red" (the city vector is a more orange red).
export const CABLE_META: Record<CableKey, CableMeta> = {
  hmi: {
    key: "hmi",
    title: "HMI Cable",
    colorName: "Green",
    stroke: "#0EF534",
    connection: "Display → Motor unit",
    from: "Display",
    to: "Motor",
    requires: "display",
  },
  power: {
    key: "power",
    title: "Power Cable",
    colorName: "Red",
    stroke: "#FD0000",
    connection: "Battery → Motor unit",
    from: "Battery",
    to: "Motor",
    requires: "battery",
  },
  sensor: {
    key: "sensor",
    title: "Sensor Cable",
    colorName: "Blue",
    stroke: "#0EF5ED",
    connection: "Speed sensor → Motor unit",
    from: "Wheel speed sensor",
    to: "Motor",
    requires: "speedSensor",
  },
}

export const CABLE_ORDER: CableKey[] = ["hmi", "power", "sensor"]

export const CUSTOM_LENGTH_LIMITS_MM = { min: 100, max: 3000 }

const A = "/bike-overview"

export const BIKE_TEMPLATES: Record<BikeTemplateId, BikeTemplate> = {
  city: {
    id: "city",
    name: "City bike",
    figmaNode: "1016:2",
    canvas: { w: 783, h: 474 },
    viewBox: { x: 150, y: 24, w: 550, h: 440 },
    silhouette: { src: `${A}/city/silhouette.png`, box: { x: 150, y: 70, w: 500, h: 333 }, opacity: 0.5, stretch: true },
    productOrder: ["motor", "battery", "display", "speedSensor"],
    products: {
      motor: { box: { x: 369, y: 256, w: 98, h: 98 }, label: { x: 378, y: 341 }, defaultModel: "M7100", defaultSrc: `${A}/shared/m7100.png` },
      battery: { box: { x: 275, y: 132, w: 161, h: 161 }, label: { x: 370, y: 185 }, defaultModel: "BN21S", defaultSrc: `${A}/shared/bn21s.png` },
      display: { box: { x: 214, y: 20, w: 156, h: 112 }, label: { x: 268, y: 39 }, defaultModel: "DF130", defaultSrc: `${A}/shared/df130.png` },
      speedSensor: { box: { x: 471, y: 264, w: 136, h: 91 }, label: { x: 522, y: 343 }, defaultModel: "S7", defaultSrc: `${A}/shared/s7.png` },
    },
    cables: {
      hmi: {
        points: [[292.8, 101.4], [291.6, 118.7], [297.9, 134.1], [310.2, 144], [325, 149.9], [332.7, 158.4], [387.6, 262.8], [395.7, 294.8], [427.1, 323.3]],
        label: { x: 175, y: 412 },
        leader: { x1: 307, y1: 158, x2: 243, y2: 403 },
        connectorLabel: "cusmade A",
        defaultLengthMm: 1000,
        standardLengthsMm: [500, 800, 1000, 1500],
      },
      power: {
        points: [[394.5, 270.3], [398.1, 280.6], [407.6, 294], [427, 312.3], [432, 320.7]],
        label: { x: 361, y: 412 },
        leader: { x1: 420, y1: 307, x2: 405, y2: 408 },
        connectorLabel: "cusmade B",
        defaultLengthMm: 300,
        standardLengthsMm: [200, 300, 500, 800],
      },
      sensor: {
        points: [[522.5, 297.2], [491.5, 296.9], [452.6, 304.2], [430, 327.1]],
        label: { x: 541, y: 412 },
        leader: { x1: 497, y1: 306, x2: 553, y2: 408 },
        connectorLabel: "cusmade C",
        defaultLengthMm: 700,
        standardLengthsMm: [400, 700, 1000, 1400],
      },
    },
  },
  mountain: {
    id: "mountain",
    name: "Mountain bike",
    figmaNode: "1020:4",
    canvas: { w: 758, h: 474 },
    viewBox: { x: 120, y: 30, w: 580, h: 390 },
    silhouette: { src: `${A}/mountain/silhouette.png`, box: { x: 129, y: -13, w: 500, h: 500 }, opacity: 0.5, stretch: false },
    productOrder: ["speedSensor", "motor", "display", "battery"],
    products: {
      motor: { box: { x: 372, y: 253, w: 98, h: 98 }, label: { x: 372, y: 334 }, defaultModel: "M7600", defaultSrc: `${A}/shared/m7600.png` },
      battery: { box: { x: 261, y: 128, w: 174, h: 174 }, defaultModel: "BN21S", defaultSrc: `${A}/shared/bn21s.png` },
      display: { box: { x: 245, y: 57, w: 150, h: 112 }, label: { x: 280, y: 45 }, defaultModel: "DF232", defaultSrc: `${A}/shared/df232.png` },
      speedSensor: { box: { x: 470, y: 242, w: 101, h: 101 }, label: { x: 572, y: 277 }, defaultModel: "S13", defaultSrc: `${A}/shared/s13.png` },
    },
    cables: {
      hmi: {
        points: [[330.7, 152.7], [333.7, 174.9], [395.7, 266.8], [408.3, 282.1], [426.1, 294.4], [430.6, 302.1], [433, 320.2]],
        label: { x: 145, y: 149 },
        connectorLabel: "cusmade A",
        defaultLengthMm: 1000,
        standardLengthsMm: [500, 800, 1000, 1500],
      },
      power: {
        points: [[385.9, 268.5], [417.3, 294.9], [422.4, 303.1], [425.8, 317]],
        label: { x: 327, y: 360 },
        connectorLabel: "cusmade B",
        defaultLengthMm: 300,
        standardLengthsMm: [200, 300, 500, 800],
      },
      sensor: {
        points: [[519.6, 297.3], [462, 292.7], [456.2, 294.6], [439.9, 318.4], [432.1, 324.6]],
        label: { x: 465, y: 195 },
        connectorLabel: "cusmade C",
        defaultLengthMm: 700,
        standardLengthsMm: [400, 700, 1000, 1400],
      },
    },
  },
}

// Known product cut-outs exported from Figma, keyed by role and normalised model.
const MODEL_ASSETS: Record<ProductRole, Record<string, string>> = {
  motor: { M7100: `${A}/shared/m7100.png`, M7600: `${A}/shared/m7600.png` },
  battery: { BN21S: `${A}/shared/bn21s.png` },
  display: { DF130: `${A}/shared/df130.png`, DF232: `${A}/shared/df232.png` },
  speedSensor: { S7: `${A}/shared/s7.png`, S13: `${A}/shared/s13.png` },
}

export const normalizeModel = (model: string) => model.toUpperCase().replace(/[^A-Z0-9]/g, "")

export function assetForModel(role: ProductRole, model: string | null | undefined): string | null {
  if (!model) return null
  return MODEL_ASSETS[role][normalizeModel(model)] ?? null
}

/** Rider profiles that map to the mountain frame; everything else uses the city frame. */
export function templateIdForCategory(category: string | null | undefined): BikeTemplateId {
  return category === "MTB" ? "mountain" : "city"
}

export function formatLengthCm(mm: number): string {
  const cm = mm / 10
  return `${Number.isInteger(cm) ? cm : cm.toFixed(1)}cm`
}

export function validateCustomLengthMm(mm: number): string | null {
  const { min, max } = CUSTOM_LENGTH_LIMITS_MM
  if (!Number.isFinite(mm)) return "Enter a length in millimetres."
  if (!Number.isInteger(mm)) return "Use a whole number of millimetres."
  if (mm < min) return `Minimum custom length is ${min} mm.`
  if (mm > max) return `Maximum custom length is ${max} mm.`
  return null
}
