// Ananda E-Drive System Configurator — System Diagram (bicycle overlay) data
//
// Fixed component coordinates and cable specifications for the photographic
// System Diagram shown on the mid-drive path of Step 9. All coordinates live
// in the diagram's own 0–1000 × 0–610 SVG coordinate system (never browser
// pixels), and are calibrated against the M7100 reference photo at
// /public/images/ananda-m7100-bicycle.png — do not change them without
// re-checking alignment against that image.

export type ComponentKey = "remote" | "display" | "accessory" | "battery" | "speedSensor" | "motor"

export const componentPoints: Record<ComponentKey, { x: number; y: number }> = {
  remote: { x: 400, y: 116 },
  display: { x: 360, y: 101 },
  accessory: { x: 310, y: 246 },
  battery: { x: 463, y: 333 },
  speedSensor: { x: 651, y: 362 },
  motor: { x: 521, y: 395 },
}

// Label anchors live in the margins around the bicycle photo (the photo
// occupies x:120–880, y:52–558) so callout text never overlaps or clips the
// image, and follows the placement approved for the reference diagram:
// remote upper-left, display upper-right, accessory harness left, battery
// and speed sensor right, motor lower-right.
export const calloutAnchors: Record<ComponentKey, { x: number; y: number; anchor: "start" | "end" }> = {
  remote: { x: 18, y: 22, anchor: "start" },
  display: { x: 982, y: 22, anchor: "end" },
  accessory: { x: 112, y: 236, anchor: "end" },
  battery: { x: 892, y: 296, anchor: "start" },
  speedSensor: { x: 892, y: 400, anchor: "start" },
  motor: { x: 760, y: 566, anchor: "start" },
}

export interface CableSpec {
  id: string
  connection: string
  connector: string
  pins: number
  cableType: string
  defaultLength: number
  /** CSS color value (theme token) used for both the diagram line and table swatch. */
  color: string
  /** SVG stroke-dasharray; undefined means a solid line. Combined with color so
   *  identification never depends on color alone. */
  dashArray: string | undefined
  /** Fixed SVG path "d" attribute connecting the two exact component coordinates. */
  path: string
}

export const CABLE_SPECS: CableSpec[] = [
  {
    id: "battery-motor",
    connection: "Battery → Motor unit",
    connector: "XT60",
    pins: 2,
    cableType: "Power cable",
    defaultLength: 0.5,
    color: "var(--chart-1)",
    dashArray: undefined,
    path: "M463,333 C480,352 500,375 521,395",
  },
  {
    id: "speed-motor",
    connection: "Speed sensor → Motor unit",
    connector: "SM-3P",
    pins: 3,
    cableType: "Sensor cable",
    defaultLength: 1.0,
    color: "var(--chart-2)",
    dashArray: "7 4",
    path: "M651,362 C610,372 560,385 521,395",
  },
  {
    id: "display-motor",
    connection: "Display → Motor unit",
    connector: "Higo 5-pin",
    pins: 5,
    cableType: "HMI cable",
    defaultLength: 1.0,
    color: "var(--chart-3)",
    dashArray: "9 3 2 3",
    path: "M360,101 C380,220 440,330 521,395",
  },
  {
    id: "remote-display",
    connection: "Remote → Display",
    connector: "JST-SM 3-pin",
    pins: 3,
    cableType: "Remote cable",
    defaultLength: 0.5,
    color: "var(--chart-4)",
    dashArray: "3 3",
    path: "M400,116 C388,111 374,105 360,101",
  },
  {
    id: "accessory-motor",
    connection: "Accessories → Motor unit",
    connector: "Higo 6-pin",
    pins: 6,
    cableType: "Accessory cable",
    defaultLength: 2.0,
    color: "var(--chart-5)",
    dashArray: "12 4",
    path: "M310,246 C360,300 440,360 521,395",
  },
]
