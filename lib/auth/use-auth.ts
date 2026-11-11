"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

export type UserProfile = {
  brand_name: string
  company: string
  user_name: string
  email: string
  phone: string
  address: string
}

export const EMPTY_PROFILE: UserProfile = {
  brand_name: "",
  company: "",
  user_name: "",
  email: "",
  phone: "",
  address: "",
}

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const { data } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null)
      setReady(true)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  return { user, ready }
}

export function useProfile(user: User | null) {
  const { data, error, isLoading, mutate } = useSWR(
    user ? (["user-profile", user.id] as const) : null,
    async ([, id]): Promise<UserProfile> => {
      const { data, error } = await createClient()
        .from("user_profiles")
        .select("brand_name, company, user_name, email, phone, address")
        .eq("id", id)
        .maybeSingle()
      if (error) throw error
      return { ...EMPTY_PROFILE, ...(data ?? {}) }
    },
    { revalidateOnFocus: false },
  )

  async function save(next: UserProfile) {
    if (!user) throw new Error("Not signed in")
    const { error } = await createClient()
      .from("user_profiles")
      .upsert({ id: user.id, ...next, updated_at: new Date().toISOString() })
    if (error) throw error
    await mutate(next, { revalidate: false })
  }

  return { profile: data, error, isLoading, save }
}
