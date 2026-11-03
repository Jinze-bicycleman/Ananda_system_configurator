"use client"

import { cn } from "@/lib/utils"
import { useT } from "@/lib/i18n/provider"

interface StatusBadgeProps {
  variant: "recommended" | "required" | "optional" | "integrated" | "not-required" | "compatible" | "warning" | "custom"
  label?: string
  className?: string
}

export function StatusBadge({ variant, label, className }: StatusBadgeProps) {
  const t = useT()
  const map: Record<StatusBadgeProps["variant"], { text: string; cls: string }> = {
    recommended:  { text: "Recommended",   cls: "bg-primary text-white" },
    required:     { text: "Required",      cls: "bg-destructive text-white" },
    optional:     { text: "Optional",      cls: "bg-card border border-border text-graphite-light" },
    integrated:   { text: "Integrated",    cls: "bg-lime text-graphite font-semibold" },
 "not-required": { text: "Not Required", cls: "bg-card border border-border text-muted-foreground" },
    compatible:   { text: "Compatible",    cls: "bg-primary/10 border border-primary/30 text-primary" },
    warning:      { text: "Warning",       cls: "bg-warning text-warning-foreground" },
    custom:       { text: label ?? "",     cls: "bg-card border border-border text-foreground" },
  }

  const { text, cls } = map[variant]

  return (
    <span className={cn(
 "inline-flex items-center px-2 py-0.5 text-xs font-semibold   rounded-sm",
      cls,
      className
    )}>
      {t(label ?? text)}
    </span>
  )
}
