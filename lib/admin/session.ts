import "server-only"
import { createHmac, scryptSync, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createAdminClient } from "./supabase-admin"

export const ADMIN_COOKIE = "ananda_admin_session"
const SESSION_SECONDS = 60 * 60 * 8

function secret() {
  const value = process.env.SUPABASE_JWT_SECRET
  if (!value) throw new Error("SUPABASE_JWT_SECRET is not configured")
  return value
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url")
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

export function verifyPassword(password: string, stored: string) {
  const [scheme, saltHex, hashHex] = stored.split("$")
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false
  const expected = Buffer.from(hashHex, "hex")
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length)
  return timingSafeEqual(actual, expected)
}

export async function checkCredentials(username: string, password: string) {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("admin_accounts")
    .select("username, password_hash")
    .eq("username", username)
    .maybeSingle()

  // Hash a dummy value for unknown users so response timing does not reveal valid usernames.
  const stored = data?.password_hash ?? "scrypt$00000000000000000000000000000000$" + "00".repeat(64)
  const valid = verifyPassword(password, stored)
  return Boolean(data) && valid
}

export async function createSession(username: string) {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS
  const payload = Buffer.from(JSON.stringify({ u: username, e: expires })).toString("base64url")
  const token = `${payload}.${sign(payload)}`
  const production = process.env.NODE_ENV === "production"
  const store = await cookies()
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: true,
    // The v0 preview renders inside a cross-site iframe, so the cookie must be SameSite=None there.
    sameSite: production ? "lax" : "none",
    path: "/",
    maxAge: SESSION_SECONDS,
  })
}

export async function destroySession() {
  const store = await cookies()
  store.delete(ADMIN_COOKIE)
}

export async function getAdminUsername(): Promise<string | null> {
  const store = await cookies()
  const token = store.get(ADMIN_COOKIE)?.value
  if (!token) return null
  const [payload, signature] = token.split(".")
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return null
  try {
    const { u, e } = JSON.parse(Buffer.from(payload, "base64url").toString())
    if (typeof u !== "string" || typeof e !== "number" || e < Date.now() / 1000) return null
    return u
  } catch {
    return null
  }
}

/** For pages and layouts: send unauthenticated visitors to the login page. */
export async function requireAdminPage() {
  const username = await getAdminUsername()
  if (!username) redirect("/admin/login")
  return username
}

/** For server actions and route handlers: throw when the caller is not signed in. */
export async function requireAdmin() {
  const username = await getAdminUsername()
  if (!username) throw new Error("Not authorised")
  return username
}
