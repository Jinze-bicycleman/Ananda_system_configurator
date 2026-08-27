"use client"

import { useState } from "react"
import { useAnandaStore } from "@/lib/ananda-store"
import { aAccessories } from "@/lib/ananda-data"
import { useMotors, useControllers, useDisplays, useBatteries, CHARGERS, CHARGING_PORTS } from "@/lib/ananda-packages"
import { cn } from "@/lib/utils"
import { StatusBadge } from "./status-badge"
import { TargetStatusPanel } from "./target-status-panel"
import { AlertTriangle, CheckCircle2, Weight, Zap } from "lucide-react"

export function ConfigSummaryPanel() {
  const [tab, setTab] = useState<"summary" | "status">("summary")
  const s = useAnandaStore()

  const { motors } = useMotors()
  const { controllers } = useControllers()
  const { displays } = useDisplays()
  const { batteries } = useBatteries()

  const motor = motors.find((m) => m.id === s.motorId) ?? null
  const battery = batteries.find((b) => b.id === s.batteryId) ?? null
  const controller = controllers.find((c) => c.id === s.controllerId) ?? null
  const display = displays.find((d) => d.id === s.displayId) ?? null
  const charger = CHARGERS.find((c) => c.id === s.chargerId) ?? null
  const chargingPort = CHARGING_PORTS.find((p) => p.id === s.chargingPortId) ?? null
  const accessories = aAccessories.filter((a) => s.accessoryIds.includes(a.id))

  const torqueSensorSkipped = s.skippedItems.includes("torqueSensorId")
  const speedSensorSkipped = s.skippedItems.includes("speedSensorId")
  const batterySkipped = s.skippedItems.includes("batteryId")

  // Weight estimate — motor and battery only
  let totalKg = 0
  if (motor?.weight_kg) totalKg += motor.weight_kg
  if (battery?.weight_kg) totalKg += battery.weight_kg

  // Compatibility checks
  const issues: string[] = []
  if (!s.motorId) issues.push("No package selected")
  if (s.driveType === "hub" && !s.controllerId) issues.push("Controller required for hub motor")
  if (s.driveType === "hub" && !s.torqueSensorId && !torqueSensorSkipped) issues.push("Torque sensor required for hub motor")
  if (!s.speedSensorId && !speedSensorSkipped) issues.push("Speed sensor required")
  if (!s.batteryId && !batterySkipped) issues.push("Battery required")

  const complete = issues.length === 0

  return (
    <aside className="bg-white border border-border rounded-sm shadow-sm overflow-hidden">
      {/* Top green border stripe */}
      <div className="h-1 bg-primary" />

      {/* Tab switcher */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setTab("summary")}
          className={cn(
            "flex-1 px-3 py-2.5 text-[11px] font-sans font-black uppercase tracking-[0.15em] transition-colors",
            tab === "summary" ? "bg-surface text-graphite border-b-2 border-primary" : "text-muted-foreground hover:text-graphite",
          )}
        >
          Summary
        </button>
        <button
          type="button"
          onClick={() => setTab("status")}
          className={cn(
            "flex-1 px-3 py-2.5 text-[11px] font-sans font-black uppercase tracking-[0.15em] transition-colors",
            tab === "status" ? "bg-surface text-graphite border-b-2 border-primary" : "text-muted-foreground hover:text-graphite",
          )}
        >
          Target Status
        </button>
      </div>

      {tab === "status" ? (
        <TargetStatusPanel />
      ) : (
      <div className="p-4 space-y-3 text-[12px]">
        <div className="flex items-center justify-end -mt-1 mb-1">
          {complete ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <AlertTriangle className="w-4 h-4 text-warning" />}
        </div>
        <Row label="Sell Market" value={s.sellRegion ?? "—"} />
        <Row label="Regulation" value={s.regulation ?? "—"} />
        <Row label="Speed Limit" value={s.speedLimitKmh ? `${s.speedLimitKmh} km/h` : "—"} />
        <Row label="Rated Power" value={s.ratedPowerW ? `${s.ratedPowerW} W` : "—"} />
        <Row label="Bike Category" value={s.bikeCategory ?? "—"} />

        <Divider />

        <Row label="Drive Type" value={s.driveType === "mid" ? "Mid-Drive" : s.driveType === "hub" ? "Hub Motor" : "—"} />
        <Row label="Voltage" value={s.voltagePlatform ? `${s.voltagePlatform}V` : "—"} highlight />

        <Divider />

        <Row label="Package" value={motor ? motor.model : "—"} badge={motor?.is_recommended ? "recommended" : undefined} />
        <Row
          label="Controller"
          value={s.driveType === "mid" ? "Integrated" : controller ? controller.model : "—"}
          badge={s.driveType === "mid" ? "integrated" : undefined}
        />

        <Divider />

        <Row label="Battery" value={batterySkipped ? "Not Needed" : battery ? battery.model : "—"} />
        <Row label="Charger" value={charger ? charger.model : "—"} />
        <Row label="Charge Port" value={chargingPort ? chargingPort.model : "—"} />

        <Divider />

        <Row
          label="Drivetrain"
          value={
            s.drivetrainType
              ? `${s.drivetrainType === "chain" ? "Chain" : "Belt"} · ${
                  s.transmissionType === "derailleur"
                    ? "Derailleur"
                    : s.transmissionType === "internal_gear_hub"
                      ? "Internal-Gear Hub"
                      : s.transmissionType === "cvt"
                        ? "CVT"
                        : s.transmissionType === "single_speed"
                          ? "Single Speed"
                          : s.transmissionType === "gearbox"
                            ? "Gearbox"
                            : "—"
                }`
              : "—"
          }
          warn={s.drivetrainErrors.length > 0}
        />
        <Row label="Display" value={display ? display.model : "—"} />
        <Row label="Accessories" value={accessories.length > 0 ? `${accessories.length} selected` : "None"} />

        {/* Weight estimate */}
        {totalKg > 0 && (
          <>
            <Divider />
            <div className="flex items-center gap-2 pt-1">
              <Weight className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[11px] font-sans uppercase tracking-wider text-muted-foreground">Est. System Weight</span>
              <span className="ml-auto text-sm font-sans font-black text-graphite">{totalKg.toFixed(1)} kg</span>
            </div>
          </>
        )}

        {/* Compatibility issues */}
        {issues.length > 0 && (
          <>
            <Divider />
            <div className="space-y-1.5">
              <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-warning">Compatibility Checks</p>
              {issues.map((issue, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-warning flex-shrink-0 mt-0.5" />
                  <span className="text-[11px] text-warning-foreground/80">{issue}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {complete && (
          <>
            <Divider />
            <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-sm px-3 py-2">
              <Zap className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="text-[11px] font-sans font-semibold text-primary">System configuration complete</span>
            </div>
          </>
        )}
      </div>
      )}
    </aside>
  )
}

function Divider() {
  return <div className="h-px bg-border -mx-1" />
}

function Row({
  label,
  value,
  highlight,
  warn,
  badge,
}: {
  label: string
  value: string
  highlight?: boolean
  warn?: boolean
  badge?: "recommended" | "integrated"
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-[10px] font-sans uppercase tracking-wider text-muted-foreground flex-shrink-0">{label}</span>
      <div className="flex items-center gap-1.5 flex-wrap justify-end">
        {badge && <StatusBadge variant={badge} />}
        <span
          className={cn(
            "text-[12px] font-sans font-semibold text-right leading-tight",
            warn ? "text-warning" : highlight ? "text-primary" : "text-foreground",
          )}
        >
          {value}
        </span>
      </div>
    </div>
  )
}
