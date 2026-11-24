import type { AnandaConfig } from "./ananda-store"
import { aAccessories } from "./ananda-data"
import { cableValue, HMI_CONNECTION } from "./cable-connections"

export const isM7200 = (s: Pick<AnandaConfig, "driveType">, motor: { model: string } | null) =>
  s.driveType === "mid" && motor?.model.trim().toUpperCase() === "M7200"

export interface HarnessSlot {
  id: string
  label: string
  x: number
  y: number
  width: number
  model: string | null
  lengthMm?: number | null
  lengthNote?: string
  editable?: boolean
  lengthAnchor?: [number, number]
}

type Product = { model: string } | null
export function resolveM7200Harness(s: AnandaConfig, products: {
  display: Product; battery: Product; speedSensor: ({ model: string; cable_length_mm: number | null } | null)
}): HarnessSlot[] {
  const component = (key: string, product: Product): string | null => {
    if (s.skippedItems.includes(key)) return null
    if (key in s.thirdPartySuppliers) return `3rd party: ${s.thirdPartySuppliers[key].trim() || "supplier unspecified"}`
    return product?.model ?? null
  }
  const accessory = (id: string) => s.accessoryIds.includes(id) ? aAccessories.find(a => a.id === id)?.name ?? null : null
  const display = component("displayId", products.display)
  const hmiLengthM = display && !("displayId" in s.thirdPartySuppliers) ? cableValue(s.cableLengths, HMI_CONNECTION) : undefined
  const battery = component("batteryId", products.battery)
  const sensor = component("speedSensorId", products.speedSensor)
  return [
    { id: "hmi", label: "P2 Display / HMI", x: 5604, y: 277, width: 1250, model: display, editable: !!display && !("displayId" in s.thirdPartySuppliers), lengthMm: hmiLengthM == null ? null : Math.round(hmiLengthM * 1000), lengthNote: "Length unspecified" },
    // There are no compatible brake, gear-sensor or IoT selections in the current schema.
    { id: "brake1", label: "P2 Brake 1", x: 5604, y: 532, width: 1250, model: null },
    { id: "brake2", label: "P2 Brake 2", x: 5601, y: 751, width: 1250, model: null },
    { id: "frontLight", label: "P2 Front Light", x: 5601, y: 970, width: 1250, model: accessory("ACC-FL"), lengthNote: "Length mapping pending" },
    { id: "rearLight", label: "P4 Rear Light / turn signals", x: 5493, y: 1938, width: 1070, model: accessory("ACC-RL"), lengthNote: "Length mapping pending", lengthAnchor: [3328, 1718] },
    { id: "speedSensor", label: "P5 Speed Sensor", x: 5027, y: 3158, width: 1830, model: sensor, lengthMm: sensor && !("speedSensorId" in s.thirdPartySuppliers) ? products.speedSensor?.cable_length_mm ?? null : null, lengthNote: "Lead unspecified · read-only", lengthAnchor: [3218, 3088] },
    // ACC-TH01 is explicitly hub-only. ACC-THO has no verified M7200 compatibility.
    { id: "throttle", label: "P3 Throttle", x: 5499, y: 4236, width: 1350, model: null },
    { id: "gear", label: "P3 Gear Shift Sensor", x: 5499, y: 4655, width: 1350, model: null },
    { id: "iot", label: "P3 IoT", x: 5499, y: 5081, width: 1350, model: null },
    { id: "battery", label: "P1 Battery / battery interface", x: 5333, y: 6044, width: 1680, model: battery, lengthNote: "Docking interface · no cable" },
    { id: "cage", label: "P1 Battery mount / cage", x: 5330, y: 6854, width: 1680, model: battery && !("batteryId" in s.thirdPartySuppliers) ? `${battery} Cage` : null, lengthNote: "Length mapping pending", lengthAnchor: [3368, 6576] },
  ]
}

export function harnessLengthLabel(slot: HarnessSlot): string | null {
  if (!slot.model) return null
  return slot.lengthMm != null ? `${slot.lengthMm} mm${slot.id === "speedSensor" ? " · fixed" : ""}` : slot.lengthNote ?? "Length mapping pending"
}
