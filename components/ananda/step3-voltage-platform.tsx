"use client"

import { useAnandaStore } from "@/lib/ananda-store"
import { StepHeader } from "./ui-primitives"
import { cn } from "@/lib/utils"
import { CheckCircle2, Zap } from "lucide-react"

const VOLTAGE_PLATFORMS = [
  {
    v: 36 as const,
    label: "36V",
    tagline: "Reliable & Budget-Friendly",
    color: "from-primary/60 to-lime/60",
    bullets: [
      "Reliable platform",
      "Budget-friendly",
      "Good for casual riding",
      "Suitable for flat-road commuting",
      "Lower performance demand",
    ],
    note: "A 36V platform is a reliable, budget-friendly option for casual, flat-road riding.",
  },
  {
    v: 48 as const,
    label: "48V",
    tagline: "Performance-Oriented",
    color: "from-primary to-lime",
    bullets: [
      "Performance-oriented",
      "Better for hills",
      "Better for cargo",
      "Better for long distances",
      "Higher power demand",
    ],
    note: "A 48V platform is the preferred choice for performance, hills, cargo use and long distances.",
  },
]

export function Step3VoltagePlatform() {
  const s = useAnandaStore()

  return (
    <div>
      <StepHeader
        step={4}
        title="Voltage Platform"
        subtitle="Select the system voltage. All subsequent products — motor, battery, controller, charger — will be filtered to the selected platform."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {VOLTAGE_PLATFORMS.map(vp => {
          const selected = s.voltagePlatform === vp.v
          // Check if any motor in the current driveType supports this voltage
          return (
            <div
              key={vp.v}
              onClick={() => s.setField("voltagePlatform", vp.v)}
              className={cn(
                "relative cursor-pointer border-2 overflow-hidden transition-all",
                selected ? "border-primary shadow-lg shadow-primary/10" : "border-border hover:border-primary/40"
              )}
            >
              {/* Voltage hero area */}
              <div className={cn(
                "relative px-8 pt-8 pb-6 overflow-hidden",
                selected ? "bg-graphite" : "bg-surface"
              )}>
                {/* Background energy bar pattern */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className={cn(
                    "absolute bottom-0 left-0 h-full w-full opacity-10",
                    `bg-gradient-to-tr ${vp.color}`
                  )} />
                  {/* Diagonal stripe */}
                  <svg className="absolute right-0 top-0 h-full w-32" viewBox="0 0 128 160" preserveAspectRatio="none">
                    <polygon points="60,0 128,0 128,160 0,160" fill={selected ? "#008F36" : "#f3f4f6"} opacity={selected ? "0.3" : "1"} />
                  </svg>
                </div>

                <div className="relative">
                  {/* Big voltage number */}
                  <div className="flex items-end gap-2 mb-2">
                    <span className={cn(
                      "text-7xl font-sans font-black leading-none",
                      selected ? "text-white" : "text-graphite"
                    )}>
                      {vp.label}
                    </span>
                    <Zap className={cn("w-8 h-8 mb-2", selected ? "text-lime" : "text-primary")} />
                  </div>
                  <p className={cn(
                    "text-sm font-sans font-bold uppercase tracking-wider",
                    selected ? "text-lime" : "text-primary"
                  )}>
                    {vp.tagline}
                  </p>

                  {/* Gradient energy bar */}
                  <div className={cn(
                    "mt-4 h-2 w-full rounded-full",
                    selected
                      ? "bg-gradient-to-r from-primary to-lime"
                      : "bg-gradient-to-r from-border to-border/50"
                  )} />
                  {vp.v === 48 && (
                    <div className="flex justify-end mt-1">
                      <div className="w-2/3 h-1 rounded-full bg-gradient-to-r from-primary to-lime opacity-60" />
                    </div>
                  )}
                </div>

                {/* Selection mark */}
                {selected && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-primary rounded-full p-1">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6">
                <button
                  className={cn(
                    "mt-5 w-full py-2.5 text-sm font-sans font-bold uppercase tracking-wider transition-all",
                    selected
                      ? "bg-primary text-white"
                      : "border border-border text-graphite hover:border-primary hover:text-primary"
                  )}
                >
                  {selected ? `${vp.label} Platform Selected` : `Select ${vp.label} Platform`}
                </button>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
