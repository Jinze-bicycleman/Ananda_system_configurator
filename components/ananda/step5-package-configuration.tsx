"use client"

import { useState } from "react"
import { useAnandaStore } from "@/lib/ananda-store"
import {
  useControllers,
  useDisplays,
  useBatteries,
  usePackageMotors,
  chargersForVoltage,
  resolveImageUrl,
  CHARGING_PORTS,
  type ControllerRow,
  type HmiDisplayRow,
  type BatteryRow,
  type MotorRow,
  type ChargerOption,
  type ChargingPortOption,
} from "@/lib/ananda-packages"
import { StepHeader, SectionLabel, TechSpecRow } from "./ui-primitives"
import { StatusBadge } from "./status-badge"
import { cn } from "@/lib/utils"
import { CheckCircle2, ChevronDown, Image as ImageIcon, Ban, RotateCcw, Loader2 } from "lucide-react"

type Spec = { label: string; value: string | number | null }

function OptionCard({
  title,
  imageUrl,
  specs,
  selected,
  isBestMatch,
  onSelect,
}: {
  title: string
  imageUrl?: string | null
  specs: Spec[]
  selected: boolean
  isBestMatch?: boolean
  onSelect: () => void
}) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "product-card relative cursor-pointer border-2 transition-all",
        selected ? "border-primary shadow-md shadow-primary/10" : "border-border hover:border-primary/40",
      )}
    >
      <div className={cn("h-1 w-full shrink-0", selected ? "bg-primary" : "bg-border")} />
      {isBestMatch && (
        <div className="absolute left-2 top-2 z-10">
          <StatusBadge variant="recommended" label="Best Match" />
        </div>
      )}
      {selected && (
        <div className="absolute top-2 right-2 z-10 bg-primary rounded-full p-0.5">
          <CheckCircle2 className="w-3 h-3 text-white" />
        </div>
      )}
      <div className={cn("relative flex shrink-0 items-center justify-center h-24 overflow-hidden", selected ? "bg-primary/5" : "bg-surface")}>
        {imageUrl ? (
          <img src={imageUrl || "/placeholder.svg"} alt={title} className="relative z-10 max-h-16 object-contain" crossOrigin="anonymous" />
        ) : (
          <ImageIcon className={cn("w-8 h-8", selected ? "text-primary/40" : "text-border")} />
        )}
      </div>
      <div className="min-w-0 p-3">
        <p className={cn("text-sm font-sans font-bold uppercase mb-1 wrap-anywhere", selected ? "text-primary" : "text-graphite")}>{title}</p>
        {specs.length > 0 && (
          <div className="min-w-0 border border-border rounded-sm">
            {specs.map((sp) => sp.value != null && (
              <TechSpecRow key={sp.label} label={sp.label} value={sp.value} stacked={typeof sp.value === "string" && sp.value.length > 18} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyOptionsNotice() {
  return (
    <div className="border-2 border-dashed border-border p-6 text-center">
      <p className="text-sm font-sans font-semibold text-muted-foreground uppercase tracking-wider mb-1">No Products Available</p>
      <p className="text-xs font-body text-muted-foreground">
        There are no products in the database for this component yet. Mark it as not needed, or check back once products are added.
      </p>
    </div>
  )
}

interface ConfigRowProps {
  itemKey: string
  label: string
  required: boolean
  emphasize?: boolean
  selectedSummary: React.ReactNode | null
  skippable: boolean
  skipped: boolean
  onToggleSkip: () => void
  children: React.ReactNode
  hasOptions: boolean
  optionsLoading?: boolean
  expanded: boolean
  onToggleExpanded: () => void
}

// The accordion's expand/collapse state is fully independent of product
// selection — selecting or changing a product never closes the section.
// Only the chevron control toggles `expanded`.
function ConfigRow({
  itemKey,
  label,
  required,
  emphasize,
  selectedSummary,
  skippable,
  skipped,
  onToggleSkip,
  children,
  hasOptions,
  optionsLoading,
  expanded,
  onToggleExpanded,
}: ConfigRowProps) {
  return (
    <section
      id={`config-${itemKey}`}
      className={cn("mb-6 border", emphasize ? "border-2 border-primary/40 bg-primary/[0.02] p-4" : "border-transparent")}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SectionLabel>{label}</SectionLabel>
          {emphasize && <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-primary">Core Component</span>}
        </div>
        <div className="flex items-center gap-2">
          {required && !skipped && <StatusBadge variant="required" />}
          {skipped && <StatusBadge variant="not-required" label="Marked Not Needed" />}
          <button
            type="button"
            onClick={onToggleExpanded}
            aria-expanded={expanded}
            aria-controls={`config-${itemKey}-panel`}
            className="flex items-center justify-center border border-border p-1 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
          </button>
        </div>
      </div>

      {skipped ? (
        <div className="flex items-center justify-between gap-3 border border-border bg-surface px-4 py-3">
          <p className="text-sm font-body text-muted-foreground">This component has been marked as not needed for this build.</p>
          <button
            onClick={onToggleSkip}
            className="flex shrink-0 items-center gap-1 border border-primary bg-primary/5 px-2 py-1 text-[11px] font-sans font-bold uppercase tracking-wider text-primary transition-colors hover:bg-primary/10"
          >
            <RotateCcw className="w-3 h-3" /> Restore
          </button>
        </div>
      ) : expanded ? (
        <div id={`config-${itemKey}-panel`}>
          {!selectedSummary && (
            <div className="mb-3 text-xs font-sans font-semibold uppercase tracking-wider text-warning">No selection yet — choose an option below.</div>
          )}
          {optionsLoading ? (
            <div className="flex items-center gap-2 py-8 justify-center text-sm font-sans text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading options…
            </div>
          ) : hasOptions ? (
            children
          ) : (
            <EmptyOptionsNotice />
          )}
          {skippable && (
            <button
              onClick={onToggleSkip}
              className="mt-4 flex w-full items-center gap-3 border-2 border-dashed border-border px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-surface"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-surface text-muted-foreground">
                <Ban className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-sans font-bold uppercase text-graphite">Not Needed</span>
                <span className="block text-xs font-body text-muted-foreground">Choose this option if this component isn&apos;t required for the build.</span>
              </span>
            </button>
          )}
        </div>
      ) : (
        <div id={`config-${itemKey}-panel`} className="border-2 border-primary/30 bg-primary/5 px-4 py-3">
          {selectedSummary ?? <p className="text-sm font-body text-muted-foreground">No selection yet.</p>}
        </div>
      )}
    </section>
  )
}

// Fixed set of accordion sections. All expanded by default on first visit;
// manual expand/collapse state persists for the current session (component
// lifetime) independent of which product is selected in each section.
const SECTION_KEYS = ["motorId", "batteryId", "displayId", "speedSensorId", "chargerId", "chargingPortId", "controllerId", "torqueSensorId"] as const

export function Step5PackageConfiguration() {
  const s = useAnandaStore()
  const isHub = s.driveType === "hub"
  const baseline = s.packageBaseline ?? {}

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => Object.fromEntries(SECTION_KEYS.map((k) => [k, true])))
  const toggleExpanded = (key: string) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))

  const { motors: compatibleMotors, isLoading: motorsLoading } = usePackageMotors(s.driveType, s.voltagePlatform)
  const { controllers, isLoading: controllersLoading } = useControllers()
  const { displays, isLoading: displaysLoading } = useDisplays()
  const { batteries, isLoading: batteriesLoading } = useBatteries()

  const compatibleControllers = controllers.filter((c) => c.compatible_motor_type === "hub" && c.voltage_v === s.voltagePlatform)
  const compatibleBatteries = batteries.filter((b) => b.voltage_v === s.voltagePlatform)
  const compatibleChargers = chargersForVoltage(s.voltagePlatform)

  const selectedMotor = compatibleMotors.find((m) => m.id === s.motorId) ?? null
  const selectedController = compatibleControllers.find((c) => c.id === s.controllerId) ?? null
  const selectedDisplay = displays.find((d) => d.id === s.displayId) ?? null
  const selectedBattery = compatibleBatteries.find((b) => b.id === s.batteryId) ?? null
  const selectedCharger = compatibleChargers.find((c) => c.id === s.chargerId) ?? null
  const selectedPort = CHARGING_PORTS.find((p) => p.id === s.chargingPortId) ?? null

  // A Best Match tag only ever appears on a product that's actually present
  // in the current compatible list — never invented, never shown on a stale
  // recommendation that no longer applies (e.g. after a voltage change).
  const bestMatchId = (key: string, options: { id: string }[]) => {
    const id = baseline[key]
    return id && options.some((o) => o.id === id) ? id : null
  }
  const bestMotorId = bestMatchId("motorId", compatibleMotors)
  const bestBatteryId = bestMatchId("batteryId", compatibleBatteries)
  const bestDisplayId = bestMatchId("displayId", displays)
  const bestChargerId = bestMatchId("chargerId", compatibleChargers)
  const bestPortId = bestMatchId("chargingPortId", CHARGING_PORTS)
  const bestControllerId = bestMatchId("controllerId", compatibleControllers)

  const toggleSkip = (key: string, idField: keyof typeof s) => {
    const currentlySkipped = s.skippedItems.includes(key)
    s.setItemSkipped(key, !currentlySkipped)
    if (!currentlySkipped) {
      s.setField(idField as never, null as never)
    }
  }

  return (
    <div>
      <StepHeader
        step={5}
        title="Package Configuration"
        subtitle="Fine-tune the components bundled with your selected package. Each item defaults to the Best Match recommendation, can be customised from compatible alternatives, or marked as not needed where allowed."
      />

      <ConfigRow
        itemKey="motorId"
        label="Motor"
        required
        emphasize
        skippable={false}
        skipped={false}
        onToggleSkip={() => {}}
        hasOptions={compatibleMotors.length > 0}
        optionsLoading={motorsLoading}
        expanded={expanded.motorId}
        onToggleExpanded={() => toggleExpanded("motorId")}
        selectedSummary={
          selectedMotor && (
            <div>
              <p className="text-sm font-sans font-bold uppercase text-primary">{selectedMotor.model}</p>
              <p className="text-xs font-body text-muted-foreground">
                {selectedMotor.voltage_v}V · {selectedMotor.torque_nm ?? "—"}Nm · {selectedMotor.rated_power_w ?? "—"}W rated
              </p>
            </div>
          )
        }
      >
        <div className="product-option-grid">
          {compatibleMotors.map((m: MotorRow) => (
            <OptionCard
              key={m.id}
              title={m.model}
              imageUrl={resolveImageUrl(m.image_url, m.image_path)}
              specs={[
                { label: "Torque", value: m.torque_nm ? `${m.torque_nm}Nm` : null },
                { label: "Rated Power", value: m.rated_power_w ? `${m.rated_power_w}W` : null },
                { label: "Weight", value: m.weight_kg ? `${m.weight_kg}kg` : null },
              ]}
              selected={s.motorId === m.id}
              isBestMatch={bestMotorId === m.id}
              onSelect={() => s.setField("motorId", m.id)}
            />
          ))}
        </div>
      </ConfigRow>

      <ConfigRow
        itemKey="batteryId"
        label="Battery"
        required
        emphasize
        skippable={false}
        skipped={false}
        onToggleSkip={() => {}}
        hasOptions={compatibleBatteries.length > 0}
        optionsLoading={batteriesLoading}
        expanded={expanded.batteryId}
        onToggleExpanded={() => toggleExpanded("batteryId")}
        selectedSummary={
          selectedBattery && (
            <div>
              <p className="text-sm font-sans font-bold uppercase text-primary">{selectedBattery.model}</p>
              <p className="text-xs font-body text-muted-foreground">{selectedBattery.capacity_wh ?? "—"}Wh</p>
            </div>
          )
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {compatibleBatteries.map((b: BatteryRow) => (
            <OptionCard
              key={b.id}
              title={b.model}
              imageUrl={resolveImageUrl(b.image_url, b.image_path)}
              specs={[
                { label: "Capacity", value: b.capacity_wh ? `${b.capacity_wh}Wh` : null },
                { label: "Weight", value: b.weight_kg ? `${b.weight_kg}kg` : null },
                { label: "Voltage", value: `${b.voltage_v}V` },
              ]}
              selected={s.batteryId === b.id}
              isBestMatch={bestBatteryId === b.id}
              onSelect={() => s.setField("batteryId", b.id)}
            />
          ))}
        </div>
      </ConfigRow>

      <ConfigRow
        itemKey="displayId"
        label="Display (HMI)"
        required
        skippable={false}
        skipped={false}
        onToggleSkip={() => {}}
        hasOptions={displays.length > 0}
        optionsLoading={displaysLoading}
        expanded={expanded.displayId}
        onToggleExpanded={() => toggleExpanded("displayId")}
        selectedSummary={
          selectedDisplay && (
            <div>
              <p className="text-sm font-sans font-bold uppercase text-primary">{selectedDisplay.model}</p>
              <p className="text-xs font-body text-muted-foreground">{selectedDisplay.size ?? "—"}</p>
            </div>
          )
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displays.map((d: HmiDisplayRow) => (
            <OptionCard
              key={d.id}
              title={d.model}
              imageUrl={resolveImageUrl(d.image_url, d.image_path)}
              specs={[
                { label: "Size", value: d.size },
                { label: "Bluetooth", value: d.bluetooth ? "Yes" : "No" },
                { label: "GPS", value: d.has_gps ? "Yes" : "No" },
              ]}
              selected={s.displayId === d.id}
              isBestMatch={bestDisplayId === d.id}
              onSelect={() => s.setField("displayId", d.id)}
            />
          ))}
        </div>
      </ConfigRow>

      <ConfigRow
        itemKey="speedSensorId"
        label="Speed Sensor"
        required
        skippable
        skipped={s.skippedItems.includes("speedSensorId")}
        onToggleSkip={() => toggleSkip("speedSensorId", "speedSensorId")}
        hasOptions={false}
        expanded={expanded.speedSensorId}
        onToggleExpanded={() => toggleExpanded("speedSensorId")}
        selectedSummary={s.speedSensorId ? <p className="text-sm font-sans font-bold text-primary">{s.speedSensorId}</p> : null}
      >
        <EmptyOptionsNotice />
      </ConfigRow>

      <ConfigRow
        itemKey="chargerId"
        label="Charger"
        required
        skippable={false}
        skipped={false}
        onToggleSkip={() => {}}
        hasOptions={compatibleChargers.length > 0}
        expanded={expanded.chargerId}
        onToggleExpanded={() => toggleExpanded("chargerId")}
        selectedSummary={
          selectedCharger && (
            <div>
              <p className="text-sm font-sans font-bold uppercase text-primary">{selectedCharger.model}</p>
              <p className="text-xs font-body text-muted-foreground">
                {selectedCharger.voltage_v}V · {selectedCharger.outputCurrentA}A
              </p>
            </div>
          )
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {compatibleChargers.map((c: ChargerOption) => (
            <OptionCard
              key={c.id}
              title={c.model}
              specs={[
                { label: "Voltage", value: `${c.voltage_v}V` },
                { label: "Current", value: `${c.outputCurrentA}A` },
              ]}
              selected={s.chargerId === c.id}
              isBestMatch={bestChargerId === c.id}
              onSelect={() => s.setField("chargerId", c.id)}
            />
          ))}
        </div>
      </ConfigRow>

      <ConfigRow
        itemKey="chargingPortId"
        label="Charging Port"
        required
        skippable={false}
        skipped={false}
        onToggleSkip={() => {}}
        hasOptions={CHARGING_PORTS.length > 0}
        expanded={expanded.chargingPortId}
        onToggleExpanded={() => toggleExpanded("chargingPortId")}
        selectedSummary={selectedPort && <p className="text-sm font-sans font-bold uppercase text-primary">{selectedPort.model}</p>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CHARGING_PORTS.map((p: ChargingPortOption) => (
            <OptionCard
              key={p.id}
              title={p.model}
              specs={[{ label: "Type", value: p.description }]}
              selected={s.chargingPortId === p.id}
              isBestMatch={bestPortId === p.id}
              onSelect={() => s.setField("chargingPortId", p.id)}
            />
          ))}
        </div>
      </ConfigRow>

      {isHub && (
        <ConfigRow
          itemKey="controllerId"
          label="Controller"
          required
          skippable={false}
          skipped={false}
          onToggleSkip={() => {}}
          hasOptions={compatibleControllers.length > 0}
          optionsLoading={controllersLoading}
          expanded={expanded.controllerId}
          onToggleExpanded={() => toggleExpanded("controllerId")}
          selectedSummary={
            selectedController && (
              <div>
                <p className="text-sm font-sans font-bold uppercase text-primary">{selectedController.model}</p>
                <p className="text-xs font-body text-muted-foreground">
                  {selectedController.voltage_v}V · {selectedController.rated_power_w ?? "—"}W rated
                </p>
              </div>
            )
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {compatibleControllers.map((c: ControllerRow) => (
              <OptionCard
                key={c.id}
                title={c.model}
                imageUrl={resolveImageUrl(c.image_url, c.image_path)}
                specs={[
                  { label: "Rated Power", value: c.rated_power_w ? `${c.rated_power_w}W` : null },
                  { label: "Peak Current", value: c.peak_current_a ? `${c.peak_current_a}A` : null },
                  { label: "Voltage", value: `${c.voltage_v}V` },
                ]}
                selected={s.controllerId === c.id}
                isBestMatch={bestControllerId === c.id}
                onSelect={() => s.setField("controllerId", c.id)}
              />
            ))}
          </div>
        </ConfigRow>
      )}

      {isHub && (
        <ConfigRow
          itemKey="torqueSensorId"
          label="Torque Sensor"
          required
          skippable
          skipped={s.skippedItems.includes("torqueSensorId")}
          onToggleSkip={() => toggleSkip("torqueSensorId", "torqueSensorId")}
          hasOptions={false}
          expanded={expanded.torqueSensorId}
          onToggleExpanded={() => toggleExpanded("torqueSensorId")}
          selectedSummary={s.torqueSensorId ? <p className="text-sm font-sans font-bold text-primary">{s.torqueSensorId}</p> : null}
        >
          <EmptyOptionsNotice />
        </ConfigRow>
      )}
    </div>
  )
}
