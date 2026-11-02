"use client"

import { useProjectsStore } from "@/lib/ananda-projects"

export function BrandNameField() {
  const brandName = useProjectsStore((s) => s.brandName)
  const setBrandName = useProjectsStore((s) => s.setBrandName)

  return (
    <label className="flex items-center gap-3">
      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Brand</span>
      <input
        type="text"
        value={brandName}
        onChange={(event) => setBrandName(event.target.value)}
        placeholder="Your brand name"
        maxLength={60}
        className="w-44 border-0 border-b-2 border-border bg-transparent px-1 py-1.5 text-right font-sans text-base font-bold text-graphite outline-none transition-colors placeholder:font-normal placeholder:text-muted-foreground/60 focus:border-primary sm:w-56"
      />
    </label>
  )
}
