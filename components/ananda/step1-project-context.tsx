"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAnandaStore } from "@/lib/ananda-store"
import { regulationsForMarket, sellMarkets } from "@/lib/ananda-regulations"

const LIGHT_GREEN = "bg-[#3FA85E]"

export function Step1ProjectContext() {
  const s = useAnandaStore()
  const [open, setOpen] = useState<number | null>(null)
  const regulations = regulationsForMarket(s.sellRegion)
  const selectedRegulationOption = regulations.find((option) => option.label === s.regulation)
  const showCustomFields = Boolean(selectedRegulationOption && selectedRegulationOption.speedLimitKmh == null && selectedRegulationOption.ratedPowerW == null)

  const toggle = (index: number) => setOpen((prev) => (prev === index ? null : index))

  return <div className="space-y-4">
    <div className="mb-6"><p className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-primary">01 / Sell Region &amp; Regulation</p><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Define the market and compliance target for the system configuration.</p></div>
    <section className={cn("border border-border bg-card", open === 0 && "border-primary/50")}>
      <button type="button" onClick={() => toggle(0)} className={cn("flex w-full items-center gap-4 px-4 py-2.5 text-left", LIGHT_GREEN)}><span className="font-mono text-xs font-bold tracking-widest text-foreground">01</span><span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-0.5"><span className="text-xl font-bold uppercase tracking-[0.12em] text-foreground">Sell region / market</span><span className="text-base text-[#ebede9]">{s.sellRegion ?? "Select the market where the system will be sold."}</span></span>{s.sellRegion && <Check className="h-4 w-4 shrink-0 text-foreground" />}<ChevronDown className={cn("h-4 w-4 shrink-0 text-foreground transition-transform", open === 0 && "rotate-180")} /></button>
      {open === 0 && <div className="border-t border-border p-4"><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{sellMarkets.map((market) => <button key={market} type="button" onClick={() => s.setMarket(market)} className={cn("min-h-12 border px-3 py-2 text-left text-sm font-semibold transition-colors", s.sellRegion === market ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/60 hover:bg-muted")}>{market}</button>)}</div></div>}
    </section>
    <section className={cn("border border-border bg-card", open === 1 && "border-primary/50")}>
      <button type="button" disabled={!s.sellRegion} onClick={() => toggle(1)} className={cn("flex w-full items-center gap-4 px-4 py-2.5 text-left text-black disabled:cursor-not-allowed disabled:opacity-50", LIGHT_GREEN)}><span className="font-mono text-xs font-bold tracking-widest text-black">02</span><span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-0.5"><span className="text-xl font-bold uppercase tracking-[0.12em] text-black">Regulation</span><span className="text-base text-white">{s.regulation ? `${s.regulation} · ${s.speedLimitKmh ?? "Custom"} km/h` : "Choose a regulation for the selected market."}</span></span>{s.regulation && <Check className="h-4 w-4 shrink-0 text-black" />}<ChevronDown className={cn("h-4 w-4 shrink-0 text-black transition-transform", open === 1 && "rotate-180")} /></button>
      {open === 1 && <div className="border-t border-border p-4"><div className="grid gap-3 sm:grid-cols-2">{regulations.map((option) => <button key={option.id} type="button" onClick={() => { s.setRegulation(option.label); s.setField("speedLimitKmh", option.speedLimitKmh); s.setField("ratedPowerW", option.ratedPowerW) }} className={cn("border p-4 text-left transition-colors", s.regulation === option.label ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}><span className="block text-base font-bold text-foreground">{option.label}</span><span className="mt-1 block text-sm leading-5 text-muted-foreground">{option.note}</span><span className="mt-3 block font-mono text-[11px] text-primary">{option.speedLimitKmh ? `${option.speedLimitKmh} km/h` : "Manual speed"} · {option.ratedPowerW ? `${option.ratedPowerW} W` : "Manual power"}</span></button>)}</div>{showCustomFields && <div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Speed limit (km/h)<input type="number" value={s.speedLimitKmh ?? ""} onChange={(e) => s.setField("speedLimitKmh", e.target.value ? Number(e.target.value) : null)} className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm text-foreground" /></label><label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rated power (W)<input type="number" value={s.ratedPowerW ?? ""} onChange={(e) => s.setField("ratedPowerW", e.target.value ? Number(e.target.value) : null)} className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm text-foreground" /></label></div>}</div>}
    </section>
  </div>
}
