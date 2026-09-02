"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { defaultProductTargets, type ProductTargets, type ProductTargetsPatch } from "./ananda-product-targets"

export interface AnandaConfig {
  sellRegion: string | null
  regulation: string | null
  speedLimitKmh: number | null
  ratedPowerW: number | null
  bikeCategory: string | null
  wheelSize: string | null
  tyreWidth: string | null
  tyreIsoSize: string | null
  tyreCircumferenceMm: number | null
  driveType: "mid" | "hub" | null
  voltagePlatform: 36 | 48 | 52 | null
  productTargets: ProductTargets
  selectedSolutionId: "best" | "lower_cost" | "premium" | null
  // Optional expert override consumed only by the recommendation engine as a
  // hard filter — independent from `driveType`/`voltagePlatform` above, which
  // are populated by `applyRecommendedSolution` once a solution is chosen.
  advancedDriveType: "mid" | "hub" | null
  advancedVoltagePlatform: 36 | 48 | 52 | null
  targetStatusBaseline: { weightKg: number; rangeKm: number; costLabel: string } | null
  // Recommended (Best Match) product id per package-component key, captured
  // when a Step 4 solution is applied. The Step 5 change-confirmation dialog
  // diffs live selections against this to detect user deviations.
  packageBaseline: Record<string, string | null>
  packageId: string | null
  motorId: string | null
  controllerId: string | null
  torqueSensorId: string | null
  cadenceSensorId: string | null
  speedSensorId: string | null
  displayId: string | null
  remoteId: string | null
  skippedItems: string[]
  // Drivetrain System — `drivetrainType` is the live "chain" | "belt" selection
  // (spec's `driveType`, renamed to avoid clashing with the motor `driveType`
  // field above). The remaining chainring/rearSprocket/cadence/gear fields are
  // legacy and retained only for backward compatibility with previously
  // persisted state; the drivetrain step no longer writes to them.
  drivetrainType: "chain" | "belt" | null
  chainringTeeth: number
  rearSprocketTeeth: number
  cadenceRpm: number
  gearRatio: number | null
  estimatedSpeedKmh: number | null
  estimatedOnWheelTorqueNm: number | null
  gearSystem: string | null
  transmissionType: "derailleur" | "internal_gear_hub" | "cvt" | "single_speed" | "gearbox" | null
  selectedComponentIds: string[]
  // Tooth-count-driven drivetrain configuration (Step 6). `frontTeeth` is the
  // front chainring; `rearTeeth`/`largestRearTeeth` are the smallest/largest
  // rear sprocket. Only these three integers are required going forward.
  frontTeeth: number | null
  rearTeeth: number | null
  largestRearTeeth: number | null
  selectedBeltId: string | null
  // Climbing Ability panel (Step 6) inputs — preserved across navigation.
  climbingRiderWeightKg: number
  climbingAssistanceModeKey: string
  climbingPedalEffortKey: "relaxed" | "normal" | "hard"
  climbingCustomPedalTorqueNm: number | null
  centerDistanceMm: number | null
  adjustmentMm: number | null
  drivetrainEfficiency: number
  drivetrainWarnings: string[]
  drivetrainErrors: string[]
  warningsAcknowledged: boolean
  gvwKg: number | null
  frameHasBeltOpening: boolean | null
  beltAlternateInstallationApproved: boolean
  tensioningMethod: string | null
  frameStiffnessVerified: "yes" | "no" | "not_yet" | null
  frontPulleyClearanceVerified: boolean
  rearPulleyClearanceVerified: boolean
  beltlineVerified: boolean
  crankLength: string | null
  crankInterface: string | null
  batteryId: string | null
  chargerId: string | null
  chargingPortId: string | null
  accessoryIds: string[]
  cableLengths: Record<string, number>
  // Optional extension cable length (metres), keyed by the same connection
  // name as `cableLengths`. Absent/undefined means no extension was added —
  // the extension cable is always optional.
  extensionCableLengths: Record<string, number>
  currentStep: number
  hasStarted: boolean
}

export interface AnandaActions {
  setField: <K extends keyof AnandaConfig>(key: K, value: AnandaConfig[K]) => void
  setMarket: (market: string) => void
  setRegulation: (regulation: string | null) => void
  setDriveType: (drive: "mid" | "hub") => void
  setVoltage: (voltage: 36 | 48 | 52) => void
  setBikeCategory: (category: string) => void
  setProductTarget: (patch: ProductTargetsPatch) => void
  setAdvancedOverride: (driveType: "mid" | "hub" | null, voltagePlatform: 36 | 48 | 52 | null) => void
  clearAdvancedOverride: () => void
  applyRecommendedSolution: (
    solutionId: "best" | "lower_cost" | "premium",
    defaults: {
      driveType: "mid" | "hub"
      voltagePlatform: 36 | 48 | 52
      motorId: string
      controllerId: string | null
      displayId: string | null
      batteryId: string | null
      chargerId: string | null
      chargingPortId: string | null
      baseline: { weightKg: number; rangeKm: number; costLabel: string }
    },
  ) => void
  /** Recomputes packageBaseline from the currently selected solution without touching live selections — used when the catalogue-derived recommendation for a component (e.g. charger) changes. */
  setPackageBaseline: (baseline: Record<string, string | null>) => void
  selectPackage: (packageId: string, defaults: Partial<AnandaConfig>) => void
  setItemSkipped: (key: string, skipped: boolean) => void
  toggleAccessory: (id: string) => void
  setCableLength: (connection: string, length: number) => void
  /** Sets the optional extension cable length for a connection; pass `null` to remove it (back to no extension). */
  setExtensionCableLength: (connection: string, length: number | null) => void
  setDrivetrainType: (drivetrainType: "chain" | "belt") => void
  setTransmissionType: (transmissionType: AnandaConfig["transmissionType"]) => void
  resetDrivetrainDownstream: (from: "type" | "transmission" | "components") => void
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  resetConfig: () => void
  startConfiguration: () => void
}

const defaultState: AnandaConfig = {
  sellRegion: null, regulation: null, speedLimitKmh: null, ratedPowerW: null,
  bikeCategory: null, wheelSize: null, tyreWidth: null, tyreIsoSize: null, tyreCircumferenceMm: null,
  driveType: null, voltagePlatform: null,
  productTargets: defaultProductTargets, selectedSolutionId: null,
  advancedDriveType: null, advancedVoltagePlatform: null, targetStatusBaseline: null, packageBaseline: {},
  packageId: null, motorId: null, controllerId: null,
  torqueSensorId: null, cadenceSensorId: null, speedSensorId: null, displayId: null,
  remoteId: null, skippedItems: [], drivetrainType: null, chainringTeeth: 42, rearSprocketTeeth: 32,
  cadenceRpm: 80, gearRatio: null, estimatedSpeedKmh: null,
  estimatedOnWheelTorqueNm: null, gearSystem: null,
  transmissionType: null, selectedComponentIds: [], frontTeeth: null, rearTeeth: null, largestRearTeeth: null,
  selectedBeltId: null, centerDistanceMm: null, adjustmentMm: null, drivetrainEfficiency: 0.95,
  climbingRiderWeightKg: 75, climbingAssistanceModeKey: "eco", climbingPedalEffortKey: "normal", climbingCustomPedalTorqueNm: null,
  drivetrainWarnings: [], drivetrainErrors: [], warningsAcknowledged: false, gvwKg: null,
  frameHasBeltOpening: null, beltAlternateInstallationApproved: false, tensioningMethod: null,
  frameStiffnessVerified: null, frontPulleyClearanceVerified: false, rearPulleyClearanceVerified: false,
  beltlineVerified: false,
  crankLength: null,
  crankInterface: null, batteryId: null, chargerId: null, chargingPortId: null,
  accessoryIds: [], cableLengths: {}, extensionCableLengths: {}, currentStep: 1, hasStarted: false,
}

function normalizePersisted(input: Partial<AnandaConfig> & Record<string, unknown>): Partial<AnandaConfig> {
  return {
    ...input,
    sellRegion: input.sellRegion ?? (input.region as string | null | undefined) ?? null,
    speedLimitKmh: input.speedLimitKmh ?? (input.speedLimit as number | null | undefined) ?? null,
    tyreCircumferenceMm: input.tyreCircumferenceMm ?? null,
    tyreWidth: input.tyreWidth ?? (input.tyreSize as string | null | undefined) ?? null,
    tyreIsoSize: input.tyreIsoSize ?? null,
    regulation: input.regulation ?? null,
    ratedPowerW: input.ratedPowerW ?? null,
    packageBaseline: input.packageBaseline ?? {},
    productTargets: input.productTargets
      ? {
          ...defaultProductTargets,
          ...(input.productTargets as Partial<ProductTargets>),
          weight: { ...defaultProductTargets.weight, ...(input.productTargets as ProductTargets).weight },
          performance: { ...defaultProductTargets.performance, ...(input.productTargets as ProductTargets).performance },
          functions: { ...defaultProductTargets.functions, ...(input.productTargets as ProductTargets).functions },
          ambition: { ...defaultProductTargets.ambition, ...(input.productTargets as ProductTargets).ambition },
        }
      : defaultProductTargets,
  }
}

export const useAnandaStore = create<AnandaConfig & AnandaActions>()(
  persist(
    (set) => ({
      ...defaultState,
      setField: (key, value) => set((state) => ({ ...state, [key]: value })),
      setMarket: (market) => set((state) => ({ ...state, sellRegion: market, regulation: null, speedLimitKmh: null, ratedPowerW: null })),
      setRegulation: (regulation) => set((state) => ({ ...state, regulation })),
      setDriveType: (driveType) => set((state) => ({ ...state, driveType, packageId: null, motorId: null, controllerId: null, torqueSensorId: null, cadenceSensorId: null, speedSensorId: null, displayId: null, remoteId: null, batteryId: null, chargerId: null, chargingPortId: null, skippedItems: [] })),
      setVoltage: (voltagePlatform) => set((state) => ({ ...state, voltagePlatform, packageId: null, motorId: null, controllerId: null, batteryId: null, chargerId: null, chargingPortId: null, skippedItems: [] })),
      setBikeCategory: (bikeCategory) => set((state) => ({ ...state, bikeCategory, wheelSize: null, tyreWidth: null, tyreIsoSize: null, tyreCircumferenceMm: null })),
      setProductTarget: (patch) => set((state) => ({
        productTargets: {
          ...state.productTargets,
          ...(patch.mode !== undefined ? { mode: patch.mode } : {}),
          ...(patch.presetId !== undefined ? { presetId: patch.presetId } : {}),
          weight: { ...state.productTargets.weight, ...(patch.weight ?? {}) },
          performance: { ...state.productTargets.performance, ...(patch.performance ?? {}) },
          functions: { ...state.productTargets.functions, ...(patch.functions ?? {}) },
          ambition: { ...state.productTargets.ambition, ...(patch.ambition ?? {}) },
        },
      })),
      setAdvancedOverride: (driveType, voltagePlatform) => set(() => ({ advancedDriveType: driveType, advancedVoltagePlatform: voltagePlatform })),
      clearAdvancedOverride: () => set(() => ({ advancedDriveType: null, advancedVoltagePlatform: null })),
      applyRecommendedSolution: (solutionId, defaults) => set(() => ({
        selectedSolutionId: solutionId,
        driveType: defaults.driveType,
        voltagePlatform: defaults.voltagePlatform,
        packageId: defaults.motorId,
        motorId: defaults.motorId,
        controllerId: defaults.controllerId,
        displayId: defaults.displayId,
        batteryId: defaults.batteryId,
        chargerId: defaults.chargerId,
        chargingPortId: defaults.chargingPortId,
        skippedItems: [],
        targetStatusBaseline: defaults.baseline,
        packageBaseline: {
          motorId: defaults.motorId,
          controllerId: defaults.controllerId,
          displayId: defaults.displayId,
          batteryId: defaults.batteryId,
          chargerId: defaults.chargerId,
          chargingPortId: defaults.chargingPortId,
        },
      })),
      setPackageBaseline: (baseline) => set((state) => ({ packageBaseline: { ...state.packageBaseline, ...baseline } })),
      selectPackage: (packageId, defaults) => set((state) => ({ ...state, ...defaults, packageId, skippedItems: [] })),
      setItemSkipped: (key, skipped) => set((state) => ({
        skippedItems: skipped ? Array.from(new Set([...state.skippedItems, key])) : state.skippedItems.filter((item) => item !== key),
      })),
      toggleAccessory: (id) => set((state) => ({ accessoryIds: state.accessoryIds.includes(id) ? state.accessoryIds.filter((item) => item !== id) : [...state.accessoryIds, id] })),
      setCableLength: (connection, length) => set((state) => ({ cableLengths: { ...state.cableLengths, [connection]: length } })),
      setExtensionCableLength: (connection, length) => set((state) => {
        if (length === null) {
          const next = { ...state.extensionCableLengths }
          delete next[connection]
          return { extensionCableLengths: next }
        }
        return { extensionCableLengths: { ...state.extensionCableLengths, [connection]: length } }
      }),
      setDrivetrainType: (drivetrainType) => set((state) => ({
        ...state, drivetrainType, transmissionType: null, selectedComponentIds: [], frontTeeth: null, rearTeeth: null,
        selectedBeltId: null, drivetrainWarnings: [], drivetrainErrors: [], warningsAcknowledged: false,
      })),
      setTransmissionType: (transmissionType) => set((state) => ({
        ...state, transmissionType, selectedComponentIds: [], frontTeeth: null, rearTeeth: null, selectedBeltId: null,
        drivetrainWarnings: [], drivetrainErrors: [], warningsAcknowledged: false,
      })),
      resetDrivetrainDownstream: (from) => set((state) => {
        if (from === "type") {
          return { transmissionType: null, selectedComponentIds: [], frontTeeth: null, rearTeeth: null, selectedBeltId: null, drivetrainWarnings: [], drivetrainErrors: [], warningsAcknowledged: false }
        }
        if (from === "transmission") {
          return { selectedComponentIds: [], frontTeeth: null, rearTeeth: null, selectedBeltId: null, drivetrainWarnings: [], drivetrainErrors: [], warningsAcknowledged: false }
        }
        return { drivetrainWarnings: [], drivetrainErrors: [], warningsAcknowledged: false }
      }),
      setStep: (currentStep) => set({ currentStep }),
      nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 9) })),
      prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
      resetConfig: () => set({ ...defaultState, hasStarted: true }),
      startConfiguration: () => set({ hasStarted: true }),
    }),
    {
      name: "ananda-edrive-config-v1",
      merge: (persisted, current) => ({ ...current, ...normalizePersisted((persisted ?? {}) as Partial<AnandaConfig> & Record<string, unknown>) }),
      partialize: (state) => {
        const { setField, setMarket, setRegulation, setDriveType, setVoltage, setBikeCategory, setProductTarget, setAdvancedOverride, clearAdvancedOverride, applyRecommendedSolution, setPackageBaseline, selectPackage, setItemSkipped, toggleAccessory, setCableLength, setExtensionCableLength, setDrivetrainType, setTransmissionType, resetDrivetrainDownstream, setStep, nextStep, prevStep, resetConfig, ...rest } = state
        void setField; void setMarket; void setRegulation; void setDriveType; void setVoltage; void setBikeCategory; void setProductTarget; void setAdvancedOverride; void clearAdvancedOverride; void applyRecommendedSolution; void setPackageBaseline; void selectPackage; void setItemSkipped; void toggleAccessory; void setCableLength; void setExtensionCableLength; void setDrivetrainType; void setTransmissionType; void resetDrivetrainDownstream; void setStep; void nextStep; void prevStep; void resetConfig
        return rest
      },
    },
  ),
)

export { defaultState }
export const hasProjectContext = (state: AnandaConfig) => Boolean(state.sellRegion && state.regulation)
export const hasBikeCategory = (state: AnandaConfig) => Boolean(state.bikeCategory && state.wheelSize && state.tyreCircumferenceMm)
export const hasDrive = (state: AnandaConfig) => Boolean(state.driveType)
export const hasVoltage = (state: AnandaConfig) => Boolean(state.voltagePlatform)
export const hasDriveAndVoltage = (state: AnandaConfig) => hasDrive(state) && hasVoltage(state)
export const hasMotor = (state: AnandaConfig) => Boolean(state.packageId && state.motorId)
export const hasProductTargets = (state: AnandaConfig) =>
  Boolean(
    state.productTargets.ambition.positioning &&
      state.productTargets.ambition.costPriority &&
      (state.productTargets.weight.targetKg != null || state.productTargets.weight.maxKg != null) &&
      state.productTargets.performance.rangeTargetKm != null,
  )
export const hasRecommendedSolution = (state: AnandaConfig) => Boolean(state.selectedSolutionId)

export function packageItemKeys(driveType: AnandaConfig["driveType"]): (keyof AnandaConfig)[] {
  const base: (keyof AnandaConfig)[] = ["motorId", "displayId", "speedSensorId", "batteryId", "chargerId", "chargingPortId"]
  return driveType === "hub" ? ["motorId", "controllerId", "torqueSensorId", ...base.slice(1)] : base
}

const isItemSatisfied = (state: AnandaConfig, key: keyof AnandaConfig) =>
  Boolean(state[key]) || state.skippedItems.includes(key)

export const hasCoreComponents = (state: AnandaConfig) =>
  hasMotor(state) && packageItemKeys(state.driveType).every((key) => isItemSatisfied(state, key))

// Drivetrain configuration now only requires three positive-integer tooth
// counts (front chainring, smallest/largest rear sprocket) — no branded
// chain/cassette/derailleur selection. See lib/ananda-climbing.ts for the
// validation rule (smallest <= largest).
export const hasDrivetrain = (state: AnandaConfig) =>
  Boolean(
    state.frontTeeth != null &&
      state.frontTeeth > 0 &&
      state.rearTeeth != null &&
      state.rearTeeth > 0 &&
      state.largestRearTeeth != null &&
      state.largestRearTeeth > 0 &&
      state.rearTeeth <= state.largestRearTeeth,
  )
export const hasBattery = (state: AnandaConfig) => Boolean(state.batteryId && state.chargerId) || state.skippedItems.includes("batteryId")
export const hasAccessories = (_state: AnandaConfig) => true
export const hasDiagram = (_state: AnandaConfig) => true
