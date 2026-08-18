"use client"

import { useAnandaStore } from "@/lib/ananda-store"
import { StepHeader } from "./ui-primitives"
import { cn } from "@/lib/utils"
import { CheckCircle2, Zap } from "lucide-react"

const DRIVE_SYSTEMS = [
  {
    id: "hub" as const,
    imageUrl: "/images/stage2-hub-motor.jpg",
    title: "Hub Motor System",
    description:
      "Hub motors operate as an independent power source with a single gear ratio. Because they do not route power through the chain, there is significantly less wear on the drivetrain.",
    bestFor: "City commuting, casual cruising on flat pavement and budget-sensitive applications.",
    pros: ["Lower cost", "Less drivetrain wear", "Simple maintenance"],
    cons: ["Less efficient on hills", "Added unsprung weight at wheel"],
    disabled: true,
  },
  {
    id: "mid" as const,
    imageUrl: "/images/stage2-mid-motor.jpg",
    title: "Mid-Drive Motor System",
    description:
      "Mid-drive motors are positioned at the bottom bracket and drive the front chainring, allowing the motor to use the bicycle's gears together with the rider.",
    bestFor: "Electric mountain bikes, steep hilly terrain, cargo bikes and carrying children or heavy loads.",
    pros: ["Better hill climbing", "Balanced weight distribution", "Uses bike's gear range"],
    cons: ["Higher cost", "More chain and sprocket wear"],
    disabled: false,
  },
]

const VOLTAGE_PLATFORMS = [
  { v: 36 as const, label: "36V" },
  { v: 48 as const, label: "48V" },
  { v: 52 as const, label: "52V" },
]

export function Step2DriveSystem() {
  const s = useAnandaStore()

  return (
    <div>
      <StepHeader
        step={3}
        title="Drive System & Voltage Platform"
        subtitle="Select the motor architecture and system voltage for this e-bike system. These determine the motor product list, controller requirement and system wiring."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {DRIVE_SYSTEMS.map(ds => {
          const selected = !ds.disabled && s.driveType === ds.id
          return (
            <div
              key={ds.id}
              onClick={() => { if (!ds.disabled) s.setField("driveType", ds.id) }}
              className={cn(
                "relative border-2 transition-all overflow-hidden",
                ds.disabled ? "cursor-not-allowed opacity-50 grayscale" : "cursor-pointer",
                selected ? "border-primary shadow-lg shadow-primary/10" : "border-border hover:border-primary/40"
              )}
            >
              {/* Diagonal accent strip at top */}
              <div className={cn(
                "h-1.5 w-full transition-colors",
                selected ? "bg-primary" : "bg-border"
              )} />

              {/* Selection indicator */}
              {selected && (
                <div className="absolute top-4 right-4">
                  <div className="bg-primary rounded-full p-1">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              {/* SVG diagram placeholder */}
              <div className={cn(
                "relative overflow-hidden p-0",
                selected ? "bg-primary/5" : "bg-surface"
              )}>
                {/* Decorative slanted green shape */}
                <div className={cn(
                  "absolute top-0 right-0 w-24 h-full transition-opacity",
                  selected ? "opacity-100" : "opacity-30"
                )}>
                  <svg viewBox="0 0 96 120" className="w-full h-full" preserveAspectRatio="none">
                    <polygon points="40,0 96,0 96,120 0,120" fill={selected ? "#008F36" : "#e5e7eb"} opacity="0.15" />
                  </svg>
                </div>

                {/* Replaceable drive-system image URL. Add a URL above to replace the fallback diagram. */}
                <div className="relative flex h-56 items-center justify-center sm:h-72">
                  {ds.imageUrl ? (
                    <img
                      src={ds.imageUrl}
                      alt={`${ds.title} diagram`}
                      className="h-full w-full object-cover"
                    />
                  ) : ds.id === "hub" ? (
                    <HubDiagram active={selected} />
                  ) : (
                    <MidDriveDiagram active={selected} />
                  )}
                </div>
              </div>

              <div className="p-6">
                <h3 className={cn(
                  "text-2xl font-sans font-black uppercase tracking-tight mb-1",
                  selected ? "text-primary" : "text-graphite"
                )}>
                  {ds.title}
                </h3>
                {ds.disabled && (
                  <p className="mb-3 text-xs font-sans font-bold uppercase tracking-wider text-destructive">
                    (Hub motor selection coming soon)
                  </p>
                )}
                <button
                  disabled={ds.disabled}
                  onClick={() => { if (!ds.disabled) s.setField("driveType", ds.id) }}
                  className={cn(
                    "mt-5 w-full py-2.5 text-sm font-sans font-bold uppercase tracking-wider transition-all",
                    ds.disabled
                      ? "cursor-not-allowed border border-border text-muted-foreground"
                      : selected
                        ? "bg-primary text-white"
                        : "border border-border text-graphite hover:border-primary hover:text-primary"
                  )}
                >
                  {ds.disabled ? "Coming Soon" : selected ? "Selected" : `Select ${ds.title}`}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-10">
        <h3 className="mb-4 font-sans text-lg font-black uppercase tracking-tight text-graphite">Voltage Platform</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {VOLTAGE_PLATFORMS.map(vp => {
            const selected = s.voltagePlatform === vp.v
            return (
              <div
                key={vp.v}
                onClick={() => s.setField("voltagePlatform", vp.v)}
                className={cn(
                  "relative cursor-pointer border-2 overflow-hidden transition-all",
                  selected ? "border-primary shadow-lg shadow-primary/10" : "border-border hover:border-primary/40"
                )}
              >
                <div className={cn(
                  "relative px-6 pt-6 pb-5",
                  selected ? "bg-graphite" : "bg-surface"
                )}>
                  {/* Selection mark */}
                  {selected && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-primary rounded-full p-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="flex items-end gap-2">
                    <span className={cn(
                      "text-5xl font-sans font-black leading-none",
                      selected ? "text-white" : "text-graphite"
                    )}>
                      {vp.label}
                    </span>
                    <Zap className={cn("w-6 h-6 mb-1", selected ? "text-lime" : "text-primary")} />
                  </div>
                </div>

                <div className="p-4">
                  <button
                    className={cn(
                      "w-full py-2.5 text-sm font-sans font-bold uppercase tracking-wider transition-all",
                      selected
                        ? "bg-primary text-white"
                        : "border border-border text-graphite hover:border-primary hover:text-primary"
                    )}
                  >
                    {selected ? `${vp.label} Selected` : `Select ${vp.label}`}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}

function HubDiagram({ active }: { active: boolean }) {
  const c = active ? "#008F36" : "#9ca3af"
  const lc = active ? "#B4D600" : "#e5e7eb"
  return (
    <svg viewBox="0 0 200 100" className="w-48 h-24" aria-hidden>
      {/* Frame outline */}
      <path d="M20,80 L60,30 L130,30 L160,80 Z" fill="none" stroke={c} strokeWidth="2" />
      {/* Rear wheel with hub motor */}
      <circle cx="160" cy="80" r="18" fill="none" stroke={c} strokeWidth="2" />
      <circle cx="160" cy="80" r="8" fill={active ? "#008F36" : "#d1d5db"} />
      <circle cx="160" cy="80" r="3" fill="white" />
      {/* Front wheel */}
      <circle cx="30" cy="80" r="18" fill="none" stroke="#9ca3af" strokeWidth="1.5" />
      <circle cx="30" cy="80" r="3" fill="#9ca3af" />
      {/* Chain / drivetrain */}
      <line x1="80" y1="70" x2="155" y2="75" stroke={lc} strokeWidth="1.5" strokeDasharray="3,2" />
      {/* Motor label */}
      <text x="155" y="62" fontSize="6" fill={c} fontWeight="bold" textAnchor="middle">HUB</text>
      <text x="155" y="69" fontSize="6" fill={c} fontWeight="bold" textAnchor="middle">MOTOR</text>
    </svg>
  )
}

function MidDriveDiagram({ active }: { active: boolean }) {
  const c = active ? "#008F36" : "#9ca3af"
  const lc = active ? "#B4D600" : "#e5e7eb"
  return (
    <svg viewBox="0 0 200 100" className="w-48 h-24" aria-hidden>
      {/* Frame */}
      <path d="M20,80 L60,30 L130,30 L160,80 Z" fill="none" stroke="#9ca3af" strokeWidth="1.5" />
      {/* Bottom bracket / motor */}
      <rect x="82" y="62" width="22" height="22" rx="2" fill={active ? "#008F36" : "#e5e7eb"} />
      <rect x="86" y="66" width="14" height="14" rx="1" fill={active ? "#B4D600" : "#d1d5db"} />
      {/* Chain */}
      <path d="M93,62 Q93,45 115,45 Q140,45 150,60 L152,78 Q150,82 140,82 Q120,82 115,75 Q108,62 93,62Z" fill="none" stroke={lc} strokeWidth="1.5" />
      {/* Rear wheel */}
      <circle cx="160" cy="80" r="18" fill="none" stroke="#9ca3af" strokeWidth="1.5" />
      <circle cx="160" cy="80" r="3" fill="#9ca3af" />
      {/* Front wheel */}
      <circle cx="30" cy="80" r="18" fill="none" stroke="#9ca3af" strokeWidth="1.5" />
      <circle cx="30" cy="80" r="3" fill="#9ca3af" />
      {/* Label */}
      <text x="93" y="74" fontSize="5" fill="white" fontWeight="bold" textAnchor="middle">MID</text>
      <text x="93" y="80" fontSize="5" fill="white" fontWeight="bold" textAnchor="middle">DRIVE</text>
    </svg>
  )
}
