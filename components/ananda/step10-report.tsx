"use client"

import { useAnandaStore } from "@/lib/ananda-store"
import { aAccessories } from "@/lib/ananda-data"
import { useMotors, useControllers, useDisplays, useBatteries, CHARGERS, CHARGING_PORTS } from "@/lib/ananda-packages"
import { StepHeader, SectionLabel } from "./ui-primitives"
import { AlertTriangle, CheckCircle2, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

function calcDrivetrain(
  chainringT: number,
  rearT: number,
  cadenceRpm: number,
  tyreCircumferenceMm: number | null,
  motorTorqueNm: number | null,
  driveType: "mid" | "hub" | null,
) {
  const gearRatio = chainringT / rearT
  const wheelCircumM = (tyreCircumferenceMm ?? 2200) / 1000
  const speedKmh = (cadenceRpm * gearRatio * wheelCircumM * 60) / 1000
  const motorTorque = motorTorqueNm ?? 80
  const onWheelTorque = driveType === "mid" ? motorTorque / gearRatio : motorTorque
  return {
    gearRatio: Math.round(gearRatio * 100) / 100,
    speedKmh: Math.round(speedKmh * 10) / 10,
    onWheelTorque: Math.round(onWheelTorque * 10) / 10,
  }
}

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border bg-white overflow-hidden mb-5">
      <div className="h-1 bg-primary" />
      <div className="px-5 py-3 bg-surface border-b border-border">
        <p className="text-[11px] font-sans font-black uppercase tracking-[0.15em] text-graphite">{title}</p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function Row({ label, value, highlight, warn }: { label: string; value: string; highlight?: boolean; warn?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 border-b border-border/40 last:border-0">
      <span className="text-[11px] font-sans uppercase tracking-wider text-muted-foreground flex-shrink-0">{label}</span>
      <span className={cn("text-[12px] font-sans font-semibold text-right", warn ? "text-warning" : highlight ? "text-primary" : "text-foreground")}>
        {value}
      </span>
    </div>
  )
}

export function Step10Report() {
  const s = useAnandaStore()

  const { motors } = useMotors()
  const { controllers } = useControllers()
  const { displays } = useDisplays()
  const { batteries } = useBatteries()

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

  const { gearRatio, speedKmh, onWheelTorque } = calcDrivetrain(
    s.chainringTeeth,
    s.rearSprocketTeeth,
    s.cadenceRpm,
    s.tyreCircumferenceMm,
    motor?.torque_nm ?? null,
    s.driveType,
  )

  const speedExceedsLimit = s.speedLimitKmh != null && speedKmh > s.speedLimitKmh
  const usesDefaultCircumference = s.tyreCircumferenceMm == null

  let systemWeightKg = 0
  if (motor?.weight_kg) systemWeightKg += motor.weight_kg
  if (battery?.weight_kg) systemWeightKg += battery.weight_kg

  const isMid = s.driveType === "mid"

  return (
    <div>
      <StepHeader
        step={9}
        title="Final Configuration Report"
        subtitle="Complete system summary. Review all selections and drivetrain outputs before exporting or sharing."
      />

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
        <Row label="Drivetrain Type" value={s.drivetrainType === "chain" ? "Chain Drive" : s.drivetrainType === "belt" ? "Belt Drive" : "—"} />
        <Row label="Chainring Size" value={`${s.chainringTeeth}T`} />
        <Row label="Rear Sprocket Size" value={`${s.rearSprocketTeeth}T`} />
        <Row label="Selected Cadence" value={`${s.cadenceRpm} rpm`} />
        <Row label="Gear Ratio" value={`${gearRatio.toFixed(2)} : 1`} highlight />
        <Row label="Est. Max Speed" value={`${speedKmh.toFixed(1)} km/h`} warn={speedExceedsLimit} />
        <Row label="Est. On-Wheel Torque" value={`${onWheelTorque.toFixed(1)} Nm`} />

        {usesDefaultCircumference && (
          <p className="mb-3 text-xs text-muted-foreground">
            Speed estimate uses the default 2200 mm tyre circumference because no measured value was entered.
          </p>
        )}

        <div className="mt-3 flex items-start gap-2 bg-surface border-l-2 border-primary px-4 py-3">
          <p className="text-xs font-body text-muted-foreground">
            {isMid
              ? "Mid-drive motor torque passes through the drivetrain. Chainring and sprocket selection directly affect speed range, climbing torque and drivetrain load."
              : "Hub motor torque is delivered directly at the wheel. Chainring and sprocket selection mainly affect rider cadence and pedalling comfort."}
          </p>
        </div>

        {speedExceedsLimit && (
          <div className="mt-3 flex items-start gap-2 bg-warning/10 border border-warning/30 px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
            <p className="text-sm font-body text-warning-foreground">
              Estimated drivetrain speed exceeds the selected speed limit ({s.speedLimitKmh} km/h). Final assistance cut-off must follow the selected regional regulation.
            </p>
          </div>
        )}
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
            <span className="text-lg font-sans font-black text-primary">{systemWeightKg.toFixed(1)} kg</span>
          </div>
          <p className="text-[10px] font-body text-muted-foreground mt-2">
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
          { ok: !!s.drivetrainType, label: "Drivetrain type selected" },
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
