"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

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
  frontTeeth: number | null
  rearTeeth: number | null
  selectedBeltId: string | null
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
  selectPackage: (packageId: string, defaults: Partial<AnandaConfig>) => void
  setItemSkipped: (key: string, skipped: boolean) => void
  toggleAccessory: (id: string) => void
  setCableLength: (connection: string, length: number) => void
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
  driveType: null, voltagePlatform: null, packageId: null, motorId: null, controllerId: null,
  torqueSensorId: null, cadenceSensorId: null, speedSensorId: null, displayId: null,
  remoteId: null, skippedItems: [], drivetrainType: null, chainringTeeth: 42, rearSprocketTeeth: 32,
  cadenceRpm: 80, gearRatio: null, estimatedSpeedKmh: null,
  estimatedOnWheelTorqueNm: null, gearSystem: null,
  transmissionType: null, selectedComponentIds: [], frontTeeth: null, rearTeeth: null,
  selectedBeltId: null, centerDistanceMm: null, adjustmentMm: null, drivetrainEfficiency: 0.95,
  drivetrainWarnings: [], drivetrainErrors: [], warningsAcknowledged: false, gvwKg: null,
  frameHasBeltOpening: null, beltAlternateInstallationApproved: false, tensioningMethod: null,
  frameStiffnessVerified: null, frontPulleyClearanceVerified: false, rearPulleyClearanceVerified: false,
  beltlineVerified: false,
  crankLength: null,
  crankInterface: null, batteryId: null, chargerId: null, chargingPortId: null,
  accessoryIds: [], cableLengths: {}, currentStep: 1, hasStarted: false,
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
      selectPackage: (packageId, defaults) => set((state) => ({ ...state, ...defaults, packageId, skippedItems: [] })),
      setItemSkipped: (key, skipped) => set((state) => ({
        skippedItems: skipped ? Array.from(new Set([...state.skippedItems, key])) : state.skippedItems.filter((item) => item !== key),
      })),
      toggleAccessory: (id) => set((state) => ({ accessoryIds: state.accessoryIds.includes(id) ? state.accessoryIds.filter((item) => item !== id) : [...state.accessoryIds, id] })),
      setCableLength: (connection, length) => set((state) => ({ cableLengths: { ...state.cableLengths, [connection]: length } })),
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
        const { setField, setMarket, setRegulation, setDriveType, setVoltage, setBikeCategory, selectPackage, setItemSkipped, toggleAccessory, setCableLength, setDrivetrainType, setTransmissionType, resetDrivetrainDownstream, setStep, nextStep, prevStep, resetConfig, ...rest } = state
        void setField; void setMarket; void setRegulation; void setDriveType; void setVoltage; void setBikeCategory; void selectPackage; void setItemSkipped; void toggleAccessory; void setCableLength; void setDrivetrainType; void setTransmissionType; void resetDrivetrainDownstream; void setStep; void nextStep; void prevStep; void resetConfig
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

export function packageItemKeys(driveType: AnandaConfig["driveType"]): (keyof AnandaConfig)[] {
  const base: (keyof AnandaConfig)[] = ["motorId", "displayId", "speedSensorId", "batteryId", "chargerId", "chargingPortId"]
  return driveType === "hub" ? ["motorId", "controllerId", "torqueSensorId", ...base.slice(1)] : base
}

const isItemSatisfied = (state: AnandaConfig, key: keyof AnandaConfig) =>
  Boolean(state[key]) || state.skippedItems.includes(key)

export const hasCoreComponents = (state: AnandaConfig) =>
  hasMotor(state) && packageItemKeys(state.driveType).every((key) => isItemSatisfied(state, key))

export const hasDrivetrain = (state: AnandaConfig) =>
  Boolean(
    state.drivetrainType &&
      state.transmissionType &&
      state.selectedComponentIds.length > 0 &&
      state.drivetrainErrors.length === 0 &&
      (state.drivetrainWarnings.length === 0 || state.warningsAcknowledged),
  )
export const hasBattery = (state: AnandaConfig) => Boolean(state.batteryId && state.chargerId) || state.skippedItems.includes("batteryId")
export const hasAccessories = (_state: AnandaConfig) => true
export const hasDiagram = (_state: AnandaConfig) => true
