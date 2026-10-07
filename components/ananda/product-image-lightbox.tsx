"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface ProductImageLightboxProps {
  title: string
  images: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Large-image pop-up with a corner close button. Takes a list so a product can
// gain more pictures later: with two or more images, previous/next buttons,
// arrow keys and a thumbnail strip appear automatically.
export function ProductImageLightbox({ title, images, open, onOpenChange }: ProductImageLightboxProps) {
  const [index, setIndex] = useState(0)
  const count = images.length

  useEffect(() => {
    if (open) setIndex(0)
  }, [open])

  const go = (delta: number) => setIndex((current) => (current + delta + count) % count)

  if (count === 0) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="gap-0 overflow-hidden rounded-none border-2 border-border p-0 sm:max-w-3xl"
        onKeyDown={(e) => {
          if (count < 2) return
          if (e.key === "ArrowLeft") go(-1)
          if (e.key === "ArrowRight") go(1)
        }}
      >
        <div className="flex items-center justify-between gap-4 border-b border-border bg-surface px-5 py-3 pr-12">
          <DialogTitle className="min-w-0 truncate font-sans text-sm font-bold uppercase tracking-wider text-graphite">{title}</DialogTitle>
          {count > 1 && (
            <span className="shrink-0 font-mono text-xs text-muted-foreground" aria-live="polite">
              {index + 1} / {count}
            </span>
          )}
          <DialogDescription className="sr-only">Enlarged product image{count > 1 ? "s. Use the arrows to browse." : "."}</DialogDescription>
        </div>

        <div className="relative flex h-[60vh] max-h-[560px] items-center justify-center bg-white p-6">
          <img
            src={images[index] || "/placeholder.svg"}
            alt={`${title}${count > 1 ? ` — image ${index + 1} of ${count}` : ""}`}
            className="max-h-full max-w-full object-contain"
            crossOrigin="anonymous"
          />
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-border bg-background text-graphite transition-colors hover:border-primary hover:text-primary"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next image"
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-border bg-background text-graphite transition-colors hover:border-primary hover:text-primary"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {count > 1 && (
          <div className="flex items-center justify-center gap-2 overflow-x-auto border-t border-border bg-surface px-4 py-3">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "flex h-14 w-14 shrink-0 items-center justify-center border-2 bg-white p-1 transition-colors",
                  i === index ? "border-primary" : "border-border hover:border-primary/40",
                )}
              >
                <img src={src || "/placeholder.svg"} alt="" className="max-h-full max-w-full object-contain" crossOrigin="anonymous" />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
