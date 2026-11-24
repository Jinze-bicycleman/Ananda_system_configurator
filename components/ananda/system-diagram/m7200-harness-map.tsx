"use client"

import type { CSSProperties } from "react"
import { useProjectsStore } from "@/lib/ananda-projects"
import { useAnandaStore } from "@/lib/ananda-store"
import { useReportData } from "@/lib/ananda-report"
import type { HarnessCableSection } from "@/lib/m7200-harness"
import { HarnessSectionLengthEditor } from "./harness-section-length-editor"
import { useBikeOverview } from "@/lib/bike-overview/use-bike-overview"
import { CableEditor } from "../bike-overview/cable-editor"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const position = (x: number, y: number, width: number): CSSProperties => ({
  position: "absolute", left: `${x / 6468 * 100}%`, top: `${y / 7288 * 100}%`,
  width: `${width / 6468 * 100}%`, transform: "translate(-50%, -50%)",
})

export function Series7000HarnessMap() {
  const s = useAnandaStore()
  const projectName = useProjectsStore(state => state.projects.find(project => project.id === state.activeProjectId)?.name)
  const brandName = useProjectsStore(state => state.brandName)
  // The report owns the slot data for both this drawing and exported reports.
  const { harnessSlots, harnessSections, motor } = useReportData()
  const diagramTitle = `${motor?.model ?? "7000 series"} harness map`
  const { cables } = useBikeOverview()
  const hmiCable = cables.find(c => c.key === "hmi")
  const length = (section: HarnessCableSection) => {
    const label = section.lengthMm == null ? "Set length" : `${section.lengthMm} mm`
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button type="button" aria-label={`Edit ${section.label} length: ${label}`}
            className="min-h-11 rounded border border-green-700 bg-white px-2 font-semibold text-green-900 underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-800">
            {label}
          </button>
        </PopoverTrigger>
        <PopoverContent align="center" collisionPadding={16} className="max-h-[80vh] w-[min(34rem,calc(100vw-2rem))] overflow-y-auto p-0">
          {section.id === "hmi" && hmiCable ? <CableEditor cable={hmiCable} /> : <HarnessSectionLengthEditor section={section} />}
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <section aria-label={diagramTitle} className="space-y-3">
      <h3 className="text-base font-semibold">{diagramTitle}</h3>
      <p className="text-sm text-muted-foreground">Select a length above any of the five cable sections to edit it. Cable specifications are saved separately from component selections. Scroll horizontally to inspect the drawing.</p>
      <div className="overflow-x-auto border border-border" tabIndex={0} role="region" aria-label={`Scrollable ${motor?.model ?? "7000 series"} harness drawing`}>
        <div className="relative w-full min-w-[1600px]" style={{ aspectRatio: "6468 / 7288", containerType: "inline-size" }}>
          {/* Preserve the approved artwork as an external, unmodified image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/system-diagrams/m7200-harness-map.svg" alt={`7000-series wiring artwork for ${motor?.model ?? "the selected motor"}. Live component labels and cable lengths are overlaid. These models share the approved M7200 artwork.`} width={6468} height={7288} className="absolute inset-0 h-full w-full" />
          <div style={{ fontSize: "0.88cqw", lineHeight: 1.25 }}>
            {([["P2 · HMI / brake / front light", 80], ["P4 · Rear light / turn signals", 1518], ["P5 · Speed sensor", 2728], ["P3 · Throttle / gear sensor / IoT", 4015], ["P1 · Battery", 5594]] as const).map(([label, y]) => (
              <h4 key={y} style={position(y === 5594 ? 5510 : 4300, y, y === 5594 ? 1780 : 3900)} className="bg-[#bdd5bc] px-2 text-center font-bold text-slate-900">{label}</h4>
            ))}
            {harnessSlots.map(slot => (
              <div key={slot.id}>
                <div style={{ ...position(slot.x, slot.y, slot.width), minHeight: "2.4cqw" }} tabIndex={0} data-harness-component-for={slot.id} aria-label={`${slot.label}: ${slot.model ?? "empty"}`}
                  className="flex items-center justify-between gap-2 rounded bg-white px-2 py-1 text-slate-900 outline-offset-2 focus-visible:outline-2 focus-visible:outline-green-800">
                  <span className="min-w-0 flex-1 break-words font-semibold">{slot.model ?? "empty"}</span>
                </div>
              </div>
            ))}
            {harnessSections.map(section => (
              <div key={section.id} data-harness-length-for={section.id} style={position(section.x, section.y, 630)} className="text-center">
                <span className="mb-1 block bg-white text-slate-600">{section.label.slice(0, 2)} cable</span>
                {length(section)}
              </div>
            ))}
            <p style={position(4060, 6020, 630)} className="rounded bg-white px-2 py-1 text-center text-slate-600">Docking interface · no cable</p>
            <dl style={{ ...position(1200, 6280, 2050), fontSize: "0.98cqw" }} className="space-y-3 rounded bg-[#bdd5bc] p-4 text-slate-900">
              <dt className="font-bold">Project specification</dt>
              {[["Project", projectName], ["Brand", brandName], ["Motor", motor?.model], ["Bike", s.bikeCategory], ["Market", s.customSellRegion || s.sellRegion], ["Voltage", s.voltagePlatform ? `${s.voltagePlatform} V` : null], ["Rated power", (s.ratedPowerW ?? motor?.rated_power_w) ? `${s.ratedPowerW ?? motor?.rated_power_w} W` : null], ["Wheel", s.wheelSize]].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[40%_1fr] gap-2"><dt className="font-semibold">{label}</dt><dd>{value || "Unspecified"}</dd></div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
