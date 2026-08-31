"use client"

import { cn } from "@/lib/utils"
import { ReactNode } from "react"
import { AlertTriangle } from "lucide-react"

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
  /** Use for long descriptive values (e.g. port type descriptions) where a
   * right-aligned two-column layout would look cramped — the label sits
   * above the value instead. */
  stacked?: boolean
}

export function TechSpecRow({ label, value, unit, highlight, stacked }: TechSpecRowProps) {
  const isMissing = value === null || value === undefined || value === ""
  return (
    <div className={cn(
      stacked ? "long-spec-row" : "spec-row",
      "py-1.5 px-3 border-b border-border last:border-0",
      highlight && !isMissing && "bg-primary/5",
      isMissing && "bg-warning/5",
    )}>
      <span className="text-[11px] font-sans uppercase tracking-wider text-muted-foreground">{label}</span>
      {isMissing ? (
        <span className="flex items-center gap-1 text-[11px] font-sans font-bold uppercase tracking-wider text-warning">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          Spec Missing
        </span>
      ) : (
        <span className={cn(
          "text-sm font-sans font-bold tabular-nums",
          stacked ? "text-left wrap-anywhere" : "text-right whitespace-nowrap",
          highlight ? "text-primary" : "text-foreground",
        )}>
          {value}{unit ? ` ${unit}` : ""}
        </span>
      )}
    </div>
  )
}

interface ChoiceGroupProps<T extends string> {
  options: { id: T; label: string; disabled?: boolean }[]
  value: T | null
  onChange: (id: T) => void
  className?: string
}

// Reusable segmented / choice-button group (Value · Mainstream · Premium,
// Must Have · Target · Nice to Have, etc). Buttons wrap onto the next row
// instead of compressing below a readable width, and never overlap a
// neighboring button's text.
export function ChoiceGroup<T extends string>({ options, value, onChange, className }: ChoiceGroupProps<T>) {
  return (
    <div className={cn("choice-group", className)}>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          disabled={opt.disabled}
          onClick={() => onChange(opt.id)}
          className={cn(
            "border-2 px-3 py-2 text-center text-xs font-sans font-bold uppercase tracking-wide transition-colors",
            opt.disabled
              ? "cursor-not-allowed border-border text-muted-foreground opacity-50"
              : value === opt.id
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-graphite hover:border-primary/40",
          )}
        >
          {opt.label}
        </button>
      ))}
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
        <span className="text-3xl font-sans font-black tabular-nums text-graphite">{value ?? "—"}</span>
        <span className="text-base font-sans font-bold text-primary mb-0.5">{unit}</span>
      </div>
      <span className="text-[10px] font-sans uppercase tracking-wider text-muted-foreground mt-1">{label}</span>
    </div>
  )
}


