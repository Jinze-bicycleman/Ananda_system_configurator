"use client"

import { useAnandaStore } from "@/lib/ananda-store"
import { useMotors } from "@/lib/ananda-packages"
import { Pencil } from "lucide-react"
import { useT } from "@/lib/i18n/provider"

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-graphite truncate">{value}</p>
    </div>
  )
}

export function DrivetrainSummary({ onEditStep }: { onEditStep: (stepNumber: number) => void }) {
  const s = useAnandaStore()
  const t = useT()
  const { motors } = useMotors()
  const motor = motors.find((m) => m.id === s.motorId) ?? null

  return (
    <div className="border border-border bg-card overflow-hidden mb-6">
      <div className="h-1 bg-primary" />
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 bg-surface border-b border-border">
        <p className="text-xs font-semibold text-graphite">{t("Inherited Configuration")}</p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onEditStep(2)}
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <Pencil className="w-3 h-3" /> {t("Edit Bike")}
          </button>
          <button
            onClick={() => onEditStep(4)}
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <Pencil className="w-3 h-3" /> {t("Edit Motor Package")}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 px-5 py-4">
        <SummaryItem label={t("Bike Category")} value={s.bikeCategory ? t(s.bikeCategory) : "—"} />
        <SummaryItem label={t("Motor Package")} value={motor?.model ?? "—"} />
        <SummaryItem label={t("Motor Type")} value={s.driveType === "mid" ? t("Mid-Drive") : s.driveType === "hub" ? t("Hub-Drive") : "—"} />
        <SummaryItem label={t("Peak Torque")} value={motor?.torque_nm ? `${motor.torque_nm} Nm` : "—"} />
        <SummaryItem label={t("Wheel Size")} value={s.wheelSize ?? "—"} />
        <SummaryItem label={t("Tyre Circumference")} value={s.tyreCircumferenceMm ? `${s.tyreCircumferenceMm} mm` : "—"} />
        <SummaryItem label={t("Max Assisted Speed")} value={s.speedLimitKmh ? `${s.speedLimitKmh} km/h` : "—"} />
        <SummaryItem label={t("Expected GVW")} value={s.gvwKg ? `${s.gvwKg} kg` : t("Not entered")} />
      </div>
    </div>
  )
}
