"use client"

import { useAnandaStore } from "@/lib/ananda-store"
import { useRecommendations, type RecommendedSolution } from "@/lib/ananda-recommendation"
import { StepHeader, BigSpec } from "./ui-primitives"
import { StatusBadge } from "./status-badge"
import { AdvancedDriveOverride } from "./recommendation/advanced-drive-override"
import { cn } from "@/lib/utils"
import { AlertTriangle, CheckCircle2, Circle, Loader2, MinusCircle, XCircle } from "lucide-react"

function RequirementList({ solution }: { solution: RecommendedSolution }) {
  if (solution.metRequirements.length === 0 && solution.conditionalRequirements.length === 0 && solution.unmetRequirements.length === 0) {
    return <p className="text-xs font-body text-muted-foreground">No specific requirements were set — this is a balanced default.</p>
  }
  return (
    <div className="space-y-1.5">
      {solution.metRequirements.map((r) => (
        <div key={r} className="flex items-start gap-1.5">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="text-xs font-body text-foreground">{r}</span>
        </div>
      ))}
      {solution.conditionalRequirements.map((r) => (
        <div key={r} className="flex items-start gap-1.5">
          <MinusCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
          <span className="text-xs font-body text-warning-foreground/90">{r} — partially met</span>
        </div>
      ))}
      {solution.unmetRequirements.map((r) => (
        <div key={r} className="flex items-start gap-1.5">
          <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
          <span className="text-xs font-body text-destructive">{r} — not met</span>
        </div>
      ))}
    </div>
  )
}

function SolutionCard({
  solution,
  isPrimary,
  selected,
  onSelect,
}: {
  solution: RecommendedSolution
  isPrimary: boolean
  selected: boolean
  onSelect: () => void
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col border-2 overflow-hidden transition-all",
        selected ? "border-primary shadow-lg shadow-primary/10" : "border-border hover:border-primary/40",
      )}
    >
      <div className={cn("h-1.5 w-full", selected ? "bg-primary" : "bg-border")} />

      <div className="flex items-center justify-between px-4 pt-4">
        {isPrimary ? <StatusBadge variant="recommended" label="Best Match" /> : <StatusBadge variant="optional" label={solution.label} />}
        {selected && (
          <div className="rounded-full bg-primary p-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className={cn("text-xl font-sans font-black uppercase tracking-tight", selected ? "text-primary" : "text-graphite")}>
          {solution.motor.model} · {solution.motor.voltage_v}V
        </h3>
        <p className="mt-1 text-xs font-body leading-relaxed text-muted-foreground">{solution.rationale}</p>

        <div className="mt-4 flex items-center justify-around border border-border bg-surface py-3">
          <BigSpec value={solution.weightKg} unit="kg" label="Weight" />
          <div className="h-10 w-px bg-border" />
          <BigSpec value={solution.rangeKm} unit="km" label="Est. Range" />
          <div className="h-10 w-px bg-border" />
          <BigSpec value={solution.torqueNm} unit="Nm" label="Torque" />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          <div className="border border-border px-2 py-1.5">
            <p className="text-muted-foreground uppercase tracking-wider">Battery</p>
            <p className="font-sans font-bold text-graphite">{solution.battery.model}</p>
          </div>
          <div className="border border-border px-2 py-1.5">
            <p className="text-muted-foreground uppercase tracking-wider">Display</p>
            <p className="font-sans font-bold text-graphite">{solution.display?.model ?? "—"}</p>
          </div>
          <div className="border border-border px-2 py-1.5">
            <p className="text-muted-foreground uppercase tracking-wider">Cost Tier</p>
            <p className="font-sans font-bold text-graphite">{solution.costLabel}</p>
          </div>
          <div className="border border-border px-2 py-1.5">
            <p className="text-muted-foreground uppercase tracking-wider">Integration</p>
            <p className="font-sans font-bold text-graphite">{solution.tradeoffs.integration}</p>
          </div>
        </div>

        <div className="mt-4 border-t border-border pt-3">
          <p className="mb-2 text-[10px] font-sans font-bold uppercase tracking-wider text-muted-foreground">Requirement Fit</p>
          <RequirementList solution={solution} />
        </div>

        <button
          type="button"
          onClick={onSelect}
          className={cn(
            "mt-4 w-full py-2.5 text-sm font-sans font-bold uppercase tracking-wider transition-all",
            selected ? "bg-primary text-white" : "border border-border text-graphite hover:border-primary hover:text-primary",
          )}
        >
          {selected ? "Configuration Selected" : "Use This Configuration"}
        </button>
      </div>
    </div>
  )
}

export function Step4RecommendedSolutions() {
  const s = useAnandaStore()
  const { solutions, noSolutionReason, isLoading } = useRecommendations()

  const applySolution = (solution: RecommendedSolution) => {
    s.applyRecommendedSolution(solution.id, {
      driveType: "mid",
      voltagePlatform: solution.motor.voltage_v as 36 | 48 | 52,
      motorId: solution.motor.id,
      controllerId: null,
      displayId: solution.display?.id ?? null,
      batteryId: solution.battery.id,
      chargerId: null,
      chargingPortId: null,
      baseline: { weightKg: solution.weightKg, rangeKm: solution.rangeKm, costLabel: solution.costLabel },
    })
  }

  return (
    <div>
      <StepHeader
        step={4}
        title="Recommended Solutions"
        subtitle="Based on your Product Targets, here are three ranked configurations. Pick one to carry forward — you can fine-tune every component in Package Configuration."
      />

      {isLoading ? (
        <div id="field-solutions" className="flex items-center justify-center gap-2 py-16 text-sm font-sans text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Generating recommendations…
        </div>
      ) : noSolutionReason ? (
        <div id="field-solutions" className="border-2 border-dashed border-warning/40 p-8 text-center">
          <AlertTriangle className="mx-auto mb-3 h-6 w-6 text-warning" />
          <p className="mb-1 text-sm font-sans font-semibold uppercase tracking-wider text-warning">No Solution Available</p>
          <p className="mx-auto max-w-md text-sm font-body text-muted-foreground">{noSolutionReason}</p>
        </div>
      ) : (
        <div id="field-solutions" className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {solutions.map((solution) => (
            <SolutionCard
              key={solution.id}
              solution={solution}
              isPrimary={solution.id === "best"}
              selected={s.selectedSolutionId === solution.id}
              onSelect={() => applySolution(solution)}
            />
          ))}
        </div>
      )}

      <AdvancedDriveOverride />

      {!isLoading && !noSolutionReason && (
        <div className="mt-4 flex items-start gap-2 border-l-2 border-border bg-surface px-4 py-3">
          <Circle className="mt-0.5 h-2 w-2 shrink-0 fill-muted-foreground text-muted-foreground" />
          <p className="text-xs font-body text-muted-foreground">
            Cost tiers and estimated range are relative planning estimates, not final priced figures. Final specifications are confirmed in
            Package Configuration.
          </p>
        </div>
      )}
    </div>
  )
}
