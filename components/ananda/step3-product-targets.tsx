"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { Bluetooth, CheckCircle2, HelpCircle, Lightbulb, Search, Wifi, Zap } from "lucide-react"
import { useAnandaStore } from "@/lib/ananda-store"
import { useTyreWidthOptions, useWheelSizeOptions, useTyreSizeMatch } from "@/lib/ananda-tyre-data"
import {
  RIDER_PROFILES,
  BATTERY_CAPACITY_BANDS,
  TERRAIN_BANDS,
  TORQUE_BANDS,
  DEFAULT_LIGHTS_CONFIG,
  applyRiderProfile,
  type BatteryCapacityBand,
  type TerrainBand,
  type TorqueBand,
  type BluetoothAppChoice,
  type LightsConfig,
  type YesNo,
} from "@/lib/ananda-product-targets"
import { StepHeader, SectionLabel, ChoiceGroup } from "./ui-primitives"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

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

const DRIVE_UNITS = [
  { id: "mid" as const, label: "Mid Motor", disabled: false },
  { id: "hub" as const, label: "Hub Motor", disabled: true },
]

const VOLTAGE_PLATFORMS = [36, 48] as const

const ANANDA_APP_INFO = (
  <div className="space-y-1.5">
    <p className="font-sans font-bold uppercase tracking-wider text-foreground">Key Features</p>
    <p>
      <span className="font-semibold text-foreground">Live Tracking &amp; History:</span> Record your riding time, distance, maximum
      speed, average speed, and view real-time maps.
    </p>
    <p>
      <span className="font-semibold text-foreground">Motor Diagnostics:</span> Run system health checks to spot communication errors,
      headlight issues, speed sensor faults, and motor or controller temperatures.
    </p>
    <p>
      <span className="font-semibold text-foreground">Boost Adjustment:</span> Customize your ride by changing assist levels and
      maximum output power.
    </p>
    <p>
      <span className="font-semibold text-foreground">Security:</span> Set a personalized passcode lock and use bike finder tools to
      locate your last known parking position.
    </p>
  </div>
)

const THIRD_PARTY_APP_INFO = (
  <p>Uses the Ananda communication protocol for data transferring and reading with your own third-party application.</p>
)

// Compact segmented button with a hover "?" tooltip describing the option —
// used for the two Bluetooth app choices (Ananda Ride App / 3rd-Party App).
function InfoOptionButton({
  label,
  selected,
  onSelect,
  info,
}: {
  label: string
  selected: boolean
  onSelect: () => void
  info: ReactNode
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 border px-2 py-1.5 transition-colors",
        selected ? "border-primary bg-primary text-white" : "border-border text-muted-foreground hover:border-primary/40",
      )}
    >
      <button type="button" onClick={onSelect} className="text-[10px] font-sans font-bold uppercase tracking-wider">
        {label}
      </button>
      <HoverCard openDelay={100}>
        <HoverCardTrigger asChild>
          <button
            type="button"
            aria-label={`About ${label}`}
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-current"
          >
            <HelpCircle className="h-3 w-3" />
          </button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 text-xs leading-relaxed text-foreground">{info}</HoverCardContent>
      </HoverCard>
    </div>
  )
}

// Bluetooth — choice of companion app instead of a Must/Target/Nice level.
// Choosing the 3rd-Party App requires an explicit confirmation on a warning
// dialog before the selection is committed.
function BluetoothFunctionRow() {
  const s = useAnandaStore()
  const t = s.productTargets
  const [pendingThirdParty, setPendingThirdParty] = useState(false)

  const choose = (app: BluetoothAppChoice) => {
    if (app === "third_party" && !t.functions.bluetoothThirdPartyAcknowledged) {
      setPendingThirdParty(true)
      return
    }
    s.setProductTarget({ functions: { bluetoothApp: app, bluetooth: "target" } })
  }

  const confirmThirdParty = () => {
    s.setProductTarget({ functions: { bluetoothApp: "third_party", bluetooth: "target", bluetoothThirdPartyAcknowledged: true } })
  }

  return (
    <div className="flex flex-col gap-3 border border-border p-3 sm:flex-row sm:items-start sm:justify-between">
      <span className="flex min-w-0 items-center gap-2 text-sm font-sans font-semibold text-graphite">
        <Bluetooth aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />
        <span>Bluetooth</span>
      </span>
      <div className="flex flex-wrap gap-2 sm:justify-end">
        <InfoOptionButton
          label="Ananda Ride App"
          selected={t.functions.bluetoothApp === "ananda_app"}
          onSelect={() => choose("ananda_app")}
          info={ANANDA_APP_INFO}
        />
        <InfoOptionButton
          label="3rd-Party App"
          selected={t.functions.bluetoothApp === "third_party"}
          onSelect={() => choose("third_party")}
          info={THIRD_PARTY_APP_INFO}
        />
      </div>

      <AlertDialog open={pendingThirdParty} onOpenChange={setPendingThirdParty}>
        <AlertDialogContent className="border-2 border-border font-sans">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-sans text-lg font-black uppercase tracking-tight text-graphite">
              3rd-Party App Connectivity
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body text-sm text-muted-foreground">
              Configuring 3rd-party app connectivity may cause extra cost, please consult our sales for more information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-sans text-xs font-bold uppercase tracking-wider">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmThirdParty}
              className="bg-primary font-sans text-xs font-bold uppercase tracking-wider text-white hover:bg-primary/90"
            >
              Confirm &amp; Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// IoT Module — merges the old GPS Tracking + Anti-Theft rows into a single
// Yes/No choice, with a description of what the module provides in the
// space where the second row used to be.
function IotModuleRow() {
  const s = useAnandaStore()
  const t = s.productTargets

  const setIot = (value: YesNo) =>
    s.setProductTarget({
      functions: {
        iotModule: value,
        gps: value === "yes" ? "target" : "not_required",
        antiTheft: value === "yes" ? "target" : "not_required",
      },
    })

  return (
    <div className="flex flex-col gap-3 border border-border p-3 sm:flex-row sm:items-start sm:justify-between">
      <span className="flex min-w-0 items-start gap-2 text-sm font-sans font-semibold text-graphite">
        <Wifi aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <span className="min-w-0">
          <span className="block">IoT Module</span>
          <span className="mt-1 block max-w-sm text-xs font-normal leading-relaxed text-muted-foreground">
            IoT module provides GPS and internet connectivity function, requires LAN service via SIM card.
          </span>
        </span>
      </span>
      <div className="choice-group sm:w-auto sm:justify-end">
        {(["yes", "no"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setIot(v)}
            className={cn(
              "border px-3 py-1.5 text-center text-[10px] font-sans font-bold uppercase tracking-wider transition-colors",
              t.functions.iotModule === v ? "border-primary bg-primary text-white" : "border-border text-muted-foreground hover:border-primary/40",
            )}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}

// Lights — Yes/No, revealing exact-value fields (light count, voltage,
// total power) once enabled. Defaults to 12V / 2 lights / 10W.
function LightsFunctionRow() {
  const s = useAnandaStore()
  const t = s.productTargets
  const cfg = t.functions.lightsConfig ?? DEFAULT_LIGHTS_CONFIG

  const setLights = (value: YesNo) => s.setProductTarget({ functions: { lights: value } })
  const setCfg = (patch: Partial<LightsConfig>) => s.setProductTarget({ functions: { lightsConfig: { ...cfg, ...patch } } })

  return (
    <div className="border border-border p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <span className="flex min-w-0 items-center gap-2 text-sm font-sans font-semibold text-graphite">
          <Lightbulb aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />
          <span>Lights</span>
        </span>
        <div className="choice-group sm:w-auto sm:justify-end">
          {(["yes", "no"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setLights(v)}
              className={cn(
                "border px-3 py-1.5 text-center text-[10px] font-sans font-bold uppercase tracking-wider transition-colors",
                t.functions.lights === v ? "border-primary bg-primary text-white" : "border-border text-muted-foreground hover:border-primary/40",
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      {t.functions.lights === "yes" && (
        <div className="mt-3 grid grid-cols-1 gap-3 border-t border-dashed border-border pt-3 sm:grid-cols-3">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Number of lights
            <input
              type="number"
              min="1"
              value={cfg.count}
              onChange={(e) => setCfg({ count: Number(e.target.value) || 1 })}
              className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Light voltage (V)
            <input
              type="number"
              min="1"
              value={cfg.voltageV}
              onChange={(e) => setCfg({ voltageV: Number(e.target.value) || 12 })}
              className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Total power consumption (W)
            <input
              type="number"
              min="1"
              value={cfg.powerW}
              onChange={(e) => setCfg({ powerW: Number(e.target.value) || 10 })}
              className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
        </div>
      )}
    </div>
  )
}

// Drive Unit Selection — sets the real `driveType` / `voltagePlatform`
// fields directly (the same fields Step 4's recommendation engine and
// Package Configuration already key off of), placed right after the Rider
// Profile cards and before Wheel & Tyre Data.
function DriveUnitSection() {
  const s = useAnandaStore()

  return (
    <div id="field-driveUnit" className="mb-8">
      <SectionLabel>Drive Unit Selection</SectionLabel>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-sans font-bold uppercase tracking-wider text-graphite">Motor Type</p>
          <div className="flex flex-wrap gap-3">
            {DRIVE_UNITS.map((d) => {
              const selected = s.driveType === d.id
              return (
                <button
                  key={d.id}
                  type="button"
                  disabled={d.disabled}
                  onClick={() => s.setDriveType(d.id)}
                  className={cn(
                    "flex min-w-0 flex-1 basis-40 items-center justify-between gap-2 border-2 px-3 py-2.5 text-left text-sm font-sans font-semibold transition-colors",
                    d.disabled
                      ? "cursor-not-allowed border-border text-muted-foreground opacity-50"
                      : selected
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-graphite hover:border-primary/40",
                  )}
                >
                  {d.label}
                  {selected && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                  {d.disabled && <span className="text-[10px] uppercase tracking-wider">Soon</span>}
                </button>
              )
            })}
          </div>
        </div>
        <div className="min-w-0">
          <p className="mb-2 text-xs font-sans font-bold uppercase tracking-wider text-graphite">Voltage Platform</p>
          <div className="flex flex-wrap gap-3">
            {VOLTAGE_PLATFORMS.map((v) => {
              const selected = s.voltagePlatform === v
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => s.setVoltage(v)}
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
      </div>
    </div>
  )
}

export function Step3ProductTargets() {
  const s = useAnandaStore()
  const t = s.productTargets

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

      {/* Drive unit selection — mid vs hub motor, and voltage platform.
          Placed after the Rider Profile cards and before Wheel & Tyre
          Data. */}
      <DriveUnitSection />

      {/* Wheel & tyre data — depends on the bike category set by the rider
          profile above, and feeds the drivetrain estimates further down the
          flow, so it belongs here rather than in Functions & Connectivity. */}
      <WheelAndTyreSection />

      {/* Battery capacity / Riding terrain / Torque bands */}
      <div className="mb-8 grid grid-cols-1 gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(100%,16rem),1fr))]">
        <div id="field-weightTarget" className="min-w-0">
          <p className="mb-2 text-xs font-sans font-bold uppercase tracking-wider text-graphite">Battery Capacity</p>
          <ChoiceGroup
            options={(Object.keys(BATTERY_CAPACITY_BANDS) as BatteryCapacityBand[]).map((id) => ({
              id,
              label: BATTERY_CAPACITY_BANDS[id].label,
            }))}
            value={t.battery.band}
            onChange={(band) => {
              const b = BATTERY_CAPACITY_BANDS[band]
              s.setProductTarget({ battery: { capacityWh: b.capacityWh, band } })
            }}
          />
        </div>
        <div id="field-rangeTarget" className="min-w-0">
          <p className="mb-2 text-xs font-sans font-bold uppercase tracking-wider text-graphite">Riding Terrain</p>
          <ChoiceGroup
            options={(Object.keys(TERRAIN_BANDS) as TerrainBand[]).map((id) => ({ id, label: TERRAIN_BANDS[id].label }))}
            value={t.performance.rangeBand}
            onChange={(band) => {
              const b = TERRAIN_BANDS[band]
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
          <BluetoothFunctionRow />
          <IotModuleRow />
          <LightsFunctionRow />
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
              <option value="low_cost">Low Cost</option>
            </select>
          </div>
        </div>
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
