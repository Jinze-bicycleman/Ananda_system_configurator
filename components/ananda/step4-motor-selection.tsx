"use client"

import { useAnandaStore } from "@/lib/ananda-store"
import { aMotors, type AMotor } from "@/lib/ananda-data"
import { StepHeader, BigSpec, TechSpecRow } from "./ui-primitives"
import { StatusBadge } from "./status-badge"
import { cn } from "@/lib/utils"
import { CheckCircle2, Image as ImageIcon } from "lucide-react"

function MotorCard({ motor, selected, onSelect }: { motor: AMotor; selected: boolean; onSelect: () => void }) {
  return (
    <div
      className={cn(
        "relative cursor-pointer border-2 overflow-hidden transition-all flex flex-col",
        selected ? "border-primary shadow-lg shadow-primary/10" : "border-border hover:border-primary/40"
      )}
      onClick={onSelect}
    >
      {/* Accent stripe */}
      <div className={cn("h-1.5 w-full", selected ? "bg-primary" : "bg-border")} />

      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {motor.recommended && <StatusBadge variant="recommended" />}
        {motor.controller === "integrated" && <StatusBadge variant="integrated" label="Controller Integrated" />}
        {selected && (
          <div className="bg-primary rounded-full p-1 self-start">
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
          </div>
        )}
      </div>

      {/* Image area */}
      <div className={cn(
        "relative flex items-center justify-center overflow-hidden",
        selected ? "bg-primary/5" : "bg-surface"
      )} style={{ minHeight: 180 }}>
        {/* Diagonal accent behind image */}
        <div className="absolute inset-0">
          <svg viewBox="0 0 300 180" className="w-full h-full" preserveAspectRatio="none">
            <polygon points="180,0 300,0 300,180 120,180"
              fill={selected ? "#008F36" : "#f3f4f6"} opacity={selected ? "0.12" : "0.6"} />
          </svg>
        </div>
        {motor.imageUrl ? (
          <img src={motor.imageUrl} alt={motor.name} className="relative z-10 max-h-36 object-contain" />
        ) : (
          <div className="relative z-10 flex flex-col items-center justify-center gap-2 py-10">
            <ImageIcon className={cn("w-12 h-12", selected ? "text-primary/40" : "text-border")} />
            <span className="text-xs font-sans text-muted-foreground uppercase tracking-wider">{motor.id}</span>
          </div>
        )}
      </div>

      {/* Spec strip */}
      <div className={cn(
        "px-4 pt-4 pb-2",
        selected ? "bg-white" : "bg-white"
      )}>
        {/* Voltage */}
        <div className="flex items-center justify-between mb-2">
          <h3 className={cn(
            "text-xl font-sans font-black uppercase tracking-tight",
            selected ? "text-primary" : "text-graphite"
          )}>
            {motor.name}
          </h3>
          <span className={cn(
            "text-xs font-sans font-bold px-2 py-0.5 border",
            selected ? "border-primary text-primary" : "border-border text-muted-foreground"
          )}>
            {Array.isArray(motor.voltages) ? motor.voltages.join("V / ") + "V" : `${motor.voltages}V`}
          </span>
        </div>

        {/* Big specs */}
        <div className="flex items-center justify-around py-3 bg-surface rounded-sm mb-3">
          <BigSpec value={motor.torqueNm} unit="Nm" label="Torque" />
          <div className="w-px h-10 bg-border" />
          <BigSpec value={motor.powerW} unit="W" label="Rated Power" />
          <div className="w-px h-10 bg-border" />
          <BigSpec value={motor.weightKg} unit="kg" label="Weight" />
        </div>

        {/* Tech spec rows */}
        <div className="border border-border rounded-sm overflow-hidden mb-4">
          <TechSpecRow label="Motor Type" value={motor.type === "mid" ? "Mid-Drive" : "Hub Motor"} />
          <TechSpecRow label="Controller" value={motor.controller === "integrated" ? "Integrated" : "External Required"} highlight={motor.controller === "integrated"} />
          <TechSpecRow label="Pedal Sensing" value={motor.pedalSensing === "integrated" ? "Integrated" : "External Required"} highlight={motor.pedalSensing === "integrated"} />
        </div>

        <button
          className={cn(
            "w-full py-2.5 text-sm font-sans font-bold uppercase tracking-wider transition-all",
            selected ? "bg-primary text-white" : "border border-border hover:border-primary hover:text-primary"
          )}
        >
          {selected ? "Selected" : "Select Motor"}
        </button>
      </div>
    </div>
  )
}

export function Step4MotorSelection() {
  const s = useAnandaStore()

  const filtered = aMotors.filter(m => {
    if (m.type !== s.driveType) return false
    if (s.voltagePlatform && !m.voltages.includes(s.voltagePlatform)) return false
    return true
  })

  const hasNoMotors = filtered.length === 0

  return (
    <div>
      <StepHeader
        step={4}
        title="Motor Selection"
        subtitle="Choose the motor architecture for this e-bike system. This affects the motor product list, controller requirements, and system wiring."
      />

      {hasNoMotors ? (
        <div className="border-2 border-dashed border-border p-12 text-center">
          <p className="text-sm font-sans font-semibold text-muted-foreground uppercase tracking-wider mb-2">No Motors Available</p>
          <p className="text-sm font-body text-muted-foreground">
            No motors match the current combination of drive type and voltage platform. Please adjust your selection in the previous steps.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(m => (
            <MotorCard
              key={m.id}
              motor={m}
              selected={s.motorId === m.id}
              onSelect={() => {
                s.setField("motorId", m.id)
                // Reset downstream controller if we're switching to mid-drive
                if (m.controller === "integrated") {
                  s.setField("controllerId", null)
                }
              }}
            />
          ))}
        </div>
      )}

    </div>
  )
}
