"use client"

// Shared data shaping for the Final Configuration Report (Step 7) and its
// PDF export. `useReportData` is the single source of truth for every value
// rendered on-screen in Step7Report — the PDF export (`generateReportPdf`)
// consumes the exact same shape so the downloaded file can never drift from
// what the user reviewed on screen.

import { useAnandaStore, hasThirdPartySupplier, type AnandaConfig, type PackageItemKey } from "@/lib/ananda-store"
import { aAccessories, cablePresets } from "@/lib/ananda-data"
import { useMotors, useControllers, useDisplays, useBatteries, useMotorAssistModes, CHARGERS, CHARGING_PORTS } from "@/lib/ananda-packages"
import { CABLE_SPECS } from "@/lib/ananda-system-diagram"
import { computeClimbingAbility, resolveWheelRadiusMetres, PEDAL_EFFORT_PRESETS, type MotorType, type ClimbingAbilityResult } from "@/lib/ananda-climbing"

export const PACKAGE_ITEM_LABELS: Record<PackageItemKey, string> = {
  controllerId: "Controller",
  torqueSensorId: "Torque Sensor",
  speedSensorId: "Speed Sensor",
  displayId: "Display (HMI)",
  batteryId: "Battery",
  chargerId: "Charger",
  chargingPortId: "Charging Port",
}

export interface ScopeItem {
  label: string
  value: string
  /** Set when the part is sourced from the customer's own 3rd-party supplier. */
  thirdParty?: boolean
}

export function thirdPartyValue(supplier: string) {
  return supplier.trim() ? `3rd party supplier: ${supplier.trim()}` : "3rd party supplier (name not provided)"
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

  // ─── Third-party sourced parts (every package part except the motor) ───
  const thirdPartyItems = (Object.keys(PACKAGE_ITEM_LABELS) as PackageItemKey[])
    .filter((key) => hasThirdPartySupplier(s, key) && !(isMid && (key === "controllerId" || key === "torqueSensorId")))
    .map((key) => ({ key, label: PACKAGE_ITEM_LABELS[key], supplier: s.thirdPartySuppliers[key] ?? "" }))

  const packageItemScope = (key: PackageItemKey, model: string | null): ScopeItem | null => {
    if (hasThirdPartySupplier(s, key)) {
      return { label: PACKAGE_ITEM_LABELS[key], value: thirdPartyValue(s.thirdPartySuppliers[key] ?? ""), thirdParty: true }
    }
    return model ? { label: PACKAGE_ITEM_LABELS[key], value: model } : null
  }

  // ─── Scope of Supply — every product/line item included in this build ───
  const scopeOfSupplyItems: ScopeItem[] = []
  const pushScope = (item: ScopeItem | null) => item && scopeOfSupplyItems.push(item)
  if (motor) scopeOfSupplyItems.push({ label: "Motor", value: motor.model })
  if (!isMid) pushScope(packageItemScope("controllerId", controller?.model ?? null))
  pushScope(packageItemScope("displayId", display?.model ?? null))
  pushScope(packageItemScope("batteryId", battery?.model ?? null))
  pushScope(packageItemScope("chargerId", charger?.model ?? null))
  pushScope(packageItemScope("chargingPortId", chargingPort?.model ?? null))
  if (!speedSensorSkipped) pushScope(packageItemScope("speedSensorId", s.speedSensorId))
  if (!isMid && !torqueSensorSkipped) pushScope(packageItemScope("torqueSensorId", s.torqueSensorId))
  for (const [category, id] of Object.entries(s.bikeComponentSelections)) {
    if (id) scopeOfSupplyItems.push({ label: category.charAt(0).toUpperCase() + category.slice(1), value: id })
  }
  for (const a of accessories) scopeOfSupplyItems.push({ label: a.category.toUpperCase(), value: a.name })
  for (const a of s.customAccessories) scopeOfSupplyItems.push({ label: "Custom Accessory", value: a.name || "Untitled" })
  scopeOfSupplyItems.push({ label: "Cable & Harness Set", value: `${cablePresetList.length} connections specified` })

  // ─── Items requiring a sample, additional cost, or sales-team consultation ───
  const salesConsultationItems: string[] = []
  for (const item of thirdPartyItems) {
    salesConsultationItems.push(
      `${item.label}: 3rd party supplier${item.supplier.trim() ? ` (${item.supplier.trim()})` : ""} — full technical documents and a component sample are required for integration and compatibility testing. Extra cost and delivery time apply; contact sales for details.`,
    )
  }
  if (s.connectorSourcing === "custom") {
    salesConsultationItems.push("Connectors: custom solution requested — additional cost and +15 day lead time; consult sales.")
  }
  if (s.bluetoothApp === "third_party") {
    salesConsultationItems.push("Connectivity: 3rd-party app integration — may incur additional cost; consult sales.")
  }
  if (s.accessoryIds.some((id) => id === "ACC-TH01" || id === "ACC-THO")) {
    salesConsultationItems.push("Throttle: requires a physical sample for system integration testing.")
  }
  if (s.customAccessories.length > 0) {
    salesConsultationItems.push(
      `Other Accessories: ${s.customAccessories.length} custom item${s.customAccessories.length > 1 ? "s" : ""} require sales-team scoping and cost confirmation.`,
    )
  }

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
    systemWeightKg,
    isMid,
    cableRows,
    thirdPartyItems,
    climbing,
    scopeOfSupplyItems,
    salesConsultationItems,
  }
}

export type ReportData = ReturnType<typeof useReportData>

function driveTypeLabel(driveType: AnandaConfig["driveType"]) {
  return driveType === "mid" ? "Mid-Drive" : driveType === "hub" ? "Hub Motor" : "—"
}

/**
 * Builds and downloads the Final Configuration Report as a PDF, mirroring
 * every section shown on screen in Step7Report plus the cable & harness
 * length table. Runs client-side only (jsPDF has no server dependency).
 */
export async function generateReportPdf(data: ReportData) {
  const { jsPDF } = await import("jspdf")
  const { s, motor, controller, display, battery, charger, chargingPort, accessories, torqueSensorSkipped, speedSensorSkipped, batterySkipped, systemWeightKg, isMid, cableRows, thirdPartyItems, climbing, scopeOfSupplyItems, salesConsultationItems } = data

  const doc = new jsPDF({ unit: "pt", format: "a4" })
  const pageWidth = doc.internal.pageSize.getWidth()
  const marginX = 40
  let y = 48

  const primary: [number, number, number] = [0, 143, 54] // matches --primary green
  const graphite: [number, number, number] = [31, 41, 55]
  const muted: [number, number, number] = [107, 114, 128]
  const highlightFill: [number, number, number] = [255, 243, 205]
  const highlightText: [number, number, number] = [150, 90, 0]

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

  function row(label: string, value: string, thirdParty = false) {
    ensureSpace(1)
    if (thirdParty) {
      doc.setFillColor(...highlightFill)
      doc.rect(marginX - 4, y - 10, pageWidth - marginX * 2 + 8, 16, "F")
    }
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(...(thirdParty ? highlightText : muted))
    doc.text(label.toUpperCase(), marginX, y)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...(thirdParty ? highlightText : graphite))
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

  // ─── 3rd Party Supplier Notice ───
  if (thirdPartyItems.length > 0) {
    sectionTitle("3rd Party Supplier Components")
    for (const item of thirdPartyItems) row(item.label, item.supplier.trim() || "Name not provided", true)
    paragraph(
      "Using 3rd party components requires full technical documents and component samples for integration and compatibility testing. This introduces extra cost and delivery time; contact sales for details.",
    )
  }

  // ─── Risks & Assumptions ───
  sectionTitle("Risks & Assumptions")
  paragraph("Configuration is compatible with the selected regulation based on rated power and speed limit inputs.")
  paragraph("Complete bicycle certification requires final vehicle testing and validation; this report is a planning estimate only.")

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
  const pkgRow = (key: PackageItemKey, fallback: string) =>
    hasThirdPartySupplier(s, key) ? row(PACKAGE_ITEM_LABELS[key], thirdPartyValue(s.thirdPartySuppliers[key] ?? ""), true) : row(PACKAGE_ITEM_LABELS[key], fallback)
  if (isMid) row("Controller", "Integrated")
  else pkgRow("controllerId", controller ? controller.model : "—")
  pkgRow("displayId", display ? display.model : "—")
  if (!isMid) pkgRow("torqueSensorId", torqueSensorSkipped ? "Not Needed" : s.torqueSensorId ?? "—")
  pkgRow("speedSensorId", speedSensorSkipped ? "Not Needed" : s.speedSensorId ?? "—")

  // ─── Drivetrain ───
  sectionTitle("Drivetrain")
  if (s.selectedChainringTeeth != null) row("Chainring (Bike Components)", `${s.selectedChainringTeeth}T`)
  if (s.frontTeeth != null) row("Front Chainring", `${s.frontTeeth}T`)
  if (s.rearTeeth != null) row("Smallest Rear Sprocket", `${s.rearTeeth}T`)
  if (s.largestRearTeeth != null) row("Largest Rear Sprocket", `${s.largestRearTeeth}T`)
  if (s.gvwKg != null) row("Estimated GVW", `${s.gvwKg} kg`)

  // ─── Battery & Charging ───
  sectionTitle("Battery & Charging")
  if (hasThirdPartySupplier(s, "batteryId")) row("Battery", thirdPartyValue(s.thirdPartySuppliers.batteryId ?? ""), true)
  else row("Battery", batterySkipped ? "Not Needed" : battery ? battery.model : "—")
  if (battery?.capacity_wh) row("Capacity", `${battery.capacity_wh} Wh`)
  if (battery?.weight_kg) row("Battery Weight", `${battery.weight_kg} kg`)
  pkgRow("chargerId", charger ? charger.model : "—")
  pkgRow("chargingPortId", chargingPort ? chargingPort.model : "—")

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

  // ─── Scope of Supply ───
  sectionTitle("Scope of Supply")
  for (const item of scopeOfSupplyItems) row(item.label, item.value, item.thirdParty)

  // ─── Items Requiring Samples / Additional Cost / Sales Consultation ───
  sectionTitle("Requires Sample / Additional Cost / Sales Consultation")
  if (salesConsultationItems.length === 0) {
    paragraph("No items in this configuration currently require a physical sample, additional cost, or sales-team consultation.")
  } else {
    for (const msg of salesConsultationItems) paragraph(msg)
  }

  // ─── System Compatibility Check ───
  sectionTitle("System Compatibility Check")
  const checks = [
    { ok: !!s.motorId, label: "Motor package selected" },
    { ok: !(s.driveType === "hub" && !s.controllerId && !hasThirdPartySupplier(s, "controllerId")), label: "Controller configured" },
    { ok: !!s.speedSensorId || speedSensorSkipped || hasThirdPartySupplier(s, "speedSensorId"), label: "Speed sensor configured" },
    { ok: !!s.batteryId || batterySkipped || hasThirdPartySupplier(s, "batteryId"), label: "Battery configured" },
    { ok: Boolean(s.frontTeeth && s.rearTeeth && s.largestRearTeeth), label: "Drivetrain configured" },
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
