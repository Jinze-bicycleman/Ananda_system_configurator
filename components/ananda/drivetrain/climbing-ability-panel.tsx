"use client"

import { useMemo, useState } from "react"
import { AlertTriangle, Info } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { SectionLabel, TechSpecRow } from "../ui-primitives"
import { ClimbingSlopeVisual } from "./climbing-slope-visual"
import {
  DEFAULT_BIKE_WEIGHT_KG,
  PEDAL_EFFORT_PRESETS,
  RIDER_WEIGHT_MAX_KG,
  RIDER_WEIGHT_MIN_KG,
  computeClimbingAbility,
  type MotorType,
  type PedalEffortKey,
} from "@/lib/ananda-climbing"
import { useMotorAssistModes } from "@/lib/ananda-packages"

export function ClimbingAbilityPanel({
  motorId,
  motorType,
  motorMaxTorqueNm,
  frontChainringTeeth,
  largestRearTeeth,
  wheelRadiusMetres,
  drivetrainEfficiency,
  riderWeightKg,
  onRiderWeightChange,
  assistanceModeKey,
  onAssistanceModeChange,
  pedalEffortKey,
  onPedalEffortChange,
}: {
  motorId: string | null
  motorType: MotorType | null
  motorMaxTorqueNm: number | null
  frontChainringTeeth: number | null
  largestRearTeeth: number | null
  wheelRadiusMetres: number | null
  drivetrainEfficiency: number | null
  riderWeightKg: number
  onRiderWeightChange: (kg: number) => void
  assistanceModeKey: string
  onAssistanceModeChange: (key: string) => void
  pedalEffortKey: PedalEffortKey
  onPedalEffortChange: (key: PedalEffortKey) => void
}) {
  const { modes, isLoading: modesLoading } = useMotorAssistModes(motorId)
  const [showRawMissing, setShowRawMissing] = useState(false)

  const activeMode = modes.find((m) => m.mode_key === assistanceModeKey) ?? modes[0] ?? null
  const pedalPreset = PEDAL_EFFORT_PRESETS.find((p) => p.key === pedalEffortKey) ?? PEDAL_EFFORT_PRESETS[1]

  const result = useMemo(() => {
    if (!motorType || !activeMode) return null
    return computeClimbingAbility({
      motorType,
      motorMaxTorqueNm,
      riderPedalTorqueNm: pedalPreset.torqueNm,
      assistanceMultiplier: activeMode.assistance_multiplier,
      frontChainringTeeth,
      largestRearTeeth,
      riderWeightKg,
      bikeWeightKg: DEFAULT_BIKE_WEIGHT_KG,
      wheelRadiusMetres,
      drivetrainEfficiency,
    })
  }, [motorType, activeMode, motorMaxTorqueNm, pedalPreset, frontChainringTeeth, largestRearTeeth, riderWeightKg, wheelRadiusMetres, drivetrainEfficiency])

  const systemWeightKg = riderWeightKg + DEFAULT_BIKE_WEIGHT_KG

  return (
    <div className="flex flex-col gap-5 border border-border bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <SectionLabel>Climbing Ability</SectionLabel>
        <p className="text-xs font-body text-muted-foreground">Theoretical peak, low-speed climbing estimate</p>
      </div>

      {/* Rider weight slider */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label htmlFor="rider-weight-slider" className="text-sm font-sans font-semibold text-graphite">
            Rider weight
          </label>
          <span className="text-sm font-sans font-bold tabular-nums text-primary">{riderWeightKg} kg</span>
        </div>
        <Slider
          id="rider-weight-slider"
          min={RIDER_WEIGHT_MIN_KG}
          max={RIDER_WEIGHT_MAX_KG}
          step={1}
          value={[riderWeightKg]}
          onValueChange={([v]) => onRiderWeightChange(v)}
          aria-label="Rider weight in kilograms"
          aria-valuetext={`${riderWeightKg} kilograms`}
        />
        <div className="flex items-center justify-between text-xs font-body text-muted-foreground">
          <span>Bike weight: {DEFAULT_BIKE_WEIGHT_KG} kg</span>
          <span className="tabular-nums">Total system weight: {systemWeightKg} kg</span>
        </div>
      </div>

      {/* Assistance mode */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-sans font-semibold text-graphite">Assistance mode</span>
          <Tooltip>
            <TooltipTrigger aria-label="What does assistance mode mean?">
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs">
              100% assistance means the motor requests torque equal to the rider&apos;s input, subject to the motor&apos;s
              maximum torque.
            </TooltipContent>
          </Tooltip>
        </div>
        {modesLoading ? (
          <div className="h-9 w-full animate-pulse bg-muted" />
        ) : (
          <div className="choice-group" role="group" aria-label="Assistance mode">
            {modes.map((m) => (
              <button
                key={m.mode_key}
                type="button"
                onClick={() => onAssistanceModeChange(m.mode_key)}
                aria-pressed={activeMode?.mode_key === m.mode_key}
                className={cn(
                  "flex min-w-0 flex-col items-center justify-center gap-0.5 border px-2 py-2 text-center transition-colors",
                  activeMode?.mode_key === m.mode_key
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-graphite hover:border-primary/40",
                )}
              >
                <span className="text-sm font-body leading-tight">{m.display_label}</span>
                <span className="text-xs tabular-nums text-muted-foreground">{m.assistance_multiplier.toFixed(1)}×</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Pedal effort */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-sans font-semibold text-graphite">Rider pedalling effort</span>
        <div className="choice-group" role="group" aria-label="Rider pedalling effort">
          {PEDAL_EFFORT_PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => onPedalEffortChange(p.key)}
              aria-pressed={pedalEffortKey === p.key}
              className={cn(
                "flex min-w-0 flex-col items-center justify-center gap-0.5 border px-2 py-2 text-center transition-colors",
                pedalEffortKey === p.key
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-graphite hover:border-primary/40",
              )}
            >
              <span className="text-sm font-body leading-tight">{p.label}</span>
              <span className="text-xs tabular-nums text-muted-foreground">{p.torqueNm} Nm</span>
            </button>
          ))}
        </div>
      </div>

      {/* Live output */}
      {!motorType ? (
        <EmptyClimbingState missing={["motor selection"]} />
      ) : result === null ? (
        <EmptyClimbingState missing={["assistance mode"]} />
      ) : result.status === "missing-data" ? (
        <EmptyClimbingState missing={result.missingFields} />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
            <TechSpecRow label="Rider contribution" value={pedalPreset.torqueNm} unit="Nm" />
            <TechSpecRow
              label="Motor-assist torque"
              value={Math.round(result.assistance.motorTorqueDeliveredNm * 10) / 10}
              unit="Nm"
              highlight
            />
            <TechSpecRow
              label="Total wheel torque"
              value={Math.round(result.totalWheelTorqueNm * 10) / 10}
              unit="Nm"
              highlight
            />
            <TechSpecRow
              label="Climbing ratio"
              value={largestRearTeeth != null && frontChainringTeeth != null ? `${largestRearTeeth}T / ${frontChainringTeeth}T` : "—"}
            />
          </div>

          {result.assistance.isCappedByMotorMax && (
            <div className="flex items-start gap-2.5 bg-warning/10 border border-warning/30 px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
              <p className="text-sm font-body text-warning-foreground">Limited by motor maximum torque.</p>
            </div>
          )}

          {result.status === "exceeded" ? (
            <div className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/30 px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm font-body text-destructive">
                The theoretical force model limit is exceeded; real performance will be traction- and geometry-limited.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <ClimbingSlopeVisual gradePercent={result.gradePercent as number} capped={(result.gradePercent as number) > 45} />
              <div className="flex flex-col gap-1">
                <p className="text-3xl font-sans font-black tabular-nums text-graphite">
                  {(result.gradePercent as number).toFixed(1)}%
                </p>
                <p className="text-sm font-body text-muted-foreground">Maximum theoretical grade</p>
                {result.scenario && (
                  <p className="text-sm font-body font-medium text-primary">{result.scenario.label}</p>
                )}
              </div>
            </div>
          )}

          <p className="text-xs font-body leading-relaxed text-muted-foreground">
            Sustained real-world climbing also depends on motor power and efficiency at operating speed, thermal limits,
            tyre traction, bicycle geometry and balance, road surface, rolling resistance, and wind and rider technique.
          </p>
        </div>
      )}
    </div>
  )
}

function EmptyClimbingState({ missing }: { missing: string[] }) {
  return (
    <div className="flex items-start gap-2.5 bg-graphite/5 border border-graphite/20 px-4 py-3">
      <Info className="w-4 h-4 text-graphite flex-shrink-0 mt-0.5" />
      <p className="text-sm font-body text-graphite">
        <span className="font-semibold">N/A</span> — missing {missing.join(", ")}.
      </p>
    </div>
  )
}
