"use client"

import { useState } from "react"
import { useAnandaStore } from "@/lib/ananda-store"
import { usePackageMotors, useControllers, resolveImageUrl, type MotorRow } from "@/lib/ananda-packages"
import { StepHeader, BigSpec, TechSpecRow } from "./ui-primitives"
import { StatusBadge } from "./status-badge"
import { cn } from "@/lib/utils"
import { CheckCircle2, Image as ImageIcon, Loader2, ChevronDown, FileText, AlertTriangle } from "lucide-react"

function FullSpecSheet({ motor }: { motor: MotorRow }) {
  const isMid = motor.motor_type === "mid_drive"
  const missingCount = [
    motor.size,
    motor.rpm,
    motor.max_efficiency,
    motor.noise_grade_db,
    motor.waterproof,
    motor.color,
    motor.construction,
    motor.light_drive_capacity,
    motor.sensor_description,
    motor.communication_protocol,
    motor.datasheet_url,
  ].filter((v) => v === null || v === undefined || v === "").length

  return (
    <div className="border border-border rounded-sm overflow-hidden mb-4">
      <div className="flex items-center justify-between px-3 py-2 bg-surface border-b border-border">
        <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-muted-foreground">
          Full Technical Specification
        </span>
        {missingCount > 0 && (
          <span className="flex items-center gap-1 text-[10px] font-sans font-bold uppercase tracking-wider text-warning">
            <AlertTriangle className="w-3 h-3" />
            {missingCount} Missing
          </span>
        )}
      </div>
      <TechSpecRow label="Voltage Platform" value={motor.voltage_v} unit="V" />
      <TechSpecRow label="RPM" value={motor.rpm} />
      <TechSpecRow label="Max Efficiency" value={motor.max_efficiency} />
      <TechSpecRow label="Noise Grade" value={motor.noise_grade_db} unit="dB" />
      <TechSpecRow label="Dimensions" value={motor.size} />
      <TechSpecRow label="Waterproof Rating" value={motor.waterproof} />
      <TechSpecRow label="Color" value={motor.color} />
      <TechSpecRow label="Construction" value={motor.construction} />
      <TechSpecRow label="Light Drive Capacity" value={motor.light_drive_capacity} />
      <TechSpecRow label="Sensor Description" value={motor.sensor_description} />
      <TechSpecRow label="Communication Protocol" value={motor.communication_protocol} />
      <TechSpecRow label={isMid ? "Shaft Interface" : "Mounting Interface"} value={isMid ? motor.shaft_interface : motor.mounting_interface} />
      {motor.datasheet_url ? (
        <a
          href={motor.datasheet_url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between py-1.5 px-3 border-b border-border last:border-0 hover:bg-primary/5 group"
        >
          <span className="text-[11px] font-sans uppercase tracking-wider text-muted-foreground">Datasheet</span>
          <span className="flex items-center gap-1 text-sm font-sans font-bold text-primary group-hover:underline">
            <FileText className="w-3.5 h-3.5" />
            View PDF
          </span>
        </a>
      ) : (
        <TechSpecRow label="Datasheet" value={null} />
      )}
    </div>
  )
}

function PackageCard({ motor, selected, onSelect }: { motor: MotorRow; selected: boolean; onSelect: () => void }) {
  const isMid = motor.motor_type === "mid_drive"
  const [showFullSpec, setShowFullSpec] = useState(false)
  return (
    <div
      className={cn(
        "relative cursor-pointer border-2 overflow-hidden transition-all flex flex-col",
        selected ? "border-primary shadow-lg shadow-primary/10" : "border-border hover:border-primary/40",
      )}
      onClick={onSelect}
    >
      <div className={cn("h-1.5 w-full", selected ? "bg-primary" : "bg-border")} />

      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {motor.is_recommended && <StatusBadge variant="recommended" />}
        {isMid && <StatusBadge variant="integrated" label="Controller Integrated" />}
        {selected && (
          <div className="bg-primary rounded-full p-1 self-start">
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
          </div>
        )}
      </div>

      <div
        className={cn("relative flex items-center justify-center overflow-hidden", selected ? "bg-primary/5" : "bg-surface")}
        style={{ minHeight: 180 }}
      >
        <div className="absolute inset-0">
          <svg viewBox="0 0 300 180" className="w-full h-full" preserveAspectRatio="none">
            <polygon points="180,0 300,0 300,180 120,180" fill={selected ? "#008F36" : "#f3f4f6"} opacity={selected ? "0.12" : "0.6"} />
          </svg>
        </div>
        {resolveImageUrl(motor.image_url, motor.image_path) ? (
          <img src={resolveImageUrl(motor.image_url, motor.image_path) as string} alt={motor.model} className="relative z-10 max-h-36 object-contain" crossOrigin="anonymous" />
        ) : (
          <div className="relative z-10 flex flex-col items-center justify-center gap-2 py-10">
            <ImageIcon className={cn("w-12 h-12", selected ? "text-primary/40" : "text-border")} />
            <span className="text-xs font-sans text-muted-foreground uppercase tracking-wider">{motor.model}</span>
          </div>
        )}
      </div>

      <div className="px-4 pt-4 pb-2 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className={cn("text-xl font-sans font-black uppercase tracking-tight", selected ? "text-primary" : "text-graphite")}>
            {motor.model}
          </h3>
          <span className={cn("text-xs font-sans font-bold px-2 py-0.5 border", selected ? "border-primary text-primary" : "border-border text-muted-foreground")}>
            {motor.voltage_v}V
          </span>
        </div>

        <div className="flex items-center justify-around py-3 bg-surface rounded-sm mb-3">
          <BigSpec value={motor.torque_nm} unit="Nm" label="Torque" />
          <div className="w-px h-10 bg-border" />
          <BigSpec value={motor.rated_power_w} unit="W" label="Rated Power" />
          <div className="w-px h-10 bg-border" />
          <BigSpec value={motor.weight_kg} unit="kg" label="Weight" />
        </div>

        <div className="border border-border rounded-sm overflow-hidden mb-3">
          <TechSpecRow label="Motor Type" value={isMid ? "Mid-Drive" : "Hub Motor"} />
          <TechSpecRow
            label="Controller"
            value={motor.controller_requirement === "integrated" ? "Integrated" : "External Required"}
            highlight={motor.controller_requirement === "integrated"}
          />
          <TechSpecRow
            label="Pedal Sensing"
            value={motor.pedal_sensing === "integrated" ? "Integrated" : "External Required"}
            highlight={motor.pedal_sensing === "integrated"}
          />
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setShowFullSpec((v) => !v)
          }}
          className="w-full flex items-center justify-between px-3 py-2 mb-3 text-[11px] font-sans font-bold uppercase tracking-wider text-muted-foreground hover:text-primary border border-border rounded-sm transition-colors"
        >
          Full Technical Specification
          <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showFullSpec && "rotate-180")} />
        </button>

        {showFullSpec && <FullSpecSheet motor={motor} />}

        <button
          className={cn(
            "w-full py-2.5 text-sm font-sans font-bold uppercase tracking-wider transition-all",
            selected ? "bg-primary text-white" : "border border-border hover:border-primary hover:text-primary",
          )}
        >
          {selected ? "Package Selected" : "Select This Package"}
        </button>
      </div>
    </div>
  )
}

export function Step4PackageSelection() {
  const s = useAnandaStore()
  const { motors, isLoading, error } = usePackageMotors(s.driveType, s.voltagePlatform)
  const { controllers } = useControllers()

  return (
    <div>
      <StepHeader
        step={4}
        title="Package Selection"
        subtitle="Choose the motor package for this e-bike system. Each package anchors the drive architecture — you'll configure the surrounding controller, sensors, display and battery in the next step."
      />

      {isLoading ? (
        <div id="field-package" className="flex items-center justify-center gap-2 py-16 text-sm font-sans text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading packages…
        </div>
      ) : error ? (
        <div id="field-package" className="border-2 border-dashed border-warning/40 p-12 text-center">
          <p className="text-sm font-sans font-semibold text-warning uppercase tracking-wider mb-2">Unable to Load Packages</p>
          <p className="text-sm font-body text-muted-foreground">There was a problem reading motor packages from the database. Please try again.</p>
        </div>
      ) : motors.length === 0 ? (
        <div id="field-package" className="border-2 border-dashed border-border p-12 text-center">
          <p className="text-sm font-sans font-semibold text-muted-foreground uppercase tracking-wider mb-2">No Packages Available</p>
          <p className="text-sm font-body text-muted-foreground">
            No motor packages match the current combination of drive type and voltage platform. Please adjust your selection in the previous step.
          </p>
        </div>
      ) : (
        <div id="field-package" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {motors.map((m) => (
            <PackageCard
              key={m.id}
              motor={m}
              selected={s.motorId === m.id}
              onSelect={() => {
                const defaultController =
                  m.controller_requirement === "integrated"
                    ? null
                    : controllers.find((c) => c.compatible_motor_type === m.motor_type && c.voltage_v === m.voltage_v) ?? null
                s.selectPackage(m.id, {
                  motorId: m.id,
                  controllerId: defaultController?.id ?? null,
                })
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
