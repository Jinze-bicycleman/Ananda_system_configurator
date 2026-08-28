"use client"

import { useAnandaStore } from "@/lib/ananda-store"
import { useMotors, useBatteries, useDisplays } from "@/lib/ananda-packages"
import { estimateRangeKm, costTierForMotorModel, COST_LABELS } from "@/lib/ananda-recommendation"
import { computeTargetStatus, computeOverallFeasibility, computeChangeImpact, type RowStatus } from "@/lib/ananda-target-status"
import { cn } from "@/lib/utils"
import { ArrowRight } from "lucide-react"

const STATUS_DOT: Record<RowStatus, string> = {
  met: "bg-primary",
  conditional: "bg-warning",
  not_met: "bg-destructive",
  missing: "bg-border",
}

const FEASIBILITY_LABEL: Record<"go" | "conditional_go" | "no_go", { label: string; cls: string }> = {
  go: { label: "Go", cls: "bg-primary/10 text-primary border-primary/30" },
  conditional_go: { label: "Conditional Go", cls: "bg-warning/10 text-warning-foreground border-warning/30" },
  no_go: { label: "No-Go", cls: "bg-destructive/10 text-destructive border-destructive/30" },
}

export function TargetStatusPanel() {
  const s = useAnandaStore()
  const { motors } = useMotors()
  const { batteries } = useBatteries()
  const { displays } = useDisplays()

  const motor = motors.find((m) => m.id === s.motorId) ?? null
  const battery = batteries.find((b) => b.id === s.batteryId) ?? null
  const display = displays.find((d) => d.id === s.displayId) ?? null

  const rows = computeTargetStatus({ s, motor, battery, display })
  const feasibility = computeOverallFeasibility(rows)

  const currentWeightKg = (motor?.weight_kg ?? 0) + (battery?.weight_kg ?? 0) + (display?.weight_kg ?? 0)
  const currentRangeKm = battery ? estimateRangeKm(battery.capacity_wh) : 0
  const currentCostLabel = motor ? COST_LABELS[costTierForMotorModel(motor.model)] : "—"
  const impact = computeChangeImpact(s, { weightKg: currentWeightKg, rangeKm: currentRangeKm, costLabel: currentCostLabel })

  const feasibilityInfo = FEASIBILITY_LABEL[feasibility]

  return (
    <div className="p-4 space-y-3 text-[12px]">
      <div className={cn("flex items-center justify-between border px-3 py-2", feasibilityInfo.cls)}>
        <span className="text-[10px] font-sans font-bold uppercase tracking-wider">Overall Feasibility</span>
        <span className="text-xs font-sans font-black uppercase tracking-wider">{feasibilityInfo.label}</span>
      </div>

      <div className="space-y-1.5">
        {rows.map((row) => (
          <div key={row.dimension} className="flex items-start justify-between gap-2 py-1 border-b border-border/40 last:border-0">
            <div className="flex items-start gap-2 min-w-0">
              <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", STATUS_DOT[row.status])} />
              <div className="min-w-0">
                <p className="text-[11px] font-sans font-semibold text-foreground leading-tight">{row.dimension}</p>
                <p className="text-[11px] text-muted-foreground leading-snug">Target: {row.targetLabel}</p>
              </div>
            </div>
            <span className="max-w-[42%] shrink-0 text-[11px] font-sans font-bold tabular-nums text-graphite text-right leading-tight">{row.currentLabel}</span>
          </div>
        ))}
      </div>

      {impact.weight && impact.range && impact.cost && (
        <div className="border-t border-border pt-3 space-y-1.5">
          <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-muted-foreground">Since Last Applied Solution</p>
          <ImpactRow label="System Weight" before={`${impact.weight[0].toFixed(1)} kg`} after={`${impact.weight[1].toFixed(1)} kg`} />
          <ImpactRow label="Range" before={`${impact.range[0]} km`} after={`${impact.range[1]} km`} />
          <ImpactRow label="Cost Level" before={impact.cost[0]} after={impact.cost[1]} />
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-[10px] font-sans uppercase tracking-wider text-muted-foreground">Compliance</span>
            <span className="text-[11px] font-sans font-bold text-primary">{impact.complianceNote}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function ImpactRow({ label, before, after }: { label: string; before: string; after: string }) {
  const changed = before !== after
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-sans uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1.5 text-[11px] font-sans font-bold tabular-nums">
        <span className="text-muted-foreground">{before}</span>
        <ArrowRight className="h-3 w-3 text-muted-foreground" />
        <span className={changed ? "text-primary" : "text-graphite"}>{after}</span>
      </span>
    </div>
  )
}
