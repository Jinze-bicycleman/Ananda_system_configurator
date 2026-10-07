"use client"

import { useReportData, PACKAGE_ITEM_LABELS, thirdPartyValue } from "@/lib/ananda-report"
import { hasThirdPartySupplier, type PackageItemKey } from "@/lib/ananda-store"
import { StepHeader } from "./ui-primitives"
import { AlertTriangle, CheckCircle2, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

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

function Row({
  label,
  value,
  highlight,
  warn,
  thirdParty,
}: {
  label: string
  value: string
  highlight?: boolean
  warn?: boolean
  thirdParty?: boolean
}) {
  return (
    <div
      className={cn(
        "spec-row py-1.5 border-b border-border/40 last:border-0",
        thirdParty && "-mx-2 border-l-4 border-l-warning bg-warning/15 px-2",
      )}
    >
      <span className="text-[11px] font-sans uppercase tracking-wider text-muted-foreground">{label}</span>
      <span
        className={cn(
          "spec-value text-[12px] font-sans font-semibold tabular-nums",
          thirdParty ? "text-warning-foreground" : warn ? "text-warning" : highlight ? "text-primary" : "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  )
}

function PackageRow({ s, itemKey, fallback }: { s: Parameters<typeof hasThirdPartySupplier>[0]; itemKey: PackageItemKey; fallback: string }) {
  const thirdParty = hasThirdPartySupplier(s, itemKey)
  return (
    <Row
      label={PACKAGE_ITEM_LABELS[itemKey]}
      value={thirdParty ? thirdPartyValue(s.thirdPartySuppliers[itemKey] ?? "") : fallback}
      thirdParty={thirdParty}
      warn={!thirdParty && fallback === "—"}
    />
  )
}

export function Step7Report() {
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
    systemWeightKg,
    isMid,
    cableRows,
    thirdPartyItems,
    climbing,
    scopeOfSupplyItems,
    salesConsultationItems,
  } = useReportData()

  return (
    <div>
      <StepHeader
        step={7}
        title="Final Configuration Report"
        subtitle="Complete system summary. Review all selections, then download the PDF report below."
      />

      {/* ─── 3rd Party Supplier Components ─── */}
      {thirdPartyItems.length > 0 && (
        <div className="mb-5 border-2 border-warning bg-warning/10 px-5 py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[11px] font-sans font-black uppercase tracking-[0.15em] text-graphite">
                3rd Party Supplier Components
              </p>
              <ul className="mt-2 space-y-1">
                {thirdPartyItems.map((item) => (
                  <li key={item.key} className="text-sm font-sans text-graphite">
                    <span className="font-bold uppercase">{item.label}:</span>{" "}
                    {item.supplier.trim() || <span className="italic text-muted-foreground">supplier name not provided</span>}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs font-body leading-relaxed text-muted-foreground">
                Full technical documents and component samples are required for integration and compatibility testing. This
                introduces extra cost and delivery time; contact sales for details.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Risks & Assumptions ─── */}
      <ReportSection title="Risks & Assumptions">
        <p className="text-xs font-body leading-relaxed text-muted-foreground mb-2">
          Configuration is compatible with the selected regulation based on rated power and speed limit inputs.
        </p>
        <p className="text-xs font-body leading-relaxed text-muted-foreground">
          Complete bicycle certification requires final vehicle testing and validation; this report is a planning estimate only.
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
        {isMid ? (
          <Row label="Controller" value="Integrated" />
        ) : (
          <PackageRow s={s} itemKey="controllerId" fallback={controller ? controller.model : "—"} />
        )}
        <PackageRow s={s} itemKey="displayId" fallback={display ? display.model : "—"} />
        {!isMid && (
          <PackageRow s={s} itemKey="torqueSensorId" fallback={torqueSensorSkipped ? "Not Needed" : s.torqueSensorId ?? "—"} />
        )}
        <PackageRow s={s} itemKey="speedSensorId" fallback={speedSensorSkipped ? "Not Needed" : s.speedSensorId ?? "—"} />
      </ReportSection>

      {/* ─── Drivetrain ─── */}
      <ReportSection title="Drivetrain">
        {s.selectedChainringTeeth != null && <Row label="Chainring (Bike Components)" value={`${s.selectedChainringTeeth}T`} />}
        {s.frontTeeth != null && <Row label="Front Chainring" value={`${s.frontTeeth}T`} />}
        {s.rearTeeth != null && <Row label="Smallest Rear Sprocket" value={`${s.rearTeeth}T`} />}
        {s.largestRearTeeth != null && <Row label="Largest Rear Sprocket" value={`${s.largestRearTeeth}T`} />}
        {s.gvwKg != null && <Row label="Estimated GVW" value={`${s.gvwKg} kg`} />}

        <div className="mt-3 flex items-start gap-2 bg-surface border-l-2 border-primary px-4 py-3">
          <p className="text-xs font-body text-muted-foreground">
            {isMid
              ? "Mid-drive motor torque passes through the drivetrain. Gearing selection directly affects speed range, climbing torque and drivetrain load."
              : "Hub motor torque is delivered directly at the wheel. Pedal drivetrain gearing mainly affects rider cadence and pedalling comfort."}
          </p>
        </div>
      </ReportSection>

      {/* ─── Climbing Ability ──������� */}
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
                {["Connection", "Connector", "Pins", "Cable Type", "Length", "Extension"].map((h) => (
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
                  <td className="px-3 py-2 font-body text-muted-foreground">
                    {c.extensionLengthM != null ? `+${c.extensionLengthM.toFixed(2)} m` : "—"}
                  </td>
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
        <PackageRow s={s} itemKey="batteryId" fallback={batterySkipped ? "Not Needed" : battery ? battery.model : "—"} />
        {battery?.capacity_wh && <Row label="Capacity" value={`${battery.capacity_wh} Wh`} />}
        {battery?.weight_kg && <Row label="Battery Weight" value={`${battery.weight_kg} kg`} />}
        <PackageRow s={s} itemKey="chargerId" fallback={charger ? charger.model : "—"} />
        <PackageRow s={s} itemKey="chargingPortId" fallback={chargingPort ? chargingPort.model : "—"} />
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

      {/* ─── Scope of Supply ─── */}
      <ReportSection title="Scope of Supply">
        {scopeOfSupplyItems.length === 0 ? (
          <p className="text-xs text-muted-foreground">No components have been selected yet.</p>
        ) : (
          scopeOfSupplyItems.map((item, i) => <Row key={`${item.label}-${i}`} label={item.label} value={item.value} thirdParty={item.thirdParty} />)
        )}
      </ReportSection>

      {/* ─── Requires Sample / Additional Cost / Sales Consultation ─── */}
      <ReportSection title="Requires Sample, Additional Cost, or Sales Consultation">
        {salesConsultationItems.length === 0 ? (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <p className="text-sm font-body text-foreground">
              No items in this configuration currently require a sample, additional cost, or sales-team consultation.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {salesConsultationItems.map((msg, i) => (
              <div key={i} className="flex items-start gap-2 border border-warning/30 bg-warning/10 px-3 py-2">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                <p className="text-xs font-body text-warning-foreground/90">{msg}</p>
              </div>
            ))}
          </div>
        )}
      </ReportSection>

      {/* ─── System Compatibility ─── */}
      <ReportSection title="System Compatibility Check">
        {[
          { ok: !!s.motorId, label: "Motor package selected" },
          { ok: !(s.driveType === "hub" && !s.controllerId && !hasThirdPartySupplier(s, "controllerId")), label: "Controller configured" },
          {
            ok: !(s.driveType === "hub" && !s.torqueSensorId && !torqueSensorSkipped && !hasThirdPartySupplier(s, "torqueSensorId")),
            label: "Pedal sensing configured",
          },
          { ok: !!s.speedSensorId || speedSensorSkipped || hasThirdPartySupplier(s, "speedSensorId"), label: "Speed sensor configured" },
          { ok: !!s.batteryId || batterySkipped || hasThirdPartySupplier(s, "batteryId"), label: "Battery configured" },
          { ok: Boolean(s.frontTeeth && s.rearTeeth && s.largestRearTeeth), label: "Drivetrain configured" },
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
