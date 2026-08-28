"use client"

import type { AnandaConfig } from "@/lib/ananda-store"
import { CHARGERS, CHARGING_PORTS, type MotorRow, type BatteryRow, type HmiDisplayRow, type ControllerRow } from "@/lib/ananda-packages"

export type PackageModification = {
  key: string
  componentLabel: string
  recommendedLabel: string
  selectedLabel: string
}

type Catalogs = {
  motors: MotorRow[]
  batteries: BatteryRow[]
  displays: HmiDisplayRow[]
  controllers: ControllerRow[]
}

const NOT_NEEDED = "Not needed"

function labelFor(id: string | null, lookup: (id: string) => string | undefined): string {
  if (!id) return NOT_NEEDED
  return lookup(id) ?? NOT_NEEDED
}

// Diffs the Step 5 package-component selections against the recommended
// (Step 4 "Best Match") baseline. Only components that actually have a
// recommendation in packageBaseline are compared — components with no
// catalogue (torque/speed sensors) are intentionally excluded since the spec
// forbids inventing a recommendation when none exists.
export function getPackageModifications(state: AnandaConfig, catalogs: Catalogs): PackageModification[] {
  const baseline = state.packageBaseline ?? {}
  const tracked: { key: keyof AnandaConfig; label: string; lookup: (id: string) => string | undefined }[] = [
    { key: "motorId", label: "Motor", lookup: (id) => catalogs.motors.find((m) => m.id === id)?.model },
    { key: "batteryId", label: "Battery", lookup: (id) => catalogs.batteries.find((b) => b.id === id)?.model },
    { key: "displayId", label: "Display", lookup: (id) => catalogs.displays.find((d) => d.id === id)?.model },
    { key: "chargerId", label: "Charger", lookup: (id) => CHARGERS.find((c) => c.id === id)?.model },
    { key: "chargingPortId", label: "Charging Port", lookup: (id) => CHARGING_PORTS.find((p) => p.id === id)?.model },
  ]
  if (state.driveType === "hub") {
    tracked.push({ key: "controllerId", label: "Controller", lookup: (id) => catalogs.controllers.find((c) => c.id === id)?.model })
  }

  const modifications: PackageModification[] = []
  for (const t of tracked) {
    if (!(t.key in baseline)) continue
    const recommendedId = (baseline[t.key as string] ?? null) as string | null
    const selectedId = (state[t.key] ?? null) as string | null
    if (recommendedId === selectedId) continue
    modifications.push({
      key: t.key as string,
      componentLabel: t.label,
      recommendedLabel: labelFor(recommendedId, t.lookup),
      selectedLabel: labelFor(selectedId, t.lookup),
    })
  }
  return modifications
}
