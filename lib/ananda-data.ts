// Ananda E-Drive System Configurator — Product Data
// All specs are placeholder values — edit these to reflect actual specifications.
// NO PRICES anywhere in this file.

// ─── TYPES ──────────────────────────────────────────────────────────────────

export type DriveType = 'mid' | 'hub'
export type VoltagePlatform = 36 | 48

export interface AMotor {
  id: string
  name: string
  type: DriveType
  voltages: number[]           // supported voltages
  torqueNm: number | null
  powerW: number | null
  weightKg: number | null
  controller: 'integrated' | 'external'
  pedalSensing: 'integrated' | 'external-required'
  recommended: boolean
  imageUrl: string
  description: string
  features: string[]
}

export interface AController {
  id: string
  name: string
  voltages: number[]
  maxCurrentA: number | null
  weightKg: number | null
  imageUrl: string
  description: string
}

export interface ABattery {
  id: string
  name: string
  voltage: VoltagePlatform
  capacityWh: number
  weightKg: number | null
  dimensions: string | null
  imageUrl: string
}

export interface ACharger {
  id: string
  name: string
  voltage: VoltagePlatform
  currentA: number
  weightKg: number | null
  imageUrl: string
}

export interface AChargingPort {
  id: string
  name: string
  connectorType: string
  weightKg: number | null
  imageUrl: string
}

export interface ADisplay {
  id: string
  name: string
  weightKg: number | null
  imageUrl: string
  description: string
}

export interface ARemote {
  id: string
  name: string
  weightKg: number | null
  imageUrl: string
  description: string
}

export interface ASensor {
  id: string
  name: string
  sensorType: 'torque' | 'cadence' | 'speed'
  weightKg: number | null
  imageUrl: string
  description: string
}

export interface AAccessory {
  id: string
  name: string
  category: 'iot' | 'lights' | 'throttle' | 'other'
  weightKg: number | null
  imageUrl: string
  description: string
}

export interface CablePreset {
  connection: string
  connector: string
  pins: number
  cableType: string
  defaultLength: number
}

// ─── MOTORS ──────────────────────────────────────────────────────────────────

export const aMotors: AMotor[] = [
  {
    id: '7100',
    name: '7100 Mid-Drive',
    type: 'mid',
    voltages: [48],
    torqueNm: 80,
    powerW: 250,
    weightKg: 3.2,
    controller: 'integrated',
    pedalSensing: 'integrated',
    recommended: true,
    imageUrl: '', // TODO: replace with 7100 mid-drive motor image path
    description: 'Compact mid-drive unit for city, trekking and entry-level cargo. Integrated controller and torque sensing.',
    features: ['Integrated controller', 'Torque & cadence sensing', 'Walk-assist mode', 'Auto-assist algorithm'],
  },
  {
    id: '7200',
    name: '7200 Mid-Drive',
    type: 'mid',
    voltages: [48],
    torqueNm: 95,
    powerW: 350,
    weightKg: 3.6,
    controller: 'integrated',
    pedalSensing: 'integrated',
    recommended: true,
    imageUrl: '', // TODO: replace with 7200 mid-drive motor image path
    description: 'High-torque mid-drive for performance MTB, cargo and hilly terrain. Advanced torque mapping.',
    features: ['High-torque output', 'Integrated controller', 'Advanced torque mapping', 'Trail-optimised algorithm'],
  },
  {
    id: '7600',
    name: '7600 Mid-Drive',
    type: 'mid',
    voltages: [48],
    torqueNm: 120,
    powerW: 500,
    weightKg: 4.1,
    controller: 'integrated',
    pedalSensing: 'integrated',
    recommended: true,
    imageUrl: '', // TODO: replace with 7600 mid-drive motor image path
    description: 'Maximum-output mid-drive for speed pedelecs, cargo tricycles and demanding terrain.',
    features: ['Max-output platform', 'Speed pedelec rated', 'Cargo & tricycle variant', 'Regen braking support'],
  },
  {
    id: 'R900',
    name: 'R900 Rear Hub',
    type: 'hub',
    voltages: [48],
    torqueNm: 45,
    powerW: 350,
    weightKg: 2.8,
    controller: 'external',
    pedalSensing: 'external-required',
    recommended: false,
    imageUrl: '', // TODO: replace with R900 rear hub motor image path
    description: 'High-output 48V rear hub motor for city and trekking bikes. External controller required.',
    features: ['Rear-wheel drive', 'Quiet operation', '48V platform', 'Cassette-compatible'],
  },
  {
    id: 'R400',
    name: 'R400 Rear Hub',
    type: 'hub',
    voltages: [36, 48],
    torqueNm: 35,
    powerW: 250,
    weightKg: 2.4,
    controller: 'external',
    pedalSensing: 'external-required',
    recommended: false,
    imageUrl: '', // TODO: replace with R400 rear hub motor image path
    description: '36V / 48V dual-platform rear hub for city and commuter applications. Cost-effective solution.',
    features: ['36V / 48V dual platform', 'Rear-wheel drive', 'Cost-effective', 'Wide tyre clearance'],
  },
  {
    id: 'F131',
    name: 'F131 Front Hub',
    type: 'hub',
    voltages: [36, 48],
    torqueNm: 28,
    powerW: 250,
    weightKg: 2.1,
    controller: 'external',
    pedalSensing: 'external-required',
    recommended: false,
    imageUrl: '', // TODO: replace with F131 front hub motor image path
    description: 'Front hub motor for AWD configurations or conversion kits. 36V / 48V compatible.',
    features: ['Front-wheel drive', 'AWD option', '36V / 48V dual platform', 'Lightweight'],
  },
]

// ─── CONTROLLERS ──────────────────────────────────────────────────────────────

export const aControllers: AController[] = [
  { id: 'C1', name: 'C1 Controller', voltages: [36, 48], maxCurrentA: 15, weightKg: 0.32, imageUrl: '', description: 'Entry-level hub motor controller. Compact for city applications.' },
  { id: 'C2', name: 'C2 Controller', voltages: [36, 48], maxCurrentA: 20, weightKg: 0.38, imageUrl: '', description: 'Mid-range controller with enhanced current capacity for trekking and commuter hubs.' },
  { id: 'C3', name: 'C3 Controller', voltages: [48],     maxCurrentA: 25, weightKg: 0.44, imageUrl: '', description: '48V high-output controller for R900 and performance hub systems.' },
  { id: 'C4', name: 'C4 Controller', voltages: [36, 48], maxCurrentA: 30, weightKg: 0.51, imageUrl: '', description: 'Maximum-output hub controller for cargo and high-payload applications.' },
]

// ─── BATTERIES ──────────────────────────────────────────────────────────────

export const aBatteries: ABattery[] = [
  { id: 'B36-320', name: '36V 320Wh', voltage: 36, capacityWh: 320, weightKg: 1.8, dimensions: '350 × 90 × 70 mm', imageUrl: '' },
  { id: 'B36-500', name: '36V 500Wh', voltage: 36, capacityWh: 500, weightKg: 2.6, dimensions: '420 × 90 × 80 mm', imageUrl: '' },
  { id: 'B36-600', name: '36V 600Wh', voltage: 36, capacityWh: 600, weightKg: 3.1, dimensions: '480 × 90 × 80 mm', imageUrl: '' },
  { id: 'B36-720', name: '36V 720Wh', voltage: 36, capacityWh: 720, weightKg: 3.7, dimensions: '520 × 90 × 90 mm', imageUrl: '' },
  { id: 'B36-800', name: '36V 800Wh', voltage: 36, capacityWh: 800, weightKg: 4.1, dimensions: '560 × 90 × 90 mm', imageUrl: '' },
  { id: 'B48-320', name: '48V 320Wh', voltage: 48, capacityWh: 320, weightKg: 2.0, dimensions: '350 × 90 × 70 mm', imageUrl: '' },
  { id: 'B48-500', name: '48V 500Wh', voltage: 48, capacityWh: 500, weightKg: 2.8, dimensions: '420 × 90 × 80 mm', imageUrl: '' },
  { id: 'B48-600', name: '48V 600Wh', voltage: 48, capacityWh: 600, weightKg: 3.4, dimensions: '480 × 90 × 80 mm', imageUrl: '' },
  { id: 'B48-720', name: '48V 720Wh', voltage: 48, capacityWh: 720, weightKg: 4.0, dimensions: '520 × 90 × 90 mm', imageUrl: '' },
  { id: 'B48-800', name: '48V 800Wh', voltage: 48, capacityWh: 800, weightKg: 4.5, dimensions: '560 × 90 × 90 mm', imageUrl: '' },
]

// ─── CHARGERS ──────────────────────────────────────────────────────────────

export const aChargers: ACharger[] = [
  { id: 'CH-36V-2A', name: 'CH-36V-2A', voltage: 36, currentA: 2, weightKg: 0.65, imageUrl: '' },
  { id: 'CH-36V-4A', name: 'CH-36V-4A', voltage: 36, currentA: 4, weightKg: 0.85, imageUrl: '' },
  { id: 'CH-48V-2A', name: 'CH-48V-2A', voltage: 48, currentA: 2, weightKg: 0.68, imageUrl: '' },
  { id: 'CH-48V-4A', name: 'CH-48V-4A', voltage: 48, currentA: 4, weightKg: 0.92, imageUrl: '' },
]

// ─── CHARGING PORTS ──────────────────────────────────────────────────────────

export const aChargingPorts: AChargingPort[] = [
  { id: 'CP1', name: 'CP1', connectorType: 'XLR 3-pin', weightKg: 0.08, imageUrl: '' },
  { id: 'CP2', name: 'CP2', connectorType: 'GX16 4-pin', weightKg: 0.09, imageUrl: '' },
  { id: 'CP3', name: 'CP3', connectorType: 'Higo Waterproof', weightKg: 0.11, imageUrl: '' },
]

// ─── DISPLAYS ──────────────────────────────────────────────────────────────

export const aDisplays: ADisplay[] = [
  { id: 'D1',  name: 'D1 Display',  weightKg: 0.12, imageUrl: '', description: 'Compact LCD. Speed, assist level, battery indicator.' },
  { id: 'D18', name: 'D18 Display', weightKg: 0.16, imageUrl: '', description: 'Mid-size colour TFT. Full system readout and navigation.' },
  { id: 'D20', name: 'D20 Display', weightKg: 0.19, imageUrl: '', description: 'Premium full-colour display with app connectivity.' },
]

// ─── REMOTES ──────────────────────────────────────────────────────────────

export const aRemotes: ARemote[] = [
  { id: 'R1', name: 'R1 Remote', weightKg: 0.04, imageUrl: '', description: '2-button handlebar remote. Assist up/down.' },
  { id: 'R2', name: 'R2 Remote', weightKg: 0.05, imageUrl: '', description: '4-button remote with display control and walk-assist.' },
  { id: 'R3', name: 'R3 Remote', weightKg: 0.06, imageUrl: '', description: 'Advanced multi-function remote with integrated light control.' },
]

// ─── SENSORS ──────────────────────────────────────────────────────────────

export const aSensors: ASensor[] = [
  { id: 'TS1', name: 'Torque Sensor', sensorType: 'torque', weightKg: 0.18, imageUrl: '', description: 'BB torque sensing. Required for hub motor systems.' },
  { id: 'CS1', name: 'Cadence Sensor', sensorType: 'cadence', weightKg: 0.06, imageUrl: '', description: 'Magnet-based cadence sensor. Detects pedal rotation.' },
  { id: 'SS1', name: 'Speed Sensor', sensorType: 'speed', weightKg: 0.04, imageUrl: '', description: 'Wheel-mounted sensor. Required for speed-limit compliance.' },
]

// ─── ACCESSORIES ──────────────────────────────────────────────────────────────

export const aAccessories: AAccessory[] = [
  { id: 'ACC-GPS',    name: 'GPS Module',        category: 'iot',     weightKg: 0.08, imageUrl: '', description: 'Integrated GPS for fleet management and anti-theft.' },
  { id: 'ACC-4G',     name: '4G Module',          category: 'iot',     weightKg: 0.09, imageUrl: '', description: 'Cellular for remote diagnostics and OTA updates.' },
  { id: 'ACC-BT',     name: 'Bluetooth Module',   category: 'iot',     weightKg: 0.04, imageUrl: '', description: 'BT connectivity for app pairing and data sync.' },
  { id: 'ACC-FL',     name: 'Front Light',        category: 'lights',  weightKg: 0.14, imageUrl: '', description: 'System-powered integrated front light.' },
  { id: 'ACC-RL',     name: 'Rear Light',         category: 'lights',  weightKg: 0.09, imageUrl: '', description: 'Integrated rear light with brake function.' },
  { id: 'ACC-TUR',    name: 'Turn Signals',       category: 'lights',  weightKg: 0.18, imageUrl: '', description: 'Front and rear turn signal set.' },
  { id: 'ACC-TH01',   name: 'TH-01 Throttle',    category: 'throttle', weightKg: 0.05, imageUrl: '', description: 'Thumb-style throttle. Hub motor compatible.' },
  { id: 'ACC-THO',    name: 'Alternate Throttle', category: 'throttle', weightKg: 0.06, imageUrl: '', description: 'Twist-grip throttle alternative.' },
  { id: 'ACC-HORN',   name: 'Electronic Horn',   category: 'other',   weightKg: 0.06, imageUrl: '', description: 'System-integrated electronic horn.' },
  { id: 'ACC-RADAR',  name: 'Radar Module',       category: 'other',   weightKg: 0.12, imageUrl: '', description: 'Rear proximity detection and safety alerting.' },
  { id: 'ACC-TPMS',   name: 'TPMS',              category: 'other',   weightKg: 0.06, imageUrl: '', description: 'Tyre pressure monitoring system.' },
  { id: 'ACC-ESHIFT', name: 'Electronic Shift',  category: 'other',   weightKg: 0.08, imageUrl: '', description: 'Auto torque reduction on gear shift.' },
]

// ─── CABLE PRESETS ──────────────────────────────────────────────────────────

export const cablePresets: Record<'mid' | 'hub', CablePreset[]> = {
  mid: [
    { connection: 'Battery → Motor Unit',       connector: 'XT60',          pins: 2, cableType: 'Power cable',     defaultLength: 0.5 },
    { connection: 'Speed Sensor → Motor Unit',  connector: 'SM-3P',         pins: 3, cableType: 'Sensor cable',    defaultLength: 1.0 },
    { connection: 'Display → Motor Unit',       connector: 'Higo 5-pin',    pins: 5, cableType: 'HMI cable',       defaultLength: 1.0 },
    { connection: 'Remote → Display',           connector: 'JST-SM 3-pin',  pins: 3, cableType: 'Remote cable',    defaultLength: 0.5 },
    { connection: 'Charger → Battery',          connector: 'XLR / GX16',   pins: 3, cableType: 'Charge cable',    defaultLength: 1.5 },
    { connection: 'Accessories → Harness',      connector: 'Higo 6-pin',    pins: 6, cableType: 'Acc. harness',   defaultLength: 2.0 },
  ],
  hub: [
    { connection: 'Battery → Controller',               connector: 'XT60',          pins: 2, cableType: 'Power cable',      defaultLength: 0.5 },
    { connection: 'Controller → Hub Motor',             connector: 'Higo 9-pin',    pins: 9, cableType: 'Motor phase cable', defaultLength: 1.0 },
    { connection: 'Torque/Cadence Sensor → Controller', connector: 'SM-5P',         pins: 5, cableType: 'Sensor cable',     defaultLength: 1.2 },
    { connection: 'Speed Sensor → Controller',          connector: 'SM-3P',         pins: 3, cableType: 'Sensor cable',     defaultLength: 1.0 },
    { connection: 'Display → Controller',               connector: 'Higo 5-pin',    pins: 5, cableType: 'HMI cable',        defaultLength: 1.0 },
    { connection: 'Remote → Display',                   connector: 'JST-SM 3-pin',  pins: 3, cableType: 'Remote cable',     defaultLength: 0.5 },
    { connection: 'Charger → Battery',                  connector: 'XLR / GX16',   pins: 3, cableType: 'Charge cable',     defaultLength: 1.5 },
    { connection: 'Accessories → Controller Harness',   connector: 'Higo 6-pin',    pins: 6, cableType: 'Acc. harness',    defaultLength: 2.0 },
  ],
}

// ─── DRIVETRAIN OPTIONS ────────────────────────────────────────────────────────

export const chainringTeethOptions = [30, 32, 34, 36, 38, 42, 46]

export const rearSprocketTeethOptions = [10, 11, 13, 15, 17, 19, 21, 24, 28, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52]

export const cadenceRpmOptions = [50, 60, 70, 80, 90]

// Placeholder motor torque values (Nm) for drivetrain calculations
export const motorTorqueFallback: Record<string, number> = {
  '7100': 80,
  '7200': 100,
  '7600': 120,
  'R900': 55,
  'R400': 45,
  'F131': 65,
}

// Wheel diameter in inches per label
export const wheelDiameterMap: Record<string, number> = {
  '20"': 20,
  '24"': 24,
  '26"': 26,
  '27.5"': 27.5,
  '29"': 29,
  '700c': 27.56,
}
