"use client"

import { useAnandaStore, chainringMismatch, sellRegionName } from "@/lib/ananda-store"
import { aAccessories } from "@/lib/ananda-data"
import { useMotors, useControllers, useDisplays, useBatteries, CHARGERS, CHARGING_PORTS } from "@/lib/ananda-packages"
import { cn } from "@/lib/utils"
import { useT } from "@/lib/i18n/provider"
import { StatusBadge } from "./status-badge"
import { AlertTriangle, CheckCircle2, Weight, Zap } from "lucide-react"

export function ConfigSummaryPanel() {
  const s = useAnandaStore()
  const t = useT()

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
  if (!s.speedSensorId && !speedSensorSkipped) issues.push("Speed sensor required")
  if (!s.batteryId && !batterySkipped) issues.push("Battery required")

  const complete = issues.length === 0

  return (
    <aside className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="space-y-3 p-4 text-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-graphite">{t("Configuration summary")}</h2>
          {complete ? (
            <CheckCircle2 className="h-4 w-4 text-primary" aria-label={t("Complete")} />
          ) : (
            <AlertTriangle className="h-4 w-4 text-warning" aria-label={t("Incomplete")} />
          )}
        </div>
        <Divider />
        <Row label="Sell Market" value={sellRegionName(s) ?? "—"} />
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
            s.frontTeeth && s.rearTeeth && s.largestRearTeeth
              ? `${s.frontTeeth}T / ${s.rearTeeth}-${s.largestRearTeeth}T`
              : "—"
          }
          warn={Boolean(chainringMismatch(s))}
        />
        <Row label="Display" value={display ? display.model : "—"} />
        <Row
          label="Accessories"
          value={accessories.length > 0 ? t("{count} selected", { count: accessories.length }) : "None"}
        />

        {/* Weight estimate */}
        {totalKg > 0 && (
          <>
            <Divider />
            <div className="flex items-center gap-2 pt-1">
              <Weight className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{t("Est. System Weight")}</span>
              <span className="ml-auto text-sm font-semibold tabular-nums text-graphite">{totalKg.toFixed(1)} kg</span>
            </div>
          </>
        )}

        {/* Compatibility issues */}
        {issues.length > 0 && (
          <>
            <Divider />
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-warning">{t("Compatibility Checks")}</p>
              {issues.map((issue, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-warning flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-warning-foreground/80">{t(issue)}</span>
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
              <span className="text-xs font-semibold text-primary">{t("System configuration complete")}</span>
            </div>
          </>
        )}
      </div>
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
  const t = useT()
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-xs text-muted-foreground flex-shrink-0">{t(label)}</span>
      <div className="flex items-center gap-1.5 flex-wrap justify-end">
        {badge && <StatusBadge variant={badge} />}
        <span
          className={cn(
            "text-sm font-semibold text-right leading-snug tabular-nums",
            warn ? "text-warning" : highlight ? "text-primary" : "text-foreground",
          )}
        >
          {t(value)}
        </span>
      </div>
    </div>
  )
}
