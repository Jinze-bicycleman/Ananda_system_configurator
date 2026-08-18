"use client"

import { useState } from "react"
import { Info, Loader2 } from "lucide-react"
import { useAnandaStore } from "@/lib/ananda-store"
import { useMotors, useDisplays, useBatteries } from "@/lib/ananda-packages"
import { aRemotes } from "@/lib/ananda-data"
import { componentPoints, calloutAnchors, CABLE_SPECS, type ComponentKey } from "@/lib/ananda-system-diagram"

const DIAGRAM_VIEWBOX = "0 0 1000 610"
const IMAGE_X = 120
const IMAGE_Y = 52
const IMAGE_W = 760
const IMAGE_H = 506
const LEADER_GAP = 10

type Callout = { title: string; lines: string[] }

/**
 * Reusable, self-contained system-diagram overlay for the M7100 mid-drive
 * e-bike. Reads the current configuration from the Ananda store and Supabase
 * (via the existing motor/display/battery hooks) so callouts show real
 * selected models when available, falling back to M7100 demonstration
 * values otherwise. All positions are fixed in the SVG coordinate system —
 * nothing here is draggable.
 */
export function SystemDiagram() {
  const s = useAnandaStore()
  const { motors, isLoading: motorsLoading, error: motorsError } = useMotors()
  const { displays, isLoading: displaysLoading, error: displaysError } = useDisplays()
  const { batteries, isLoading: batteriesLoading, error: batteriesError } = useBatteries()

  const [selectedId, setSelectedId] = useState<string | null>(null)

  const isLoading = motorsLoading || displaysLoading || batteriesLoading
  const hasError = Boolean(motorsError || displaysError || batteriesError)

  const motor = motors.find((m) => m.id === s.motorId) ?? null
  const display = displays.find((d) => d.id === s.displayId) ?? null
  const battery = batteries.find((b) => b.id === s.batteryId) ?? null
  const remote = aRemotes.find((r) => r.id === s.remoteId) ?? null
  const accessoryCount = s.accessoryIds.length
  const speedSensorSkipped = s.skippedItems.includes("speedSensorId")

  // Every callout falls back to a fixed M7100 demonstration value, so an
  // absent selection can never render as undefined in the diagram.
  const callouts: Record<ComponentKey, Callout> = {
    remote: {
      title: "Remote",
      lines: [remote ? `${remote.name}` : "R3 · 3-button"],
    },
    display: {
      title: "Display",
      lines: [display ? `${display.model} · ${display.connection_type ?? "5-pin"}` : "HMI-D18 · 5-pin"],
    },
    accessory: {
      title: "Accessories",
      lines: [
        accessoryCount > 0
          ? `${accessoryCount} accessor${accessoryCount === 1 ? "y" : "ies"} · ACC-H6`
          : "ACC-H6 · 6-pin",
      ],
    },
    battery: {
      title: "Battery",
      lines: battery
        ? [battery.model, `${battery.voltage_v} V / ${battery.capacity_wh ?? "—"} Wh`]
        : ["Integrated", "48 V / 720 Wh"],
    },
    speedSensor: {
      title: "Speed sensor",
      lines: [speedSensorSkipped ? "Not needed" : s.speedSensorId ? `${s.speedSensorId} · SM-3P` : "SS-02 · SM-3P"],
    },
    motor: {
      title: "Motor unit",
      lines: [motor ? `${motor.model} · ${motor.motor_type === "hub" ? "hub" : "mid-drive"}` : "M7100 · mid-drive"],
    },
  }

  const selectedSpec = CABLE_SPECS.find((c) => c.id === selectedId) ?? null
  const selectedLength = selectedSpec ? s.cableLengths[selectedSpec.connection] ?? selectedSpec.defaultLength : null

  return (
    <div>
      <div className="border border-border bg-card p-4 mb-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] font-sans font-bold uppercase tracking-wider text-graphite-light">
            System Architecture — Mid-Drive · {s.voltagePlatform ?? 48}V
          </p>
          {isLoading && (
            <span className="flex items-center gap-1.5 text-[10px] font-body text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
              Loading configuration data…
            </span>
          )}
        </div>

        {hasError && (
          <div className="mb-3 flex items-start gap-2 bg-muted/60 border border-border px-3 py-2">
            <Info className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-[11px] font-body text-muted-foreground">
              Some component details could not be loaded. Showing default demonstration data below.
            </p>
          </div>
        )}

        <svg
          viewBox={DIAGRAM_VIEWBOX}
          role="img"
          aria-labelledby="system-diagram-title system-diagram-desc"
          className="w-full"
          style={{ minHeight: 260 }}
        >
          <title id="system-diagram-title">Ananda M7100 mid-drive e-bike system wiring diagram</title>
          <desc id="system-diagram-desc">
            Diagram of the M7100 mid-drive e-bike showing the battery, motor unit, display, remote, speed sensor and
            accessory harness component locations, with the five cable connections between them.
          </desc>

          <rect x="0" y="0" width="1000" height="610" fill="var(--card)" />

          <image
            href="/images/ananda-m7100-bicycle.png"
            x={IMAGE_X}
            y={IMAGE_Y}
            width={IMAGE_W}
            height={IMAGE_H}
            preserveAspectRatio="xMidYMid meet"
          />

          {/* Cable paths */}
          {CABLE_SPECS.map((cable) => {
            const isSelected = selectedId === cable.id
            const isDimmed = selectedId !== null && !isSelected
            return (
              <path
                key={cable.id}
                d={cable.path}
                fill="none"
                stroke={cable.color}
                strokeWidth={isSelected ? 4.5 : 2.5}
                strokeDasharray={cable.dashArray}
                strokeLinecap="round"
                opacity={isDimmed ? 0.25 : 1}
                className="cursor-pointer transition-all"
                onClick={() => setSelectedId(isSelected ? null : cable.id)}
                aria-hidden="true"
              />
            )
          })}

          {/* Leader lines + callout labels */}
          {(Object.keys(componentPoints) as ComponentKey[]).map((key) => {
            const point = componentPoints[key]
            const anchor = calloutAnchors[key]
            const callout = callouts[key]
            const x2 = anchor.anchor === "start" ? anchor.x - LEADER_GAP : anchor.x + LEADER_GAP
            return (
              <g key={key}>
                <line x1={point.x} y1={point.y} x2={x2} y2={anchor.y - 4} stroke="var(--border-strong)" strokeWidth={1} />
                <text
                  x={anchor.x}
                  y={anchor.y}
                  textAnchor={anchor.anchor}
                  fontSize={9}
                  fontWeight={700}
                  fill="var(--foreground)"
                  fontFamily="Barlow Condensed, sans-serif"
                  style={{ textTransform: "uppercase" }}
                >
                  {callout.title}
                </text>
                {callout.lines.map((line, i) => (
                  <text
                    key={i}
                    x={anchor.x}
                    y={anchor.y + 12 * (i + 1)}
                    textAnchor={anchor.anchor}
                    fontSize={7.5}
                    fill="var(--muted-foreground)"
                    fontFamily="Barlow, sans-serif"
                  >
                    {line}
                  </text>
                ))}
              </g>
            )
          })}

          {/* Component point markers, drawn last so they sit crisply on top */}
          {(Object.keys(componentPoints) as ComponentKey[]).map((key) => {
            const point = componentPoints[key]
            return <circle key={key} cx={point.x} cy={point.y} r={5.5} fill="white" stroke="var(--foreground)" strokeWidth={1.5} />
          })}
        </svg>

        <div className="mt-3 border-t border-border pt-3">
          <p className="text-xs font-body text-muted-foreground" aria-live="polite">
            {selectedSpec && selectedLength !== null
              ? `${selectedSpec.connection} · ${selectedLength.toFixed(1)} m`
              : "Select a connection below to view its details."}
          </p>
        </div>
      </div>

      <CableSpecTable selectedId={selectedId} onSelect={setSelectedId} />
    </div>
  )
}

function CableSpecTable({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string | null) => void }) {
  const s = useAnandaStore()

  return (
    <div className="mb-6">
      <p className="mb-2 text-[11px] font-sans font-bold uppercase tracking-wider text-graphite-light">Cable Specification</p>
      <p className="mb-3 text-xs font-body text-muted-foreground">
        Edit cable lengths to match your frame layout. These values carry through to the final configuration report.
      </p>
      <div className="overflow-x-auto border border-border">
        <table className="w-full min-w-[640px] text-xs border-collapse">
          <caption className="sr-only">Cable connections, connectors and editable lengths for the system diagram</caption>
          <thead>
            <tr className="bg-graphite text-white">
              {["Connection", "Connector", "Pins", "Cable type", "Length (m)"].map((h) => (
                <th key={h} scope="col" className="px-3 py-2 text-left text-[11px] font-sans font-bold uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CABLE_SPECS.map((cable, i) => {
              const isSelected = selectedId === cable.id
              const length = s.cableLengths[cable.connection] ?? cable.defaultLength
              const inputId = `cable-length-${cable.id}`
              return (
                <tr
                  key={cable.id}
                  onClick={() => onSelect(isSelected ? null : cable.id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? "bg-primary/10" : i % 2 === 0 ? "bg-card" : "bg-surface"
                  }`}
                >
                  <th scope="row" className="px-3 py-2 text-left font-sans font-semibold text-foreground">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelect(isSelected ? null : cable.id)
                      }}
                      aria-pressed={isSelected}
                      className="flex items-center gap-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    >
                      <span
                        aria-hidden="true"
                        className="inline-block h-3 w-3 flex-shrink-0 rounded-full border border-border-strong"
                        style={{ backgroundColor: cable.color }}
                      />
                      {cable.connection}
                    </button>
                  </th>
                  <td className="px-3 py-2 font-body text-muted-foreground">{cable.connector}</td>
                  <td className="px-3 py-2 font-sans font-bold text-foreground">{cable.pins}</td>
                  <td className="px-3 py-2 font-body text-muted-foreground">{cable.cableType}</td>
                  <td className="px-3 py-2">
                    <label htmlFor={inputId} className="sr-only">
                      Length in metres for {cable.connection}
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        id={inputId}
                        type="number"
                        min={0.1}
                        step={0.1}
                        value={length}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const value = Number(e.target.value)
                          if (!Number.isNaN(value) && value > 0) {
                            s.setCableLength(cable.connection, value)
                          }
                        }}
                        className="w-20 border border-border px-2 py-1 text-xs font-sans font-bold focus:outline-none focus:border-primary"
                      />
                      <span className="text-[11px] font-body text-muted-foreground">m</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
