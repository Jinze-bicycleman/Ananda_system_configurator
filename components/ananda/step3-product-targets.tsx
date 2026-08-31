"use client"

import { useEffect, useMemo, useState } from "react"
import { Bluetooth, CheckCircle2, ChevronDown, Lightbulb, MapPin, Search, Settings2, ShieldCheck } from "lucide-react"
import { useAnandaStore } from "@/lib/ananda-store"
import { useTyreWidthOptions, useWheelSizeOptions, useTyreSizeMatch } from "@/lib/ananda-tyre-data"
import {
  RIDER_PROFILES,
  WEIGHT_BANDS,
  RANGE_BANDS,
  TORQUE_BANDS,
  applyRiderProfile,
  type WeightBand,
  type RangeBand,
  type TorqueBand,
  type FunctionLevel,
} from "@/lib/ananda-product-targets"
import { StepHeader, SectionLabel, ChoiceGroup } from "./ui-primitives"
import { cn } from "@/lib/utils"

// Each rider profile reuses the bicycle-application photography from the
// (now-retired) standalone Bike Category step, and drives `bikeCategory`
// directly — one rider-profile choice sets both the product targets and the
// vehicle category in a single step. Profiles that don't map to one of the
// original categories (Fat bike, Folding bike, Speed pedelec, Other) are
// intentionally left unmatched and unshown here.
const RIDER_PROFILE_IMAGES: Record<string, string> = {
  commuter: "/images/bike-category-city.jpg",
  family_cargo: "/images/bike-category-cargo-2wheeler.png",
  trekking_adventure: "/images/bike-category-trekking.jpg",
  performance: "/images/bike-category-mtb.jpg",
}

const RIDER_PROFILE_BIKE_CATEGORY: Record<string, string> = {
  commuter: "City",
  family_cargo: "Cargo bike",
  trekking_adventure: "Trekking",
  performance: "MTB",
}

const FUNCTION_LEVELS: { id: FunctionLevel; label: string }[] = [
  { id: "must", label: "Must Have" },
  { id: "target", label: "Target" },
  { id: "nice", label: "Nice to Have" },
  { id: "not_required", label: "Not Required" },
]

function FunctionRow({
  icon: Icon,
  label,
  value,
  onChange,
  }: {
  icon: typeof Bluetooth
  label: string
  value: FunctionLevel
  onChange: (level: FunctionLevel) => void
  }) {
  return (
    <div className="flex flex-col gap-3 border border-border p-3 sm:flex-row sm:items-start sm:justify-between">
      <span className="flex min-w-0 items-center gap-2 text-sm font-sans font-semibold text-graphite">
    <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />
    <span>{label}</span>
  </span>
      <div className="choice-group sm:w-auto sm:justify-end">
        {FUNCTION_LEVELS.map((lvl) => (
          <button
            key={lvl.id}
            type="button"
            onClick={() => onChange(lvl.id)}
            className={cn(
              "border px-2 py-1.5 text-center text-[10px] font-sans font-bold uppercase tracking-wider transition-colors",
              value === lvl.id ? "border-primary bg-primary text-white" : "border-border text-muted-foreground hover:border-primary/40",
            )}
          >
            {lvl.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Step3ProductTargets() {
  const s = useAnandaStore()
  const t = s.productTargets
  const [advancedOpen, setAdvancedOpen] = useState(t.mode === "advanced")

  return (
    <div>
      <StepHeader
        step={2}
        title="Rider Profile & Product Targets"
        subtitle="Choose the bicycle application that best matches the rider, and define what this e-bike system needs to achieve. These targets drive the Recommended Solutions in the next step."
      />

      {/* Inherited constraints — read-only context from Step 1 & 2 */}
      <div className="mb-8 border border-border bg-surface p-4">
        <SectionLabel>Inherited Constraints</SectionLabel>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <InheritedField label="Market" value={s.sellRegion ?? "—"} />
          <InheritedField label="Regulation" value={s.regulation ?? "—"} />
          <InheritedField label="Speed Limit" value={s.speedLimitKmh ? `${s.speedLimitKmh} km/h` : "—"} />
          <InheritedField label="Rated Power" value={s.ratedPowerW ? `${s.ratedPowerW} W` : "—"} />
        </div>
      </div>

      {/* Rider profile presets — each one is a bicycle application (with its
          reused category photo) that also sets the product targets below. */}
      <div id="field-bikeCategory" className="mb-8">
        <SectionLabel>Rider Profile (Quick Assessment)</SectionLabel>
        <div id="field-productTargets" className="grid gap-4 md:grid-cols-2">
          {RIDER_PROFILES.map((preset) => {
            const selected = t.presetId === preset.id
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  s.setProductTarget(applyRiderProfile(preset))
                  const category = RIDER_PROFILE_BIKE_CATEGORY[preset.id]
                  if (category) s.setBikeCategory(category)
                }}
                className={cn(
                  "group relative overflow-hidden border text-left transition-colors",
                  selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/60",
                )}
              >
                <div className="relative h-56 overflow-hidden bg-muted sm:h-64">
                  <img
                    src={RIDER_PROFILE_IMAGES[preset.id]}
                    alt={`${preset.label} bicycle application`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-graphite/90 to-transparent p-4 pt-16">
                    <span className="text-lg font-bold uppercase tracking-wide text-white">{preset.label}</span>
                  </div>
                  {selected && (
                    <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center bg-primary text-primary-foreground">
                      <CheckCircle2 className="h-5 w-5" />
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-sm leading-6 text-muted-foreground">{preset.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Wheel & tyre data — depends on the bike category set by the rider
          profile above, and feeds the drivetrain estimates further down the
          flow, so it belongs here rather than in Functions & Connectivity. */}
      <WheelAndTyreSection />

      {/* Weight / Range / Torque bands */}
      <div className="mb-8 grid grid-cols-1 gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(100%,16rem),1fr))]">
        <div id="field-weightTarget" className="min-w-0">
          <p className="mb-2 text-xs font-sans font-bold uppercase tracking-wider text-graphite">System Weight</p>
          <ChoiceGroup
            options={(Object.keys(WEIGHT_BANDS) as WeightBand[]).map((id) => ({ id, label: WEIGHT_BANDS[id].label.split(" (")[0] }))}
            value={t.weight.band}
            onChange={(band) => {
              const b = WEIGHT_BANDS[band]
              s.setProductTarget({ weight: { targetKg: b.targetKg, maxKg: b.maxKg, band } })
            }}
          />
        </div>
        <div id="field-rangeTarget" className="min-w-0">
          <p className="mb-2 text-xs font-sans font-bold uppercase tracking-wider text-graphite">Range</p>
          <ChoiceGroup
            options={(Object.keys(RANGE_BANDS) as RangeBand[]).map((id) => ({ id, label: RANGE_BANDS[id].label.split(" (")[0] }))}
            value={t.performance.rangeBand}
            onChange={(band) => {
              const b = RANGE_BANDS[band]
              s.setProductTarget({ performance: { rangeTargetKm: b.targetKm, rangeBand: band } })
            }}
          />
        </div>
        <div id="field-torqueTarget" className="min-w-0">
          <p className="mb-2 text-xs font-sans font-bold uppercase tracking-wider text-graphite">Torque</p>
          <ChoiceGroup
            options={(Object.keys(TORQUE_BANDS) as TorqueBand[]).map((id) => ({ id, label: TORQUE_BANDS[id].label.split(" (")[0] }))}
            value={t.performance.torqueBand}
            onChange={(band) => {
              const b = TORQUE_BANDS[band]
              s.setProductTarget({ performance: { torqueTargetNm: b.targetNm, torqueBand: band } })
            }}
          />
        </div>
      </div>

      {/* Functions */}
      <div className="mb-8">
        <SectionLabel>Functions & Connectivity</SectionLabel>
        <div className="space-y-2">
          <FunctionRow icon={Bluetooth} label="Bluetooth" value={t.functions.bluetooth} onChange={(level) => s.setProductTarget({ functions: { bluetooth: level } })} />
          <FunctionRow icon={MapPin} label="GPS Tracking" value={t.functions.gps} onChange={(level) => s.setProductTarget({ functions: { gps: level } })} />
          <FunctionRow icon={ShieldCheck} label="Anti-Theft" value={t.functions.antiTheft} onChange={(level) => s.setProductTarget({ functions: { antiTheft: level } })} />
          <FunctionRow icon={Lightbulb} label="Lights" value={t.functions.lights} onChange={(level) => s.setProductTarget({ functions: { lights: level } })} />
        </div>
      </div>

      {/* Product ambition */}
      <div className="mb-8">
        <SectionLabel>Product Ambition</SectionLabel>
        <div className="grid grid-cols-1 gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,16rem),1fr))]">
          <div className="min-w-0">
            <p className="mb-2 text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground">Market Positioning</p>
            <ChoiceGroup
              options={[
                { id: "value" as const, label: "Value" },
                { id: "mainstream" as const, label: "Mainstream" },
                { id: "premium" as const, label: "Premium" },
              ]}
              value={t.ambition.positioning}
              onChange={(positioning) => s.setProductTarget({ ambition: { positioning } })}
            />
          </div>
          <div className="min-w-0">
            <p className="mb-2 text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground">Cost Priority</p>
            <ChoiceGroup
              options={[
                { id: "lowest_cost" as const, label: "Lowest Cost" },
                { id: "balanced" as const, label: "Balanced" },
                { id: "feature_first" as const, label: "Feature-First" },
              ]}
              value={t.ambition.costPriority}
              onChange={(costPriority) => s.setProductTarget({ ambition: { costPriority } })}
            />
          </div>
          <div className="min-w-0">
            <p className="mb-2 text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground">Differentiation</p>
            <select
              value={t.ambition.differentiation ?? ""}
              onChange={(e) => s.setProductTarget({ ambition: { differentiation: (e.target.value || null) as typeof t.ambition.differentiation } })}
              className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="">No preference</option>
              <option value="lightweight">Lightweight</option>
              <option value="long_range">Long Range</option>
              <option value="high_performance">High Performance</option>
              <option value="connected">Connected</option>
              <option value="design">Design</option>
              <option value="low_maintenance">Low Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Advanced numeric overrides */}
      <div className="border border-dashed border-border">
        <button
          type="button"
          onClick={() => {
            const next = !advancedOpen
            setAdvancedOpen(next)
            s.setProductTarget({ mode: next ? "advanced" : "quick" })
          }}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        >
          <span className="flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground">
            <Settings2 className="h-3.5 w-3.5" /> Advanced Requirements (Exact Values)
          </span>
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", advancedOpen && "rotate-180")} />
        </button>
        {advancedOpen && (
          <div className="grid grid-cols-1 gap-4 border-t border-dashed border-border p-4 sm:grid-cols-3">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Max weight (kg)
              <input
                type="number"
                value={t.weight.maxKg ?? ""}
                onChange={(e) => s.setProductTarget({ weight: { maxKg: e.target.value ? Number(e.target.value) : null, band: null } })}
                className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Torque target (Nm)
              <input
                type="number"
                value={t.performance.torqueTargetNm ?? ""}
                onChange={(e) =>
                  s.setProductTarget({ performance: { torqueTargetNm: e.target.value ? Number(e.target.value) : null, torqueBand: null } })
                }
                className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Range target (km)
              <input
                type="number"
                value={t.performance.rangeTargetKm ?? ""}
                onChange={(e) =>
                  s.setProductTarget({ performance: { rangeTargetKm: e.target.value ? Number(e.target.value) : null, rangeBand: null } })
                }
                className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  )
}

function InheritedField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-sans uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-sans font-bold tabular-nums text-graphite wrap-anywhere">{value}</p>
    </div>
  )
}

// Wheel & tyre data — moved here from the retired standalone Bike Category
// step. Depends on `bikeCategory` (set by the Rider Profile cards above),
// and its output (tyre circumference) feeds the Drivetrain step's speed /
// cadence estimates, so it stays above Functions & Connectivity.
function WheelAndTyreSection() {
  const s = useAnandaStore()
  const [lookupOpen, setLookupOpen] = useState(false)
  const [lookupWheel, setLookupWheel] = useState(s.wheelSize ?? "")
  const [lookupWidth, setLookupWidth] = useState(s.tyreWidth ?? "")
  const circumference = s.tyreCircumferenceMm
  const recommendation = useMemo(
    () =>
      s.bikeCategory === "Cargo bike" || s.bikeCategory === "MTB"
        ? "A 48V platform is typically preferred for higher load, hill, or trail demands."
        : null,
    [s.bikeCategory],
  )

  const { options: wheelSizeOptions } = useWheelSizeOptions()
  const { options: tyreWidthOptions } = useTyreWidthOptions(lookupWheel)
  const { match, isLoading: isMatchLoading } = useTyreSizeMatch(lookupWheel, lookupWidth)

  useEffect(() => {
    setLookupWheel(s.wheelSize ?? "")
  }, [s.wheelSize])

  const openLookup = () => {
    setLookupWheel(s.wheelSize ?? "")
    setLookupOpen((value) => !value)
  }

  const handleWheelChange = (value: string) => {
    setLookupWheel(value)
    setLookupWidth("")
  }

  const applyMatch = () => {
    if (!match) return
    s.setField("wheelSize", lookupWheel)
    s.setField("tyreWidth", lookupWidth)
    s.setField("tyreIsoSize", match.iso_size)
    s.setField("tyreCircumferenceMm", match.circumference_mm)
  }

  return (
    <div className="mb-8">
      {recommendation && (
        <div className="mb-4 border-l-2 border-primary bg-primary/5 px-4 py-3 text-xs leading-5 text-foreground">{recommendation}</div>
      )}
      <section id="field-wheelSize" className="border border-border bg-card p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-foreground">Wheel &amp; tyre data</p>
          <span className="text-xs text-muted-foreground">A few percent of difference is allowed</span>
        </div>
        <p className="mb-4 -mt-2 text-xs text-muted-foreground">Measured circumference overrides the default lookup value.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Wheel size
            <select
              value={s.wheelSize ?? ""}
              onChange={(e) => {
                s.setField("wheelSize", e.target.value || null)
                s.setField("tyreWidth", null)
                s.setField("tyreIsoSize", null)
              }}
              className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="">Choose wheel size</option>
              {wheelSizeOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Tyre circumference (mm)
            <input
              type="number"
              min="1000"
              max="3000"
              value={circumference ?? ""}
              onChange={(e) => s.setField("tyreCircumferenceMm", e.target.value ? Number(e.target.value) : null)}
              placeholder="Manual value"
              className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <button
            type="button"
            onClick={openLookup}
            className="inline-flex h-10 items-center justify-center gap-2 border border-primary px-4 text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/5"
          >
            <Search className="h-4 w-4" /> Tyre lookup
          </button>
        </div>
        {lookupOpen && (
          <div className="mt-4 border border-primary/30 bg-primary/5 p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <select
                value={lookupWheel}
                onChange={(e) => handleWheelChange(e.target.value)}
                className="border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="">Choose wheel size</option>
                {wheelSizeOptions.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <select
                value={lookupWidth}
                onChange={(e) => setLookupWidth(e.target.value)}
                disabled={!lookupWheel}
                className="border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-50"
              >
                <option value="">Choose width</option>
                {tyreWidthOptions.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <button
                type="button"
                disabled={!match}
                onClick={applyMatch}
                className="bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground disabled:opacity-50"
              >
                Apply {isMatchLoading ? "…" : match ? `${match.circumference_mm} mm` : "—"}
              </button>
            </div>
            {match && (
              <p className="mt-3 text-xs text-muted-foreground">
                ISO size <span className="font-bold text-foreground">{match.iso_size}</span> · Circumference{" "}
                <span className="font-bold text-foreground">{match.circumference_mm} mm</span>
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
