export const LOCALES = [
  { code: "en", label: "English", short: "EN" },
  { code: "zh", label: "中文", short: "中文" },
] as const

export type Locale = (typeof LOCALES)[number]["code"]

export const DEFAULT_LOCALE: Locale = "en"
export const LOCALE_COOKIE = "ananda-locale"
export const TRANSLATIONS_CACHE_TAG = "site-translations"

export function isLocale(value: unknown): value is Locale {
  return LOCALES.some((l) => l.code === value)
}

/** Admin-edited translations, keyed by locale and then by the English source text. */
export type TranslationOverrides = Record<Locale, Record<string, string>>

export const EMPTY_OVERRIDES: TranslationOverrides = { en: {}, zh: {} }

export const HTML_LANG: Record<Locale, string> = { en: "en", zh: "zh-CN" }
