"use client"

import { useState } from "react"
import { useBikeOverview } from "@/lib/bike-overview/use-bike-overview"
import { formatLengthCm, type CableKey } from "@/lib/bike-overview/templates"
import { BikeCanvas } from "./bike-canvas"
import { CableEditor } from "./cable-editor"
import { cn } from "@/lib/utils"

export function BikeOverview() {
  const { template, products, cables, hasReferenceProducts } = useBikeOverview()
  const [selected, setSelected] = useState<CableKey>("hmi")

  const visibleCables = cables.filter((c) => c.visible)
  const selectedCable = visibleCables.find((c) => c.key === selected) ?? visibleCables[0] ?? null

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-sans text-xs font-bold uppercase tracking-wider text-graphite-light">{template.name} · cable routing</p>
        <p className="text-xs text-muted-foreground">Select a cable on the bike or below to edit its length.</p>
      </div>

      <div className="overflow-hidden border border-border bg-white">
        <BikeCanvas
          template={template}
          products={products}
          cables={cables}
          selected={selectedCable?.key ?? selected}
          onSelect={setSelected}
        />
      </div>

      {hasReferenceProducts && (
        <p className="text-xs text-muted-foreground">
          Faded products are reference parts from the template; they appear until you select your own in Package Configuration.
        </p>
      )}

      <ul className="grid gap-3 md:grid-cols-3">
        {cables.map((cable) => {
          const isSelected = selectedCable?.key === cable.key
          return (
            <li key={cable.key}>
              <button
                type="button"
                disabled={!cable.visible}
                aria-pressed={isSelected}
                onClick={() => setSelected(cable.key)}
                className={cn(
                  "flex min-h-11 w-full flex-col gap-1 border-2 p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                  isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-8 shrink-0" style={{ backgroundColor: cable.meta.stroke }} aria-hidden="true" />
                  <span className="font-sans text-xs font-bold uppercase tracking-wide text-graphite">{cable.meta.title}</span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {cable.meta.from} → {cable.meta.to}
                </span>
                {cable.visible ? (
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-mono text-base font-bold text-graphite">{formatLengthCm(cable.lengthMm)}</span>
                    <span className="text-[11px] font-sans font-bold uppercase tracking-wide text-muted-foreground">
                      {cable.mode === "custom" ? "Custom" : "Standard"}
                    </span>
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">{cable.hiddenReason}</span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      {selectedCable && <CableEditor key={selectedCable.key} cable={selectedCable} />}
    </div>
  )
}
