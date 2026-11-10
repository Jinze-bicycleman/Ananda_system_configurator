"use server"

import { timingSafeEqual } from "node:crypto"
import { headers } from "next/headers"
import { createAdminClient } from "@/lib/admin/supabase-admin"

export type SignUpResult = { ok: true } | { ok: false; error: string }

const MAX_ATTEMPTS = 8
const WINDOW_MS = 10 * 60 * 1000
const attempts = new Map<string, { count: number; resetAt: number }>()

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function sameText(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

async function clientKey() {
  const h = await headers()
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
}

/** Validates the invite code on the server, then creates the account. The code is never sent to the browser. */
export async function signUpAction(input: {
  email: string
  password: string
  inviteCode: string
}): Promise<SignUpResult> {
  const key = await clientKey()
  const now = Date.now()
  const entry = attempts.get(key)
  const active = entry && entry.resetAt > now
  if (active && entry.count >= MAX_ATTEMPTS) {
    return { ok: false, error: "Too many attempts. Please wait a few minutes and try again." }
  }

  const email = String(input.email ?? "").trim().toLowerCase()
  const password = String(input.password ?? "")
  const inviteCode = String(input.inviteCode ?? "").trim()

  if (!EMAIL_PATTERN.test(email)) return { ok: false, error: "Enter a valid email address." }
  if (password.length < 8) return { ok: false, error: "Use a password with at least 8 characters." }
  if (!inviteCode) return { ok: false, error: "Enter your invite code." }

  const supabase = createAdminClient()
  const { data: setting, error: settingError } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "signup_invite_code")
    .maybeSingle()
  if (settingError) return { ok: false, error: "Sign-up is unavailable right now. Please try again shortly." }

  const expected = String((setting as { value?: string } | null)?.value ?? "").trim()
  if (!expected || !sameText(inviteCode.toLowerCase(), expected.toLowerCase())) {
    attempts.set(key, { count: active ? entry.count + 1 : 1, resetAt: active ? entry.resetAt : now + WINDOW_MS })
    return { ok: false, error: "That invite code is not valid." }
  }

  const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true })
  if (error || !data.user) {
    const exists = error?.message?.toLowerCase().includes("already") || error?.code === "email_exists"
    if (exists) return { ok: false, error: "An account with this email already exists. Try logging in instead." }
    if (error?.code === "weak_password") return { ok: false, error: "That password is too weak. Try a longer one." }
    return { ok: false, error: "We could not create your account. Please try again." }
  }

  await supabase.from("user_profiles").upsert({ id: data.user.id, email, updated_at: new Date().toISOString() })
  attempts.delete(key)
  return { ok: true }
}
