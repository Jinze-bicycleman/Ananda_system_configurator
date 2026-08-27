"use client"

// Recommendation engine — combines the live motor/battery/display catalogue
// with the user's Product Targets to rank three candidate solutions (Best
// Match / Lower-Cost Alternative / Premium Alternative). Cost and range are
// mock heuristics (no schema changes):
//   - Motor cost tier, ordinal from `model`: M7100 = 1 (Lower), M7200 = 2
//     (Mid), M7600 = 3 (Higher-Mid). Anything else falls back to 2.
//   - Range estimate: linear interpolation from the two given anchor points
//     (500 Wh -> 100 km, 800 Wh -> 150 km), clamped to a 40 km floor.

import { useMemo } from "react"
import { useAnandaStore } from "./ananda-store"
import { useMotors, useBatteries, useDisplays, type MotorRow, type BatteryRow, type HmiDisplayRow } from "./ananda-packages"
import type { ProductTargets, RequirementLevel } from "./ananda-product-targets"

export type CostTier = 1 | 2 | 3
export type SolutionId = "best" | "lower_cost" | "premium"

export const COST_LABELS: Record<CostTier, string> = { 1: "Lower Cost", 2: "Mid Cost", 3: "Higher-Mid Cost" }

export function costTierForMotorModel(model: string | null | undefined): CostTier {
  const m = (model ?? "").toUpperCase()
  if (m.includes("M7100")) return 1
  if (m.includes("M7200")) return 2
  if (m.includes("M7600")) return 3
  return 2
}

export function estimateRangeKm(capacityWh: number | null | undefined): number {
  if (!capacityWh) return 0
  const km = 100 + (capacityWh - 500) * (50 / 300)
  return Math.max(40, Math.round(km))
}

interface Combo {
  motor: MotorRow
  battery: BatteryRow
  display: HmiDisplayRow | null
  weightKg: number
  rangeKm: number
  torqueNm: number | null
  costTier: CostTier
}

function classifyDisplay(display: HmiDisplayRow | null) {
  return {
    bluetooth: display?.bluetooth ?? false,
    gps: display?.has_gps ?? false,
    // Anti-theft tracking in this catalogue is modeled as GPS-capable.
    antiTheft: display?.has_gps ?? false,
    hmiTier: display?.has_gps || display?.has_4g ? "Smart" : display?.bluetooth ? "Connected" : "Basic",
  }
}

function pickDisplay(displays: HmiDisplayRow[], targets: ProductTargets): HmiDisplayRow | null {
  if (displays.length === 0) return null
  const needsGps = targets.functions.gps !== "not_required" || targets.functions.antiTheft !== "not_required"
  const needsBt = targets.functions.bluetooth !== "not_required"
  const scored = displays
    .map((d) => {
      let score = 0
      if (needsGps && d.has_gps) score += 2
      if (needsBt && d.bluetooth) score += 1
      if (targets.functions.hmiType === "smart" && (d.has_gps || d.has_4g)) score += 2
      if (targets.functions.hmiType === "connected" && d.bluetooth) score += 1
      return { d, score }
    })
    .sort((a, b) => b.score - a.score)
  return scored[0].d
}

function passesMustHaves(c: Combo, t: ProductTargets): boolean {
  if (t.weight.level === "must" && t.weight.maxKg != null && c.weightKg > t.weight.maxKg) return false
  if (t.performance.torqueLevel === "must" && t.performance.torqueTargetNm != null && (c.torqueNm ?? 0) < t.performance.torqueTargetNm) return false
  if (t.performance.rangeLevel === "must" && t.performance.rangeTargetKm != null && c.rangeKm < t.performance.rangeTargetKm) return false
  const cls = classifyDisplay(c.display)
  if (t.functions.bluetooth === "must" && !cls.bluetooth) return false
  if (t.functions.gps === "must" && !cls.gps) return false
  if (t.functions.antiTheft === "must" && !cls.antiTheft) return false
  return true
}

function scoreCombo(c: Combo, t: ProductTargets): number {
  let score = 0
  if (t.weight.targetKg != null) score -= Math.abs(c.weightKg - t.weight.targetKg) * (t.weight.level === "target" ? 2 : 0.5)
  if (t.performance.rangeTargetKm != null) {
    score += Math.min(c.rangeKm - t.performance.rangeTargetKm, 30) * (t.performance.rangeLevel === "target" ? 1.5 : 0.5)
  }
  if (t.performance.torqueTargetNm != null && c.torqueNm != null) {
    score += Math.min(c.torqueNm - t.performance.torqueTargetNm, 20) * (t.performance.torqueLevel === "target" ? 1 : 0.3)
  }
  const cls = classifyDisplay(c.display)
  if (t.functions.bluetooth === "target" && cls.bluetooth) score += 5
  if (t.functions.gps === "target" && cls.gps) score += 5
  if (t.functions.antiTheft === "target" && cls.antiTheft) score += 5
  if (t.ambition.costPriority === "lowest_cost") score -= c.costTier * 8
  if (t.ambition.costPriority === "feature_first") score += (3 - c.costTier) * -4
  if (t.ambition.differentiation === "lightweight") score -= c.weightKg * 2
  if (t.ambition.differentiation === "long_range") score += c.rangeKm * 0.5
  if (t.ambition.differentiation === "high_performance") score += (c.torqueNm ?? 0) * 0.5
  return score
}

export interface RecommendedSolution {
  id: SolutionId
  label: string
  motor: MotorRow
  battery: BatteryRow
  display: HmiDisplayRow | null
  weightKg: number
  rangeKm: number
  torqueNm: number | null
  costTier: CostTier
  costLabel: string
  rationale: string
  metRequirements: string[]
  conditionalRequirements: string[]
  unmetRequirements: string[]
  tradeoffs: { weight: string; range: string; functions: string; integration: string; cost: string }
}

function evalReq(
  name: string,
  level: RequirementLevel | "not_required",
  ok: boolean,
  met: string[],
  conditional: string[],
  unmet: string[],
) {
  if (level === "not_required") return
  if (ok) met.push(name)
  else if (level === "must") unmet.push(name)
  else conditional.push(name)
}

function buildSolution(id: SolutionId, label: string, c: Combo, t: ProductTargets): RecommendedSolution {
  const cls = classifyDisplay(c.display)
  const met: string[] = []
  const conditional: string[] = []
  const unmet: string[] = []

  evalReq(
    `Weight target${t.weight.maxKg != null ? ` (≤ ${t.weight.maxKg} kg)` : ""}`,
    t.weight.level,
    t.weight.maxKg == null || c.weightKg <= t.weight.maxKg,
    met, conditional, unmet,
  )
  evalReq(
    `Torque target${t.performance.torqueTargetNm != null ? ` (≥ ${t.performance.torqueTargetNm} Nm)` : ""}`,
    t.performance.torqueLevel,
    t.performance.torqueTargetNm == null || (c.torqueNm ?? 0) >= t.performance.torqueTargetNm,
    met, conditional, unmet,
  )
  evalReq(
    `Range target${t.performance.rangeTargetKm != null ? ` (≥ ${t.performance.rangeTargetKm} km)` : ""}`,
    t.performance.rangeLevel,
    t.performance.rangeTargetKm == null || c.rangeKm >= t.performance.rangeTargetKm,
    met, conditional, unmet,
  )
  evalReq("Bluetooth connectivity", t.functions.bluetooth, cls.bluetooth, met, conditional, unmet)
  evalReq("GPS tracking", t.functions.gps, cls.gps, met, conditional, unmet)
  evalReq("Anti-theft (GPS-based)", t.functions.antiTheft, cls.antiTheft, met, conditional, unmet)

  const rationale =
    id === "best"
      ? `Best overall balance of weight, range and functions against your product targets, built around the ${c.motor.model} at ${c.motor.voltage_v}V.`
      : id === "lower_cost"
        ? `Lower relative component cost tier (${COST_LABELS[c.costTier]}) while still meeting your Must-have requirements.`
        : `Highest-spec pairing available in the catalogue for extra headroom on range and torque, at a premium cost tier.`

  return {
    id,
    label,
    motor: c.motor,
    battery: c.battery,
    display: c.display,
    weightKg: Math.round(c.weightKg * 10) / 10,
    rangeKm: c.rangeKm,
    torqueNm: c.torqueNm,
    costTier: c.costTier,
    costLabel: COST_LABELS[c.costTier],
    rationale,
    metRequirements: met,
    conditionalRequirements: conditional,
    unmetRequirements: unmet,
    tradeoffs: {
      weight: `${Math.round(c.weightKg * 10) / 10} kg`,
      range: `${c.rangeKm} km est.`,
      functions: cls.hmiTier,
      integration: c.motor.controller_requirement === "integrated" ? "Controller integrated" : "External controller required",
      cost: COST_LABELS[c.costTier],
    },
  }
}

export interface RecommendationResult {
  solutions: RecommendedSolution[]
  noSolutionReason: string | null
  isLoading: boolean
}

export function useRecommendations(): RecommendationResult {
  const s = useAnandaStore()
  const { motors, isLoading: motorsLoading } = useMotors()
  const { batteries, isLoading: batteriesLoading } = useBatteries()
  const { displays, isLoading: displaysLoading } = useDisplays()
  const isLoading = motorsLoading || batteriesLoading || displaysLoading

  const targets = s.productTargets
  const driveOverride = s.advancedDriveType
  const voltageOverride = s.advancedVoltagePlatform

  return useMemo(() => {
    if (isLoading) return { solutions: [], noSolutionReason: null, isLoading: true }

    // Hub motors are not yet available for selection anywhere in the flow —
    // the engine only ever considers mid-drive motors.
    let candidateMotors = motors.filter((m) => m.motor_type === "mid_drive" && m.is_active)
    if (driveOverride === "hub") candidateMotors = []
    if (voltageOverride) candidateMotors = candidateMotors.filter((m) => m.voltage_v === voltageOverride)

    const candidateBatteries = batteries.filter((b) => b.is_active && (!voltageOverride || b.voltage_v === voltageOverride))
    const candidateDisplays = displays.filter((d) => d.is_active)

    if (candidateMotors.length === 0 || candidateBatteries.length === 0) {
      return {
        solutions: [],
        noSolutionReason:
          driveOverride === "hub"
            ? "Hub motor selection is not yet available. Clear the advanced override to see mid-drive recommendations."
            : "No motor and battery combination is available for the selected voltage override. Try relaxing or clearing the advanced override.",
        isLoading: false,
      }
    }

    const combos: Combo[] = []
    for (const motor of candidateMotors) {
      const motorBatteries = candidateBatteries.filter((b) => b.voltage_v === motor.voltage_v)
      for (const battery of motorBatteries) {
        const display = pickDisplay(candidateDisplays, targets)
        const weightKg = (motor.weight_kg ?? 0) + (battery.weight_kg ?? 0) + (display?.weight_kg ?? 0)
        combos.push({
          motor,
          battery,
          display,
          weightKg,
          rangeKm: estimateRangeKm(battery.capacity_wh),
          torqueNm: motor.torque_nm,
          costTier: costTierForMotorModel(motor.model),
        })
      }
    }

    if (combos.length === 0) {
      return { solutions: [], noSolutionReason: "No compatible motor/battery pairing found for the selected voltage platform.", isLoading: false }
    }

    const pool = combos.filter((c) => passesMustHaves(c, targets))
    if (pool.length === 0) {
      return {
        solutions: [],
        noSolutionReason:
          "No catalogue combination meets all of your Must-have requirements. Consider relaxing a Must-have target (weight, torque, range, or a function) to see available options.",
        isLoading: false,
      }
    }

    const scored = pool.map((c) => ({ combo: c, score: scoreCombo(c, targets) })).sort((a, b) => b.score - a.score)
    const best = scored[0].combo
    const lowerCost =
      [...pool].sort((a, b) => a.costTier - b.costTier || a.weightKg - b.weightKg).find((c) => c !== best) ?? best
    const premium =
      [...pool].sort((a, b) => b.costTier - a.costTier || b.rangeKm - a.rangeKm).find((c) => c !== best && c !== lowerCost) ?? lowerCost

    const solutions: RecommendedSolution[] = [
      buildSolution("best", "Best Match", best, targets),
      buildSolution("lower_cost", "Lower-Cost Alternative", lowerCost, targets),
      buildSolution("premium", "Premium Alternative", premium, targets),
    ]

    return { solutions, noSolutionReason: null, isLoading: false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, motors, batteries, displays, targets, driveOverride, voltageOverride])
}
