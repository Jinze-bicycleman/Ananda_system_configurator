"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { DbMotor, DbController, DbBattery, DbHmiDisplay } from "@/lib/ananda-db-types"

interface AnandaProductData {
  motors: DbMotor[]
  controllers: DbController[]
  batteries: DbBattery[]
  hmiDisplays: DbHmiDisplay[]
  loading: boolean
  error: string | null
}

const defaultData: AnandaProductData = {
  motors: [],
  controllers: [],
  batteries: [],
  hmiDisplays: [],
  loading: true,
  error: null,
}

const ProductDataContext = createContext<AnandaProductData>(defaultData)

export function useAnandaProductData() {
  return useContext(ProductDataContext)
}

export function AnandaProductDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AnandaProductData>(defaultData)

  useEffect(() => {
    let cancelled = false

    async function fetchAll() {
      const supabase = createClient()
      const [motorsRes, controllersRes, batteriesRes, hmiDisplaysRes] = await Promise.all([
        supabase.from("motors").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
        supabase.from("controllers").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
        supabase.from("batteries").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
        supabase.from("hmi_displays").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
      ])

      if (cancelled) return

      const firstError =
        motorsRes.error?.message ??
        controllersRes.error?.message ??
        batteriesRes.error?.message ??
        hmiDisplaysRes.error?.message ??
        null

      setData({
        motors: (motorsRes.data as DbMotor[]) ?? [],
        controllers: (controllersRes.data as DbController[]) ?? [],
        batteries: (batteriesRes.data as DbBattery[]) ?? [],
        hmiDisplays: (hmiDisplaysRes.data as DbHmiDisplay[]) ?? [],
        loading: false,
        error: firstError,
      })
    }

    fetchAll()
    return () => {
      cancelled = true
    }
  }, [])

  return <ProductDataContext.Provider value={data}>{children}</ProductDataContext.Provider>
}
