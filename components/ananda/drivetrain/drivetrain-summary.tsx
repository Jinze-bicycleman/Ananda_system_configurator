"use client"

import { useAnandaStore } from "@/lib/ananda-store"
import { useMotors } from "@/lib/ananda-packages"
import { Pencil } from "lucide-react"

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-sans font-semibold text-graphite truncate">{value}</p>
    </div>
  )
}

export function DrivetrainSummary({ onEditStep }: { onEditStep: (stepNumber: number) => void }) {
  const s = useAnandaStore()
  const { motors } = useMotors()
  const motor = motors.find((m) => m.id === s.motorId) ?? null

  return (
    <div className="border border-border bg-white overflow-hidden mb-6">
      <div className="h-1 bg-primary" />
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 bg-surface border-b border-border">
        <p className="text-[11px] font-sans font-black uppercase tracking-[0.15em] text-graphite">Inherited Configuration</p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onEditStep(2)}
            className="flex items-center gap-1 text-[11px] font-sans font-bold uppercase tracking-wider text-primary hover:underline"
          >
            <Pencil className="w-3 h-3" /> Edit Bike
          </button>
          <button
            onClick={() => onEditStep(4)}
            className="flex items-center gap-1 text-[11px] font-sans font-bold uppercase tracking-wider text-primary hover:underline"
          >
            <Pencil className="w-3 h-3" /> Edit Motor Package
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 px-5 py-4">
        <SummaryItem label="Bike Category" value={s.bikeCategory ?? "—"} />
        <SummaryItem label="Motor Package" value={motor?.model ?? "—"} />
        <SummaryItem label="Motor Type" value={s.driveType === "mid" ? "Mid-Drive" : s.driveType === "hub" ? "Hub-Drive" : "—"} />
        <SummaryItem label="Peak Torque" value={motor?.torque_nm ? `${motor.torque_nm} Nm` : "—"} />
        <SummaryItem label="Wheel Size" value={s.wheelSize ?? "—"} />
        <SummaryItem label="Tyre Circumference" value={s.tyreCircumferenceMm ? `${s.tyreCircumferenceMm} mm` : "—"} />
        <SummaryItem label="Max Assisted Speed" value={s.speedLimitKmh ? `${s.speedLimitKmh} km/h` : "—"} />
        <SummaryItem label="Expected GVW" value={s.gvwKg ? `${s.gvwKg} kg` : "Not entered"} />
      </div>
    </div>
  )
}
