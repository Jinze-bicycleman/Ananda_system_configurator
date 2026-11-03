"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus, RotateCcw, Save, Search } from "lucide-react"
import { saveTranslationsAction } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { CatalogSection } from "@/lib/i18n/catalog-types"
import { LOCALES, type Locale } from "@/lib/i18n/config"

export type TranslationRow = { locale: string; source: string; value: string }

type OverrideMap = Record<string, string>
type Overrides = Record<Locale, OverrideMap>

const CUSTOM_SECTION = "Custom entries"

function groupOverrides(rows: TranslationRow[]): Overrides {
  const result: Overrides = { en: {}, zh: {} }
  for (const row of rows) {
    if (row.locale === "en" || row.locale === "zh") result[row.locale][row.source] = row.value
  }
  return result
}

type Props = {
  sections: CatalogSection[]
  zhDefaults: Record<string, string>
  rows: TranslationRow[]
}

export function TranslationEditor({ sections, zhDefaults, rows }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [locale, setLocale] = useState<Locale>("zh")
  const [saved, setSaved] = useState<Overrides>(() => groupOverrides(rows))
  const [draft, setDraft] = useState<Overrides>(() => groupOverrides(rows))
  const [query, setQuery] = useState("")
  const [newSource, setNewSource] = useState("")
  const [newValue, setNewValue] = useState("")
  const [status, setStatus] = useState<{ tone: "ok" | "error"; text: string } | null>(null)

  const catalogSources = useMemo(() => new Set(sections.flatMap((s) => Object.keys(s.entries))), [sections])

  const defaultFor = (source: string) => (locale === "zh" ? (zhDefaults[source] ?? "") : source)
  const effective = (map: OverrideMap, source: string) => (map[source] !== undefined && map[source] !== "" ? map[source] : defaultFor(source))

  const customSources = useMemo(() => {
    const all = new Set([...Object.keys(saved[locale]), ...Object.keys(draft[locale])])
    return [...all].filter((source) => !catalogSources.has(source)).sort((a, b) => a.localeCompare(b))
  }, [saved, draft, locale, catalogSources])

  const allSections: CatalogSection[] = useMemo(() => {
    const custom: CatalogSection = {
      title: CUSTOM_SECTION,
      entries: Object.fromEntries(customSources.map((s) => [s, ""])),
    }
    return customSources.length > 0 ? [...sections, custom] : sections
  }, [sections, customSources])

  const needle = query.trim().toLowerCase()
  const visibleSections = allSections
    .map((section) => ({
      ...section,
      list: Object.keys(section.entries).filter((source) => {
        if (!needle) return true
        return source.toLowerCase().includes(needle) || effective(draft[locale], source).toLowerCase().includes(needle)
      }),
    }))
    .filter((section) => section.list.length > 0)

  const allSources = allSections.flatMap((s) => Object.keys(s.entries))
  const dirty = allSources.filter((source) => effective(draft[locale], source) !== effective(saved[locale], source))

  function setValue(source: string, value: string) {
    setStatus(null)
    setDraft((d) => ({ ...d, [locale]: { ...d[locale], [source]: value } }))
  }

  function resetRow(source: string) {
    setStatus(null)
    setDraft((d) => {
      const next = { ...d[locale] }
      delete next[source]
      return { ...d, [locale]: next }
    })
  }

  function addCustom() {
    const source = newSource.trim()
    const value = newValue.trim()
    if (!source || !value) {
      setStatus({ tone: "error", text: "Enter both the English text and its translation." })
      return
    }
    setDraft((d) => ({ ...d, [locale]: { ...d[locale], [source]: value } }))
    setNewSource("")
    setNewValue("")
    setStatus(null)
  }

  function save() {
    const entries = dirty.map((source) => {
      const value = effective(draft[locale], source)
      return { source, value: value === defaultFor(source) ? "" : value }
    })
    startTransition(async () => {
      const result = await saveTranslationsAction(locale, entries)
      if (result.ok) {
        const cleaned = { ...draft[locale] }
        for (const entry of entries) if (entry.value === "") delete cleaned[entry.source]
        setDraft((d) => ({ ...d, [locale]: cleaned }))
        setSaved((s) => ({ ...s, [locale]: cleaned }))
        setStatus({ tone: "ok", text: "Translations saved. The site now shows the new text." })
        router.refresh()
      } else {
        setStatus({ tone: "error", text: result.error })
      }
    })
  }

  const localeLabel = LOCALES.find((l) => l.code === locale)?.label ?? locale

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="grid gap-4 md:grid-cols-[200px_1fr]">
          <div className="space-y-1.5">
            <Label htmlFor="translation-locale">Language to edit</Label>
            <select
              id="translation-locale"
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {LOCALES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="translation-search">Search text</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                id="translation-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the English or translated text"
                className="pl-9"
              />
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          The English text on the left is the original. Edit the {localeLabel} text on the right; changes apply to the whole
          site once saved. Use <span className="font-mono text-xs">{"{name}"}</span>-style placeholders exactly as they appear — they are replaced with live values. Clear a field or use the reset button to return to the built-in default.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card">
        <h2 className="border-b border-border px-5 py-3 text-sm font-semibold text-graphite">Add text that is not listed</h2>
        <div className="grid gap-4 p-5 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="new-source">English text (exactly as shown on the site)</Label>
            <Input id="new-source" value={newSource} onChange={(e) => setNewSource(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-value">{localeLabel} text</Label>
            <Input id="new-value" value={newValue} onChange={(e) => setNewValue(e.target.value)} />
          </div>
          <Button type="button" variant="outline" onClick={addCustom}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add
          </Button>
        </div>
        <p className="px-5 pb-4 text-xs text-muted-foreground">
          Use this for product names or descriptions that come from the product tables: type the English text exactly as it
          appears and give its translation.
        </p>
      </section>

      {visibleSections.length === 0 && <p className="text-sm text-muted-foreground">No text matches your search.</p>}

      {visibleSections.map((section) => (
        <section key={section.title} className="rounded-xl border border-border bg-card">
          <h2 className="border-b border-border px-5 py-3 text-sm font-semibold text-graphite">
            {section.title}
            <span className="ml-2 text-xs font-normal text-muted-foreground">{section.list.length}</span>
          </h2>
          <ul className="divide-y divide-border">
            {section.list.map((source) => {
              const value = effective(draft[locale], source)
              const isCustom = section.title === CUSTOM_SECTION
              const modified = draft[locale][source] !== undefined && draft[locale][source] !== "" && draft[locale][source] !== defaultFor(source)
              const changed = value !== effective(saved[locale], source)
              const long = source.length > 70 || value.length > 70
              return (
                <li key={source} className="grid gap-3 px-5 py-4 md:grid-cols-2">
                  <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{source}</p>
                  <div className="flex items-start gap-2">
                    {long ? (
                      <Textarea
                        aria-label={`${localeLabel} text for ${source}`}
                        value={value}
                        onChange={(e) => setValue(source, e.target.value)}
                        rows={3}
                        className={changed ? "border-primary" : undefined}
                      />
                    ) : (
                      <Input
                        aria-label={`${localeLabel} text for ${source}`}
                        value={value}
                        onChange={(e) => setValue(source, e.target.value)}
                        className={changed ? "border-primary" : undefined}
                      />
                    )}
                    {(modified || isCustom) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => (isCustom ? setValue(source, "") : resetRow(source))}
                        aria-label={isCustom ? `Remove custom text ${source}` : `Reset ${source} to default`}
                        title={isCustom ? "Remove" : "Reset to default"}
                      >
                        <RotateCcw className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ))}

      <div className="sticky bottom-0 -mx-1 flex items-center justify-between gap-4 border-t border-border bg-background/95 px-1 py-3 backdrop-blur">
        <p role="status" className={`text-sm ${status?.tone === "error" ? "text-destructive" : "text-muted-foreground"}`}>
          {status?.text ?? (dirty.length > 0 ? `${dirty.length} unsaved ${dirty.length === 1 ? "change" : "changes"}` : "No unsaved changes")}
        </p>
        <Button type="button" onClick={save} disabled={pending || dirty.length === 0}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
          Save translations
        </Button>
      </div>
    </div>
  )
}
