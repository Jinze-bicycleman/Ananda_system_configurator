"use client"

import { cn } from "@/lib/utils"
import { CheckCircle2 } from "lucide-react"
import { getAvailableTransmissionTypes, type DrivetrainComponent, type TransmissionType } from "@/lib/ananda-drivetrain"
import { SectionLabel } from "../ui-primitives"
import { DrivetrainEmptyState } from "./drivetrain-states"

const TRANSMISSION_META: Record<TransmissionType, { label: string; description: string }> = {
  derailleur: { label: "Derailleur & Cassette", description: "Wide-range multi-speed shifting for chain drivetrains." },
  internal_gear_hub: { label: "Internal-Gear Hub", description: "Sealed, low-maintenance gearing inside the rear hub." },
  single_speed: { label: "Single Speed", description: "Fixed ratio, minimal maintenance." },
  gearbox: { label: "Gearbox", description: "Mid-frame gearbox transmission." },
}

export function TransmissionTypePicker({
  catalogue,
  driveType,
  selected,
  onSelect,
}: {
  catalogue: DrivetrainComponent[]
  driveType: "chain" | "belt"
  selected: TransmissionType | null
  onSelect: (type: TransmissionType) => void
}) {
  const available = getAvailableTransmissionTypes(catalogue, driveType)

  if (available.length === 0) {
    return (
      <DrivetrainEmptyState
        title="No compatible transmission"
        message={`No transmission type currently has database products for ${driveType} drive. Add products to the catalogue to unlock this step.`}
      />
    )
  }

  return (
    <div className="mb-8">
      <SectionLabel>Choose Transmission Type</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {available.map((type) => {
          const meta = TRANSMISSION_META[type]
          const isSelected = selected === type
          return (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className={cn(
                "relative text-left border p-4 transition-all",
                isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
              )}
            >
              {isSelected && <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-primary" />}
              <p className={cn("text-sm font-sans font-bold uppercase mb-1", isSelected ? "text-primary" : "text-graphite")}>
                {meta.label}
              </p>
              <p className="text-xs font-body text-muted-foreground leading-relaxed">{meta.description}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
