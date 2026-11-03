"use client"

import { Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { LOCALES } from "@/lib/i18n/config"
import { useI18n } from "@/lib/i18n/provider"

export function LanguageSwitch({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n()

  return (
    <div
      role="group"
      aria-label={t("Language")}
      className={cn("inline-flex items-center gap-1 rounded-md border border-border bg-card p-0.5", className)}
    >
      <Globe className="ml-1.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      {LOCALES.map((option) => {
        const active = option.code === locale
        return (
          <button
            key={option.code}
            type="button"
            lang={option.code}
            aria-pressed={active}
            aria-label={option.label}
            onClick={() => setLocale(option.code)}
            className={cn(
              "rounded px-2 py-1 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary",
              active ? "bg-primary text-primary-foreground" : "text-graphite hover:text-primary",
            )}
          >
            {option.short}
          </button>
        )
      })}
    </div>
  )
}
