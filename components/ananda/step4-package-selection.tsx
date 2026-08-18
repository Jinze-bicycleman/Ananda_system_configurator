"use client"

import { useAnandaStore } from "@/lib/ananda-store"
import { usePackageMotors, useControllers, type MotorRow } from "@/lib/ananda-packages"
import { StepHeader, BigSpec, TechSpecRow } from "./ui-primitives"
import { StatusBadge } from "./status-badge"
import { cn } from "@/lib/utils"
import { CheckCircle2, Image as ImageIcon, Loader2 } from "lucide-react"

function PackageCard({ motor, selected, onSelect }: { motor: MotorRow; selected: boolean; onSelect: () => void }) {
  const isMid = motor.motor_type === "mid_drive"
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
        {motor.image_url ? (
          <img src={motor.image_url || "/placeholder.svg"} alt={motor.model} className="relative z-10 max-h-36 object-contain" crossOrigin="anonymous" />
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

        <div className="border border-border rounded-sm overflow-hidden mb-4">
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
        <div className="flex items-center justify-center gap-2 py-16 text-sm font-sans text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading packages…
        </div>
      ) : error ? (
        <div className="border-2 border-dashed border-warning/40 p-12 text-center">
          <p className="text-sm font-sans font-semibold text-warning uppercase tracking-wider mb-2">Unable to Load Packages</p>
          <p className="text-sm font-body text-muted-foreground">There was a problem reading motor packages from the database. Please try again.</p>
        </div>
      ) : motors.length === 0 ? (
        <div className="border-2 border-dashed border-border p-12 text-center">
          <p className="text-sm font-sans font-semibold text-muted-foreground uppercase tracking-wider mb-2">No Packages Available</p>
          <p className="text-sm font-body text-muted-foreground">
            No motor packages match the current combination of drive type and voltage platform. Please adjust your selection in the previous step.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
