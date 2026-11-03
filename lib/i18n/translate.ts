import { ZH_DEFAULTS } from "./catalog"
import type { Locale, TranslationOverrides } from "./config"

export type TranslateParams = Record<string, string | number>

function interpolate(text: string, params?: TranslateParams) {
  if (!params) return text
  return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match))
}

/**
 * English source text is the translation key. Lookup order:
 * admin override for the locale, then the bundled default, then the source text itself.
 */
export function translate(
  locale: Locale,
  overrides: TranslationOverrides,
  source: string,
  params?: TranslateParams,
): string {
  const override = overrides[locale]?.[source]
  const resolved =
    override !== undefined && override !== "" ? override : locale === "zh" ? (ZH_DEFAULTS[source] ?? source) : source
  return interpolate(resolved, params)
}
