"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type CompatibilityColor = "green" | "amber" | "red"

export type DrivetrainCategory =
  | "belt"
  | "cassette"
  | "chain"
  | "chainring"
  | "derailleur"
  | "front_pulley"
  | "internal_gear_hub"
  | "rear_pulley"
  | string

export type DrivetrainComponent = {
  id: string
  source_key: string | null
  category: DrivetrainCategory
  drive_type: "chain" | "belt" | "both" | string
  brand: string | null
  model: string | null
  display_name: string | null
  description: string | null
  image_url: string | null
  teeth: number | null
  tooth_counts: number[] | null
  ratio_type: string | null
  internal_gear_ratios: number[] | null
  minimum_internal_ratio: number | null
  maximum_internal_ratio: number | null
  number_of_speeds: number | null
  mounting_interface: string | null
  product_family: string | null
  chain_speed: number | null
  chain_width_inch: number | null
  chainline_mm: number | null
  beltline_mm: number | null
  belt_teeth: number | null
  belt_length_mm: number | null
  belt_pitch_mm: number | null
  belt_width_mm: number | null
  minimum_primary_ratio: number | null
  maximum_input_torque_nm: number | null
  maximum_gvw_kg: number | null
  minimum_wheel_size_inch: number | null
  maximum_wheel_size_inch: number | null
  speed_pedelec_compatible: boolean | null
  specifications: Record<string, unknown> | null
  source_url: string | null
  source_verified_on: string | null
}

export type CompatibilityRow = {
  component_id: string
  compatible_component_id: string
  compatibility_status: "compatible" | "warning" | "incompatible" | string
  reason: string | null
}

export type TorqueGvwLimitRow = {
  component_id: string
  maximum_input_torque_nm: number | null
  maximum_gvw_kg: number | null
  notes: string | null
}

export type EngineeringRuleRow = {
  rule_code: string
  rule_name?: string | null
  drive_type: "chain" | "belt" | null
  motor_type: "mid_drive" | "hub" | null
  component_category: DrivetrainCategory | null
  requirement_key: string
  outcome_on_failure: "warning" | "incompatible" | string
  message: string
  priority: number
  is_active?: boolean
}

export type CompatibilityResult = {
  status: CompatibilityColor
  messages: string[]
}

export type DrivetrainData = {
  catalogue: DrivetrainComponent[]
  compatibility: CompatibilityRow[]
  torqueLimits: TorqueGvwLimitRow[]
  rules: EngineeringRuleRow[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Numeric normalization — Postgres `numeric` columns arrive as strings
// ─────────────────────────────────────────────────────────────────────────────

function toNum(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

function toNumArray(value: unknown): number[] | null {
  if (!Array.isArray(value)) return null
  const arr = value.map((v) => toNum(v)).filter((v): v is number => v !== null)
  return arr.length ? arr : null
}

function normalizeComponent(row: Record<string, unknown>): DrivetrainComponent {
  return {
    id: String(row.id),
    source_key: (row.source_key as string) ?? null,
    category: (row.category as string) ?? "",
    drive_type: (row.drive_type as string) ?? "",
    brand: (row.brand as string) ?? null,
    model: (row.model as string) ?? null,
    display_name: (row.display_name as string) ?? null,
    description: (row.description as string) ?? null,
    image_url: (row.image_url as string) ?? null,
    teeth: toNum(row.teeth),
    tooth_counts: toNumArray(row.tooth_counts),
    ratio_type: (row.ratio_type as string) ?? null,
    internal_gear_ratios: toNumArray(row.internal_gear_ratios),
    minimum_internal_ratio: toNum(row.minimum_internal_ratio),
    maximum_internal_ratio: toNum(row.maximum_internal_ratio),
    number_of_speeds: toNum(row.number_of_speeds),
    mounting_interface: (row.mounting_interface as string) ?? null,
    product_family: (row.product_family as string) ?? null,
    chain_speed: toNum(row.chain_speed),
    chain_width_inch: toNum(row.chain_width_inch),
    chainline_mm: toNum(row.chainline_mm),
    beltline_mm: toNum(row.beltline_mm),
    belt_teeth: toNum(row.belt_teeth),
    belt_length_mm: toNum(row.belt_length_mm),
    belt_pitch_mm: toNum(row.belt_pitch_mm),
    belt_width_mm: toNum(row.belt_width_mm),
    minimum_primary_ratio: toNum(row.minimum_primary_ratio),
    maximum_input_torque_nm: toNum(row.maximum_input_torque_nm),
    maximum_gvw_kg: toNum(row.maximum_gvw_kg),
    minimum_wheel_size_inch: toNum(row.minimum_wheel_size_inch),
    maximum_wheel_size_inch: toNum(row.maximum_wheel_size_inch),
    speed_pedelec_compatible: row.speed_pedelec_compatible === null || row.speed_pedelec_compatible === undefined
      ? null
      : Boolean(row.speed_pedelec_compatible),
    specifications: (row.specifications as Record<string, unknown>) ?? null,
    source_url: (row.source_url as string) ?? null,
    source_verified_on: (row.source_verified_on as string) ?? null,
  }
}

function normalizeCompatibility(row: Record<string, unknown>): CompatibilityRow {
  return {
    component_id: String(row.component_id),
    compatible_component_id: String(row.compatible_component_id),
    compatibility_status: (row.compatibility_status as string) ?? "compatible",
    reason: (row.reason as string) ?? null,
  }
}

function normalizeTorqueLimit(row: Record<string, unknown>): TorqueGvwLimitRow {
  return {
    component_id: String(row.component_id),
    maximum_input_torque_nm: toNum(row.maximum_input_torque_nm),
    maximum_gvw_kg: toNum(row.maximum_gvw_kg),
    notes: (row.notes as string) ?? null,
  }
}

function normalizeRule(row: Record<string, unknown>): EngineeringRuleRow {
  return {
    rule_code: String(row.rule_code),
    rule_name: (row.rule_name as string) ?? null,
    drive_type: (row.drive_type as EngineeringRuleRow["drive_type"]) ?? null,
    motor_type: (row.motor_type as EngineeringRuleRow["motor_type"]) ?? null,
    component_category: (row.component_category as string) ?? null,
    requirement_key: String(row.requirement_key),
    outcome_on_failure: (row.outcome_on_failure as string) ?? "warning",
    message: String(row.message),
    priority: toNum(row.priority) ?? 999,
    is_active: row.is_active === undefined ? true : Boolean(row.is_active),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Loader
// ─────────────────────────────────────────────────────────────────────────────

async function fetchDrivetrainData(): Promise<DrivetrainData> {
  const supabase = createClient()

  const [catalogueResult, compatibilityResult, torqueLimitsResult, rulesResult] = await Promise.all([
    supabase.from("drivetrain_catalogue_for_app").select("*"),
    supabase
      .from("drivetrain_compatibility")
      .select("component_id, compatible_component_id, compatibility_status, reason")
      .eq("is_active", true),
    supabase.from("drivetrain_torque_gvw_limits").select("component_id, maximum_input_torque_nm, maximum_gvw_kg, notes"),
    supabase.from("drivetrain_engineering_rules").select("*").eq("is_active", true).order("priority"),
  ])

  if (catalogueResult.error) {
    console.error("[v0] drivetrain_catalogue_for_app query failed:", catalogueResult.error)
    throw catalogueResult.error
  }
  if (compatibilityResult.error) {
    console.error("[v0] drivetrain_compatibility query failed:", compatibilityResult.error)
    throw compatibilityResult.error
  }
  if (torqueLimitsResult.error) {
    console.error("[v0] drivetrain_torque_gvw_limits query failed:", torqueLimitsResult.error)
    throw torqueLimitsResult.error
  }
  if (rulesResult.error) {
    console.error("[v0] drivetrain_engineering_rules query failed:", rulesResult.error)
    throw rulesResult.error
  }

  return {
    catalogue: ((catalogueResult.data ?? []) as Record<string, unknown>[]).map((r) => normalizeComponent(r)),
    compatibility: ((compatibilityResult.data ?? []) as Record<string, unknown>[]).map((r) => normalizeCompatibility(r)),
    torqueLimits: ((torqueLimitsResult.data ?? []) as Record<string, unknown>[]).map((r) => normalizeTorqueLimit(r)),
    rules: ((rulesResult.data ?? []) as Record<string, unknown>[]).map((r) => normalizeRule(r)),
  }
}

export function useDrivetrainData() {
  const { data, isLoading, error } = useSWR<DrivetrainData>("ananda-drivetrain-data", fetchDrivetrainData, {
    revalidateOnFocus: false,
  })
  return {
    catalogue: data?.catalogue ?? [],
    compatibility: data?.compatibility ?? [],
    torqueLimits: data?.torqueLimits ?? [],
    rules: data?.rules ?? [],
    isLoading,
    error: error as { message?: string } | undefined,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Compatibility lookups
// ─────────────────────────────────────────────────────────────────────────────

export function getCompatibilityEntries(compatibility: CompatibilityRow[], idA: string, idB: string): CompatibilityRow[] {
  return compatibility.filter(
    (row) =>
      (row.component_id === idA && row.compatible_component_id === idB) ||
      (row.component_id === idB && row.compatible_component_id === idA),
  )
}

export function passesTorqueGvw(
  componentId: string,
  motorTorqueNm: number | null,
  gvwKg: number | null,
  limits: TorqueGvwLimitRow[],
): { checked: boolean; passed: boolean } {
  const rows = limits.filter((l) => l.component_id === componentId)
  if (rows.length === 0) return { checked: false, passed: true }
  if (motorTorqueNm == null || gvwKg == null) return { checked: false, passed: true }
  const passed = rows.some(
    (r) => r.maximum_input_torque_nm != null && r.maximum_gvw_kg != null && motorTorqueNm <= r.maximum_input_torque_nm && gvwKg <= r.maximum_gvw_kg,
  )
  return { checked: true, passed }
}

// Pairs of categories that must have an explicit database relationship to be
// considered validated. Absence of an explicit row for these pairs must
// default to amber, never green.
const VALIDATION_REQUIRED_PAIRS = new Set([
  "chainring:cassette",
  "chainring:chain",
  "chain:cassette",
  "chain:derailleur",
  "cassette:derailleur",
  "chainring:derailleur",
  "internal_gear_hub:rear_pulley",
  "internal_gear_hub:front_pulley",
  "front_pulley:belt",
  "rear_pulley:belt",
  "front_pulley:rear_pulley",
  "internal_gear_hub:chainring",
])

function pairKey(a: DrivetrainComponent, b: DrivetrainComponent): string {
  return [a.category, b.category].sort().join(":")
}

function requiresExplicitValidation(a: DrivetrainComponent, b: DrivetrainComponent): boolean {
  return VALIDATION_REQUIRED_PAIRS.has(pairKey(a, b))
}

export type CompatibilityContext = {
  motorTorqueNm?: number | null
  motorType?: "mid_drive" | "hub" | null
  gvwKg?: number | null
  primaryRatio?: number | null
  isSpeedPedelec?: boolean
  wheelSizeInch?: number | null
  frameBeltRequirementsMet?: boolean | null
}

/**
 * Applies the 13-step ordered compatibility check between two drivetrain
 * components. Stops immediately on the first Red. Amber reasons accumulate.
 * Never returns Green purely from missing data — falls back to Amber.
 */
export function evaluateCompatibility(
  a: DrivetrainComponent,
  b: DrivetrainComponent,
  ctx: CompatibilityContext,
  data: DrivetrainData,
): CompatibilityResult {
  const messages: string[] = []
  let status: CompatibilityColor = "green"
  let sawExplicitRow = false

  const push = (level: CompatibilityColor, message: string) => {
    messages.push(message)
    if (level === "red") status = "red"
    else if (level === "amber" && status !== "red") status = "amber"
  }

  // 1 & 2. Explicit relationship rows (bidirectional)
  const explicit = getCompatibilityEntries(data.compatibility, a.id, b.id)
  if (explicit.length > 0) sawExplicitRow = true
  const incompatibleRow = explicit.find((r) => r.compatibility_status === "incompatible")
  if (incompatibleRow) {
    return { status: "red", messages: [incompatibleRow.reason ?? "Explicitly marked incompatible in the database."] }
  }
  const warningRow = explicit.find((r) => r.compatibility_status === "warning")
  if (warningRow) {
    push("amber", warningRow.reason ?? "Explicit engineering warning recorded in the database.")
  }

  // 3. Drive type
  const aChainOnly = a.drive_type === "chain"
  const aBeltOnly = a.drive_type === "belt"
  const bChainOnly = b.drive_type === "chain"
  const bBeltOnly = b.drive_type === "belt"
  if ((aChainOnly && bBeltOnly) || (aBeltOnly && bChainOnly)) {
    return { status: "red", messages: ["Drive type mismatch between selected components."] }
  }

  // 4. Product family — this field represents the same "system" concept across
  // every category (e.g. "Shimano CUES / LINKGLIDE", "Gates CDX"), so an explicit
  // mismatch between two known families is a genuine, known-rule failure.
  const beltCategories = new Set(["belt", "front_pulley", "rear_pulley"])
  if (a.product_family && b.product_family && a.product_family !== b.product_family) {
    return { status: "red", messages: [`Product family mismatch: ${a.product_family} vs ${b.product_family}.`] }
  }

  // 5. Mounting interface is intentionally NOT compared directly between
  // categories here. The field describes a different physical joint per
  // category (e.g. a cassette's freehub spline vs. a chainring's crank
  // interface), so a literal string comparison across categories is not
  // meaningful and must never produce a false incompatibility. Explicit
  // database relationships and the product-family check above are the
  // source of truth for whether two parts actually mate.

  // 6. Motor torque and paired GVW limits — only meaningful for mid-drive
  // motors, since a mid-drive motor's torque passes through this drivetrain.
  // A hub motor drives the wheel directly and must never be checked here.
  if (ctx.motorType === "mid_drive") {
    for (const c of [a, b]) {
      const hasLimitRows = data.torqueLimits.some((l) => l.component_id === c.id)
      if (!hasLimitRows) continue
      if (ctx.motorTorqueNm == null || ctx.gvwKg == null) {
        push(
          "amber",
          `Motor torque and estimated GVW are required to verify ${c.display_name ?? c.model ?? c.category} against its published limits.`,
        )
        continue
      }
      const result = passesTorqueGvw(c.id, ctx.motorTorqueNm, ctx.gvwKg, data.torqueLimits)
      if (result.checked && !result.passed) {
        return {
          status: "red",
          messages: [
            `${c.display_name ?? c.model ?? c.category} does not meet the paired motor torque / GVW limit (selected ${ctx.motorTorqueNm} Nm / ${ctx.gvwKg} kg).`,
          ],
        }
      }
    }
  }

  // 7. Minimum primary ratio
  for (const c of [a, b]) {
    if (c.minimum_primary_ratio != null && ctx.primaryRatio != null && ctx.primaryRatio < c.minimum_primary_ratio) {
      return { status: "red", messages: [`Primary ratio ${ctx.primaryRatio.toFixed(2)} is below the minimum ${c.minimum_primary_ratio.toFixed(2)} required by ${c.display_name ?? c.model}.`] }
    }
  }

  // 8. Speed-pedelec compatibility
  if (ctx.isSpeedPedelec) {
    for (const c of [a, b]) {
      if (c.speed_pedelec_compatible === false) {
        return { status: "red", messages: [`${c.display_name ?? c.model ?? c.category} is not rated for speed-pedelec use.`] }
      }
    }
  }

  // 9. Wheel size limits
  if (ctx.wheelSizeInch != null) {
    for (const c of [a, b]) {
      if (
        (c.minimum_wheel_size_inch != null && ctx.wheelSizeInch < c.minimum_wheel_size_inch) ||
        (c.maximum_wheel_size_inch != null && ctx.wheelSizeInch > c.maximum_wheel_size_inch)
      ) {
        return { status: "red", messages: [`Selected wheel size falls outside the supported range for ${c.display_name ?? c.model}.`] }
      }
    }
  }

  // 10. Chain speed / belt pitch
  if (a.chain_speed != null && b.chain_speed != null && a.chain_speed !== b.chain_speed) {
    push("amber", `Chain speed mismatch (${a.chain_speed} vs ${b.chain_speed}) may affect shifting quality.`)
  }
  if (a.belt_pitch_mm != null && b.belt_pitch_mm != null && a.belt_pitch_mm !== b.belt_pitch_mm) {
    return { status: "red", messages: [`Belt pitch mismatch: ${a.belt_pitch_mm} mm vs ${b.belt_pitch_mm} mm.`] }
  }

  // 11. Chainline / beltline
  if (a.chainline_mm != null && b.chainline_mm != null && Math.abs(a.chainline_mm - b.chainline_mm) > 2) {
    push("amber", `Chainline offset of ${Math.abs(a.chainline_mm - b.chainline_mm).toFixed(1)} mm should be engineering-verified.`)
  }
  if (a.beltline_mm != null && b.beltline_mm != null && Math.abs(a.beltline_mm - b.beltline_mm) > 2) {
    push("amber", `Beltline offset of ${Math.abs(a.beltline_mm - b.beltline_mm).toFixed(1)} mm should be engineering-verified.`)
  }

  // 12. Belt frame requirements
  if (beltCategories.has(a.category) || beltCategories.has(b.category)) {
    if (ctx.frameBeltRequirementsMet === false) {
      return { status: "red", messages: ["Frame belt requirements are not yet satisfied — see Frame requirements section."] }
    }
    if (ctx.frameBeltRequirementsMet == null) {
      push("amber", "Frame belt requirements have not been confirmed yet.")
    }
  }

  // 13. Engineering rules
  const ruleResult = applyEngineeringRules(data.rules, a, b, ctx)
  for (const r of ruleResult) {
    if (r.level === "red") return { status: "red", messages: [r.message] }
    push("amber", r.message)
  }

  // Fallback — absence of explicit data must never resolve to green
  if (status === "green" && !sawExplicitRow && requiresExplicitValidation(a, b)) {
    push("amber", "Compatibility relationship is not available in the database.")
  }

  return { status, messages }
}

function applyEngineeringRules(
  rules: EngineeringRuleRow[],
  a: DrivetrainComponent,
  b: DrivetrainComponent,
  ctx: CompatibilityContext,
): { level: CompatibilityColor; message: string }[] {
  const out: { level: CompatibilityColor; message: string }[] = []
  for (const rule of rules) {
    const categoryMatches =
      rule.component_category == null || rule.component_category === a.category || rule.component_category === b.category
    if (!categoryMatches) continue
    const driveTypeMatches = rule.drive_type == null || rule.drive_type === a.drive_type || rule.drive_type === b.drive_type
    if (!driveTypeMatches) continue

    const failed = evaluateRuleRequirement(rule.requirement_key, ctx)
    if (failed) {
      out.push({ level: rule.outcome_on_failure === "incompatible" ? "red" : "amber", message: rule.message })
    }
  }
  return out
}

function evaluateRuleRequirement(requirementKey: string, ctx: CompatibilityContext): boolean {
  switch (requirementKey) {
    case "frame_has_belt_opening":
    case "belt_centre_distance_valid":
    case "belt_product_family_matches":
    case "beltline_verified":
    case "frame_stiffness_verified":
      return ctx.frameBeltRequirementsMet === false
    default:
      return false
  }
}

export function worstStatus(statuses: CompatibilityColor[]): CompatibilityColor {
  if (statuses.includes("red")) return "red"
  if (statuses.includes("amber")) return "amber"
  return "green"
}

// ─────────────────────────────────────────────────────────────────────────────
// Gear / speed / torque math (§11 / §12)
// ─────────────────────────────────────────────────────────────────────────────

export function primaryRatio(frontTeeth: number, rearTeeth: number): number {
  return frontTeeth / rearTeeth
}

export function overallSpeedRatio(primary: number, internalRatio: number): number {
  return primary * internalRatio
}

export function developmentM(circumferenceMm: number, overall: number): number {
  return (circumferenceMm / 1000) * overall
}

export function speedAtCadence(cadenceRpm: number, developmentMeters: number): number {
  return (cadenceRpm * developmentMeters * 60) / 1000
}

export function theoreticalWheelTorque(crankInputTorqueNm: number, overall: number, efficiency: number): number {
  return (crankInputTorqueNm / overall) * efficiency
}

export const DEFAULT_EFFICIENCY = { chain: 0.95, belt: 0.94 } as const

export type DrivetrainPerformanceRow = {
  gear_number: number
  rear_teeth: number
  internal_ratio: number
  overall_speed_ratio: number
  development_m: number
  speed_at_60_rpm_kmh: number
  speed_at_75_rpm_kmh: number
  speed_at_90_rpm_kmh: number
  theoretical_wheel_torque_nm: number | null
}

export async function callDrivetrainPerformanceRpc(params: {
  frontTeeth: number
  rearTeeth: number[]
  internalRatios: number[]
  wheelCircumferenceMm: number
  crankInputTorqueNm: number | null
  drivetrainEfficiency: number
}): Promise<DrivetrainPerformanceRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc("calculate_drivetrain_performance", {
    p_front_teeth: params.frontTeeth,
    p_rear_teeth: params.rearTeeth,
    p_internal_ratios: params.internalRatios,
    p_wheel_circumference_mm: params.wheelCircumferenceMm,
    p_crank_input_torque_nm: params.crankInputTorqueNm,
    p_drivetrain_efficiency: params.drivetrainEfficiency,
  })
  if (error) {
    console.error("[v0] calculate_drivetrain_performance RPC failed:", error)
    throw error
  }
  return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
    gear_number: toNum(row.gear_number) ?? 0,
    rear_teeth: toNum(row.rear_teeth) ?? 0,
    internal_ratio: toNum(row.internal_ratio) ?? 0,
    overall_speed_ratio: toNum(row.overall_speed_ratio) ?? 0,
    development_m: toNum(row.development_m) ?? 0,
    speed_at_60_rpm_kmh: toNum(row.speed_at_60_rpm_kmh) ?? 0,
    speed_at_75_rpm_kmh: toNum(row.speed_at_75_rpm_kmh) ?? 0,
    speed_at_90_rpm_kmh: toNum(row.speed_at_90_rpm_kmh) ?? 0,
    theoretical_wheel_torque_nm: toNum(row.theoretical_wheel_torque_nm),
  }))
}

export type EnvioloBoundary = {
  internalRatio: number
  overallSpeedRatio: number
  developmentM: number
  speedAt60: number
  speedAt75: number
  speedAt90: number
  theoreticalWheelTorqueNm: number | null
}

export function calculateEnvioloBoundaries(
  frontTeeth: number,
  rearTeeth: number,
  minRatio: number,
  maxRatio: number,
  circumferenceMm: number,
  crankInputTorqueNm: number | null,
  efficiency: number,
): { min: EnvioloBoundary; max: EnvioloBoundary } {
  const primary = primaryRatio(frontTeeth, rearTeeth)
  const build = (ratio: number): EnvioloBoundary => {
    const overall = overallSpeedRatio(primary, ratio)
    const dev = developmentM(circumferenceMm, overall)
    return {
      internalRatio: ratio,
      overallSpeedRatio: overall,
      developmentM: dev,
      speedAt60: speedAtCadence(60, dev),
      speedAt75: speedAtCadence(75, dev),
      speedAt90: speedAtCadence(90, dev),
      theoreticalWheelTorqueNm: crankInputTorqueNm != null ? theoreticalWheelTorque(crankInputTorqueNm, overall, efficiency) : null,
    }
  }
  return { min: build(minRatio), max: build(maxRatio) }
}

// ─────────────────────────────────────────────────────────────────────────────
// Belt geometry (§9)
// ─────────────────────────────────────────────────────────────────────────────

export function estimateBeltLength(frontTeeth: number, rearTeeth: number, beltPitchMm: number, centerDistanceMm: number): number {
  const frontDiameter = (frontTeeth * beltPitchMm) / Math.PI
  const rearDiameter = (rearTeeth * beltPitchMm) / Math.PI
  return (
    2 * centerDistanceMm +
    (Math.PI / 2) * (frontDiameter + rearDiameter) +
    Math.pow(frontDiameter - rearDiameter, 2) / (4 * centerDistanceMm)
  )
}

export type BeltCandidate = {
  belt: DrivetrainComponent
  estimatedLengthMm: number
  deltaMm: number
  label: string
}

export function findBeltCandidates(
  belts: DrivetrainComponent[],
  frontTeeth: number,
  rearTeeth: number,
  beltPitchMm: number,
  centerDistanceMm: number,
  adjustmentMm: number | null,
): BeltCandidate[] {
  const estimated = estimateBeltLength(frontTeeth, rearTeeth, beltPitchMm, centerDistanceMm)
  const tolerance = adjustmentMm != null && adjustmentMm > 0 ? adjustmentMm : 10
  return belts
    .filter((b) => b.belt_length_mm != null && b.belt_pitch_mm === beltPitchMm)
    .map((b) => ({
      belt: b,
      estimatedLengthMm: estimated,
      deltaMm: (b.belt_length_mm as number) - estimated,
      label: "Geometric candidate — manufacturer validation required",
    }))
    .filter((c) => Math.abs(c.deltaMm) <= tolerance)
    .sort((x, y) => Math.abs(x.deltaMm) - Math.abs(y.deltaMm))
}

// ─────────────────────────────────────────────────────────────────────────────
// Transmission availability (computed from live catalogue only)
// ───────��─────────────────────────────────────────────────────────────────────

export type TransmissionType = "derailleur" | "internal_gear_hub" | "cvt" | "single_speed" | "gearbox"

// The catalogue's "internal_gear_hub" category holds two physically distinct
// technologies: stepped hubs (Shimano Nexus, Rohloff — fixed discrete gears)
// and continuously-variable hubs (enviolo — a stepless ratio range). These
// are split into separate transmission types ("internal_gear_hub" vs "cvt")
// so the picker and slot filtering never mix the two. Only Shimano Nexus is
// surfaced under the stepped "internal_gear_hub" type — Rohloff remains in
// the catalogue but is intentionally excluded from this picker.
export const NEXUS_PRODUCT_FAMILY = "Shimano Nexus"

export function isSteppedInternalHub(c: DrivetrainComponent): boolean {
  return c.category === "internal_gear_hub" && c.product_family === NEXUS_PRODUCT_FAMILY
}

export function isCvtHub(c: DrivetrainComponent): boolean {
  return c.category === "internal_gear_hub" && c.ratio_type === "continuous"
}

export function getAvailableTransmissionTypes(catalogue: DrivetrainComponent[], driveType: "chain" | "belt"): TransmissionType[] {
  const types: TransmissionType[] = []
  const hasCategory = (cat: string, matchesDrive: (dt: string) => boolean) =>
    catalogue.some((c) => c.category === cat && matchesDrive(c.drive_type))
  const matchesDrive = (dt: string) => dt === driveType || dt === "both"

  if (driveType === "chain" && hasCategory("derailleur", matchesDrive)) {
    types.push("derailleur")
  }
  if (catalogue.some((c) => isSteppedInternalHub(c) && matchesDrive(c.drive_type))) {
    types.push("internal_gear_hub")
  }
  if (catalogue.some((c) => isCvtHub(c) && matchesDrive(c.drive_type))) {
    types.push("cvt")
  }
  if (hasCategory("rear_sprocket", matchesDrive)) {
    types.push("single_speed")
  }
  if (hasCategory("gearbox", matchesDrive)) {
    types.push("gearbox")
  }
  return types
}

// "enviolo Heavy Duty" was enviolo's original industrial/cargo CVT hub before
// "Extreme" and "Utility" were introduced as its successors — there is no
// is_active/legacy column in the schema, so this is derived from the model
// name, matching the same heuristic used for the "Legacy company option" UI badge.
export function isLegacyEnvioloOption(c: DrivetrainComponent): boolean {
  const haystack = `${c.model ?? ""} ${c.display_name ?? ""} ${c.product_family ?? ""}`
  return /heavy duty/i.test(haystack)
}

export function displayName(c: DrivetrainComponent | null | undefined): string {
  if (!c) return "—"
  return c.display_name ?? [c.brand, c.model].filter(Boolean).join(" ") ?? c.category
}

// ─────────────────────────────────────────────────────────────────────────────
// Recommendations (§7)
// ─────────────────────────────────────────────────────────────────────────────

export type RecommendationPosition = "climbing" | "balanced" | "speed"

export type RecommendationCard = {
  position: RecommendationPosition
  label: string
  transmissionType: "derailleur" | "cvt"
  front: DrivetrainComponent
  rear: DrivetrainComponent
  chain?: DrivetrainComponent | null
  derailleur?: DrivetrainComponent | null
  belt?: DrivetrainComponent | null
  gearRangeLabel: string
  compatibilityStatus: CompatibilityColor
  compatibilityMessages: string[]
  componentIds: string[]
}

const POSITION_LABELS: Record<RecommendationPosition, string> = {
  climbing: "Climbing / Cargo",
  balanced: "Balanced / Urban",
  speed: "Speed / Trekking",
}

function toothRange(c: DrivetrainComponent): { min: number; max: number } | null {
  if (c.tooth_counts && c.tooth_counts.length) {
    return { min: Math.min(...c.tooth_counts), max: Math.max(...c.tooth_counts) }
  }
  if (c.teeth != null) return { min: c.teeth, max: c.teeth }
  return null
}

export function buildChainDerailleurRecommendations(
  data: DrivetrainData,
  ctx: CompatibilityContext,
): Record<RecommendationPosition, RecommendationCard | null> {
  const chainrings = data.catalogue.filter((c) => c.category === "chainring")
  const cassettes = data.catalogue.filter((c) => c.category === "cassette")
  const chains = data.catalogue.filter((c) => c.category === "chain")
  const derailleurs = data.catalogue.filter((c) => c.category === "derailleur")

  const empty: Record<RecommendationPosition, RecommendationCard | null> = { climbing: null, balanced: null, speed: null }
  if (!chainrings.length || !cassettes.length) return empty

  const ranked = cassettes
    .map((cs) => {
      const range = toothRange(cs)
      return { cs, spread: range ? range.max - range.min : 0, maxTooth: range?.max ?? 0 }
    })
    .filter((r) => r.maxTooth > 0)
  if (!ranked.length) return empty

  const byWidestSpread = [...ranked].sort((a, b) => b.spread - a.spread)
  const bySmallestMax = [...ranked].sort((a, b) => a.maxTooth - b.maxTooth)
  const byMidSpread = [...ranked].sort((a, b) => a.spread - b.spread)

  const picks: Record<RecommendationPosition, (typeof ranked)[number]> = {
    climbing: byWidestSpread[0],
    speed: bySmallestMax[0],
    balanced: byMidSpread[Math.floor(byMidSpread.length / 2)],
  }

  const buildCard = (position: RecommendationPosition, pick: (typeof ranked)[number]): RecommendationCard | null => {
    const cassette = pick.cs
    const chainring =
      chainrings.find((cr) => evaluateCompatibility(cr, cassette, ctx, data).status !== "red") ?? chainrings[0]
    const chain = chains.find((ch) => evaluateCompatibility(ch, cassette, ctx, data).status !== "red") ?? chains[0] ?? null
    const derailleur =
      derailleurs.find((d) => evaluateCompatibility(d, cassette, ctx, data).status !== "red") ?? derailleurs[0] ?? null
    if (!chainring) return null

    const statuses: CompatibilityColor[] = [evaluateCompatibility(chainring, cassette, ctx, data).status]
    const messages: string[] = [...evaluateCompatibility(chainring, cassette, ctx, data).messages]
    if (chain) {
      const r = evaluateCompatibility(chain, cassette, ctx, data)
      statuses.push(r.status)
      messages.push(...r.messages)
    }
    if (derailleur) {
      const r = evaluateCompatibility(derailleur, cassette, ctx, data)
      statuses.push(r.status)
      messages.push(...r.messages)
    }

    const range = toothRange(cassette)
    return {
      position,
      label: POSITION_LABELS[position],
      transmissionType: "derailleur",
      front: chainring,
      rear: cassette,
      chain,
      derailleur,
      gearRangeLabel: range ? `${range.min}–${range.max}T` : "—",
      compatibilityStatus: worstStatus(statuses),
      compatibilityMessages: messages,
      componentIds: [chainring.id, cassette.id, chain?.id, derailleur?.id].filter((v): v is string => Boolean(v)),
    }
  }

  return {
    climbing: buildCard("climbing", picks.climbing),
    balanced: buildCard("balanced", picks.balanced),
    speed: buildCard("speed", picks.speed),
  }
}

export function buildBeltHubRecommendations(
  data: DrivetrainData,
  ctx: CompatibilityContext,
): Record<RecommendationPosition, RecommendationCard | null> {
  const hubs = data.catalogue.filter((c) => isCvtHub(c) && (c.drive_type === "belt" || c.drive_type === "both"))
  const frontPulleys = data.catalogue.filter((c) => c.category === "front_pulley")
  const rearPulleys = data.catalogue.filter((c) => c.category === "rear_pulley")

  const empty: Record<RecommendationPosition, RecommendationCard | null> = { climbing: null, balanced: null, speed: null }
  if (!hubs.length || !frontPulleys.length || !rearPulleys.length) return empty

  // A hub motor's torque never passes through this transmission, so the
  // torque/GVW limit only applies when a mid-drive motor is selected.
  const passingHubs =
    ctx.motorType === "mid_drive"
      ? hubs.filter((h) => passesTorqueGvw(h.id, ctx.motorTorqueNm ?? null, ctx.gvwKg ?? null, data.torqueLimits).passed)
      : hubs
  const rankable = passingHubs.filter((h) => h.minimum_primary_ratio != null)
  if (!rankable.length) return empty

  const byLowestRatio = [...rankable].sort((a, b) => (a.minimum_primary_ratio ?? 0) - (b.minimum_primary_ratio ?? 0))
  const byHighestRatio = [...rankable].sort((a, b) => (b.minimum_primary_ratio ?? 0) - (a.minimum_primary_ratio ?? 0))
  const byMidRatio = [...rankable].sort((a, b) => (a.minimum_primary_ratio ?? 0) - (b.minimum_primary_ratio ?? 0))

  const picks: Record<RecommendationPosition, DrivetrainComponent> = {
    climbing: byLowestRatio[0],
    speed: byHighestRatio[0],
    balanced: byMidRatio[Math.floor(byMidRatio.length / 2)],
  }

  const buildCard = (position: RecommendationPosition, hub: DrivetrainComponent): RecommendationCard | null => {
    const rearPulley = rearPulleys.find((rp) => {
      const explicit = getCompatibilityEntries(data.compatibility, hub.id, rp.id)
      return explicit.some((r) => r.compatibility_status === "compatible")
    })
    if (!rearPulley) return null
    const frontPulley =
      frontPulleys.find((fp) => evaluateCompatibility(fp, rearPulley, ctx, data).status !== "red" && fp.product_family === rearPulley.product_family) ??
      frontPulleys.find((fp) => evaluateCompatibility(fp, rearPulley, ctx, data).status !== "red") ??
      frontPulleys[0]

    const statuses: CompatibilityColor[] = [evaluateCompatibility(hub, rearPulley, ctx, data).status]
    const messages: string[] = [...evaluateCompatibility(hub, rearPulley, ctx, data).messages]
    if (frontPulley) {
      const r = evaluateCompatibility(frontPulley, rearPulley, ctx, data)
      statuses.push(r.status)
      messages.push(...r.messages)
    }

    const gearRangeLabel =
      hub.minimum_internal_ratio != null && hub.maximum_internal_ratio != null
        ? `${hub.minimum_internal_ratio.toFixed(2)}–${hub.maximum_internal_ratio.toFixed(2)}× (continuous)`
        : hub.number_of_speeds
          ? `${hub.number_of_speeds}-speed`
          : "—"

    return {
      position,
      label: POSITION_LABELS[position],
      transmissionType: "cvt",
      front: frontPulley ?? rearPulley,
      rear: rearPulley,
      belt: null,
      gearRangeLabel,
      compatibilityStatus: worstStatus(statuses),
      compatibilityMessages: messages,
      componentIds: [hub.id, frontPulley?.id, rearPulley.id].filter((v): v is string => Boolean(v)),
    }
  }

  return {
    climbing: buildCard("climbing", picks.climbing),
    balanced: buildCard("balanced", picks.balanced),
    speed: buildCard("speed", picks.speed),
  }
}
