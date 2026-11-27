"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import {
  aAccessories,
  aChargers,
  aChargingPorts,
  type AAccessory,
  type ACharger,
  type AChargingPort,
  type VoltagePlatform,
} from "@/lib/ananda-data"
import { CHARGERS, type ChargerOption } from "@/lib/ananda-packages"

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
function applyCatalogs(rows: { accessories: Row[]; chargers: Row[]; chargingPorts: Row[] }) {
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
  CHARGERS.splice(
    0,
    CHARGERS.length,
    ...rows.chargers.map((r): ChargerOption => {
      const option = text(r.voltage_option) || String(r.voltage_v)
      const voltages = option === "36_48" ? [36, 48] : [Number(option) || Number(r.voltage_v)]
      const currents = [num(r.current_a), num(r.current_secondary_a)]
      return {
        id: text(r.code),
        model: text(r.model),
        ratings: voltages.map((voltage, i) => ({ voltage, currentA: currents[i] ?? null })),
        description: text(r.short_description),
      }
    }),
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
  const [accessories, chargers, chargingPorts] = await Promise.all([
    load("accessories"),
    load("chargers"),
    load("charging_ports"),
  ])
  applyCatalogs({ accessories, chargers, chargingPorts })
  return Date.now()
}

/** Call once near the root; re-renders the tree when database catalogs arrive. */
export function useCatalogSync() {
  const { data } = useSWR("ananda-catalog-sync", fetchCatalogs, { revalidateOnFocus: false })
  return data ?? 0
}
