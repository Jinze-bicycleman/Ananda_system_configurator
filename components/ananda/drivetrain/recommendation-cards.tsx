"use client"

import { cn } from "@/lib/utils"
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react"
import { SectionLabel } from "../ui-primitives"
import { displayName, type RecommendationCard, type RecommendationPosition } from "@/lib/ananda-drivetrain"

const STATUS_META = {
  green: { icon: CheckCircle2, label: "Compatible", cls: "text-primary" },
  amber: { icon: AlertTriangle, label: "Verification required", cls: "text-warning" },
  red: { icon: XCircle, label: "Not compatible", cls: "text-destructive" },
} as const

export function RecommendationCards({
  recommendations,
  onSelect,
  onCheckSpecs,
}: {
  recommendations: Record<RecommendationPosition, RecommendationCard | null>
  onSelect: (card: RecommendationCard) => void
  onCheckSpecs: (componentId: string) => void
}) {
  const positions: RecommendationPosition[] = ["climbing", "balanced", "speed"]

  return (
    <div className="mb-8">
      <SectionLabel>Recommended Setups</SectionLabel>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {positions.map((pos) => {
          const card = recommendations[pos]
          if (!card) {
            return (
              <div key={pos} className="border border-dashed border-border bg-surface p-5 flex flex-col">
                <p className="text-[11px] font-sans font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  {pos === "climbing" ? "Climbing / Cargo" : pos === "balanced" ? "Balanced / Urban" : "Speed / Trekking"}
                </p>
                <p className="text-sm font-body text-muted-foreground">
                  No validated recommendation is available for the current bike and motor.
                </p>
              </div>
            )
          }
          const meta = STATUS_META[card.compatibilityStatus]
          const StatusIcon = meta.icon
          return (
            <div key={pos} className="border border-border bg-white overflow-hidden flex flex-col">
              <div className="h-1 bg-primary" />
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-[11px] font-sans font-bold uppercase tracking-wider text-primary mb-1">{card.label}</p>
                <p className="text-sm font-sans font-bold text-graphite mb-3">
                  {card.transmissionType === "derailleur" ? "Derailleur & Cassette" : "CVT (Continuously Variable)"}
                </p>

                <div className="space-y-1 mb-3 text-xs font-body">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Front</span>
                    <span className="font-semibold text-foreground text-right">{displayName(card.front)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rear</span>
                    <span className="font-semibold text-foreground text-right">{displayName(card.rear)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gear Range</span>
                    <span className="font-semibold text-foreground">{card.gearRangeLabel}</span>
                  </div>
                </div>

                <div className={cn("flex items-center gap-1.5 text-xs font-sans font-bold uppercase tracking-wide mb-4", meta.cls)}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {meta.label}
                </div>

                <div className="mt-auto flex flex-col gap-2">
                  <button
                    onClick={() => onSelect(card)}
                    disabled={card.compatibilityStatus === "red"}
                    className="w-full px-3 py-2 text-xs font-sans font-bold uppercase tracking-wider bg-primary text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Select Setup
                  </button>
                  <button
                    onClick={() => onCheckSpecs(card.front.id)}
                    className="w-full px-3 py-2 text-xs font-sans font-bold uppercase tracking-wider border border-border text-muted-foreground hover:border-primary hover:text-primary"
                  >
                    Check Specifications
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
