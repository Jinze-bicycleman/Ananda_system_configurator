/**
 * Pure, typed calculation utilities for the Step 6 "Speed vs. Cadence" chart
 * and "Climbing Ability" panel.
 *
 * These functions contain no React, no Supabase, and no store access — they
 * take plain values in and return plain values out — so they can be unit
 * tested directly and reused anywhere in the app (Step 6, Step 9, the
 * side summary, the PDF report) without duplicating the math.
 */

export const GRAVITY_M_S2 = 9.8
export const DEFAULT_BIKE_WEIGHT_KG = 25
export const DEFAULT_RIDER_WEIGHT_KG = 75
export const RIDER_WEIGHT_MIN_KG = 50
export const RIDER_WEIGHT_MAX_KG = 120
export const DEFAULT_DRIVETRAIN_EFFICIENCY = 0.93
export const HUMAN_DRIVETRAIN_EFFICIENCY = 0.93

export type MotorType = "mid_drive" | "hub"

/** Fallback wheel radius (metres) when a measured tyre circumference is unavailable. */
export function fallbackWheelRadiusMetres(wheelSizeInch: number | null): number | null {
  if (wheelSizeInch == null) return null
  if (wheelSizeInch <= 21) return 0.25 // 20-inch
  if (wheelSizeInch <= 27) return 0.33 // 26-inch
  return 0.37 // 29-inch / 700C
}

/** Preferred: derive real wheel radius (metres) from measured tyre circumference (mm). */
export function wheelRadiusFromCircumferenceMm(circumferenceMm: number | null): number | null {
  if (circumferenceMm == null || circumferenceMm <= 0) return null
  return circumferenceMm / 1000 / (2 * Math.PI)
}

export function resolveWheelRadiusMetres(circumferenceMm: number | null, wheelSizeInch: number | null): number | null {
  return wheelRadiusFromCircumferenceMm(circumferenceMm) ?? fallbackWheelRadiusMetres(wheelSizeInch)
}

// --- Tooth-count validation -------------------------------------------------

export interface ToothCountValidation {
  isValid: boolean
  messages: string[]
}

export function validateToothCounts(
  frontChainringTeeth: number | null,
  smallestRearTeeth: number | null,
  largestRearTeeth: number | null,
): ToothCountValidation {
  const messages: string[] = []

  const isPositiveInteger = (n: number | null): n is number => n != null && Number.isInteger(n) && n > 0

  if (!isPositiveInteger(frontChainringTeeth)) messages.push("Front chainring teeth must be a positive whole number.")
  if (!isPositiveInteger(smallestRearTeeth)) messages.push("Smallest rear sprocket teeth must be a positive whole number.")
  if (!isPositiveInteger(largestRearTeeth)) messages.push("Largest rear sprocket teeth must be a positive whole number.")

  if (
    isPositiveInteger(smallestRearTeeth) &&
    isPositiveInteger(largestRearTeeth) &&
    smallestRearTeeth > largestRearTeeth
  ) {
    messages.push("Smallest rear sprocket teeth must be less than or equal to largest rear sprocket teeth.")
  }

  return { isValid: messages.length === 0, messages }
}

// --- Speed vs. cadence -------------------------------------------------------

/**
 * speedKmh = cadenceRpm * (frontTeeth / rearTeeth) * wheelCircumferenceMetres * 60 / 1000
 */
export function speedAtCadenceKmh(
  cadenceRpm: number,
  frontChainringTeeth: number,
  rearSprocketTeeth: number,
  wheelCircumferenceMetres: number,
): number {
  return (cadenceRpm * (frontChainringTeeth / rearSprocketTeeth) * wheelCircumferenceMetres * 60) / 1000
}

export function gearRatio(frontChainringTeeth: number, rearSprocketTeeth: number): number {
  return frontChainringTeeth / rearSprocketTeeth
}

// --- Assistance (motor torque) ----------------------------------------------

export interface AssistanceResult {
  motorTorqueDemandNm: number
  motorTorqueDeliveredNm: number
  isCappedByMotorMax: boolean
}

/**
 * motorTorqueDemandNm = riderPedalTorqueNm * assistanceMultiplier
 * motorTorqueDeliveredNm = min(motorMaxTorqueNm, motorTorqueDemandNm)
 *
 * Zero rider torque must produce zero motor assistance (pedal-assist only,
 * no throttle mode modelled).
 */
export function calculateAssistance(
  riderPedalTorqueNm: number,
  assistanceMultiplier: number,
  motorMaxTorqueNm: number | null,
): AssistanceResult {
  const motorTorqueDemandNm = riderPedalTorqueNm * assistanceMultiplier
  const cap = motorMaxTorqueNm ?? Number.POSITIVE_INFINITY
  const motorTorqueDeliveredNm = Math.min(cap, motorTorqueDemandNm)
  return {
    motorTorqueDemandNm,
    motorTorqueDeliveredNm,
    isCappedByMotorMax: motorMaxTorqueNm != null && motorTorqueDemandNm > motorMaxTorqueNm,
  }
}

// --- Wheel torque -------------------------------------------------------------

export interface WheelTorqueInput {
  motorType: MotorType
  riderPedalTorqueNm: number
  motorTorqueDeliveredNm: number
  gearMultiplier: number
  /** Mid-drive: efficiency of the full motor+chain path. Defaults to 0.93. */
  drivetrainEfficiency?: number | null
  /** Hub motor: efficiency of the rider's own chain path only. Defaults to 0.93. */
  humanDrivetrainEfficiency?: number | null
}

/**
 * Mid-drive: totalWheelTorqueNm = (riderTorque + motorTorque) * gearMultiplier * drivetrainEfficiency
 * Hub:       totalWheelTorqueNm = motorTorque + riderTorque * gearMultiplier * humanDrivetrainEfficiency
 *
 * A hub motor's torque is already applied at the wheel, so it is never
 * multiplied by the bicycle gear ratio.
 */
export function calculateWheelTorqueNm(input: WheelTorqueInput): number {
  const {
    motorType,
    riderPedalTorqueNm,
    motorTorqueDeliveredNm,
    gearMultiplier,
    drivetrainEfficiency,
    humanDrivetrainEfficiency,
  } = input

  if (motorType === "hub") {
    const efficiency = humanDrivetrainEfficiency ?? HUMAN_DRIVETRAIN_EFFICIENCY
    return motorTorqueDeliveredNm + riderPedalTorqueNm * gearMultiplier * efficiency
  }

  const efficiency = drivetrainEfficiency ?? DEFAULT_DRIVETRAIN_EFFICIENCY
  return (riderPedalTorqueNm + motorTorqueDeliveredNm) * gearMultiplier * efficiency
}

// --- Climbing grade -----------------------------------------------------------

export type ClimbingGradeResult =
  | { status: "ok"; forceRatio: number; slopeAngleRad: number; gradePercent: number }
  | { status: "exceeded"; forceRatio: number }

/**
 * systemMassKg = riderWeightKg + bikeWeightKg
 * tractiveForceN = totalWheelTorqueNm / wheelRadiusMetres
 * forceRatio = tractiveForceN / (systemMassKg * g)
 *
 * When 0 <= forceRatio < 1: gradePercent = tan(asin(forceRatio)) * 100.
 * When forceRatio >= 1 the theoretical force model limit is exceeded —
 * callers must show a clear message, never Infinity/NaN.
 */
export function calculateClimbingGrade(
  totalWheelTorqueNm: number,
  wheelRadiusMetres: number,
  systemMassKg: number,
  gravity: number = GRAVITY_M_S2,
): ClimbingGradeResult {
  const tractiveForceN = totalWheelTorqueNm / wheelRadiusMetres
  const forceRatio = tractiveForceN / (systemMassKg * gravity)

  if (!(forceRatio >= 0) || forceRatio >= 1) {
    return { status: "exceeded", forceRatio: Number.isFinite(forceRatio) ? forceRatio : Number.POSITIVE_INFINITY }
  }

  const slopeAngleRad = Math.asin(forceRatio)
  const gradePercent = Math.tan(slopeAngleRad) * 100
  return { status: "ok", forceRatio, slopeAngleRad, gradePercent }
}

export type GradeScenario = "city" | "steep-road" | "very-steep" | "extreme"

export function classifyGradeScenario(gradePercent: number): { key: GradeScenario; label: string } {
  if (gradePercent <= 8) return { key: "city", label: "City overpass or normal underground car park" }
  if (gradePercent <= 15) return { key: "steep-road", label: "Steep mountain road or scenic switchback" }
  if (gradePercent <= 25) return { key: "very-steep", label: "Very steep car park ramp or off-road MTB climb" }
  return { key: "extreme", label: "Extreme challenge / technical off-road terrain" }
}

// --- Convenience: full climbing-ability computation ---------------------------

export interface ClimbingAbilityInput {
  motorType: MotorType
  motorMaxTorqueNm: number | null
  riderPedalTorqueNm: number
  assistanceMultiplier: number
  frontChainringTeeth: number | null
  largestRearTeeth: number | null
  riderWeightKg: number
  bikeWeightKg: number
  wheelRadiusMetres: number | null
  drivetrainEfficiency?: number | null
}

export interface ClimbingAbilityMissing {
  status: "missing-data"
  missingFields: string[]
}

export interface ClimbingAbilityComputed {
  status: "ok" | "exceeded"
  assistance: AssistanceResult
  gearMultiplier: number
  totalWheelTorqueNm: number
  systemWeightKg: number
  forceRatio: number
  gradePercent: number | null
  scenario: { key: GradeScenario; label: string } | null
}

export type ClimbingAbilityResult = ClimbingAbilityMissing | ClimbingAbilityComputed

export function computeClimbingAbility(input: ClimbingAbilityInput): ClimbingAbilityResult {
  const missingFields: string[] = []
  if (input.frontChainringTeeth == null) missingFields.push("front chainring teeth")
  if (input.largestRearTeeth == null) missingFields.push("largest rear sprocket teeth")
  if (input.wheelRadiusMetres == null) missingFields.push("wheel circumference")
  if (missingFields.length > 0) return { status: "missing-data", missingFields }

  const gearMultiplier = gearRatio(input.largestRearTeeth as number, input.frontChainringTeeth as number)
  const assistance = calculateAssistance(input.riderPedalTorqueNm, input.assistanceMultiplier, input.motorMaxTorqueNm)
  const totalWheelTorqueNm = calculateWheelTorqueNm({
    motorType: input.motorType,
    riderPedalTorqueNm: input.riderPedalTorqueNm,
    motorTorqueDeliveredNm: assistance.motorTorqueDeliveredNm,
    gearMultiplier,
    drivetrainEfficiency: input.drivetrainEfficiency,
  })
  const systemWeightKg = input.riderWeightKg + input.bikeWeightKg
  const grade = calculateClimbingGrade(totalWheelTorqueNm, input.wheelRadiusMetres as number, systemWeightKg)

  if (grade.status === "exceeded") {
    return {
      status: "exceeded",
      assistance,
      gearMultiplier,
      totalWheelTorqueNm,
      systemWeightKg,
      forceRatio: grade.forceRatio,
      gradePercent: null,
      scenario: null,
    }
  }

  return {
    status: "ok",
    assistance,
    gearMultiplier,
    totalWheelTorqueNm,
    systemWeightKg,
    forceRatio: grade.forceRatio,
    gradePercent: Math.round(grade.gradePercent * 10) / 10,
    scenario: classifyGradeScenario(grade.gradePercent),
  }
}

export const PEDAL_EFFORT_PRESETS = [
  { key: "relaxed", label: "Relaxed pedalling", torqueNm: 15 },
  { key: "normal", label: "Normal effort", torqueNm: 30 },
  { key: "hard", label: "Hard climbing", torqueNm: 50 },
] as const

export type PedalEffortKey = (typeof PEDAL_EFFORT_PRESETS)[number]["key"]
