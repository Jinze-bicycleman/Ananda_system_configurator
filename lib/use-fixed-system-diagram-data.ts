"use client"

import { useAnandaStore } from "@/lib/ananda-store"
import { useMotors, useDisplays, useBatteries, useSpeedSensors, resolveImageUrl, CHARGING_PORTS } from "@/lib/ananda-packages"
import { aAccessories, aRemotes } from "@/lib/ananda-data"
import { useCableCatalog, assignCable } from "@/components/ananda/cable-spec-controls"
import { connectionCableLengthOptionsFor, type ConnectionCableLengthOptionRow } from "@/lib/ananda-packages"
import type { ConnectionKey, FrameKey } from "@/lib/system-diagram-layout"

export type DiagramNodeStatus = "ok" | "missing"

export interface DiagramSpec {
  label: string
  value: string
}

export interface DiagramNode {
  category: string
  model: string
  specs: DiagramSpec[]
  imageUrl: string | null
  status: DiagramNodeStatus
}

export interface AccessoryItem {
  id: string
  name: string
  model: string
  quantity: number
  imageUrl: string | null
}

export interface DiagramConnectionData {
  key: ConnectionKey
  cableModel: string | null
  connectorLabel: string | null
  lengthMm: number | null
  editable: boolean
  active: boolean
  storeKey: string | null
  lengthOptions: ConnectionCableLengthOptionRow[]
  note?: string
}

export interface FixedDiagramData {
  nodes: Record<FrameKey, DiagramNode>
  accessories: AccessoryItem[]
  connections: Record<ConnectionKey, DiagramConnectionData>
  chargingPortEndpointConfigured: boolean
  statusMessage: string
}

const HMI_CONNECTION_KEY = "Display → Motor unit"
const ACCESSORIES_CONNECTION_KEY = "Accessories → Motor unit"
const CAGE_CONNECTION_KEY = "Battery cage → Motor unit"
const CHARGING_PORT_LEAD_KEY = "Charging port lead"

/**
 * The charging port's electrical connection point (battery / cage / motor)
 * is not modeled anywhere in the current data — no product row records it.
 * This helper is the single place that would resolve a real endpoint once
 * one exists; today it always returns null, and the diagram renders
 * "connection endpoint not configured" rather than guessing.
 */
function getChargingPortEndpoint(): FrameKey | null {
  return null
}

/**
 * Assembles the data model consumed by `FixedSystemDiagram` (Stage 7 mid-
 * drive "System Diagram" view) from the Ananda store, Supabase-backed
 * product hooks, and the shared connection-cable catalog. Distinct from
 * `useMidDriveSystemDiagramData`, which still backs the radial diagram.
 */
export function useFixedSystemDiagramData(): FixedDiagramData {
  const s = useAnandaStore()
  const { motors } = useMotors()
  const { displays } = useDisplays()
  const { batteries } = useBatteries()
  const { speedSensors } = useSpeedSensors()
  const { cables, options } = useCableCatalog()

  const motor = motors.find((m) => m.id === s.motorId) ?? null
  const display = displays.find((d) => d.id === s.displayId) ?? null
  const battery = batteries.find((b) => b.id === s.batteryId) ?? null
  const speedSensor = speedSensors.find((sensor) => sensor.id === s.speedSensorId) ?? null
  const chargingPort = CHARGING_PORTS.find((p) => p.id === s.chargingPortId) ?? null
  const remote = aRemotes.find((r) => r.id === s.remoteId) ?? null

  const speedSensorSkipped = s.skippedItems.includes("speedSensorId")
  const batterySkipped = s.skippedItems.includes("batteryId")
  const displaySkipped = s.skippedItems.includes("displayId")
  const selectedAccessories = aAccessories.filter((a) => s.accessoryIds.includes(a.id))

  const motorNode: DiagramNode = {
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
    status: motor ? "ok" : "missing",
  }

  const hmiNode: DiagramNode = {
    category: "Display (HMI)",
    model: display?.model ?? (displaySkipped ? "Not needed" : "Not selected"),
    specs: [
      { label: "Connector", value: display?.connection_type ?? "—" },
      { label: "Remote", value: remote ? remote.name : "—" },
    ],
    imageUrl: display ? resolveImageUrl(display.image_url, display.image_path) : null,
    status: display || displaySkipped ? "ok" : "missing",
  }

  const speedSensorNode: DiagramNode = {
    category: "Speed Sensor",
    model: speedSensorSkipped ? "Not needed" : speedSensor?.model ?? "Not selected",
    specs: speedSensor
      ? [
          { label: "Mounting", value: speedSensor.mounting_position ?? "—" },
          { label: "Connector", value: speedSensor.connector_type ?? "—" },
        ]
      : [{ label: "Status", value: speedSensorSkipped ? "Not needed" : "Awaiting selection" }],
    imageUrl: null,
    status: speedSensor || speedSensorSkipped ? "ok" : "missing",
  }

  const batteryNode: DiagramNode = {
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

  // The battery cage is not its own catalog entity — it's derived from the
  // selected battery (every battery mounts in a matching cage), so its
  // model mirrors the battery's model rather than being a separate product.
  const cageNode: DiagramNode = {
    category: "Battery Cage",
    model: battery ? `${battery.model} Cage` : batterySkipped ? "Not needed" : "Not selected",
    specs: battery ? [{ label: "Mount", value: "Frame-mounted docking cage" }] : [{ label: "Status", value: "Awaiting battery selection" }],
    imageUrl: null,
    status: battery || batterySkipped ? "ok" : "missing",
  }

  const chargingPortNode: DiagramNode = {
    category: "Charging Port",
    model: chargingPort?.model ?? "Not selected",
    specs: chargingPort ? [{ label: "Type", value: chargingPort.description }] : [{ label: "Status", value: "Awaiting selection" }],
    imageUrl: null,
    status: chargingPort ? "ok" : "missing",
  }

  const accessoriesNode: DiagramNode = {
    category: "Accessories",
    model:
      selectedAccessories.length > 0 ? `${selectedAccessories.length} item${selectedAccessories.length === 1 ? "" : "s"}` : "None selected",
    specs: [{ label: "Harness", value: "Higo 6-pin" }],
    imageUrl: null,
    status: "ok",
  }

  const accessories: AccessoryItem[] = selectedAccessories.map((a) => ({
    id: a.id,
    name: a.name,
    model: a.id,
    quantity: 1,
    imageUrl: null,
  }))

  const lengthOptionsFor = (index: number): ConnectionCableLengthOptionRow[] => {
    const cable = assignCable(cables, index)
    return cable ? connectionCableLengthOptionsFor(options, cable.id) : []
  }
  const cableModelFor = (index: number): string | null => assignCable(cables, index)?.name ?? null
  const connectorFor = (index: number): string | null => {
    const cable = assignCable(cables, index)
    return cable ? `${cable.connector_model} · ${cable.pin_count}-pin` : null
  }
  const storedLengthMm = (storeKey: string): number | null => {
    const storedM = s.cableLengths[storeKey]
    return storedM != null ? Math.round(storedM * 1000) : null
  }

  const chargingPortEndpoint = getChargingPortEndpoint()

  const connections: Record<ConnectionKey, DiagramConnectionData> = {
    hmi: {
      key: "hmi",
      cableModel: cableModelFor(0),
      connectorLabel: connectorFor(0),
      lengthMm: storedLengthMm(HMI_CONNECTION_KEY),
      editable: true,
      active: Boolean(display) && !displaySkipped,
      storeKey: HMI_CONNECTION_KEY,
      lengthOptions: lengthOptionsFor(0),
    },
    accessories: {
      key: "accessories",
      cableModel: cableModelFor(1),
      connectorLabel: connectorFor(1),
      lengthMm: storedLengthMm(ACCESSORIES_CONNECTION_KEY),
      editable: true,
      active: selectedAccessories.length > 0,
      storeKey: ACCESSORIES_CONNECTION_KEY,
      lengthOptions: lengthOptionsFor(1),
    },
    speedSensor: {
      key: "speedSensor",
      cableModel: speedSensor?.model ?? null,
      connectorLabel: speedSensor?.connector_type ?? null,
      lengthMm: speedSensor?.cable_length_mm ?? null,
      editable: false,
      active: Boolean(speedSensor) && !speedSensorSkipped,
      storeKey: null,
      lengthOptions: [],
      note: "Integrated lead — fixed to the selected sensor's connector and length.",
    },
    cageToMotor: {
      key: "cageToMotor",
      cableModel: cableModelFor(2),
      connectorLabel: connectorFor(2),
      lengthMm: storedLengthMm(CAGE_CONNECTION_KEY),
      editable: true,
      active: Boolean(battery) && !batterySkipped,
      storeKey: CAGE_CONNECTION_KEY,
      lengthOptions: lengthOptionsFor(2),
    },
    batteryDock: {
      key: "batteryDock",
      cableModel: null,
      connectorLabel: null,
      lengthMm: null,
      editable: false,
      active: Boolean(battery) && !batterySkipped,
      storeKey: null,
      lengthOptions: [],
      note: "Docked electrical interface · no cable",
    },
    chargingPortLead: {
      key: "chargingPortLead",
      cableModel: cableModelFor(3),
      connectorLabel: connectorFor(3),
      lengthMm: storedLengthMm(CHARGING_PORT_LEAD_KEY),
      editable: true,
      active: false,
      storeKey: CHARGING_PORT_LEAD_KEY,
      lengthOptions: lengthOptionsFor(3),
      note: "Connection endpoint not configured",
    },
  }

  const missing: string[] = []
  if (motorNode.status === "missing") missing.push("motor")
  if (hmiNode.status === "missing") missing.push("display")
  if (batteryNode.status === "missing") missing.push("battery")
  if (speedSensorNode.status === "missing") missing.push("speed sensor")
  if (chargingPortNode.status === "missing") missing.push("charging port")

  const statusMessage = missing.length > 0 ? `Select a ${missing[0]} to complete the system` : "Connection check passed"

  return {
    nodes: {
      hmi: hmiNode,
      accessories: accessoriesNode,
      motor: motorNode,
      speedSensor: speedSensorNode,
      battery: batteryNode,
      cage: cageNode,
      chargingPort: chargingPortNode,
    },
    accessories,
    connections,
    chargingPortEndpointConfigured: chargingPortEndpoint !== null,
    statusMessage,
  }
}
