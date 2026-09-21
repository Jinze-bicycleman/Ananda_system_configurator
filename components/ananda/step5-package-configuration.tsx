"use client"

import { useState } from "react"
import { useAnandaStore } from "@/lib/ananda-store"
import {
  useControllers,
  useDisplays,
  useBatteries,
  usePackageMotors,
  useSpeedSensors,
  useBikeComponents,
  chargersForVoltage,
  resolveImageUrl,
  speedSensorTypeLabel,
  BIKE_COMPONENT_CATEGORIES,
  CHARGING_PORTS,
  type ControllerRow,
  type HmiDisplayRow,
  type BatteryRow,
  type MotorRow,
  type ChargerOption,
  type ChargingPortOption,
  type SpeedSensorRow,
  type BikeComponentRow,
} from "@/lib/ananda-packages"
import { StepHeader, SectionLabel, TechSpecRow } from "./ui-primitives"
import { StatusBadge } from "./status-badge"
import { cn } from "@/lib/utils"
import { CheckCircle2, ChevronDown, Image as ImageIcon, Ban, RotateCcw, Loader2, ShieldCheck, Radio } from "lucide-react"
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

type Spec = { label: string; value: string | number | null }

function OptionCard({
  title,
  imageUrl,
  specs,
  selected,
  isBestMatch,
  onSelect,
  fullSpecs,
}: {
  title: string
  imageUrl?: string | null
  specs: Spec[]
  selected: boolean
  isBestMatch?: boolean
  onSelect: () => void
  /** Extra specs (certification, exact dimensions, etc.) shown behind a "Full Specification" disclosure. */
  fullSpecs?: Spec[]
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
        {fullSpecs && fullSpecs.some((sp) => sp.value != null) && (
          <details className="mt-2 border border-border/70 rounded-sm" onClick={(e) => e.stopPropagation()}>
            <summary className="cursor-pointer select-none px-2 py-1.5 text-[10px] font-sans font-bold uppercase tracking-wider text-primary">
              Full Specification
            </summary>
            <div className="border-t border-border">
              {fullSpecs.map((sp) => sp.value != null && (
                <TechSpecRow key={sp.label} label={sp.label} value={sp.value} stacked={typeof sp.value === "string" && sp.value.length > 18} />
              ))}
            </div>
          </details>
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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <SectionLabel>{label}</SectionLabel>
          {emphasize && <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-primary">Core Component</span>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
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
        <div className="flex flex-wrap items-center justify-between gap-3 border border-border bg-surface px-4 py-3">
          <p className="min-w-0 text-sm font-body text-muted-foreground">This component has been marked as not needed for this build.</p>
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
  const { speedSensors, isLoading: speedSensorsLoading } = useSpeedSensors()

  const compatibleControllers = controllers.filter((c) => c.compatible_motor_type === "hub" && c.voltage_v === s.voltagePlatform)
  const compatibleBatteries = batteries.filter((b) => b.voltage_v === s.voltagePlatform)
  const compatibleChargers = chargersForVoltage(s.voltagePlatform)
  const { components: bikeComponents, isLoading: bikeComponentsLoading } = useBikeComponents()
  const [pendingThirdPartyController, setPendingThirdPartyController] = useState(false)

  // Only filter the HMI list when at least one display actually declares the
  // *other* protocol — with every current display supporting both CAN and
  // UART, the toggle stays a no-op until protocol-exclusive models exist.
  const protocolFilteredDisplays = displays.filter((d) => {
    const protocol = (d.communication_protocol ?? "").toLowerCase()
    if (!protocol) return true
    return protocol.includes(s.hmiProtocolPreference)
  })

  const selectedMotor = compatibleMotors.find((m) => m.id === s.motorId) ?? null
  const selectedController = compatibleControllers.find((c) => c.id === s.controllerId) ?? null
  const selectedDisplay = displays.find((d) => d.id === s.displayId) ?? null
  const selectedBattery = compatibleBatteries.find((b) => b.id === s.batteryId) ?? null
  const selectedCharger = compatibleChargers.find((c) => c.id === s.chargerId) ?? null
  const selectedPort = CHARGING_PORTS.find((p) => p.id === s.chargingPortId) ?? null
  const selectedSpeedSensor = speedSensors.find((sensor) => sensor.id === s.speedSensorId) ?? null

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
  const bestSpeedSensorId = bestMatchId("speedSensorId", speedSensors)

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
        step={4}
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
                { label: "Peak Power", value: m.peak_power_w ? `${m.peak_power_w}W` : null },
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
        <div className="product-option-grid">
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
              fullSpecs={[
                {
                  label: "Exact Dimensions",
                  value: b.length_mm && b.width_mm && b.height_mm ? `${b.length_mm} × ${b.width_mm} × ${b.height_mm} mm` : null,
                },
                { label: "Certification", value: b.safety_certificate },
                { label: "Communication", value: b.communication_protocol },
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
        hasOptions={protocolFilteredDisplays.length > 0}
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
        <div className="mb-4 flex items-center gap-3 border border-border bg-surface px-3 py-2">
          <Radio className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
          <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-graphite">Communication protocol</span>
          <div role="tablist" aria-label="HMI communication protocol" className="ml-auto inline-grid grid-cols-2 border border-border">
            {(["can", "uart"] as const).map((protocol) => (
              <button
                key={protocol}
                type="button"
                role="tab"
                aria-selected={s.hmiProtocolPreference === protocol}
                onClick={() => s.setField("hmiProtocolPreference", protocol)}
                className={cn(
                  "px-3 py-1.5 text-[11px] font-sans font-bold uppercase tracking-wide transition-colors",
                  s.hmiProtocolPreference === protocol ? "bg-primary text-white" : "bg-white text-muted-foreground hover:text-primary",
                )}
              >
                {protocol === "can" ? "CAN Bus" : "UART"}
              </button>
            ))}
          </div>
        </div>
        <div className="product-option-grid">
          {protocolFilteredDisplays.map((d: HmiDisplayRow) => (
            <OptionCard
              key={d.id}
              title={d.model}
              imageUrl={resolveImageUrl(d.image_url, d.image_path)}
              specs={[
                { label: "Size", value: d.size },
                { label: "Mounting", value: d.mounting_position },
                { label: "Bluetooth", value: d.bluetooth ? "Yes" : "No" },
                { label: "GPS", value: d.has_gps ? "Yes" : "No" },
              ]}
              fullSpecs={[
                { label: "Protocol", value: d.communication_protocol },
                { label: "Certifications", value: d.certifications },
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
        hasOptions={speedSensors.length > 0}
        optionsLoading={speedSensorsLoading}
        expanded={expanded.speedSensorId}
        onToggleExpanded={() => toggleExpanded("speedSensorId")}
        selectedSummary={
          selectedSpeedSensor && (
            <div>
              <p className="text-sm font-sans font-bold uppercase text-primary">{selectedSpeedSensor.model}</p>
              <p className="text-xs font-body text-muted-foreground">
                {speedSensorTypeLabel(selectedSpeedSensor.mounting_position)} · {selectedSpeedSensor.connector_type ?? "—"}
                {selectedSpeedSensor.cable_length_mm ? ` · ${(selectedSpeedSensor.cable_length_mm / 1000).toFixed(1)}m lead` : ""}
              </p>
            </div>
          )
        }
      >
        <div className="product-option-grid">
          {speedSensors.map((sensor: SpeedSensorRow) => (
            <OptionCard
              key={sensor.id}
              title={sensor.model}
              specs={[
                { label: "Type", value: speedSensorTypeLabel(sensor.mounting_position) },
                { label: "Mounting", value: sensor.mounting_position },
                { label: "Connector", value: sensor.connector_type },
                { label: "Lead length", value: sensor.cable_length_mm ? `${(sensor.cable_length_mm / 1000).toFixed(1)}m` : null },
              ]}
              selected={s.speedSensorId === sensor.id}
              isBestMatch={bestSpeedSensorId === sensor.id}
              onSelect={() => s.setField("speedSensorId", sensor.id)}
            />
          ))}
        </div>
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
        <div className="product-option-grid">
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
        <div className="product-option-grid">
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
            s.controllerSourcing === "not_needed" ? (
              <p className="text-sm font-sans font-bold uppercase text-warning">Not Needed — Customer Supplied</p>
            ) : s.controllerSourcing === "third_party" ? (
              <p className="text-sm font-sans font-bold uppercase text-warning">3rd-Party Controller — Customer Supplied</p>
            ) : (
              selectedController && (
                <div>
                  <p className="text-sm font-sans font-bold uppercase text-primary">{selectedController.model}</p>
                  <p className="text-xs font-body text-muted-foreground">
                    {selectedController.voltage_v}V · {selectedController.rated_power_w ?? "—"}W rated
                  </p>
                </div>
              )
            )
          }
        >
          <div className="mb-4 flex flex-col gap-2">
            <p className="text-xs font-sans font-semibold text-graphite">Controller sourcing</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: "ananda" as const, label: "Ananda Controller" },
                  { id: "third_party" as const, label: "3rd-Party / Customer Supplied" },
                  { id: "not_needed" as const, label: "Not Needed" },
                ]
              ).map((opt) => {
                const selected = (s.controllerSourcing ?? "ananda") === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      if (opt.id === "ananda") {
                        s.setField("controllerSourcing", "ananda")
                        s.setItemSkipped("controllerId", false)
                        return
                      }
                      setPendingThirdPartyController(true)
                      s.setField("controllerSourcing", opt.id)
                    }}
                    className={cn(
                      "border-2 px-3 py-1.5 text-xs font-sans font-bold uppercase tracking-wide transition-colors",
                      selected ? "border-primary bg-primary/5 text-primary" : "border-border text-graphite hover:border-primary/40",
                    )}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {(s.controllerSourcing ?? "ananda") === "ananda" ? (
            <div className="product-option-grid">
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
          ) : (
            <div className="border border-warning/40 bg-warning/10 px-4 py-3">
              <p className="text-xs font-body text-warning-foreground">
                A customer-supplied controller is being used. This item will be listed on the Final Report as requiring a physical
                sample and sales-team coordination.
              </p>
            </div>
          )}

          <AlertDialog open={pendingThirdPartyController} onOpenChange={(open) => {
            if (!open && !s.thirdPartyControllerAcknowledged) {
              s.setField("controllerSourcing", "ananda")
              s.setItemSkipped("controllerId", false)
            }
            setPendingThirdPartyController(open)
          }}>
            <AlertDialogContent className="border-2 border-border font-sans">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-sans text-lg font-black uppercase tracking-tight text-graphite">
                  Using a Non-Ananda Controller
                </AlertDialogTitle>
                <AlertDialogDescription className="font-body text-sm text-muted-foreground">
                  Using Ananda is recommended. Choosing a 3rd-party controller (or none) will reduce your warranty coverage and
                  increase engineering work on our side. We will require a physical sample of the 3rd-party component for system
                  integration testing — Ananda is not responsible for product issues if that test was not conducted. Please inform
                  our sales team of your chosen supplier.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  className="font-sans text-xs font-bold uppercase tracking-wider"
                  onClick={() => {
                    s.setField("controllerSourcing", "ananda")
                    s.setItemSkipped("controllerId", false)
                  }}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    s.setField("controllerId", null)
                    s.setItemSkipped("controllerId", true)
                    s.setField("thirdPartyControllerAcknowledged", true)
                  }}
                  className="bg-primary font-sans text-xs font-bold uppercase tracking-wider text-white hover:bg-primary/90"
                >
                  Confirm &amp; Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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

      <section id="config-bikeComponents-panel" className="mb-6 border border-transparent">
        <div className="mb-4 flex items-center gap-2">
          <SectionLabel>Bike Components</SectionLabel>
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-muted-foreground">Optional</span>
        </div>
        {bikeComponentsLoading ? (
          <div className="flex items-center gap-2 py-8 justify-center text-sm font-sans text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading options…
          </div>
        ) : (
          <div className="space-y-6">
            {BIKE_COMPONENT_CATEGORIES.map((category) => {
              const options = bikeComponents.filter((c: BikeComponentRow) => c.category === category.id)
              const selectedId = s.bikeComponentSelections[category.id] ?? null
              if (options.length === 0) return null
              return (
                <div key={category.id}>
                  <p className="mb-3 text-xs font-sans font-bold uppercase tracking-wider text-graphite">{category.label}</p>
                  <div className="product-option-grid">
                    {options.map((c) => (
                      <OptionCard
                        key={c.id}
                        title={c.model}
                        specs={[
                          { label: "Description", value: c.short_description },
                          { label: "Weight", value: c.weight_kg ? `${c.weight_kg}kg` : null },
                        ]}
                        selected={selectedId === c.id}
                        onSelect={() =>
                          s.setField("bikeComponentSelections", { ...s.bikeComponentSelections, [category.id]: c.id })
                        }
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
