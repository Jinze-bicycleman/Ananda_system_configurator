// Single source of truth for "does the current configuration meet the
// product targets" — shared by the persistent Target Status tab and the
// Final Report so both always agree.

import type { AnandaConfig } from "./ananda-store"
import { estimateRangeKm } from "./ananda-recommendation"
import type { MotorRow, BatteryRow, HmiDisplayRow } from "./ananda-packages"
import type { RequirementLevel } from "./ananda-product-targets"

export type RowStatus = "met" | "conditional" | "not_met" | "missing"

export interface TargetStatusRow {
  dimension: string
  level: RequirementLevel | "not_required"
  targetLabel: string
  currentLabel: string
  status: RowStatus
}

export interface TargetStatusInput {
  s: AnandaConfig
  motor: MotorRow | null
  battery: BatteryRow | null
  display: HmiDisplayRow | null
}

function dimensionRow(
  dimension: string,
  level: RequirementLevel,
  targetLabel: string,
  currentLabel: string,
  status: RowStatus,
): TargetStatusRow {
  // A "nice to have" that isn't met is a soft gap, never a hard failure.
  if (level === "nice" && status === "not_met") return { dimension, level, targetLabel, currentLabel, status: "conditional" }
  return { dimension, level, targetLabel, currentLabel, status }
}

function functionRow(dimension: string, level: RequirementLevel | "not_required", value: boolean | null): TargetStatusRow {
  if (level === "not_required") {
    return { dimension, level, targetLabel: "Not required", currentLabel: value == null ? "—" : value ? "Available" : "Not available", status: "met" }
  }
  const targetLabel = level === "must" ? "Required" : "Preferred"
  if (value == null) return { dimension, level, targetLabel, currentLabel: "Not yet available", status: "missing" }
  if (value) return { dimension, level, targetLabel, currentLabel: "Available", status: "met" }
  return { dimension, level, targetLabel, currentLabel: "Not available", status: level === "must" ? "not_met" : "conditional" }
}

export function computeTargetStatus({ s, motor, battery, display }: TargetStatusInput): TargetStatusRow[] {
  const t = s.productTargets
  const rows: TargetStatusRow[] = []

  const hasWeightData = Boolean(motor || battery)
  const weightKg = (motor?.weight_kg ?? 0) + (battery?.weight_kg ?? 0) + (display?.weight_kg ?? 0)
  rows.push(
    dimensionRow(
      "System Weight",
      t.weight.level,
      t.weight.maxKg != null ? `≤ ${t.weight.maxKg} kg` : "No target set",
      hasWeightData ? `${weightKg.toFixed(1)} kg` : "Not yet available",
      !hasWeightData ? "missing" : t.weight.maxKg == null ? "met" : weightKg <= t.weight.maxKg ? "met" : "not_met",
    ),
  )

  const torqueNm = motor?.torque_nm ?? null
  rows.push(
    dimensionRow(
      "Torque",
      t.performance.torqueLevel,
      t.performance.torqueTargetNm != null ? `≥ ${t.performance.torqueTargetNm} Nm` : "No target set",
      torqueNm != null ? `${torqueNm} Nm` : "Not yet available",
      torqueNm == null ? "missing" : t.performance.torqueTargetNm == null ? "met" : torqueNm >= t.performance.torqueTargetNm ? "met" : "not_met",
    ),
  )

  const rangeKm = battery ? estimateRangeKm(battery.capacity_wh) : null
  rows.push(
    dimensionRow(
      "Range (estimated)",
      t.performance.rangeLevel,
      t.performance.rangeTargetKm != null ? `≥ ${t.performance.rangeTargetKm} km` : "No target set",
      rangeKm != null ? `${rangeKm} km` : "Not yet available",
      rangeKm == null ? "missing" : t.performance.rangeTargetKm == null ? "met" : rangeKm >= t.performance.rangeTargetKm ? "met" : "not_met",
    ),
  )

  rows.push(functionRow("Bluetooth", t.functions.bluetooth, display ? display.bluetooth : null))
  rows.push(functionRow("GPS", t.functions.gps, display ? display.has_gps : null))
  rows.push(functionRow("Anti-Theft (GPS-based)", t.functions.antiTheft, display ? display.has_gps : null))

  rows.push({
    dimension: "Regulatory Compliance",
    level: "must",
    targetLabel: s.regulation ?? "No regulation set",
    currentLabel: s.regulation ? "Set — no impact from later selections" : "Not yet set",
    status: s.regulation ? "met" : "missing",
  })

  return rows
}

export function computeOverallFeasibility(rows: TargetStatusRow[]): "go" | "conditional_go" | "no_go" {
  const hasMustViolation = rows.some((r) => r.level === "must" && (r.status === "not_met" || r.status === "missing"))
  if (hasMustViolation) return "no_go"
  const hasTargetIssue = rows.some((r) => r.level === "target" && (r.status === "not_met" || r.status === "conditional" || r.status === "missing"))
  if (hasTargetIssue) return "conditional_go"
  return "go"
}

export interface ChangeImpact {
  weight: [number, number] | null
  range: [number, number] | null
  cost: [string, string] | null
  complianceNote: string
}

export function computeChangeImpact(
  s: AnandaConfig,
  current: { weightKg: number; rangeKm: number; costLabel: string },
): ChangeImpact {
  const baseline = s.targetStatusBaseline
  if (!baseline) return { weight: null, range: null, cost: null, complianceNote: "No impact" }
  return {
    weight: [baseline.weightKg, current.weightKg],
    range: [baseline.rangeKm, current.rangeKm],
    cost: [baseline.costLabel, current.costLabel],
    complianceNote: "No impact",
  }
}
