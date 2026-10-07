import type { AnandaConfig } from "./ananda-store"
import { packageItemKeys, isItemSatisfied, hasThirdPartySupplier, chainringMismatch } from "./ananda-store"

export interface IncompleteItem {
  message: string
  targetId: string | null
}

const CORE_COMPONENT_LABELS: Partial<Record<keyof AnandaConfig, string>> = {
  motorId: "Motor",
  controllerId: "Controller",
  torqueSensorId: "Torque Sensor",
  speedSensorId: "Speed Sensor",
  displayId: "Display (HMI)",
  batteryId: "Battery",
  chargerId: "Charger",
  chargingPortId: "Charging Port",
}

/**
 * Returns the list of unmet requirements for a given step (matching the
 * `content` / `complete` array order in AnandaConfigurator), each paired with
 * the DOM id of the section that should be scrolled into view so the user can
 * fix it.
 */
export function getIncompleteItems(stepIndex: number, s: AnandaConfig): IncompleteItem[] {
  const items: IncompleteItem[] = []

  switch (stepIndex) {
    case 0: {
      if (!s.sellRegion) items.push({ message: "Select a sell region / market.", targetId: "field-sellRegion" })
      else if (!s.regulation) items.push({ message: "Select a regulation for the chosen market.", targetId: "field-regulation" })
      break
    }
    case 1: {
      if (!s.bikeCategory) items.push({ message: "Choose a bike category.", targetId: "field-bikeCategory" })
      else if (!s.wheelSize) items.push({ message: "Select a wheel size.", targetId: "field-wheelSize" })
      else if (!s.tyreCircumferenceMm) items.push({ message: "Enter or look up a tyre circumference.", targetId: "field-wheelSize" })
      break
    }
    case 2: {
      for (const key of packageItemKeys(s.driveType)) {
        if (isItemSatisfied(s, key)) continue
        const label = CORE_COMPONENT_LABELS[key] ?? String(key)
        if (hasThirdPartySupplier(s, key as string)) {
          items.push({ message: `Enter the 3rd party supplier name for ${label}.`, targetId: `config-${String(key)}` })
        } else {
          items.push({ message: `${label} still needs a selection or must be marked not needed.`, targetId: `config-${String(key)}` })
        }
      }
      break
    }
    case 3: {
      if (s.frontTeeth == null || s.frontTeeth <= 0) {
        items.push({ message: "Enter the front chainring teeth.", targetId: "front-chainring-teeth" })
      } else if (s.rearTeeth == null || s.rearTeeth <= 0) {
        items.push({ message: "Enter the smallest rear sprocket teeth.", targetId: "smallest-rear-teeth" })
      } else if (s.largestRearTeeth == null || s.largestRearTeeth <= 0) {
        items.push({ message: "Enter the largest rear sprocket teeth.", targetId: "largest-rear-teeth" })
      } else if (s.rearTeeth > s.largestRearTeeth) {
        items.push({ message: "The smallest rear sprocket cannot have more teeth than the largest.", targetId: "smallest-rear-teeth" })
      } else {
        const mismatch = chainringMismatch(s)
        if (mismatch) {
          items.push({
            message: `Front chainring (${mismatch.entered}T) must match the ${mismatch.expected}T chainring chosen under Bike Components.`,
            targetId: "front-chainring-teeth",
          })
        }
      }
      break
    }
    default:
      break
  }

  return items
}
