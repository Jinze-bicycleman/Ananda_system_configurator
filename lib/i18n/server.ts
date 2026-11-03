import "server-only"
import { unstable_cache } from "next/cache"
import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/admin/supabase-admin"
import {
  DEFAULT_LOCALE,
  EMPTY_OVERRIDES,
  LOCALE_COOKIE,
  TRANSLATIONS_CACHE_TAG,
  isLocale,
  type Locale,
  type TranslationOverrides,
} from "./config"

export async function getServerLocale(): Promise<Locale> {
  const stored = (await cookies()).get(LOCALE_COOKIE)?.value
  return isLocale(stored) ? stored : DEFAULT_LOCALE
}

const loadOverrides = unstable_cache(
  async (): Promise<TranslationOverrides> => {
    const { data, error } = await createAdminClient().from("site_translations").select("locale, source, value")
    if (error) throw error
    const result: TranslationOverrides = { en: {}, zh: {} }
    for (const row of (data ?? []) as { locale: string; source: string; value: string }[]) {
      if (isLocale(row.locale)) result[row.locale][row.source] = row.value
    }
    return result
  },
  ["site-translations"],
  { tags: [TRANSLATIONS_CACHE_TAG], revalidate: 300 },
)

/** Never throws: the site falls back to the bundled translations if the database is unreachable. */
export async function getTranslationOverrides(): Promise<TranslationOverrides> {
  try {
    return await loadOverrides()
  } catch {
    return EMPTY_OVERRIDES
  }
}
