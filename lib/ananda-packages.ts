"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"

export type MotorRow = {
  id: string
  model: string
  motor_type: "mid_drive" | "hub"
  torque_nm: number | null
  rated_power_w: number | null
  peak_power_w: number | null
  weight_kg: number | null
  size: string | null
  voltage_v: number
  controller_requirement: "integrated" | "external"
  pedal_sensing: string | null
  communication_protocol: string | null
  image_url: string | null
  image_path: string | null
  datasheet_url: string | null
  short_description: string | null
  is_recommended: boolean
  is_active: boolean
  sort_order: number
  rpm: number | null
  max_efficiency: string | null
  noise_grade_db: number | null
  waterproof: string | null
  color: string | null
  construction: string | null
  light_drive_capacity: string | null
  sensor_description: string | null
}

export type ControllerRow = {
  id: string
  model: string
  compatible_motor_type: "hub" | "mid_drive"
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
  image_path: string | null
  datasheet_url: string | null
  short_description: string | null
  is_active: boolean
  sort_order: number
}

export type HmiDisplayRow = {
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
  image_path: string | null
  datasheet_url: string | null
  short_description: string | null
  is_active: boolean
  sort_order: number
}

export type BatteryRow = {
  id: string
  model: string
  capacity_ah: number | null
  capacity_wh: number | null
  weight_kg: number | null
  size: string | null
  voltage_v: number
  communication_protocol: string | null
  image_url: string | null
  image_path: string | null
  datasheet_url: string | null
  short_description: string | null
  is_active: boolean
  sort_order: number
}

const MOTOR_COLUMNS =
  "id, model, motor_type, torque_nm, rated_power_w, peak_power_w, weight_kg, size, voltage_v, controller_requirement, pedal_sensing, communication_protocol, image_url, image_path, datasheet_url, short_description, is_recommended, is_active, sort_order, rpm, max_efficiency, noise_grade_db, waterproof, color, construction, light_drive_capacity, sensor_description"

const CONTROLLER_COLUMNS =
  "id, model, compatible_motor_type, voltage_v, rated_power_w, peak_power_w, rated_current_a, peak_current_a, communication_protocol, connection_type, size, weight_kg, image_url, image_path, datasheet_url, short_description, is_active, sort_order"

const HMI_COLUMNS =
  "id, model, size, bluetooth, weight_kg, has_4g, has_gps, display_material, connection_type, voltage_v, communication_protocol, image_url, image_path, datasheet_url, short_description, is_active, sort_order"

const BATTERY_COLUMNS =
  "id, model, capacity_ah, capacity_wh, weight_kg, size, voltage_v, communication_protocol, image_url, image_path, datasheet_url, short_description, is_active, sort_order"

async function fetchMotors(): Promise<MotorRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("motors").select(MOTOR_COLUMNS).eq("is_active", true).order("sort_order")
  if (error) throw error
  return (data ?? []) as unknown as MotorRow[]
}

async function fetchControllers(): Promise<ControllerRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("controllers").select(CONTROLLER_COLUMNS).eq("is_active", true).order("sort_order")
  if (error) throw error
  return (data ?? []) as unknown as ControllerRow[]
}

async function fetchDisplays(): Promise<HmiDisplayRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("hmi_displays").select(HMI_COLUMNS).eq("is_active", true).order("sort_order")
  if (error) throw error
  return (data ?? []) as unknown as HmiDisplayRow[]
}

async function fetchBatteries(): Promise<BatteryRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("batteries").select(BATTERY_COLUMNS).eq("is_active", true).order("sort_order")
  if (error) throw error
  return (data ?? []) as unknown as BatteryRow[]
}

export function useMotors() {
  const { data, isLoading, error } = useSWR<MotorRow[]>("ananda-motors", fetchMotors)
  return { motors: data ?? [], isLoading, error }
}

export function useControllers() {
  const { data, isLoading, error } = useSWR<ControllerRow[]>("ananda-controllers", fetchControllers)
  return { controllers: data ?? [], isLoading, error }
}

export function useDisplays() {
  const { data, isLoading, error } = useSWR<HmiDisplayRow[]>("ananda-hmi-displays", fetchDisplays)
  return { displays: data ?? [], isLoading, error }
}

export function useBatteries() {
  const { data, isLoading, error } = useSWR<BatteryRow[]>("ananda-batteries", fetchBatteries)
  return { batteries: data ?? [], isLoading, error }
}

const driveTypeToMotorType: Record<"mid" | "hub", MotorRow["motor_type"]> = {
  mid: "mid_drive",
  hub: "hub",
}

export function usePackageMotors(driveType: "mid" | "hub" | null, voltagePlatform: number | null) {
  const { motors, isLoading, error } = useMotors()
  const filtered =
    driveType && voltagePlatform
      ? motors.filter((m) => m.motor_type === driveTypeToMotorType[driveType] && m.voltage_v === voltagePlatform)
      : []
  return { motors: filtered, isLoading, error }
}

export function useCompatibleControllers(motor: MotorRow | null) {
  const { controllers, isLoading, error } = useControllers()
  const filtered = motor
    ? controllers.filter((c) => c.compatible_motor_type === motor.motor_type && c.voltage_v === motor.voltage_v)
    : []
  return { controllers: filtered, isLoading, error }
}

export const RIDER_INTERFACE_LABEL = "Rider Interface (Display)"

// Charger & charging port are not yet modeled in the database — kept as static
// reference data tied to the chosen voltage platform, shown alongside battery
// in the package configuration screen.
export type ChargerOption = { id: string; model: string; voltage_v: number; outputCurrentA: number; description: string }
export type ChargingPortOption = { id: string; model: string; description: string }

export const CHARGERS: ChargerOption[] = [
  { id: "charger-36v-2a", model: "AC-36-2", voltage_v: 36, outputCurrentA: 2, description: "Standard 2A charger for 36V packs" },
  { id: "charger-48v-2a", model: "AC-48-2", voltage_v: 48, outputCurrentA: 2, description: "Standard 2A charger for 48V packs" },
  { id: "charger-52v-3a", model: "AC-52-3", voltage_v: 52, outputCurrentA: 3, description: "Fast 3A charger for 52V packs" },
]

export const CHARGING_PORTS: ChargingPortOption[] = [
  { id: "port-xlr", model: "XLR 3-Pin", description: "Standard round XLR charging port" },
  { id: "port-gx16", model: "GX16 Aviation", description: "Compact aviation-style charging port" },
]

export function chargersForVoltage(voltagePlatform: number | null) {
  return voltagePlatform ? CHARGERS.filter((c) => c.voltage_v === voltagePlatform) : []
}
