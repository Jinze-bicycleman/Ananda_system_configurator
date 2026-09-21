// Product Targets data model — the input side of the recommendation engine.
// No React / Supabase dependencies here; pure types + constants so the store
// and the recommendation engine can both depend on this without cycles.

export type RequirementLevel = "must" | "target" | "nice"
export type FunctionLevel = RequirementLevel | "not_required"

export type WeightBand = "light" | "standard" | "heavy"
// Riding Terrain — replaces the old distance-based Range selector. Still
// backed by `rangeTargetKm`/`rangeBand` under the hood (consumed by the
// recommendation engine's range scoring), just relabeled and re-optioned to
// match the terrain the bike will actually be ridden on.
export type TerrainBand = "flat" | "hilly" | "mixed"
export type TorqueBand = "standard" | "high"
// Battery Capacity — replaces the old System Weight selector on Step 3.
export type BatteryCapacityBand = "light" | "standard" | "long_range"
export type BluetoothAppChoice = "ananda_app" | "third_party"
export type YesNo = "yes" | "no"

export interface LightsConfig {
  count: number
  voltageV: number
  powerW: number
}

export interface ProductTargets {
  mode: "quick" | "advanced"
  presetId: string | null
  weight: {
    targetKg: number | null
    maxKg: number | null
    level: RequirementLevel
    band: WeightBand | null
  }
  performance: {
    torqueTargetNm: number | null
    torqueLevel: RequirementLevel
    torqueBand: TorqueBand | null
    rangeTargetKm: number | null
    rangeLevel: RequirementLevel
    rangeBand: TerrainBand | null
  }
  battery: {
    capacityWh: number | null
    band: BatteryCapacityBand | null
  }
  functions: {
    // User-facing choice of companion-app connectivity. `bluetooth` (a
    // FunctionLevel) is still derived alongside it so the recommendation
    // engine and target-status matrix keep working unchanged.
    bluetoothApp: BluetoothAppChoice | null
    bluetoothThirdPartyAcknowledged: boolean
    bluetooth: FunctionLevel
    // IoT Module — merges GPS Tracking + Anti-Theft into a single Yes/No
    // choice. `gps`/`antiTheft` (FunctionLevel) are still derived alongside
    // it for the recommendation engine and target-status matrix.
    iotModule: YesNo | null
    gps: FunctionLevel
    antiTheft: FunctionLevel
    lights: YesNo | null
    lightsConfig: LightsConfig
    hmiType: "basic" | "connected" | "smart" | null
    hmiLevel: RequirementLevel
  }
  ambition: {
    positioning: "value" | "mainstream" | "premium" | null
    costPriority: "lowest_cost" | "balanced" | "feature_first" | null
    differentiation: "lightweight" | "long_range" | "high_performance" | "connected" | "design" | "low_cost" | null
  }
}

// Patch shape accepted by the store's `setProductTarget` action — one level
// of nested partial merging, matching the grouped shape above.
export type ProductTargetsPatch = Partial<Pick<ProductTargets, "mode" | "presetId">> & {
  weight?: Partial<ProductTargets["weight"]>
  performance?: Partial<ProductTargets["performance"]>
  battery?: Partial<ProductTargets["battery"]>
  functions?: Partial<ProductTargets["functions"]>
  ambition?: Partial<ProductTargets["ambition"]>
}

export const DEFAULT_LIGHTS_CONFIG: LightsConfig = { count: 2, voltageV: 12, powerW: 10 }

export const defaultProductTargets: ProductTargets = {
  mode: "quick",
  presetId: null,
  weight: { targetKg: null, maxKg: null, level: "target", band: null },
  performance: {
    torqueTargetNm: null,
    torqueLevel: "target",
    torqueBand: null,
    rangeTargetKm: null,
    rangeLevel: "target",
    rangeBand: null,
  },
  battery: { capacityWh: null, band: null },
  functions: {
    bluetoothApp: null,
    bluetoothThirdPartyAcknowledged: false,
    bluetooth: "nice",
    iotModule: null,
    gps: "not_required",
    antiTheft: "not_required",
    lights: null,
    lightsConfig: DEFAULT_LIGHTS_CONFIG,
    hmiType: null,
    hmiLevel: "target",
  },
  // Cost Priority no longer has a Step 3 selector — default to "balanced" so
  // downstream validation and the recommendation engine keep working without
  // requiring manual input.
  ambition: { positioning: null, costPriority: "balanced", differentiation: null },
}

export const WEIGHT_BANDS: Record<WeightBand, { label: string; targetKg: number; maxKg: number }> = {
  light: { label: "Light (≤ 25 kg)", targetKg: 22, maxKg: 25 },
  standard: { label: "Standard (25–30 kg)", targetKg: 27, maxKg: 30 },
  heavy: { label: "Heavy / Cargo (30 kg+)", targetKg: 34, maxKg: 40 },
}

export const BATTERY_CAPACITY_BANDS: Record<BatteryCapacityBand, { label: string; capacityWh: number }> = {
  light: { label: "Light (400Wh)", capacityWh: 400 },
  standard: { label: "Standard (500Wh)", capacityWh: 500 },
  long_range: { label: "Long Range (800Wh)", capacityWh: 800 },
}

export const TERRAIN_BANDS: Record<TerrainBand, { label: string; targetKm: number }> = {
  flat: { label: "Flat", targetKm: 120 },
  hilly: { label: "Hilly", targetKm: 80 },
  mixed: { label: "Mixed", targetKm: 100 },
}

export const TORQUE_BANDS: Record<TorqueBand, { label: string; targetNm: number }> = {
  standard: { label: "Standard (≤ 70 Nm)", targetNm: 65 },
  high: { label: "High (70 Nm+)", targetNm: 85 },
}

export interface RiderProfilePreset {
  id: string
  label: string
  description: string
  weightBand: WeightBand
  batteryBand: BatteryCapacityBand
  rangeBand: TerrainBand
  torqueBand: TorqueBand
  iotModule: YesNo
  lights: YesNo
  positioning: NonNullable<ProductTargets["ambition"]["positioning"]>
  costPriority: NonNullable<ProductTargets["ambition"]["costPriority"]>
}

export const RIDER_PROFILES: RiderProfilePreset[] = [
  {
    id: "commuter",
    label: "Commuter",
    description: "Daily city riding, light loads, cost-conscious.",
    weightBand: "light",
    batteryBand: "light",
    rangeBand: "flat",
    torqueBand: "standard",
    iotModule: "no",
    lights: "yes",
    positioning: "mainstream",
    costPriority: "balanced",
  },
  {
    id: "family_cargo",
    label: "Family / Cargo",
    description: "Carrying children or heavy loads, needs climbing torque and range.",
    weightBand: "heavy",
    batteryBand: "long_range",
    rangeBand: "hilly",
    torqueBand: "high",
    iotModule: "yes",
    lights: "yes",
    positioning: "mainstream",
    costPriority: "balanced",
  },
  {
    id: "trekking_adventure",
    label: "Trekking / Adventure",
    description: "Longer rides, mixed terrain, wants range and reliability.",
    weightBand: "standard",
    batteryBand: "long_range",
    rangeBand: "mixed",
    torqueBand: "standard",
    iotModule: "yes",
    lights: "yes",
    positioning: "premium",
    costPriority: "feature_first",
  },
  {
    id: "performance",
    label: "Performance",
    description: "High-power riding, hills and trails, torque-first.",
    weightBand: "standard",
    batteryBand: "standard",
    rangeBand: "hilly",
    torqueBand: "high",
    iotModule: "no",
    lights: "yes",
    positioning: "premium",
    costPriority: "feature_first",
  },
]

export function applyRiderProfile(preset: RiderProfilePreset): ProductTargetsPatch {
  const weight = WEIGHT_BANDS[preset.weightBand]
  const battery = BATTERY_CAPACITY_BANDS[preset.batteryBand]
  const terrain = TERRAIN_BANDS[preset.rangeBand]
  const torque = TORQUE_BANDS[preset.torqueBand]
  return {
    presetId: preset.id,
    weight: { targetKg: weight.targetKg, maxKg: weight.maxKg, band: preset.weightBand },
    performance: {
      rangeTargetKm: terrain.targetKm,
      rangeBand: preset.rangeBand,
      torqueTargetNm: torque.targetNm,
      torqueBand: preset.torqueBand,
    },
    battery: { capacityWh: battery.capacityWh, band: preset.batteryBand },
    functions: {
      bluetoothApp: "ananda_app",
      bluetooth: "target",
      iotModule: preset.iotModule,
      gps: preset.iotModule === "yes" ? "target" : "not_required",
      antiTheft: preset.iotModule === "yes" ? "target" : "not_required",
      lights: preset.lights,
    },
    ambition: { positioning: preset.positioning, costPriority: preset.costPriority },
  }
}
