"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAnandaStore } from "@/lib/ananda-store"
import { regulationsForMarket, sellMarkets } from "@/lib/ananda-regulations"
import { StepHeader } from "@/components/ananda/ui-primitives"
import { useT } from "@/lib/i18n/provider"

type SectionKey = "sellRegion" | "regulation"

function SectionHeader({
  index,
  title,
  summary,
  done,
  open,
  disabled,
  onToggle,
}: {
  index: number
  title: string
  summary: string
  done: boolean
  open: boolean
  disabled?: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      aria-expanded={open}
      className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-secondary/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
    >
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
        )}
      >
        {done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : index}
      </span>
      <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <span className="text-base font-semibold text-graphite">{title}</span>
        <span className="text-sm text-muted-foreground">{summary}</span>
      </span>
      <ChevronDown
        className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
        aria-hidden="true"
      />
    </button>
  )
}

const inputClass =
  "mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"

export function Step1ProjectContext() {
  const s = useAnandaStore()
  const t = useT()
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({ sellRegion: true, regulation: true })
  const regulations = regulationsForMarket(s.sellRegion)
  const selectedRegulationOption = regulations.find((option) => option.label === s.regulation)
  const showCustomFields = Boolean(
    selectedRegulationOption && selectedRegulationOption.speedLimitKmh == null && selectedRegulationOption.ratedPowerW == null,
  )

  const toggle = (key: SectionKey) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="space-y-4">
      <StepHeader
        step={1}
        title={t("Sell region & regulation")}
        subtitle={t("Define the market and compliance target for the system configuration.")}
        className="mb-4"
      />

      <section
        id="field-sellRegion"
        className={cn("overflow-hidden rounded-lg border bg-card", openSections.sellRegion ? "border-primary/40" : "border-border")}
      >
        <SectionHeader
          index={1}
          title={t("Sell region / market")}
          summary={s.sellRegion ? t(s.sellRegion) : t("Select the market where the system will be sold.")}
          done={Boolean(s.sellRegion)}
          open={openSections.sellRegion}
          onToggle={() => toggle("sellRegion")}
        />
        {openSections.sellRegion && (
          <div className="border-t border-border p-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {sellMarkets.map((market) => (
                <button
                  key={market}
                  type="button"
                  aria-pressed={s.sellRegion === market}
                  onClick={() => s.setMarket(market)}
                  className={cn(
                    "min-h-12 rounded-md border px-3 py-2 text-left text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                    s.sellRegion === market
                      ? "border-primary bg-primary/5 font-semibold text-primary ring-1 ring-primary"
                      : "border-border bg-card text-graphite hover:border-primary/40 hover:bg-secondary/60",
                  )}
                >
                  {t(market)}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <section
        id="field-regulation"
        className={cn("overflow-hidden rounded-lg border bg-card", openSections.regulation ? "border-primary/40" : "border-border")}
      >
        <SectionHeader
          index={2}
          title={t("Regulation")}
          summary={
            s.regulation
              ? `${t(s.regulation)} · ${s.speedLimitKmh ?? t("Custom")} km/h`
              : t("Choose a regulation for the selected market.")
          }
          done={Boolean(s.regulation)}
          open={openSections.regulation}
          disabled={!s.sellRegion}
          onToggle={() => toggle("regulation")}
        />
        {openSections.regulation && (
          <div className="border-t border-border p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {regulations.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={s.regulation === option.label}
                  onClick={() => {
                    s.setRegulation(option.label)
                    s.setField("speedLimitKmh", option.speedLimitKmh)
                    s.setField("ratedPowerW", option.ratedPowerW)
                  }}
                  className={cn(
                    "rounded-md border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                    s.regulation === option.label
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-primary/40 hover:bg-secondary/60",
                  )}
                >
                  <span className="block text-base font-semibold text-graphite">{t(option.label)}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{t(option.note)}</span>
                  <span className="mt-3 block text-sm font-medium tabular-nums text-primary">
                    {option.speedLimitKmh ? `${option.speedLimitKmh} km/h` : t("Manual speed")} ·{" "}
                    {option.ratedPowerW ? `${option.ratedPowerW} W` : t("Manual power")}
                  </span>
                </button>
              ))}
            </div>
            {showCustomFields && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium text-graphite">
                  {t("Speed limit (km/h)")}
                  <input
                    type="number"
                    value={s.speedLimitKmh ?? ""}
                    onChange={(e) => s.setField("speedLimitKmh", e.target.value ? Number(e.target.value) : null)}
                    className={inputClass}
                  />
                </label>
                <label className="text-sm font-medium text-graphite">
                  {t("Rated power (W)")}
                  <input
                    type="number"
                    value={s.ratedPowerW ?? ""}
                    onChange={(e) => s.setField("ratedPowerW", e.target.value ? Number(e.target.value) : null)}
                    className={inputClass}
                  />
                </label>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
