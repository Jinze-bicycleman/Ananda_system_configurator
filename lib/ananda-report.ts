"use client"

// Shared data shaping for the Final Configuration Report (Step 10) and its
// PDF export. `useReportData` is the single source of truth for every value
// rendered on-screen in Step10Report — the PDF export (`generateReportPdf`)
// consumes the exact same shape so the downloaded file can never drift from
// what the user reviewed on screen.

import { useAnandaStore, type AnandaConfig } from "@/lib/ananda-store"
import { aAccessories, cablePresets } from "@/lib/ananda-data"
import { useMotors, useControllers, useDisplays, useBatteries, useMotorAssistModes, CHARGERS, CHARGING_PORTS } from "@/lib/ananda-packages"
import { useDrivetrainData, displayName } from "@/lib/ananda-drivetrain"
import { CABLE_SPECS } from "@/lib/ananda-system-diagram"
import { estimateRangeKm, costTierForMotorModel, COST_LABELS } from "@/lib/ananda-recommendation"
import { computeTargetStatus, computeOverallFeasibility, computeChangeImpact } from "@/lib/ananda-target-status"
import { computeClimbingAbility, resolveWheelRadiusMetres, PEDAL_EFFORT_PRESETS, type MotorType, type ClimbingAbilityResult } from "@/lib/ananda-climbing"

export const TRANSMISSION_LABEL: Record<string, string> = {
  derailleur: "Derailleur & Cassette",
  internal_gear_hub: "Internal-Gear Hub",
  cvt: "CVT",
  single_speed: "Single Speed",
  gearbox: "Gearbox",
}

export interface CableRow {
  connection: string
  connector: string
  pins: number
  cableType: string
  lengthM: number
  /** Optional extension cable length (m), only present if the user added one for this connection. */
  extensionLengthM: number | null
}

export function useReportData() {
  const s = useAnandaStore()

  const { motors } = useMotors()
  const { controllers } = useControllers()
  const { displays } = useDisplays()
  const { batteries } = useBatteries()
  const { catalogue } = useDrivetrainData()
  const { modes: assistModes } = useMotorAssistModes(s.motorId)

  const motor = motors.find((m) => m.id === s.motorId) ?? null
  const controller = controllers.find((c) => c.id === s.controllerId) ?? null
  const display = displays.find((d) => d.id === s.displayId) ?? null
  const battery = batteries.find((b) => b.id === s.batteryId) ?? null
  const charger = CHARGERS.find((c) => c.id === s.chargerId) ?? null
  const chargingPort = CHARGING_PORTS.find((p) => p.id === s.chargingPortId) ?? null
  const accessories = aAccessories.filter((a) => s.accessoryIds.includes(a.id))

  const torqueSensorSkipped = s.skippedItems.includes("torqueSensorId")
  const speedSensorSkipped = s.skippedItems.includes("speedSensorId")
  const batterySkipped = s.skippedItems.includes("batteryId")

  const selectedDrivetrainComponents = s.selectedComponentIds
    .map((id) => catalogue.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
  const selectedBelt = s.selectedBeltId ? catalogue.find((c) => c.id === s.selectedBeltId) ?? null : null

  let systemWeightKg = 0
  if (motor?.weight_kg) systemWeightKg += motor.weight_kg
  if (battery?.weight_kg) systemWeightKg += battery.weight_kg

  const isMid = s.driveType === "mid"

  // Cable & harness specification — mid-drive systems use the CABLE_SPECS
  // set (driven by the interactive System Diagram on Step 9); hub-motor
  // systems use the hub cable preset list. Both key into the same
  // `s.cableLengths` map by connection name, falling back to each
  // connection's default length when the user hasn't edited it.
  const cablePresetList = s.driveType === "hub" ? cablePresets.hub : CABLE_SPECS
  const cableRows: CableRow[] = cablePresetList.map((c) => ({
    connection: c.connection,
    connector: c.connector,
    pins: c.pins,
    cableType: c.cableType,
    lengthM: s.cableLengths[c.connection] ?? c.defaultLength,
    extensionLengthM: s.extensionCableLengths[c.connection] ?? null,
  }))

  const targetStatusRows = computeTargetStatus({ s, motor, battery, display })
  const feasibility = computeOverallFeasibility(targetStatusRows)
  const currentCostLabel = motor ? COST_LABELS[costTierForMotorModel(motor.model)] : "—"
  const changeImpact = computeChangeImpact(s, {
    weightKg: systemWeightKg,
    rangeKm: battery ? estimateRangeKm(battery.capacity_wh) : 0,
    costLabel: currentCostLabel,
  })

  // Climbing Ability — mirrors the Step 6 panel exactly, using the
  // committed store values (frontTeeth/largestRearTeeth/rider inputs) so the
  // report and PDF never drift from what the user configured on Step 6.
  const motorType: MotorType | null = motor
    ? motor.motor_type === "hub"
      ? "hub"
      : motor.motor_type === "mid_drive"
        ? "mid_drive"
        : isMid
          ? "mid_drive"
          : "hub"
    : null
  const wheelSizeInch = s.wheelSize ? Number.parseFloat(s.wheelSize) || null : null
  const wheelRadiusMetres = resolveWheelRadiusMetres(s.tyreCircumferenceMm, wheelSizeInch)
  const activeAssistMode = assistModes.find((m) => m.mode_key === s.climbingAssistanceModeKey) ?? assistModes[0] ?? null
  const pedalEffortPreset = PEDAL_EFFORT_PRESETS.find((p) => p.key === s.climbingPedalEffortKey) ?? PEDAL_EFFORT_PRESETS[1]
  const climbingResult: ClimbingAbilityResult | null =
    motorType && activeAssistMode
      ? computeClimbingAbility({
          motorType,
          motorMaxTorqueNm: motor?.torque_nm ?? null,
          riderPedalTorqueNm: pedalEffortPreset.torqueNm,
          assistanceMultiplier: activeAssistMode.assistance_multiplier,
          frontChainringTeeth: s.frontTeeth,
          largestRearTeeth: s.largestRearTeeth,
          riderWeightKg: s.climbingRiderWeightKg,
          bikeWeightKg: 25,
          wheelRadiusMetres,
          drivetrainEfficiency: motor?.drivetrain_efficiency ?? null,
        })
      : null
  const climbing = {
    result: climbingResult,
    riderWeightKg: s.climbingRiderWeightKg,
    assistanceModeLabel: activeAssistMode?.display_label ?? "—",
    pedalEffortLabel: pedalEffortPreset.label,
  }

  return {
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
  }
  }

export type ReportData = ReturnType<typeof useReportData>

function driveTypeLabel(driveType: AnandaConfig["driveType"]) {
  return driveType === "mid" ? "Mid-Drive" : driveType === "hub" ? "Hub Motor" : "—"
}

/**
 * Builds and downloads the Final Configuration Report as a PDF, mirroring
 * every section shown on screen in Step10Report plus the cable & harness
 * length table. Runs client-side only (jsPDF has no server dependency).
 */
export async function generateReportPdf(data: ReportData) {
  const { jsPDF } = await import("jspdf")
  const { s, motor, controller, display, battery, charger, chargingPort, accessories, torqueSensorSkipped, speedSensorSkipped, batterySkipped, selectedDrivetrainComponents, selectedBelt, systemWeightKg, isMid, cableRows, targetStatusRows, feasibility, changeImpact, currentCostLabel, climbing } = data

  const doc = new jsPDF({ unit: "pt", format: "a4" })
  const pageWidth = doc.internal.pageSize.getWidth()
  const marginX = 40
  let y = 48

  const primary: [number, number, number] = [0, 143, 54] // matches --primary green
  const graphite: [number, number, number] = [31, 41, 55]
  const muted: [number, number, number] = [107, 114, 128]

  function ensureSpace(rowsNeeded = 1) {
    const rowHeight = 16
    if (y + rowsNeeded * rowHeight > doc.internal.pageSize.getHeight() - 48) {
      doc.addPage()
      y = 48
    }
  }

  function sectionTitle(title: string) {
    ensureSpace(2)
    doc.setFillColor(...primary)
    doc.rect(marginX, y, pageWidth - marginX * 2, 3, "F")
    y += 14
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(...graphite)
    doc.text(title.toUpperCase(), marginX, y)
    y += 8
    doc.setDrawColor(220, 220, 220)
    doc.line(marginX, y, pageWidth - marginX, y)
    y += 14
  }

  function row(label: string, value: string) {
    ensureSpace(1)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(...muted)
    doc.text(label.toUpperCase(), marginX, y)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...graphite)
    doc.text(value, pageWidth - marginX, y, { align: "right" })
    y += 16
  }

  function paragraph(text: string) {
    ensureSpace(2)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(...muted)
    const lines = doc.splitTextToSize(text, pageWidth - marginX * 2)
    doc.text(lines, marginX, y)
    y += lines.length * 12 + 6
  }

  function tableHeader(headers: string[], colX: number[]) {
    ensureSpace(1)
    doc.setFillColor(...graphite)
    doc.rect(marginX, y - 10, pageWidth - marginX * 2, 16, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8)
    doc.setTextColor(255, 255, 255)
    headers.forEach((h, i) => doc.text(h.toUpperCase(), colX[i], y))
    y += 16
  }

  function tableRow(cells: string[], colX: number[], zebra: boolean) {
    ensureSpace(1)
    if (zebra) {
      doc.setFillColor(245, 247, 246)
      doc.rect(marginX, y - 10, pageWidth - marginX * 2, 16, "F")
    }
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8.5)
    doc.setTextColor(...graphite)
    cells.forEach((c, i) => doc.text(c, colX[i], y))
    y += 16
  }

  // ─── Header ───
  doc.setFillColor(...primary)
  doc.rect(0, 0, pageWidth, 40, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(255, 255, 255)
  doc.text("ANANDA — FINAL CONFIGURATION REPORT", marginX, 26)
  y = 64
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...muted)
  doc.text(`Generated ${new Date().toLocaleString()}`, marginX, y)
  y += 22

  // ─── Overall Feasibility ───
  const feasibilityLabel = feasibility === "go" ? "GO" : feasibility === "conditional_go" ? "CONDITIONAL GO" : "NO-GO"
  sectionTitle("Overall Feasibility")
  row("Feasibility Assessment", feasibilityLabel)
  row("Selected Solution", s.selectedSolutionId ? s.selectedSolutionId.replace("_", " ").toUpperCase() : "—")
  row("Current Cost Level", currentCostLabel)

  // ─── Product Target Summary ───
  sectionTitle("Product Target Summary")
  row("Weight Target", s.productTargets.weight.maxKg != null ? `≤ ${s.productTargets.weight.maxKg} kg (${s.productTargets.weight.level})` : "No target set")
  row(
    "Torque Target",
    s.productTargets.performance.torqueTargetNm != null
      ? `≥ ${s.productTargets.performance.torqueTargetNm} Nm (${s.productTargets.performance.torqueLevel})`
      : "No target set",
  )
  row(
    "Range Target",
    s.productTargets.performance.rangeTargetKm != null
      ? `≥ ${s.productTargets.performance.rangeTargetKm} km (${s.productTargets.performance.rangeLevel})`
      : "No target set",
  )
  row("Market Positioning", s.productTargets.ambition.positioning ?? "—")
  row("Cost Priority", s.productTargets.ambition.costPriority ?? "—")

  // ─── Requirement Satisfaction Matrix ───
  sectionTitle("Requirement Satisfaction Matrix")
  const matrixColX = [marginX, marginX + 160, marginX + 300, marginX + 430]
  tableHeader(["Dimension", "Target", "Current", "Status"], matrixColX)
  targetStatusRows.forEach((r, i) => {
    tableRow(
      [r.dimension, r.targetLabel, r.currentLabel, r.status.replace("_", " ").toUpperCase()],
      matrixColX,
      i % 2 === 1,
    )
  })

  // ─── Recommended Configuration & Rationale ───
  sectionTitle("Recommended Configuration & Rationale")
  row("Motor", motor ? motor.model : "—")
  row("Battery", battery ? battery.model : "—")
  row("Display", display ? display.model : "—")
  paragraph(
    s.selectedSolutionId
      ? "This configuration was selected from the ranked recommendations generated against the Product Targets on Step 3."
      : "No recommended solution has been applied yet — components below reflect manual configuration.",
  )

  // ─── Unmet Requirements ───
  const unmetRows = targetStatusRows.filter((r) => r.status === "not_met" || r.status === "missing")
  sectionTitle("Unmet Requirements")
  if (unmetRows.length === 0) {
    paragraph("All defined requirements are currently met by the selected configuration.")
  } else {
    for (const r of unmetRows) paragraph(`${r.dimension}: target ${r.targetLabel}, current ${r.currentLabel}.`)
  }

  // ─── Risks, Conditions & Assumptions ───
  sectionTitle("Risks, Conditions & Assumptions")
  paragraph("Configuration is compatible with the selected regulation based on rated power and speed limit inputs.")
  paragraph("Complete bicycle certification requires final vehicle testing and validation; this report is a planning estimate only.")
  paragraph("Range and cost-tier figures are heuristic estimates derived from battery capacity and motor model, not final priced or lab-tested values.")
  if (changeImpact.weight) {
    paragraph(
      `Since the recommended solution was applied: weight ${changeImpact.weight[0].toFixed(1)} kg → ${changeImpact.weight[1].toFixed(1)} kg, range ${changeImpact.range?.[0]} km → ${changeImpact.range?.[1]} km, cost level ${changeImpact.cost?.[0]} → ${changeImpact.cost?.[1]}.`,
    )
  }

  // ─── Project Context ───
  sectionTitle("Project Context")
  row("Sell Market", s.sellRegion ?? "—")
  row("Regulation", s.regulation ?? "—")
  row("Speed Limit", s.speedLimitKmh ? `${s.speedLimitKmh} km/h` : "—")
  row("Rated Power", s.ratedPowerW ? `${s.ratedPowerW} W` : "—")
  row("Bike Category", s.bikeCategory ?? "—")
  row("Wheel Size", s.wheelSize ?? "—")
  row("Tyre Width", s.tyreWidth ?? "—")
  row("Circumference", s.tyreCircumferenceMm ? `${s.tyreCircumferenceMm} mm` : "Default 2200 mm")

  // ─── Drive System & Package ───
  sectionTitle("Drive System & Package")
  row("Drive Type", driveTypeLabel(s.driveType))
  row("Voltage Platform", s.voltagePlatform ? `${s.voltagePlatform}V` : "—")
  row("Motor Package", motor ? motor.model : "—")
  row("Motor Power", motor?.rated_power_w ? `${motor.rated_power_w}W` : "—")
  row("Motor Torque", motor?.torque_nm ? `${motor.torque_nm} Nm` : "—")
  if (motor?.weight_kg) row("Motor Weight", `${motor.weight_kg} kg`)

  // ─── Package Configuration ───
  sectionTitle("Package Configuration")
  row("Controller", isMid ? "Integrated" : controller ? controller.model : "—")
  row("Display (HMI)", display ? display.model : "—")
  if (!isMid) row("Torque Sensor", torqueSensorSkipped ? "Not Needed" : s.torqueSensorId ? s.torqueSensorId : "—")
  row("Speed Sensor", speedSensorSkipped ? "Not Needed" : s.speedSensorId ? s.speedSensorId : "—")

  // ─── Drivetrain ───
  sectionTitle("Drivetrain")
  row("Drive Type", s.drivetrainType === "chain" ? "Chain Drive" : s.drivetrainType === "belt" ? "Belt Drive" : "—")
  row("Transmission Type", s.transmissionType ? TRANSMISSION_LABEL[s.transmissionType] ?? s.transmissionType : "—")
  if (s.frontTeeth != null) row("Front Chainring / Pulley", `${s.frontTeeth}T`)
  if (s.rearTeeth != null) row("Smallest Rear Sprocket", `${s.rearTeeth}T`)
  if (s.largestRearTeeth != null) row("Largest Rear Sprocket", `${s.largestRearTeeth}T`)
  if (s.gvwKg != null) row("Estimated GVW", `${s.gvwKg} kg`)
  if (selectedDrivetrainComponents.length > 0) {
    for (const c of selectedDrivetrainComponents) {
      row(c.category.replace(/_/g, " "), displayName(c))
    }
    if (selectedBelt) row("Belt", displayName(selectedBelt))
  } else {
    paragraph("No drivetrain components have been selected yet.")
  }
  if (s.drivetrainErrors.length > 0) {
    for (const msg of s.drivetrainErrors) paragraph(`Error: ${msg}`)
  } else if (s.drivetrainWarnings.length > 0) {
    for (const msg of s.drivetrainWarnings) paragraph(`Warning: ${msg}`)
  }

  // ─── Battery & Charging ───
  sectionTitle("Battery & Charging")
  row("Battery", batterySkipped ? "Not Needed" : battery ? battery.model : "—")
  if (battery?.capacity_wh) row("Capacity", `${battery.capacity_wh} Wh`)
  if (battery?.weight_kg) row("Battery Weight", `${battery.weight_kg} kg`)
  row("Charger", charger ? charger.model : "—")
  row("Charging Port", chargingPort ? chargingPort.model : "—")

  // ─── Accessories ───
  if (accessories.length > 0) {
    sectionTitle("Accessories")
    for (const a of accessories) row(a.category.toUpperCase(), a.name)
  }

  // ─── Climbing Ability ───
  sectionTitle("Climbing Ability")
  row("Rider Weight", `${climbing.riderWeightKg} kg`)
  row("Assistance Mode", climbing.assistanceModeLabel)
  row("Pedal Effort", climbing.pedalEffortLabel)
  if (!climbing.result) {
    paragraph("N/A — motor, drivetrain gearing and wheel circumference must be configured to estimate climbing ability.")
  } else if (climbing.result.status === "missing-data") {
    paragraph(`N/A — missing ${climbing.result.missingFields.join(", ")}.`)
  } else {
    row("Motor-Assist Torque", `${(Math.round(climbing.result.assistance.motorTorqueDeliveredNm * 10) / 10)} Nm`)
    row("Total Wheel Torque", `${(Math.round(climbing.result.totalWheelTorqueNm * 10) / 10)} Nm`)
    if (climbing.result.status === "exceeded") {
      paragraph("The theoretical force model limit is exceeded; real performance will be traction- and geometry-limited.")
    } else {
      row("Maximum Theoretical Grade", `${(climbing.result.gradePercent as number).toFixed(1)}%`)
      if (climbing.result.scenario) row("Comparable To", climbing.result.scenario.label)
    }
    paragraph(
      "Sustained real-world climbing also depends on motor power and efficiency at operating speed, thermal limits, tyre traction, bicycle geometry and balance, road surface, rolling resistance, and wind and rider technique.",
    )
  }

  // ─── Cable & Harness Specification ───
  sectionTitle("Cable & Harness Specification")
  const cableColX = [marginX, marginX + 160, marginX + 260, marginX + 290, marginX + 380, marginX + 460]
  tableHeader(["Connection", "Connector", "Pins", "Cable Type", "Length (m)", "Extension"], cableColX)
  cableRows.forEach((c, i) => {
    tableRow(
      [
        c.connection,
        c.connector,
        String(c.pins),
        c.cableType,
        `${c.lengthM.toFixed(1)} m`,
        c.extensionLengthM != null ? `+${c.extensionLengthM.toFixed(2)} m` : "—",
      ],
      cableColX,
      i % 2 === 1,
    )
  })

  // ─── System Weight Estimate ───
  if (systemWeightKg > 0) {
    sectionTitle("System Weight Estimate")
    if (motor?.weight_kg) row("Motor", `${motor.weight_kg} kg`)
    if (battery?.weight_kg) row("Battery", `${battery.weight_kg} kg`)
    row("Total (Motor + Battery)", `${systemWeightKg.toFixed(1)} kg`)
    paragraph("Weight estimate includes motor and battery only. Accessories, sensors, and ancillary components are not included in this total.")
  }

  // ─── System Compatibility Check ───
  sectionTitle("System Compatibility Check")
  const checks = [
    { ok: !!s.motorId, label: "Motor package selected" },
    { ok: !(s.driveType === "hub" && !s.controllerId), label: "Controller configured" },
    { ok: !(s.driveType === "hub" && !s.torqueSensorId && !torqueSensorSkipped), label: "Pedal sensing configured" },
    { ok: !!s.speedSensorId || speedSensorSkipped, label: "Speed sensor configured" },
    { ok: !!s.batteryId || batterySkipped, label: "Battery configured" },
    {
      ok: Boolean(s.drivetrainType && s.transmissionType && s.selectedComponentIds.length > 0 && s.drivetrainErrors.length === 0),
      label: "Drivetrain system configured",
    },
  ]
  for (const { ok, label } of checks) {
    ensureSpace(1)
    const statusColor: [number, number, number] = ok ? primary : [180, 130, 0]
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.setTextColor(...statusColor)
    doc.text(ok ? "OK" : "!", marginX, y)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...graphite)
    doc.text(label, marginX + 24, y)
    y += 16
  }

  doc.save("ananda-configuration-report.pdf")
}
