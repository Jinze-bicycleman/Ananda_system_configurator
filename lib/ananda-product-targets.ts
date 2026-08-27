// Product Targets data model — the input side of the recommendation engine.
// No React / Supabase dependencies here; pure types + constants so the store
// and the recommendation engine can both depend on this without cycles.

export type RequirementLevel = "must" | "target" | "nice"
export type FunctionLevel = RequirementLevel | "not_required"

export type WeightBand = "light" | "standard" | "heavy"
export type RangeBand = "short" | "medium" | "long"
export type TorqueBand = "standard" | "high"

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
    rangeBand: RangeBand | null
  }
  functions: {
    bluetooth: FunctionLevel
    gps: FunctionLevel
    antiTheft: FunctionLevel
    lights: FunctionLevel
    hmiType: "basic" | "connected" | "smart" | null
    hmiLevel: RequirementLevel
  }
  ambition: {
    positioning: "value" | "mainstream" | "premium" | null
    costPriority: "lowest_cost" | "balanced" | "feature_first" | null
    differentiation: "lightweight" | "long_range" | "high_performance" | "connected" | "design" | "low_maintenance" | null
  }
}

// Patch shape accepted by the store's `setProductTarget` action — one level
// of nested partial merging, matching the grouped shape above.
export type ProductTargetsPatch = Partial<Pick<ProductTargets, "mode" | "presetId">> & {
  weight?: Partial<ProductTargets["weight"]>
  performance?: Partial<ProductTargets["performance"]>
  functions?: Partial<ProductTargets["functions"]>
  ambition?: Partial<ProductTargets["ambition"]>
}

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
  functions: {
    bluetooth: "nice",
    gps: "not_required",
    antiTheft: "not_required",
    lights: "nice",
    hmiType: null,
    hmiLevel: "target",
  },
  ambition: { positioning: null, costPriority: null, differentiation: null },
}

export const WEIGHT_BANDS: Record<WeightBand, { label: string; targetKg: number; maxKg: number }> = {
  light: { label: "Light (≤ 25 kg)", targetKg: 22, maxKg: 25 },
  standard: { label: "Standard (25–30 kg)", targetKg: 27, maxKg: 30 },
  heavy: { label: "Heavy / Cargo (30 kg+)", targetKg: 34, maxKg: 40 },
}

export const RANGE_BANDS: Record<RangeBand, { label: string; targetKm: number }> = {
  short: { label: "Short (≤ 60 km)", targetKm: 60 },
  medium: { label: "Medium (60–110 km)", targetKm: 100 },
  long: { label: "Long (110 km+)", targetKm: 140 },
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
  rangeBand: RangeBand
  torqueBand: TorqueBand
  bluetooth: FunctionLevel
  gps: FunctionLevel
  antiTheft: FunctionLevel
  positioning: NonNullable<ProductTargets["ambition"]["positioning"]>
  costPriority: NonNullable<ProductTargets["ambition"]["costPriority"]>
}

export const RIDER_PROFILES: RiderProfilePreset[] = [
  {
    id: "commuter",
    label: "Commuter",
    description: "Daily city riding, light loads, cost-conscious.",
    weightBand: "light",
    rangeBand: "medium",
    torqueBand: "standard",
    bluetooth: "nice",
    gps: "not_required",
    antiTheft: "not_required",
    positioning: "mainstream",
    costPriority: "balanced",
  },
  {
    id: "family_cargo",
    label: "Family / Cargo",
    description: "Carrying children or heavy loads, needs climbing torque and range.",
    weightBand: "heavy",
    rangeBand: "long",
    torqueBand: "high",
    bluetooth: "target",
    gps: "target",
    antiTheft: "target",
    positioning: "mainstream",
    costPriority: "balanced",
  },
  {
    id: "trekking_adventure",
    label: "Trekking / Adventure",
    description: "Longer rides, mixed terrain, wants range and reliability.",
    weightBand: "standard",
    rangeBand: "long",
    torqueBand: "standard",
    bluetooth: "target",
    gps: "target",
    antiTheft: "nice",
    positioning: "premium",
    costPriority: "feature_first",
  },
  {
    id: "performance",
    label: "Performance",
    description: "High-power riding, hills and trails, torque-first.",
    weightBand: "standard",
    rangeBand: "medium",
    torqueBand: "high",
    bluetooth: "target",
    gps: "nice",
    antiTheft: "nice",
    positioning: "premium",
    costPriority: "feature_first",
  },
]

export function applyRiderProfile(preset: RiderProfilePreset): ProductTargetsPatch {
  const weight = WEIGHT_BANDS[preset.weightBand]
  const range = RANGE_BANDS[preset.rangeBand]
  const torque = TORQUE_BANDS[preset.torqueBand]
  return {
    presetId: preset.id,
    weight: { targetKg: weight.targetKg, maxKg: weight.maxKg, band: preset.weightBand },
    performance: {
      rangeTargetKm: range.targetKm,
      rangeBand: preset.rangeBand,
      torqueTargetNm: torque.targetNm,
      torqueBand: preset.torqueBand,
    },
    functions: { bluetooth: preset.bluetooth, gps: preset.gps, antiTheft: preset.antiTheft },
    ambition: { positioning: preset.positioning, costPriority: preset.costPriority },
  }
}
