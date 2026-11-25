import type { AnandaConfig } from "./ananda-store"
import { aAccessories } from "./ananda-data"
import { cableValue, HMI_CONNECTION } from "./cable-connections"

const SERIES_7000_MODELS = new Set(["M7100", "M7200", "M7600"])

export const supportsSeries7000Harness = (s: Pick<AnandaConfig, "driveType">, motor: { model: string } | null) =>
  s.driveType === "mid" && motor != null && SERIES_7000_MODELS.has(motor.model.trim().toUpperCase())

export interface HarnessSlot {
  id: string
  label: string
  x: number
  y: number
  width: number
  model: string | null
  catalogLengthMm?: number | null
  lengthMm?: number | null
  lengthNote?: string
  editable?: boolean
  lengthAnchor?: [number, number]
}

type Product = { model: string } | null
export function resolveSeries7000Harness(s: AnandaConfig, products: {
  display: Product; battery: Product; speedSensor: ({ model: string; cable_length_mm: number | null } | null); chargingPort?: Product
}): HarnessSlot[] {
  const component = (key: string, product: Product): string | null => {
    if (s.skippedItems.includes(key)) return null
    if (key in s.thirdPartySuppliers) return `3rd party: ${s.thirdPartySuppliers[key].trim() || "supplier unspecified"}`
    return product?.model ?? null
  }
  const accessory = (id: string) => s.accessoryIds.includes(id) ? aAccessories.find(a => a.id === id)?.name ?? null : null
  const throttle = aAccessories.find(a => a.category === "throttle" && s.accessoryIds.includes(a.id))?.name ?? null
  const display = component("displayId", products.display)
  const hmiLengthM = display && !("displayId" in s.thirdPartySuppliers) ? cableValue(s.cableLengths, HMI_CONNECTION) : undefined
  const battery = component("batteryId", products.battery)
  const chargingPort = component("chargingPortId", products.chargingPort ?? null)
  const sensor = component("speedSensorId", products.speedSensor)
  const sensorCatalogMm = sensor && !("speedSensorId" in s.thirdPartySuppliers) ? products.speedSensor?.cable_length_mm ?? null : null
  const selectedLength = (connection: string) => {
    const value = cableValue(s.cableLengths, connection)
    return value == null ? null : Math.round(value * 1000)
  }
  return [
    { id: "hmi", label: "P2 Display / HMI", x: 5604, y: 277, width: 1250, model: display, editable: !!display && !("displayId" in s.thirdPartySuppliers), lengthMm: hmiLengthM == null ? null : Math.round(hmiLengthM * 1000), lengthNote: "Length unspecified" },
    // There are no compatible brake, gear-sensor or IoT selections in the current schema.
    { id: "brake1", label: "P2 Brake 1", x: 5604, y: 532, width: 1250, model: null },
    { id: "brake2", label: "P2 Brake 2", x: 5601, y: 751, width: 1250, model: null },
    { id: "frontLight", label: "P2 Front Light", x: 5601, y: 970, width: 1250, model: accessory("ACC-FL"), lengthNote: "Length mapping pending" },
    { id: "rearLight", label: "P4 Rear Light / turn signals", x: 5493, y: 1938, width: 1070, model: accessory("ACC-RL"), lengthMm: selectedLength("P4 Rear light harness → Motor unit"), lengthNote: "Length unspecified", lengthAnchor: [3328, 1718] },
    { id: "speedSensor", label: "P5 Speed Sensor", x: 5027, y: 3158, width: 1830, model: sensor, catalogLengthMm: sensorCatalogMm, lengthMm: selectedLength("Speed sensor → Motor unit") ?? sensorCatalogMm, lengthNote: "Length unspecified", lengthAnchor: [3218, 3088] },
    { id: "throttle", label: "P3 Throttle", x: 5499, y: 4236, width: 1350, model: throttle },
    { id: "gear", label: "P3 Gear Shift Sensor", x: 5499, y: 4655, width: 1350, model: null },
    { id: "iot", label: "P3 IoT", x: 5499, y: 5081, width: 1350, model: null },
    { id: "battery", label: "P1 Battery / battery interface", x: 5333, y: 6044, width: 1680, model: battery, lengthNote: "Docking interface · no cable" },
    { id: "cage", label: "P1 Battery mount / cage", x: 5330, y: 6854, width: 1680, model: chargingPort, lengthMm: selectedLength("Battery cage → Motor unit"), lengthNote: "Length unspecified", lengthAnchor: [3368, 6576] },
  ]
}

export function harnessLengthLabel(slot: HarnessSlot): string | null {
  if (!slot.model) return null
  return slot.lengthMm != null ? `${slot.lengthMm} mm` : slot.lengthNote ?? "Length mapping pending"
}

/** Independent section specifications, editable even before a component is chosen. */
export const HARNESS_SECTION_DEFINITIONS = [
  { id: "hmi", label: "P2 HMI / light / brake cable", connection: HMI_CONNECTION, x: 3420, y: 235 },
  { id: "rearLight", label: "P4 Rear light cable", connection: "P4 Rear light harness → Motor unit", x: 3340, y: 1655 },
  { id: "speedSensor", label: "P5 Speed sensor cable", connection: "Speed sensor → Motor unit", x: 3235, y: 2995 },
  { id: "controls", label: "P3 Throttle / gear / IoT cable", connection: "P3 Control harness → Motor unit", x: 3370, y: 4300 },
  { id: "power", label: "P1 Battery harness cable", connection: "Battery cage → Motor unit", x: 3345, y: 6650 },
] as const

export interface HarnessCableSection {
  id: string
  label: string
  connection: string
  x: number
  y: number
  lengthMm: number | null
  catalogLengthMm: number | null
}

export function resolveHarnessCableSections(s: AnandaConfig, slots: HarnessSlot[]): HarnessCableSection[] {
  return HARNESS_SECTION_DEFINITIONS.map(section => {
    const saved = cableValue(s.cableLengths, section.connection)
    const sensor = slots.find(slot => slot.id === "speedSensor")
    const catalogLengthMm = section.id === "speedSensor" && sensor?.model ? sensor.catalogLengthMm ?? null : null
    return { ...section, lengthMm: saved == null ? catalogLengthMm : Math.round(saved * 1000), catalogLengthMm }
  })
}
