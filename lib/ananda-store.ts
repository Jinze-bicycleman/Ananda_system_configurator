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
  voltagePlatform: 36 | 48 | null
  motorId: string | null
  controllerId: string | null
  torqueSensorId: string | null
  cadenceSensorId: string | null
  speedSensorId: string | null
  displayId: string | null
  remoteId: string | null
  drivetrainType: "chain" | "belt" | null
  chainringTeeth: number
  rearSprocketTeeth: number
  cadenceRpm: number
  gearRatio: number | null
  estimatedSpeedKmh: number | null
  estimatedOnWheelTorqueNm: number | null
  gearSystem: string | null
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
  setVoltage: (voltage: 36 | 48) => void
  setBikeCategory: (category: string) => void
  toggleAccessory: (id: string) => void
  setCableLength: (connection: string, length: number) => void
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  resetConfig: () => void
  startConfiguration: () => void
}

const defaultState: AnandaConfig = {
  sellRegion: null, regulation: null, speedLimitKmh: null, ratedPowerW: null,
  bikeCategory: null, wheelSize: null, tyreWidth: null, tyreIsoSize: null, tyreCircumferenceMm: null,
  driveType: null, voltagePlatform: null, motorId: null, controllerId: null,
  torqueSensorId: null, cadenceSensorId: null, speedSensorId: null, displayId: null,
  remoteId: null, drivetrainType: null, chainringTeeth: 42, rearSprocketTeeth: 32,
  cadenceRpm: 80, gearRatio: null, estimatedSpeedKmh: null,
  estimatedOnWheelTorqueNm: null, gearSystem: null, crankLength: null,
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
      setDriveType: (driveType) => set((state) => ({ ...state, driveType, motorId: null, controllerId: null, torqueSensorId: null, cadenceSensorId: null, speedSensorId: null, displayId: null, remoteId: null })),
      setVoltage: (voltagePlatform) => set((state) => ({ ...state, voltagePlatform, motorId: null, controllerId: null, batteryId: null, chargerId: null, chargingPortId: null })),
      setBikeCategory: (bikeCategory) => set((state) => ({ ...state, bikeCategory, wheelSize: null, tyreWidth: null, tyreIsoSize: null, tyreCircumferenceMm: null })),
      toggleAccessory: (id) => set((state) => ({ accessoryIds: state.accessoryIds.includes(id) ? state.accessoryIds.filter((item) => item !== id) : [...state.accessoryIds, id] })),
      setCableLength: (connection, length) => set((state) => ({ cableLengths: { ...state.cableLengths, [connection]: length } })),
      setStep: (currentStep) => set({ currentStep }),
      nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 11) })),
      prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
      resetConfig: () => set({ ...defaultState, hasStarted: true }),
      startConfiguration: () => set({ hasStarted: true }),
    }),
    {
      name: "ananda-edrive-config-v1",
      merge: (persisted, current) => ({ ...current, ...normalizePersisted((persisted ?? {}) as Partial<AnandaConfig> & Record<string, unknown>) }),
      partialize: (state) => {
        const { setField, setMarket, setRegulation, setDriveType, setVoltage, setBikeCategory, toggleAccessory, setCableLength, setStep, nextStep, prevStep, resetConfig, ...rest } = state
        void setField; void setMarket; void setRegulation; void setDriveType; void setVoltage; void setBikeCategory; void toggleAccessory; void setCableLength; void setStep; void nextStep; void prevStep; void resetConfig
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
export const hasMotor = (state: AnandaConfig) => Boolean(state.motorId)
export const hasCoreComponents = (state: AnandaConfig) => Boolean(state.displayId && state.speedSensorId)
export const hasDrivetrain = (state: AnandaConfig) => Boolean(state.drivetrainType)
export const hasBattery = (state: AnandaConfig) => Boolean(state.batteryId && state.chargerId)
export const hasAccessories = (_state: AnandaConfig) => true
export const hasDiagram = (_state: AnandaConfig) => true
