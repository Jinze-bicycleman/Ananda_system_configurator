"use client"

import { useMemo, useState } from "react"
import { useAnandaStore } from "@/lib/ananda-store"
import { useMotors } from "@/lib/ananda-packages"
import { cn } from "@/lib/utils"
import { StepHeader } from "./ui-primitives"
import { DrivetrainSummary } from "./drivetrain/drivetrain-summary"
import { SpeedCadenceGraph } from "./drivetrain/speed-cadence-graph"
import { ClimbingAbilityPanel } from "./drivetrain/climbing-ability-panel"
import { InlineError } from "./drivetrain/drivetrain-states"
import { validateToothCounts, resolveWheelRadiusMetres, type MotorType, type PedalEffortKey } from "@/lib/ananda-climbing"

export function Step6DrivetrainSelection({ onEditStep }: { onEditStep?: (stepNumber: number) => void }) {
  const s = useAnandaStore()
  const { motors } = useMotors()
  const motor = motors.find((m) => m.id === s.motorId) ?? null

  const [gvwInput, setGvwInput] = useState(s.gvwKg != null ? String(s.gvwKg) : "")

  const isMid = s.driveType === "mid"
  const motorType: MotorType = motor?.motor_type === "hub" ? "hub" : motor?.motor_type === "mid_drive" ? "mid_drive" : isMid ? "mid_drive" : "hub"

  // Local text state for the three tooth-count inputs so the field can be
  // temporarily empty while typing without immediately writing `null` /
  // NaN into the store, while still validating live.
  const [frontInput, setFrontInput] = useState(s.frontTeeth != null ? String(s.frontTeeth) : "")
  const [smallestInput, setSmallestInput] = useState(s.rearTeeth != null ? String(s.rearTeeth) : "")
  const [largestInput, setLargestInput] = useState(s.largestRearTeeth != null ? String(s.largestRearTeeth) : "")

  // Gear-hub-only inputs — the up/down internal-gear ratios taken straight
  // from the hub's datasheet. A fixed reference cog (20T) converts the
  // ratios into the same "equivalent rear sprocket teeth" shape the
  // derailleur calculator already uses, so the graph/climbing panel below
  // don't need a second code path.
  const GEAR_HUB_REFERENCE_COG = 20
  const [hubUpInput, setHubUpInput] = useState(s.hubGearUpRatio != null ? String(s.hubGearUpRatio) : "")
  const [hubDownInput, setHubDownInput] = useState(s.hubGearDownRatio != null ? String(s.hubGearDownRatio) : "")

  const isGearHub = s.drivetrainSystemKind === "gear_hub"

  const parseTeeth = (raw: string): number | null => {
    if (raw.trim() === "") return null
    const n = Number.parseInt(raw, 10)
    return Number.isFinite(n) ? n : null
  }
  const parseRatio = (raw: string): number | null => {
    if (raw.trim() === "") return null
    const n = Number.parseFloat(raw)
    return Number.isFinite(n) && n > 0 ? n : null
  }

  const validation = useMemo(
    () => validateToothCounts(parseTeeth(frontInput), parseTeeth(smallestInput), parseTeeth(largestInput)),
    [frontInput, smallestInput, largestInput],
  )

  const commitFront = (raw: string) => {
    setFrontInput(raw)
    s.setField("frontTeeth", parseTeeth(raw))
  }
  const commitSmallest = (raw: string) => {
    setSmallestInput(raw)
    s.setField("rearTeeth", parseTeeth(raw))
  }
  const commitLargest = (raw: string) => {
    setLargestInput(raw)
    s.setField("largestRearTeeth", parseTeeth(raw))
  }
  const commitHubUp = (raw: string) => {
    setHubUpInput(raw)
    const ratio = parseRatio(raw)
    s.setField("hubGearUpRatio", ratio)
    if (ratio) {
      const equivalent = Math.round(GEAR_HUB_REFERENCE_COG / ratio)
      setSmallestInput(String(equivalent))
      s.setField("rearTeeth", equivalent)
    }
  }
  const commitHubDown = (raw: string) => {
    setHubDownInput(raw)
    const ratio = parseRatio(raw)
    s.setField("hubGearDownRatio", ratio)
    if (ratio) {
      const equivalent = Math.round(GEAR_HUB_REFERENCE_COG / ratio)
      setLargestInput(String(equivalent))
      s.setField("largestRearTeeth", equivalent)
    }
  }

  const selectSystemKind = (kind: "derailleur" | "gear_hub") => {
    s.setField("drivetrainSystemKind", kind)
    // Switching kinds invalidates the previously computed rear-teeth values.
    setSmallestInput("")
    setLargestInput("")
    s.setField("rearTeeth", null)
    s.setField("largestRearTeeth", null)
  }

  const wheelRadiusMetres = useMemo(() => {
    const wheelSizeInch = s.wheelSize ? Number.parseFloat(s.wheelSize) || null : null
    return resolveWheelRadiusMetres(s.tyreCircumferenceMm, wheelSizeInch)
  }, [s.tyreCircumferenceMm, s.wheelSize])

  const handleGvwBlur = () => {
    const parsed = gvwInput ? Number.parseFloat(gvwInput) : null
    s.setField("gvwKg", Number.isFinite(parsed as number) ? parsed : null)
  }

  const gvwSkipped = s.skippedItems.includes("gvwKg")
  const toggleGvwSkip = () => {
    if (gvwSkipped) {
      s.setItemSkipped("gvwKg", false)
    } else {
      s.setItemSkipped("gvwKg", true)
      setGvwInput("")
      s.setField("gvwKg", null)
    }
  }

  return (
    <div>
      <StepHeader
        step={5}
        title="Drivetrain & Climbing"
        subtitle="Enter the gearing on your bike and see the resulting speed range, cadence and climbing ability with the selected motor."
      />

      <DrivetrainSummary onEditStep={(step) => onEditStep?.(step)} />

      <div className="mb-6 max-w-xs">
        <label className="block text-xs font-sans font-semibold text-graphite mb-2">
          Estimated System Weight (rider + bike + cargo)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={gvwInput}
            onChange={(e) => setGvwInput(e.target.value)}
            onBlur={handleGvwBlur}
            disabled={gvwSkipped}
            placeholder={gvwSkipped ? "Skipped" : "e.g. 120"}
            className="w-full border border-border px-3 py-1.5 text-sm font-body tabular-nums focus:border-primary outline-none disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted-foreground"
          />
          <span className="text-xs font-sans font-semibold text-muted-foreground">kg</span>
          <button
            type="button"
            onClick={toggleGvwSkip}
            className={cn(
              "shrink-0 whitespace-nowrap border px-2.5 py-1.5 text-xs font-sans font-semibold transition-colors",
              gvwSkipped ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary hover:text-primary",
            )}
          >
            {gvwSkipped ? "Restore" : "Skip"}
          </button>
        </div>
        <p className="mt-1 text-xs font-body text-muted-foreground">
          {gvwSkipped
            ? "Skipped — estimated system weight will not be validated."
            : "Used alongside rider weight to estimate total system weight for the climbing calculation."}
        </p>
      </div>

      <div id="field-drivetrainTeeth" className="mb-8 border border-border bg-white p-5">
        <p className="mb-4 text-sm font-sans font-semibold text-graphite">Drivetrain gearing</p>

        <div className="mb-5 flex flex-wrap gap-2">
          {(
            [
              { id: "derailleur" as const, label: "Derailleur System" },
              { id: "gear_hub" as const, label: "Gear Hub System" },
            ]
          ).map((opt) => {
            const selected = (s.drivetrainSystemKind ?? "derailleur") === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => selectSystemKind(opt.id)}
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

        {isGearHub ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ToothCountField
                id="front-chainring-teeth"
                label="Chainring teeth"
                value={frontInput}
                onChange={commitFront}
              />
              <RatioField id="hub-up-ratio" label="Hub gear up ratio" value={hubUpInput} onChange={commitHubUp} />
              <RatioField id="hub-down-ratio" label="Hub gear down ratio" value={hubDownInput} onChange={commitHubDown} />
            </div>
            <p className="mt-3 text-xs font-body text-muted-foreground">
              Enter the up (highest) and down (lowest) internal gear ratios from your gear hub&apos;s datasheet — e.g. a
              Shimano Alfine 8 is 1.615 (up) / 0.527 (down).
            </p>
          </>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ToothCountField
              id="front-chainring-teeth"
              label="Front chainring teeth"
              value={frontInput}
              onChange={commitFront}
            />
            <ToothCountField
              id="smallest-rear-teeth"
              label="Smallest rear sprocket teeth"
              value={smallestInput}
              onChange={commitSmallest}
            />
            <ToothCountField
              id="largest-rear-teeth"
              label="Largest rear sprocket teeth"
              value={largestInput}
              onChange={commitLargest}
            />
          </div>
        )}
        {!validation.isValid && (frontInput || smallestInput || largestInput) && (
          <div className="mt-4 space-y-2">
            {validation.messages.map((m) => (
              <InlineError key={m}>{m}</InlineError>
            ))}
          </div>
        )}
      </div>

      <div className="mb-8">
        <SpeedCadenceGraph
          frontTeeth={parseTeeth(frontInput)}
          smallestRearTeeth={parseTeeth(smallestInput)}
          largestRearTeeth={parseTeeth(largestInput)}
          wheelCircumferenceMetres={s.tyreCircumferenceMm ? s.tyreCircumferenceMm / 1000 : null}
          speedLimitKmh={s.speedLimitKmh}
        />
      </div>

      <ClimbingAbilityPanel
        motorId={s.motorId}
        motorType={motor ? motorType : null}
        motorMaxTorqueNm={motor?.torque_nm ?? null}
        frontChainringTeeth={parseTeeth(frontInput)}
        largestRearTeeth={parseTeeth(largestInput)}
        wheelRadiusMetres={wheelRadiusMetres}
        drivetrainEfficiency={motor?.drivetrain_efficiency ?? null}
        riderWeightKg={s.climbingRiderWeightKg}
        onRiderWeightChange={(kg) => s.setField("climbingRiderWeightKg", kg)}
        assistanceModeKey={s.climbingAssistanceModeKey}
        onAssistanceModeChange={(key) => s.setField("climbingAssistanceModeKey", key)}
        pedalEffortKey={s.climbingPedalEffortKey}
        onPedalEffortChange={(key: PedalEffortKey) => s.setField("climbingPedalEffortKey", key)}
      />
    </div>
  )
}

function RatioField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (raw: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-sans font-semibold text-graphite">
        {label}
      </label>
      <input
        id={id}
        type="number"
        min={0}
        step={0.001}
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={id === "hub-down-ratio" ? "e.g. 0.8" : "e.g. 1.615"}
        className="w-full border border-border px-3 py-2 text-sm font-body font-semibold tabular-nums focus:border-primary outline-none"
      />
    </div>
  )
}

function ToothCountField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (raw: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-sans font-semibold text-graphite">
        {label}
      </label>
      <input
        id={id}
        type="number"
        min={1}
        step={1}
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. 34"
        className="w-full border border-border px-3 py-2 text-sm font-body font-semibold tabular-nums focus:border-primary outline-none"
      />
    </div>
  )
}
