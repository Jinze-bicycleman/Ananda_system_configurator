"use client"

import { cn } from "@/lib/utils"
import { SectionLabel } from "../ui-primitives"
import { Info } from "lucide-react"
import type { CompatibilityColor, DrivetrainPerformanceRow, EnvioloBoundary } from "@/lib/ananda-drivetrain"

function Stat({ label, value, unit, warning }: { label: string; value: string; unit?: string; warning?: boolean }) {
  return (
    <div className={cn("border p-3", warning ? "border-warning/40 bg-warning/5" : "border-border bg-white")}>
      <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <div className="flex items-end gap-1">
        <span className={cn("text-xl font-sans font-black", warning ? "text-warning" : "text-graphite")}>{value}</span>
        {unit && <span className="text-xs font-sans font-bold text-primary mb-0.5">{unit}</span>}
      </div>
    </div>
  )
}

const STATUS_LABEL: Record<CompatibilityColor, string> = { green: "Compatible", amber: "Verification Required", red: "Not Compatible" }
const STATUS_CLS: Record<CompatibilityColor, string> = { green: "text-primary", amber: "text-warning", red: "text-destructive" }

export function PerformanceDashboard({
  primaryRatioValue,
  gearRows,
  enviolo,
  chainOrBeltlineLabel,
  compatibilityStatus,
  summary,
  isHubMotor,
  speedLimitKmh,
}: {
  primaryRatioValue: number | null
  gearRows: DrivetrainPerformanceRow[] | null
  enviolo: { min: EnvioloBoundary; max: EnvioloBoundary } | null
  chainOrBeltlineLabel: string
  compatibilityStatus: CompatibilityColor
  summary: string
  isHubMotor: boolean
  speedLimitKmh: number | null
}) {
  const developments = gearRows
    ? gearRows.map((r) => r.development_m)
    : enviolo
      ? [enviolo.min.developmentM, enviolo.max.developmentM]
      : []
  const lowestDev = developments.length ? Math.min(...developments) : null
  const highestDev = developments.length ? Math.max(...developments) : null

  const speedAt60 = gearRows
    ? gearRows.map((r) => r.speed_at_60_rpm_kmh)
    : enviolo
      ? [enviolo.min.speedAt60, enviolo.max.speedAt60]
      : []
  const speedAt75 = gearRows
    ? gearRows.map((r) => r.speed_at_75_rpm_kmh)
    : enviolo
      ? [enviolo.min.speedAt75, enviolo.max.speedAt75]
      : []
  const speedAt90 = gearRows
    ? gearRows.map((r) => r.speed_at_90_rpm_kmh)
    : enviolo
      ? [enviolo.min.speedAt90, enviolo.max.speedAt90]
      : []

  const fmtRange = (arr: number[]) => {
    if (!arr.length) return "—"
    const min = Math.min(...arr)
    const max = Math.max(...arr)
    return min === max ? min.toFixed(1) : `${min.toFixed(1)}–${max.toFixed(1)}`
  }

  const maxSpeed90 = speedAt90.length ? Math.max(...speedAt90) : null
  const speedExceedsLimit = speedLimitKmh != null && maxSpeed90 != null && maxSpeed90 > speedLimitKmh

  const wheelTorques = gearRows
    ? gearRows.map((r) => r.theoretical_wheel_torque_nm).filter((v): v is number => v != null)
    : enviolo
      ? [enviolo.min.theoreticalWheelTorqueNm, enviolo.max.theoreticalWheelTorqueNm].filter((v): v is number => v != null)
      : []

  const gearCount = gearRows ? String(gearRows.length) : enviolo ? "Continuous" : "—"

  return (
    <div className="mb-8">
      <SectionLabel>Performance Dashboard</SectionLabel>
      <div className="border border-border bg-white overflow-hidden">
        <div className="h-1 bg-primary" />
        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
            <Stat label="Primary Ratio" value={primaryRatioValue != null ? primaryRatioValue.toFixed(2) : "—"} unit=":1" />
            <Stat
              label="Gear Range"
              value={lowestDev != null && highestDev != null ? `${lowestDev.toFixed(2)}–${highestDev.toFixed(2)}` : "—"}
              unit="m dev."
            />
            <Stat label="Number of Gears" value={gearCount} />
            <Stat label="Lowest Development" value={lowestDev != null ? lowestDev.toFixed(2) : "—"} unit="m" />
            <Stat label="Highest Development" value={highestDev != null ? highestDev.toFixed(2) : "—"} unit="m" />
            <Stat label="Speed at 60 rpm" value={fmtRange(speedAt60)} unit="km/h" />
            <Stat label="Speed at 75 rpm" value={fmtRange(speedAt75)} unit="km/h" />
            <Stat label="Speed at 90 rpm" value={fmtRange(speedAt90)} unit="km/h" warning={speedExceedsLimit} />
            {!isHubMotor && (
              <Stat label="Theoretical Wheel Torque" value={wheelTorques.length ? fmtRange(wheelTorques) : "—"} unit="Nm" />
            )}
            <Stat label="Chainline / Beltline" value={chainOrBeltlineLabel} unit="mm" />
            <Stat label="Compatibility Status" value={STATUS_LABEL[compatibilityStatus]} />
          </div>

          <div className={cn("flex items-start gap-2 border-l-2 px-4 py-3 bg-surface", "border-primary")}>
            <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs font-body text-muted-foreground">{summary}</p>
          </div>

          {isHubMotor && (
            <div className="mt-3 flex items-start gap-2 border-l-2 border-primary bg-surface px-4 py-3">
              <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs font-body text-muted-foreground">
                Because the motor drives the wheel directly, changing the chainring or pulley ratio does not multiply hub-motor torque.
                Pedal drivetrain gearing and cadence are shown separately from hub-motor wheel torque.
              </p>
            </div>
          )}

          {speedExceedsLimit && (
            <div className="mt-3 flex items-start gap-2 bg-warning/10 border border-warning/30 px-4 py-3">
              <Info className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
              <p className="text-sm font-body text-warning-foreground">
                Speed at cadence exceeds the selected speed limit ({speedLimitKmh} km/h) in the highest gear. Final assistance cut-off
                must follow the selected regional regulation.
              </p>
            </div>
          )}

          <p className={cn("mt-3 text-xs font-sans font-bold uppercase tracking-wider", STATUS_CLS[compatibilityStatus])}>
            {STATUS_LABEL[compatibilityStatus]}
          </p>
        </div>
      </div>
    </div>
  )
}
