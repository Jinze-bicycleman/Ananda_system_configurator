"use client"

import { useState } from "react"
import { useAnandaStore } from "@/lib/ananda-store"
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
import { StepHeader, SectionLabel } from "./ui-primitives"
import { cn } from "@/lib/utils"
import { CheckCircle2, ChevronDown, Settings2 } from "lucide-react"

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[]
  value: T | null
  onChange: (id: T) => void
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            "border-2 px-2 py-2 text-xs font-sans font-bold uppercase tracking-wide transition-colors",
            value === opt.id ? "border-primary bg-primary/5 text-primary" : "border-border text-graphite hover:border-primary/40",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

const FUNCTION_LEVELS: { id: FunctionLevel; label: string }[] = [
  { id: "must", label: "Must Have" },
  { id: "target", label: "Target" },
  { id: "nice", label: "Nice to Have" },
  { id: "not_required", label: "Not Required" },
]

function FunctionRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: FunctionLevel
  onChange: (level: FunctionLevel) => void
}) {
  return (
    <div className="flex flex-col gap-2 border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-sans font-semibold text-graphite">{label}</span>
      <div className="grid grid-cols-2 gap-1.5 sm:flex sm:gap-1.5">
        {FUNCTION_LEVELS.map((lvl) => (
          <button
            key={lvl.id}
            type="button"
            onClick={() => onChange(lvl.id)}
            className={cn(
              "border px-2 py-1 text-[10px] font-sans font-bold uppercase tracking-wider transition-colors",
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
        step={3}
        title="Product Targets"
        subtitle="Define what this e-bike system needs to achieve before we recommend a configuration. These targets drive the Recommended Solutions in the next step."
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

      {/* Rider profile presets */}
      <div id="field-productTargets" className="mb-8">
        <SectionLabel>Rider Profile (Quick Assessment)</SectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {RIDER_PROFILES.map((preset) => {
            const selected = t.presetId === preset.id
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => s.setProductTarget(applyRiderProfile(preset))}
                className={cn(
                  "relative border-2 p-4 text-left transition-all",
                  selected ? "border-primary bg-primary/5 shadow-md shadow-primary/10" : "border-border hover:border-primary/40",
                )}
              >
                {selected && (
                  <div className="absolute right-3 top-3 rounded-full bg-primary p-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
                <p className={cn("text-base font-sans font-black uppercase tracking-tight", selected ? "text-primary" : "text-graphite")}>
                  {preset.label}
                </p>
                <p className="mt-1 text-xs font-body leading-relaxed text-muted-foreground">{preset.description}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Weight / Range / Torque bands */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div id="field-weightTarget">
          <p className="mb-2 text-xs font-sans font-bold uppercase tracking-wider text-graphite">System Weight</p>
          <SegmentedControl
            options={(Object.keys(WEIGHT_BANDS) as WeightBand[]).map((id) => ({ id, label: WEIGHT_BANDS[id].label.split(" (")[0] }))}
            value={t.weight.band}
            onChange={(band) => {
              const b = WEIGHT_BANDS[band]
              s.setProductTarget({ weight: { targetKg: b.targetKg, maxKg: b.maxKg, band } })
            }}
          />
        </div>
        <div id="field-rangeTarget">
          <p className="mb-2 text-xs font-sans font-bold uppercase tracking-wider text-graphite">Range</p>
          <SegmentedControl
            options={(Object.keys(RANGE_BANDS) as RangeBand[]).map((id) => ({ id, label: RANGE_BANDS[id].label.split(" (")[0] }))}
            value={t.performance.rangeBand}
            onChange={(band) => {
              const b = RANGE_BANDS[band]
              s.setProductTarget({ performance: { rangeTargetKm: b.targetKm, rangeBand: band } })
            }}
          />
        </div>
        <div id="field-torqueTarget">
          <p className="mb-2 text-xs font-sans font-bold uppercase tracking-wider text-graphite">Torque</p>
          <SegmentedControl
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
          <FunctionRow label="Bluetooth" value={t.functions.bluetooth} onChange={(level) => s.setProductTarget({ functions: { bluetooth: level } })} />
          <FunctionRow label="GPS Tracking" value={t.functions.gps} onChange={(level) => s.setProductTarget({ functions: { gps: level } })} />
          <FunctionRow label="Anti-Theft" value={t.functions.antiTheft} onChange={(level) => s.setProductTarget({ functions: { antiTheft: level } })} />
          <FunctionRow label="Lights" value={t.functions.lights} onChange={(level) => s.setProductTarget({ functions: { lights: level } })} />
        </div>
      </div>

      {/* Product ambition */}
      <div className="mb-8">
        <SectionLabel>Product Ambition</SectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="mb-2 text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground">Market Positioning</p>
            <SegmentedControl
              options={[
                { id: "value" as const, label: "Value" },
                { id: "mainstream" as const, label: "Mainstream" },
                { id: "premium" as const, label: "Premium" },
              ]}
              value={t.ambition.positioning}
              onChange={(positioning) => s.setProductTarget({ ambition: { positioning } })}
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground">Cost Priority</p>
            <SegmentedControl
              options={[
                { id: "lowest_cost" as const, label: "Lowest Cost" },
                { id: "balanced" as const, label: "Balanced" },
                { id: "feature_first" as const, label: "Feature-First" },
              ]}
              value={t.ambition.costPriority}
              onChange={(costPriority) => s.setProductTarget({ ambition: { costPriority } })}
            />
          </div>
          <div>
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
    <div>
      <p className="text-[10px] font-sans uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-sans font-bold tabular-nums text-graphite">{value}</p>
    </div>
  )
}
