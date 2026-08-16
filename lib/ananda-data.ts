// Ananda E-Drive System Configurator — Local Mock Data
// Motors, controllers, batteries and HMI displays are now sourced live from
// Supabase (see lib/ananda-db-types.ts + components/ananda/product-data-provider.tsx).
// The arrays below have no corresponding database table and remain local mocks.
// NO PRICES anywhere in this file.

// ─── TYPES ──────────────────────────────────────────────────────────────────

export type DriveType = 'mid' | 'hub'
export type VoltagePlatform = 36 | 48

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
    { connection: 'Charger → Battery',          connector: 'XLR / GX16',   pins: 3, cableType: 'Charge cable',    defaultLength: 1.5 },
    { connection: 'Accessories → Harness',      connector: 'Higo 6-pin',    pins: 6, cableType: 'Acc. harness',   defaultLength: 2.0 },
  ],
  hub: [
    { connection: 'Battery → Controller',               connector: 'XT60',          pins: 2, cableType: 'Power cable',      defaultLength: 0.5 },
    { connection: 'Controller → Hub Motor',             connector: 'Higo 9-pin',    pins: 9, cableType: 'Motor phase cable', defaultLength: 1.0 },
    { connection: 'Torque/Cadence Sensor → Controller', connector: 'SM-5P',         pins: 5, cableType: 'Sensor cable',     defaultLength: 1.2 },
    { connection: 'Speed Sensor → Controller',          connector: 'SM-3P',         pins: 3, cableType: 'Sensor cable',     defaultLength: 1.0 },
    { connection: 'Display → Controller',               connector: 'Higo 5-pin',    pins: 5, cableType: 'HMI cable',        defaultLength: 1.0 },
    { connection: 'Charger → Battery',                  connector: 'XLR / GX16',   pins: 3, cableType: 'Charge cable',     defaultLength: 1.5 },
    { connection: 'Accessories → Controller Harness',   connector: 'Higo 6-pin',    pins: 6, cableType: 'Acc. harness',    defaultLength: 2.0 },
  ],
}

// ─── DRIVETRAIN OPTIONS ────────────────────────────────────────────────────────

export const chainringTeethOptions = [30, 32, 34, 36, 38, 42, 46]

export const rearSprocketTeethOptions = [10, 11, 13, 15, 17, 19, 21, 24, 28, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52]

export const cadenceRpmOptions = [50, 60, 70, 80, 90]

// Wheel diameter in inches per label
export const wheelDiameterMap: Record<string, number> = {
  '20"': 20,
  '24"': 24,
  '26"': 26,
  '27.5"': 27.5,
  '29"': 29,
  '700c': 27.56,
}
