"use client"

import { useProjectsStore } from "@/lib/ananda-projects"

export function BrandNameField() {
  const brandName = useProjectsStore((s) => s.brandName)
  const setBrandName = useProjectsStore((s) => s.setBrandName)

  return (
    <label className="flex items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground">Brand</span>
      <input
        type="text"
        value={brandName}
        onChange={(event) => setBrandName(event.target.value)}
        placeholder="Your brand name"
        maxLength={60}
        className="w-44 rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold text-graphite outline-none transition-colors placeholder:font-normal placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-60"
      />
    </label>
  )
}
