"use client"

import { useEffect, useMemo, useState } from "react"
import { useAnandaStore, type AnandaConfig } from "@/lib/ananda-store"
import { useMotors } from "@/lib/ananda-packages"
import { StepHeader } from "./ui-primitives"
import { DrivetrainSummary } from "./drivetrain/drivetrain-summary"
import { DriveTypeCards } from "./drivetrain/drive-type-cards"
import { TransmissionTypePicker } from "./drivetrain/transmission-type-picker"
import { RecommendationCards } from "./drivetrain/recommendation-cards"
import { AdvancedConfiguration } from "./drivetrain/advanced-configuration"
import { BeltFrameRequirements } from "./drivetrain/belt-frame-requirements"
import { PerformanceDashboard } from "./drivetrain/performance-dashboard"
import { SpeedCadenceGraph } from "./drivetrain/speed-cadence-graph"
import { SpecDrawer } from "./drivetrain/spec-drawer"
import { DrivetrainLoadingState, DrivetrainErrorState, InlineWarning, InlineError, InlineInfo } from "./drivetrain/drivetrain-states"
import { Switch } from "@/components/ui/switch"
import {
  useDrivetrainData,
  buildChainDerailleurRecommendations,
  buildBeltHubRecommendations,
  primaryRatio,
  callDrivetrainPerformanceRpc,
  calculateEnvioloBoundaries,
  evaluateCompatibility,
  type CompatibilityContext,
  type DrivetrainComponent,
  type DrivetrainPerformanceRow,
  type RecommendationCard,
} from "@/lib/ananda-drivetrain"

export function Step6DrivetrainSelection({ onEditStep }: { onEditStep?: (stepNumber: number) => void }) {
  const s = useAnandaStore()
  const { motors } = useMotors()
  const motor = motors.find((m) => m.id === s.motorId) ?? null
  const { catalogue, compatibility, torqueLimits, rules, isLoading, error } = useDrivetrainData()
  const data = useMemo(() => ({ catalogue, compatibility, torqueLimits, rules }), [catalogue, compatibility, torqueLimits, rules])

  const [specComponent, setSpecComponent] = useState<DrivetrainComponent | null>(null)
  const [gvwInput, setGvwInput] = useState(s.gvwKg != null ? String(s.gvwKg) : "")
  const [performanceRows, setPerformanceRows] = useState<DrivetrainPerformanceRow[] | null>(null)
  const [performanceLoading, setPerformanceLoading] = useState(false)

  const isMid = s.driveType === "mid"
  // Prefer the selected motor's own recorded type; fall back to the drive-type
  // selection from Step 3 if the motor hasn't loaded yet.
  const motorType: "mid_drive" | "hub" = motor?.motor_type ?? (isMid ? "mid_drive" : "hub")
  const isSpeedPedelec = (s.regulation ?? "").toLowerCase().includes("speed") || (s.speedLimitKmh ?? 0) > 25
  const wheelSizeInch = s.wheelSize ? Number.parseFloat(s.wheelSize) || null : null

  const frameBeltRequirementsMet =
    s.drivetrainType !== "belt"
      ? null
      : s.frameHasBeltOpening === false && !s.beltAlternateInstallationApproved
        ? false
        : s.frameHasBeltOpening != null &&
            s.tensioningMethod != null &&
            s.frameStiffnessVerified === "yes" &&
            s.frontPulleyClearanceVerified &&
            s.rearPulleyClearanceVerified &&
            s.beltlineVerified
          ? true
          : null

  const ctx: CompatibilityContext = useMemo(
    () => ({
      motorTorqueNm: motor?.torque_nm ?? null,
      motorType,
      gvwKg: s.gvwKg,
      primaryRatio: s.frontTeeth && s.rearTeeth ? primaryRatio(s.frontTeeth, s.rearTeeth) : null,
      isSpeedPedelec,
      wheelSizeInch,
      frameBeltRequirementsMet,
    }),
    [motor, motorType, s.gvwKg, s.frontTeeth, s.rearTeeth, isSpeedPedelec, wheelSizeInch, frameBeltRequirementsMet],
  )

  // Recommendation cards are only meaningful for the two transmission types
  // that have a dedicated recommendation builder: derailleur (chain drive)
  // and CVT (enviolo, belt drive only — see getAvailableTransmissionTypes:
  // the catalogue has no compatibility data pairing enviolo hubs with a
  // chain-side sprocket, so CVT is not offered on chain drive). Stepped
  // internal-gear hubs (Shimano Nexus) and single-speed builds don't have a
  // recommendation builder, so no cards are shown for those — showing
  // derailleur-based cards there would misrepresent the selected transmission.
  const recommendations = useMemo(() => {
    const empty = { climbing: null, balanced: null, speed: null }
    if (!s.drivetrainType || !s.transmissionType || isLoading) return empty
    if (s.drivetrainType === "chain" && s.transmissionType === "derailleur") {
      return buildChainDerailleurRecommendations(data, ctx)
    }
    if (s.drivetrainType === "belt" && s.transmissionType === "cvt") {
      return buildBeltHubRecommendations(data, ctx)
    }
    return empty
  }, [s.drivetrainType, s.transmissionType, data, ctx, isLoading])

  const selectedComponents = s.selectedComponentIds
    .map((id) => catalogue.find((c) => c.id === id))
    .filter((c): c is DrivetrainComponent => Boolean(c))

  const frontComponent = selectedComponents.find((c) => ["chainring", "front_pulley"].includes(c.category)) ?? null
  const rearComponent = selectedComponents.find((c) =>
    ["cassette", "rear_pulley", "internal_gear_hub", "rear_sprocket"].includes(c.category),
  ) ?? null
  const hubComponent = selectedComponents.find((c) => c.category === "internal_gear_hub") ?? null
  const belts = catalogue.filter((c) => c.category === "belt")
  const selectedBelt = s.selectedBeltId ? catalogue.find((c) => c.id === s.selectedBeltId) ?? null : null

  // Aggregate compatibility across all selected pairs
  const pairMessages: string[] = []
  let worstColor: "green" | "amber" | "red" = "green"
  for (let i = 0; i < selectedComponents.length; i++) {
    for (let j = i + 1; j < selectedComponents.length; j++) {
      const r = evaluateCompatibility(selectedComponents[i], selectedComponents[j], ctx, data)
      pairMessages.push(...r.messages)
      if (r.status === "red") worstColor = "red"
      else if (r.status === "amber" && worstColor !== "red") worstColor = "amber"
    }
  }

  // Motors are not modeled as drivetrain components, so they never appear in
  // drivetrain_compatibility. For a mid-drive motor, its torque passes through
  // this drivetrain and its physical interface has not been engineering
  // verified against these specific components — flag that as an amber
  // warning rather than silently ignoring it. A hub motor's torque never
  // passes through the pedal drivetrain, so no warning is needed there.
  if (motor && isMid && selectedComponents.length > 0) {
    pairMessages.push(
      `Motor-to-drivetrain interface requires engineering verification — ${motor.model} does not yet have a recorded compatibility relationship with the selected drivetrain components.`,
    )
    if (worstColor !== "red") worstColor = "amber"
  }

  // Sync computed warnings/errors into the store so hasDrivetrain() gates correctly
  useEffect(() => {
    const errors = worstColor === "red" ? pairMessages : []
    const warnings = worstColor === "amber" ? pairMessages : []
    if (JSON.stringify(errors) !== JSON.stringify(s.drivetrainErrors)) s.setField("drivetrainErrors", errors)
    if (JSON.stringify(warnings) !== JSON.stringify(s.drivetrainWarnings)) s.setField("drivetrainWarnings", warnings)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worstColor, JSON.stringify(pairMessages)])

  // Determine gear ratio inputs for performance dashboard
  const derailleurRatios = useMemo(() => {
    if (s.transmissionType !== "derailleur" || !rearComponent) return null
    return rearComponent.tooth_counts ?? (rearComponent.teeth != null ? [rearComponent.teeth] : null)
  }, [s.transmissionType, rearComponent])

  const enviolo = useMemo(() => {
    if (s.transmissionType !== "cvt" || !hubComponent || !s.frontTeeth || !s.rearTeeth) return null
    if (hubComponent.minimum_internal_ratio == null || hubComponent.maximum_internal_ratio == null) return null
    const circumference = s.tyreCircumferenceMm ?? 2200
    return calculateEnvioloBoundaries(
      s.frontTeeth,
      s.rearTeeth,
      hubComponent.minimum_internal_ratio,
      hubComponent.maximum_internal_ratio,
      circumference,
      motor?.torque_nm ?? null,
      s.drivetrainEfficiency,
    )
  }, [s.transmissionType, hubComponent, s.frontTeeth, s.rearTeeth, s.tyreCircumferenceMm, motor, s.drivetrainEfficiency])

  useEffect(() => {
    let active = true
    async function run() {
      if (!derailleurRatios || !s.frontTeeth || derailleurRatios.length === 0) {
        setPerformanceRows(null)
        return
      }
      setPerformanceLoading(true)
      try {
        const rows = await callDrivetrainPerformanceRpc({
          frontTeeth: s.frontTeeth,
          rearTeeth: derailleurRatios,
          internalRatios: [1],
          wheelCircumferenceMm: s.tyreCircumferenceMm ?? 2200,
          crankInputTorqueNm: motor?.torque_nm ?? null,
          drivetrainEfficiency: s.drivetrainEfficiency,
        })
        if (active) setPerformanceRows(rows)
      } catch {
        if (active) setPerformanceRows(null)
      } finally {
        if (active) setPerformanceLoading(false)
      }
    }
    run()
    return () => {
      active = false
    }
  }, [derailleurRatios, s.frontTeeth, s.tyreCircumferenceMm, motor, s.drivetrainEfficiency])

  const primaryRatioValue = s.frontTeeth && s.rearTeeth ? primaryRatio(s.frontTeeth, s.rearTeeth) : null
  const chainOrBeltlineLabel = useMemo(() => {
    const withLine = selectedComponents.find((c) => c.chainline_mm != null || c.beltline_mm != null)
    if (!withLine) return "—"
    return String(withLine.chainline_mm ?? withLine.beltline_mm ?? "—")
  }, [selectedComponents])

  const handleSelectRecommendation = (card: RecommendationCard) => {
    s.setField("transmissionType", card.transmissionType)
    s.setField("selectedComponentIds", card.componentIds)
    s.setField("frontTeeth", card.front.teeth ?? card.front.tooth_counts?.[0] ?? null)
    s.setField("rearTeeth", card.rear.teeth ?? card.rear.tooth_counts?.[0] ?? null)
    s.setField("warningsAcknowledged", false)
  }

  const handleSlotChange = (slotIndex: number, componentId: string) => {
    const next = [...s.selectedComponentIds]
    next[slotIndex] = componentId
    for (let i = slotIndex + 1; i < next.length; i++) next[i] = ""
    s.setField("selectedComponentIds", next.filter((v, idx) => idx <= slotIndex || v))
    const component = catalogue.find((c) => c.id === componentId)
    if (component) {
      if (["chainring", "front_pulley"].includes(component.category)) {
        s.setField("frontTeeth", component.teeth)
      }
      if (["rear_sprocket"].includes(component.category)) {
        s.setField("rearTeeth", component.teeth)
      }
      if (component.category === "cassette" && component.tooth_counts) {
        s.setField("rearTeeth", Math.min(...component.tooth_counts))
      }
      if (component.category === "rear_pulley") {
        s.setField("rearTeeth", component.teeth)
      }
    }
    s.setField("warningsAcknowledged", false)
  }

  const handleGvwBlur = () => {
    const parsed = gvwInput ? Number.parseFloat(gvwInput) : null
    s.setField("gvwKg", Number.isFinite(parsed as number) ? parsed : null)
  }

  if (isLoading) {
    return (
      <div>
        <StepHeader
          step={6}
          title="Drivetrain System"
          subtitle="Select a drive type, transmission and components validated against the live engineering catalogue."
        />
        <DrivetrainLoadingState />
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <StepHeader step={6} title="Drivetrain System" />
        <DrivetrainErrorState error={error} />
      </div>
    )
  }

  return (
    <div>
      <StepHeader
        step={6}
        title="Drivetrain System"
        subtitle="Select a drive type, transmission and components validated against the live engineering catalogue. Recommendations, compatibility and performance figures are computed from real product data."
      />

      <DrivetrainSummary onEditStep={(step) => onEditStep?.(step)} />

      <div className="mb-6 max-w-xs">
        <label className="block text-xs font-sans font-bold uppercase tracking-wider text-graphite mb-2">
          Estimated Gross Vehicle Weight (rider + bike + cargo)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={gvwInput}
            onChange={(e) => setGvwInput(e.target.value)}
            onBlur={handleGvwBlur}
            placeholder="e.g. 120"
            className="w-full border border-border px-3 py-1.5 text-sm font-body focus:border-primary outline-none"
          />
          <span className="text-xs font-sans font-bold text-muted-foreground">kg</span>
        </div>
        <p className="mt-1 text-[11px] font-body text-muted-foreground">
          Used to validate motor torque and GVW limits against paired drivetrain components.
        </p>
      </div>

      <DriveTypeCards catalogue={catalogue} selected={s.drivetrainType} onSelect={(t) => s.setDrivetrainType(t)} />

      {s.drivetrainType && (
        <TransmissionTypePicker
          catalogue={catalogue}
          driveType={s.drivetrainType}
          selected={s.transmissionType}
          onSelect={(t) => s.setTransmissionType(t)}
        />
      )}

      {s.drivetrainType && s.transmissionType && (s.transmissionType === "derailleur" || s.transmissionType === "cvt") && (
        <RecommendationCards
          recommendations={recommendations}
          onSelect={handleSelectRecommendation}
          onCheckSpecs={(id) => {
            const c = catalogue.find((x) => x.id === id)
            if (c) setSpecComponent(c)
          }}
        />
      )}

      {s.drivetrainType && s.transmissionType && (
        <AdvancedConfiguration
          data={data}
          driveType={s.drivetrainType}
          transmissionType={s.transmissionType}
          selectedIds={s.selectedComponentIds}
          onChangeSlot={handleSlotChange}
          onCheckSpecs={(id) => {
            const c = catalogue.find((x) => x.id === id)
            if (c) setSpecComponent(c)
          }}
          ctx={ctx}
        />
      )}

      {s.drivetrainType === "belt" && s.transmissionType === "cvt" && (
        <BeltFrameRequirements
          belts={belts}
          frontTeeth={s.frontTeeth}
          rearTeeth={s.rearTeeth}
          beltPitchMm={frontComponent?.belt_pitch_mm ?? rearComponent?.belt_pitch_mm ?? null}
          frameHasBeltOpening={s.frameHasBeltOpening}
          beltAlternateInstallationApproved={s.beltAlternateInstallationApproved}
          centerDistanceMm={s.centerDistanceMm}
          adjustmentMm={s.adjustmentMm}
          tensioningMethod={s.tensioningMethod}
          frameStiffnessVerified={s.frameStiffnessVerified}
          frontPulleyClearanceVerified={s.frontPulleyClearanceVerified}
          rearPulleyClearanceVerified={s.rearPulleyClearanceVerified}
          beltlineVerified={s.beltlineVerified}
          selectedBeltId={s.selectedBeltId}
          onSelectBelt={(id) => s.setField("selectedBeltId", id)}
          onField={(key, value) => s.setField(key as keyof AnandaConfig, value as never)}
        />
      )}

      {motor && !isMid && s.selectedComponentIds.length > 0 && (
        <div className="mb-6">
          <InlineInfo>
            Hub-motor torque is independent of the pedal drivetrain. Only the human-powered chain or belt drivetrain,
            component relationships, frame requirements and gearing are validated below.
          </InlineInfo>
        </div>
      )}

      {pairMessages.length > 0 && (
        <div className="mb-8 space-y-2">
          {worstColor === "red"
            ? pairMessages.map((m, i) => <InlineError key={i}>{m}</InlineError>)
            : pairMessages.map((m, i) => <InlineWarning key={i}>{m}</InlineWarning>)}
          {worstColor === "amber" && (
            <label className="flex items-center gap-2 pl-1">
              <Switch checked={s.warningsAcknowledged} onCheckedChange={(v) => s.setField("warningsAcknowledged", v)} />
              <span className="text-xs font-body text-muted-foreground">
                I have reviewed these warnings and confirm the configuration should proceed.
              </span>
            </label>
          )}
        </div>
      )}

      {s.selectedComponentIds.length > 0 && (performanceRows || enviolo) && !performanceLoading && (
        <>
          <PerformanceDashboard
            primaryRatioValue={primaryRatioValue}
            gearRows={performanceRows}
            enviolo={enviolo}
            chainOrBeltlineLabel={chainOrBeltlineLabel}
            compatibilityStatus={worstColor}
            summary={
              isMid
                ? "Mid-drive motor torque passes through this drivetrain — gearing changes directly affect climbing torque, speed range and component load."
                : "Hub motor torque is delivered directly at the wheel. Pedal drivetrain gearing primarily affects rider cadence and comfort, shown separately below."
            }
            isHubMotor={!isMid}
            speedLimitKmh={s.speedLimitKmh}
          />
          <SpeedCadenceGraph gearRows={performanceRows} enviolo={enviolo} speedLimitKmh={s.speedLimitKmh} />
        </>
      )}

      <SpecDrawer component={specComponent} onOpenChange={(open) => !open && setSpecComponent(null)} />
    </div>
  )
}
