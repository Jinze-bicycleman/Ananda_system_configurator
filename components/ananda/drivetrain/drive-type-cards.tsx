"use client"

import { cn } from "@/lib/utils"
import { CheckCircle2, Link2, Waves } from "lucide-react"
import type { DrivetrainComponent } from "@/lib/ananda-drivetrain"
import { getAvailableTransmissionTypes } from "@/lib/ananda-drivetrain"

const TRANSMISSION_LABELS: Record<string, string> = {
  derailleur: "Derailleur & Cassette",
  internal_gear_hub: "Internal-Gear Hub",
  cvt: "CVT",
  single_speed: "Single Speed",
  gearbox: "Gearbox",
}

const DRIVE_TYPE_META = {
  chain: {
    title: "Chain Drive",
    description: "Flexible gearing with derailleur, internal-gear-hub and single-speed options.",
    benefits: ["Affordable", "Efficient power transfer", "Widely available parts"],
    icon: Link2,
  },
  belt: {
    title: "Belt Drive",
    description: "Clean, quiet and low-maintenance, with additional frame and alignment requirements.",
    benefits: ["Low maintenance", "No lubrication required", "Quiet and clean"],
    icon: Waves,
  },
} as const

export function DriveTypeCards({
  catalogue,
  selected,
  onSelect,
}: {
  catalogue: DrivetrainComponent[]
  selected: "chain" | "belt" | null
  onSelect: (type: "chain" | "belt") => void
}) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(100%,20rem),1fr))]">
      {(["chain", "belt"] as const).map((type) => {
        const meta = DRIVE_TYPE_META[type]
        const isSelected = selected === type
        const availableTransmissions = getAvailableTransmissionTypes(catalogue, type)
        const Icon = meta.icon
        return (
          <div
            key={type}
            className={cn(
              "relative min-w-0 border-2 transition-all",
              isSelected ? "border-primary shadow-lg shadow-primary/10" : "border-border hover:border-primary/40",
            )}
          >
            <div className={cn("h-1.5 w-full shrink-0", isSelected ? "bg-primary" : "bg-border")} />
            {isSelected && (
              <div className="absolute top-3 right-3">
                <div className="bg-primary rounded-full p-1">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className={cn("text-2xl font-sans font-black uppercase", isSelected ? "text-primary" : "text-graphite")}>
                  {meta.title}
                </h3>
              </div>
              <p className="text-sm font-body text-muted-foreground leading-relaxed mb-4">{meta.description}</p>

              <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-primary mb-1.5">Benefits</p>
              <ul className="space-y-1 mb-4">
                {meta.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-1.5 text-xs font-body text-foreground">
                    <span className="text-primary font-bold flex-shrink-0">+</span>
                    {b}
                  </li>
                ))}
              </ul>

              <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Compatible transmission types
              </p>
              <div className="flex flex-wrap gap-1.5 mb-5">
                {availableTransmissions.length === 0 ? (
                  <span className="text-xs font-body text-muted-foreground">No transmission types available in the database yet.</span>
                ) : (
                  availableTransmissions.map((t) => (
                    <span key={t} className="px-2 py-0.5 text-[10px] font-sans font-bold uppercase border border-border text-foreground">
                      {TRANSMISSION_LABELS[t]}
                    </span>
                  ))
                )}
              </div>

              <button
                onClick={() => onSelect(type)}
                className={cn(
                  "w-full px-4 py-2 text-xs font-sans font-bold uppercase tracking-wider transition-colors",
                  isSelected ? "bg-primary text-white" : "border border-border text-foreground hover:border-primary hover:text-primary",
                )}
              >
                {isSelected ? "Selected" : "Select"}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
