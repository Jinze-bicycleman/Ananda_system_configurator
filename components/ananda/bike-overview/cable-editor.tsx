"use client"

import { useId, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { useAnandaStore } from "@/lib/ananda-store"
import { CUSTOM_LENGTH_LIMITS_MM, formatLengthCm, validateCustomLengthMm } from "@/lib/bike-overview/templates"
import type { ResolvedCable } from "@/lib/bike-overview/use-bike-overview"
import { ExtensionCableControl, useCableCatalog } from "../cable-spec-controls"
import { cn } from "@/lib/utils"

const modeButton = (active: boolean) =>
  cn(
    "min-h-10 flex-1 border-2 px-3 py-1.5 text-xs font-sans font-bold uppercase tracking-wide transition-colors",
    active ? "border-primary bg-primary/5 text-primary" : "border-border text-graphite hover:border-primary/40",
  )

export function CableEditor({ cable }: { cable: ResolvedCable }) {
  const s = useAnandaStore()
  const { extensionOptions } = useCableCatalog()
  const uid = useId()
  const { connection } = cable.meta
  const { standardLengthsMm } = cable.placement

  const [draft, setDraft] = useState(String(cable.lengthMm))
  const draftMm = Number(draft)
  const draftError = cable.mode === "custom" ? validateCustomLengthMm(draftMm) : null

  const chooseStandard = () => {
    if (cable.mode === "standard") return
    const fallback = standardLengthsMm.includes(cable.placement.defaultLengthMm) ? cable.placement.defaultLengthMm : standardLengthsMm[0]
    s.setCableLength(connection, fallback / 1000, "standard")
  }

  const chooseCustom = () => {
    if (cable.mode === "custom") return
    setDraft(String(cable.lengthMm))
    s.setCableLength(connection, cable.lengthMm / 1000, "custom")
  }

  const onDraftChange = (value: string) => {
    setDraft(value)
    const mm = Number(value)
    if (value.trim() !== "" && validateCustomLengthMm(mm) === null) s.setCableLength(connection, mm / 1000, "custom")
  }

  const standardOptions = standardLengthsMm.includes(cable.lengthMm) ? standardLengthsMm : [cable.lengthMm, ...standardLengthsMm]

  return (
    <section aria-labelledby={`${uid}-title`} className="border-2 border-border bg-card p-4 sm:p-5">
      <header className="mb-4 flex flex-wrap items-center gap-3 border-b border-border pb-3">
        <span className="h-1.5 w-10 shrink-0" style={{ backgroundColor: cable.meta.stroke }} aria-hidden="true" />
        <div className="min-w-0">
          <h3 id={`${uid}-title`} className="font-sans text-sm font-black uppercase tracking-wide text-graphite">
            {cable.meta.title} <span className="font-semibold text-muted-foreground">({cable.meta.colorName})</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            {cable.meta.from} → {cable.meta.to}
          </p>
        </div>
        <p className="ml-auto font-mono text-lg font-bold text-graphite">{formatLengthCm(cable.lengthMm)}</p>
      </header>

      <dl className="mb-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3">
        <div>
          <dt className="font-sans font-bold uppercase tracking-wider text-muted-foreground">Connector</dt>
          <dd className="mt-0.5 text-foreground">{cable.placement.connectorLabel}</dd>
        </div>
        <div>
          <dt className="font-sans font-bold uppercase tracking-wider text-muted-foreground">Pins</dt>
          <dd className="mt-0.5 text-foreground">{cable.pins ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-sans font-bold uppercase tracking-wider text-muted-foreground">Length</dt>
          <dd className="mt-0.5 text-foreground">{cable.lengthMm} mm</dd>
        </div>
      </dl>

      <div className="space-y-3">
        <div role="group" aria-label="Length source" className="flex gap-2">
          <button type="button" aria-pressed={cable.mode === "standard"} onClick={chooseStandard} className={modeButton(cable.mode === "standard")}>
            Standard length
          </button>
          <button type="button" aria-pressed={cable.mode === "custom"} onClick={chooseCustom} className={modeButton(cable.mode === "custom")}>
            Custom length
          </button>
        </div>

        {cable.mode === "standard" ? (
          <div>
            <label htmlFor={`${uid}-standard`} className="mb-1 block text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground">
              Standard lengths
            </label>
            <select
              id={`${uid}-standard`}
              value={cable.lengthMm}
              onChange={(e) => s.setCableLength(connection, Number(e.target.value) / 1000, "standard")}
              className="min-h-10 w-full border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none sm:max-w-xs"
            >
              {standardOptions.map((mm) => (
                <option key={mm} value={mm}>
                  {formatLengthCm(mm)} ({mm} mm)
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label htmlFor={`${uid}-custom`} className="mb-1 block text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground">
              Custom length (mm)
            </label>
            <input
              id={`${uid}-custom`}
              type="number"
              inputMode="numeric"
              min={CUSTOM_LENGTH_LIMITS_MM.min}
              max={CUSTOM_LENGTH_LIMITS_MM.max}
              step={10}
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              aria-invalid={draftError !== null}
              aria-describedby={`${uid}-custom-help`}
              className={cn(
                "min-h-10 w-full border bg-background px-3 text-sm text-foreground focus:outline-none sm:max-w-xs",
                draftError ? "border-destructive focus:border-destructive" : "border-border focus:border-primary",
              )}
            />
            <p id={`${uid}-custom-help`} className={cn("mt-1.5 text-xs", draftError ? "text-destructive" : "text-muted-foreground")}>
              {draftError ?? `Between ${CUSTOM_LENGTH_LIMITS_MM.min} and ${CUSTOM_LENGTH_LIMITS_MM.max} mm.`}
            </p>
            <p className="mt-2 flex items-start gap-1.5 text-xs text-warning">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Custom lengths are outside the standard range. Confirm with the Ananda sales team before ordering.
            </p>
          </div>
        )}

        <div>
          <p className="mb-1 text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground">Extension cable (optional)</p>
          <ExtensionCableControl connection={connection} extensionOptions={extensionOptions} />
        </div>
      </div>
    </section>
  )
}
