"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2, AlertTriangle, XCircle, Eye } from "lucide-react"
import { SectionLabel } from "../ui-primitives"
import { DrivetrainEmptyState } from "./drivetrain-states"
import {
  displayName,
  evaluateCompatibility,
  type CompatibilityContext,
  type DrivetrainComponent,
  type DrivetrainData,
} from "@/lib/ananda-drivetrain"

type Slot = { key: string; category: string; label: string; optional?: boolean }

function getSlots(driveType: "chain" | "belt", transmissionType: string): Slot[] {
  if (driveType === "chain" && transmissionType === "derailleur") {
    return [
      { key: "chainring", category: "chainring", label: "Chainring" },
      { key: "cassette", category: "cassette", label: "Cassette" },
      { key: "chain", category: "chain", label: "Chain" },
      { key: "derailleur", category: "derailleur", label: "Rear Derailleur" },
      { key: "chain_guide", category: "chain_guide", label: "Chain Guide", optional: true },
    ]
  }
  if (driveType === "belt" && transmissionType === "internal_gear_hub") {
    return [
      { key: "hub", category: "internal_gear_hub", label: "Internal-Gear Hub" },
      { key: "front_pulley", category: "front_pulley", label: "Front Pulley" },
      { key: "rear_pulley", category: "rear_pulley", label: "Rear Pulley" },
      { key: "belt", category: "belt", label: "Belt" },
      { key: "tensioner", category: "tensioner", label: "Tensioner", optional: true },
    ]
  }
  if (driveType === "chain" && transmissionType === "internal_gear_hub") {
    return [
      { key: "hub", category: "internal_gear_hub", label: "Internal-Gear Hub" },
      { key: "chainring", category: "chainring", label: "Chainring" },
      { key: "sprocket", category: "sprocket", label: "Rear Sprocket" },
      { key: "chain", category: "chain", label: "Chain" },
      { key: "tensioner", category: "tensioner", label: "Tensioner", optional: true },
    ]
  }
  return []
}

const STATUS_ICON = { green: CheckCircle2, amber: AlertTriangle, red: XCircle } as const
const STATUS_CLS = { green: "text-primary", amber: "text-warning", red: "text-destructive" } as const

export function AdvancedConfiguration({
  data,
  driveType,
  transmissionType,
  selectedIds,
  onChangeSlot,
  onCheckSpecs,
  ctx,
}: {
  data: DrivetrainData
  driveType: "chain" | "belt"
  transmissionType: string
  selectedIds: string[]
  onChangeSlot: (slotIndex: number, componentId: string) => void
  onCheckSpecs: (componentId: string) => void
  ctx: CompatibilityContext
}) {
  const slots = useMemo(() => getSlots(driveType, transmissionType), [driveType, transmissionType])

  return (
    <div className="mb-8">
      <SectionLabel>Advanced Configuration</SectionLabel>
      <div className="space-y-4">
        {slots.map((slot, index) => {
          const options = data.catalogue.filter(
            (c) => c.category === slot.category && (c.drive_type === driveType || c.drive_type === "both"),
          )
          const priorSelections = selectedIds.slice(0, index).filter(Boolean)
          const priorComponents = priorSelections
            .map((id) => data.catalogue.find((c) => c.id === id))
            .filter((c): c is DrivetrainComponent => Boolean(c))
          const selectedId = selectedIds[index] ?? ""

          if (options.length === 0) {
            return (
              <div key={slot.key}>
                <p className="text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  {slot.label}
                  {slot.optional && <span className="ml-1 text-muted-foreground/60">(Optional)</span>}
                </p>
                <DrivetrainEmptyState
                  title={slot.optional ? "No products available" : "No suitable components in the catalogue"}
                  message={
                    slot.optional
                      ? `No ${slot.label.toLowerCase()} products are currently modelled. This selector can be skipped.`
                      : `No ${slot.label.toLowerCase()} products currently exist in the catalogue for this drive type. Substituting a different category is not permitted.`
                  }
                />
              </div>
            )
          }

          return (
            <div key={slot.key}>
              <p className="text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground mb-2">
                {slot.label}
                {slot.optional && <span className="ml-1 text-muted-foreground/60">(Optional)</span>}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {options.map((option) => {
                  const results = priorComponents.map((p) => evaluateCompatibility(option, p, ctx, data))
                  const status = results.some((r) => r.status === "red")
                    ? "red"
                    : results.some((r) => r.status === "amber")
                      ? "amber"
                      : "green"
                  const Icon = STATUS_ICON[status]
                  const isSelected = selectedId === option.id
                  return (
                    <button
                      key={option.id}
                      onClick={() => onChangeSlot(index, option.id)}
                      className={cn(
                        "flex items-start gap-2 border p-3 text-left transition-all",
                        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                      )}
                    >
                      <Icon className={cn("h-4 w-4 flex-shrink-0 mt-0.5", STATUS_CLS[status])} />
                      <span className="min-w-0">
                        <span className="block text-xs font-sans font-semibold text-graphite truncate">{displayName(option)}</span>
                        {priorComponents.length > 0 && (
                          <span className={cn("block text-[10px] font-body", STATUS_CLS[status])}>
                            {status === "green" ? "Compatible" : status === "amber" ? "Verification required" : "Not compatible"}
                          </span>
                        )}
                      </span>
                    </button>
                  )
                })}
              </div>
              {selectedId && (
                <button
                  onClick={() => onCheckSpecs(selectedId)}
                  className="mt-1.5 flex items-center gap-1 text-[11px] font-sans font-bold uppercase tracking-wider text-primary hover:underline"
                >
                  <Eye className="h-3 w-3" /> Check Specifications
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
