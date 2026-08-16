"use client"

import { useState } from "react"
import { useAnandaStore } from "@/lib/ananda-store"
import { useAnandaProductData } from "./product-data-provider"
import { driveTypeToMotorType } from "@/lib/ananda-db-types"
import type { DbMotor } from "@/lib/ananda-db-types"
import { StepHeader, BigSpec, TechSpecRow, EmptyState } from "./ui-primitives"
import { StatusBadge } from "./status-badge"
import { cn } from "@/lib/utils"
import { CheckCircle2, Image as ImageIcon } from "lucide-react"

function MotorCard({ motor, selected, onSelect }: { motor: DbMotor; selected: boolean; onSelect: () => void }) {
  const [imageFailed, setImageFailed] = useState(false)
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
        {motor.is_recommended && <StatusBadge variant="recommended" />}
        {motor.controller_requirement === "integrated" && <StatusBadge variant="integrated" label="Controller Integrated" />}
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
        {motor.image_url && !imageFailed ? (
          <img
            src={motor.image_url}
            alt={motor.model}
            className="relative z-10 max-h-36 object-contain"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="relative z-10 flex flex-col items-center justify-center gap-2 py-10">
            <ImageIcon className={cn("w-12 h-12", selected ? "text-primary/40" : "text-border")} />
            <span className="text-xs font-sans text-muted-foreground uppercase tracking-wider">{motor.model}</span>
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
            {motor.model}
          </h3>
          <span className={cn(
            "text-xs font-sans font-bold px-2 py-0.5 border",
            selected ? "border-primary text-primary" : "border-border text-muted-foreground"
          )}>
            {motor.voltage_v}V
          </span>
        </div>

        {/* Big specs */}
        <div className="flex items-center justify-around py-3 bg-surface rounded-sm mb-3">
          <BigSpec value={motor.torque_nm} unit="Nm" label="Torque" />
          <div className="w-px h-10 bg-border" />
          <BigSpec value={motor.rated_power_w} unit="W" label="Rated Power" />
          <div className="w-px h-10 bg-border" />
          <BigSpec value={motor.weight_kg} unit="kg" label="Weight" />
        </div>

        {/* Tech spec rows */}
        <div className="border border-border rounded-sm overflow-hidden mb-4">
          <TechSpecRow label="Motor Type" value={motor.motor_type === "mid_drive" ? "Mid-Drive" : "Hub Motor"} />
          <TechSpecRow label="Controller" value={motor.controller_requirement === "integrated" ? "Integrated" : motor.controller_requirement === "not_required" ? "Not Required" : "External Required"} highlight={motor.controller_requirement === "integrated"} />
          <TechSpecRow label="Pedal Sensing" value={motor.pedal_sensing === "integrated" ? "Integrated" : motor.pedal_sensing === "not_required" ? "Not Required" : motor.pedal_sensing === "external_required" ? "External Required" : null} highlight={motor.pedal_sensing === "integrated"} />
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
  const { motors, loading, error } = useAnandaProductData()

  const targetMotorType = driveTypeToMotorType(s.driveType)

  const filtered = motors.filter(m => {
    if (m.motor_type !== targetMotorType) return false
    if (s.voltagePlatform && m.voltage_v !== s.voltagePlatform) return false
    return true
  })

  const hasNoMotors = filtered.length === 0

  return (
    <div>
      <StepHeader
        step={5}
        title="Motor Selection"
        subtitle="Choose the motor architecture for this e-bike system. This affects the motor product list, controller requirements, and system wiring."
      />

      {loading ? (
        <div className="border border-border p-12 text-center">
          <p className="text-sm font-sans font-semibold text-muted-foreground uppercase tracking-wider">Loading motors…</p>
        </div>
      ) : error ? (
        <EmptyState title="Unable to Load Motors" description={error} />
      ) : hasNoMotors ? (
        <EmptyState
          title="No Motors Available"
          description="No motors match the current combination of drive type and voltage platform. Please adjust your selection in the previous steps."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(m => (
            <MotorCard
              key={m.id}
              motor={m}
              selected={s.motorId === m.id}
              onSelect={() => {
                s.setField("motorId", m.id)
                // Reset downstream controller if we're switching to an integrated-controller motor
                if (m.controller_requirement === "integrated") {
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
