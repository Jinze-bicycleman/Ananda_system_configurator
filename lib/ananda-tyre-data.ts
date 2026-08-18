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

function useTyreSizeRows() {
  const { data, isLoading, error } = useSWR<TyreSizeRow[]>("bike-tyre-sizes", fetchTyreSizes)
  return { rows: data ?? [], isLoading, error }
}

export function useWheelSizeOptions() {
  const { rows, isLoading, error } = useTyreSizeRows()
  const options = Array.from(new Set(rows.map((row) => row.rim_size))).sort(
    (a, b) => parseLeadingNumber(a) - parseLeadingNumber(b),
  )
  return { options, isLoading, error }
}

export function useTyreWidthOptions(wheelSize: string | null) {
  const { rows, isLoading, error } = useTyreSizeRows()
  const options = wheelSize
    ? Array.from(new Set(rows.filter((row) => row.rim_size === wheelSize).map((row) => row.tyre_width))).sort(
        (a, b) => parseLeadingNumber(a) - parseLeadingNumber(b),
      )
    : []
  return { options, isLoading, error }
}

export function useTyreSizeMatch(wheelSize: string | null, tyreWidth: string | null) {
  const { rows, isLoading, error } = useTyreSizeRows()
  const match =
    wheelSize && tyreWidth
      ? rows.find((row) => row.rim_size === wheelSize && row.tyre_width === tyreWidth) ?? null
      : null
  return { match, isLoading, error }
}
