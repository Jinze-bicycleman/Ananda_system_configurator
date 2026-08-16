"use client"

import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface StepHeaderProps {
  step: number
  title: string
  subtitle?: string
  className?: string
}

export function StepHeader({ step, title, subtitle, className }: StepHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      {/* Energy bar stripe */}
      <div className="energy-bar h-1.5 w-full mb-6 rounded-full" />
      <div className="flex items-start">
        <div>
          <p className="text-xs font-sans uppercase tracking-[0.2em] text-primary font-semibold mb-1">Step {step}</p>
          <h2 className="text-3xl lg:text-4xl font-sans font-bold uppercase text-graphite leading-none tracking-tight">{title}</h2>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground font-body leading-relaxed max-w-xl">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}

interface SectionLabelProps {
  children: ReactNode
  className?: string
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <div className={cn("flex items-center gap-3 mb-4", className)}>
      <div className="w-1 h-5 bg-primary" />
      <p className="text-xs font-sans font-bold uppercase tracking-[0.15em] text-primary">{children}</p>
    </div>
  )
}

interface TechSpecRowProps {
  label: string
  value: string | number | null | undefined
  unit?: string
  highlight?: boolean
}

export function TechSpecRow({ label, value, unit, highlight }: TechSpecRowProps) {
  return (
    <div className={cn(
      "flex items-center justify-between py-1.5 px-3 border-b border-border last:border-0",
      highlight && "bg-primary/5"
    )}>
      <span className="text-[11px] font-sans uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-sans font-bold", highlight ? "text-primary" : "text-foreground")}>
        {value ?? "—"}{unit && value ? ` ${unit}` : ""}
      </span>
    </div>
  )
}

interface BigSpecProps {
  value: string | number | null
  unit: string
  label: string
}

export function BigSpec({ value, unit, label }: BigSpecProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-end gap-1 leading-none">
        <span className="text-3xl font-sans font-black text-graphite">{value ?? "—"}</span>
        <span className="text-base font-sans font-bold text-primary mb-0.5">{unit}</span>
      </div>
      <span className="text-[10px] font-sans uppercase tracking-wider text-muted-foreground mt-1">{label}</span>
    </div>
  )
}


