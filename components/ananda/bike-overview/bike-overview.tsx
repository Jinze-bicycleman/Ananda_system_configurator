"use client"

import { useState } from "react"
import { useBikeOverview } from "@/lib/bike-overview/use-bike-overview"
import { formatLengthCm, type CableKey } from "@/lib/bike-overview/templates"
import { BikeCanvas } from "./bike-canvas"
import { CableEditor } from "./cable-editor"
import { cn } from "@/lib/utils"
import { useT } from "@/lib/i18n/provider"

export function BikeOverview() {
  const t = useT()
  const { template, products, cables, hasReferenceProducts } = useBikeOverview()
  const [selected, setSelected] = useState<CableKey>("hmi")

  const visibleCables = cables.filter((c) => c.visible)
  const selectedCable = visibleCables.find((c) => c.key === selected) ?? visibleCables[0] ?? null

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-semibold text-graphite-light">{t(template.name)} · {t("cable routing")}</p>
        <p className="text-xs text-muted-foreground">{t("Select a cable on the bike or below to edit its length.")}</p>
      </div>

      <div className="overflow-hidden border border-border bg-card">
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
          {t("Faded products are reference parts from the template; they appear until you select your own in Package Configuration.")}
        </p>
      )}

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
 "flex min-h-11 h-full w-full flex-col gap-1 border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                  isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                )}
              >
                <span className="mb-1 flex h-20 w-full items-center justify-center bg-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cable.meta.connectorImage}
                    alt={t("{name} connector drawing", { name: t(cable.placement.connectorLabel) })}
                    className="max-h-full max-w-full object-contain"
                  />
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-8 shrink-0" style={{ backgroundColor: cable.meta.stroke }} aria-hidden="true" />
                  <span className="text-xs font-semibold text-graphite">{t(cable.meta.title)}</span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {t(cable.meta.from)} → {t(cable.meta.to)}
                </span>
                {cable.visible ? (
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="tabular-nums text-base font-semibold text-graphite">{formatLengthCm(cable.lengthMm)}</span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {cable.mode === "custom" ? t("Custom") : t("Standard")}
                    </span>
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">{cable.hiddenReason ? t(cable.hiddenReason) : null}</span>
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
