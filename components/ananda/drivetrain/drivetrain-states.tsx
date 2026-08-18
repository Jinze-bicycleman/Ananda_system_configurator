"use client"

import { AlertTriangle, Info, Loader2, PackageSearch } from "lucide-react"
import { cn } from "@/lib/utils"

export function DrivetrainLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 border border-border bg-white py-16">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-sm font-body text-muted-foreground">Loading drivetrain catalogue from the database…</p>
    </div>
  )
}

export function DrivetrainErrorState({ error }: { error: { message?: string } | undefined }) {
  return (
    <div className="flex items-start gap-3 border border-destructive/40 bg-destructive/5 px-5 py-4">
      <AlertTriangle className="h-5 w-5 flex-shrink-0 text-destructive mt-0.5" />
      <div>
        <p className="text-sm font-sans font-bold uppercase tracking-wide text-destructive">Unable to load drivetrain data</p>
        <p className="mt-1 text-sm font-body text-destructive/80">
          {error?.message ?? "The database query failed. Check the browser console for the full Supabase error."}
        </p>
      </div>
    </div>
  )
}

export function DrivetrainEmptyState({
  title,
  message,
  icon,
}: {
  title: string
  message: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-2 border border-dashed border-border bg-surface px-6 py-10 text-center">
      {icon ?? <PackageSearch className="h-6 w-6 text-muted-foreground" />}
      <p className="text-sm font-sans font-bold uppercase tracking-wide text-graphite">{title}</p>
      <p className="max-w-md text-sm font-body text-muted-foreground">{message}</p>
    </div>
  )
}

export function InlineWarning({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start gap-2.5 bg-warning/10 border border-warning/30 px-4 py-3", className)}>
      <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
      <p className="text-sm font-body text-warning-foreground">{children}</p>
    </div>
  )
}

export function InlineError({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start gap-2.5 bg-destructive/10 border border-destructive/30 px-4 py-3", className)}>
      <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
      <p className="text-sm font-body text-destructive">{children}</p>
    </div>
  )
}

export function InlineInfo({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start gap-2.5 bg-graphite/5 border border-graphite/20 px-4 py-3", className)}>
      <Info className="w-4 h-4 text-graphite flex-shrink-0 mt-0.5" />
      <p className="text-sm font-body text-graphite">{children}</p>
    </div>
  )
}
