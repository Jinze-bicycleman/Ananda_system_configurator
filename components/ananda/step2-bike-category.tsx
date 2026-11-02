"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, Search, Zap } from "lucide-react"
import { useAnandaStore } from "@/lib/ananda-store"
import { useTyreWidthOptions, useWheelSizeOptions, useTyreSizeMatch } from "@/lib/ananda-tyre-data"
import { StepHeader, SectionLabel } from "./ui-primitives"
import { cn } from "@/lib/utils"

const BIKE_CATEGORIES = [
  {
    id: "City",
    label: "Commuter",
    description: "Daily city riding, light loads, cost-conscious.",
    image: "/images/bike-category-city.jpg",
  },
  {
    id: "Cargo bike",
    label: "Family / Cargo",
    description: "Carrying children or heavy loads, needs climbing torque and range.",
    image: "/images/bike-category-cargo-2wheeler.png",
  },
  {
    id: "Trekking",
    label: "Trekking / Adventure",
    description: "Longer rides, mixed terrain, wants range and reliability.",
    image: "/images/bike-category-trekking.jpg",
  },
  {
    id: "MTB",
    label: "Performance",
    description: "High-power riding, hills and trails, torque-first.",
    image: "/images/bike-category-mtb.jpg",
  },
]

const DRIVE_UNITS = [
  { id: "mid" as const, label: "Mid Motor", disabled: false },
  { id: "hub" as const, label: "Hub Motor", disabled: true },
]

const VOLTAGE_PLATFORMS = [36, 48] as const

// Drive Unit Selection — sets the real `driveType` / `voltagePlatform`
// fields directly (the same fields Package Configuration keys off of),
// placed before Wheel & Tyre Data.
function DriveUnitSection() {
  const s = useAnandaStore()

  return (
    <div id="field-driveUnit" className="mb-8">
      <SectionLabel>Drive Unit Selection</SectionLabel>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="min-w-0">
          <p className="mb-2 text-sm font-medium text-graphite">Motor type</p>
          <div className="flex flex-wrap gap-3">
            {DRIVE_UNITS.map((d) => {
              const selected = s.driveType === d.id
              return (
                <button
                  key={d.id}
                  type="button"
                  disabled={d.disabled}
                  aria-pressed={selected}
                  onClick={() => s.setDriveType(d.id)}
                  className={cn(
                    "flex min-w-0 flex-1 basis-40 items-center justify-between gap-2 rounded-md border px-3 py-2.5 text-left text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                    d.disabled
                      ? "cursor-not-allowed border-border text-muted-foreground opacity-50"
                      : selected
                        ? "border-primary bg-primary/5 font-semibold text-primary ring-1 ring-primary"
                        : "border-border bg-card text-graphite hover:border-primary/40 hover:bg-secondary/60",
                  )}
                >
                  {d.label}
                  {selected && <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />}
                  {d.disabled && <span className="text-xs text-muted-foreground">Soon</span>}
                </button>
              )
            })}
          </div>
        </div>
        <div className="min-w-0">
          <p className="mb-2 text-sm font-medium text-graphite">Voltage platform</p>
          <div className="flex flex-wrap gap-3">
            {VOLTAGE_PLATFORMS.map((v) => {
              const selected = s.voltagePlatform === v
              return (
                <button
                  key={v}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => s.setVoltage(v)}
                  className={cn(
                    "flex min-w-0 flex-1 basis-24 items-center justify-center gap-1.5 rounded-md border px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                    selected
                      ? "border-primary bg-primary/5 font-semibold text-primary ring-1 ring-primary"
                      : "border-border bg-card text-graphite hover:border-primary/40 hover:bg-secondary/60",
                  )}
                >
                  <Zap className="h-3.5 w-3.5" aria-hidden="true" />
                  {v}V
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Step2BikeCategory() {
  const s = useAnandaStore()

  return (
    <div>
      <StepHeader
        step={2}
        title="Bike Category"
        subtitle="Choose the bicycle application that best matches the rider, then set the drive unit and wheel data for this e-bike system."
      />

      {/* Inherited constraints — read-only context from Step 1 */}
      <div className="mb-8 rounded-lg border border-border bg-secondary/50 p-4">
        <SectionLabel>Inherited Constraints</SectionLabel>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <InheritedField label="Market" value={s.sellRegion ?? "—"} />
          <InheritedField label="Regulation" value={s.regulation ?? "—"} />
          <InheritedField label="Speed Limit" value={s.speedLimitKmh ? `${s.speedLimitKmh} km/h` : "—"} />
          <InheritedField label="Rated Power" value={s.ratedPowerW ? `${s.ratedPowerW} W` : "—"} />
        </div>
      </div>

      <div id="field-bikeCategory" className="mb-8">
        <SectionLabel>Bike Category</SectionLabel>
        <div className="grid gap-4 md:grid-cols-2">
          {BIKE_CATEGORIES.map((category) => {
            const selected = s.bikeCategory === category.id
            return (
              <button
                key={category.id}
                type="button"
                aria-pressed={selected}
                onClick={() => s.setBikeCategory(category.id)}
                className={cn(
                  "group relative overflow-hidden rounded-lg border text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card hover:border-primary/40",
                )}
              >
                <div className="relative h-56 overflow-hidden bg-muted sm:h-64">
                  <img
                    src={category.image}
                    alt={`${category.label} bicycle application`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-graphite/90 to-transparent p-4 pt-16">
                    <span className="text-lg font-semibold text-white">{category.label}</span>
                  </div>
                  {selected && (
                    <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <CheckCircle2 className="h-5 w-5" />
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-sm leading-6 text-muted-foreground">{category.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Drive unit selection — mid vs hub motor, and voltage platform.
          Placed after the Rider Profile cards and before Wheel & Tyre
          Data. */}
      <DriveUnitSection />

      {/* Wheel & tyre data — depends on the bike category set by the rider
          profile above, and feeds the drivetrain estimates further down the
          flow, so it belongs here rather than in Functions & Connectivity. */}
      <WheelAndTyreSection />
    </div>
  )
}

function InheritedField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold tabular-nums text-graphite wrap-anywhere">{value}</p>
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
        <div className="mb-4 rounded-md bg-primary/5 px-4 py-3 text-sm leading-relaxed text-foreground">{recommendation}</div>
      )}
      <section id="field-wheelSize" className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="text-sm font-semibold text-foreground">Wheel &amp; tyre data</p>
          <span className="text-xs text-muted-foreground">A few percent of difference is allowed</span>
        </div>
        <p className="mb-4 -mt-2 text-xs text-muted-foreground">Measured circumference overrides the default lookup value.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-graphite">
            Wheel size
            <select
              value={s.wheelSize ?? ""}
              onChange={(e) => {
                s.setField("wheelSize", e.target.value || null)
                s.setField("tyreWidth", null)
                s.setField("tyreIsoSize", null)
              }}
              className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <option value="">Choose wheel size</option>
              {wheelSizeOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1 text-sm font-medium text-graphite">
            Tyre circumference (mm)
            <input
              type="number"
              min="1000"
              max="3000"
              value={circumference ?? ""}
              onChange={(e) => s.setField("tyreCircumferenceMm", e.target.value ? Number(e.target.value) : null)}
              placeholder="Manual value"
              className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            />
          </label>
          <button
            type="button"
            onClick={openLookup}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-primary px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Search className="h-4 w-4" aria-hidden="true" /> Tyre lookup
          </button>
        </div>
        {lookupOpen && (
          <div className="mt-4 rounded-md border border-primary/30 bg-primary/5 p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <select
                value={lookupWheel}
                onChange={(e) => handleWheelChange(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
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
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-50"
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
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                Apply {isMatchLoading ? "…" : match ? `${match.circumference_mm} mm` : "—"}
              </button>
            </div>
            {match && (
              <p className="mt-3 text-xs text-muted-foreground">
                ISO size <span className="font-semibold text-foreground">{match.iso_size}</span> · Circumference{" "}
                <span className="font-semibold text-foreground">{match.circumference_mm} mm</span>
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
