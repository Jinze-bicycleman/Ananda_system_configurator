"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  BikeType,
  RidingStyle,
  Motor,
  Controller,
  Battery,
  Display,
  Chainring,
  Crank,
  Sensor,
  Light,
  Throttle,
  IoTModule,
  MotorType,
  TireType,
  ComplianceStandard,
  DrivetrainResult,
} from "./product-data";
import { calculateDrivetrain } from "./product-data";

export interface SavedSolution {
  id: string;
  name: string;
  country: string;
  complianceStandard: ComplianceStandard;
  bikeType: BikeType;
  tireType: TireType;
  payload: number;
  speedLimit: number;
  ridingStyle: RidingStyle;
  motorType: MotorType;
  motor: Motor;
  controller: Controller | null;
  battery: Battery | null;
  display: Display | null;
  chainring: Chainring | null;
  crank: Crank | null;
  sensors: Sensor[];
  lights: Light[];
  throttle: Throttle | null;
  iotModules: IoTModule[];
  totalWeight: number;
  createdAt: string;
  minSpeed: number;
  maxSpeed: number;
  cadence: number;
  slope: number;
  rearSprocket: number;
  drivetrainResult?: {
    gearRatio: number;
    wheelTorque: number;
    maxClimbGrade: number;
    theoreticalTopSpeed: number;
  };
}

export interface WireConfig {
  length: number; // in meters
  connector: string;
}

export interface WireConfigurations {
  battery: WireConfig;
  controller: WireConfig;
  display: WireConfig;
  throttle: WireConfig;
  brakeLever: WireConfig;
  speedSensor: WireConfig;
  torqueSensor: WireConfig;
  lights: WireConfig;
  iotModule: WireConfig;
}

export interface ConfigState {
  // Step tracking (6 steps total)
  currentStep: number;
  
  // Step 1: Requirements
  country: string;
  complianceStandard: ComplianceStandard;
  bikeType: BikeType | null;
  tireType: TireType;
  payload: number; // 0-300 kg
  speedLimit: number; // 25, 32, 45 km/h
  ridingStyle: RidingStyle;
  
  // Step 2: Motor
  motorType: MotorType;
  voltagePlatform: 36 | 48;
  selectedMotor: Motor | null;
  showLegacyMotors: boolean;
  
  // Step 3: Components
  selectedController: Controller | null;
  selectedBattery: Battery | null;
  selectedDisplay: Display | null;
  selectedChainring: Chainring | null;
  selectedCrank: Crank | null;
  selectedSensors: Sensor[];
  selectedLights: Light[];
  selectedThrottle: Throttle | null;
  selectedIoTModules: IoTModule[];
  
  // Step 4: System Diagram / Wire Configurations
  wireConfigurations: WireConfigurations;
  
  // Step 5: Drivetrain params
  driveType: "chain" | "belt";
  minSpeed: number;
  maxSpeed: number;
  cadence: number;
  slope: number;
  rearSprocket: number;
  
  // Saved Solutions
  savedSolutions: SavedSolution[];
}

interface ConfigActions {
  // Navigation
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  // Step 1: Requirements
  setCountry: (country: string) => void;
  setComplianceStandard: (standard: ComplianceStandard) => void;
  setBikeType: (type: BikeType) => void;
  setTireType: (type: TireType) => void;
  setPayload: (payload: number) => void;
  setSpeedLimit: (limit: number) => void;
  setRidingStyle: (style: RidingStyle) => void;
  
  // Step 2: Motor
  setMotorType: (type: MotorType) => void;
  setVoltagePlatform: (voltage: 36 | 48) => void;
  setMotor: (motor: Motor) => void;
  setShowLegacyMotors: (show: boolean) => void;
  
  // Step 3: Components
  setController: (controller: Controller | null) => void;
  setBattery: (battery: Battery | null) => void;
  setDisplay: (display: Display | null) => void;
  setChainring: (chainring: Chainring | null) => void;
  setCrank: (crank: Crank | null) => void;
  toggleSensor: (sensor: Sensor) => void;
  toggleLight: (light: Light) => void;
  setThrottle: (throttle: Throttle | null) => void;
  toggleIoTModule: (module: IoTModule) => void;
  
  // Step 4: System Diagram / Wire Configurations
  setWireConfig: (component: keyof WireConfigurations, config: Partial<WireConfig>) => void;
  resetWireConfigs: () => void;
  
  // Step 5: Drivetrain
  setDriveType: (type: "chain" | "belt") => void;
  setMinSpeed: (speed: number) => void;
  setMaxSpeed: (speed: number) => void;
  setCadence: (cadence: number) => void;
  setSlope: (slope: number) => void;
  setRearSprocket: (teeth: number) => void;
  
  // Saved Solutions
  saveSolution: (name: string) => void;
  removeSolution: (id: string) => void;
  reset: () => void;
  
  // Computed
  getTotalWeight: () => number;
}

const initialState: ConfigState = {
  currentStep: 1,
  country: "EU",
  complianceStandard: "EN15194",
  bikeType: null,
  tireType: "standard",
  payload: 80,
  speedLimit: 25,
  ridingStyle: "balanced",
  motorType: "mid-drive",
  voltagePlatform: 48,
  selectedMotor: null,
  showLegacyMotors: false,
  selectedController: null,
  selectedBattery: null,
  selectedDisplay: null,
  selectedChainring: null,
  selectedCrank: null,
  selectedSensors: [],
  selectedLights: [],
  selectedThrottle: null,
  selectedIoTModules: [],
  wireConfigurations: {
    battery: { length: 1.0, connector: "XT60" },
    controller: { length: 0.5, connector: "Internal" },
    display: { length: 1.0, connector: "Higo 6-pin" },
    throttle: { length: 1.0, connector: "Julet 3-pin" },
    brakeLever: { length: 1.0, connector: "Higo 2-pin" },
    speedSensor: { length: 1.0, connector: "SM-3P" },
    torqueSensor: { length: 0.5, connector: "Higo 8-pin" },
    lights: { length: 1.5, connector: "SM-2P" },
    iotModule: { length: 0.5, connector: "UART 4-pin" },
  },
  driveType: "chain",
  minSpeed: 15,
  maxSpeed: 35,
  cadence: 80,
  slope: 5,
  rearSprocket: 18,
  savedSolutions: [],
};

export const useConfigStore = create<ConfigState & ConfigActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step) => set({ currentStep: step }),

      nextStep: () => {
        const { currentStep } = get();
        set({ currentStep: Math.min(currentStep + 1, 6) });
      },

      prevStep: () => {
        const { currentStep } = get();
        set({ currentStep: Math.max(currentStep - 1, 1) });
      },

      // Step 1
      setCountry: (country) => set({ country }),
      setComplianceStandard: (standard) => set({ complianceStandard: standard }),
      setBikeType: (type) => set({ bikeType: type }),
      setTireType: (type) => set({ tireType: type }),
      setPayload: (payload) => set({ payload }),
      setSpeedLimit: (limit) => set({ speedLimit: limit }),
      setRidingStyle: (style) => set({ ridingStyle: style }),

      // Step 2
      setMotorType: (type) => {
        set({
          motorType: type,
          selectedMotor: null,
          selectedController: null,
          selectedBattery: null,
        });
      },
      setVoltagePlatform: (voltage) => {
        set({
          voltagePlatform: voltage,
          selectedBattery: null, // Reset battery when voltage changes
        });
      },
      setMotor: (motor) => {
        set({
          selectedMotor: motor,
          selectedController: null,
          selectedBattery: null,
          selectedDisplay: null,
          selectedChainring: null,
          selectedCrank: null,
        });
      },
      setShowLegacyMotors: (show) => set({ showLegacyMotors: show }),

      // Step 3
      setController: (controller) => set({ selectedController: controller }),
      setBattery: (battery) => set({ selectedBattery: battery }),
      setDisplay: (display) => set({ selectedDisplay: display }),
      setChainring: (chainring) => set({ selectedChainring: chainring }),
      setCrank: (crank) => set({ selectedCrank: crank }),
      toggleSensor: (sensor) => {
        const { selectedSensors } = get();
        const exists = selectedSensors.find((s) => s.id === sensor.id);
        if (exists) {
          set({ selectedSensors: selectedSensors.filter((s) => s.id !== sensor.id) });
        } else {
          set({ selectedSensors: [...selectedSensors, sensor] });
        }
      },
      toggleLight: (light) => {
        const { selectedLights } = get();
        const exists = selectedLights.find((l) => l.id === light.id);
        if (exists) {
          set({ selectedLights: selectedLights.filter((l) => l.id !== light.id) });
        } else {
          set({ selectedLights: [...selectedLights, light] });
        }
      },
      setThrottle: (throttle) => set({ selectedThrottle: throttle }),
      toggleIoTModule: (module) => {
        const { selectedIoTModules } = get();
        const exists = selectedIoTModules.find((m) => m.id === module.id);
        if (exists) {
          set({ selectedIoTModules: selectedIoTModules.filter((m) => m.id !== module.id) });
        } else {
          set({ selectedIoTModules: [...selectedIoTModules, module] });
        }
      },

      // Step 4: Wire Configurations
      setWireConfig: (component, config) => {
        const { wireConfigurations } = get();
        set({
          wireConfigurations: {
            ...wireConfigurations,
            [component]: { ...wireConfigurations[component], ...config },
          },
        });
      },
      resetWireConfigs: () => {
        set({
          wireConfigurations: {
            battery: { length: 1.0, connector: "XT60" },
            controller: { length: 0.5, connector: "Internal" },
            display: { length: 1.0, connector: "Higo 6-pin" },
            throttle: { length: 1.0, connector: "Julet 3-pin" },
            brakeLever: { length: 1.0, connector: "Higo 2-pin" },
            speedSensor: { length: 1.0, connector: "SM-3P" },
            torqueSensor: { length: 0.5, connector: "Higo 8-pin" },
            lights: { length: 1.5, connector: "SM-2P" },
            iotModule: { length: 0.5, connector: "UART 4-pin" },
          },
        });
      },

      // Step 5: Drivetrain
      setDriveType: (type) => set({ driveType: type }),
      setMinSpeed: (speed) => set({ minSpeed: speed }),
      setMaxSpeed: (speed) => set({ maxSpeed: speed }),
      setCadence: (cadence) => set({ cadence }),
      setSlope: (slope) => set({ slope }),
      setRearSprocket: (teeth) => set({ rearSprocket: teeth }),

      // Saved Solutions
      saveSolution: (name) => {
        const state = get();
        if (!state.bikeType || !state.selectedMotor) {
          return;
        }

        const totalWeight = state.getTotalWeight();
        const chainringTeeth = state.selectedChainring?.teeth || 42;

        // Calculate drivetrain result
        const drivetrainResult = calculateDrivetrain({
          wheelDiameter: 0.7,
          chainringTeeth,
          rearSprocketTeeth: state.rearSprocket,
          motorTorque: state.selectedMotor.torque,
          cadenceMin: 60,
          cadenceMax: 100,
          riderWeight: 75,
          bikeWeight: 25,
          payload: state.payload,
          isHubMotor: state.selectedMotor.motorType === "hub",
        });

        const newSolution: SavedSolution = {
          id: crypto.randomUUID(),
          name,
          country: state.country,
          complianceStandard: state.complianceStandard,
          bikeType: state.bikeType,
          tireType: state.tireType,
          payload: state.payload,
          speedLimit: state.speedLimit,
          ridingStyle: state.ridingStyle,
          motorType: state.motorType,
          motor: state.selectedMotor,
          controller: state.selectedController,
          battery: state.selectedBattery,
          display: state.selectedDisplay,
          chainring: state.selectedChainring,
          crank: state.selectedCrank,
          sensors: state.selectedSensors,
          lights: state.selectedLights,
          throttle: state.selectedThrottle,
          iotModules: state.selectedIoTModules,
          totalWeight,
          createdAt: new Date().toISOString(),
          minSpeed: state.minSpeed,
          maxSpeed: state.maxSpeed,
          cadence: state.cadence,
          slope: state.slope,
          rearSprocket: state.rearSprocket,
          drivetrainResult: {
            gearRatio: drivetrainResult.gearRatio,
            wheelTorque: drivetrainResult.wheelTorque,
            maxClimbGrade: drivetrainResult.maxClimbGrade,
            theoreticalTopSpeed: drivetrainResult.theoreticalTopSpeed,
          },
        };

        set({ savedSolutions: [...state.savedSolutions, newSolution] });
      },

      removeSolution: (id) => {
        const state = get();
        set({ savedSolutions: state.savedSolutions.filter((s) => s.id !== id) });
      },

      reset: () => {
        const state = get();
        set({
          currentStep: 1,
          country: "EU",
          complianceStandard: "EN15194",
          bikeType: null,
          tireType: "standard",
          payload: 80,
          speedLimit: 25,
          ridingStyle: "balanced",
          motorType: "mid-drive",
          voltagePlatform: 48,
          selectedMotor: null,
          showLegacyMotors: false,
          selectedController: null,
          selectedBattery: null,
          selectedDisplay: null,
          selectedChainring: null,
          selectedCrank: null,
          selectedSensors: [],
          selectedLights: [],
          selectedThrottle: null,
          selectedIoTModules: [],
          wireConfigurations: {
            battery: { length: 1.0, connector: "XT60" },
            controller: { length: 0.5, connector: "Internal" },
            display: { length: 1.0, connector: "Higo 6-pin" },
            throttle: { length: 1.0, connector: "Julet 3-pin" },
            brakeLever: { length: 1.0, connector: "Higo 2-pin" },
            speedSensor: { length: 1.0, connector: "SM-3P" },
            torqueSensor: { length: 0.5, connector: "Higo 8-pin" },
            lights: { length: 1.5, connector: "SM-2P" },
            iotModule: { length: 0.5, connector: "UART 4-pin" },
          },
          driveType: "chain",
          minSpeed: 15,
          maxSpeed: 35,
          cadence: 80,
          slope: 5,
          rearSprocket: 18,
          // Keep saved solutions
          savedSolutions: state.savedSolutions,
        });
      },

      getTotalWeight: () => {
        const state = get();
        let total = 0;
        if (state.selectedMotor) total += state.selectedMotor.weight;
        if (state.selectedController) total += state.selectedController.weight;
        if (state.selectedBattery) total += state.selectedBattery.weight;
        if (state.selectedDisplay) total += state.selectedDisplay.weight;
        if (state.selectedChainring) total += state.selectedChainring.weight;
        if (state.selectedCrank) total += state.selectedCrank.weight;
        state.selectedSensors.forEach((s) => (total += s.weight));
        state.selectedLights.forEach((l) => (total += l.weight));
        if (state.selectedThrottle) total += state.selectedThrottle.weight;
        state.selectedIoTModules.forEach((m) => (total += m.weight));
        return Math.round(total * 100) / 100;
      },
    }),
    {
      name: "ebike-configurator-v4",
    }
  )
);
