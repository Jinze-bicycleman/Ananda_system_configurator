"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"

/** Fallbacks used while content loads, or if the database is unreachable. */
export const CONTENT_DEFAULTS: Record<string, string> = {
  "brand.logo": "/images/ananda-logo.png",
  "category.city.label": "Commuter",
  "category.city.description": "Daily city riding, light loads, cost-conscious.",
  "category.city.image": "/images/bike-category-city.jpg",
  "category.cargo.label": "Family / Cargo",
  "category.cargo.description": "Carrying children or heavy loads, needs climbing torque and range.",
  "category.cargo.image": "/images/bike-category-cargo-2wheeler.png",
  "category.trekking.label": "Trekking / Adventure",
  "category.trekking.description": "Longer rides, mixed terrain, wants range and reliability.",
  "category.trekking.image": "/images/bike-category-trekking.jpg",
  "category.mtb.label": "Performance",
  "category.mtb.image": "/images/bike-category-mtb.jpg",
  "app.headline": "Ananda Ride app",
  "app.logo": "/images/ananda-ride-logo.png",
  "app.ui_image": "",
  "app.cta.text": "Discover all features, supported systems and how to get started.",
  "app.cta.label": "Visit the Ananda Ride app page",
  "app.cta.url": "https://ananda-drive.com/innovative-R&D/ananda-ride-app",
}

async function fetchContent(): Promise<Record<string, string>> {
  const { data, error } = await createClient().from("site_content").select("key, value")
  if (error) throw error
  const rows = (data ?? []) as { key: string; value: string | null }[]
  return Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""]))
}

export function useSiteContent() {
  const { data } = useSWR("ananda-site-content", fetchContent, { revalidateOnFocus: false })

  function get(key: string): string {
    const stored = data?.[key]
    return stored !== undefined ? stored : (CONTENT_DEFAULTS[key] ?? "")
  }

  return { get, loaded: Boolean(data) }
}
