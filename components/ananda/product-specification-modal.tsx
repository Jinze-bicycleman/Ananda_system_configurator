"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Image as ImageIcon, ExternalLink, X } from "lucide-react"
import type { DbMotor, DbController, DbBattery, DbHmiDisplay } from "@/lib/ananda-db-types"
import { getCategoryLabel, type ProductType, type AnandaProduct } from "./product-card"

interface SpecRow {
  label: string
  value: string | number | null | undefined
}

function fmt(value: string | number | null | undefined, unit?: string): string {
  if (value === null || value === undefined || value === "") return "—"
  return unit ? `${value} ${unit}` : String(value)
}

function fmtBool(value: boolean | null | undefined, yes = "Yes", no = "No"): string {
  if (value === null || value === undefined) return "—"
  return value ? yes : no
}

function getSpecRows(productType: ProductType, product: AnandaProduct): SpecRow[] {
  switch (productType) {
    case "motor": {
      const m = product as DbMotor
      return [
        { label: "Model", value: m.model },
        { label: "Product Type", value: m.motor_type === "mid_drive" ? "Mid-Drive Motor" : "Hub Motor" },
        { label: "Voltage", value: fmt(m.voltage_v, "V") },
        { label: "Torque", value: fmt(m.torque_nm, "Nm") },
        { label: "Rated Power", value: fmt(m.rated_power_w, "W") },
        { label: "Peak Power", value: fmt(m.peak_power_w, "W") },
        { label: "Weight", value: fmt(m.weight_kg, "kg") },
        { label: "Size", value: fmt(m.size) },
        { label: "Shaft Interface", value: fmt(m.shaft_interface) },
        { label: "Mounting Interface", value: fmt(m.mounting_interface) },
        { label: "Communication", value: fmt(m.communication_protocol) },
        {
          label: "Controller Requirement",
          value:
            m.controller_requirement === "integrated"
              ? "Integrated"
              : m.controller_requirement === "not_required"
                ? "Not Required"
                : "External Required",
        },
        {
          label: "Pedal Sensing",
          value:
            m.pedal_sensing === "integrated"
              ? "Integrated"
              : m.pedal_sensing === "external_required"
                ? "External Required"
                : m.pedal_sensing === "not_required"
                  ? "Not Required"
                  : "—",
        },
        { label: "RPM", value: fmt(m.rpm) },
        { label: "Max Efficiency", value: fmt(m.max_efficiency) },
        { label: "Noise Grade", value: fmt(m.noise_grade_db, "dB") },
        { label: "Waterproof", value: fmt(m.waterproof) },
        { label: "Colour", value: fmt(m.color) },
        { label: "Construction", value: fmt(m.construction) },
        { label: "Light Drive Capacity", value: fmt(m.light_drive_capacity) },
        { label: "Sensor Description", value: fmt(m.sensor_description) },
        { label: "Description", value: fmt(m.short_description) },
      ]
    }
    case "controller": {
      const c = product as DbController
      return [
        { label: "Model", value: c.model },
        {
          label: "Compatible Motor Type",
          value: c.compatible_motor_type === "hub" ? "Hub" : c.compatible_motor_type === "mid_drive" ? "Mid-Drive" : "Both",
        },
        { label: "Voltage", value: fmt(c.voltage_v, "V") },
        { label: "Rated Power", value: fmt(c.rated_power_w, "W") },
        { label: "Peak Power", value: fmt(c.peak_power_w, "W") },
        { label: "Rated Current", value: fmt(c.rated_current_a, "A") },
        { label: "Peak Current", value: fmt(c.peak_current_a, "A") },
        { label: "Communication", value: fmt(c.communication_protocol) },
        { label: "Connection Type", value: fmt(c.connection_type) },
        { label: "Size", value: fmt(c.size) },
        { label: "Weight", value: fmt(c.weight_kg, "kg") },
        { label: "Description", value: fmt(c.short_description) },
      ]
    }
    case "hmi": {
      const d = product as DbHmiDisplay
      return [
        { label: "Model", value: d.model },
        { label: "Screen Size", value: fmt(d.size) },
        { label: "Display Material", value: fmt(d.display_material) },
        { label: "Connection Type", value: fmt(d.connection_type) },
        { label: "Bluetooth", value: fmtBool(d.bluetooth) },
        { label: "GPS", value: fmtBool(d.has_gps) },
        { label: "4G", value: fmtBool(d.has_4g) },
        { label: "Communication", value: fmt(d.communication_protocol) },
        { label: "Voltage Compatibility", value: d.voltage_v != null ? fmt(d.voltage_v, "V") : "All Platforms" },
        { label: "Bluetooth Status", value: fmt(d.bluetooth_status) },
        { label: "USB Charge Status", value: fmt(d.usb_charge_status) },
        { label: "Remote Control Status", value: fmt(d.remote_control_status) },
        { label: "Waterproof", value: fmt(d.waterproof) },
        { label: "Weight", value: fmt(d.weight_kg, "kg") },
        { label: "Description", value: fmt(d.short_description) },
      ]
    }
    case "battery": {
      const b = product as DbBattery
      return [
        { label: "Model", value: b.model },
        { label: "Voltage", value: fmt(b.voltage_v, "V") },
        { label: "Capacity", value: fmt(b.capacity_wh, "Wh") },
        { label: "Capacity", value: fmt(b.capacity_ah, "Ah") },
        { label: "Weight", value: fmt(b.weight_kg, "kg") },
        { label: "Size", value: fmt(b.size) },
        { label: "Communication", value: fmt(b.communication_protocol) },
        { label: "Description", value: fmt(b.short_description) },
      ]
    }
  }
}

interface ProductSpecificationModalProps {
  product: AnandaProduct | null
  productType: ProductType | null
  isOpen: boolean
  onClose: () => void
}

export function ProductSpecificationModal({ product, productType, isOpen, onClose }: ProductSpecificationModalProps) {
  const [imageFailed, setImageFailed] = useState(false)

  if (!product || !productType) return null

  const model = (product as { model: string }).model
  const imageUrl = (product as { image_url: string | null }).image_url
  const datasheetUrl = (product as { datasheet_url: string | null }).datasheet_url
  const rows = getSpecRows(productType, product)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-3xl p-0 gap-0 overflow-hidden rounded-none border-2 border-border"
        showCloseButton={false}
        onOpenAutoFocus={() => setImageFailed(false)}
      >
        <DialogTitle className="sr-only">{`Technical Specification — ${model}`}</DialogTitle>
        <DialogDescription className="sr-only">
          {`Full technical specification table for the ${model} ${getCategoryLabel(productType, product)}.`}
        </DialogDescription>

        {/* Green header bar (diagonal Ananda-style accent) */}
        <div className="relative bg-graphite px-6 py-5 overflow-hidden">
          <div className="absolute inset-0">
            <svg viewBox="0 0 400 80" className="w-full h-full" preserveAspectRatio="none">
              <polygon points="260,0 400,0 400,80 200,80" fill="#008F36" opacity="0.9" />
            </svg>
          </div>
          <DialogClose className="absolute top-4 right-4 z-20 rounded-full p-1 text-white/80 hover:text-white hover:bg-white/10 transition-colors focus:outline-none">
            <X className="w-5 h-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <p className="relative z-10 text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-lime">
            Technical Specification
          </p>
          <h2 className="relative z-10 text-2xl font-sans font-black uppercase tracking-tight text-white mt-1">{model}</h2>
          <p className="relative z-10 text-xs font-sans font-semibold uppercase tracking-wider text-white/70 mt-0.5">
            {getCategoryLabel(productType, product)}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] max-h-[70vh] overflow-y-auto">
          {/* Image area */}
          <div className="relative flex items-center justify-center bg-surface p-6 border-b sm:border-b-0 sm:border-r border-border">
            {imageUrl && !imageFailed ? (
              <img
                src={imageUrl}
                alt={model}
                className="max-h-40 object-contain"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <ImageIcon className="w-14 h-14 text-border" />
            )}
          </div>

          {/* Spec table */}
          <div className="divide-y divide-border">
            {rows.map((row, i) => (
              <div key={`${row.label}-${i}`} className="flex items-start justify-between gap-4 px-5 py-2.5">
                <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-muted-foreground shrink-0">
                  {row.label}
                </span>
                <span className="text-sm font-sans font-semibold text-graphite text-right">{row.value}</span>
              </div>
            ))}
            {datasheetUrl && (
              <div className="px-5 py-3">
                <a
                  href={datasheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-sans font-bold uppercase tracking-wider text-primary hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Datasheet
                </a>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** Shared state helper for opening the specification modal from any step component. */
export function useSpecificationModal() {
  const [state, setState] = useState<{ product: AnandaProduct; productType: ProductType } | null>(null)

  return {
    isOpen: state !== null,
    product: state?.product ?? null,
    productType: state?.productType ?? null,
    open: (product: AnandaProduct, productType: ProductType) => setState({ product, productType }),
    close: () => setState(null),
  }
}
