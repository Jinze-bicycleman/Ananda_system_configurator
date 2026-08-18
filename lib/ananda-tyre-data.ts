"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"

export type TyreSizeRow = {
  rim_size: string
  tyre_width: string
  tyre_type: string | null
  iso_size: string | null
  circumference_mm: number
}

const parseLeadingNumber = (value: string) => Number.parseFloat(value.replace(/[^0-9.]/g, "")) || 0

async function fetchTyreSizes(): Promise<TyreSizeRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("bike_tyre_sizes")
    .select("rim_size, tyre_width, tyre_type, iso_size, circumference_mm")

  if (error) throw error
  return data ?? []
}

export function useTyreSizes() {
  const { data, isLoading, error } = useSWR<TyreSizeRow[]>("bike-tyre-sizes", fetchTyreSizes)
  const rows = data ?? []

  const rimSizes = Array.from(new Set(rows.map((row) => row.rim_size))).sort(
    (a, b) => parseLeadingNumber(a) - parseLeadingNumber(b),
  )

  const widthsForRim = (rim: string | null) =>
    rim
      ? Array.from(new Set(rows.filter((row) => row.rim_size === rim).map((row) => row.tyre_width))).sort(
          (a, b) => parseLeadingNumber(a) - parseLeadingNumber(b),
        )
      : []

  const findMatch = (rim: string | null, width: string | null) =>
    rim && width ? rows.find((row) => row.rim_size === rim && row.tyre_width === width) ?? null : null

  return { rimSizes, widthsForRim, findMatch, isLoading, error }
}
