"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { HTML_LANG, LOCALE_COOKIE, type Locale, type TranslationOverrides } from "./config"
import { translate, type TranslateParams } from "./translate"

type TFunction = (source: string, params?: TranslateParams) => string

type I18nValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TFunction
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({
  initialLocale,
  overrides,
  children,
}: {
  initialLocale: Locale
  overrides: TranslationOverrides
  children: React.ReactNode
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  useEffect(() => {
    document.documentElement.lang = HTML_LANG[locale]
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`
    setLocaleState(next)
  }, [])

  const t = useCallback<TFunction>(
    (source, params) => translate(locale, overrides, source, params),
    [locale, overrides],
  )

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const value = useContext(I18nContext)
  if (!value) throw new Error("useI18n must be used inside I18nProvider")
  return value
}

export function useT() {
  return useI18n().t
}
