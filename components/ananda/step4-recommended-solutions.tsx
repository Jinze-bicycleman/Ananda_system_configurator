"use client"

import { useAnandaStore } from "@/lib/ananda-store"
import { useRecommendations, type RecommendedSolution } from "@/lib/ananda-recommendation"
import { chargersForVoltage, CHARGING_PORTS } from "@/lib/ananda-packages"
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

// Renders a value with the spec's required "Data unavailable" fallback —
// never a bare 0, empty string, or placeholder engineering value. Label and
// value both wrap and align from the top, so long product IDs, dimensions,
// and protocol lists never clip or overlap.
function SpecRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  const isMissing = value == null || value === ""
  return (
    <div className="spec-row py-1">
      <dt className="text-[11px] font-sans uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className={cn("spec-value text-sm font-sans font-bold tabular-nums", isMissing ? "italic text-muted-foreground" : "text-graphite")}>
        {isMissing ? "Data unavailable" : value}
      </dd>
    </div>
  )
}

function MotorSpecPanel({ solution }: { solution: RecommendedSolution }) {
  const m = solution.motor
  return (
    <div className="min-w-0 border border-border bg-surface p-3">
      <p className="mb-1.5 text-[10px] font-sans font-bold uppercase tracking-wider text-primary">Motor</p>
      <dl className="divide-y divide-border/60">
        <SpecRow label="Model" value={m.model} />
        <SpecRow label="Motor Type" value={m.motor_type === "mid_drive" ? "Mid-Drive" : m.motor_type === "hub" ? "Hub-Drive" : m.motor_type} />
        <SpecRow label="Weight" value={m.weight_kg != null ? `${m.weight_kg} kg` : null} />
        <SpecRow label="Max Torque" value={m.torque_nm != null ? `${m.torque_nm} Nm` : null} />
        <SpecRow label="Rated Power" value={m.rated_power_w != null ? `${m.rated_power_w} W` : null} />
        <SpecRow label="Crank / Mount Interface" value={m.mounting_interface ?? m.shaft_interface} />
        <SpecRow label="Voltage" value={m.voltage_v != null ? `${m.voltage_v}V` : null} />
      </dl>
    </div>
  )
}

function BatterySpecPanel({ solution }: { solution: RecommendedSolution }) {
  const b = solution.battery
  const dims = b.length_mm != null && b.width_mm != null && b.height_mm != null ? `${b.length_mm} × ${b.width_mm} × ${b.height_mm} mm` : null
  const comms = b.communication_protocols?.length ? b.communication_protocols.join(", ") : b.communication_protocol
  return (
    <div className="min-w-0 border border-border bg-surface p-3">
      <p className="mb-1.5 text-[10px] font-sans font-bold uppercase tracking-wider text-primary">Battery</p>
      <dl className="divide-y divide-border/60">
        <SpecRow label="Model" value={b.model} />
        <SpecRow label="Weight" value={b.weight_kg != null ? `${b.weight_kg} kg` : null} />
        {/* Dimensions must be visually prominent — customers need to check
            frame fit. Stacked, not right-aligned, so the full value is
            always readable regardless of card width. */}
        <div className="long-spec-row border-y border-dashed border-border py-1.5">
          <dt className="text-[11px] font-sans uppercase tracking-wider text-muted-foreground">Dimensions (L × W × H)</dt>
          <dd className={cn("text-base font-sans font-black tabular-nums wrap-anywhere", dims ? "text-graphite" : "italic text-muted-foreground")}>
            {dims ?? "Data unavailable"}
          </dd>
        </div>
        <SpecRow label="Capacity" value={b.capacity_wh != null ? `${b.capacity_wh} Wh` : null} />
        <SpecRow label="Communication" value={comms} />
      </dl>
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
        "solution-card product-card relative flex flex-col border-2 transition-all",
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

      <div className="min-w-0 p-4">
        <p className="text-xs font-body leading-relaxed text-muted-foreground">{solution.rationale}</p>

        <div className="mt-4 flex items-center justify-around border border-border bg-surface py-3">
          <BigSpec value={solution.weightKg} unit="kg" label="Weight" />
          <div className="h-10 w-px bg-border" />
          <BigSpec value={solution.rangeKm} unit="km" label="Est. Range" />
          <div className="h-10 w-px bg-border" />
          <BigSpec value={solution.torqueNm} unit="Nm" label="Torque" />
        </div>

        {/* Two equal, first-class specification panels: Motor and Battery
            are peers here, not a headline motor with battery as an
            afterthought text row. */}
        <div className="solution-specifications mt-3">
          <MotorSpecPanel solution={solution} />
          <BatterySpecPanel solution={solution} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          <div className="min-w-0 border border-border px-2 py-1.5">
            <p className="text-muted-foreground uppercase tracking-wider">Display</p>
            <p className="font-sans font-bold text-graphite wrap-anywhere">{solution.display?.model ?? "—"}</p>
          </div>
          <div className="min-w-0 border border-border px-2 py-1.5">
            <p className="text-muted-foreground uppercase tracking-wider">Cost Tier</p>
            <p className="font-sans font-bold text-graphite wrap-anywhere">{solution.costLabel}</p>
          </div>
          <div className="min-w-0 border border-border px-2 py-1.5">
            <p className="text-muted-foreground uppercase tracking-wider">Integration</p>
            <p className="font-sans font-bold text-graphite wrap-anywhere">{solution.tradeoffs.integration}</p>
          </div>
          <div className="min-w-0 border border-border px-2 py-1.5">
            <p className="text-muted-foreground uppercase tracking-wider">Est. Range</p>
            <p className="font-sans font-bold text-graphite">{solution.rangeKm} km</p>
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
    const voltage = solution.motor.voltage_v as 36 | 48 | 52
    // Charger/charging-port catalogues are small fixed lists (one entry per
    // voltage for chargers, no voltage distinction for ports) — the single
    // voltage-compatible charger and the platform-standard port are the
    // "highest-ranked compatible product" for components the recommendation
    // engine doesn't itself rank.
    const recommendedChargerId = chargersForVoltage(voltage)[0]?.id ?? null
    const recommendedPortId = CHARGING_PORTS[0]?.id ?? null
    s.applyRecommendedSolution(solution.id, {
      driveType: "mid",
      voltagePlatform: voltage,
      motorId: solution.motor.id,
      controllerId: null,
      displayId: solution.display?.id ?? null,
      batteryId: solution.battery.id,
      chargerId: recommendedChargerId,
      chargingPortId: recommendedPortId,
      baseline: { weightKg: solution.weightKg, rangeKm: solution.rangeKm, costLabel: solution.costLabel },
    })
  }

  return (
    <div>
      <StepHeader
        step={3}
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
        <div id="field-solutions" className="responsive-product-grid">
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
