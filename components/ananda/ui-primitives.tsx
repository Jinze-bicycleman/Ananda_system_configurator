"use client"

import { cn } from "@/lib/utils"
import { ReactNode } from "react"
import { AlertTriangle } from "lucide-react"
import { useT } from "@/lib/i18n/provider"

/**
 * Hover affordance for selectable part cards: a light green mask with a faint
 * "choose" label. The card must carry the `group/choose` class. The mask hides
 * itself while an inner button (zoom, full specification…) is hovered, so it
 * never suggests that those controls will select the card.
 */
function MotorSilhouette({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 176"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M2.7 6.1 L1.0 9.3 L0.3 11.9 L0.2 17.3 L0.9 20.1 L2.0 22.4 L3.5 24.5 L6.4 27.2 L7.9 32.0 L8.4 35.3 L8.7 45.6 L9.7 50.2 L11.3 65.5 L13.6 76.3 L12.7 79.6 L12.9 81.9 L13.8 83.5 L16.0 85.3 L20.1 97.0 L24.5 106.6 L28.9 114.4 L36.4 125.2 L44.2 133.2 L50.0 138.2 L57.0 143.1 L72.4 152.2 L84.9 158.3 L101.3 164.5 L114.4 167.9 L125.0 169.7 L134.9 170.7 L153.2 171.6 L174.9 170.9 L179.2 172.3 L180.9 172.1 L183.8 170.0 L194.9 169.0 L198.5 170.0 L206.1 173.2 L214.2 175.8 L215.7 175.8 L217.1 175.2 L219.1 172.8 L219.4 170.1 L219.0 168.7 L217.5 167.2 L215.0 166.0 L214.0 165.0 L214.2 164.2 L219.0 156.4 L220.8 154.8 L225.0 155.6 L227.5 155.6 L230.2 155.0 L232.5 153.8 L235.2 151.9 L237.3 149.0 L238.9 145.7 L239.8 142.1 L239.9 138.4 L239.4 135.3 L238.3 132.6 L235.7 129.6 L233.4 128.1 L230.6 127.0 L229.1 125.8 L228.1 122.8 L227.8 112.5 L229.3 108.3 L230.6 102.5 L230.8 94.4 L229.9 88.5 L228.7 84.6 L226.5 80.0 L225.2 72.8 L223.4 65.9 L222.2 62.3 L219.0 55.5 L214.4 48.6 L208.2 42.1 L204.2 39.1 L200.7 37.0 L195.8 33.1 L194.6 30.8 L193.6 29.8 L191.8 28.9 L187.9 27.9 L183.6 25.2 L174.0 20.7 L167.8 18.8 L165.9 17.8 L143.8 11.0 L128.6 7.5 L116.0 5.2 L96.7 2.4 L80.7 1.1 L64.0 0.5 L49.8 0.5 L26.9 1.9 L16.9 0.2 L12.9 0.0 L9.8 0.6 L7.3 1.7 L5.1 3.4ZM39.699999999999996 23.3a5.7 5.7 0 1 0 11.4 0a5.7 5.7 0 1 0 -11.4 0ZM164.4 32.8a5 5 0 1 0 10 0a5 5 0 1 0 -10 0ZM223.1 141.5a4.8 4.8 0 1 0 9.6 0a4.8 4.8 0 1 0 -9.6 0ZM215.8 106.0a4.1 4.1 0 1 0 8.2 0a4.1 4.1 0 1 0 -8.2 0Z"
      />
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
