"use client"

import { useAnandaStore } from "@/lib/ananda-store"
import { useMotors, useDisplays, useBatteries, resolveImageUrl } from "@/lib/ananda-packages"
import { aSensors, aAccessories, aRemotes } from "@/lib/ananda-data"
import { useCableCatalog, assignCable } from "@/components/ananda/cable-spec-controls"
import { CABLE_SPECS, type CableSpec } from "@/lib/ananda-system-diagram"
import type {
  AccessoryRow,
  ConnectionDirection,
  SystemConnection,
  SystemDiagramData,
  SystemProductNode,
} from "@/lib/ananda-system-topology"

function cableSpecFor(id: string): CableSpec {
  const spec = CABLE_SPECS.find((c) => c.id === id)
  if (!spec) throw new Error(`Missing cable spec: ${id}`)
  return spec
}

const CONNECTION_DEFS: { specId: string; from: string; direction: ConnectionDirection }[] = [
  { specId: "battery-motor", from: "battery", direction: "bottom" },
  { specId: "speed-motor", from: "speedSensor", direction: "right" },
  { specId: "display-motor", from: "hmi", direction: "top" },
  { specId: "accessory-motor", from: "accessories", direction: "left" },
]

/**
 * Assembles real configuration data for the mid-drive radial system
 * diagram from the Ananda store, Supabase-backed motor/display/battery
 * hooks, and the shared cable catalog / `CABLE_SPECS` connection metadata.
 * Speed sensor and accessories fall back to the static local catalogs
 * (`ananda-data.ts`) since they aren't Supabase-backed yet — matching the
 * existing fallback pattern already used by the bicycle-overlay diagram.
 */
export function useMidDriveSystemDiagramData(): SystemDiagramData {
  const s = useAnandaStore()
  const { motors } = useMotors()
  const { displays } = useDisplays()
  const { batteries } = useBatteries()
  const { cables } = useCableCatalog()

  const motor = motors.find((m) => m.id === s.motorId) ?? null
  const display = displays.find((d) => d.id === s.displayId) ?? null
  const battery = batteries.find((b) => b.id === s.batteryId) ?? null
  const remote = aRemotes.find((r) => r.id === s.remoteId) ?? null
  const speedSensorSkipped = s.skippedItems.includes("speedSensorId")
  const batterySkipped = s.skippedItems.includes("batteryId")
  const displaySkipped = s.skippedItems.includes("displayId")
  const speedSensorFixture = aSensors.find((sensor) => sensor.sensorType === "speed") ?? null
  const selectedAccessories = aAccessories.filter((a) => s.accessoryIds.includes(a.id))

  const motorNode: SystemProductNode = {
    key: "motor",
    reference: "P1",
    category: "Motor Unit",
    model: motor?.model ?? "Not selected",
    specs: motor
      ? [
          { label: "Type", value: motor.motor_type === "hub" ? "Hub" : "Mid-Drive" },
          { label: "Torque", value: motor.torque_nm != null ? `${motor.torque_nm} Nm` : "—" },
          { label: "Power", value: motor.rated_power_w != null ? `${motor.rated_power_w} W` : "—" },
        ]
      : [{ label: "Status", value: "Awaiting selection" }],
    imageUrl: motor ? resolveImageUrl(motor.image_url, motor.image_path) : null,
    isCentral: true,
    status: motor ? "ok" : "missing",
  }

  const hmiNode: SystemProductNode = {
    key: "hmi",
    reference: "P2",
    category: "Display",
    model: display?.model ?? (displaySkipped ? "Not needed" : "Not selected"),
    specs: [
      { label: "Connector", value: display?.connection_type ?? "5-pin" },
      { label: "Remote", value: remote ? remote.name : "R1 / R2 / R3" },
    ],
    imageUrl: display ? resolveImageUrl(display.image_url, display.image_path) : null,
    status: display || displaySkipped ? "ok" : "missing",
  }

  const speedSensorNode: SystemProductNode = {
    key: "speedSensor",
    reference: "P3",
    category: "Speed Sensor",
    model: speedSensorSkipped ? "Not needed" : s.speedSensorId ? s.speedSensorId : (speedSensorFixture?.name ?? "Not selected"),
    specs: [{ label: "Connector", value: "SM-3P" }],
    imageUrl: null,
    status: speedSensorSkipped || s.speedSensorId ? "ok" : "missing",
  }

  const batteryNode: SystemProductNode = {
    key: "battery",
    reference: "P4",
    category: "Battery",
    model: battery?.model ?? (batterySkipped ? "Not needed" : "Not selected"),
    specs: battery
      ? [
          { label: "Voltage", value: `${battery.voltage_v} V` },
          { label: "Capacity", value: battery.capacity_wh != null ? `${battery.capacity_wh} Wh` : "—" },
        ]
      : [{ label: "Status", value: "Awaiting selection" }],
    imageUrl: battery ? resolveImageUrl(battery.image_url, battery.image_path) : null,
    status: battery || batterySkipped ? "ok" : "missing",
  }

  const accessoryRows: AccessoryRow[] = selectedAccessories.map((accessory, index) => ({
    id: accessory.id,
    reference: `A${index + 1}`,
    name: accessory.name,
    model: accessory.id,
    quantity: 1,
    imageUrl: null,
    harnessReference: "W04",
    status: "ok",
  }))

  const accessoriesNode: SystemProductNode = {
    key: "accessories",
    reference: "P5",
    category: "Accessories",
    model:
      selectedAccessories.length > 0 ? `${selectedAccessories.length} item${selectedAccessories.length === 1 ? "" : "s"}` : "None selected",
    specs: [{ label: "Harness", value: "Higo 6-pin" }],
    imageUrl: null,
    status: "ok",
  }

  const nodes: Record<string, SystemProductNode> = {
    motor: motorNode,
    hmi: hmiNode,
    speedSensor: speedSensorNode,
    battery: batteryNode,
    accessories: accessoriesNode,
  }

  const connections: SystemConnection[] = CONNECTION_DEFS.map((def, index) => {
    const spec = cableSpecFor(def.specId)
    const assignedCable = assignCable(cables, index)
    const storedLengthM = s.cableLengths[spec.connection]
    const lengthMm = storedLengthM != null ? Math.round(storedLengthM * 1000) : Math.round(spec.defaultLength * 1000)
    return {
      id: spec.id,
      reference: `W0${index + 1}`,
      from: def.from,
      to: "motor",
      direction: def.direction,
      cableModel: assignedCable?.name ?? spec.cableType,
      connectorLabel: `${spec.connector} · ${spec.pins}-pin`,
      lengthMm,
      colorKey: spec.color,
      compatibilityStatus: storedLengthM != null ? "compatible" : "warning",
      statusNote: storedLengthM != null ? undefined : "Length not yet selected — showing catalog default",
    }
  })

  const missing: string[] = []
  if (motorNode.status === "missing") missing.push("motor")
  if (hmiNode.status === "missing") missing.push("display")
  if (batteryNode.status === "missing") missing.push("battery")
  if (speedSensorNode.status === "missing") missing.push("speed sensor")

  const hasIncompatibleConnection = connections.some((c) => c.compatibilityStatus === "incompatible")
  const hasWarningConnection = connections.some((c) => c.compatibilityStatus === "warning")

  let status: SystemDiagramData["status"] = "complete"
  let statusMessage = "Connection check passed"
  if (missing.length > 0) {
    status = "warning"
    statusMessage = `Select a ${missing[0]} to complete the system`
  } else if (hasIncompatibleConnection) {
    status = "incompatible"
    statusMessage = "Incompatible connection detected"
  } else if (hasWarningConnection) {
    status = "warning"
    statusMessage = "One or more cable lengths not yet selected"
  }

  return {
    driveType: "mid-drive",
    nodes,
    connections,
    accessories: accessoryRows,
    status,
    statusMessage,
    revisionLabel: `SCHEMATIC · MID-${motor?.model ?? "M7100"}-${s.voltagePlatform ?? 48}V · REV 01`,
  }
}
