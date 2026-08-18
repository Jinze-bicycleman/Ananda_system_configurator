"use client"

import { useAnandaStore } from "@/lib/ananda-store"
import {
  chainringTeethOptions, rearSprocketTeethOptions,
  cadenceRpmOptions, aMotors, motorTorqueFallback
} from "@/lib/ananda-data"
import { StepHeader, SectionLabel } from "./ui-primitives"
import { cn } from "@/lib/utils"
import { AlertTriangle, CheckCircle2, Info } from "lucide-react"

// ─── Drivetrain calculations ────────────────────────────────────────────────

function calcDrivetrain(
  chainringT: number,
  rearT: number,
  cadenceRpm: number,
  tyreCircumferenceMm: number | null,
  motorId: string | null,
  driveType: "mid" | "hub" | null,
  motors: typeof aMotors
) {
  const gearRatio = chainringT / rearT
  const wheelCircumM = (tyreCircumferenceMm ?? 2200) / 1000
  const speedKmh = (cadenceRpm * gearRatio * wheelCircumM * 60) / 1000
  const motor = motors.find(m => m.id === motorId)
  const motorTorque = motor?.torqueNm ?? (motorId ? (motorTorqueFallback[motorId] ?? 80) : 80)
  const onWheelTorque = driveType === "mid"
    ? motorTorque / gearRatio
    : motorTorque
  return {
    gearRatio: Math.round(gearRatio * 100) / 100,
    speedKmh: Math.round(speedKmh * 10) / 10,
    onWheelTorque: Math.round(onWheelTorque * 10) / 10,
  }
}

// ─── Visual Drivetrain Diagram ───────────────────────────────────────────────

function DrivetrainDiagramSVG({
  chainringT, rearT, drivetrainType
}: {
  chainringT: number; rearT: number; drivetrainType: "chain" | "belt" | null
}) {
  // Scale circles by tooth count (visual only, not exact pitch)
  const BASE = 28
  const frontR = BASE + (chainringT - 30) * 0.55
  const rearR  = BASE + (rearT - 10) * 0.38
  const clampedFrontR = Math.min(Math.max(frontR, 28), 68)
  const clampedRearR  = Math.min(Math.max(rearR, 14), 56)

  const cx1 = 110  // rear sprocket center
  const cy  = 120
  const cx2 = 390  // chainring center

  // Chain tangent points (simplified horizontal tangent)
  const topY  = cy - Math.min(clampedRearR, clampedFrontR) * 0.92
  const botY  = cy + Math.min(clampedRearR, clampedFrontR) * 0.92

  const isBelt = drivetrainType === "belt"
  const chainColor = isBelt ? "#B4D600" : "#374151"
  const chainLabel = isBelt ? "Belt Drive" : "Chain Drive"

  // Teeth marks around sprockets
  function teethPath(cx: number, cy: number, r: number, teeth: number) {
    const pts: string[] = []
    for (let i = 0; i < teeth; i++) {
      const a  = (2 * Math.PI * i) / teeth - Math.PI / 2
      const a1 = (2 * Math.PI * (i + 0.3)) / teeth - Math.PI / 2
      const a2 = (2 * Math.PI * (i + 0.7)) / teeth - Math.PI / 2
      const inner = r - 4
      const outer = r + 4
      pts.push(`M ${cx + inner * Math.cos(a)} ${cy + inner * Math.sin(a)}`)
      pts.push(`L ${cx + outer * Math.cos(a1)} ${cy + outer * Math.sin(a1)}`)
      pts.push(`L ${cx + outer * Math.cos(a2)} ${cy + outer * Math.sin(a2)}`)
      pts.push(`L ${cx + inner * Math.cos(a)} ${cy + inner * Math.sin(a)}`)
    }
    return pts.join(" ")
  }

  const displayTeethFront = Math.min(chainringT, 24)
  const displayTeethRear  = Math.min(rearT, 18)

  return (
    <svg viewBox="0 0 500 240" className="w-full" style={{ maxHeight: 240 }}>
      <defs>
        <filter id="shadow-dt" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="1" dy="1" stdDeviation="2" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* Background */}
      <rect width="500" height="240" fill="#fafafa" />

      {/* Chain / belt lines */}
      <line x1={cx1 + clampedRearR} y1={topY} x2={cx2 - clampedFrontR} y2={topY}
        stroke={chainColor} strokeWidth={isBelt ? 6 : 2.5}
        strokeDasharray={isBelt ? "none" : "6 3"} strokeLinecap="round" opacity="0.85" />
      <line x1={cx1 + clampedRearR} y1={botY} x2={cx2 - clampedFrontR} y2={botY}
        stroke={chainColor} strokeWidth={isBelt ? 6 : 2.5}
        strokeDasharray={isBelt ? "none" : "6 3"} strokeLinecap="round" opacity="0.85" />

      {/* Chain/belt centre label */}
      <text x={(cx1 + cx2) / 2} y={topY - 10}
        textAnchor="middle" fill={chainColor} fontSize={10}
        fontFamily="Barlow Condensed, sans-serif" fontWeight="700" style={{ textTransform: "uppercase" }}>
        {chainLabel}
      </text>

      {/* ─── Rear Sprocket (left) ─── */}
      <circle cx={cx1} cy={cy} r={clampedRearR + 5} fill="#f0fdf4" stroke="#d1fae5" strokeWidth={1} filter="url(#shadow-dt)" />
      <circle cx={cx1} cy={cy} r={clampedRearR} fill="white" stroke="#008F36" strokeWidth={2} />
      <path d={teethPath(cx1, cy, clampedRearR, displayTeethRear)} fill="#008F36" opacity="0.7" />
      <circle cx={cx1} cy={cy} r={clampedRearR * 0.32} fill="#008F36" opacity="0.15" />
      <circle cx={cx1} cy={cy} r={5} fill="#008F36" />

      {/* Rear labels */}
      <text x={cx1} y={cy + clampedRearR + 20}
        textAnchor="middle" fill="#008F36" fontSize={11}
        fontFamily="Barlow Condensed, sans-serif" fontWeight="800">
        REAR SPROCKET
      </text>
      <text x={cx1} y={cy + clampedRearR + 33}
        textAnchor="middle" fill="#374151" fontSize={16}
        fontFamily="Barlow Condensed, sans-serif" fontWeight="900">
        {rearT}T
      </text>

      {/* ─── Front Chainring (right) ─── */}
      <circle cx={cx2} cy={cy} r={clampedFrontR + 5} fill="#f0fdf4" stroke="#d1fae5" strokeWidth={1} filter="url(#shadow-dt)" />
      <circle cx={cx2} cy={cy} r={clampedFrontR} fill="white" stroke="#008F36" strokeWidth={2} />
      <path d={teethPath(cx2, cy, clampedFrontR, displayTeethFront)} fill="#008F36" opacity="0.7" />
      <circle cx={cx2} cy={cy} r={clampedFrontR * 0.32} fill="#008F36" opacity="0.15" />
      <circle cx={cx2} cy={cy} r={7} fill="#008F36" />

      {/* Chainring labels */}
      <text x={cx2} y={cy + clampedFrontR + 20}
        textAnchor="middle" fill="#008F36" fontSize={11}
        fontFamily="Barlow Condensed, sans-serif" fontWeight="800">
        {isBelt ? "BELT SPROCKET" : "CHAINRING"}
      </text>
      <text x={cx2} y={cy + clampedFrontR + 33}
        textAnchor="middle" fill="#374151" fontSize={16}
        fontFamily="Barlow Condensed, sans-serif" fontWeight="900">
        {chainringT}T
      </text>

      {/* Arrow showing direction */}
      <text x={(cx1 + cx2) / 2} y={cy + 6}
        textAnchor="middle" fill="#9ca3af" fontSize={18} fontFamily="sans-serif">
        →
      </text>
    </svg>
  )
}

// ─── Tooth selector chips ────────────────────────────────────────────────────

function ToothChips({
  options, selected, onSelect
}: {
  options: number[]; selected: number; onSelect: (t: number) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(t => (
        <button
          key={t}
          onClick={() => onSelect(t)}
          className={cn(
            "px-2.5 py-1 text-xs font-sans font-bold border transition-all",
            selected === t
              ? "bg-primary text-white border-primary"
              : "border-border text-foreground hover:border-primary/50"
          )}
        >
          {t}T
        </button>
      ))}
    </div>
  )
}

// ─── Info value card ─────────────────────────────────────────────────────────

function InfoValue({
  label, value, unit, warning
}: {
  label: string; value: string; unit?: string; warning?: boolean
}) {
  return (
    <div className={cn(
      "border p-3",
      warning ? "border-warning/40 bg-warning/5" : "border-border bg-white"
    )}>
      <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <div className="flex items-end gap-1">
        <span className={cn(
          "text-2xl font-sans font-black",
          warning ? "text-warning" : "text-graphite"
        )}>{value}</span>
        {unit && <span className="text-sm font-sans font-bold text-primary mb-0.5">{unit}</span>}
      </div>
    </div>
  )
}

const DRIVETRAIN_TYPES = [
  {
    id: "chain" as const,
    title: "Chain Drive",
    description: "Classic steel roller-link system. Pairs with derailleurs and standard cassettes.",
    pros: ["Affordable", "Efficient power transfer", "Widely available parts", "Easy to repair"],
    cons: ["Regular cleaning needed", "Shorter lifespan than belt", "Lubricant attracts dirt"],
  },
  {
    id: "belt" as const,
    title: "Belt Drive",
    description: "Carbon-fibre reinforced rubber belt. Typically paired with internal gear hubs.",
    pros: ["Low maintenance", "No oil required", "Rust-free", "Quiet and clean"],
    cons: ["Higher cost", "Requires frame opening", "Limited to internal hubs"],
  },
]

export function Step6DrivetrainSelection() {
  const s = useAnandaStore()

  const { gearRatio, speedKmh, onWheelTorque } = calcDrivetrain(
    s.chainringTeeth,
    s.rearSprocketTeeth,
    s.cadenceRpm,
    s.tyreCircumferenceMm,
    s.motorId,
    s.driveType,
    aMotors
  )

  const speedExceedsLimit = s.speedLimitKmh != null && speedKmh > s.speedLimitKmh
  const usesDefaultCircumference = s.tyreCircumferenceMm == null
  const isMid = s.driveType === "mid"

  const handleChainring = (t: number) => {
    s.setField("chainringTeeth", t)
  }
  const handleRear = (t: number) => {
    s.setField("rearSprocketTeeth", t)
  }
  const handleCadence = (rpm: number) => {
    s.setField("cadenceRpm", rpm)
  }

  return (
    <div>
      <StepHeader
        step={6}
        title="Drivetrain Selection"
        subtitle="Select chain or belt drive type and configure chainring, rear sprocket and cadence. Outputs update live."
      />

      {/* ─── Drive type cards ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {DRIVETRAIN_TYPES.map(dt => {
          const selected = s.drivetrainType === dt.id
          return (
            <div
              key={dt.id}
              onClick={() => s.setField("drivetrainType", dt.id)}
              className={cn(
                "relative cursor-pointer border-2 overflow-hidden transition-all",
                selected ? "border-primary shadow-lg shadow-primary/10" : "border-border hover:border-primary/40"
              )}
            >
              <div className={cn("h-1.5 w-full", selected ? "bg-primary" : "bg-border")} />
              {selected && (
                <div className="absolute top-3 right-3">
                  <div className="bg-primary rounded-full p-1"><CheckCircle2 className="w-4 h-4 text-white" /></div>
                </div>
              )}
              <div className="p-6">
                <h3 className={cn("text-2xl font-sans font-black uppercase mb-2", selected ? "text-primary" : "text-graphite")}>
                  {dt.title}
                </h3>
                <p className="text-sm font-body text-muted-foreground leading-relaxed mb-4">{dt.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-primary mb-1.5">Advantages</p>
                    <ul className="space-y-1">
                      {dt.pros.map(p => (
                        <li key={p} className="flex items-start gap-1.5 text-xs font-body text-foreground">
                          <span className="text-primary font-bold flex-shrink-0">+</span>{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Considerations</p>
                    <ul className="space-y-1">
                      {dt.cons.map(c => (
                        <li key={c} className="flex items-start gap-1.5 text-xs font-body text-muted-foreground">
                          <span className="flex-shrink-0">–</span>{c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ─── Mid-drive chain wear warning ─── */}
      {isMid && s.drivetrainType === "chain" && (
        <div className="flex items-start gap-2.5 bg-warning/10 border border-warning/30 px-4 py-3 mb-6">
          <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
          <p className="text-sm font-body text-warning-foreground">
            Mid-drive chain drive: High torque output accelerates wear on chain, sprockets and cassette. Recommend premium drivetrain components and regular service intervals.
          </p>
        </div>
      )}

      {/* ─── Belt frame warning ─── */}
      {s.drivetrainType === "belt" && (
        <div className="flex items-start gap-2.5 bg-warning/10 border border-warning/30 px-4 py-3 mb-6">
          <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
          <p className="text-sm font-body text-warning-foreground">
            Belt drive requires a frame opening in the rear triangle. Verify frame compatibility with the bike manufacturer.
          </p>
        </div>
      )}

      {/* ─── Visual drivetrain mapping diagram ─── */}
      <div className="border border-border bg-white p-4 mb-6">
        <p className="text-[11px] font-sans font-bold uppercase tracking-wider text-graphite-light mb-4">
          Drivetrain Mapping Diagram
        </p>
        <DrivetrainDiagramSVG
          chainringT={s.chainringTeeth}
          rearT={s.rearSprocketTeeth}
          drivetrainType={s.drivetrainType}
        />
      </div>

      {/* ─── Selectors ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div>
          <SectionLabel>Rear Sprocket Size</SectionLabel>
          <ToothChips
            options={rearSprocketTeethOptions}
            selected={s.rearSprocketTeeth}
            onSelect={handleRear}
          />
        </div>
        <div>
          <SectionLabel>{s.drivetrainType === "belt" ? "Front Sprocket Size" : "Chainring Size"}</SectionLabel>
          <ToothChips
            options={chainringTeethOptions}
            selected={s.chainringTeeth}
            onSelect={handleChainring}
          />
        </div>
        <div>
          <SectionLabel>Cadence</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {cadenceRpmOptions.map(rpm => (
              <button
                key={rpm}
                onClick={() => handleCadence(rpm)}
                className={cn(
                  "px-3 py-1 text-xs font-sans font-bold border transition-all",
                  s.cadenceRpm === rpm
                    ? "bg-primary text-white border-primary"
                    : "border-border text-foreground hover:border-primary/50"
                )}
              >
                {rpm} rpm
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Drivetrain information box ─── */}
      <div className="border border-border bg-white overflow-hidden mb-6">
        <div className="h-1 bg-primary" />
        <div className="p-5">
          <p className="text-[11px] font-sans font-bold uppercase tracking-wider text-primary mb-4">
            Drivetrain Output Analysis
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            <InfoValue label="Chainring" value={`${s.chainringTeeth}T`} />
            <InfoValue label="Rear Sprocket" value={`${s.rearSprocketTeeth}T`} />
            <InfoValue label="Gear Ratio" value={gearRatio.toFixed(2)} unit=":1" />
            <InfoValue label="Cadence" value={s.cadenceRpm.toString()} unit="rpm" />
            <InfoValue
              label="Est. Max Speed"
              value={speedKmh.toFixed(1)}
              unit="km/h"
              warning={speedExceedsLimit}
            />
            <InfoValue label="On-Wheel Torque" value={onWheelTorque.toFixed(1)} unit="Nm" />
          </div>

          {usesDefaultCircumference && <p className="mb-3 text-xs text-muted-foreground">Using the default tyre circumference of 2200 mm. Enter measured circumference in Project Context for a more accurate estimate.</p>}

          {/* Drive type behaviour note */}
          <div className="flex items-start gap-2 bg-surface border-l-2 border-primary px-4 py-3">
            <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs font-body text-muted-foreground">
              {isMid
                ? "Mid-drive motor torque passes through the drivetrain. Chainring and sprocket selection directly affect speed range, climbing torque and drivetrain load."
                : "Hub motor torque is delivered directly at the wheel. Chainring and sprocket selection mainly affect rider cadence and pedalling comfort."}
            </p>
          </div>

          {/* Speed limit warning */}
          {speedExceedsLimit && (
            <div className="mt-3 flex items-start gap-2 bg-warning/10 border border-warning/30 px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
              <p className="text-sm font-body text-warning-foreground">
                Estimated drivetrain speed exceeds the selected speed limit ({s.speedLimitKmh} km/h). Final assistance cut-off must follow the selected regional regulation.
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
