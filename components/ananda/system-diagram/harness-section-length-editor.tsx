"use client"

import { useId, useState } from "react"
import { useAnandaStore } from "@/lib/ananda-store"
import { CUSTOM_LENGTH_LIMITS_MM, validateCustomLengthMm } from "@/lib/bike-overview/templates"
import type { HarnessCableSection } from "@/lib/m7200-harness"

export function HarnessSectionLengthEditor({ section }: { section: HarnessCableSection }) {
  const id = useId()
  const save = useAnandaStore(state => state.setCableLength)
  const [draft, setDraft] = useState(section.lengthMm == null ? "" : String(section.lengthMm))
  const [saved, setSaved] = useState(false)
  const error = draft.trim() === "" ? "Enter a cable length." : validateCustomLengthMm(Number(draft))
  return (
    <form className="space-y-3 p-4" onSubmit={event => {
      event.preventDefault()
      if (error) return
      save(section.connection, Number(draft) / 1000, "custom")
      setSaved(true)
    }}>
      <h4 className="font-semibold">{section.label}</h4>
      {section.catalogLengthMm != null && <p className="text-xs text-muted-foreground">Catalog sensor lead: {section.catalogLengthMm} mm. The configured section length can be changed below.</p>}
      <label htmlFor={id} className="block text-sm">Cable length (mm)</label>
      <input id={id} type="number" inputMode="numeric" min={CUSTOM_LENGTH_LIMITS_MM.min} max={CUSTOM_LENGTH_LIMITS_MM.max} step="any"
        value={draft} onChange={event => { setDraft(event.target.value); setSaved(false) }}
        aria-invalid={draft !== "" && !!error} aria-describedby={`${id}-help`}
        className="min-h-11 w-full border border-border bg-background px-3 text-sm" />
      <p id={`${id}-help`} className="text-xs text-muted-foreground">{draft !== "" && error ? error : `Between ${CUSTOM_LENGTH_LIMITS_MM.min} and ${CUSTOM_LENGTH_LIMITS_MM.max} mm.`}</p>
      <button type="submit" disabled={!!error} className="min-h-11 border border-primary bg-primary px-4 text-sm font-semibold text-white disabled:opacity-40">Save length</button>
      <p role="status" className="text-xs text-primary">{saved ? "Length saved" : ""}</p>
    </form>
  )
}
