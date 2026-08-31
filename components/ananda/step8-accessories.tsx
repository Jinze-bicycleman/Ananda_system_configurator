"use client"

import { useAnandaStore } from "@/lib/ananda-store"
import { aAccessories } from "@/lib/ananda-data"
import { StepHeader, SectionLabel } from "./ui-primitives"
import { cn } from "@/lib/utils"
import { Wifi, Lightbulb, Gauge, MoreHorizontal, CheckCircle2 } from "lucide-react"

const CATEGORIES = [
  { id: "iot",     label: "IoT / Connectivity",  icon: Wifi },
  { id: "lights",  label: "Lighting",             icon: Lightbulb },
  { id: "throttle", label: "Throttle",            icon: Gauge },
  { id: "other",   label: "Other Accessories",    icon: MoreHorizontal },
]

export function Step8Accessories() {
  const s = useAnandaStore()

  return (
    <div>
      <StepHeader
        step={6}
        title="Accessories"
        subtitle="Select optional accessories for the system. All items show technical specifications and weight only. Toggle to add or remove."
      />

      <div className="space-y-8">
        {CATEGORIES.map(cat => {
          const items = aAccessories.filter(a => a.category === cat.id)
          const Icon = cat.icon
          return (
            <section key={cat.id}>
              <SectionLabel>
                <span className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" />
                  {cat.label}
                </span>
              </SectionLabel>

              <div className="product-option-grid">
                {items.map(acc => {
                  const selected = s.accessoryIds.includes(acc.id)
                  return (
                    <button
                      key={acc.id}
                      onClick={() => s.toggleAccessory(acc.id)}
                      className={cn(
                        "product-card relative text-left border-2 transition-all p-0",
                        selected ? "border-primary shadow-md shadow-primary/10" : "border-border hover:border-primary/40"
                      )}
                    >
                      <div className={cn("h-1 w-full", selected ? "bg-primary" : "bg-border")} />

                      {selected && (
                        <div className="absolute top-2 right-2">
                          <div className="bg-primary rounded-full p-0.5">
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}

                      {/* Icon area */}
                      <div className={cn(
                        "relative flex items-center justify-center h-16 overflow-hidden",
                        selected ? "bg-primary/5" : "bg-surface"
                      )}>
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 160 64" preserveAspectRatio="none">
                          <polygon points="100,0 160,0 160,64 60,64"
                            fill={selected ? "#008F36" : "#f3f4f6"} opacity={selected ? "0.12" : "0.5"} />
                        </svg>
                        <Icon className={cn("w-7 h-7 relative z-10", selected ? "text-primary" : "text-border")} />
                      </div>

                      <div className="min-w-0 p-3">
                        <p className={cn(
                          "text-sm font-sans font-bold uppercase leading-tight mb-1",
                          selected ? "text-primary" : "text-graphite"
                        )}>
                          {acc.name}
                        </p>
                        <p className="text-[11px] font-body text-muted-foreground leading-snug mb-2">{acc.description}</p>
                        <div className="mt-auto flex items-center justify-between gap-2">
                          <span className="text-[10px] font-sans uppercase tracking-wider text-muted-foreground">Weight</span>
                          <span className="whitespace-nowrap text-xs font-sans font-bold text-foreground">
                            {acc.weightKg ? `${acc.weightKg} kg` : "—"}
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      {/* Summary */}
      {s.accessoryIds.length > 0 && (
        <div className="mt-6 border border-primary/30 bg-primary/5 px-5 py-4">
          <p className="text-[11px] font-sans font-bold uppercase tracking-wider text-primary mb-2">
            {s.accessoryIds.length} accessor{s.accessoryIds.length > 1 ? "ies" : "y"} selected
          </p>
          <div className="flex flex-wrap gap-2">
            {s.accessoryIds.map(id => {
              const acc = aAccessories.find(a => a.id === id)
              if (!acc) return null
              return (
                <span key={id} className="inline-flex items-center gap-1.5 bg-white border border-primary/30 px-2.5 py-1 text-xs font-sans font-semibold text-primary">
                  {acc.name}
                  <button onClick={(e) => { e.stopPropagation(); s.toggleAccessory(id) }} className="text-primary/50 hover:text-primary">×</button>
                </span>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
