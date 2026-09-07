"use client"

import { classifyClimbSeverity } from "@/lib/ananda-climbing"

const SCALE_MAX = 30
const SEGMENTS = [
  { from: 0, to: 8, label: "Easy" },
  { from: 8, to: 15, label: "Moderate" },
  { from: 15, to: 25, label: "Steep" },
  { from: 25, to: 30, label: "Extreme" },
] as const
const BOUNDARIES = [0, 8, 15, 25, 30]

/**
 * Continuous 0-30%+ climb-severity scale with an always-visible text label
 * per band (never relies on color alone) and a "YOU ARE HERE" marker at the
 * calculated grade. Grades above 30% keep the marker pinned to the right
 * edge while the numeric result elsewhere still shows the real value.
 */
export function ClimbingSeverityScale({ gradePercent }: { gradePercent: number }) {
  const clamped = Math.min(Math.max(gradePercent, 0), SCALE_MAX)
  const markerPosition = (clamped / SCALE_MAX) * 100
  const activeLevel = classifyClimbSeverity(gradePercent)

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[11px] font-sans font-bold uppercase tracking-[0.15em] text-muted-foreground">Climb severity</p>

      <div className="relative pt-6">
        <div
          className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
          style={{ left: `${markerPosition}%` }}
          aria-hidden="true"
        >
          <span className="whitespace-nowrap text-[10px] font-sans font-bold uppercase tracking-wide text-primary">
            You are here
          </span>
          <span className="h-2.5 w-px bg-primary" />
        </div>

        <div className="flex h-3 w-full overflow-hidden border border-border" aria-hidden="true">
          {SEGMENTS.map((seg, i) => (
            <div
              key={seg.label}
              className="h-full border-r border-background last:border-r-0"
              style={{
                width: `${((seg.to - seg.from) / SCALE_MAX) * 100}%`,
                backgroundColor: `color-mix(in oklch, var(--primary) ${18 + i * 22}%, var(--muted) ${82 - i * 22}%)`,
              }}
            />
          ))}
        </div>

        <div className="relative mt-1 flex" aria-hidden="true">
          {SEGMENTS.map((seg) => (
            <span
              key={seg.label}
              className="min-w-0 flex-shrink-0 truncate text-center text-[11px] font-sans font-semibold text-graphite"
              style={{ width: `${((seg.to - seg.from) / SCALE_MAX) * 100}%` }}
            >
              {seg.label}
            </span>
          ))}
        </div>

        <div className="relative mt-1 h-4 text-[11px] font-body tabular-nums text-muted-foreground" aria-hidden="true">
          {BOUNDARIES.map((b, i) => (
            <span
              key={b}
              className="absolute"
              style={{
                left: `${(b / SCALE_MAX) * 100}%`,
                transform: i === 0 ? "translateX(0)" : i === BOUNDARIES.length - 1 ? "translateX(-100%)" : "translateX(-50%)",
              }}
            >
              {b >= SCALE_MAX ? "30%+" : `${b}%`}
            </span>
          ))}
        </div>
      </div>

      <p className="sr-only">
        {`The current climb rates as ${activeLevel} on the severity scale, at ${gradePercent.toFixed(1)} percent grade against a 0 to 30 percent and above scale.`}
      </p>
    </div>
  )
}
