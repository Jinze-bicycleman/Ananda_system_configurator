"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
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
  const [editingKey, setEditingKey] = useState<CableKey | null>(null)

  const editingCable = editingKey ? (cables.find((c) => c.key === editingKey && c.visible) ?? null) : null
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
              <div
                className={cn(
 "flex h-full w-full flex-col border transition-colors",
                  !cable.visible && "opacity-50",
                  isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                )}
              >
                <button
                  type="button"
                  disabled={!cable.visible}
                  aria-pressed={isSelected}
                  onClick={() => setSelected(cable.key)}
                  className="flex min-h-11 w-full flex-1 flex-col gap-1 p-3 pb-2 text-left disabled:cursor-not-allowed"
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
                  {!cable.visible && (
                    <span className="text-xs text-muted-foreground">{cable.hiddenReason ? t(cable.hiddenReason) : null}</span>
                  )}
                </button>
                {cable.visible && (
                  <div className="flex items-end justify-between gap-2 px-3 pb-3">
                    <div className="flex flex-col">
                      <span className="tabular-nums text-base font-semibold text-graphite">{formatLengthCm(cable.lengthMm)}</span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {cable.mode === "custom" ? t("Custom") : t("Standard")}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(cable.key)
                        setEditingKey(cable.key)
                      }}
                      className="inline-flex min-h-9 items-center gap-1.5 border border-primary px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      {t("Edit cable length")}
                    </button>
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      <Dialog open={editingCable !== null} onOpenChange={(open) => !open && setEditingKey(null)}>
        <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-4 sm:max-w-2xl [&_header]:pr-8">
          <DialogTitle className="sr-only">{t("Edit cable length")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("Select a cable on the bike or below to edit its length.")}
          </DialogDescription>
          {editingCable && <CableEditor key={editingCable.key} cable={editingCable} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
