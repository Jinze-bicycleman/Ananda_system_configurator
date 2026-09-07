// Ananda E-Drive System Configurator — Radial System Diagram topology
//
// Framework-agnostic types and static layout definitions for the
// "engineering" system diagram (center/top/right/bottom/left radial
// layout). Kept separate from the photographic bicycle-overlay diagram
// (`ananda-system-diagram.ts`), which this file does not replace.

export const systemFeatures = {
  midDriveEnabled: true,
  // Hub-motor topology is fully modeled below (types, layout, fixture data)
  // per spec, but is not wired into any user-reachable page yet.
  hubMotorEnabled: false,
}

export type DriveType = "mid-drive" | "hub-motor"

export type NodeStatus = "ok" | "missing"

export interface SystemProductNode {
  key: string
  reference: string
  category: string
  model: string
  specs: { label: string; value: string }[]
  imageUrl: string | null
  isCentral?: boolean
  status: NodeStatus
}

export type ConnectionDirection = "top" | "right" | "bottom" | "left"
export type CompatibilityStatus = "compatible" | "warning" | "incompatible"

export interface SystemConnection {
  id: string
  reference: string
  from: string
  to: string
  /** Position of the non-central endpoint relative to the central node. */
  direction: ConnectionDirection
  cableModel: string
  connectorLabel: string
  lengthMm: number
  /** CSS color value (theme token) — the line's color; the reference label
   *  is always shown too, so identification never depends on color alone. */
  colorKey: string
  compatibilityStatus: CompatibilityStatus
  statusNote?: string
}

export interface AccessoryRow {
  id: string
  reference: string
  name: string
  model: string
  quantity: number
  imageUrl: string | null
  harnessReference: string
  status: NodeStatus
}

export type DiagramStatus = "complete" | "warning" | "incompatible"

export interface SystemDiagramData {
  driveType: DriveType
  nodes: Record<string, SystemProductNode>
  connections: SystemConnection[]
  accessories: AccessoryRow[]
  status: DiagramStatus
  statusMessage: string
  revisionLabel: string
}

export type TopologySlotKey = "center" | "top" | "right" | "bottom" | "left"

export interface TopologyDefinition {
  label: string
  slots: Record<TopologySlotKey, string | string[]>
}

export const topologyDefinitions: Record<DriveType, TopologyDefinition> = {
  "mid-drive": {
    label: "Mid-Drive Topology",
    slots: { center: "motor", top: "hmi", right: "speedSensor", bottom: "battery", left: "accessories" },
  },
  "hub-motor": {
    label: "Hub-Motor Topology",
    slots: {
      center: "controller",
      top: "hmi",
      right: ["speedSensor", "torqueSensor"],
      bottom: ["motor", "battery"],
      left: "accessories",
    },
  },
}

/** `≥1000` mm formats as meters (e.g. "1.5 m"), otherwise as centimeters (e.g. "50 cm"). */
export function formatCableLength(lengthMm: number): string {
  if (lengthMm >= 1000) {
    const meters = lengthMm / 1000
    const formatted = Number.isInteger(meters) ? meters.toFixed(0) : meters.toFixed(1)
    return `${formatted} m`
  }
  const cm = lengthMm / 10
  const formatted = Number.isInteger(cm) ? cm.toFixed(0) : cm.toFixed(1)
  return `${formatted} cm`
}

/**
 * Demo fixture data for the hub-motor topology, so the reusable diagram
 * component can be type-checked and dev-rendered without real hub-motor
 * data. Not imported by any production page — `systemFeatures.hubMotorEnabled`
 * gates any future real usage.
 */
export function buildHubMotorFixtureData(): SystemDiagramData {
  const nodes: Record<string, SystemProductNode> = {
    controller: {
      key: "controller",
      reference: "P1",
      category: "Controller",
      model: "C3 Controller",
      specs: [{ label: "Current", value: "25 A" }],
      imageUrl: null,
      isCentral: true,
      status: "ok",
    },
    hmi: {
      key: "hmi",
      reference: "P2",
      category: "Display",
      model: "D18 Display",
      specs: [{ label: "Connector", value: "5-pin" }],
      imageUrl: null,
      status: "ok",
    },
    speedSensor: {
      key: "speedSensor",
      reference: "P3",
      category: "Speed Sensor",
      model: "SS1",
      specs: [{ label: "Connector", value: "SM-3P" }],
      imageUrl: null,
      status: "ok",
    },
    torqueSensor: {
      key: "torqueSensor",
      reference: "P4",
      category: "Torque Sensor",
      model: "TS1",
      specs: [{ label: "Connector", value: "SM-5P" }],
      imageUrl: null,
      status: "ok",
    },
    motor: {
      key: "motor",
      reference: "P5",
      category: "Motor Unit",
      model: "R900 Rear Hub",
      specs: [{ label: "Torque", value: "45 Nm" }],
      imageUrl: null,
      status: "ok",
    },
    battery: {
      key: "battery",
      reference: "P6",
      category: "Battery",
      model: "48V 720Wh",
      specs: [{ label: "Voltage", value: "48 V" }],
      imageUrl: null,
      status: "ok",
    },
    accessories: {
      key: "accessories",
      reference: "P7",
      category: "Accessories",
      model: "1 item",
      specs: [{ label: "Harness", value: "Higo 6-pin" }],
      imageUrl: null,
      status: "ok",
    },
  }

  const connections: SystemConnection[] = [
    {
      id: "hmi-controller",
      reference: "W01",
      from: "hmi",
      to: "controller",
      direction: "top",
      cableModel: "Cable A",
      connectorLabel: "Higo 5-pin",
      lengthMm: 1000,
      colorKey: "var(--chart-1)",
      compatibilityStatus: "compatible",
    },
    {
      id: "speed-controller",
      reference: "W02",
      from: "speedSensor",
      to: "controller",
      direction: "right",
      cableModel: "Cable B",
      connectorLabel: "SM-3P",
      lengthMm: 1000,
      colorKey: "var(--chart-2)",
      compatibilityStatus: "compatible",
    },
    {
      id: "torque-controller",
      reference: "W03",
      from: "torqueSensor",
      to: "controller",
      direction: "right",
      cableModel: "Cable B",
      connectorLabel: "SM-5P",
      lengthMm: 1200,
      colorKey: "var(--chart-3)",
      compatibilityStatus: "compatible",
    },
    {
      id: "motor-controller",
      reference: "W04",
      from: "motor",
      to: "controller",
      direction: "bottom",
      cableModel: "Cable C",
      connectorLabel: "Higo 9-pin",
      lengthMm: 1000,
      colorKey: "var(--chart-4)",
      compatibilityStatus: "compatible",
    },
    {
      id: "battery-controller",
      reference: "W05",
      from: "battery",
      to: "controller",
      direction: "bottom",
      cableModel: "Cable D",
      connectorLabel: "XT60",
      lengthMm: 500,
      colorKey: "var(--chart-5)",
      compatibilityStatus: "compatible",
    },
    {
      id: "accessories-controller",
      reference: "W06",
      from: "accessories",
      to: "controller",
      direction: "left",
      cableModel: "Cable A",
      connectorLabel: "Higo 6-pin",
      lengthMm: 2000,
      colorKey: "var(--chart-1)",
      compatibilityStatus: "compatible",
    },
  ]

  const accessories: AccessoryRow[] = [
    {
      id: "ACC-FL",
      reference: "A1",
      name: "Front Light",
      model: "ACC-FL",
      quantity: 1,
      imageUrl: null,
      harnessReference: "W06",
      status: "ok",
    },
  ]

  return {
    driveType: "hub-motor",
    nodes,
    connections,
    accessories,
    status: "complete",
    statusMessage: "Connection check passed",
    revisionLabel: "SCHEMATIC · HUB-R900-48V · REV 01",
  }
}
