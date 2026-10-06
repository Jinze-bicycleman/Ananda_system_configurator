"use client"

import { useMemo } from "react"
import { useAnandaStore } from "@/lib/ananda-store"
import { CABLE_SPECS } from "@/lib/ananda-system-diagram"
import { useBatteries, useDisplays, useMotors, useSpeedSensors, resolveImageUrl } from "@/lib/ananda-packages"
import {
  BIKE_TEMPLATES,
  CABLE_META,
  CABLE_ORDER,
  assetForModel,
  normalizeModel,
  templateIdForCategory,
  type BikeTemplate,
  type CableKey,
  type CableMeta,
  type CablePlacement,
  type ProductRole,
} from "./templates"

export interface ResolvedProduct {
  role: ProductRole
  model: string
  src: string
  /** True when nothing is selected and the Figma reference product is shown instead. */
  isReference: boolean
}

export interface ResolvedCable {
  key: CableKey
  meta: CableMeta
  placement: CablePlacement
  lengthMm: number
  mode: "standard" | "custom"
  pins: number | null
  /** False when the component this cable belongs to is not part of the build. */
  visible: boolean
  hiddenReason: string | null
}

const ROLE_LABEL: Record<ProductRole, string> = {
  motor: "Motor",
  battery: "Battery",
  display: "Display",
  speedSensor: "Wheel speed sensor",
}

export function useBikeOverview() {
  const s = useAnandaStore()
  const { motors } = useMotors()
  const { batteries } = useBatteries()
  const { displays } = useDisplays()
  const { speedSensors } = useSpeedSensors()

  const template: BikeTemplate = BIKE_TEMPLATES[templateIdForCategory(s.bikeCategory)]

  return useMemo(() => {
    const motor = motors.find((m) => m.id === s.motorId) ?? null
    const battery = batteries.find((b) => b.id === s.batteryId) ?? null
    const display = displays.find((d) => d.id === s.displayId) ?? null
    const sensor =
      speedSensors.find((x) => x.id === s.speedSensorId || (s.speedSensorId && normalizeModel(x.model) === normalizeModel(s.speedSensorId))) ?? null
    const sensorModel = sensor?.model ?? s.speedSensorId ?? null

    const resolve = (
      role: ProductRole,
      model: string | null,
      remoteImage: string | null,
      skipKey: string,
    ): ResolvedProduct | null => {
      if (s.skippedItems.includes(skipKey)) return null
      const placement = template.products[role]
      if (!model) return { role, model: placement.defaultModel, src: placement.defaultSrc, isReference: true }
      return { role, model, src: assetForModel(role, model) ?? remoteImage ?? placement.defaultSrc, isReference: false }
    }

    const products: Record<ProductRole, ResolvedProduct | null> = {
      motor: resolve("motor", motor?.model ?? null, resolveImageUrl(motor?.image_url, motor?.image_path), "motorId"),
      battery: resolve("battery", battery?.model ?? null, resolveImageUrl(battery?.image_url, battery?.image_path), "batteryId"),
      display: resolve("display", display?.model ?? null, resolveImageUrl(display?.image_url, display?.image_path), "displayId"),
      speedSensor: resolve("speedSensor", sensorModel, null, "speedSensorId"),
    }

    const cables: ResolvedCable[] = CABLE_ORDER.map((key) => {
      const meta = CABLE_META[key]
      const placement = template.cables[key]
      const spec = CABLE_SPECS.find((c) => c.connection === meta.connection)
      const storedM = s.cableLengths[meta.connection]
      const lengthMm = storedM != null ? Math.round(storedM * 1000) : placement.defaultLengthMm
      const storedMode = s.cableLengthModes?.[meta.connection]
      const mode = storedMode ?? (placement.standardLengthsMm.includes(lengthMm) ? "standard" : "custom")
      const visible = products[meta.requires] !== null
      return {
        key,
        meta,
        placement,
        lengthMm,
        mode,
        pins: spec?.pins ?? null,
        visible,
        hiddenReason: visible ? null : `${ROLE_LABEL[meta.requires]} is marked as not needed`,
      }
    })

    return { template, products, cables, hasReferenceProducts: Object.values(products).some((p) => p?.isReference) }
  }, [template, s.motorId, s.batteryId, s.displayId, s.speedSensorId, s.skippedItems, s.cableLengths, s.cableLengthModes, motors, batteries, displays, speedSensors])
}
