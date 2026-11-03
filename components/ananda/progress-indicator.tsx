"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useT } from "@/lib/i18n/provider"

const STEPS = [
  { n: 1, label: "Sell Region & Regulation" },
  { n: 2, label: "Bike Category" },
  { n: 3, label: "Package Configuration" },
  { n: 4, label: "Drivetrain" },
  { n: 5, label: "Accessories" },
  { n: 6, label: "System Diagram" },
  { n: 7, label: "Configuration Report" },
]

export function ProgressIndicator({ current, onStep }: { current: number; onStep: (n: number) => void }) {
  const t = useT()
  return (
    <nav className="w-full bg-background" aria-label={t("Configuration steps")}>
      <div className="no-print flex items-center overflow-x-auto lg:hidden">
        {STEPS.map((s) => {
          const done = current > s.n
          const active = current === s.n
          return (
            <button
              key={s.n}
              type="button"
              onClick={() => onStep(s.n)}
              aria-current={active ? "step" : undefined}
              aria-label={t("Step {n}: {label}", { n: s.n, label: t(s.label) })}
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary",
                active && "bg-primary text-primary-foreground",
                done && "bg-primary/10 text-primary",
                !active && !done && "text-muted-foreground",
              )}
            >
              {done ? <Check className="h-4 w-4" aria-hidden="true" /> : s.n}
            </button>
          )
        })}
        <div className="min-w-0 flex-1 px-3 py-2">
          <span className="block truncate text-sm font-medium text-graphite">{STEPS[current - 1] ? t(STEPS[current - 1].label) : null}</span>
        </div>
      </div>

      <ol className="hidden flex-col gap-1 p-3 lg:flex">
        {STEPS.map((s) => {
          const done = current > s.n
          const active = current === s.n
          return (
            <li key={s.n}>
              <button
                type="button"
                onClick={() => onStep(s.n)}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  active ? "bg-primary/10" : "hover:bg-secondary",
                  !active && !done && "opacity-60",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    active && "bg-primary text-primary-foreground",
                    done && "bg-primary/15 text-primary",
                    !active && !done && "bg-secondary text-muted-foreground",
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : s.n}
                </span>
                <span
                  className={cn(
                    "text-sm leading-snug",
                    active ? "font-semibold text-graphite" : "font-medium text-muted-foreground",
                  )}
                >
                  {t(s.label)}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
