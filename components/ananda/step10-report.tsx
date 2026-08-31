"use client"

import { displayName } from "@/lib/ananda-drivetrain"
import { useReportData, TRANSMISSION_LABEL } from "@/lib/ananda-report"
import { StepHeader, SectionLabel } from "./ui-primitives"
import { AlertTriangle, ArrowRight, CheckCircle2, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

const FEASIBILITY_LABEL: Record<"go" | "conditional_go" | "no_go", { label: string; cls: string }> = {
  go: { label: "Go", cls: "bg-primary/10 text-primary border-primary/30" },
  conditional_go: { label: "Conditional Go", cls: "bg-warning/10 text-warning-foreground border-warning/30" },
  no_go: { label: "No-Go", cls: "bg-destructive/10 text-destructive border-destructive/30" },
}

const STATUS_DOT: Record<string, string> = {
  met: "bg-primary",
  conditional: "bg-warning",
  not_met: "bg-destructive",
  missing: "bg-border",
}

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 min-w-0 border border-border bg-white">
      <div className="h-1 shrink-0 bg-primary" />
      <div className="border-b border-border bg-surface px-5 py-3">
        <p className="text-[11px] font-sans font-black uppercase tracking-[0.15em] text-graphite">{title}</p>
      </div>
      <div className="min-w-0 p-5">{children}</div>
    </div>
  )
}

function Row({ label, value, highlight, warn }: { label: string; value: string; highlight?: boolean; warn?: boolean }) {
  return (
    <div className="spec-row py-1.5 border-b border-border/40 last:border-0">
      <span className="text-[11px] font-sans uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={cn("spec-value text-[12px] font-sans font-semibold tabular-nums", warn ? "text-warning" : highlight ? "text-primary" : "text-foreground")}>
        {value}
      </span>
    </div>
  )
}

export function Step10Report() {
  const {
    s,
    motor,
    controller,
    display,
    battery,
    charger,
    chargingPort,
    accessories,
    torqueSensorSkipped,
    speedSensorSkipped,
    batterySkipped,
    selectedDrivetrainComponents,
    selectedBelt,
    systemWeightKg,
    isMid,
    cableRows,
    targetStatusRows,
    feasibility,
    changeImpact,
    currentCostLabel,
    climbing,
  } = useReportData()

  const feasibilityInfo = FEASIBILITY_LABEL[feasibility]
  const unmetRows = targetStatusRows.filter((r) => r.status === "not_met" || r.status === "missing")

  return (
    <div>
      <StepHeader
        step={9}
        title="Final Configuration Report"
        subtitle="Complete system summary. Review all selections and drivetrain outputs, then download the PDF report below."
      />

      {/* ─── Overall Feasibility ─── */}
      <div className={cn("mb-5 flex flex-wrap items-center justify-between gap-4 border-2 px-5 py-4", feasibilityInfo.cls)}>
        <div className="min-w-0">
          <p className="text-[11px] font-sans font-bold uppercase tracking-[0.2em]">Overall Feasibility</p>
          <p className="mt-1 text-2xl font-sans font-black uppercase tracking-tight">{feasibilityInfo.label}</p>
        </div>
        <p className="max-w-xs min-w-0 text-xs font-body leading-relaxed opacity-80 sm:text-right">
          {feasibility === "go"
            ? "All Must-have and Target requirements are currently met."
            : feasibility === "conditional_go"
              ? "Must-haves are met, but one or more Target requirements are not fully satisfied."
              : "One or more Must-have requirements are not met by the current configuration."}
        </p>
      </div>

      {/* ─── Product Target Summary ─── */}
      <ReportSection title="Product Target Summary">
        <Row
          label="Weight Target"
          value={s.productTargets.weight.maxKg != null ? `≤ ${s.productTargets.weight.maxKg} kg (${s.productTargets.weight.level})` : "No target set"}
        />
        <Row
          label="Torque Target"
          value={
            s.productTargets.performance.torqueTargetNm != null
              ? `≥ ${s.productTargets.performance.torqueTargetNm} Nm (${s.productTargets.performance.torqueLevel})`
              : "No target set"
          }
        />
        <Row
          label="Range Target"
          value={
            s.productTargets.performance.rangeTargetKm != null
              ? `≥ ${s.productTargets.performance.rangeTargetKm} km (${s.productTargets.performance.rangeLevel})`
              : "No target set"
          }
        />
        <Row label="Market Positioning" value={s.productTargets.ambition.positioning ?? "—"} />
        <Row label="Cost Priority" value={s.productTargets.ambition.costPriority ?? "—"} />
      </ReportSection>

      {/* ─── Requirement Satisfaction Matrix ─── */}
      <ReportSection title="Requirement Satisfaction Matrix">
        <div className="space-y-1.5">
          {targetStatusRows.map((r) => (
            <div key={r.dimension} className="flex items-start justify-between gap-3 border-b border-border/40 py-1.5 last:border-0">
              <div className="flex items-start gap-2 min-w-0">
                <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", STATUS_DOT[r.status])} />
                <div className="min-w-0">
                  <p className="text-[12px] font-sans font-semibold text-foreground leading-tight">{r.dimension}</p>
                  <p className="text-xs text-muted-foreground leading-snug">Target: {r.targetLabel}</p>
                </div>
              </div>
              <span className="max-w-[42%] shrink-0 text-[12px] font-sans font-bold tabular-nums text-graphite text-right leading-tight">{r.currentLabel}</span>
            </div>
          ))}
        </div>
      </ReportSection>

      {/* ─── Recommended Configuration & Rationale ─── */}
      <ReportSection title="Recommended Configuration & Rationale">
        <Row label="Selected Solution" value={s.selectedSolutionId ? s.selectedSolutionId.replace("_", " ").toUpperCase() : "—"} />
        <Row label="Motor" value={motor ? motor.model : "—"} />
        <Row label="Battery" value={battery ? battery.model : "—"} />
        <Row label="Display" value={display ? display.model : "—"} />
        <Row label="Current Cost Level" value={currentCostLabel} />
        <p className="mt-2 text-xs font-body text-muted-foreground">
          {s.selectedSolutionId
            ? "This configuration was selected from the ranked recommendations generated against the Product Targets on Step 3."
            : "No recommended solution has been applied yet — components below reflect manual configuration."}
        </p>
        {changeImpact.weight && changeImpact.range && changeImpact.cost && (
          <div className="mt-3 space-y-1.5 border-t border-border pt-3">
            <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-muted-foreground">Since Recommendation Applied</p>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted-foreground">Weight</span>
              <span className="flex items-center gap-1.5 font-sans font-bold">
                {changeImpact.weight[0].toFixed(1)} kg <ArrowRight className="h-3 w-3 text-muted-foreground" /> {changeImpact.weight[1].toFixed(1)} kg
              </span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted-foreground">Range</span>
              <span className="flex items-center gap-1.5 font-sans font-bold">
                {changeImpact.range[0]} km <ArrowRight className="h-3 w-3 text-muted-foreground" /> {changeImpact.range[1]} km
              </span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted-foreground">Cost Level</span>
              <span className="flex items-center gap-1.5 font-sans font-bold">
                {changeImpact.cost[0]} <ArrowRight className="h-3 w-3 text-muted-foreground" /> {changeImpact.cost[1]}
              </span>
            </div>
          </div>
        )}
      </ReportSection>

      {/* ─── Unmet Requirements ─── */}
      <ReportSection title="Unmet Requirements">
        {unmetRows.length === 0 ? (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <p className="text-sm font-body text-foreground">All defined requirements are currently met by the selected configuration.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {unmetRows.map((r) => (
              <div key={r.dimension} className="flex items-start gap-2 border border-warning/30 bg-warning/10 px-3 py-2">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                <p className="text-xs font-body text-warning-foreground/90">
                  <span className="font-semibold text-foreground">{r.dimension}:</span> target {r.targetLabel}, current {r.currentLabel}.
                </p>
              </div>
            ))}
          </div>
        )}
      </ReportSection>

      {/* ─── Risks, Conditions & Assumptions ─── */}
      <ReportSection title="Risks, Conditions & Assumptions">
        <p className="text-xs font-body leading-relaxed text-muted-foreground mb-2">
          Configuration is compatible with the selected regulation based on rated power and speed limit inputs.
        </p>
        <p className="text-xs font-body leading-relaxed text-muted-foreground mb-2">
          Complete bicycle certification requires final vehicle testing and validation; this report is a planning estimate only.
        </p>
        <p className="text-xs font-body leading-relaxed text-muted-foreground">
          Range and cost-tier figures are heuristic estimates derived from battery capacity and motor model, not final priced or lab-tested values.
        </p>
      </ReportSection>

      {/* ─── Project Context ─── */}
      <ReportSection title="Project Context">
        <Row label="Sell Market" value={s.sellRegion ?? "—"} />
        <Row label="Regulation" value={s.regulation ?? "—"} />
        <Row label="Speed Limit" value={s.speedLimitKmh ? `${s.speedLimitKmh} km/h` : "—"} />
        <Row label="Rated Power" value={s.ratedPowerW ? `${s.ratedPowerW} W` : "—"} />
        <Row label="Bike Category" value={s.bikeCategory ?? "—"} />
        <Row label="Wheel Size" value={s.wheelSize ?? "—"} />
        <Row label="Tyre Width" value={s.tyreWidth ?? "—"} />
        <Row label="Circumference" value={s.tyreCircumferenceMm ? `${s.tyreCircumferenceMm} mm` : "Default 2200 mm"} />
      </ReportSection>

      {/* ─── Drive System & Package ─── */}
      <ReportSection title="Drive System & Package">
        <Row label="Drive Type" value={s.driveType === "mid" ? "Mid-Drive" : s.driveType === "hub" ? "Hub Motor" : "—"} highlight />
        <Row label="Voltage Platform" value={s.voltagePlatform ? `${s.voltagePlatform}V` : "—"} highlight />
        <Row label="Motor Package" value={motor ? motor.model : "—"} />
        <Row label="Motor Power" value={motor?.rated_power_w ? `${motor.rated_power_w}W` : "—"} />
        <Row label="Motor Torque" value={motor?.torque_nm ? `${motor.torque_nm} Nm` : "—"} />
        {motor?.weight_kg && <Row label="Motor Weight" value={`${motor.weight_kg} kg`} />}
      </ReportSection>

      {/* ─── Package Configuration ─── */}
      <ReportSection title="Package Configuration">
        <Row label="Controller" value={isMid ? "Integrated" : controller ? controller.model : "—"} />
        <Row label="Display (HMI)" value={display ? display.model : "—"} />
        {!isMid && <Row label="Torque Sensor" value={torqueSensorSkipped ? "Not Needed" : s.torqueSensorId ? s.torqueSensorId : "—"} warn={!torqueSensorSkipped && !s.torqueSensorId} />}
        <Row label="Speed Sensor" value={speedSensorSkipped ? "Not Needed" : s.speedSensorId ? s.speedSensorId : "—"} warn={!speedSensorSkipped && !s.speedSensorId} />
      </ReportSection>

      {/* ─── Drivetrain ─── */}
      <ReportSection title="Drivetrain">
        <Row label="Drive Type" value={s.drivetrainType === "chain" ? "Chain Drive" : s.drivetrainType === "belt" ? "Belt Drive" : "—"} highlight />
        <Row label="Transmission Type" value={s.transmissionType ? TRANSMISSION_LABEL[s.transmissionType] ?? s.transmissionType : "—"} />
        {s.frontTeeth != null && <Row label="Front Chainring / Pulley" value={`${s.frontTeeth}T`} />}
        {s.rearTeeth != null && <Row label="Smallest Rear Sprocket" value={`${s.rearTeeth}T`} />}
        {s.largestRearTeeth != null && <Row label="Largest Rear Sprocket" value={`${s.largestRearTeeth}T`} />}
        {s.gvwKg != null && <Row label="Estimated GVW" value={`${s.gvwKg} kg`} />}

        {selectedDrivetrainComponents.length > 0 && (
          <div className="pt-2">
            <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-muted-foreground mb-1.5 mt-2">
              Selected Components
            </p>
            {selectedDrivetrainComponents.map((c) => (
              <Row key={c.id} label={c.category.replace(/_/g, " ")} value={displayName(c)} />
            ))}
            {selectedBelt && <Row label="Belt" value={displayName(selectedBelt)} />}
          </div>
        )}

        {s.selectedComponentIds.length === 0 && (
          <p className="mt-2 text-xs text-muted-foreground">No drivetrain components have been selected yet.</p>
        )}

        <div className="mt-3 flex items-start gap-2 bg-surface border-l-2 border-primary px-4 py-3">
          <p className="text-xs font-body text-muted-foreground">
            {isMid
              ? "Mid-drive motor torque passes through the drivetrain. Gearing selection directly affects speed range, climbing torque and drivetrain load."
              : "Hub motor torque is delivered directly at the wheel. Pedal drivetrain gearing mainly affects rider cadence and pedalling comfort."}
          </p>
        </div>

        {s.drivetrainErrors.length > 0 && (
          <div className="mt-3 space-y-2">
            {s.drivetrainErrors.map((msg, i) => (
              <div key={i} className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm font-body text-destructive">{msg}</p>
              </div>
            ))}
          </div>
        )}

        {s.drivetrainErrors.length === 0 && s.drivetrainWarnings.length > 0 && (
          <div className="mt-3 space-y-2">
            {s.drivetrainWarnings.map((msg, i) => (
              <div key={i} className="flex items-start gap-2 bg-warning/10 border border-warning/30 px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                <p className="text-sm font-body text-warning-foreground">{msg}</p>
              </div>
            ))}
          </div>
        )}
      </ReportSection>

      {/* ─── Climbing Ability ─── */}
      <ReportSection title="Climbing Ability">
        <Row label="Rider Weight" value={`${climbing.riderWeightKg} kg`} />
        <Row label="Assistance Mode" value={climbing.assistanceModeLabel} />
        <Row label="Pedal Effort" value={climbing.pedalEffortLabel} />

        {!climbing.result ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Motor, drivetrain gearing and wheel circumference must be configured to estimate climbing ability.
          </p>
        ) : climbing.result.status === "missing-data" ? (
          <div className="mt-3 flex items-start gap-2 bg-warning/10 border border-warning/30 px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
            <p className="text-sm font-body text-warning-foreground">
              Missing {climbing.result.missingFields.join(", ")} — climbing ability cannot be estimated.
            </p>
          </div>
        ) : (
          <>
            <Row label="Motor-Assist Torque" value={`${Math.round(climbing.result.assistance.motorTorqueDeliveredNm * 10) / 10} Nm`} />
            <Row label="Total Wheel Torque" value={`${Math.round(climbing.result.totalWheelTorqueNm * 10) / 10} Nm`} />
            {climbing.result.status === "exceeded" ? (
              <div className="mt-3 flex items-start gap-2 bg-surface border-l-2 border-primary px-4 py-3">
                <p className="text-xs font-body text-muted-foreground">
                  The theoretical force model limit is exceeded; real performance will be traction- and geometry-limited.
                </p>
              </div>
            ) : (
              <>
                <Row label="Maximum Theoretical Grade" value={`${climbing.result.gradePercent?.toFixed(1)}%`} highlight />
                {climbing.result.scenario && <Row label="Comparable To" value={climbing.result.scenario.label} />}
              </>
            )}
            <div className="mt-3 flex items-start gap-2 bg-surface border-l-2 border-primary px-4 py-3">
              <p className="text-xs font-body text-muted-foreground">
                Sustained real-world climbing also depends on motor power and efficiency at operating speed, thermal
                limits, tyre traction, bicycle geometry and balance, road surface, rolling resistance, and wind and
                rider technique.
              </p>
            </div>
          </>
        )}
      </ReportSection>

      {/* ─── Cable & Harness Specification ─── */}
      <ReportSection title="Cable & Harness Specification">
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-graphite text-white">
                {["Connection", "Connector", "Pins", "Cable Type", "Length"].map((h) => (
                  <th key={h} className="px-3 py-2 font-sans font-bold uppercase tracking-wider text-left text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cableRows.map((c, i) => (
                <tr key={c.connection} className={i % 2 === 0 ? "bg-white" : "bg-surface"}>
                  <td className="px-3 py-2 font-sans font-semibold text-foreground">{c.connection}</td>
                  <td className="px-3 py-2 font-body text-muted-foreground">{c.connector}</td>
                  <td className="px-3 py-2 font-sans font-bold text-foreground">{c.pins}</td>
                  <td className="px-3 py-2 font-body text-muted-foreground">{c.cableType}</td>
                  <td className="px-3 py-2 font-sans font-bold text-primary">{c.lengthM.toFixed(1)} m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs font-body leading-relaxed text-muted-foreground mt-3">
          Cable lengths reflect the values set on the System Diagram step and are included in the downloadable PDF report.
        </p>
      </ReportSection>

      {/* ─── Battery / Charger ─── */}
      <ReportSection title="Battery & Charging">
        <Row label="Battery" value={batterySkipped ? "Not Needed" : battery ? battery.model : "—"} />
        {battery?.capacity_wh && <Row label="Capacity" value={`${battery.capacity_wh} Wh`} />}
        {battery?.weight_kg && <Row label="Battery Weight" value={`${battery.weight_kg} kg`} />}
        <Row label="Charger" value={charger ? charger.model : "—"} />
        <Row label="Charging Port" value={chargingPort ? chargingPort.model : "—"} />
      </ReportSection>

      {/* ─── Accessories ─── */}
      {accessories.length > 0 && (
        <ReportSection title="Accessories">
          {accessories.map((a) => (
            <Row key={a.id} label={a.category.toUpperCase()} value={a.name} />
          ))}
        </ReportSection>
      )}

      {/* ─── System Weight Estimate ─── */}
      {systemWeightKg > 0 && (
        <ReportSection title="System Weight Estimate">
          {motor?.weight_kg && <Row label="Motor" value={`${motor.weight_kg} kg`} />}
          {battery?.weight_kg && <Row label="Battery" value={`${battery.weight_kg} kg`} />}
          <div className="flex items-center justify-between pt-2 mt-2 border-t border-border">
            <span className="text-[11px] font-sans font-black uppercase tracking-wider text-graphite">Total (Motor + Battery)</span>
            <span className="text-lg font-sans font-black tabular-nums text-primary">{systemWeightKg.toFixed(1)} kg</span>
          </div>
          <p className="text-xs font-body leading-relaxed text-muted-foreground mt-2">
            Weight estimate includes motor and battery only. Accessories, sensors, and ancillary components are not included in this total.
          </p>
        </ReportSection>
      )}

      {/* ─── System Compatibility ─── */}
      <ReportSection title="System Compatibility Check">
        {[
          { ok: !!s.motorId, label: "Motor package selected" },
          { ok: !(s.driveType === "hub" && !s.controllerId), label: "Controller configured" },
          { ok: !(s.driveType === "hub" && !s.torqueSensorId && !torqueSensorSkipped), label: "Pedal sensing configured" },
          { ok: !!s.speedSensorId || speedSensorSkipped, label: "Speed sensor configured" },
          { ok: !!s.batteryId || batterySkipped, label: "Battery configured" },
          {
            ok: Boolean(s.drivetrainType && s.transmissionType && s.selectedComponentIds.length > 0 && s.drivetrainErrors.length === 0),
            label: "Drivetrain system configured",
          },
        ].map(({ ok, label }) => (
          <div key={label} className="flex items-center gap-2 py-1.5 border-b border-border/40 last:border-0">
            {ok ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-warning flex-shrink-0" />
            )}
            <span className={cn("text-xs font-body", ok ? "text-foreground" : "text-warning")}>{label}</span>
          </div>
        ))}
      </ReportSection>

      {/* Footer actions */}
      <div className="flex items-center justify-end mt-6">
        <button
          onClick={s.resetConfig}
          className="flex items-center gap-2 px-4 py-2 border border-border text-sm font-sans font-semibold text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Start New Configuration
        </button>
      </div>
    </div>
  )
}
