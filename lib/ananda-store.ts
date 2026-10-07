"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export const DEFAULT_SMALLEST_REAR_TEETH = 11
export const DEFAULT_LARGEST_REAR_TEETH = 43

export type BluetoothAppChoice = "ananda_app" | "third_party"

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
  motorId: string | null
  controllerId: string | null
  torqueSensorId: string | null
  cadenceSensorId: string | null
  speedSensorId: string | null
  displayId: string | null
  remoteId: string | null
  batteryId: string | null
  chargerId: string | null
  chargingPortId: string | null
  skippedItems: string[]
  // Package-configuration parts the customer sources from their own supplier.
  // A key's presence means the "3rd party supplier" warning was accepted; the
  // value is the supplier name (may be empty until the user fills it in).
  thirdPartySuppliers: Record<string, string>
  // Drivetrain (stage 4) — tooth counts. `frontTeeth` is the front chainring;
  // `rearTeeth` / `largestRearTeeth` are the smallest / largest rear sprocket.
  frontTeeth: number | null
  rearTeeth: number | null
  largestRearTeeth: number | null
  // Teeth of the chainring picked under Bike Components. When set, the
  // drivetrain stage's front chainring teeth must match it.
  selectedChainringTeeth: number | null
  drivetrainSystemKind: "derailleur" | "gear_hub" | null
  hubGearUpRatio: number | null
  hubGearDownRatio: number | null
  gvwKg: number | null
  climbingRiderWeightKg: number
  climbingAssistanceModeKey: string
  climbingPedalEffortKey: "relaxed" | "normal" | "hard"
  // Accessories (stage 5)
  accessoryIds: string[]
  lightSpecs: Record<string, { voltageV: number | null; currentA: number | null; powerW: number | null }>
  throttleStartMode: "zero_start" | "speed_gate" | null
  throttleSpeedGateKmh: number | null
  customAccessories: { id: string; name: string }[]
  bluetoothApp: BluetoothAppChoice | null
  bluetoothThirdPartyAcknowledged: boolean
  // System diagram (stage 6)
  cableLengths: Record<string, number>
  // How each connection's length was chosen: from the standard catalog list
  // or typed in as a custom length (which needs sales review).
  cableLengthModes: Record<string, "standard" | "custom">
  // Optional extension cable length (metres), keyed by connection name.
  extensionCableLengths: Record<string, number>
  connectorSourcing: "standard" | "custom" | null
  connectorCustomAcknowledged: boolean
  // Package configuration — HMI communication-protocol filter and bike
  // component (chainring / crank / spider) selections.
  hmiProtocolPreference: "can" | "uart"
  bikeComponentSelections: Record<string, string | null>
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
  setItemSkipped: (key: string, skipped: boolean) => void
  /** Picks an Ananda product for a package item and drops any 3rd-party supplier set on it. */
  selectPackageItem: (key: PackageItemKey, id: string) => void
  /** Marks a package item as customer-sourced from a 3rd-party supplier (call after the warning is accepted). */
  enableThirdParty: (key: PackageItemKey) => void
  setThirdPartySupplierName: (key: PackageItemKey, name: string) => void
  disableThirdParty: (key: PackageItemKey) => void
  toggleAccessory: (id: string) => void
  setCableLength: (connection: string, length: number, mode?: "standard" | "custom") => void
  /** Sets the optional extension cable length for a connection; pass `null` to remove it. */
  setExtensionCableLength: (connection: string, length: number | null) => void
  setStep: (step: number) => void
  resetConfig: () => void
  startConfiguration: () => void
  setLightSpec: (accessoryId: string, patch: Partial<{ voltageV: number | null; currentA: number | null; powerW: number | null }>) => void
  addCustomAccessory: (name: string) => void
  removeCustomAccessory: (id: string) => void
  updateCustomAccessory: (id: string, name: string) => void
}

export type PackageItemKey =
  | "controllerId"
  | "torqueSensorId"
  | "speedSensorId"
  | "displayId"
  | "batteryId"
  | "chargerId"
  | "chargingPortId"

const defaultState: AnandaConfig = {
  sellRegion: null, regulation: null, speedLimitKmh: null, ratedPowerW: null,
  bikeCategory: null, wheelSize: null, tyreWidth: null, tyreIsoSize: null, tyreCircumferenceMm: null,
  driveType: null, voltagePlatform: null,
  motorId: null, controllerId: null, torqueSensorId: null, cadenceSensorId: null, speedSensorId: null,
  displayId: null, remoteId: null, batteryId: null, chargerId: null, chargingPortId: null,
  skippedItems: [], thirdPartySuppliers: {},
  frontTeeth: null, rearTeeth: DEFAULT_SMALLEST_REAR_TEETH, largestRearTeeth: DEFAULT_LARGEST_REAR_TEETH,
  selectedChainringTeeth: null,
  drivetrainSystemKind: null, hubGearUpRatio: null, hubGearDownRatio: null, gvwKg: null,
  climbingRiderWeightKg: 75, climbingAssistanceModeKey: "eco", climbingPedalEffortKey: "normal",
  accessoryIds: [], lightSpecs: {}, throttleStartMode: null, throttleSpeedGateKmh: 15, customAccessories: [],
  bluetoothApp: null, bluetoothThirdPartyAcknowledged: false,
  cableLengths: {}, cableLengthModes: {}, extensionCableLengths: {}, connectorSourcing: null, connectorCustomAcknowledged: false,
  hmiProtocolPreference: "can", bikeComponentSelections: {},
  currentStep: 1, hasStarted: false,
}

const PERSIST_VERSION = 2

// Version 2 removed the "Recommended Solutions" stage (and the product-target
// inputs that fed it), so stored step numbers shift down by one past stage 2.
function migratePersisted(persisted: unknown, fromVersion: number): Partial<AnandaConfig> {
  const input = { ...((persisted ?? {}) as Record<string, unknown>) }
  if (fromVersion < 2) {
    const oldStep = typeof input.currentStep === "number" ? input.currentStep : 1
    input.currentStep = Math.max(1, oldStep <= 2 ? oldStep : oldStep - 1)
    if (input.rearTeeth == null) input.rearTeeth = DEFAULT_SMALLEST_REAR_TEETH
    if (input.largestRearTeeth == null) input.largestRearTeeth = DEFAULT_LARGEST_REAR_TEETH
  }
  const known = new Set(Object.keys(defaultState))
  return Object.fromEntries(Object.entries(input).filter(([key]) => known.has(key))) as Partial<AnandaConfig>
}

export const useAnandaStore = create<AnandaConfig & AnandaActions>()(
  persist(
    (set) => ({
      ...defaultState,
      setField: (key, value) => set((state) => ({ ...state, [key]: value })),
      setMarket: (market) => set((state) => ({ ...state, sellRegion: market, regulation: null, speedLimitKmh: null, ratedPowerW: null })),
      setRegulation: (regulation) => set((state) => ({ ...state, regulation })),
      setDriveType: (driveType) => set((state) => ({ ...state, driveType, motorId: null, controllerId: null, torqueSensorId: null, cadenceSensorId: null, speedSensorId: null, displayId: null, remoteId: null, batteryId: null, chargerId: null, chargingPortId: null, skippedItems: [], thirdPartySuppliers: {} })),
      setVoltage: (voltagePlatform) => set((state) => ({ ...state, voltagePlatform, motorId: null, controllerId: null, batteryId: null, chargerId: null, chargingPortId: null, skippedItems: [], thirdPartySuppliers: {} })),
      setBikeCategory: (bikeCategory) => set((state) => ({ ...state, bikeCategory, wheelSize: null, tyreWidth: null, tyreIsoSize: null, tyreCircumferenceMm: null })),
      setItemSkipped: (key, skipped) => set((state) => ({
        skippedItems: skipped ? Array.from(new Set([...state.skippedItems, key])) : state.skippedItems.filter((item) => item !== key),
      })),
      selectPackageItem: (key, id) => set((state) => {
        const { [key]: _removed, ...suppliers } = state.thirdPartySuppliers
        void _removed
        return { [key]: id, thirdPartySuppliers: suppliers, skippedItems: state.skippedItems.filter((item) => item !== key) }
      }),
      enableThirdParty: (key) => set((state) => ({
        [key]: null,
        skippedItems: state.skippedItems.filter((item) => item !== key),
        thirdPartySuppliers: { ...state.thirdPartySuppliers, [key]: state.thirdPartySuppliers[key] ?? "" },
      })),
      setThirdPartySupplierName: (key, name) => set((state) => ({ thirdPartySuppliers: { ...state.thirdPartySuppliers, [key]: name } })),
      disableThirdParty: (key) => set((state) => {
        const { [key]: _removed, ...suppliers } = state.thirdPartySuppliers
        void _removed
        return { thirdPartySuppliers: suppliers }
      }),
      toggleAccessory: (id) => set((state) => ({ accessoryIds: state.accessoryIds.includes(id) ? state.accessoryIds.filter((item) => item !== id) : [...state.accessoryIds, id] })),
      setCableLength: (connection, length, mode = "standard") => set((state) => ({
        cableLengths: { ...state.cableLengths, [connection]: length },
        cableLengthModes: { ...state.cableLengthModes, [connection]: mode },
      })),
      setExtensionCableLength: (connection, length) => set((state) => {
        if (length === null) {
          const next = { ...state.extensionCableLengths }
          delete next[connection]
          return { extensionCableLengths: next }
        }
        return { extensionCableLengths: { ...state.extensionCableLengths, [connection]: length } }
      }),
      setStep: (currentStep) => set({ currentStep }),
      resetConfig: () => set({ ...defaultState, hasStarted: true }),
      startConfiguration: () => set({ hasStarted: true }),
      setLightSpec: (accessoryId, patch) => set((state) => {
        const existing = state.lightSpecs[accessoryId] ?? { voltageV: null, currentA: null, powerW: null }
        return { lightSpecs: { ...state.lightSpecs, [accessoryId]: { ...existing, ...patch } } }
      }),
      addCustomAccessory: (name) => set((state) => ({
        customAccessories: [...state.customAccessories, { id: `custom-${Date.now()}-${Math.round(Math.random() * 1000)}`, name }],
      })),
      removeCustomAccessory: (id) => set((state) => ({ customAccessories: state.customAccessories.filter((a) => a.id !== id) })),
      updateCustomAccessory: (id, name) => set((state) => ({
        customAccessories: state.customAccessories.map((a) => (a.id === id ? { ...a, name } : a)),
      })),
    }),
    {
      name: "ananda-edrive-config-v1",
      version: PERSIST_VERSION,
      migrate: (persisted, version) => migratePersisted(persisted, version) as AnandaConfig & AnandaActions,
      partialize: (state) =>
        Object.fromEntries(Object.entries(state).filter(([, value]) => typeof value !== "function")) as unknown as AnandaConfig & AnandaActions,
    },
  ),
)

export { defaultState }

export const hasProjectContext = (state: AnandaConfig) => Boolean(state.sellRegion && state.regulation)
export const hasBikeCategory = (state: AnandaConfig) => Boolean(state.bikeCategory && state.wheelSize && state.tyreCircumferenceMm)
export const hasDriveAndVoltage = (state: AnandaConfig) => Boolean(state.driveType && state.voltagePlatform)
export const hasMotor = (state: AnandaConfig) => Boolean(state.motorId)

export function packageItemKeys(driveType: AnandaConfig["driveType"]): (keyof AnandaConfig)[] {
  const base: (keyof AnandaConfig)[] = ["motorId", "displayId", "speedSensorId", "batteryId", "chargerId", "chargingPortId"]
  return driveType === "hub" ? ["motorId", "controllerId", "torqueSensorId", ...base.slice(1)] : base
}

export const hasThirdPartySupplier = (state: AnandaConfig, key: string) => key in state.thirdPartySuppliers

export const isItemSatisfied = (state: AnandaConfig, key: keyof AnandaConfig) =>
  Boolean(state[key]) ||
  state.skippedItems.includes(key) ||
  (hasThirdPartySupplier(state, key) && state.thirdPartySuppliers[key].trim().length > 0)

export const hasCoreComponents = (state: AnandaConfig) =>
  hasMotor(state) && packageItemKeys(state.driveType).every((key) => isItemSatisfied(state, key))

/** Why the front chainring teeth do not match the chosen Bike Components chainring, or null when they agree. */
export const chainringMismatch = (state: AnandaConfig) =>
  state.selectedChainringTeeth != null && state.frontTeeth != null && state.frontTeeth !== state.selectedChainringTeeth
    ? { entered: state.frontTeeth, expected: state.selectedChainringTeeth }
    : null

// The drivetrain stage needs three positive tooth counts (smallest rear
// sprocket <= largest), and the front count must agree with the chainring
// selected under Bike Components.
export const hasDrivetrain = (state: AnandaConfig) =>
  Boolean(
    state.frontTeeth != null &&
      state.frontTeeth > 0 &&
      state.rearTeeth != null &&
      state.rearTeeth > 0 &&
      state.largestRearTeeth != null &&
      state.largestRearTeeth > 0 &&
      state.rearTeeth <= state.largestRearTeeth &&
      !chainringMismatch(state),
  )
