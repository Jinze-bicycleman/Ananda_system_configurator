"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAnandaStore } from "@/lib/ananda-store"
import { bikeCategoryContent } from "@/lib/ananda-content"
import { useTyreWidthOptions, useWheelSizeOptions, useTyreSizeMatch } from "@/lib/ananda-tyre-data"

const categories = Object.keys(bikeCategoryContent)

const categoryImages: Record<string, string> = {
  City: "/images/bike-category-city.jpg",
  Trekking: "/images/bike-category-trekking.jpg",
  MTB: "/images/bike-category-mtb.jpg",
  "Cargo bike": "/images/bike-category-cargo-2wheeler.png",
  "Fat bike": "/images/bike-category-fatbike.jpg",
  "Folding bike": "/images/bike-category-folding.jpg",
  "Speed pedelec": "/images/bike-category-speed-pedelec.jpg",
  Other: "/images/bike-category-other.jpg",
}

export function Step2BikeCategory() {
  const s = useAnandaStore()
  const [lookupOpen, setLookupOpen] = useState(false)
  const [lookupWheel, setLookupWheel] = useState(s.wheelSize ?? "")
  const [lookupWidth, setLookupWidth] = useState(s.tyreWidth ?? "")
  const circumference = s.tyreCircumferenceMm
  const recommendation = useMemo(() => s.bikeCategory === "Cargo bike" || s.bikeCategory === "MTB" ? "A 48V platform is typically preferred for higher load, hill, or trail demands." : null, [s.bikeCategory])

  const { options: wheelSizeOptions } = useWheelSizeOptions()
  const { options: tyreWidthOptions } = useTyreWidthOptions(lookupWheel)
  const { match, isLoading: isMatchLoading } = useTyreSizeMatch(lookupWheel, lookupWidth)

  useEffect(() => {
    setLookupWheel(s.wheelSize ?? "")
  }, [s.wheelSize])

  const openLookup = () => {
    setLookupWheel(s.wheelSize ?? "")
    setLookupOpen((value) => !value)
  }

  const handleWheelChange = (value: string) => {
    setLookupWheel(value)
    setLookupWidth("")
  }

  const applyMatch = () => {
    if (!match) return
    s.setField("wheelSize", lookupWheel)
    s.setField("tyreWidth", lookupWidth)
    s.setField("tyreIsoSize", match.iso_size)
    s.setField("tyreCircumferenceMm", match.circumference_mm)
  }

  return <div className="space-y-5">
    <div className="mb-6"><p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-primary">02 / Bike Category</p><h1 className="mt-1 text-balance font-sans text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl">Choose the bicycle application</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Select the vehicle category, then define wheel and tyre data for accurate drivetrain estimates.</p></div>
    <div id="field-bikeCategory" className="grid gap-4 md:grid-cols-2">{categories.map((category) => <button key={category} type="button" onClick={() => s.setBikeCategory(category)} className={cn("group overflow-hidden border text-left transition-colors", s.bikeCategory === category ? "border-primary bg-primary/5" : "border-border hover:border-primary/60")}><div className="relative h-56 overflow-hidden bg-muted sm:h-64"><img src={categoryImages[category]} alt={`${category} bicycle category`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-graphite/90 to-transparent p-4 pt-16"><span className="text-lg font-bold uppercase tracking-wide text-white">{category}</span></div>{s.bikeCategory === category && <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center bg-primary text-primary-foreground"><Check className="h-5 w-5" /></span>}</div><div className="p-4"><p className="text-sm leading-6 text-muted-foreground">{bikeCategoryContent[category]}</p></div></button>)}</div>
    {recommendation && <div className="border-l-2 border-primary bg-primary/5 px-4 py-3 text-xs leading-5 text-foreground">{recommendation}</div>}
    <section id="field-wheelSize" className="border border-border bg-card p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-foreground">Wheel &amp; tyre data</p>
        <span className="text-xs text-muted-foreground">A few percent of difference is allowed</span>
      </div>
      <p className="mb-4 -mt-2 text-xs text-muted-foreground">Measured circumference overrides the default lookup value.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Wheel size
          <select value={s.wheelSize ?? ""} onChange={(e) => { s.setField("wheelSize", e.target.value || null); s.setField("tyreWidth", null); s.setField("tyreIsoSize", null) }} className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm text-foreground">
            <option value="">Choose wheel size</option>
            {wheelSizeOptions.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Tyre circumference (mm)
          <input type="number" min="1000" max="3000" value={circumference ?? ""} onChange={(e) => s.setField("tyreCircumferenceMm", e.target.value ? Number(e.target.value) : null)} placeholder="Manual value" className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm text-foreground" />
        </label>
        <button type="button" onClick={openLookup} className="inline-flex h-10 items-center justify-center gap-2 border border-primary px-4 text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/5"><Search className="h-4 w-4" /> Tyre lookup</button>
      </div>
      {lookupOpen && <div className="mt-4 border border-primary/30 bg-primary/5 p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <select value={lookupWheel} onChange={(e) => handleWheelChange(e.target.value)} className="border border-border bg-background px-3 py-2 text-sm text-foreground">
            <option value="">Choose wheel size</option>
            {wheelSizeOptions.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={lookupWidth} onChange={(e) => setLookupWidth(e.target.value)} disabled={!lookupWheel} className="border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-50">
            <option value="">Choose width</option>
            {tyreWidthOptions.map((item) => <option key={item}>{item}</option>)}
          </select>
          <button type="button" disabled={!match} onClick={applyMatch} className="bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground disabled:opacity-50">
            Apply {isMatchLoading ? "…" : match ? `${match.circumference_mm} mm` : "—"}
          </button>
        </div>
        {match && <p className="mt-3 text-xs text-muted-foreground">ISO size <span className="font-bold text-foreground">{match.iso_size}</span> · Circumference <span className="font-bold text-foreground">{match.circumference_mm} mm</span></p>}
      </div>}
    </section>
  </div>
}
