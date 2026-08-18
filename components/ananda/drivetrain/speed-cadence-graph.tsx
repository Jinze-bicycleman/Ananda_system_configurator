"use client"

import { useMemo, useState } from "react"
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { SectionLabel } from "../ui-primitives"
import { speedAtCadence, type DrivetrainPerformanceRow, type EnvioloBoundary } from "@/lib/ananda-drivetrain"

const GEAR_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "#374151", "#9333ea"]

export function SpeedCadenceGraph({
  gearRows,
  enviolo,
  speedLimitKmh,
}: {
  gearRows: DrivetrainPerformanceRow[] | null
  enviolo: { min: EnvioloBoundary; max: EnvioloBoundary } | null
  speedLimitKmh: number | null
}) {
  const [hidden, setHidden] = useState<Set<string>>(new Set())

  const cadences = useMemo(() => Array.from({ length: 17 }, (_, i) => 40 + i * 5), [])

  const chartData = useMemo(() => {
    return cadences.map((cadence) => {
      const row: Record<string, number> = { cadence }
      if (gearRows) {
        for (const g of gearRows) {
          row[`Gear ${g.gear_number}`] = Math.round(speedAtCadence(cadence, g.development_m) * 10) / 10
        }
      }
      if (enviolo) {
        row["Minimum ratio"] = Math.round(speedAtCadence(cadence, enviolo.min.developmentM) * 10) / 10
        row["Maximum ratio"] = Math.round(speedAtCadence(cadence, enviolo.max.developmentM) * 10) / 10
      }
      return row
    })
  }, [cadences, gearRows, enviolo])

  const seriesKeys = gearRows ? gearRows.map((g) => `Gear ${g.gear_number}`) : enviolo ? ["Minimum ratio", "Maximum ratio"] : []

  if (!seriesKeys.length) return null

  return (
    <div className="mb-8">
      <SectionLabel>Speed vs. Cadence</SectionLabel>
      <div className="border border-border bg-white p-4">
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="cadence"
              type="number"
              domain={[40, 120]}
              label={{ value: "Cadence (rpm)", position: "insideBottom", offset: -2, fontSize: 11 }}
              tick={{ fontSize: 11 }}
            />
            <YAxis label={{ value: "Speed (km/h)", angle: -90, position: "insideLeft", fontSize: 11 }} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4 }} />
            <Legend
              onClick={(e) => {
                const key = String(e.dataKey)
                setHidden((prev) => {
                  const next = new Set(prev)
                  if (next.has(key)) next.delete(key)
                  else next.add(key)
                  return next
                })
              }}
              wrapperStyle={{ fontSize: 11, cursor: "pointer" }}
            />
            <ReferenceArea x1={60} x2={90} fill="var(--primary)" fillOpacity={0.06} />
            {enviolo && (
              <ReferenceArea
                y1={0}
                y2={1000}
                x1={40}
                x2={120}
                ifOverflow="hidden"
                fill="var(--chart-2)"
                fillOpacity={0.05}
              />
            )}
            {speedLimitKmh != null && (
              <ReferenceLine
                y={speedLimitKmh}
                stroke="var(--warning)"
                strokeDasharray="5 3"
                label={{ value: `Assistance cutoff ${speedLimitKmh} km/h`, position: "insideTopRight", fontSize: 10, fill: "var(--warning-foreground)" }}
              />
            )}
            {seriesKeys.map((key, i) => (
              <Line
                key={key}
                dataKey={key}
                type="monotone"
                stroke={GEAR_COLORS[i % GEAR_COLORS.length]}
                strokeWidth={2}
                dot={false}
                hide={hidden.has(key)}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <p className="mt-2 text-[11px] font-body text-muted-foreground">
          Shaded band highlights the 60–90 rpm cadence zone. Click legend entries to show or hide individual lines.
          {enviolo && " The continuously variable hub shows minimum and maximum ratio boundaries rather than fixed gear lines."}
        </p>
      </div>
    </div>
  )
}
