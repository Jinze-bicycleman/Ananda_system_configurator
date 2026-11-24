"use client"

import { useRef, useState, type CSSProperties } from "react"
import { useProjectsStore } from "@/lib/ananda-projects"
import { useAnandaStore } from "@/lib/ananda-store"
import { useReportData } from "@/lib/ananda-report"
import { harnessLengthLabel, type HarnessSlot } from "@/lib/m7200-harness"
import { useBikeOverview } from "@/lib/bike-overview/use-bike-overview"
import { CableEditor } from "../bike-overview/cable-editor"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

const position = (x: number, y: number, width: number): CSSProperties => ({
  position: "absolute", left: `${x / 6468 * 100}%`, top: `${y / 7288 * 100}%`,
  width: `${width / 6468 * 100}%`, transform: "translate(-50%, -50%)",
})

export function M7200HarnessMap() {
  const s = useAnandaStore()
  const projectName = useProjectsStore(state => state.projects.find(project => project.id === state.activeProjectId)?.name)
  const brandName = useProjectsStore(state => state.brandName)
  // The report owns the slot data for both this drawing and exported reports.
  const { harnessSlots, motor } = useReportData()
  const { cables } = useBikeOverview()
  const hmiCable = cables.find(c => c.key === "hmi")
  const lengthButtonRef = useRef<HTMLButtonElement>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const hmi = harnessSlots.find(slot => slot.id === "hmi")
  const length = (slot: HarnessSlot, inSlot = false) => {
    if (!slot.model) return null
    const label = harnessLengthLabel(slot)
    return slot.editable && hmiCable ? (
      <button ref={lengthButtonRef} type="button" onClick={() => setEditorOpen(true)} aria-label={`Edit ${slot.label} cable length: ${label}`}
        className="min-h-11 rounded border border-green-700 bg-white px-2 font-semibold text-green-900 underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-800">
        {label}
      </button>
    ) : <span className={inSlot ? "text-right text-slate-600" : "rounded bg-white px-2 py-1 text-slate-700"}>{label}</span>
  }

  return (
    <section aria-label="M7200 harness map" className="space-y-3">
      <h3 className="text-base font-semibold">M7200 harness map</h3>
      <p className="text-sm text-muted-foreground">Scroll horizontally to inspect the drawing. Select the HMI length to edit it. Empty slots have no length. Independent branch lengths await verified cable mappings.</p>
      <div className="overflow-x-auto border border-border" tabIndex={0} role="region" aria-label="Scrollable M7200 harness drawing">
        <div className="relative w-full min-w-[1600px]" style={{ aspectRatio: "6468 / 7288", containerType: "inline-size" }}>
          {/* Preserve the approved artwork as an external, unmodified image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/system-diagrams/m7200-harness-map.svg" alt="Approved M7200 wiring artwork. Live component labels and cable lengths are overlaid." width={6468} height={7288} className="absolute inset-0 h-full w-full" />
          <div style={{ fontSize: "0.88cqw", lineHeight: 1.25 }}>
            {([["P2 · HMI / brake / front light", 80], ["P4 · Rear light / turn signals", 1518], ["P5 · Speed sensor", 2728], ["P3 · Throttle / gear sensor / IoT", 4015], ["P1 · Battery", 5594]] as const).map(([label, y]) => (
              <h4 key={y} style={position(y === 5594 ? 5510 : 4300, y, y === 5594 ? 1780 : 3900)} className="bg-[#bdd5bc] px-2 text-center font-bold text-slate-900">{label}</h4>
            ))}
            {harnessSlots.map(slot => (
              <div key={slot.id}>
                <div style={{ ...position(slot.x, slot.y, slot.width), minHeight: "2.4cqw" }} tabIndex={0} aria-label={`${slot.label}: ${slot.model ?? "empty"}`}
                  className="flex items-center justify-between gap-2 rounded bg-white px-2 py-1 text-slate-900 outline-offset-2 focus-visible:outline-2 focus-visible:outline-green-800">
                  <span className="min-w-0 flex-1 break-words font-semibold">{slot.model ?? "empty"}</span>
                  {!slot.lengthAnchor && slot.model && slot.id !== "battery" && length(slot, true)}
                </div>
                {slot.model && slot.lengthAnchor && <div style={position(...slot.lengthAnchor, 1170)} className="text-center">{length(slot)}</div>}
                {slot.id === "battery" && slot.model && <div style={position(3398, 5593, 1170)} className="text-center">{length(slot)}</div>}
              </div>
            ))}
            {/* No store connection identifies the shared P2 or P3 trunk. */}
            <p style={position(2826, 266, 1200)} className="rounded bg-white px-2 py-1 text-center text-slate-600">P2 trunk · mapping pending</p>
            <p style={position(3050, 4454, 1200)} className="rounded bg-white px-2 py-1 text-center text-slate-600">P3 trunk · mapping pending</p>
            <dl style={{ ...position(1200, 6280, 2050), fontSize: "0.98cqw" }} className="space-y-3 rounded bg-[#bdd5bc] p-4 text-slate-900">
              <dt className="font-bold">Project specification</dt>
              {[["Project", projectName], ["Brand", brandName], ["Motor", motor?.model], ["Bike", s.bikeCategory], ["Market", s.customSellRegion || s.sellRegion], ["Voltage", s.voltagePlatform ? `${s.voltagePlatform} V` : null], ["Rated power", (s.ratedPowerW ?? motor?.rated_power_w) ? `${s.ratedPowerW ?? motor?.rated_power_w} W` : null], ["Wheel", s.wheelSize]].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[40%_1fr] gap-2"><dt className="font-semibold">{label}</dt><dd>{value || "Unspecified"}</dd></div>
              ))}
            </dl>
          </div>
        </div>
      </div>
      <Dialog open={editorOpen && !!hmi?.editable} onOpenChange={setEditorOpen}>
        <DialogContent onCloseAutoFocus={event => { event.preventDefault(); lengthButtonRef.current?.focus() }} className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader><DialogTitle>P2 Display / HMI cable length</DialogTitle><DialogDescription>Changes save to the project cable specification in metres and appear here in mm.</DialogDescription></DialogHeader>
          {hmiCable && <CableEditor key={editorOpen ? "open" : "closed"} cable={hmiCable} />}
        </DialogContent>
      </Dialog>
    </section>
  )
}
