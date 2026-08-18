"use client"

import { useAnandaStore } from "@/lib/ananda-store"
import { cablePresets, aAccessories } from "@/lib/ananda-data"
import { useMotors, useDisplays, useBatteries, CHARGERS, CHARGING_PORTS } from "@/lib/ananda-packages"
import { StepHeader, SectionLabel } from "./ui-primitives"
import { SystemDiagram } from "./system-diagram/system-diagram"

// ─── SVG System Diagram ──────────────────────────────────────────────────────

function Block({
  x, y, w = 100, h = 44, label, sublabel, active, accent, lime
}: {
  x: number; y: number; w?: number; h?: number
  label: string; sublabel?: string
  active?: boolean; accent?: boolean; lime?: boolean
}) {
  const bg = lime ? "#B4D600" : accent ? "#008F36" : active ? "#f0fdf4" : "#f9fafb"
  const border = lime ? "#8fa300" : accent ? "#006828" : active ? "#008F36" : "#d1d5db"
  const textMain = lime || accent ? "white" : active ? "#008F36" : "#374151"
  const textSub = lime || accent ? "rgba(255,255,255,0.8)" : "#9ca3af"
  const enlargedLabel = label === "Display" || label === "Remote" || label === "Accessories"
  const labelFontSize = enlargedLabel ? 30 : 10
  const sublabelFontSize = enlargedLabel ? 28 : 7.5
  const textWidth = Math.max(w - 12, 24)

  return (
    <g>
      {/* Shadow */}
      <rect x={x + 2} y={y + 2} width={w} height={h} rx={2} fill="rgba(0,0,0,0.06)" />
      {/* Card */}
      <rect x={x} y={y} width={w} height={h} rx={2} fill={bg} stroke={border} strokeWidth={active ? 1.5 : 1} />
      {/* Accent diagonal top-right corner */}
      {active && !accent && !lime && (
        <polygon
          points={`${x + w - 14},${y} ${x + w},${y} ${x + w},${y + 14}`}
          fill="#008F36" opacity="0.25"
        />
      )}
      {/* Labels */}
      <text x={x + w / 2} y={y + h / 2 + (sublabel ? -labelFontSize * 0.35 : labelFontSize * 0.35)}
        textAnchor="middle" fill={textMain} fontSize={labelFontSize} fontWeight="700"
        fontFamily="Barlow Condensed, sans-serif" style={{ textTransform: "uppercase" }}
        textLength={enlargedLabel ? textWidth : undefined} lengthAdjust={enlargedLabel ? "spacingAndGlyphs" : undefined}>
        {label}
      </text>
      {sublabel && (
        <text x={x + w / 2} y={y + h / 2 + sublabelFontSize * 0.42}
          textAnchor="middle" fill={textSub} fontSize={sublabelFontSize}
          fontFamily="Barlow, sans-serif"
          textLength={enlargedLabel ? textWidth : undefined} lengthAdjust={enlargedLabel ? "spacingAndGlyphs" : undefined}>
          {sublabel}
        </text>
      )}
    </g>
  )
}

function Arrow({
  x1, y1, x2, y2, label, color = "#9ca3af"
}: {
  x1: number; y1: number; x2: number; y2: number; label?: string; color?: string
}) {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={1.5} strokeDasharray="4 2" markerEnd="url(#arrowhead)" />
      {label && (
        <text x={mx} y={my - 4} textAnchor="middle" fill={color} fontSize={7}
          fontFamily="Barlow, sans-serif">{label}</text>
      )}
    </g>
  )
}

type DiagramLabels = {
  motor: string
  motorSub: string
  display: string
  speedSensor: string
  battery: string
  charger: string
  chargingPort: string
  accessories: string
  controller: string
  torqueSensor: string
  cadenceSensor: string
  remote: string
}

function SystemDiagramSVG({ driveType, labels }: { driveType: "mid" | "hub"; labels: DiagramLabels }) {
  const isMid = driveType === "mid"

  return (
    <svg viewBox="0 0 640 380" className="w-full max-w-2xl" style={{ minHeight: 320 }}>
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
          <polygon points="0 0, 6 2, 0 4" fill="#9ca3af" />
        </marker>
        <marker id="arrowhead-green" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
          <polygon points="0 0, 6 2, 0 4" fill="#008F36" />
        </marker>
      </defs>

      {/* Background grid */}
      <rect width="640" height="380" fill="white" rx="4" />
      <line x1="0" y1="180" x2="640" y2="180" stroke="#f3f4f6" strokeWidth="1" />
      <line x1="320" y1="0" x2="320" y2="360" stroke="#f3f4f6" strokeWidth="1" />

      {/* ─── BATTERY (left) ─── */}
      <Block x={30} y={60} w={100} h={50} label="Battery" sublabel={labels.battery} active />
      {/* Charger below battery */}
      <Block x={30} y={140} w={100} h={40} label="Charger" sublabel={labels.charger} active={false} />
      {/* Charging port */}
      <Block x={30} y={205} w={100} h={40} label="Charge Port" sublabel={labels.chargingPort} active={false} />

      {/* Charger → Charging port arrow */}
      <Arrow x1={80} y1={180} x2={80} y2={205} color="#d1d5db" />
      {/* Battery ← Charger arrow */}
      <Arrow x1={80} y1={140} x2={80} y2={110} color="#d1d5db" label="Charge" />

      {isMid ? (
        <>
          {/* ─── MID-DRIVE: Battery → Motor ─── */}
          <Arrow x1={130} y1={82} x2={240} y2={155} color="#008F36" label="Power" />

          {/* Central motor block */}
          <Block x={240} y={130} w={160} h={70} label={labels.motor} sublabel={labels.motorSub} accent />
          {/* Integrated sub-labels */}
          <text x={320} y={217} textAnchor="middle" fill="#008F36" fontSize={7} fontFamily="Barlow, sans-serif">
            ↳ Integrated Controller · Torque Sensing · Cadence Sensing
          </text>

          {/* Speed sensor → Motor */}
          <Block x={220} y={285} w={90} h={40} label="Speed Sensor" sublabel={labels.speedSensor} active />
          <Arrow x1={265} y1={285} x2={290} y2={200} color="#008F36" />

          {/* Display → Motor */}
          <Block x={430} y={18} w={170} h={88} label="Display" sublabel={labels.display} active />
          <Arrow x1={430} y1={62} x2={400} y2={148} color="#008F36" label="HMI" />
          
          {/* Remote → Display */}
          <Block x={480} y={120} w={140} h={86} label="Remote" sublabel={labels.remote} active />
          <Arrow x1={550} y1={120} x2={548} y2={106} color="#9ca3af" />
          
          {/* Accessories → System Harness */}
          <Block x={405} y={238} w={215} h={88} label="Accessories" sublabel={labels.accessories} active />
          <Arrow x1={510} y1={238} x2={400} y2={200} color="#9ca3af" label="Harness" />
          
          {/* Note */}
          <rect x={20} y={332} width={600} height={36} rx={3} fill="#f0fdf4" stroke="#bbf7d0" strokeWidth={1} />
          <text x={320} y={349} textAnchor="middle" fill="#008F36" fontSize={8.5} fontFamily="Barlow, sans-serif" fontWeight="600">
            Mid-drive: controller, torque sensing and cadence sensing are all integrated in the motor unit.
          </text>
          <text x={320} y={360} textAnchor="middle" fill="#6b7280" fontSize={7.5} fontFamily="Barlow, sans-serif">
            External controller and external sensors are not required.
          </text>
        </>
      ) : (
        <>
          {/* ─── HUB MOTOR ─── */}
          {/* Battery → Controller */}
          <Arrow x1={130} y1={82} x2={220} y2={120} color="#008F36" label="Power" />

          {/* External Controller */}
          <Block x={220} y={100} w={140} h={50} label="Controller" sublabel={labels.controller} accent />

          {/* Controller → Hub Motor */}
          <Arrow x1={360} y1={125} x2={440} y2={140} color="#008F36" label="Phase" />
          <Block x={440} y={120} w={120} h={55} label="Hub Motor" sublabel={labels.motorSub} active />

          {/* Torque/Cadence Sensor → Controller */}
          <Block x={200} y={235} w={110} h={44} label="Torque Sensor" sublabel={labels.torqueSensor} active />
          <Arrow x1={255} y1={235} x2={275} y2={150} color="#008F36" />

          <Block x={330} y={235} w={100} h={44} label="Cadence Sensor" sublabel={labels.cadenceSensor} active />
          <Arrow x1={380} y1={235} x2={340} y2={150} color="#9ca3af" />

          {/* Speed Sensor → Controller */}
          <Block x={130} y={235} w={90} h={44} label="Speed Sensor" sublabel={labels.speedSensor} active />
          <Arrow x1={175} y1={235} x2={260} y2={150} color="#008F36" />

          {/* Display → Controller */}
          <Block x={460} y={30} w={110} h={44} label="Display" sublabel={labels.display} active />
          <Arrow x1={510} y1={74} x2={360} y2={125} color="#008F36" label="HMI" />

          {/* Remote → Display */}
          <Block x={540} y={110} w={80} h={40} label="Remote" sublabel={labels.remote} active />
          <Arrow x1={570} y1={110} x2={572} y2={74} color="#9ca3af" />

          {/* Accessories → Controller */}
          <Block x={460} y={230} w={120} h={44} label="Accessories" sublabel={labels.accessories} active />
          <Arrow x1={520} y1={230} x2={360} y2={150} color="#9ca3af" label="Harness" />

          {/* Note */}
          <rect x={20} y={310} width={600} height={36} rx={3} fill="#fffbeb" stroke="#fde68a" strokeWidth={1} />
          <text x={320} y={327} textAnchor="middle" fill="#b45309" fontSize={8.5} fontFamily="Barlow, sans-serif" fontWeight="600">
            Hub motor system requires an external controller and external pedal sensing.
          </text>
          <text x={320} y={338} textAnchor="middle" fill="#6b7280" fontSize={7.5} fontFamily="Barlow, sans-serif">
            Torque sensor and cadence sensor must be specified as separate components.
          </text>
        </>
      )}
    </svg>
  )
}

// ─── Cable length table ──────────────────────────────────────────────────────

function CableTable() {
  const s = useAnandaStore()
  const driveKey = s.driveType ?? "mid"
  const presets = cablePresets[driveKey] ?? cablePresets.mid

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-graphite text-white">
            {["Connection", "Connector", "Pins", "Cable Type", "Length (m)"].map(h => (
              <th key={h} className="px-3 py-2 font-sans font-bold uppercase tracking-wider text-left text-[11px]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {presets.map((p, i) => {
            const stored = s.cableLengths[p.connection]
            const val = stored !== undefined ? stored : p.defaultLength
            return (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-surface"}>
                <td className="px-3 py-2 font-sans font-semibold text-foreground">{p.connection}</td>
                <td className="px-3 py-2 font-body text-muted-foreground">{p.connector}</td>
                <td className="px-3 py-2 font-sans font-bold text-foreground">{p.pins}</td>
                <td className="px-3 py-2 font-body text-muted-foreground">{p.cableType}</td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0.1} max={5} step={0.1}
                    value={val}
                    onChange={e => s.setCableLength(p.connection, Number(e.target.value))}
                    className="w-20 border border-border px-2 py-1 text-xs font-sans font-bold focus:outline-none focus:border-primary"
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Step component ──────────────────────────────────────────────────────────

export function Step9SystemDiagram() {
  const s = useAnandaStore()
  const driveType = s.driveType ?? "mid"

  const { motors } = useMotors()
  const { displays } = useDisplays()
  const { batteries } = useBatteries()

  const motor = motors.find((m) => m.id === s.motorId) ?? null
  const display = displays.find((d) => d.id === s.displayId) ?? null
  const battery = batteries.find((b) => b.id === s.batteryId) ?? null
  const charger = CHARGERS.find((c) => c.id === s.chargerId) ?? null
  const chargingPort = CHARGING_PORTS.find((p) => p.id === s.chargingPortId) ?? null
  const selectedAccessories = aAccessories.filter((a) => s.accessoryIds.includes(a.id))

  const labels: DiagramLabels = {
    motor: motor?.model ?? "Motor Unit",
    motorSub: driveType === "mid" ? "Mid-Drive Motor Unit" : "Hub Motor Unit",
    display: display?.model ?? (s.skippedItems.includes("displayId") ? "Not Needed" : "—"),
    speedSensor: s.skippedItems.includes("speedSensorId") ? "Not Needed" : s.speedSensorId ?? "—",
    battery: battery?.model ?? (s.skippedItems.includes("batteryId") ? "Not Needed" : "System Power"),
    charger: charger?.model ?? "—",
    chargingPort: chargingPort?.model ?? "—",
    accessories: selectedAccessories.length > 0 ? selectedAccessories.map((a) => a.name).join(" · ") : "None Selected",
    controller: s.controllerId ?? "—",
    torqueSensor: s.skippedItems.includes("torqueSensorId") ? "Not Needed" : s.torqueSensorId ?? "—",
    cadenceSensor: s.cadenceSensorId ?? "—",
    remote: "R1 / R2 / R3",
  }

  if (driveType === "mid") {
    return (
      <div>
        <StepHeader
          step={8}
          title="System Diagram Overview"
          subtitle="Interactive system architecture diagram based on your configuration. Select a connection below to inspect it, and edit cable lengths as needed."
        />
        <SystemDiagram />
      </div>
    )
  }

  return (
    <div>
      <StepHeader
        step={8}
        title="System Diagram Overview"
        subtitle="Dynamic system architecture diagram based on your configuration. Review connection topology and edit cable lengths below."
      />

      {/* Diagram */}
      <div className="border border-border bg-white p-4 mb-6 overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] font-sans font-bold uppercase tracking-wider text-graphite-light">
            System Architecture — Hub Motor · {s.voltagePlatform ?? "—"}V
          </p>
          <div className="flex items-center gap-4 text-[10px] font-body text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-0.5 bg-primary" /> Power / Signal</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-0.5 bg-border" style={{ borderTop: "1.5px dashed #d1d5db" }} /> Secondary</span>
          </div>
        </div>
        <SystemDiagramSVG driveType={driveType} labels={labels} />
      </div>

      {/* Cable length table */}
      <div className="mb-6">
        <SectionLabel>Cable Length Configuration</SectionLabel>
        <p className="text-xs font-body text-muted-foreground mb-3">
          Edit cable lengths to match your frame layout. These values carry through to the final configuration report.
        </p>
        <div className="border border-border overflow-hidden">
          <CableTable />
        </div>
      </div>

    </div>
  )
}
