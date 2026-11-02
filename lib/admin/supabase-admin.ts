import "server-only"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

export const MEDIA_BUCKET = "site-media"

// No generated database types in this project, so table rows are loosely typed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LooseClient = SupabaseClient<any, "public", any>

let client: LooseClient | undefined

/** Service-role client. Only ever import this from server code that has already verified the admin session. */
export function createAdminClient() {
  if (!client) {
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error("Supabase service role is not configured")
    client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  }
  return client
}
