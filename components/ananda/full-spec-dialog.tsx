"use client"

import { ExternalLink } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { TechSpecRow } from "./ui-primitives"

export type Spec = { label: string; value: string | number | null }

interface FullSpecDialogProps {
  title: string
  specs: Spec[]
  images?: string[]
  datasheetUrl?: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FullSpecDialog({ title, specs, images = [], datasheetUrl, open, onOpenChange }: FullSpecDialogProps) {
  const rows = specs.filter((sp) => sp.value != null && sp.value !== "")
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden rounded-none border-2 border-border p-0 sm:max-w-lg">
        <div className="shrink-0 border-b border-border bg-surface px-5 py-4 pr-12">
          <p className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-primary">Full Specification</p>
          <DialogTitle className="mt-1 font-sans text-lg font-black uppercase leading-tight tracking-tight text-graphite wrap-anywhere">
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only">Detailed technical specification for {title}.</DialogDescription>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {images[0] && (
            <div className="flex h-36 items-center justify-center border-b border-border bg-white p-3">
              <img src={images[0] || "/placeholder.svg"} alt={title} className="max-h-full object-contain" crossOrigin="anonymous" />
            </div>
          )}
          {rows.length > 0 ? (
            rows.map((sp) => (
              <TechSpecRow key={sp.label} label={sp.label} value={sp.value} stacked={typeof sp.value === "string" && sp.value.length > 24} />
            ))
          ) : (
            <p className="px-5 py-6 text-sm font-body text-muted-foreground">No detailed specification has been published for this product yet.</p>
          )}
        </div>
        {datasheetUrl && (
          <div className="shrink-0 border-t border-border bg-surface px-5 py-3">
            <a
              href={datasheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-sans font-bold uppercase tracking-wider text-primary hover:underline"
            >
              Open datasheet <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
