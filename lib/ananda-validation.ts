import type { AnandaConfig } from "./ananda-store"
import { packageItemKeys } from "./ananda-store"

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

const isItemSatisfied = (state: AnandaConfig, key: keyof AnandaConfig) =>
  Boolean(state[key]) || state.skippedItems.includes(key as string)

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
      if (!s.wheelSize) items.push({ message: "Select a wheel size.", targetId: "field-wheelSize" })
      else if (!s.tyreCircumferenceMm) items.push({ message: "Enter or look up a tyre circumference.", targetId: "field-wheelSize" })
      break
    }
    case 2: {
      if (!s.productTargets.ambition.positioning) items.push({ message: "Choose a market positioning for Product Ambition.", targetId: "field-productTargets" })
      else if (!s.productTargets.ambition.costPriority) items.push({ message: "Choose a cost priority for Product Ambition.", targetId: "field-productTargets" })
      else if (s.productTargets.weight.targetKg == null && s.productTargets.weight.maxKg == null) items.push({ message: "Set a weight target or select a rider profile.", targetId: "field-weightTarget" })
      else if (s.productTargets.performance.rangeTargetKm == null) items.push({ message: "Set a range target or select a rider profile.", targetId: "field-rangeTarget" })
      break
    }
    case 3: {
      if (!s.selectedSolutionId) items.push({ message: "Select one of the recommended solutions.", targetId: "field-solutions" })
      break
    }
    case 4: {
      for (const key of packageItemKeys(s.driveType)) {
        if (!isItemSatisfied(s, key)) {
          const label = CORE_COMPONENT_LABELS[key] ?? String(key)
          items.push({ message: `${label} still needs a selection or must be marked not needed.`, targetId: `config-${String(key)}` })
        }
      }
      break
    }
    case 5: {
      if (!s.drivetrainType) {
        items.push({ message: "Select a drivetrain type (chain or belt).", targetId: "field-drivetrainType" })
      } else if (!s.transmissionType) {
        items.push({ message: "Select a transmission type.", targetId: "field-transmissionType" })
      } else if (s.selectedComponentIds.length === 0) {
        items.push({ message: "Select the drivetrain components for this build.", targetId: "field-drivetrainComponents" })
      } else if (s.drivetrainErrors.length > 0) {
        items.push({ message: "Resolve the drivetrain compatibility errors before continuing.", targetId: "drivetrain-compatibility" })
      } else if (s.drivetrainWarnings.length > 0 && !s.warningsAcknowledged) {
        items.push({ message: "Acknowledge the compatibility warnings to continue.", targetId: "drivetrain-warnings-ack" })
      }
      break
    }
    default:
      break
  }

  return items
}
