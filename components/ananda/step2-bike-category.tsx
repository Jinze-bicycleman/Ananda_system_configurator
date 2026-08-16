"use client"

import { useMemo, useState } from "react"
import { Check, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAnandaStore } from "@/lib/ananda-store"
import { bikeCategoryContent } from "@/lib/ananda-content"
import { lookupCircumference, tyreWidthOptions, wheelSizeOptions } from "@/lib/ananda-tyre-data"

const categories = Object.keys(bikeCategoryContent)

const categoryImages: Record<string, string> = {
  City: "/images/bike-category-city.jpg",
  Trekking: "/images/bike-category-trekking.jpg",
  MTB: "/images/bike-category-mtb.jpg",
  "Cargo 2-wheeler": "/images/bike-category-cargo-2wheeler.png",
  "Cargo tricycle": "/images/bike-category-cargo-tricycle.png",
  "Fat bike": "/images/bike-category-fatbike.jpg",
  "Speed pedelec": "/images/bike-category-speed-pedelec.jpg",
  Other: "/images/bike-category-other.jpg",
}

export function Step2BikeCategory() {
  const s = useAnandaStore()
  const [lookupOpen, setLookupOpen] = useState(false)
  const [lookupWheel, setLookupWheel] = useState(s.wheelSize ?? "700c")
  const [lookupWidth, setLookupWidth] = useState(s.tyreWidth ?? '1.75"')
  const circumference = s.tyreCircumferenceMm
  const recommendation = useMemo(() => s.bikeCategory === "Cargo" || s.bikeCategory === "MTB" ? "A 48V platform is typically preferred for higher load, hill, or trail demands." : null, [s.bikeCategory])

  return <div className="space-y-5">
    <div className="mb-6"><p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-primary">02 / Bike Category</p><h1 className="mt-1 text-balance font-sans text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl">Choose the bicycle application</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Select the vehicle category, then define wheel and tyre data for accurate drivetrain estimates.</p></div>
    <div className="grid gap-4 md:grid-cols-2">{categories.map((category) => <button key={category} type="button" onClick={() => s.setBikeCategory(category)} className={cn("group overflow-hidden border text-left transition-colors", s.bikeCategory === category ? "border-primary bg-primary/5" : "border-border hover:border-primary/60")}><div className="relative h-56 overflow-hidden bg-muted sm:h-64"><img src={categoryImages[category]} alt={`${category} bicycle category`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-graphite/90 to-transparent p-4 pt-16"><span className="text-lg font-bold uppercase tracking-wide text-white">{category}</span></div>{s.bikeCategory === category && <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center bg-primary text-primary-foreground"><Check className="h-5 w-5" /></span>}</div><div className="p-4"><p className="text-sm leading-6 text-muted-foreground">{bikeCategoryContent[category]}</p></div></button>)}</div>
    {recommendation && <div className="border-l-2 border-primary bg-primary/5 px-4 py-3 text-xs leading-5 text-foreground">{recommendation}</div>}
    <section className="border border-border bg-card p-4 sm:p-5"><div className="mb-4"><p className="text-sm font-bold uppercase tracking-[0.12em] text-foreground">Wheel &amp; tyre data</p><p className="mt-1 text-xs text-muted-foreground">Measured circumference overrides the default lookup value.</p></div><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Wheel size<select value={s.wheelSize ?? ""} onChange={(e) => s.setField("wheelSize", e.target.value || null)} className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm text-foreground"><option value="">Choose wheel size</option>{wheelSizeOptions.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tyre width<select value={s.tyreWidth ?? ""} onChange={(e) => s.setField("tyreWidth", e.target.value || null)} className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm text-foreground"><option value="">Choose width</option>{tyreWidthOptions.map((item) => <option key={item}>{item}</option>)}</select></label></div><div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"><label className="flex-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Tyre circumference (mm)<input type="number" min="1000" max="3000" value={circumference ?? ""} onChange={(e) => s.setField("tyreCircumferenceMm", e.target.value ? Number(e.target.value) : null)} placeholder="Manual value" className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm text-foreground" /></label><button type="button" onClick={() => setLookupOpen((value) => !value)} className="inline-flex h-10 items-center justify-center gap-2 border border-primary px-4 text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/5"><Search className="h-4 w-4" /> Tyre lookup</button></div>{lookupOpen && <div className="mt-4 border border-primary/30 bg-primary/5 p-4"><div className="grid gap-3 sm:grid-cols-3"><select value={lookupWheel} onChange={(e) => setLookupWheel(e.target.value)} className="border border-border bg-background px-3 py-2 text-sm text-foreground">{wheelSizeOptions.map((item) => <option key={item}>{item}</option>)}</select><select value={lookupWidth} onChange={(e) => setLookupWidth(e.target.value)} className="border border-border bg-background px-3 py-2 text-sm text-foreground">{tyreWidthOptions.map((item) => <option key={item}>{item}</option>)}</select><button type="button" onClick={() => { const value = lookupCircumference(lookupWheel, lookupWidth); if (value) { s.setField("wheelSize", lookupWheel); s.setField("tyreWidth", lookupWidth); s.setField("tyreCircumferenceMm", value) } }} className="bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground">Apply {lookupCircumference(lookupWheel, lookupWidth) ?? "—"} mm</button></div></div>}</section>
  </div>
}
