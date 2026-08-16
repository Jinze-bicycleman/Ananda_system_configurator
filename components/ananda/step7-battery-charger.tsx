"use client"

import { useAnandaStore } from "@/lib/ananda-store"
import { aBatteries, aChargers, aChargingPorts } from "@/lib/ananda-data"
import { StepHeader, SectionLabel, BigSpec, TechSpecRow } from "./ui-primitives"
import { cn } from "@/lib/utils"
import { CheckCircle2, Image as ImageIcon, BatteryFull } from "lucide-react"

export function Step7BatteryCharger() {
  const s = useAnandaStore()

  const filteredBatteries = aBatteries.filter(b =>
    s.voltagePlatform ? b.voltage === s.voltagePlatform : true
  )
  const filteredChargers = aChargers.filter(c =>
    s.voltagePlatform ? c.voltage === s.voltagePlatform : true
  )

  const selectedBattery = aBatteries.find(b => b.id === s.batteryId)
  const selectedCharger = aChargers.find(c => c.id === s.chargerId)

  return (
    <div>
      <StepHeader
        step={8}
        title="Battery, Charger & Charging Port"
        subtitle={`Showing ${s.voltagePlatform}V compatible products. Select 'No Battery' if the battery will be supplied by the customer.`}
      />

      {/* ─── BATTERIES ─── */}
      <section className="mb-10">
        <SectionLabel>Battery Selection</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
          {/* No Battery option */}
          <div
            onClick={() => s.setField("batteryId", "none")}
            className={cn(
              "relative cursor-pointer border-2 overflow-hidden flex flex-col items-center justify-center py-6 px-3 transition-all",
              s.batteryId === "none" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
            )}
          >
            {s.batteryId === "none" && (
              <div className="absolute top-2 right-2"><CheckCircle2 className="w-4 h-4 text-primary" /></div>
            )}
            <BatteryFull className="w-8 h-8 text-border mb-2" />
            <span className="text-xs font-sans font-bold uppercase tracking-wider text-center text-muted-foreground">No Battery</span>
            <span className="text-[10px] font-body text-muted-foreground text-center mt-1">Customer supplied</span>
          </div>

          {filteredBatteries.map(b => (
            <div
              key={b.id}
              onClick={() => s.setField("batteryId", b.id)}
              className={cn(
                "relative cursor-pointer border-2 overflow-hidden transition-all flex flex-col",
                s.batteryId === b.id ? "border-primary shadow-md shadow-primary/10" : "border-border hover:border-primary/40"
              )}
            >
              <div className={cn("h-1 w-full", s.batteryId === b.id ? "bg-primary" : "bg-border")} />
              {s.batteryId === b.id && (
                <div className="absolute top-2 right-2 z-10">
                  <div className="bg-primary rounded-full p-0.5"><CheckCircle2 className="w-3 h-3 text-white" /></div>
                </div>
              )}

              {/* Image placeholder */}
              <div className={cn(
                "relative flex items-center justify-center overflow-hidden",
                s.batteryId === b.id ? "bg-primary/5" : "bg-surface"
              )} style={{ minHeight: 100 }}>
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polygon points="60,0 100,0 100,100 40,100"
                    fill={s.batteryId === b.id ? "#008F36" : "#f3f4f6"} opacity={s.batteryId === b.id ? "0.12" : "0.6"} />
                </svg>
                <div className="relative z-10 flex flex-col items-center gap-1 py-4">
                  <ImageIcon className={cn("w-7 h-7", s.batteryId === b.id ? "text-primary/40" : "text-border")} />
                </div>
              </div>

              <div className="p-3 flex-1 flex flex-col">
                {/* Big Wh number */}
                <div className="flex items-end gap-0.5 mb-1">
                  <span className={cn("text-3xl font-sans font-black leading-none", s.batteryId === b.id ? "text-primary" : "text-graphite")}>
                    {b.capacityWh}
                  </span>
                  <span className="text-sm font-sans font-bold text-primary mb-0.5">Wh</span>
                </div>
                <span className="text-[11px] font-sans font-bold uppercase text-muted-foreground">{b.voltage}V Platform</span>
                <div className="mt-2 space-y-0.5 flex-1">
                  <TechSpecRow label="Weight" value={b.weightKg ? `${b.weightKg} kg` : null} />
                  {b.dimensions && <TechSpecRow label="Package" value={b.dimensions} />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Range estimate bar */}
        {selectedBattery && s.motorId && (
          <div className="border border-border bg-surface px-5 py-4">
            <p className="text-[11px] font-sans font-bold uppercase tracking-wider text-primary mb-2">Estimated Range Reference</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs font-sans text-muted-foreground uppercase mb-1">City / Light</p>
                <span className="text-2xl font-sans font-black text-graphite">{Math.round(selectedBattery.capacityWh / 12)}</span>
                <span className="text-xs font-sans font-bold text-primary ml-1">km</span>
              </div>
              <div>
                <p className="text-xs font-sans text-muted-foreground uppercase mb-1">Mixed Use</p>
                <span className="text-2xl font-sans font-black text-graphite">{Math.round(selectedBattery.capacityWh / 18)}</span>
                <span className="text-xs font-sans font-bold text-primary ml-1">km</span>
              </div>
              <div>
                <p className="text-xs font-sans text-muted-foreground uppercase mb-1">High Load</p>
                <span className="text-2xl font-sans font-black text-graphite">{Math.round(selectedBattery.capacityWh / 30)}</span>
                <span className="text-xs font-sans font-bold text-primary ml-1">km</span>
              </div>
            </div>
            <p className="text-[10px] font-body text-muted-foreground mt-2">Range is indicative only. Actual range depends on rider weight, terrain, ambient temperature and riding style.</p>
          </div>
        )}
      </section>

      {/* ─── CHARGER ─── */}
      <section className="mb-10">
        <SectionLabel>Charger</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {filteredChargers.map(c => (
            <div
              key={c.id}
              onClick={() => s.setField("chargerId", c.id)}
              className={cn(
                "relative cursor-pointer border-2 overflow-hidden transition-all",
                s.chargerId === c.id ? "border-primary shadow-md shadow-primary/10" : "border-border hover:border-primary/40"
              )}
            >
              <div className={cn("h-1 w-full", s.chargerId === c.id ? "bg-primary" : "bg-border")} />
              {s.chargerId === c.id && (
                <div className="absolute top-2 right-2">
                  <div className="bg-primary rounded-full p-0.5"><CheckCircle2 className="w-3 h-3 text-white" /></div>
                </div>
              )}
              <div className="flex items-center justify-center h-20 bg-surface">
                <ImageIcon className={cn("w-8 h-8", s.chargerId === c.id ? "text-primary/40" : "text-border")} />
              </div>
              <div className="p-3">
                <p className={cn("text-sm font-sans font-bold uppercase mb-1", s.chargerId === c.id ? "text-primary" : "text-graphite")}>{c.name}</p>
                <TechSpecRow label="Voltage" value={`${c.voltage}V`} />
                <TechSpecRow label="Current" value={`${c.currentA}A`} />
                <TechSpecRow label="Weight" value={c.weightKg ? `${c.weightKg} kg` : null} />
                {selectedBattery && (
                  <div className="mt-2 text-[10px] font-body text-muted-foreground">
                    Est. charge time: ~{Math.ceil(selectedBattery.capacityWh / (c.voltage * c.currentA * 0.9))}h
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CHARGING PORT ─── */}
      <section className="mb-6">
        <SectionLabel>Charging Port</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {aChargingPorts.map(p => (
            <div
              key={p.id}
              onClick={() => s.setField("chargingPortId", p.id)}
              className={cn(
                "relative cursor-pointer border-2 overflow-hidden transition-all",
                s.chargingPortId === p.id ? "border-primary shadow-md shadow-primary/10" : "border-border hover:border-primary/40"
              )}
            >
              <div className={cn("h-1 w-full", s.chargingPortId === p.id ? "bg-primary" : "bg-border")} />
              {s.chargingPortId === p.id && (
                <div className="absolute top-2 right-2">
                  <div className="bg-primary rounded-full p-0.5"><CheckCircle2 className="w-3 h-3 text-white" /></div>
                </div>
              )}
              <div className="flex items-center justify-center h-16 bg-surface">
                <ImageIcon className={cn("w-6 h-6", s.chargingPortId === p.id ? "text-primary/40" : "text-border")} />
              </div>
              <div className="p-3">
                <p className={cn("text-sm font-sans font-bold uppercase mb-1", s.chargingPortId === p.id ? "text-primary" : "text-graphite")}>{p.name}</p>
                <TechSpecRow label="Connector" value={p.connectorType} />
                <TechSpecRow label="Weight" value={p.weightKg ? `${p.weightKg} kg` : null} />
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
