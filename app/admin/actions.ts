"use server"

import { revalidatePath, updateTag } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/admin/supabase-admin"
import { checkCredentials, createSession, destroySession, requireAdmin } from "@/lib/admin/session"
import { getProductTable, type ProductField } from "@/lib/admin/product-schema"
import { TRANSLATIONS_CACHE_TAG, isLocale } from "@/lib/i18n/config"

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string }
export type LoginState = { error?: string } | undefined

const MAX_ATTEMPTS = 5
const WINDOW_MS = 10 * 60 * 1000
const attempts = new Map<string, { count: number; resetAt: number }>()

async function clientKey() {
  const h = await headers()
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const key = await clientKey()
  const now = Date.now()
  const entry = attempts.get(key)
  if (entry && entry.resetAt > now && entry.count >= MAX_ATTEMPTS) {
    return { error: "Too many attempts. Please wait a few minutes and try again." }
  }

  const username = String(formData.get("username") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  if (!username || !password) return { error: "Enter your account and password." }

  let valid = false
  try {
    valid = await checkCredentials(username, password)
  } catch {
    return { error: "The admin service is unavailable. Please try again shortly." }
  }

  if (!valid) {
    attempts.set(key, {
      count: entry && entry.resetAt > now ? entry.count + 1 : 1,
      resetAt: entry && entry.resetAt > now ? entry.resetAt : now + WINDOW_MS,
    })
    return { error: "Incorrect account or password." }
  }

  attempts.delete(key)
  await createSession(username)
  redirect("/admin")
}

export async function logoutAction() {
  await destroySession()
  redirect("/admin/login")
}

function coerce(field: ProductField, raw: unknown): { value: string | number | boolean | null } | { error: string } {
  if (field.type === "boolean") return { value: raw === true || raw === "true" }

  const text = typeof raw === "string" ? raw.trim() : raw == null ? "" : String(raw)
  if (text === "") {
    if (field.required) return { error: `${field.label} is required.` }
    return { value: null }
  }

  if (field.type === "number" || field.type === "integer") {
    const n = Number(text)
    if (!Number.isFinite(n)) return { error: `${field.label} must be a number.` }
    if (field.type === "integer" && !Number.isInteger(n)) return { error: `${field.label} must be a whole number.` }
    return { value: n }
  }

  if (field.type === "select" && !field.options?.some((o) => o.value === text)) {
    return { error: `${field.label} has an invalid value.` }
  }
  return { value: text }
}

export async function saveProductAction(
  table: string,
  id: string | null,
  values: Record<string, unknown>,
): Promise<ActionResult> {
  await requireAdmin()
  const config = getProductTable(table)
  if (!config) return { ok: false, error: "Unknown product table." }

  const payload: Record<string, string | number | boolean | null> = {}
  for (const field of config.fields) {
    const result = coerce(field, values[field.name])
    if ("error" in result) return { ok: false, error: result.error }
    payload[field.name] = result.value
  }
  if (payload.sort_order === null) payload.sort_order = 100
  payload.updated_at = new Date().toISOString()

  const supabase = createAdminClient()
  const query = id
    ? supabase.from(config.table).update(payload).eq("id", id).select("id").single()
    : supabase.from(config.table).insert(payload).select("id").single()
  const { data, error } = await query
  if (error) return { ok: false, error: error.message }

  revalidatePath("/admin")
  return { ok: true, id: (data as { id: string }).id }
}

export async function deleteProductAction(table: string, id: string): Promise<ActionResult> {
  await requireAdmin()
  const config = getProductTable(table)
  if (!config) return { ok: false, error: "Unknown product table." }

  const { error } = await createAdminClient().from(config.table).delete().eq("id", id)
  if (error) {
    const blocked = error.code === "23503"
    return {
      ok: false,
      error: blocked
        ? "This item is referenced by other records. Hide it from the configurator instead of deleting it."
        : error.message,
    }
  }
  revalidatePath("/admin")
  return { ok: true }
}

export async function saveContentAction(entries: { key: string; value: string }[]): Promise<ActionResult> {
  await requireAdmin()
  if (!Array.isArray(entries) || entries.length === 0) return { ok: true }

  const supabase = createAdminClient()
  const stamp = new Date().toISOString()
  for (const entry of entries) {
    if (typeof entry.key !== "string" || typeof entry.value !== "string") {
      return { ok: false, error: "Invalid content entry." }
    }
    const { error } = await supabase
      .from("site_content")
      .update({ value: entry.value.trim(), updated_at: stamp })
      .eq("key", entry.key)
    if (error) return { ok: false, error: error.message }
  }
  revalidatePath("/admin")
  return { ok: true }
}

const MAX_TRANSLATION_LENGTH = 4000

/** An empty value removes the override so the bundled default applies again. */
export async function saveTranslationsAction(
  locale: string,
  entries: { source: string; value: string }[],
): Promise<ActionResult> {
  await requireAdmin()
  if (!isLocale(locale)) return { ok: false, error: "Unknown language." }
  if (!Array.isArray(entries) || entries.length === 0) return { ok: true }

  const upserts: { locale: string; source: string; value: string; updated_at: string }[] = []
  const removals: string[] = []
  const stamp = new Date().toISOString()

  for (const entry of entries) {
    if (typeof entry.source !== "string" || typeof entry.value !== "string" || entry.source.trim() === "") {
      return { ok: false, error: "Invalid translation entry." }
    }
    const value = entry.value.trim()
    if (value.length > MAX_TRANSLATION_LENGTH) return { ok: false, error: "A translation is too long." }
    if (value === "") removals.push(entry.source)
    else upserts.push({ locale, source: entry.source, value, updated_at: stamp })
  }

  const supabase = createAdminClient()
  if (upserts.length > 0) {
    const { error } = await supabase.from("site_translations").upsert(upserts, { onConflict: "locale,source" })
    if (error) return { ok: false, error: error.message }
  }
  if (removals.length > 0) {
    const { error } = await supabase.from("site_translations").delete().eq("locale", locale).in("source", removals)
    if (error) return { ok: false, error: error.message }
  }

  updateTag(TRANSLATIONS_CACHE_TAG)
  revalidatePath("/", "layout")
  return { ok: true }
}
