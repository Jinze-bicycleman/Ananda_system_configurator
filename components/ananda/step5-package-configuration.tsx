"use client"

import { useState } from "react"
import { useAnandaStore } from "@/lib/ananda-store"
import {
  useControllers,
  useDisplays,
  useBatteries,
  chargersForVoltage,
  CHARGING_PORTS,
  type ControllerRow,
  type HmiDisplayRow,
  type BatteryRow,
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
  onSelect,
}: {
  title: string
  imageUrl?: string | null
  specs: Spec[]
  selected: boolean
  onSelect: () => void
}) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative cursor-pointer border-2 overflow-hidden transition-all",
        selected ? "border-primary shadow-md shadow-primary/10" : "border-border hover:border-primary/40",
      )}
    >
      <div className={cn("h-1 w-full", selected ? "bg-primary" : "bg-border")} />
      {selected && (
        <div className="absolute top-2 right-2 z-10 bg-primary rounded-full p-0.5">
          <CheckCircle2 className="w-3 h-3 text-white" />
        </div>
      )}
      <div className={cn("relative flex items-center justify-center h-24 overflow-hidden", selected ? "bg-primary/5" : "bg-surface")}>
        {imageUrl ? (
          <img src={imageUrl || "/placeholder.svg"} alt={title} className="relative z-10 max-h-16 object-contain" crossOrigin="anonymous" />
        ) : (
          <ImageIcon className={cn("w-8 h-8", selected ? "text-primary/40" : "text-border")} />
        )}
      </div>
      <div className="p-3">
        <p className={cn("text-sm font-sans font-bold uppercase mb-1", selected ? "text-primary" : "text-graphite")}>{title}</p>
        {specs.length > 0 && (
          <div className="border border-border rounded-sm overflow-hidden">
            {specs.map((sp) => sp.value != null && <TechSpecRow key={sp.label} label={sp.label} value={sp.value} />)}
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
  selected: { id: string; node: React.ReactNode } | null
  skippable: boolean
  skipped: boolean
  onToggleSkip: () => void
  children: React.ReactNode
  hasOptions: boolean
  optionsLoading?: boolean
}

function ConfigRow({ itemKey, label, required, selected, skippable, skipped, onToggleSkip, children, hasOptions, optionsLoading }: ConfigRowProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <SectionLabel>{label}</SectionLabel>
        <div className="flex items-center gap-2">
          {required && !skipped && <StatusBadge variant="required" />}
          {skipped && <StatusBadge variant="not-required" label="Marked Not Needed" />}
          {skippable && (
            <button
              onClick={onToggleSkip}
              className={cn(
                "flex items-center gap-1 text-[11px] font-sans font-bold uppercase tracking-wider px-2 py-1 border transition-colors",
                skipped ? "border-primary text-primary bg-primary/5" : "border-border text-muted-foreground hover:border-primary hover:text-primary",
              )}
            >
              {skipped ? <RotateCcw className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
              {skipped ? "Restore" : "No Need"}
            </button>
          )}
        </div>
      </div>

      {skipped ? (
        <div className="border border-border bg-surface px-4 py-3 text-sm font-body text-muted-foreground">
          This component has been marked as not needed for this build.
        </div>
      ) : (
        <>
          {selected && !expanded ? (
            <div className="border-2 border-primary/30 bg-primary/5 px-4 py-3 flex items-center justify-between">
              <div>{selected.node}</div>
              <button
                onClick={() => setExpanded(true)}
                className="text-[11px] font-sans font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-1"
              >
                Customise <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div>
              {!selected && (
                <div className="mb-3 text-xs font-sans font-semibold uppercase tracking-wider text-warning">
                  No selection yet — choose an option below{itemKey === "torqueSensorId" || itemKey === "speedSensorId" || itemKey === "batteryId" ? "" : "."}
                </div>
              )}
              {optionsLoading ? (
                <div className="flex items-center gap-2 py-8 justify-center text-sm font-sans text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading options…
                </div>
              ) : hasOptions ? (
                <>
                  {children}
                  {selected && (
                    <button
                      onClick={() => setExpanded(false)}
                      className="mt-3 text-[11px] font-sans font-bold uppercase tracking-wider text-muted-foreground hover:text-primary"
                    >
                      Collapse
                    </button>
                  )}
                </>
              ) : (
                <EmptyOptionsNotice />
              )}
            </div>
          )}
        </>
      )}
    </section>
  )
}

export function Step5PackageConfiguration() {
  const s = useAnandaStore()
  const isHub = s.driveType === "hub"

  const { controllers, isLoading: controllersLoading } = useControllers()
  const { displays, isLoading: displaysLoading } = useDisplays()
  const { batteries, isLoading: batteriesLoading } = useBatteries()

  const compatibleControllers = controllers.filter((c) => c.compatible_motor_type === "hub" && c.voltage_v === s.voltagePlatform)
  const compatibleBatteries = batteries.filter((b) => b.voltage_v === s.voltagePlatform)
  const compatibleChargers = chargersForVoltage(s.voltagePlatform)

  const selectedController = compatibleControllers.find((c) => c.id === s.controllerId) ?? null
  const selectedDisplay = displays.find((d) => d.id === s.displayId) ?? null
  const selectedBattery = compatibleBatteries.find((b) => b.id === s.batteryId) ?? null
  const selectedCharger = compatibleChargers.find((c) => c.id === s.chargerId) ?? null
  const selectedPort = CHARGING_PORTS.find((p) => p.id === s.chargingPortId) ?? null

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
        subtitle="Fine-tune the components bundled with your selected package. Each item can stay as the package default, be customised from compatible alternatives, or marked as not needed."
      />

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
          selected={
            selectedController
              ? {
                  id: selectedController.id,
                  node: (
                    <div>
                      <p className="text-sm font-sans font-bold uppercase text-primary">{selectedController.model}</p>
                      <p className="text-xs font-body text-muted-foreground">
                        {selectedController.voltage_v}V · {selectedController.rated_power_w ?? "—"}W rated
                      </p>
                    </div>
                  ),
                }
              : null
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {compatibleControllers.map((c: ControllerRow) => (
              <OptionCard
                key={c.id}
                title={c.model}
                imageUrl={c.image_url}
                specs={[
                  { label: "Rated Power", value: c.rated_power_w ? `${c.rated_power_w}W` : null },
                  { label: "Peak Current", value: c.peak_current_a ? `${c.peak_current_a}A` : null },
                  { label: "Voltage", value: `${c.voltage_v}V` },
                ]}
                selected={s.controllerId === c.id}
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
          selected={s.torqueSensorId ? { id: s.torqueSensorId, node: <p className="text-sm font-sans font-bold text-primary">{s.torqueSensorId}</p> } : null}
        >
          <EmptyOptionsNotice />
        </ConfigRow>
      )}

      <ConfigRow
        itemKey="speedSensorId"
        label="Speed Sensor"
        required
        skippable
        skipped={s.skippedItems.includes("speedSensorId")}
        onToggleSkip={() => toggleSkip("speedSensorId", "speedSensorId")}
        hasOptions={false}
        selected={s.speedSensorId ? { id: s.speedSensorId, node: <p className="text-sm font-sans font-bold text-primary">{s.speedSensorId}</p> } : null}
      >
        <EmptyOptionsNotice />
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
        selected={
          selectedDisplay
            ? {
                id: selectedDisplay.id,
                node: (
                  <div>
                    <p className="text-sm font-sans font-bold uppercase text-primary">{selectedDisplay.model}</p>
                    <p className="text-xs font-body text-muted-foreground">{selectedDisplay.size ?? "—"}</p>
                  </div>
                ),
              }
            : null
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displays.map((d: HmiDisplayRow) => (
            <OptionCard
              key={d.id}
              title={d.model}
              imageUrl={d.image_url}
              specs={[
                { label: "Size", value: d.size },
                { label: "Bluetooth", value: d.bluetooth ? "Yes" : "No" },
                { label: "GPS", value: d.has_gps ? "Yes" : "No" },
              ]}
              selected={s.displayId === d.id}
              onSelect={() => s.setField("displayId", d.id)}
            />
          ))}
        </div>
      </ConfigRow>

      <ConfigRow
        itemKey="batteryId"
        label="Battery"
        required
        skippable
        skipped={s.skippedItems.includes("batteryId")}
        onToggleSkip={() => toggleSkip("batteryId", "batteryId")}
        hasOptions={compatibleBatteries.length > 0}
        optionsLoading={batteriesLoading}
        selected={
          selectedBattery
            ? {
                id: selectedBattery.id,
                node: (
                  <div>
                    <p className="text-sm font-sans font-bold uppercase text-primary">{selectedBattery.model}</p>
                    <p className="text-xs font-body text-muted-foreground">{selectedBattery.capacity_wh ?? "—"}Wh</p>
                  </div>
                ),
              }
            : null
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {compatibleBatteries.map((b: BatteryRow) => (
            <OptionCard
              key={b.id}
              title={b.model}
              imageUrl={b.image_url}
              specs={[
                { label: "Capacity", value: b.capacity_wh ? `${b.capacity_wh}Wh` : null },
                { label: "Weight", value: b.weight_kg ? `${b.weight_kg}kg` : null },
                { label: "Voltage", value: `${b.voltage_v}V` },
              ]}
              selected={s.batteryId === b.id}
              onSelect={() => s.setField("batteryId", b.id)}
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
        selected={
          selectedCharger
            ? {
                id: selectedCharger.id,
                node: (
                  <div>
                    <p className="text-sm font-sans font-bold uppercase text-primary">{selectedCharger.model}</p>
                    <p className="text-xs font-body text-muted-foreground">
                      {selectedCharger.voltage_v}V · {selectedCharger.outputCurrentA}A
                    </p>
                  </div>
                ),
              }
            : null
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
        selected={
          selectedPort
            ? {
                id: selectedPort.id,
                node: <p className="text-sm font-sans font-bold uppercase text-primary">{selectedPort.model}</p>,
              }
            : null
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CHARGING_PORTS.map((p: ChargingPortOption) => (
            <OptionCard
              key={p.id}
              title={p.model}
              specs={[{ label: "Type", value: p.description }]}
              selected={s.chargingPortId === p.id}
              onSelect={() => s.setField("chargingPortId", p.id)}
            />
          ))}
        </div>
      </ConfigRow>
    </div>
  )
}
