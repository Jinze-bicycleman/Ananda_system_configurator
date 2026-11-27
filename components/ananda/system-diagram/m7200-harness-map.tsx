"use client"

import { useEffect, useState, type CSSProperties } from "react"
import { Maximize2, MoveHorizontal, Scan, ZoomIn, ZoomOut } from "lucide-react"
import { useProjectsStore } from "@/lib/ananda-projects"
import { useAnandaStore } from "@/lib/ananda-store"
import { useReportData } from "@/lib/ananda-report"
import { useBikeComponents, chargerVoltageLabel, chargerCurrentLabel, batteryVoltageLabel, batteryDischargeLabel, type BikeComponentRow } from "@/lib/ananda-packages"
import type { HarnessCableSection } from "@/lib/m7200-harness"
import { HarnessSectionLengthEditor } from "./harness-section-length-editor"
import { useBikeOverview } from "@/lib/bike-overview/use-bike-overview"
import { CableEditor } from "../bike-overview/cable-editor"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const position = (x: number, y: number, width: number): CSSProperties => ({
  position: "absolute", left: `${x / 6468 * 100}%`, top: `${y / 7288 * 100}%`,
  width: `${width / 6468 * 100}%`, transform: "translate(-50%, -50%)",
})

type ReportParts = ReturnType<typeof useReportData>

const joinDetails = (parts: (string | null | undefined | false)[]) => parts.filter(Boolean).join(" · ")

/** Chosen components with a one-line spec summary, taken from the same scope-of-supply list the report uses. */
type SummaryInput = Pick<ReportParts, "motor" | "display" | "battery" | "charger" | "chargingPort" | "controller" | "speedSensorModel" | "scopeOfSupplyItems" | "isMid" | "accessories"> & {
  hmiProtocolPreference: "can" | "uart"
  voltagePlatform: number | null
  lightSpecs: Record<string, { voltageV: number | null; currentA: number | null; powerW: number | null }>
  bikeComponentSelections: Record<string, string | null>
  bikeComponents: BikeComponentRow[]
}

/** The protocol the user picked, when the display supports it; otherwise whatever the catalog lists. */
function displayProtocol(listed: string | null | undefined, preference: "can" | "uart") {
  if (!listed) return null
  const supported = listed.toLowerCase().split(/[^a-z]+/).filter(Boolean)
  return supported.includes(preference) ? preference.toUpperCase() : listed
}

const lightDetail = (spec?: { voltageV: number | null; currentA: number | null; powerW: number | null }) => {
  const filled = joinDetails([spec?.voltageV != null && `${spec.voltageV} V`, spec?.currentA != null && `${spec.currentA} A`, spec?.powerW != null && `${spec.powerW} W`])
  return filled || "Specs not entered"
}

/** Chosen components with a one-line spec summary, taken from the same scope-of-supply list the report uses. */
function componentSummary(r: SummaryInput) {
  const details: Record<string, string> = {
    Motor: joinDetails([r.motor?.torque_nm != null && `${r.motor.torque_nm} Nm`, r.motor?.rated_power_w != null && `${r.motor.rated_power_w} W`, r.motor?.weight_kg != null && `${r.motor.weight_kg} kg`, r.motor?.communication_protocol]),
    Controller: joinDetails([r.controller?.rated_current_a != null && `${r.controller.rated_current_a} A`, r.controller?.communication_protocol]),
    "Display (HMI)": joinDetails([r.display?.connection_type, r.display?.bluetooth && "Bluetooth", displayProtocol(r.display?.communication_protocol, r.hmiProtocolPreference)]),
    Battery: joinDetails([r.battery && batteryVoltageLabel(r.battery), r.battery && batteryDischargeLabel(r.battery, r.voltagePlatform), r.battery?.capacity_wh != null && `${r.battery.capacity_wh} Wh`, r.battery?.weight_kg != null && `${r.battery.weight_kg} kg`]),
    Charger: joinDetails(r.charger ? [chargerVoltageLabel(r.charger), chargerCurrentLabel(r.charger)] : []),
  }
  const lights = new Map(r.accessories.filter(a => a.category === "lights").map(a => [a.name, a.id]))
  return r.scopeOfSupplyItems
    .filter(item => !item.label.startsWith("Cable"))
    .map(item => {
      if (item.thirdParty) return { label: item.label, value: item.value, detail: "" }
      const lightId = lights.get(item.value)
      if (lightId) return { label: item.value, value: "", detail: lightDetail(r.lightSpecs[lightId]) }
      const bikePartId = r.bikeComponentSelections[item.label.toLowerCase()]
      const bikePart = bikePartId ? r.bikeComponents.find(c => c.id === bikePartId) : null
      if (bikePart) return { label: item.label, value: item.value, detail: joinDetails([bikePart.teeth != null && `${bikePart.teeth}T`, bikePart.weight_kg != null && `${bikePart.weight_kg} kg`]) }
      return { label: item.label, value: item.value, detail: details[item.label] ?? "" }
    })
}

/** Drawing + live overlays. `fitWidthPx` renders the sheet at that pixel width (full size view); omit it for the inline scrollable version. */
function HarnessDrawing({ fitWidthPx }: { fitWidthPx?: number }) {
  const fit = fitWidthPx !== undefined
  const s = useAnandaStore()
  const projectName = useProjectsStore(state => state.projects.find(project => project.id === state.activeProjectId)?.name)
  const brandName = useProjectsStore(state => state.brandName)
  // The report owns the slot data for both this drawing and exported reports.
  const { harnessSlots, harnessSections, motor, display, battery, charger, chargingPort, controller, speedSensorModel, scopeOfSupplyItems, isMid, accessories } = useReportData()
  const { components: bikeComponents } = useBikeComponents()
  const selectedComponents = componentSummary({
    motor, display, battery, charger, chargingPort, controller, speedSensorModel, scopeOfSupplyItems, isMid, accessories, bikeComponents,
    hmiProtocolPreference: s.hmiProtocolPreference, voltagePlatform: s.voltagePlatform, lightSpecs: s.lightSpecs, bikeComponentSelections: s.bikeComponentSelections,
  })
  const { cables } = useBikeOverview()
  const hmiCable = cables.find(c => c.key === "hmi")
  const length = (section: HarnessCableSection) => {
    const label = section.lengthMm == null ? "Set length" : `${section.lengthMm} mm`
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button type="button" aria-label={`Edit ${section.label} length: ${label}`}
            className="inline-flex min-h-[2cqw] items-center justify-center whitespace-nowrap rounded-[0.35cqw] border-[0.1cqw] border-green-700 bg-white px-[0.6cqw] font-semibold text-green-900 underline underline-offset-[0.25cqw] focus-visible:outline-[0.15cqw] focus-visible:outline-offset-[0.15cqw] focus-visible:outline-green-800">
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
    <div className={fit ? "mx-auto w-fit" : "overflow-x-auto border border-border"} tabIndex={fit ? undefined : 0} role="region" aria-label={`${fit ? "Full size" : "Scrollable"} ${motor?.model ?? "7000 series"} harness drawing`}>
      <div className={fit ? "relative bg-white" : "relative w-full min-w-[1600px]"}
        style={{ aspectRatio: "6468 / 7288", containerType: "inline-size", ...(fit ? { width: `${fitWidthPx}px` } : {}) }}>
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
                <span className="mb-[0.2cqw] block bg-white text-slate-600">{section.label.slice(0, 2)} cable</span>
                {length(section)}
              </div>
            ))}
            <p style={position(4060, 6020, 630)} className="rounded bg-white px-2 py-1 text-center text-slate-600">Docking interface · no cable</p>
            {/* Anchored to the top-left of the artwork's second white panel (x 100-1947, y 2656-7188) so it scales with the sheet. */}
            <div style={{ position: "absolute", left: `${150 / 6468 * 100}%`, top: `${2716 / 7288 * 100}%`, width: `${1650 / 6468 * 100}%`, height: `${4400 / 7288 * 100}%`, fontSize: "0.98cqw", lineHeight: 1.25, padding: "1cqw", display: "flex", flexDirection: "column", gap: "1.2cqw", overflow: "hidden" }} className="rounded bg-white text-slate-900">
              <dl className="flex shrink-0 flex-col" style={{ gap: "0.8cqw" }}>
                <dt className="font-bold">Project specification</dt>
                {[["Project", projectName], ["Brand", brandName], ["Motor", motor?.model], ["Bike", s.bikeCategory], ["Market", s.customSellRegion || s.sellRegion], ["Voltage", s.voltagePlatform ? `${s.voltagePlatform} V` : null], ["Rated power", (s.ratedPowerW ?? motor?.rated_power_w) ? `${s.ratedPowerW ?? motor?.rated_power_w} W` : null], ["Wheel", s.wheelSize]].map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[40%_minmax(0,1fr)]" style={{ columnGap: "0.6cqw" }}><dt className="font-semibold">{label}</dt><dd className="break-words">{value || "Unspecified"}</dd></div>
                ))}
              </dl>
              <div className="min-h-0 flex-1 overflow-hidden border-t border-slate-300" style={{ paddingTop: "1cqw" }}>
                <p className="font-bold" style={{ marginBottom: "0.8cqw" }}>Selected components</p>
                <ul className="flex flex-col" style={{ gap: "0.8cqw" }}>
                  {selectedComponents.map(item => (
                    <li key={`${item.label}-${item.value}`} className="min-w-0">
                      <div className="grid grid-cols-[40%_minmax(0,1fr)]" style={{ columnGap: "0.6cqw" }}>
                        <span className="break-words font-semibold">{item.label}</span>
                        <span className="break-words">{item.value}</span>
                      </div>
                      {item.detail && <p className="break-words text-slate-600" style={{ marginTop: "0.2cqw" }}>{item.detail}</p>}
                    </li>
                  ))}
                  {selectedComponents.length === 0 && <li className="text-slate-600">No components selected yet.</li>}
                </ul>
              </div>
            </div>
          </div>
      </div>
    </div>
  )
}

const MIN_SCALE = 0.25
const MAX_SCALE = 3
const ZOOM_STEP = 1.25
const VIEW_PADDING = 32
const SHEET_RATIO = 6468 / 7288

/** Zoomable full size view. Scale 1 means the sheet spans the full viewer width; `null` fits the whole sheet on screen. */
function FullSizeViewer() {
  const [viewport, setViewport] = useState<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [scale, setScale] = useState<number | null>(null)

  useEffect(() => {
    if (!viewport) return
    const measure = () => setSize({ width: viewport.clientWidth, height: viewport.clientHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [viewport])

  const fitWidth = Math.max(size.width - VIEW_PADDING, 0)
  const fitPage = Math.min(fitWidth, Math.max(size.height - VIEW_PADDING, 0) * SHEET_RATIO)
  const effectiveScale = scale ?? (fitWidth > 0 ? fitPage / fitWidth : 1)
  const zoomBy = (factor: number) => setScale(Math.min(MAX_SCALE, Math.max(MIN_SCALE, effectiveScale * factor)))

  return (
    <>
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-2" role="toolbar" aria-label="Zoom controls">
        <Button type="button" variant="outline" size="icon" aria-label="Zoom out" disabled={effectiveScale <= MIN_SCALE} onClick={() => zoomBy(1 / ZOOM_STEP)}>
          <ZoomOut className="size-4" aria-hidden="true" />
        </Button>
        <span className="min-w-14 text-center text-sm tabular-nums" aria-live="polite">{Math.round(effectiveScale * 100)}%</span>
        <Button type="button" variant="outline" size="icon" aria-label="Zoom in" disabled={effectiveScale >= MAX_SCALE} onClick={() => zoomBy(ZOOM_STEP)}>
          <ZoomIn className="size-4" aria-hidden="true" />
        </Button>
        <Button type="button" variant="outline" size="sm" className="ml-2 gap-2" onClick={() => setScale(1)}>
          <MoveHorizontal className="size-4" aria-hidden="true" />
          Fit to screen
        </Button>
        <Button type="button" variant="ghost" size="sm" className="gap-2" onClick={() => setScale(null)}>
          <Scan className="size-4" aria-hidden="true" />
          Show whole sheet
        </Button>
      </div>
      <div ref={setViewport} className="min-h-0 flex-1 overflow-auto bg-muted/40 p-4">
        {fitWidth > 0 && <HarnessDrawing fitWidthPx={Math.round(fitWidth * effectiveScale)} />}
      </div>
    </>
  )
}

export function Series7000HarnessMap() {
  const [fullOpen, setFullOpen] = useState(false)
  const { motor } = useReportData()
  const diagramTitle = `${motor?.model ?? "7000 series"} harness map`
  return (
    <section aria-label={diagramTitle} className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-base font-semibold">{diagramTitle}</h3>
          <p className="text-sm text-muted-foreground">Select a length above any of the five cable sections to edit it. Cable specifications are saved separately from component selections. Scroll horizontally to inspect the drawing, or open the full size view.</p>
        </div>
        <Dialog open={fullOpen} onOpenChange={setFullOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="shrink-0 gap-2">
              <Maximize2 className="size-4" aria-hidden="true" />
              View full size
            </Button>
          </DialogTrigger>
          <DialogContent className="top-0 left-0 flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 p-0 sm:max-w-none">
            <div className="flex h-14 shrink-0 items-center border-b border-border px-4 pr-14">
              <DialogTitle className="text-base font-semibold">{diagramTitle}</DialogTitle>
              <DialogDescription className="sr-only">Full size view of the harness map. Select a cable length to edit it.</DialogDescription>
            </div>
            <FullSizeViewer />
          </DialogContent>
        </Dialog>
      </div>
      {!fullOpen && <HarnessDrawing />}
    </section>
  )
}
