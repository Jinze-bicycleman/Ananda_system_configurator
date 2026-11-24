import { describe, expect, it } from "vitest"
import { defaultState, useAnandaStore } from "./ananda-store"
import { useProjectsStore } from "./ananda-projects"
import { cableValue, HMI_CONNECTION } from "./cable-connections"
import { harnessLengthLabel, isM7200, resolveM7200Harness } from "./m7200-harness"

const products = { display: { model: "D16" }, battery: { model: "BT01" }, speedSensor: { model: "SR01", cable_length_mm: 850 } }
const config = () => ({ ...defaultState, driveType: "mid" as const, motorId: "catalog-uuid", displayId: "d", batteryId: "b", speedSensorId: "s", accessoryIds: ["ACC-FL", "ACC-RL", "ACC-TH01"] })

describe("M7200 harness selection and cable boundary", () => {
  it("gates on the selected catalog model, including drive type", () => {
    expect(isM7200(config(), { model: "M7200" })).toBe(true)
    expect(isM7200(config(), { model: "M7100" })).toBe(false)
    expect(isM7200({ driveType: "hub" }, { model: "M7200" })).toBe(false)
    expect(isM7200(config(), null)).toBe(false)
  })
  it("keeps configured components distinct from empty and unsupported slots", () => {
    const slots = resolveM7200Harness(config(), products)
    expect(slots.find(x => x.id === "hmi")).toMatchObject({ model: "D16", lengthMm: null, editable: true })
    expect(slots.find(x => x.id === "frontLight")?.model).toBe("Front Light")
    for (const id of ["brake1", "brake2", "gear", "iot", "throttle"]) {
      const slot = slots.find(x => x.id === id)!
      expect(slot.model).toBeNull()
      expect(harnessLengthLabel(slot)).toBeNull()
    }
    expect(harnessLengthLabel(slots.find(x => x.id === "battery")!)).toContain("no cable")
  })
  it("reads fixed sensor lead and hides it when skipped, even with a stale selection", () => {
    expect(resolveM7200Harness(config(), products).find(x => x.id === "speedSensor")?.lengthMm).toBe(850)
    const slot = resolveM7200Harness({ ...config(), skippedItems: ["speedSensorId"] }, products).find(x => x.id === "speedSensor")!
    expect(slot.model).toBeNull()
    expect(harnessLengthLabel(slot)).toBeNull()
  })
  it("honors third-party flags ahead of stale catalog selections", () => {
    const slots = resolveM7200Harness({ ...config(), thirdPartySuppliers: { displayId: "Customer", batteryId: "Supplier", speedSensorId: "Custom" } }, products)
    expect(slots.find(x => x.id === "hmi")).toMatchObject({ model: "3rd party: Customer", editable: false })
    expect(slots.find(x => x.id === "speedSensor")?.lengthMm).toBeNull()
    expect(slots.find(x => x.id === "cage")?.model).toBeNull()
  })
  it("preserves either saved HMI spelling and round-trips edits through project save/reload", () => {
    useAnandaStore.setState({ ...config(), cableLengths: { "Display → Motor Unit": 1.235 } })
    const id = "harness-test-project"
    useProjectsStore.setState({ activeProjectId: id, projects: [{ id, name: "Harness test", createdAt: 0, updatedAt: 0, config: useAnandaStore.getState() }] })
    expect(cableValue(useAnandaStore.getState().cableLengths, HMI_CONNECTION)).toBe(1.235)
    expect(resolveM7200Harness(useAnandaStore.getState(), products)[0].lengthMm).toBe(1235)
    useAnandaStore.getState().setCableLength("Display → Motor Unit", 1.37, "custom")
    useProjectsStore.getState().saveActive()
    useAnandaStore.setState({ cableLengths: {} })
    useProjectsStore.getState().openProject(id)
    expect(resolveM7200Harness(useAnandaStore.getState(), products)[0].lengthMm).toBe(1370)
    expect(useAnandaStore.getState().cableLengthModes[HMI_CONNECTION]).toBe("custom")
    expect(cableValue({ [HMI_CONNECTION]: 1.2, "Display → Motor Unit": 0.9 }, HMI_CONNECTION)).toBe(1.2)
  })
})
