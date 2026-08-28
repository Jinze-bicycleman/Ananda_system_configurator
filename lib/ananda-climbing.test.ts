import { describe, expect, it } from "vitest"
import {
  calculateAssistance,
  calculateClimbingGrade,
  calculateWheelTorqueNm,
  classifyGradeScenario,
  computeClimbingAbility,
  fallbackWheelRadiusMetres,
  gearRatio,
  speedAtCadenceKmh,
  validateToothCounts,
  wheelRadiusFromCircumferenceMm,
} from "./ananda-climbing"

// Shared fixture matching the spec's acceptance-test bike: 34T front, 51T
// largest rear, 700C wheel (0.37 m radius), 75 kg rider + 25 kg bike.
const FRONT_TEETH = 34
const LARGEST_REAR_TEETH = 51
const WHEEL_RADIUS_M = 0.37
const RIDER_WEIGHT_KG = 75
const BIKE_WEIGHT_KG = 25
const RIDER_TORQUE_NM = 30 // "Normal effort"

describe("validateToothCounts", () => {
  it("accepts valid positive integers where smallest <= largest", () => {
    expect(validateToothCounts(30, 11, 46).isValid).toBe(true)
  })

  it("rejects non-integers, zero, negatives, and nulls", () => {
    expect(validateToothCounts(null, 11, 46).isValid).toBe(false)
    expect(validateToothCounts(30, 0, 46).isValid).toBe(false)
    expect(validateToothCounts(30, -1, 46).isValid).toBe(false)
    expect(validateToothCounts(30.5, 11, 46).isValid).toBe(false)
  })

  it("rejects smallest > largest", () => {
    const result = validateToothCounts(30, 46, 11)
    expect(result.isValid).toBe(false)
    expect(result.messages.some((m) => m.includes("less than or equal to"))).toBe(true)
  })
})

describe("speedAtCadenceKmh", () => {
  it("computes speed from cadence, gear ratio, and wheel circumference", () => {
    // 80rpm, 1:1 gear ratio, 2.2m circumference => 80 * 1 * 2.2 * 60 / 1000 = 10.56 km/h
    expect(speedAtCadenceKmh(80, 30, 30, 2.2)).toBeCloseTo(10.56, 5)
  })
})

describe("gearRatio / wheel radius helpers", () => {
  it("computes gear ratio as front/rear", () => {
    expect(gearRatio(30, 46)).toBeCloseTo(30 / 46, 10)
  })

  it("derives wheel radius from circumference", () => {
    expect(wheelRadiusFromCircumferenceMm(2200)).toBeCloseTo(2.2 / (2 * Math.PI), 6)
  })

  it("falls back to fixed radii by wheel size when circumference is unavailable", () => {
    expect(fallbackWheelRadiusMetres(20)).toBe(0.25)
    expect(fallbackWheelRadiusMetres(26)).toBe(0.33)
    expect(fallbackWheelRadiusMetres(29)).toBe(0.37)
    expect(fallbackWheelRadiusMetres(null)).toBeNull()
  })
})

describe("calculateAssistance", () => {
  it("produces zero motor assistance for zero rider torque (pedal-assist only)", () => {
    const result = calculateAssistance(0, 3.0, 85)
    expect(result.motorTorqueDemandNm).toBe(0)
    expect(result.motorTorqueDeliveredNm).toBe(0)
    expect(result.isCappedByMotorMax).toBe(false)
  })

  it("caps delivered torque at the motor maximum and flags the cap", () => {
    // Boost 5.0x on 30Nm rider input = 150Nm demand, capped to an 85Nm motor
    const result = calculateAssistance(30, 5.0, 85)
    expect(result.motorTorqueDemandNm).toBe(150)
    expect(result.motorTorqueDeliveredNm).toBe(85)
    expect(result.isCappedByMotorMax).toBe(true)
  })

  it("does not cap when demand is within the motor maximum", () => {
    // Trail 2.0x on 30Nm rider input = 60Nm demand, within an 85Nm motor
    const result = calculateAssistance(30, 2.0, 85)
    expect(result.motorTorqueDemandNm).toBe(60)
    expect(result.motorTorqueDeliveredNm).toBe(60)
    expect(result.isCappedByMotorMax).toBe(false)
  })
})

describe("calculateWheelTorqueNm", () => {
  const gearMultiplier = LARGEST_REAR_TEETH / FRONT_TEETH

  it("mid-drive: (rider + motor) * gearMultiplier * efficiency", () => {
    const wheelTorque = calculateWheelTorqueNm({
      motorType: "mid_drive",
      riderPedalTorqueNm: RIDER_TORQUE_NM,
      motorTorqueDeliveredNm: 60,
      gearMultiplier,
      drivetrainEfficiency: 0.93,
    })
    expect(wheelTorque).toBeCloseTo((30 + 60) * gearMultiplier * 0.93, 6)
  })

  it("hub: motor + rider * gearMultiplier * humanEfficiency (motor not multiplied by gear ratio)", () => {
    const wheelTorque = calculateWheelTorqueNm({
      motorType: "hub",
      riderPedalTorqueNm: RIDER_TORQUE_NM,
      motorTorqueDeliveredNm: 60,
      gearMultiplier,
      humanDrivetrainEfficiency: 0.93,
    })
    expect(wheelTorque).toBeCloseTo(60 + 30 * gearMultiplier * 0.93, 6)
  })

  it("defaults efficiency to 0.93 when not supplied", () => {
    const withDefault = calculateWheelTorqueNm({
      motorType: "mid_drive",
      riderPedalTorqueNm: 30,
      motorTorqueDeliveredNm: 60,
      gearMultiplier,
    })
    const explicit = calculateWheelTorqueNm({
      motorType: "mid_drive",
      riderPedalTorqueNm: 30,
      motorTorqueDeliveredNm: 60,
      gearMultiplier,
      drivetrainEfficiency: 0.93,
    })
    expect(withDefault).toBeCloseTo(explicit, 10)
  })
})

describe("calculateClimbingGrade", () => {
  const systemMassKg = RIDER_WEIGHT_KG + BIKE_WEIGHT_KG

  it("returns a finite grade when force ratio is within [0, 1)", () => {
    const result = calculateClimbingGrade(100, WHEEL_RADIUS_M, systemMassKg)
    expect(result.status).toBe("ok")
    if (result.status === "ok") {
      expect(Number.isFinite(result.gradePercent)).toBe(true)
      expect(result.gradePercent).toBeGreaterThan(0)
    }
  })

  it("reports 'exceeded' instead of Infinity/NaN when force ratio >= 1", () => {
    const result = calculateClimbingGrade(100000, WHEEL_RADIUS_M, systemMassKg)
    expect(result.status).toBe("exceeded")
    expect(Number.isNaN((result as { forceRatio: number }).forceRatio)).toBe(false)
  })

  it("never returns NaN even for pathological zero-mass input", () => {
    const result = calculateClimbingGrade(0, WHEEL_RADIUS_M, systemMassKg)
    expect(result.status === "ok" || result.status === "exceeded").toBe(true)
  })
})

describe("classifyGradeScenario", () => {
  it("maps grade bands to the spec'd scenario labels", () => {
    expect(classifyGradeScenario(5).key).toBe("city")
    expect(classifyGradeScenario(8).key).toBe("city")
    expect(classifyGradeScenario(12).key).toBe("steep-road")
    expect(classifyGradeScenario(20).key).toBe("very-steep")
    expect(classifyGradeScenario(30).key).toBe("extreme")
  })
})

// --- Full acceptance-test scenarios from the product spec -------------------
// Fixture: 34T front, 51T largest rear, 700C wheel (r=0.37m), 75kg rider +
// 25kg bike, 30Nm "Normal effort" pedal torque, 0.93 drivetrain efficiency.

describe("acceptance test 1: Trail mode (2.0x), mid-drive, demand within motor max", () => {
  it("computes the documented wheel torque and climbing grade", () => {
    const result = computeClimbingAbility({
      motorType: "mid_drive",
      motorMaxTorqueNm: 85,
      riderPedalTorqueNm: RIDER_TORQUE_NM,
      assistanceMultiplier: 2.0,
      frontChainringTeeth: FRONT_TEETH,
      largestRearTeeth: LARGEST_REAR_TEETH,
      riderWeightKg: RIDER_WEIGHT_KG,
      bikeWeightKg: BIKE_WEIGHT_KG,
      wheelRadiusMetres: WHEEL_RADIUS_M,
    })
    expect(result.status).toBe("ok")
    if (result.status !== "missing-data" && result.status !== "exceeded") {
      expect(result.assistance.motorTorqueDeliveredNm).toBe(60)
      expect(result.assistance.isCappedByMotorMax).toBe(false)
      expect(result.totalWheelTorqueNm).toBeCloseTo(125.55, 1)
      expect(result.gradePercent).not.toBeNull()
      expect(result.gradePercent).toBeGreaterThan(0)
    }
  })
})

describe("acceptance test 2: Boost mode (5.0x), mid-drive, demand capped by motor max", () => {
  it("caps motor torque at the motor maximum and still returns a valid grade", () => {
    const result = computeClimbingAbility({
      motorType: "mid_drive",
      motorMaxTorqueNm: 85,
      riderPedalTorqueNm: RIDER_TORQUE_NM,
      assistanceMultiplier: 5.0,
      frontChainringTeeth: FRONT_TEETH,
      largestRearTeeth: LARGEST_REAR_TEETH,
      riderWeightKg: RIDER_WEIGHT_KG,
      bikeWeightKg: BIKE_WEIGHT_KG,
      wheelRadiusMetres: WHEEL_RADIUS_M,
    })
    expect(result.status).toBe("ok")
    if (result.status !== "missing-data" && result.status !== "exceeded") {
      expect(result.assistance.motorTorqueDemandNm).toBe(150)
      expect(result.assistance.motorTorqueDeliveredNm).toBe(85)
      expect(result.assistance.isCappedByMotorMax).toBe(true)
      expect(result.gradePercent).not.toBeNull()
    }
  })
})

describe("acceptance test 3: hub motor uses the same rider input, motor torque not multiplied by gear ratio", () => {
  it("computes hub wheel torque without scaling motor torque by the gear ratio", () => {
    const result = computeClimbingAbility({
      motorType: "hub",
      motorMaxTorqueNm: 85,
      riderPedalTorqueNm: RIDER_TORQUE_NM,
      assistanceMultiplier: 2.0,
      frontChainringTeeth: FRONT_TEETH,
      largestRearTeeth: LARGEST_REAR_TEETH,
      riderWeightKg: RIDER_WEIGHT_KG,
      bikeWeightKg: BIKE_WEIGHT_KG,
      wheelRadiusMetres: WHEEL_RADIUS_M,
    })
    expect(result.status).toBe("ok")
    if (result.status !== "missing-data" && result.status !== "exceeded") {
      const gearMultiplier = LARGEST_REAR_TEETH / FRONT_TEETH
      const expectedWheelTorque = 60 + RIDER_TORQUE_NM * gearMultiplier * 0.93
      expect(result.totalWheelTorqueNm).toBeCloseTo(expectedWheelTorque, 6)
    }
  })
})

describe("computeClimbingAbility missing-data handling", () => {
  it("reports missing-data instead of NaN when tooth counts or wheel radius are absent", () => {
    const result = computeClimbingAbility({
      motorType: "mid_drive",
      motorMaxTorqueNm: 85,
      riderPedalTorqueNm: 30,
      assistanceMultiplier: 1.0,
      frontChainringTeeth: null,
      largestRearTeeth: null,
      riderWeightKg: 75,
      bikeWeightKg: 25,
      wheelRadiusMetres: null,
    })
    expect(result.status).toBe("missing-data")
    if (result.status === "missing-data") {
      expect(result.missingFields.length).toBeGreaterThan(0)
    }
  })
})
