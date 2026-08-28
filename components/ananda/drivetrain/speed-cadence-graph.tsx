"use client"

import { useMemo } from "react"
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { SectionLabel } from "../ui-primitives"
import { speedAtCadenceKmh } from "@/lib/ananda-climbing"

const CADENCES = Array.from({ length: 17 }, (_, i) => 40 + i * 5) // 40..120 rpm

/**
 * Two-line Speed vs. Cadence chart driven directly by the three tooth-count
 * inputs (front chainring, smallest/largest rear sprocket). One line for
 * the easiest gear (largest rear sprocket), one for the hardest (smallest
 * rear sprocket) — matching the min/max ratio pattern the drivetrain used
 * to render, but computed from teeth instead of a branded component catalog.
 */
export function SpeedCadenceGraph({
  frontTeeth,
  smallestRearTeeth,
  largestRearTeeth,
  wheelCircumferenceMetres,
  speedLimitKmh,
}: {
  frontTeeth: number | null
  smallestRearTeeth: number | null
  largestRearTeeth: number | null
  wheelCircumferenceMetres: number | null
  speedLimitKmh: number | null
}) {
  const ready =
    frontTeeth != null &&
    frontTeeth > 0 &&
    smallestRearTeeth != null &&
    smallestRearTeeth > 0 &&
    largestRearTeeth != null &&
    largestRearTeeth > 0 &&
    wheelCircumferenceMetres != null &&
    wheelCircumferenceMetres > 0

  const chartData = useMemo(() => {
    if (!ready) return []
    return CADENCES.map((cadence) => ({
      cadence,
      "Hardest gear": Math.round(speedAtCadenceKmh(cadence, frontTeeth as number, smallestRearTeeth as number, wheelCircumferenceMetres as number) * 10) / 10,
      "Easiest gear": Math.round(speedAtCadenceKmh(cadence, frontTeeth as number, largestRearTeeth as number, wheelCircumferenceMetres as number) * 10) / 10,
    }))
  }, [ready, frontTeeth, smallestRearTeeth, largestRearTeeth, wheelCircumferenceMetres])

  if (!ready) {
    return (
      <div className="flex flex-col gap-2">
        <SectionLabel>Speed vs. Cadence</SectionLabel>
        <div className="flex h-[220px] items-center justify-center border border-dashed border-border bg-surface px-6 text-center">
          <p className="max-w-xs text-sm font-body text-muted-foreground">
            Enter the front chainring and rear sprocket tooth counts above to plot rider speed against pedalling cadence.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <SectionLabel>Speed vs. Cadence</SectionLabel>
      <div className="h-[260px] w-full border border-border bg-white p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="cadence"
              tick={{ fontSize: 11, fontFamily: "var(--font-sans)" }}
              label={{ value: "Cadence (rpm)", position: "insideBottom", offset: -2, fontSize: 11 }}
            />
            <YAxis
              tick={{ fontSize: 11, fontFamily: "var(--font-sans)" }}
              label={{ value: "Speed (km/h)", angle: -90, position: "insideLeft", fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{ fontSize: 12, fontFamily: "var(--font-sans)" }}
              formatter={(value: number) => `${value} km/h`}
            />
            <Legend wrapperStyle={{ fontSize: 12, fontFamily: "var(--font-sans)" }} />
            {speedLimitKmh != null && (
              <ReferenceLine
                y={speedLimitKmh}
                stroke="var(--warning)"
                strokeDasharray="4 4"
                label={{ value: `${speedLimitKmh} km/h assist limit`, position: "insideTopRight", fontSize: 11, fill: "var(--warning)" }}
              />
            )}
            <Line type="monotone" dataKey="Easiest gear" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Hardest gear" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
