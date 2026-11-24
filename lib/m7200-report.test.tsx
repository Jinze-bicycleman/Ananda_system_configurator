import React from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { defaultState, useAnandaStore } from "./ananda-store"

const captured = vi.hoisted(() => ({ pdf: "" }))
vi.mock("jspdf", async (importOriginal) => {
  const actual = await importOriginal<typeof import("jspdf")>()
  return { ...actual, jsPDF: class extends actual.jsPDF {
    constructor(options: ConstructorParameters<typeof actual.jsPDF>[0]) {
      super(options)
      this.save = (() => { captured.pdf = this.output(); return this }) as unknown as typeof this.save
    }
  } }
})
vi.mock("./ananda-store", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./ananda-store")>()
  const hook = Object.assign((selector?: (state: ReturnType<typeof actual.useAnandaStore.getState>) => unknown) => selector ? selector(actual.useAnandaStore.getState()) : actual.useAnandaStore.getState(), actual.useAnandaStore)
  return { ...actual, useAnandaStore: hook }
})
vi.mock("./ananda-packages", async (importOriginal) => ({
  ...await importOriginal<typeof import("./ananda-packages")>(),
  useMotors: () => ({ motors: [{ id: "m", model: "M7200", voltage_v: 36 }, { id: "m7100", model: "M7100", voltage_v: 36 }, { id: "m7600", model: "M7600", voltage_v: 36 }, { id: "other", model: "M8000", voltage_v: 36 }], isLoading: false }),
  useDisplays: () => ({ displays: [{ id: "d", model: "D16" }], isLoading: false }),
  useBatteries: () => ({ batteries: [{ id: "b", model: "BT01" }], isLoading: false }),
  useSpeedSensors: () => ({ speedSensors: [{ id: "s", model: "SR01", cable_length_mm: 850 }], isLoading: false }),
  useControllers: () => ({ controllers: [], isLoading: false }),
  useMotorAssistModes: () => ({ modes: [], isLoading: false }),
  useBikeComponents: () => ({ components: [], isLoading: false }),
}))
vi.mock("./i18n/provider", () => ({ useT: () => (text: string) => text }))
vi.mock("./bike-overview/use-cable-profiles", () => ({ useCableProfiles: () => null }))
import { generateReportPdf, useReportData, type ReportData } from "./ananda-report"
import { Step7Report } from "../components/ananda/step7-report"
import { Series7000HarnessMap } from "../components/ananda/system-diagram/m7200-harness-map"

function report(config = useAnandaStore.getState()) {
  let data!: ReportData
  function Probe() { data = useReportData(config); return null }
  renderToStaticMarkup(<Probe />)
  return data
}

afterEach(() => vi.restoreAllMocks())
describe("7000-series shared report and PDF", () => {
  it("exports all five independent edits, including empty component sections", async () => {
    useAnandaStore.setState({ ...defaultState, driveType: "mid", motorId: "m", speedSensorId: "s" })
    const values = [1370, 450, 1200, 900, 650]
    const initial = report()
    initial.harnessSections.forEach((section, index) => useAnandaStore.getState().setCableLength(section.connection, values[index] / 1000, "custom"))
    const data = report()
    expect(data.harnessSections.map(section => section.lengthMm)).toEqual(values)
    expect(data.harnessSections[2].catalogLengthMm).toBe(850)
    expect(data.cableRows.map(row => row.lengthM)).toEqual(values.map(mm => mm / 1000))
    const map = renderToStaticMarkup(<Series7000HarnessMap />)
    expect(map.match(/aria-label="Edit P[1-5][^"]*length:/g)).toHaveLength(5)
    expect(map).toContain("P4 Rear Light / turn signals: empty")
    expect(map).not.toContain("mm · fixed")
    const screen = renderToStaticMarkup(<Step7Report />)
    expect(screen).toContain("0.45 m")
    expect(screen).toContain("1.2 m")
    await generateReportPdf(data)
    for (const mm of values) expect(captured.pdf).toContain(`${mm / 1000} m`)
  })
  it.each([["m7100", "M7100"], ["m", "M7200"], ["m7600", "M7600"]])("carries %s saved HMI lengths through map, Step 7 and PDF", async (motorId, model) => {
    useAnandaStore.setState({ ...defaultState, driveType: "mid", motorId, displayId: "d", batteryId: "b", speedSensorId: "s", cableLengths: { "Display → Motor Unit": 1.235 } })
    expect(report().harnessSlots[0].lengthMm).toBe(1235)
    useAnandaStore.getState().setCableLength("Display → Motor unit", 1.37, "custom")
    const data = report()
    expect(data.cableRows.find(c => c.connection.startsWith("P2 "))?.lengthM).toBe(1.37)
    expect(data.cableRows.find(c => c.connection.startsWith("P5 "))?.lengthM).toBe(.85)
    expect(data.cableRows.some(c => c.connection === "Battery → Motor unit")).toBe(false)
    const screen = renderToStaticMarkup(<Step7Report />)
    expect(screen).toContain(`${model} Harness Slots`)
    expect(screen).toContain("1370 mm")
    expect(screen).toContain("1.37 m")
    expect(screen).toContain("empty")
    const map = renderToStaticMarkup(<Series7000HarnessMap />)
    expect(map).toContain(`${model} harness map`)
    expect(map).toContain("1370 mm")
    expect(map).toContain('width="6468" height="7288"')
    expect(map).toContain("P2 Brake 1: empty")
    // Editing belongs to the cable overlay; the right-hand component slot is a label only.
    expect(map).toMatch(/data-harness-length-for="hmi"[^>]*style="[^"]*left:52\.875/)
    expect(map).toMatch(/data-harness-length-for="hmi"[\s\S]*?<button[^>]*aria-label="Edit P2 HMI \/ light \/ brake cable length: 1370 mm"/)
    const componentSlot = map.match(/data-harness-component-for="hmi"[\s\S]*?<\/div>/)?.[0]
    expect(componentSlot).toContain("D16")
    expect(componentSlot).not.toContain("<button")
    expect(map).toContain('data-harness-length-for="speedSensor"')
    await generateReportPdf(data, { projectName: "Harness verification" })
    expect(captured.pdf).toContain(`${model} HARNESS SLOTS`)
    expect(captured.pdf).toContain("1.37 m")
    expect(captured.pdf).toContain("1370 mm")
    expect(captured.pdf).toContain("850 mm")
    expect(captured.pdf).toContain("empty")
  })
  it("omits the skipped sensor length in the summary and has no harness for another motor", () => {
    const data = report({ ...defaultState, driveType: "mid", motorId: "m", speedSensorId: "s", skippedItems: ["speedSensorId"] } as ReturnType<typeof useAnandaStore.getState>)
    expect(data.harnessSlots.find(slot => slot.id === "speedSensor")?.model).toBeNull()
    expect(data.cableRows.find(c => c.connection.startsWith("P5 "))?.lengthM).toBeNull()
    expect(report({ ...defaultState, driveType: "mid", motorId: "other" } as ReturnType<typeof useAnandaStore.getState>).harnessSlots).toEqual([])
    expect(report({ ...defaultState, driveType: "hub", motorId: "m" } as ReturnType<typeof useAnandaStore.getState>).harnessSlots).toEqual([])
  })
})
