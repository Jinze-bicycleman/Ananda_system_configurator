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
  useMotors: () => ({ motors: [{ id: "m", model: "M7200", voltage_v: 36 }], isLoading: false }),
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
import { M7200HarnessMap } from "../components/ananda/system-diagram/m7200-harness-map"

function report(config = useAnandaStore.getState()) {
  let data!: ReportData
  function Probe() { data = useReportData(config); return null }
  renderToStaticMarkup(<Probe />)
  return data
}

afterEach(() => vi.restoreAllMocks())
describe("M7200 shared report and PDF", () => {
  it("carries a legacy saved HMI length through map, Step 7 and the real PDF generator", async () => {
    useAnandaStore.setState({ ...defaultState, driveType: "mid", motorId: "m", displayId: "d", batteryId: "b", speedSensorId: "s", cableLengths: { "Display → Motor Unit": 1.235 } })
    expect(report().harnessSlots[0].lengthMm).toBe(1235)
    useAnandaStore.getState().setCableLength("Display → Motor unit", 1.37, "custom")
    const data = report()
    expect(data.cableRows.find(c => c.connection === "Display → Motor unit")?.lengthM).toBe(1.37)
    expect(data.cableRows.find(c => c.connection === "Speed sensor → Motor unit")?.lengthM).toBe(.85)
    expect(data.cableRows.some(c => c.connection === "Battery → Motor unit")).toBe(false)
    const screen = renderToStaticMarkup(<Step7Report />)
    expect(screen).toContain("1370 mm")
    expect(screen).toContain("1.37 m")
    expect(screen).toContain("empty")
    const map = renderToStaticMarkup(<M7200HarnessMap />)
    expect(map).toContain("1370 mm")
    expect(map).toContain('width="6468" height="7288"')
    expect(map).toContain("P2 Brake 1: empty")
    await generateReportPdf(data, { projectName: "Harness verification" })
    expect(captured.pdf).toContain("1.37 m")
    expect(captured.pdf).toContain("1370 mm")
    expect(captured.pdf).toContain("850 mm")
    expect(captured.pdf).toContain("empty")
  })
  it("omits the skipped sensor length in the summary and has no harness for another motor", () => {
    const data = report({ ...defaultState, driveType: "mid", motorId: "m", speedSensorId: "s", skippedItems: ["speedSensorId"] } as ReturnType<typeof useAnandaStore.getState>)
    expect(data.harnessSlots.find(slot => slot.id === "speedSensor")?.model).toBeNull()
    expect(data.cableRows.find(c => c.connection === "Speed sensor → Motor unit")?.lengthM).toBeUndefined()
    expect(report({ ...defaultState, driveType: "hub", motorId: "m" } as ReturnType<typeof useAnandaStore.getState>).harnessSlots).toEqual([])
  })
})
