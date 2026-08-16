// Row types for the live Supabase-backed Ananda product catalog tables.
// These mirror the `motors`, `controllers`, `batteries` and `hmi_displays`
// tables in the connected Supabase project. NO PRICES anywhere in this file.

export type DbMotorType = "mid_drive" | "hub"
export type DbControllerCompat = "hub" | "mid_drive" | "both"

export interface DbMotor {
  id: string
  model: string
  motor_type: DbMotorType
  torque_nm: number | null
  rated_power_w: number | null
  peak_power_w: number | null
  weight_kg: number | null
  size: string | null
  shaft_interface: string | null
  voltage_v: number
  mounting_interface: string | null
  communication_protocol: string | null
  controller_requirement: "integrated" | "external" | "not_required"
  pedal_sensing: "integrated" | "external_required" | "not_required" | null
  rpm: number | null
  max_efficiency: string | null
  noise_grade_db: number | null
  color: string | null
  construction: string | null
  light_drive_capacity: string | null
  sensor_description: string | null
  waterproof: string | null
  image_url: string | null
  datasheet_url: string | null
  short_description: string | null
  is_recommended: boolean
  is_active: boolean
  sort_order: number
}

export interface DbController {
  id: string
  model: string
  compatible_motor_type: DbControllerCompat
  voltage_v: number
  rated_power_w: number | null
  peak_power_w: number | null
  rated_current_a: number | null
  peak_current_a: number | null
  communication_protocol: string | null
  connection_type: string | null
  size: string | null
  weight_kg: number | null
  image_url: string | null
  datasheet_url: string | null
  short_description: string | null
  is_active: boolean
  sort_order: number
}

export interface DbBattery {
  id: string
  model: string
  capacity_ah: number | null
  capacity_wh: number | null
  weight_kg: number | null
  size: string | null
  voltage_v: number
  communication_protocol: string | null
  image_url: string | null
  datasheet_url: string | null
  short_description: string | null
  is_active: boolean
  sort_order: number
}

export interface DbHmiDisplay {
  id: string
  model: string
  size: string | null
  bluetooth: boolean
  weight_kg: number | null
  has_4g: boolean
  has_gps: boolean
  display_material: string | null
  connection_type: string | null
  voltage_v: number | null
  communication_protocol: string | null
  image_url: string | null
  datasheet_url: string | null
  short_description: string | null
  bluetooth_status: string | null
  usb_charge_status: string | null
  remote_control_status: string | null
  waterproof: string | null
  mounting_position: string | null
  certifications: string | null
  holder_mm: string | null
  support_level: number | null
  cable_length_mm: string | null
  is_active: boolean
  sort_order: number
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Maps the store's `driveType` ("mid" | "hub") to the DB `motor_type` enum. */
export function driveTypeToMotorType(driveType: "mid" | "hub" | null): DbMotorType | null {
  if (driveType === "mid") return "mid_drive"
  if (driveType === "hub") return "hub"
  return null
}

/** Formats a nullable spec value, showing a "to be confirmed" placeholder when missing. */
export function specOrConfirm(value: string | number | null | undefined, unit?: string): string {
  if (value === null || value === undefined || value === "") return "Specs to be confirmed"
  return unit ? `${value} ${unit}` : String(value)
}
