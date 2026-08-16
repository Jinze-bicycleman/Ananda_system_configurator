// E-Bike Powertrain Product Data - B2B Configuration Platform
// 7000 Series prioritized as flagship products
// NO PRICES - Technical specifications only

// ============ TYPES ============
export type BikeType = "cargo" | "city" | "mountain" | "fat-tire";
export type RidingStyle = "climbing" | "speed" | "balanced";
export type MotorSeries = "7000" | "Legacy";
export type MotorType = "mid-drive" | "hub";
export type TireType = "standard" | "fat";
export type ComplianceStandard = "EN15194" | "UL2849" | "none";

// ============ INTERFACES ============

export interface Motor {
  id: string;
  model: string;
  series: MotorSeries;
  motorType: MotorType;
  voltage: number;
  torque: number; // Nm
  peakPower?: string; // e.g., "650W/750W" for 36V/48V
  weight: number; // kg
  hasIntegratedController: boolean;
  compatibleBikeTypes: BikeType[];
  imageUrl?: string;
  description?: string;
}

export interface Controller {
  id: string;
  model: string;
  current: number; // A
  voltage: string; // e.g., "48-52V"
  weight: number; // kg
  compatibleMotorIds: string[];
  imageUrl?: string;
}

export interface Battery {
  id: string;
  model: string;
  voltage: number;
  capacity: number; // Ah
  capacityWh: number; // Wh
  discharge: number; // A
  weight: number; // kg
  compatibleMotorIds: string[];
  imageUrl?: string;
}

export interface Display {
  id: string;
  model: string;
  weight: number; // kg
  compatible: string; // "All 7000 series" or "All"
  integrationType?: string; // "Frame Integrated", "Stem Integrated", etc.
  imageUrl?: string;
}

export interface Chainring {
  id: string;
  model: string;
  teeth: number;
  weight: number; // kg
  imageUrl?: string;
}

export type CrankType = "JIS" | "ISIS";

export interface Crank {
  id: string;
  length: number; // mm
  crankType: CrankType;
  compatibleMotorIds: string[]; // JIS for 7100, ISIS for 7200/7600
  weight: number; // kg
  imageUrl?: string;
}

// New component interfaces
export interface Sensor {
  id: string;
  type: "torque" | "speed";
  name: string;
  weight: number; // kg
}

export interface Light {
  id: string;
  type: "front" | "rear" | "turn-signal";
  name: string;
  weight: number; // kg
}

export interface Throttle {
  id: string;
  model: string;
  weight: number; // kg
}

export interface IoTModule {
  id: string;
  type: "gps" | "4g" | "bluetooth";
  name: string;
  weight: number; // kg
}

export interface Solution {
  id: string;
  name: string;
  bikeType: BikeType;
  payload: number;
  speedLimit: number;
  ridingStyle: RidingStyle;
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
  // Drivetrain inputs
  minSpeed: number;
  maxSpeed: number;
  cadence: number;
  slope: number;
  rearSprocket: number;
}

// ============ COUNTRY & COMPLIANCE DATA ============

export interface CountryRegulation {
  code: string;
  name: string;
  standards: string[];
  speedLimit: number; // km/h
  powerLimit: number; // W
  notes?: string;
}

export const countryRegulations: CountryRegulation[] = [
  { code: "EU", name: "European Union", standards: ["EN15194"], speedLimit: 25, powerLimit: 250 },
  { code: "US", name: "United States", standards: ["UL2849"], speedLimit: 32, powerLimit: 750, notes: "State varies: 20-28 mph typical" },
  { code: "CN", name: "China", standards: ["GB17761"], speedLimit: 25, powerLimit: 400 },
  { code: "UK", name: "United Kingdom", standards: ["EAPC"], speedLimit: 25, powerLimit: 250 },
  { code: "AU", name: "Australia", standards: ["UL2849"], speedLimit: 25, powerLimit: 250, notes: "Mandatory 2025" },
  { code: "CA", name: "Canada", standards: ["Federal"], speedLimit: 32, powerLimit: 500 },
  { code: "KR", name: "South Korea", standards: ["KC"], speedLimit: 25, powerLimit: 250, notes: "Throttle prohibited" },
  { code: "JP", name: "Japan", standards: ["JIS"], speedLimit: 24, powerLimit: 250, notes: "Assist ratio limits" },
  { code: "IN", name: "India", standards: ["AIS", "BIS"], speedLimit: 25, powerLimit: 250 },
  { code: "BR", name: "Brazil", standards: ["INMETRO"], speedLimit: 25, powerLimit: 350 },
  { code: "TR", name: "Turkey", standards: ["TSE EN15194"], speedLimit: 25, powerLimit: 250 },
  { code: "IL", name: "Israel", standards: [], speedLimit: 25, powerLimit: 250 },
  { code: "ZA", name: "South Africa", standards: ["NRCS"], speedLimit: 25, powerLimit: 250 },
  { code: "AR", name: "Argentina", standards: ["IRAM"], speedLimit: 25, powerLimit: 500 },
  { code: "MX", name: "Mexico", standards: ["NOM-151"], speedLimit: 25, powerLimit: 250 },
];

// Legacy export for backwards compatibility
export const countries = countryRegulations.map((c) => ({ code: c.code, name: c.name }));

export const complianceStandards: { value: ComplianceStandard; label: string; description: string; speedLimit?: number }[] = [
  { value: "EN15194", label: "EN15194", description: "European standard (25 km/h)", speedLimit: 25 },
  { value: "UL2849", label: "UL2849", description: "US safety standard (32 km/h typical)", speedLimit: 32 },
  { value: "none", label: "None", description: "No specific compliance requirement" },
];

export function getSpeedLimitForCountry(countryCode: string): number {
  const country = countryRegulations.find((c) => c.code === countryCode);
  return country?.speedLimit || 25;
}

export function getPowerLimitForCountry(countryCode: string): number {
  const country = countryRegulations.find((c) => c.code === countryCode);
  return country?.powerLimit || 250;
}

export function getCountryRegulation(countryCode: string): CountryRegulation | undefined {
  return countryRegulations.find((c) => c.code === countryCode);
}

// ============ MOTOR DATA ============
// 7000 Series displayed FIRST with "Recommended" badge

export const motors: Motor[] = [
  // 7000 Series - Mid-Drive (shown first)
  {
    id: "7100",
    model: "7100",
    series: "7000",
    motorType: "mid-drive",
    voltage: 48, // 36V/48V compatible
    torque: 85,
    peakPower: "600W/700W",
    weight: 2.9,
    hasIntegratedController: true,
    compatibleBikeTypes: ["cargo", "city", "mountain", "fat-tire"],
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/M7100%20-%203.png-N1ciwtVdyYVa1J4LnV9XX4GCnGqrg6.jpeg",
    description: "Optimal for city commuters with great value vs performance balance.",
  },
  {
    id: "7200",
    model: "7200",
    series: "7000",
    motorType: "mid-drive",
    voltage: 48, // 36V/48V compatible
    torque: 100,
    peakPower: "650W/750W",
    weight: 2.7,
    hasIntegratedController: true,
    compatibleBikeTypes: ["cargo", "city", "mountain", "fat-tire"],
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/M7200-2-7onX9vobxRt5uZfFX1ctFrKTIVNiTP.png",
    description: "Our do-it-all motor in the 7000 series family, suitable for city commute and carrying loads for your bike trips.",
  },
  {
    id: "7600",
    model: "7600",
    series: "7000",
    motorType: "mid-drive",
    voltage: 48, // 36V/48V compatible
    torque: 120,
    peakPower: "750W",
    weight: 2.8,
    hasIntegratedController: true,
    compatibleBikeTypes: ["cargo", "city", "mountain", "fat-tire"],
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/M7600-2-tdNVaaJFYa3H3LZBSxFP8Pfi8Hw8Bn.png",
    description: "Our performance motor designed for challenging terrains, highly responsive with improved heat management for consistent performance.",
  },
  // Legacy Series Mid-Drive (shown below, lower priority)
  {
    id: "M100",
    model: "M100",
    series: "Legacy",
    motorType: "mid-drive",
    voltage: 48,
    torque: 65,
    weight: 3.8,
    hasIntegratedController: false,
    compatibleBikeTypes: ["city"],
  },
  {
    id: "M230",
    model: "M230",
    series: "Legacy",
    motorType: "mid-drive",
    voltage: 48,
    torque: 80,
    weight: 4.2,
    hasIntegratedController: false,
    compatibleBikeTypes: ["cargo", "city", "mountain"],
  },
  // Hub Motors
  {
    id: "R900",
    model: "R900",
    series: "Legacy",
    motorType: "hub",
    voltage: 48,
    torque: 55,
    weight: 3.2,
    hasIntegratedController: false,
    compatibleBikeTypes: ["city", "cargo"],
    description: "Reliable hub motor for urban commuting.",
  },
  {
    id: "M131",
    model: "M131",
    series: "Legacy",
    motorType: "hub",
    voltage: 48,
    torque: 65,
    weight: 3.5,
    hasIntegratedController: false,
    compatibleBikeTypes: ["city", "cargo", "fat-tire"],
    description: "Versatile hub motor with higher torque output.",
  },
  {
    id: "M99",
    model: "M99",
    series: "Legacy",
    motorType: "hub",
    voltage: 36,
    torque: 45,
    weight: 2.8,
    hasIntegratedController: false,
    compatibleBikeTypes: ["city"],
    description: "Lightweight 36V hub motor for light city bikes.",
  },
  {
    id: "R210",
    model: "R210",
    series: "Legacy",
    motorType: "hub",
    voltage: 48,
    torque: 75,
    weight: 4.0,
    hasIntegratedController: false,
    compatibleBikeTypes: ["cargo", "city", "fat-tire"],
    description: "High-torque hub motor for cargo and heavy-duty applications.",
  },
];

// ============ CONTROLLER DATA ============

export const controllers: Controller[] = [
  {
    id: "C-35A",
    model: "C-35A",
    current: 35,
    voltage: "36-48V",
    weight: 0.4,
    compatibleMotorIds: ["7100", "7200", "7600"],
  },
  {
    id: "C-25A",
    model: "C-25A",
    current: 25,
    voltage: "36V",
    weight: 0.3,
    compatibleMotorIds: ["M99"],
  },
  {
    id: "C-30A",
    model: "C-30A",
    current: 30,
    voltage: "36-48V",
    weight: 0.35,
    compatibleMotorIds: ["M100", "M230", "R900", "M131", "R210"],
  },
  {
    id: "C-45A",
    model: "C-45A",
    current: 45,
    voltage: "48V",
    weight: 0.5,
    compatibleMotorIds: ["R210", "M131"],
  },
];

// ============ BATTERY DATA ============
// 5 capacity options (320Wh, 500Wh, 600Wh, 720Wh, 800Wh) for both 36V and 48V

export const batteries: Battery[] = [
  // 48V Batteries
  {
    id: "B-48V-320",
    model: "48V 320Wh",
    voltage: 48,
    capacity: 6.7,
    capacityWh: 320,
    discharge: 20,
    weight: 2.8,
    compatibleMotorIds: ["7100", "7200", "7600", "M100", "M230", "R900", "M131", "R210"],
  },
  {
    id: "B-48V-500",
    model: "48V 500Wh",
    voltage: 48,
    capacity: 10.4,
    capacityWh: 500,
    discharge: 25,
    weight: 3.5,
    compatibleMotorIds: ["7100", "7200", "7600", "M100", "M230", "R900", "M131", "R210"],
  },
  {
    id: "B-48V-600",
    model: "48V 600Wh",
    voltage: 48,
    capacity: 12.5,
    capacityWh: 600,
    discharge: 30,
    weight: 4.0,
    compatibleMotorIds: ["7100", "7200", "7600", "M100", "M230", "R900", "M131", "R210"],
  },
  {
    id: "B-48V-720",
    model: "48V 720Wh",
    voltage: 48,
    capacity: 15,
    capacityWh: 720,
    discharge: 35,
    weight: 4.8,
    compatibleMotorIds: ["7100", "7200", "7600", "M230", "R210"],
  },
  {
    id: "B-48V-800",
    model: "48V 800Wh",
    voltage: 48,
    capacity: 16.7,
    capacityWh: 800,
    discharge: 40,
    weight: 5.5,
    compatibleMotorIds: ["7100", "7200", "7600", "M230", "R210"],
  },
  // 36V Batteries
  {
    id: "B-36V-320",
    model: "36V 320Wh",
    voltage: 36,
    capacity: 8.9,
    capacityWh: 320,
    discharge: 20,
    weight: 2.5,
    compatibleMotorIds: ["7100", "7200", "7600", "M99"],
  },
  {
    id: "B-36V-500",
    model: "36V 500Wh",
    voltage: 36,
    capacity: 13.9,
    capacityWh: 500,
    discharge: 25,
    weight: 3.2,
    compatibleMotorIds: ["7100", "7200", "7600", "M99"],
  },
  {
    id: "B-36V-600",
    model: "36V 600Wh",
    voltage: 36,
    capacity: 16.7,
    capacityWh: 600,
    discharge: 30,
    weight: 3.8,
    compatibleMotorIds: ["7100", "7200", "7600", "M99"],
  },
  {
    id: "B-36V-720",
    model: "36V 720Wh",
    voltage: 36,
    capacity: 20,
    capacityWh: 720,
    discharge: 35,
    weight: 4.5,
    compatibleMotorIds: ["7100", "7200", "7600", "M99"],
  },
  {
    id: "B-36V-800",
    model: "36V 800Wh",
    voltage: 36,
    capacity: 22.2,
    capacityWh: 800,
    discharge: 40,
    weight: 5.2,
    compatibleMotorIds: ["7100", "7200", "7600", "M99"],
  },
];

// ============ DISPLAY DATA ============

export const displays: Display[] = [
  {
    id: "DF230",
    model: "DF230",
    weight: 0.2,
    compatible: "All 7000 series",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DF230%2BR05-SMohbBOuZgto7gQH9ciC4cSlcz0n25.png",
  },
  {
    id: "DF231",
    model: "DF231",
    weight: 0.18,
    compatible: "All",
    integrationType: "Frame Integrated",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DF231%E6%B8%B2%E6%9F%93%E5%9B%BE-tFE0lZBwrWFIDmb3BmHDTW3SOWt0Mv.png",
  },
  {
    id: "DF232",
    model: "DF232",
    weight: 0.15,
    compatible: "All",
    integrationType: "Frame Integrated",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DF232-9NAAh2hIMol6f3zkZpY2vgqkaUZ8Gq.png",
  },
  {
    id: "DF233",
    model: "DF233",
    weight: 0.22,
    compatible: "All 7000 series",
    integrationType: "Stem Integrated",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DF233%2BR03-QAxVAUWPBn1alIwjQKkYM5YKFZ40Tf.png",
  },
  {
    id: "D-100",
    model: "D-100",
    weight: 0.2,
    compatible: "All",
  },
];

// ============ CHAINRING DATA ============

export const chainrings: Chainring[] = [
  {
    id: "CR-38T",
    model: "CR-38T",
    teeth: 38,
    weight: 0.15,
  },
  {
    id: "CR-42T",
    model: "CR-42T",
    teeth: 42,
    weight: 0.16,
  },
  {
    id: "CR-46T",
    model: "CR-46T",
    teeth: 46,
    weight: 0.18,
  },
];

// ============ CRANK DATA ============
// JIS cranks for 7100, ISIS cranks for 7200 and 7600

export const cranks: Crank[] = [
  // JIS Cranks - for 7100
  {
    id: "CK-JIS-150",
    length: 150,
    crankType: "JIS",
    compatibleMotorIds: ["7100"],
    weight: 0.36,
  },
  {
    id: "CK-JIS-155",
    length: 155,
    crankType: "JIS",
    compatibleMotorIds: ["7100"],
    weight: 0.38,
  },
  {
    id: "CK-JIS-160",
    length: 160,
    crankType: "JIS",
    compatibleMotorIds: ["7100"],
    weight: 0.4,
  },
  {
    id: "CK-JIS-165",
    length: 165,
    crankType: "JIS",
    compatibleMotorIds: ["7100"],
    weight: 0.42,
  },
  {
    id: "CK-JIS-170",
    length: 170,
    crankType: "JIS",
    compatibleMotorIds: ["7100"],
    weight: 0.44,
  },
  // ISIS Cranks - for 7200 and 7600
  {
    id: "CK-ISIS-150",
    length: 150,
    crankType: "ISIS",
    compatibleMotorIds: ["7200", "7600"],
    weight: 0.36,
  },
  {
    id: "CK-ISIS-155",
    length: 155,
    crankType: "ISIS",
    compatibleMotorIds: ["7200", "7600"],
    weight: 0.38,
  },
  {
    id: "CK-ISIS-160",
    length: 160,
    crankType: "ISIS",
    compatibleMotorIds: ["7200", "7600"],
    weight: 0.4,
  },
  {
    id: "CK-ISIS-165",
    length: 165,
    crankType: "ISIS",
    compatibleMotorIds: ["7200", "7600"],
    weight: 0.42,
  },
  {
    id: "CK-ISIS-170",
    length: 170,
    crankType: "ISIS",
    compatibleMotorIds: ["7200", "7600"],
    weight: 0.44,
  },
];

// ============ SENSORS DATA ============

export const sensors: Sensor[] = [
  {
    id: "SENSOR-TORQUE",
    type: "torque",
    name: "Torque Sensor",
    weight: 0.15,
  },
  {
    id: "SENSOR-SPEED",
    type: "speed",
    name: "Speed Sensor",
    weight: 0.05,
  },
];

// ============ LIGHTS DATA ============

export const lights: Light[] = [
  {
    id: "LIGHT-FRONT",
    type: "front",
    name: "Front Light",
    weight: 0.2,
  },
  {
    id: "LIGHT-REAR",
    type: "rear",
    name: "Rear Light",
    weight: 0.1,
  },
  {
    id: "LIGHT-TURN",
    type: "turn-signal",
    name: "Turn Signals",
    weight: 0.15,
  },
];

// ============ THROTTLE DATA ============

export const throttles: Throttle[] = [
  {
    id: "TH-01",
    model: "TH-01",
    weight: 0.1,
  },
];

// ============ IOT MODULE DATA ============

export const iotModules: IoTModule[] = [
  {
    id: "IOT-GPS",
    type: "gps",
    name: "GPS Module",
    weight: 0.05,
  },
  {
    id: "IOT-4G",
    type: "4g",
    name: "4G Module",
    weight: 0.06,
  },
  {
    id: "IOT-BT",
    type: "bluetooth",
    name: "Bluetooth Module",
    weight: 0.02,
  },
];

// ============ HELPER FUNCTIONS ============

export function getMotorById(id: string): Motor | undefined {
  return motors.find((m) => m.id === id);
}

export function getControllerById(id: string): Controller | undefined {
  return controllers.find((c) => c.id === id);
}

export function getBatteryById(id: string): Battery | undefined {
  return batteries.find((b) => b.id === id);
}

export function getCompatibleControllers(motorId: string): Controller[] {
  return controllers.filter((c) => c.compatibleMotorIds.includes(motorId));
}

export function getCompatibleBatteries(motorId: string): Battery[] {
  return batteries.filter((b) => b.compatibleMotorIds.includes(motorId));
}

export function getCompatibleBatteriesByVoltage(motorId: string, voltagePlatform: 36 | 48): Battery[] {
  return batteries.filter((b) => 
    b.compatibleMotorIds.includes(motorId) && b.voltage === voltagePlatform
  );
}

export function getCompatibleDisplays(motor: Motor): Display[] {
  return displays.filter((d) => {
    if (d.compatible === "All") return true;
    if (d.compatible === "All 7000 series" && motor.series === "7000") return true;
    return false;
  });
}

export function getCompatibleCranks(motorId: string): Crank[] {
  return cranks.filter((c) => c.compatibleMotorIds.includes(motorId));
}

export function getCrankTypeForMotor(motorId: string): CrankType | null {
  if (motorId === "7100") return "JIS";
  if (motorId === "7200" || motorId === "7600") return "ISIS";
  return null;
}

export function getMotorsByBikeType(bikeType: BikeType): Motor[] {
  return motors.filter((m) => m.compatibleBikeTypes.includes(bikeType));
}

export function getMotorsByType(motorType: MotorType): Motor[] {
  return motors.filter((m) => m.motorType === motorType);
}

export function getMidDriveMotors(): Motor[] {
  return motors.filter((m) => m.motorType === "mid-drive");
}

export function getHubMotors(): Motor[] {
  return motors.filter((m) => m.motorType === "hub");
}

export function get7000SeriesMotors(): Motor[] {
  return motors.filter((m) => m.series === "7000");
}

export function getLegacyMotors(): Motor[] {
  return motors.filter((m) => m.series === "Legacy");
}

// ============ DRIVETRAIN CALCULATIONS ============

export interface DrivetrainParams {
  wheelDiameter: number; // in meters (e.g., 0.7 for 700c)
  chainringTeeth: number;
  rearSprocketTeeth: number;
  motorTorque: number; // Nm
  cadenceMin: number; // rpm
  cadenceMax: number; // rpm
  riderWeight: number; // kg
  bikeWeight: number; // kg
  payload: number; // kg
  isHubMotor?: boolean;
}

export interface DrivetrainResult {
  gearRatio: number;
  wheelTorque: number; // Nm
  maxClimbGrade: number; // %
  speedAtCadence: (cadence: number) => number; // km/h
  cadenceAtSpeed: (speed: number) => number; // rpm
  recommendedChainring: number;
  recommendedRearSprocket: string;
  theoreticalTopSpeed: number; // km/h
}

export function calculateDrivetrain(params: DrivetrainParams): DrivetrainResult {
  const {
    wheelDiameter,
    chainringTeeth,
    rearSprocketTeeth,
    motorTorque,
    cadenceMin,
    cadenceMax,
    riderWeight,
    bikeWeight,
    payload,
    isHubMotor = false,
  } = params;

  const wheelRadius = wheelDiameter / 2;
  const wheelCircumference = Math.PI * wheelDiameter;
  const gearRatio = chainringTeeth / rearSprocketTeeth;
  
  // Wheel torque calculation
  // For hub motors: torque is applied directly to wheel (no gear multiplication)
  // For mid-drive: torque multiplies by gear ratio
  const wheelTorque = isHubMotor ? motorTorque : motorTorque * gearRatio;
  
  // Total weight
  const totalWeight = riderWeight + bikeWeight + payload;
  
  // Max climb grade calculation
  // Force at wheel = Torque / radius
  // Grade = (Force / (Weight * g)) * 100
  const forceAtWheel = wheelTorque / wheelRadius;
  const weightForce = totalWeight * 9.81;
  const maxClimbGrade = (forceAtWheel / weightForce) * 100;

  // Speed at given cadence (km/h)
  const speedAtCadence = (cadence: number): number => {
    const wheelRPM = cadence * gearRatio;
    const speedMPerMin = wheelRPM * wheelCircumference;
    return (speedMPerMin * 60) / 1000; // Convert to km/h
  };

  // Cadence at given speed (rpm)
  const cadenceAtSpeed = (speed: number): number => {
    const speedMPerMin = (speed * 1000) / 60;
    const wheelRPM = speedMPerMin / wheelCircumference;
    return wheelRPM / gearRatio;
  };

  // Theoretical top speed at max cadence
  const theoreticalTopSpeed = speedAtCadence(cadenceMax);

  // Recommend chainring based on desired speed range
  const recommendedChainring = 42; // Default recommendation
  const recommendedRearSprocket = "11-34T cassette";

  return {
    gearRatio: Math.round(gearRatio * 100) / 100,
    wheelTorque: Math.round(wheelTorque),
    maxClimbGrade: Math.round(maxClimbGrade * 10) / 10,
    speedAtCadence,
    cadenceAtSpeed,
    recommendedChainring,
    recommendedRearSprocket,
    theoreticalTopSpeed: Math.round(theoreticalTopSpeed * 10) / 10,
  };
}

// Generate data points for Wheel Torque vs Gear Ratio chart
export function getWheelTorqueData(
  motorTorque: number,
  slopes: number[] = [0, 5, 10],
  isHubMotor: boolean = false
): { gearRatio: number; torque: Record<string, number> }[] {
  const data: { gearRatio: number; torque: Record<string, number> }[] = [];
  
  for (let ratio = 1.5; ratio <= 4.0; ratio += 0.25) {
    const point: { gearRatio: number; torque: Record<string, number> } = {
      gearRatio: ratio,
      torque: {},
    };
    
    slopes.forEach((slope) => {
      // Torque required increases with slope
      const slopeFactor = 1 + slope * 0.05;
      // Hub motors don't multiply torque by gear ratio
      const baseTorque = isHubMotor ? motorTorque : motorTorque * ratio;
      point.torque[`${slope}%`] = Math.round(baseTorque * slopeFactor);
    });
    
    data.push(point);
  }
  
  return data;
}

// Generate data points for Cadence vs Speed chart
export function getCadenceSpeedData(
  wheelDiameter: number,
  chainringTeethOptions: number[] = [38, 42, 46],
  rearSprocketTeeth: number = 18
): { speed: number; cadence: Record<string, number> }[] {
  const data: { speed: number; cadence: Record<string, number> }[] = [];
  const wheelCircumference = Math.PI * wheelDiameter;
  
  for (let speed = 10; speed <= 50; speed += 5) {
    const point: { speed: number; cadence: Record<string, number> } = {
      speed,
      cadence: {},
    };
    
    chainringTeethOptions.forEach((teeth) => {
      const gearRatio = teeth / rearSprocketTeeth;
      const speedMPerMin = (speed * 1000) / 60;
      const wheelRPM = speedMPerMin / wheelCircumference;
      const cadence = wheelRPM / gearRatio;
      point.cadence[`${teeth}T`] = Math.round(cadence);
    });
    
    data.push(point);
  }
  
  return data;
}

// Bike type info for UI
export const bikeTypeInfo: Record<BikeType, { name: string; description: string }> = {
  cargo: {
    name: "Cargo Bike",
    description: "Heavy-duty motors for cargo and delivery applications",
  },
  city: {
    name: "City Commuter",
    description: "Efficient motors for urban commuting and leisure rides",
  },
  mountain: {
    name: "Mountain Bike",
    description: "High-torque motors for off-road and trail riding",
  },
  "fat-tire": {
    name: "Fat-Tire Bike",
    description: "Wide-tire bikes for sand, snow, and rough terrain",
  },
};

export const ridingStyleInfo: Record<RidingStyle, { name: string; description: string }> = {
  climbing: {
    name: "Climbing",
    description: "Optimized for steep hills and challenging terrain",
  },
  speed: {
    name: "Speed",
    description: "Optimized for flat terrain and higher speeds",
  },
  balanced: {
    name: "Balanced",
    description: "Versatile setup for mixed terrain",
  },
};
