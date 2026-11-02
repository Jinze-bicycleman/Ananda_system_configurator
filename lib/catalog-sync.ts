"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import {
  aAccessories,
  aChargers,
  aChargingPorts,
  aSensors,
  type AAccessory,
  type ACharger,
  type AChargingPort,
  type ASensor,
  type VoltagePlatform,
} from "@/lib/ananda-data"

type Row = Record<string, unknown>

const num = (v: unknown) => (v == null || v === "" ? null : Number(v))
const text = (v: unknown) => (typeof v === "string" ? v : "")

async function load(table: string): Promise<Row[]> {
  const { data, error } = await createClient()
    .from(table)
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
    .order("model")
  if (error) throw error
  return (data ?? []) as Row[]
}

/**
 * Replaces the contents of the built-in catalog arrays with the rows stored in
 * the database, so edits made in the admin area show up in the configurator.
 * The `code` column keeps the original ids stable for saved selections.
 */
function applyCatalogs(rows: { accessories: Row[]; sensors: Row[]; chargers: Row[]; chargingPorts: Row[] }) {
  aAccessories.splice(
    0,
    aAccessories.length,
    ...rows.accessories.map(
      (r): AAccessory => ({
        id: text(r.code),
        name: text(r.model),
        category: (["iot", "lights", "throttle", "other"].includes(text(r.category)) ? r.category : "other") as AAccessory["category"],
        weightKg: num(r.weight_kg),
        imageUrl: text(r.image_url),
        description: text(r.short_description),
      }),
    ),
  )
  aSensors.splice(
    0,
    aSensors.length,
    ...rows.sensors.map(
      (r): ASensor => ({
        id: text(r.code),
        name: text(r.model),
        sensorType: (["torque", "cadence", "speed"].includes(text(r.sensor_type)) ? r.sensor_type : "speed") as ASensor["sensorType"],
        weightKg: num(r.weight_kg),
        imageUrl: text(r.image_url),
        description: text(r.short_description),
      }),
    ),
  )
  aChargers.splice(
    0,
    aChargers.length,
    ...rows.chargers.map(
      (r): ACharger => ({
        id: text(r.code),
        name: text(r.model),
        voltage: Number(r.voltage_v) as VoltagePlatform,
        currentA: Number(r.current_a),
        weightKg: num(r.weight_kg),
        imageUrl: text(r.image_url),
      }),
    ),
  )
  aChargingPorts.splice(
    0,
    aChargingPorts.length,
    ...rows.chargingPorts.map(
      (r): AChargingPort => ({
        id: text(r.code),
        name: text(r.model),
        connectorType: text(r.connector_type),
        weightKg: num(r.weight_kg),
        imageUrl: text(r.image_url),
      }),
    ),
  )
}

async function fetchCatalogs() {
  const [accessories, sensors, chargers, chargingPorts] = await Promise.all([
    load("accessories"),
    load("sensors"),
    load("chargers"),
    load("charging_ports"),
  ])
  applyCatalogs({ accessories, sensors, chargers, chargingPorts })
  return Date.now()
}

/** Call once near the root; re-renders the tree when database catalogs arrive. */
export function useCatalogSync() {
  const { data } = useSWR("ananda-catalog-sync", fetchCatalogs, { revalidateOnFocus: false })
  return data ?? 0
}
