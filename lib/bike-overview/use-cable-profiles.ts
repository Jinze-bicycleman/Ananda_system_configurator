"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import type { CableKey, ProductRole } from "./templates"

export interface CableProfile {
  cableKey: CableKey
  title: string
  from: string
  to: string
  colorName: string
  colorHex: string
  requires: ProductRole | null
  defaultLengthMm: number
  lengthsMm: number[]
  sortOrder: number
  connectorModel: string
  connectorPurpose: string
  pinCount: number | null
  ipxRating: string | null
  imageUrl: string | null
}

interface RouteRow {
  cable_key: CableKey
  title: string
  from_label: string
  to_label: string
  color_name: string
  requires_component: ProductRole | null
  default_length_mm: number
  sort_order: number
  cable_colors: { hex_code: string } | null
  cable_connector_types: {
    model: string
    purpose: string
    pin_count: number | null
    ipx_rating: string | null
    image_url: string | null
  } | null
  cable_route_length_options: { length_mm: number; sort_order: number; is_active: boolean }[]
}

async function fetchCableProfiles(): Promise<CableProfile[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("cable_routes")
    .select(
      "cable_key, title, from_label, to_label, color_name, requires_component, default_length_mm, sort_order, cable_colors(hex_code), cable_connector_types(model, purpose, pin_count, ipx_rating, image_url), cable_route_length_options(length_mm, sort_order, is_active)",
    )
    .eq("is_active", true)
    .order("sort_order")
  if (error) throw error

  return ((data ?? []) as unknown as RouteRow[])
    .filter((r) => r.cable_colors && r.cable_connector_types)
    .map((r) => ({
      cableKey: r.cable_key,
      title: r.title,
      from: r.from_label,
      to: r.to_label,
      colorName: r.color_name,
      colorHex: r.cable_colors!.hex_code,
      requires: r.requires_component,
      defaultLengthMm: r.default_length_mm,
      lengthsMm: r.cable_route_length_options
        .filter((l) => l.is_active)
        .sort((a, b) => a.sort_order - b.sort_order || a.length_mm - b.length_mm)
        .map((l) => l.length_mm),
      sortOrder: r.sort_order,
      connectorModel: r.cable_connector_types!.model,
      connectorPurpose: r.cable_connector_types!.purpose,
      pinCount: r.cable_connector_types!.pin_count,
      ipxRating: r.cable_connector_types!.ipx_rating,
      imageUrl: r.cable_connector_types!.image_url,
    }))
}

/** Cable colours, connector types, endpoints and length options maintained in Supabase. Falls back to the built-in defaults while loading or on error. */
export function useCableProfiles() {
  const { data } = useSWR<CableProfile[]>("ananda-cable-profiles", fetchCableProfiles, { revalidateOnFocus: false })
  return data ?? null
}
