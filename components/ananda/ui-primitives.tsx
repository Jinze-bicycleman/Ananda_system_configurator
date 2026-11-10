"use client"

import { cn } from "@/lib/utils"
import { ReactNode, useId } from "react"
import { AlertTriangle } from "lucide-react"
import { useT } from "@/lib/i18n/provider"

/**
 * Hover affordance for selectable part cards: a light green mask with a faint
 * "choose" label. The card must carry the `group/choose` class. The mask hides
 * itself while an inner button (zoom, full specification…) is hovered, so it
 * never suggests that those controls will select the card.
 */
function MotorSilhouette({ className }: { className?: string }) {
  const maskId = `motor-holes-${useId().replace(/[^a-zA-Z0-9]/g, "")}`
  return (
    <svg
      viewBox="0 0 240 170"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="240" height="170">
          <g fill="white">
            <path d="M44 22C74 8 132 14 176 40C206 58 222 80 218 108C215 130 202 142 182 146L150 149C108 151 68 147 46 124C26 102 22 68 32 40Z" />
            <rect x="6" y="12" width="46" height="36" rx="16" />
            <circle cx="210" cy="130" r="18" />
            <rect x="196" y="82" width="38" height="24" rx="5" />
            <rect x="150" y="146" width="30" height="6" rx="3" transform="rotate(18 150 146)" />
            <rect x="162" y="152" width="26" height="5" rx="2.5" transform="rotate(8 162 152)" />
          </g>
          <g fill="black">
            <circle cx="27" cy="31" r="7" />
            <circle cx="210" cy="130" r="6.5" />
            <circle cx="150" cy="44" r="6" />
          </g>
        </mask>
      </defs>
      <rect width="240" height="170" mask={`url(#${maskId})`} />
    </svg>
  )
}

export function ChooseOverlay({ className }: { className?: string }) {
  const t = useT()
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-primary/15 opacity-0 transition-opacity duration-200",
        "group-hover/choose:opacity-100 group-has-[button:hover]/choose:opacity-0",
        className,
      )}
    >
      <MotorSilhouette className="absolute left-1/2 top-1/2 w-36 max-w-[75%] -translate-x-1/2 -translate-y-1/2 text-primary/30" />
      <span className="relative text-xl font-semibold tracking-wide text-primary/60">{t("choose")}</span>
    </span>
  )
}

interface StepHeaderProps {
  step: number
  title: string
  subtitle?: string
  className?: string
}

export function StepHeader({ step, title, subtitle, className }: StepHeaderProps) {
  const t = useT()
  return (
    <div className={cn("mb-8", className)}>
      <p className="mb-1 text-sm font-semibold text-primary">{t("Step {step}", { step })}</p>
      <h2 className="text-balance text-2xl font-semibold tracking-tight text-graphite sm:text-3xl">{t(title)}</h2>
      {subtitle && <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{t(subtitle)}</p>}
    </div>
  )
}

interface SectionLabelProps {
  children: ReactNode
  className?: string
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  const t = useT()
  return (
    <div className={cn("mb-4 flex items-center gap-2", className)}>
      <span className="h-4 w-1 rounded-full bg-primary" aria-hidden="true" />
      <p className="text-sm font-semibold text-graphite">{typeof children === "string" ? t(children) : children}</p>
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
  const t = useT()
  const isMissing = value === null || value === undefined || value === ""
  return (
    <div className={cn(
      stacked ? "long-spec-row" : "spec-row",
      "border-b border-border px-3 py-2 last:border-0",
      highlight && !isMissing && "bg-primary/5",
      isMissing && "bg-warning/5",
    )}>
      <span className="text-xs text-muted-foreground">{t(label)}</span>
      {isMissing ? (
        <span className="flex items-center gap-1 text-xs font-semibold text-warning">
          <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />
          {t("Spec missing")}
        </span>
      ) : (
        <span className={cn(
          "text-sm font-semibold tabular-nums",
          stacked ? "wrap-anywhere text-left" : "whitespace-nowrap text-right",
          highlight ? "text-primary" : "text-foreground",
        )}>
          {typeof value === "string" ? t(value) : value}{unit ? ` ${t(unit)}` : ""}
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
  selectedClassName?: string
}

// Reusable segmented / choice-button group (Value · Mainstream · Premium,
// Must Have · Target · Nice to Have, etc). Buttons wrap onto the next row
// instead of compressing below a readable width, and never overlap a
// neighboring button's text.
export function ChoiceGroup<T extends string>({ options, value, onChange, className, selectedClassName }: ChoiceGroupProps<T>) {
  const t = useT()
  return (
    <div className={cn("choice-group", className)}>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          disabled={opt.disabled}
          aria-pressed={value === opt.id}
          onClick={() => onChange(opt.id)}
          className={cn(
            "rounded-md border px-3 py-2 text-center text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            opt.disabled
              ? "cursor-not-allowed border-border text-muted-foreground opacity-50"
              : value === opt.id
                ? cn("border-primary bg-primary/5 font-semibold text-primary ring-1 ring-primary", selectedClassName)
                : "border-border bg-card text-graphite hover:border-primary/40 hover:bg-secondary/60",
          )}
        >
          {t(opt.label)}
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
  const t = useT()
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-end gap-1 leading-none">
        <span className="text-3xl font-semibold tabular-nums text-graphite">{value ?? "—"}</span>
        <span className="mb-0.5 text-base font-semibold text-primary">{unit}</span>
      </div>
      <span className="mt-1 text-xs text-muted-foreground">{t(label)}</span>
    </div>
  )
}
