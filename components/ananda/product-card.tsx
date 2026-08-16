"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2, Image as ImageIcon, Bluetooth, Satellite, Radio, Cable } from "lucide-react"
import { StatusBadge } from "./status-badge"
import type { DbMotor, DbController, DbBattery, DbHmiDisplay } from "@/lib/ananda-db-types"

export type ProductType = "motor" | "controller" | "hmi" | "battery"
export type AnandaProduct = DbMotor | DbController | DbBattery | DbHmiDisplay

const TYPE_LABEL: Record<ProductType, string> = {
  motor: "Motor",
  controller: "Controller",
  hmi: "Display",
  battery: "Battery",
}

export function getCategoryLabel(productType: ProductType, product: AnandaProduct): string {
  switch (productType) {
    case "motor":
      return (product as DbMotor).motor_type === "mid_drive" ? "Mid-Drive Motor" : "Hub Motor"
    case "controller":
      return "Motor Controller"
    case "hmi":
      return "HMI Display"
    case "battery":
      return "Battery Pack"
  }
}

/** Compact, comparison-friendly stat chips — the only numeric/spec info shown on the card face. */
function getEssentialLines(productType: ProductType, product: AnandaProduct): string[] {
  switch (productType) {
    case "motor": {
      const m = product as DbMotor
      const lines: string[] = []
      if (m.voltage_v != null) lines.push(`${m.voltage_v}V`)
      if (m.torque_nm != null) lines.push(`${m.torque_nm} Nm`)
      if (m.rated_power_w != null) lines.push(`${m.rated_power_w} W Rated`)
      if (m.weight_kg != null) lines.push(`${m.weight_kg} kg`)
      if (m.communication_protocol) lines.push(m.communication_protocol)
      return lines
    }
    case "controller": {
      const c = product as DbController
      const lines: string[] = []
      if (c.voltage_v != null) lines.push(`${c.voltage_v}V`)
      if (c.rated_current_a != null) lines.push(`Rated: ${c.rated_current_a}A`)
      else if (c.rated_power_w != null) lines.push(`Rated: ${c.rated_power_w}W`)
      if (c.peak_current_a != null) lines.push(`Peak: ${c.peak_current_a}A`)
      else if (c.peak_power_w != null) lines.push(`Peak: ${c.peak_power_w}W`)
      if (c.communication_protocol) lines.push(c.communication_protocol)
      return lines
    }
    case "battery": {
      const b = product as DbBattery
      const lines: string[] = []
      if (b.voltage_v != null) lines.push(`${b.voltage_v}V`)
      if (b.capacity_wh != null) lines.push(`${b.capacity_wh} Wh`)
      if (b.capacity_ah != null) lines.push(`${b.capacity_ah} Ah`)
      if (b.weight_kg != null) lines.push(`${b.weight_kg} kg`)
      if (b.communication_protocol) lines.push(b.communication_protocol)
      return lines
    }
    case "hmi": {
      const d = product as DbHmiDisplay
      const lines: string[] = []
      if (d.size) lines.push(/inch/i.test(d.size) ? d.size : `${d.size} inch`)
      if (d.display_material) lines.push(d.display_material)
      if (d.connection_type) lines.push(d.connection_type)
      return lines
    }
  }
}

function getCompatibilityBadge(productType: ProductType, product: AnandaProduct): string | null {
  if (productType !== "controller") return null
  const c = product as DbController
  if (c.compatible_motor_type === "hub") return "Hub Compatible"
  if (c.compatible_motor_type === "mid_drive") return "Mid-Drive Compatible"
  return "Universal"
}

function getHmiIconBadges(productType: ProductType, product: AnandaProduct) {
  if (productType !== "hmi") return []
  const d = product as DbHmiDisplay
  const badges: { icon: typeof Bluetooth; label: string }[] = []
  if (d.bluetooth) badges.push({ icon: Bluetooth, label: "BT" })
  if (d.has_gps) badges.push({ icon: Satellite, label: "GPS" })
  if (d.has_4g) badges.push({ icon: Radio, label: "4G" })
  return badges
}

interface ProductCardProps {
  product: AnandaProduct
  productType: ProductType
  selected: boolean
  onSelect: () => void
  onCheckSpecification: () => void
  /** Business-logic badge supplied by the calling step (e.g. "required" for hub controllers). */
  badge?: "required" | "optional" | "not-required"
  className?: string
}

export function ProductCard({ product, productType, selected, onSelect, onCheckSpecification, badge, className }: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const model = (product as { model: string }).model
  const imageUrl = (product as { image_url: string | null }).image_url
  const isRecommended = productType === "motor" && (product as DbMotor).is_recommended
  const isIntegratedController = productType === "motor" && (product as DbMotor).controller_requirement === "integrated"
  const compatibilityBadge = getCompatibilityBadge(productType, product)
  const hmiIconBadges = getHmiIconBadges(productType, product)
  const lines = getEssentialLines(productType, product)

  return (
    <div
      className={cn(
        "relative cursor-pointer border-2 overflow-hidden transition-all flex flex-col bg-white",
        selected ? "border-primary shadow-lg shadow-primary/10" : "border-border hover:border-primary/40",
        className
      )}
      onClick={onSelect}
    >
      {/* Accent stripe */}
      <div className={cn("h-1.5 w-full", selected ? "bg-primary" : "bg-border")} />

      {/* Corner badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {isRecommended && <StatusBadge variant="recommended" />}
        {isIntegratedController && <StatusBadge variant="integrated" label="Integrated Controller" />}
        {badge && <StatusBadge variant={badge} />}
      </div>
      {selected && (
        <div className="absolute top-3 right-3 z-10 bg-primary rounded-full p-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      {/* Image area */}
      <div
        className={cn("relative flex items-center justify-center overflow-hidden", selected ? "bg-primary/5" : "bg-surface")}
        style={{ minHeight: 150 }}
      >
        <div className="absolute inset-0">
          <svg viewBox="0 0 300 150" className="w-full h-full" preserveAspectRatio="none">
            <polygon
              points="180,0 300,0 300,150 120,150"
              fill={selected ? "#008F36" : "#f3f4f6"}
              opacity={selected ? "0.12" : "0.6"}
            />
          </svg>
        </div>
        {imageUrl && !imageFailed ? (
          <img
            src={imageUrl}
            alt={model}
            className="relative z-10 max-h-32 object-contain"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="relative z-10 flex flex-col items-center justify-center gap-2 py-8">
            <ImageIcon className={cn("w-10 h-10", selected ? "text-primary/40" : "text-border")} />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-4 pt-4 pb-4 flex-1 flex flex-col">
        <h3 className={cn("text-xl font-sans font-black uppercase tracking-tight leading-none", selected ? "text-primary" : "text-graphite")}>
          {model}
        </h3>
        <p className="text-[11px] font-sans font-semibold uppercase tracking-wider text-muted-foreground mt-1 mb-3">
          {getCategoryLabel(productType, product)}
        </p>

        {/* Essential stat chips */}
        {lines.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {lines.map(line => (
              <span
                key={line}
                className="text-[11px] font-sans font-bold uppercase tracking-wide border border-border px-2 py-1 text-graphite bg-surface"
              >
                {line}
              </span>
            ))}
          </div>
        )}

        {/* HMI connectivity icon badges */}
        {hmiIconBadges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {hmiIconBadges.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 text-[10px] font-sans font-bold uppercase px-2 py-1 border border-primary/30 bg-primary/5 text-primary"
              >
                <Icon className="w-3 h-3" />
                {label}
              </span>
            ))}
          </div>
        )}

        {compatibilityBadge && (
          <div className="mb-3">
            <StatusBadge variant="compatible" label={compatibilityBadge} />
          </div>
        )}

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-3">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSelect()
            }}
            className={cn(
              "w-full py-2.5 text-sm font-sans font-bold uppercase tracking-wider transition-all",
              selected ? "bg-primary text-white" : "border border-border hover:border-primary hover:text-primary"
            )}
          >
            {selected ? "Selected" : `Select ${TYPE_LABEL[productType]}`}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onCheckSpecification()
            }}
            className="w-full py-2 text-[11px] font-sans font-bold uppercase tracking-wider text-muted-foreground border border-transparent hover:text-primary hover:border-primary/30 transition-all inline-flex items-center justify-center gap-1.5"
          >
            <Cable className="w-3 h-3" />
            Check Specification
          </button>
        </div>
      </div>
    </div>
  )
}
