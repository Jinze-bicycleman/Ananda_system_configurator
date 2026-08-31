"use client"

import { useState } from "react"
import { useAnandaStore } from "@/lib/ananda-store"
import { cn } from "@/lib/utils"
import { CheckCircle2, ChevronDown, RotateCcw, Zap } from "lucide-react"

const DRIVE_SYSTEMS = [
  { id: "hub" as const, title: "Hub Motor", disabled: true },
  { id: "mid" as const, title: "Mid-Drive Motor", disabled: false },
]

const VOLTAGE_PLATFORMS = [36, 48, 52] as const

/**
 * Optional expert override for the recommendation engine — collapsed by
 * default. When left untouched the engine considers both mid-drive voltage
 * platforms; when set here it's applied as a hard filter before ranking.
 * Writes to `advancedDriveType` / `advancedVoltagePlatform`, which are
 * separate from the real `driveType`/`voltagePlatform` fields (those get set
 * by `applyRecommendedSolution` once a solution is chosen).
 */
export function AdvancedDriveOverride() {
  const s = useAnandaStore()
  const [open, setOpen] = useState(false)
  const hasOverride = Boolean(s.advancedDriveType || s.advancedVoltagePlatform)

  return (
    <div className="mt-10 border border-dashed border-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground">
          Advanced: Override Drive Type / Voltage
          {hasOverride && <span className="rounded-sm bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">Active</span>}
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="border-t border-dashed border-border p-4">
          <p className="mb-4 text-xs font-body leading-relaxed text-muted-foreground">
            Constrain the recommendation engine to a specific drive type or voltage platform before ranking. Leave untouched to let the
            engine consider both 36V and 48V mid-drive options.
          </p>

          <div className="mb-4">
            <p className="mb-2 text-[11px] font-sans font-bold uppercase tracking-wider text-graphite">Drive Type</p>
            <div className="flex flex-wrap gap-3">
              {DRIVE_SYSTEMS.map((ds) => {
                const selected = s.advancedDriveType === ds.id
                return (
                  <button
                    key={ds.id}
                    type="button"
                    disabled={ds.disabled}
                    onClick={() => s.setAdvancedOverride(selected ? null : ds.id, s.advancedVoltagePlatform)}
                    className={cn(
                      "flex min-w-0 flex-1 basis-40 items-center justify-between gap-2 border-2 px-3 py-2.5 text-left text-sm font-sans font-semibold transition-colors",
                      ds.disabled
                        ? "cursor-not-allowed border-border text-muted-foreground opacity-50"
                        : selected
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-graphite hover:border-primary/40",
                    )}
                  >
                    {ds.title}
                    {selected && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                    {ds.disabled && <span className="text-[10px] uppercase tracking-wider">Soon</span>}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mb-4">
            <p className="mb-2 text-[11px] font-sans font-bold uppercase tracking-wider text-graphite">Voltage Platform</p>
            <div className="flex flex-wrap gap-3">
              {VOLTAGE_PLATFORMS.map((v) => {
                const selected = s.advancedVoltagePlatform === v
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => s.setAdvancedOverride(s.advancedDriveType, selected ? null : v)}
                    className={cn(
                      "flex min-w-0 flex-1 basis-24 items-center justify-center gap-1.5 border-2 px-3 py-2.5 text-sm font-sans font-bold transition-colors",
                      selected ? "border-primary bg-primary/5 text-primary" : "border-border text-graphite hover:border-primary/40",
                    )}
                  >
                    <Zap className="h-3.5 w-3.5" />
                    {v}V
                  </button>
                )
              })}
            </div>
          </div>

          {hasOverride && (
            <button
              type="button"
              onClick={() => s.clearAdvancedOverride()}
              className="flex items-center gap-1.5 text-[11px] font-sans font-bold uppercase tracking-wider text-muted-foreground hover:text-primary"
            >
              <RotateCcw className="h-3 w-3" /> Clear Override
            </button>
          )}
        </div>
      )}
    </div>
  )
}
