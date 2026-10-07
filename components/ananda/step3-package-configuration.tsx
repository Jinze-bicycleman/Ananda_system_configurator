"use client"

import { useState } from "react"
import { useAnandaStore, hasThirdPartySupplier, type PackageItemKey } from "@/lib/ananda-store"
import {
  useControllers,
  useDisplays,
  useBatteries,
  usePackageMotors,
  useSpeedSensors,
  useBikeComponents,
  chargersForVoltage,
  productImages,
  speedSensorTypeLabel,
  BIKE_COMPONENT_CATEGORIES,
  CHARGING_PORTS,
  type ControllerRow,
  type HmiDisplayRow,
  type BatteryRow,
  type MotorRow,
  type ChargerOption,
  type ChargingPortOption,
  type SpeedSensorRow,
  type BikeComponentRow,
} from "@/lib/ananda-packages"
import { StepHeader, SectionLabel, TechSpecRow } from "./ui-primitives"
import { StatusBadge } from "./status-badge"
import { ProductImageLightbox } from "./product-image-lightbox"
import { FullSpecDialog, type Spec } from "./full-spec-dialog"
import { cn } from "@/lib/utils"
import { CheckCircle2, ChevronDown, Image as ImageIcon, Ban, RotateCcw, Loader2, Radio, ZoomIn, Truck, AlertTriangle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

function OptionCard({
  title,
  images = [],
  specs,
  selected,
  onSelect,
  fullSpecs,
  datasheetUrl,
}: {
  title: string
  /** Every image for the product — the first is the thumbnail, all are browsable in the pop-up. */
  images?: string[]
  specs: Spec[]
  selected: boolean
  onSelect: () => void
  /** Extra specs shown, together with the overview specs, in the "Full Specification" pop-up. */
  fullSpecs?: Spec[]
  datasheetUrl?: string | null
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [specOpen, setSpecOpen] = useState(false)
  const allSpecs = [...specs, ...(fullSpecs ?? [])]
  const hasFullSpecs = allSpecs.some((sp) => sp.value != null)

  return (
    <>
      <div
        onClick={onSelect}
        className={cn(
          "product-card relative flex cursor-pointer flex-col border-2 transition-all",
          selected ? "border-primary shadow-md shadow-primary/10" : "border-border hover:border-primary/40",
        )}
      >
        <div className={cn("h-1 w-full shrink-0", selected ? "bg-primary" : "bg-border")} />
        {selected && (
          <div className="absolute top-3 right-2 z-10 bg-primary rounded-full p-0.5">
            <CheckCircle2 className="w-3 h-3 text-white" />
          </div>
        )}
        {images.length > 0 ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setLightboxOpen(true)
            }}
            aria-label={`Enlarge image of ${title}${images.length > 1 ? ` (${images.length} images)` : ""}`}
            className={cn(
              "group relative flex h-24 shrink-0 cursor-zoom-in items-center justify-center overflow-hidden",
              selected ? "bg-primary/5" : "bg-surface",
            )}
          >
            <img src={images[0] || "/placeholder.svg"} alt={title} className="relative z-10 max-h-16 object-contain" crossOrigin="anonymous" />
            <span className="absolute bottom-1.5 right-1.5 z-20 flex h-6 w-6 items-center justify-center border border-border bg-background/90 text-muted-foreground transition-colors group-hover:border-primary group-hover:text-primary">
              <ZoomIn className="h-3.5 w-3.5" />
            </span>
            {images.length > 1 && (
              <span className="absolute bottom-1.5 left-1.5 z-20 border border-border bg-background/90 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                1 / {images.length}
              </span>
            )}
          </button>
        ) : (
          <div className={cn("flex h-24 shrink-0 items-center justify-center", selected ? "bg-primary/5" : "bg-surface")}>
            <ImageIcon className={cn("w-8 h-8", selected ? "text-primary/40" : "text-border")} />
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col p-3">
          <p className={cn("text-sm font-sans font-bold uppercase mb-1 wrap-anywhere", selected ? "text-primary" : "text-graphite")}>{title}</p>
          {specs.length > 0 && (
            <div className="min-w-0 border border-border rounded-sm">
              {specs.map((sp) => sp.value != null && (
                <TechSpecRow key={sp.label} label={sp.label} value={sp.value} stacked={typeof sp.value === "string" && sp.value.length > 18} />
              ))}
            </div>
          )}
          {hasFullSpecs && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setSpecOpen(true)
              }}
              className="mt-2 w-full border border-primary/40 bg-primary/5 px-2 py-1.5 text-[10px] font-sans font-bold uppercase tracking-wider text-primary transition-colors hover:bg-primary/10"
            >
              Full Specification
            </button>
          )}
        </div>
      </div>
      <ProductImageLightbox title={title} images={images} open={lightboxOpen} onOpenChange={setLightboxOpen} />
      <FullSpecDialog title={title} specs={allSpecs} images={images} datasheetUrl={datasheetUrl} open={specOpen} onOpenChange={setSpecOpen} />
    </>
  )
}

function EmptyOptionsNotice() {
  return (
    <div className="border-2 border-dashed border-border p-6 text-center">
      <p className="text-sm font-sans font-semibold text-muted-foreground uppercase tracking-wider mb-1">No Products Available</p>
      <p className="text-xs font-body text-muted-foreground">
        There are no products in the database for this component yet. Mark it as not needed, use a 3rd party supplier, or check back once products are added.
      </p>
    </div>
  )
}

// Replaces the product grid once a part is customer-sourced: shows the
// supplier-name field (required) and a way back to Ananda products.
function ThirdPartyPanel({ itemKey, label }: { itemKey: PackageItemKey; label: string }) {
  const s = useAnandaStore()
  const name = s.thirdPartySuppliers[itemKey] ?? ""
  const missing = name.trim().length === 0
  return (
    <div className="border-2 border-warning/50 bg-warning/10 p-4">
      <div className="flex items-start gap-3">
        <Truck className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-sans font-bold uppercase text-graphite">3rd Party Supplier — {label}</p>
          <p className="mt-1 text-xs font-body leading-relaxed text-muted-foreground">
            Ananda will need full technical documents and a component sample for integration and compatibility testing. Extra cost and delivery time apply — contact sales for details.
          </p>
          <label htmlFor={`${itemKey}-supplier`} className="mt-3 block text-[10px] font-sans font-bold uppercase tracking-wider text-graphite">
            Supplier name <span className="text-destructive">*</span>
          </label>
          <input
            id={`${itemKey}-supplier`}
            type="text"
            value={name}
            onChange={(e) => s.setThirdPartySupplierName(itemKey, e.target.value)}
            placeholder={`Name of the ${label.toLowerCase()} supplier`}
            aria-invalid={missing}
            className={cn(
              "mt-1 w-full max-w-md border bg-background px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:border-primary",
              missing ? "border-destructive" : "border-border",
            )}
          />
          {missing && <p className="mt-1 text-[11px] font-sans font-semibold text-destructive">Enter the supplier name to continue.</p>}
          <button
            type="button"
            onClick={() => s.disableThirdParty(itemKey)}
            className="mt-3 flex items-center gap-1 border border-primary bg-primary/5 px-2 py-1 text-[11px] font-sans font-bold uppercase tracking-wider text-primary transition-colors hover:bg-primary/10"
          >
            <RotateCcw className="h-3 w-3" /> Choose an Ananda product instead
          </button>
        </div>
      </div>
    </div>
  )
}

function ThirdPartyOptionButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-4 flex w-full items-center gap-3 border-2 border-dashed border-border px-4 py-3 text-left transition-colors hover:border-warning/60 hover:bg-warning/5"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-surface text-muted-foreground">
        <Truck className="h-4 w-4" />
      </span>
      <span>
        <span className="block text-sm font-sans font-bold uppercase text-graphite">3rd Party Supplier</span>
        <span className="block text-xs font-body text-muted-foreground">Source this component from your own supplier instead of Ananda.</span>
      </span>
    </button>
  )
}

interface ConfigRowProps {
  itemKey: string
  label: string
  required: boolean
  emphasize?: boolean
  selectedSummary: React.ReactNode | null
  skippable: boolean
  skipped: boolean
  onToggleSkip: () => void
  /** Offer the "3rd Party Supplier" option (every part except the motor). */
  thirdPartyKey?: PackageItemKey
  children: React.ReactNode
  hasOptions: boolean
  optionsLoading?: boolean
  expanded: boolean
  onToggleExpanded: () => void
}

// The accordion's expand/collapse state is fully independent of product
// selection — selecting or changing a product never closes the section.
// Only the chevron control toggles `expanded`.
function ConfigRow({
  itemKey,
  label,
  required,
  emphasize,
  selectedSummary,
  skippable,
  skipped,
  onToggleSkip,
  thirdPartyKey,
  children,
  hasOptions,
  optionsLoading,
  expanded,
  onToggleExpanded,
}: ConfigRowProps) {
  const s = useAnandaStore()
  const [warningOpen, setWarningOpen] = useState(false)
  const isThirdParty = thirdPartyKey ? hasThirdPartySupplier(s, thirdPartyKey) : false
  const supplierName = thirdPartyKey ? (s.thirdPartySuppliers[thirdPartyKey] ?? "") : ""

  const thirdPartySummary = isThirdParty ? (
    <div>
      <p className="text-sm font-sans font-bold uppercase text-warning">3rd Party Supplier</p>
      <p className={cn("text-xs font-body", supplierName.trim() ? "text-muted-foreground" : "font-semibold text-destructive")}>
        {supplierName.trim() ? supplierName : "Supplier name required"}
      </p>
    </div>
  ) : null

  return (
    <section
      id={`config-${itemKey}`}
      className={cn("mb-6 border", emphasize ? "border-2 border-primary/40 bg-primary/[0.02] p-4" : "border-transparent")}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <SectionLabel>{label}</SectionLabel>
          {emphasize && <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-primary">Core Component</span>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isThirdParty && <StatusBadge variant="not-required" label="3rd Party Supplier" />}
          {required && !skipped && !isThirdParty && <StatusBadge variant="required" />}
          {skipped && <StatusBadge variant="not-required" label="Marked Not Needed" />}
          <button
            type="button"
            onClick={onToggleExpanded}
            aria-expanded={expanded}
            aria-controls={`config-${itemKey}-panel`}
            aria-label={`${expanded ? "Collapse" : "Expand"} ${label}`}
            className="flex items-center justify-center border border-border p-1 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
          </button>
        </div>
      </div>

      {skipped ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-border bg-surface px-4 py-3">
          <p className="min-w-0 text-sm font-body text-muted-foreground">This component has been marked as not needed for this build.</p>
          <button
            onClick={onToggleSkip}
            className="flex shrink-0 items-center gap-1 border border-primary bg-primary/5 px-2 py-1 text-[11px] font-sans font-bold uppercase tracking-wider text-primary transition-colors hover:bg-primary/10"
          >
            <RotateCcw className="w-3 h-3" /> Restore
          </button>
        </div>
      ) : expanded ? (
        <div id={`config-${itemKey}-panel`}>
          {isThirdParty && thirdPartyKey ? (
            <ThirdPartyPanel itemKey={thirdPartyKey} label={label} />
          ) : (
            <>
              {!selectedSummary && (
                <div className="mb-3 text-xs font-sans font-semibold uppercase tracking-wider text-warning">No selection yet — choose an option below.</div>
              )}
              {optionsLoading ? (
                <div className="flex items-center gap-2 py-8 justify-center text-sm font-sans text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading options…
                </div>
              ) : hasOptions ? (
                children
              ) : (
                <EmptyOptionsNotice />
              )}
              {thirdPartyKey && <ThirdPartyOptionButton onClick={() => setWarningOpen(true)} />}
              {skippable && (
                <button
                  onClick={onToggleSkip}
                  className="mt-4 flex w-full items-center gap-3 border-2 border-dashed border-border px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-surface"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-surface text-muted-foreground">
                    <Ban className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-sans font-bold uppercase text-graphite">Not Needed</span>
                    <span className="block text-xs font-body text-muted-foreground">Choose this option if this component isn&apos;t required for the build.</span>
                  </span>
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <div id={`config-${itemKey}-panel`} className="border-2 border-primary/30 bg-primary/5 px-4 py-3">
          {thirdPartySummary ?? selectedSummary ?? <p className="text-sm font-body text-muted-foreground">No selection yet.</p>}
        </div>
      )}

      {thirdPartyKey && (
        <AlertDialog open={warningOpen} onOpenChange={setWarningOpen}>
          <AlertDialogContent className="border-2 border-border font-sans">
            <AlertDialogHeader>
              <div className="flex items-center gap-2 text-warning">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em]">Warning</span>
              </div>
              <AlertDialogTitle className="font-sans text-lg font-black uppercase tracking-tight text-graphite">
                3rd Party {label}
              </AlertDialogTitle>
              <AlertDialogDescription className="font-body text-sm leading-relaxed text-muted-foreground">
                When using 3rd party components, we need full technical documents and a component sample for integration and
                compatibility testing. This will introduce extra cost and delivery time. Please contact sales for details.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-sans text-xs font-bold uppercase tracking-wider">Back</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => s.enableThirdParty(thirdPartyKey)}
                className="bg-primary font-sans text-xs font-bold uppercase tracking-wider text-white hover:bg-primary/90"
              >
                I Agree
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </section>
  )
}

// Fixed set of accordion sections. All expanded by default on first visit;
// manual expand/collapse state persists for the current session (component
// lifetime) independent of which product is selected in each section.
const SECTION_KEYS = ["motorId", "batteryId", "displayId", "speedSensorId", "chargerId", "chargingPortId", "controllerId", "torqueSensorId"] as const

export function Step3PackageConfiguration() {
  const s = useAnandaStore()
  const isHub = s.driveType === "hub"

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => Object.fromEntries(SECTION_KEYS.map((k) => [k, true])))
  const toggleExpanded = (key: string) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))

  const { motors: compatibleMotors, isLoading: motorsLoading } = usePackageMotors(s.driveType, s.voltagePlatform)
  const { controllers, isLoading: controllersLoading } = useControllers()
  const { displays, isLoading: displaysLoading } = useDisplays()
  const { batteries, isLoading: batteriesLoading } = useBatteries()
  const { speedSensors, isLoading: speedSensorsLoading } = useSpeedSensors()

  const compatibleControllers = controllers.filter((c) => c.compatible_motor_type === "hub" && c.voltage_v === s.voltagePlatform)
  const compatibleBatteries = batteries.filter((b) => b.voltage_v === s.voltagePlatform)
  const compatibleChargers = chargersForVoltage(s.voltagePlatform)
  const { components: bikeComponents, isLoading: bikeComponentsLoading } = useBikeComponents()

  // Only filter the HMI list when at least one display actually declares the
  // *other* protocol — with every current display supporting both CAN and
  // UART, the toggle stays a no-op until protocol-exclusive models exist.
  const protocolFilteredDisplays = displays.filter((d) => {
    const protocol = (d.communication_protocol ?? "").toLowerCase()
    if (!protocol) return true
    return protocol.includes(s.hmiProtocolPreference)
  })

  const selectedMotor = compatibleMotors.find((m) => m.id === s.motorId) ?? null
  const selectedController = compatibleControllers.find((c) => c.id === s.controllerId) ?? null
  const selectedDisplay = displays.find((d) => d.id === s.displayId) ?? null
  const selectedBattery = compatibleBatteries.find((b) => b.id === s.batteryId) ?? null
  const selectedCharger = compatibleChargers.find((c) => c.id === s.chargerId) ?? null
  const selectedPort = CHARGING_PORTS.find((p) => p.id === s.chargingPortId) ?? null
  const selectedSpeedSensor = speedSensors.find((sensor) => sensor.id === s.speedSensorId) ?? null

  const toggleSkip = (key: string, idField: keyof typeof s) => {
    const currentlySkipped = s.skippedItems.includes(key)
    s.setItemSkipped(key, !currentlySkipped)
    if (!currentlySkipped) {
      s.setField(idField as never, null as never)
      s.disableThirdParty(key as PackageItemKey)
    }
  }

  const toggleBikeComponent = (category: BikeComponentRow["category"], component: BikeComponentRow) => {
    const alreadySelected = s.bikeComponentSelections[category] === component.id
    s.setField("bikeComponentSelections", { ...s.bikeComponentSelections, [category]: alreadySelected ? null : component.id })
    if (category === "chainring") {
      s.setField("selectedChainringTeeth", alreadySelected ? null : component.teeth)
      if (!alreadySelected && component.teeth != null) s.setField("frontTeeth", component.teeth)
    }
  }

  return (
    <div>
      <StepHeader
        step={3}
        title="Package Configuration"
        subtitle="Choose the components for your system from compatible Ananda products. Every part except the motor can instead be sourced from your own 3rd party supplier, or marked as not needed where allowed."
      />

      <ConfigRow
        itemKey="motorId"
        label="Motor"
        required
        emphasize
        skippable={false}
        skipped={false}
        onToggleSkip={() => {}}
        hasOptions={compatibleMotors.length > 0}
        optionsLoading={motorsLoading}
        expanded={expanded.motorId}
        onToggleExpanded={() => toggleExpanded("motorId")}
        selectedSummary={
          selectedMotor && (
            <div>
              <p className="text-sm font-sans font-bold uppercase text-primary">{selectedMotor.model}</p>
              <p className="text-xs font-body text-muted-foreground">
                {selectedMotor.voltage_v}V · {selectedMotor.torque_nm ?? "—"}Nm · {selectedMotor.rated_power_w ?? "—"}W rated
                {selectedMotor.shaft_interface ? ` · ${selectedMotor.shaft_interface} shaft` : ""}
              </p>
            </div>
          )
        }
      >
        <div className="product-option-grid">
          {compatibleMotors.map((m: MotorRow) => (
            <OptionCard
              key={m.id}
              title={m.model}
              images={productImages(m.image_url, m.image_path)}
              datasheetUrl={m.datasheet_url}
              specs={[
                { label: "Torque", value: m.torque_nm ? `${m.torque_nm}Nm` : null },
                { label: "Rated Power", value: m.rated_power_w ? `${m.rated_power_w}W` : null },
                { label: "Peak Power", value: m.peak_power_w ? `${m.peak_power_w}W` : null },
                { label: "Weight", value: m.weight_kg ? `${m.weight_kg}kg` : null },
                { label: "Shaft Type", value: m.shaft_interface },
              ]}
              fullSpecs={[
                { label: "Motor Type", value: m.motor_type === "mid_drive" ? "Mid-Drive" : "Hub Motor" },
                { label: "Voltage", value: `${m.voltage_v}V` },
                { label: "Speed", value: m.rpm ? `${m.rpm} rpm` : null },
                { label: "Max Efficiency", value: m.max_efficiency },
                { label: "Noise Grade", value: m.noise_grade_db ? `${m.noise_grade_db} dB` : null },
                { label: "Size", value: m.size },
                { label: "Mounting Interface", value: m.mounting_interface },
                { label: "Controller", value: m.controller_requirement === "integrated" ? "Integrated" : "External" },
                { label: "Pedal Sensing", value: m.pedal_sensing },
                { label: "Sensor", value: m.sensor_description },
                { label: "Communication", value: m.communication_protocol },
                { label: "Waterproof", value: m.waterproof },
                { label: "Light Drive Capacity", value: m.light_drive_capacity },
                { label: "Construction", value: m.construction },
                { label: "Colour", value: m.color },
                { label: "Description", value: m.short_description },
              ]}
              selected={s.motorId === m.id}
              onSelect={() => s.setField("motorId", m.id)}
            />
          ))}
        </div>
      </ConfigRow>

      <ConfigRow
        itemKey="batteryId"
        label="Battery"
        required
        emphasize
        skippable={false}
        skipped={false}
        onToggleSkip={() => {}}
        thirdPartyKey="batteryId"
        hasOptions={compatibleBatteries.length > 0}
        optionsLoading={batteriesLoading}
        expanded={expanded.batteryId}
        onToggleExpanded={() => toggleExpanded("batteryId")}
        selectedSummary={
          selectedBattery && (
            <div>
              <p className="text-sm font-sans font-bold uppercase text-primary">{selectedBattery.model}</p>
              <p className="text-xs font-body text-muted-foreground">{selectedBattery.capacity_wh ?? "—"}Wh</p>
            </div>
          )
        }
      >
        <div className="product-option-grid">
          {compatibleBatteries.map((b: BatteryRow) => (
            <OptionCard
              key={b.id}
              title={b.model}
              images={productImages(b.image_url, b.image_path)}
              datasheetUrl={b.datasheet_url}
              specs={[
                { label: "Capacity", value: b.capacity_wh ? `${b.capacity_wh}Wh` : null },
                { label: "Weight", value: b.weight_kg ? `${b.weight_kg}kg` : null },
                { label: "Voltage", value: `${b.voltage_v}V` },
              ]}
              fullSpecs={[
                {
                  label: "Exact Dimensions",
                  value: b.length_mm && b.width_mm && b.height_mm ? `${b.length_mm} × ${b.width_mm} × ${b.height_mm} mm` : null,
                },
                { label: "Certification", value: b.safety_certificate },
                { label: "Communication", value: b.communication_protocol },
              ]}
              selected={s.batteryId === b.id}
              onSelect={() => s.selectPackageItem("batteryId", b.id)}
            />
          ))}
        </div>
      </ConfigRow>

      <ConfigRow
        itemKey="displayId"
        label="Display (HMI)"
        required
        skippable={false}
        skipped={false}
        onToggleSkip={() => {}}
        thirdPartyKey="displayId"
        hasOptions={protocolFilteredDisplays.length > 0}
        optionsLoading={displaysLoading}
        expanded={expanded.displayId}
        onToggleExpanded={() => toggleExpanded("displayId")}
        selectedSummary={
          selectedDisplay && (
            <div>
              <p className="text-sm font-sans font-bold uppercase text-primary">{selectedDisplay.model}</p>
              <p className="text-xs font-body text-muted-foreground">{selectedDisplay.size ?? "—"}</p>
            </div>
          )
        }
      >
        <div className="mb-4 flex items-center gap-3 border border-border bg-surface px-3 py-2">
          <Radio className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
          <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-graphite">Communication protocol</span>
          <div role="tablist" aria-label="HMI communication protocol" className="ml-auto inline-grid grid-cols-2 border border-border">
            {(["can", "uart"] as const).map((protocol) => (
              <button
                key={protocol}
                type="button"
                role="tab"
                aria-selected={s.hmiProtocolPreference === protocol}
                onClick={() => s.setField("hmiProtocolPreference", protocol)}
                className={cn(
                  "px-3 py-1.5 text-[11px] font-sans font-bold uppercase tracking-wide transition-colors",
                  s.hmiProtocolPreference === protocol ? "bg-primary text-white" : "bg-white text-muted-foreground hover:text-primary",
                )}
              >
                {protocol === "can" ? "CAN Bus" : "UART"}
              </button>
            ))}
          </div>
        </div>
        <div className="product-option-grid">
          {protocolFilteredDisplays.map((d: HmiDisplayRow) => (
            <OptionCard
              key={d.id}
              title={d.model}
              images={productImages(d.image_url, d.image_path)}
              datasheetUrl={d.datasheet_url}
              specs={[
                { label: "Size", value: d.size },
                { label: "Mounting", value: d.mounting_position },
                { label: "Bluetooth", value: d.bluetooth ? "Yes" : "No" },
                { label: "GPS", value: d.has_gps ? "Yes" : "No" },
              ]}
              fullSpecs={[
                { label: "Protocol", value: d.communication_protocol },
                { label: "Certifications", value: d.certifications },
              ]}
              selected={s.displayId === d.id}
              onSelect={() => s.selectPackageItem("displayId", d.id)}
            />
          ))}
        </div>
      </ConfigRow>

      <ConfigRow
        itemKey="speedSensorId"
        label="Speed Sensor"
        required
        skippable={false}
        skipped={false}
        onToggleSkip={() => {}}
        thirdPartyKey="speedSensorId"
        hasOptions={speedSensors.length > 0}
        optionsLoading={speedSensorsLoading}
        expanded={expanded.speedSensorId}
        onToggleExpanded={() => toggleExpanded("speedSensorId")}
        selectedSummary={
          selectedSpeedSensor && (
            <div>
              <p className="text-sm font-sans font-bold uppercase text-primary">{selectedSpeedSensor.model}</p>
              <p className="text-xs font-body text-muted-foreground">
                {speedSensorTypeLabel(selectedSpeedSensor.mounting_position)} · {selectedSpeedSensor.connector_type ?? "—"}
                {selectedSpeedSensor.cable_length_mm ? ` · ${(selectedSpeedSensor.cable_length_mm / 1000).toFixed(1)}m lead` : ""}
              </p>
            </div>
          )
        }
      >
        <div className="product-option-grid">
          {speedSensors.map((sensor: SpeedSensorRow) => (
            <OptionCard
              key={sensor.id}
              title={sensor.model}
              specs={[
                { label: "Type", value: speedSensorTypeLabel(sensor.mounting_position) },
                { label: "Mounting", value: sensor.mounting_position },
                { label: "Connector", value: sensor.connector_type },
                { label: "Lead length", value: sensor.cable_length_mm ? `${(sensor.cable_length_mm / 1000).toFixed(1)}m` : null },
              ]}
              selected={s.speedSensorId === sensor.id}
              onSelect={() => s.selectPackageItem("speedSensorId", sensor.id)}
            />
          ))}
        </div>
      </ConfigRow>

      <ConfigRow
        itemKey="chargerId"
        label="Charger"
        required
        skippable={false}
        skipped={false}
        onToggleSkip={() => {}}
        thirdPartyKey="chargerId"
        hasOptions={compatibleChargers.length > 0}
        expanded={expanded.chargerId}
        onToggleExpanded={() => toggleExpanded("chargerId")}
        selectedSummary={
          selectedCharger && (
            <div>
              <p className="text-sm font-sans font-bold uppercase text-primary">{selectedCharger.model}</p>
              <p className="text-xs font-body text-muted-foreground">
                {selectedCharger.voltage_v}V · {selectedCharger.outputCurrentA}A
              </p>
            </div>
          )
        }
      >
        <div className="product-option-grid">
          {compatibleChargers.map((c: ChargerOption) => (
            <OptionCard
              key={c.id}
              title={c.model}
              specs={[
                { label: "Voltage", value: `${c.voltage_v}V` },
                { label: "Current", value: `${c.outputCurrentA}A` },
              ]}
              selected={s.chargerId === c.id}
              onSelect={() => s.selectPackageItem("chargerId", c.id)}
            />
          ))}
        </div>
      </ConfigRow>

      <ConfigRow
        itemKey="chargingPortId"
        label="Charging Port"
        required
        skippable={false}
        skipped={false}
        onToggleSkip={() => {}}
        thirdPartyKey="chargingPortId"
        hasOptions={CHARGING_PORTS.length > 0}
        expanded={expanded.chargingPortId}
        onToggleExpanded={() => toggleExpanded("chargingPortId")}
        selectedSummary={selectedPort && <p className="text-sm font-sans font-bold uppercase text-primary">{selectedPort.model}</p>}
      >
        <div className="product-option-grid">
          {CHARGING_PORTS.map((p: ChargingPortOption) => (
            <OptionCard
              key={p.id}
              title={p.model}
              specs={[{ label: "Type", value: p.description }]}
              selected={s.chargingPortId === p.id}
              onSelect={() => s.selectPackageItem("chargingPortId", p.id)}
            />
          ))}
        </div>
      </ConfigRow>

      {isHub && (
        <ConfigRow
          itemKey="controllerId"
          label="Controller"
          required
          skippable={false}
          skipped={false}
          onToggleSkip={() => {}}
          thirdPartyKey="controllerId"
          hasOptions={compatibleControllers.length > 0}
          optionsLoading={controllersLoading}
          expanded={expanded.controllerId}
          onToggleExpanded={() => toggleExpanded("controllerId")}
          selectedSummary={
            selectedController && (
              <div>
                <p className="text-sm font-sans font-bold uppercase text-primary">{selectedController.model}</p>
                <p className="text-xs font-body text-muted-foreground">
                  {selectedController.voltage_v}V · {selectedController.rated_power_w ?? "—"}W rated
                </p>
              </div>
            )
          }
        >
          <div className="product-option-grid">
            {compatibleControllers.map((c: ControllerRow) => (
              <OptionCard
                key={c.id}
                title={c.model}
                images={productImages(c.image_url, c.image_path)}
                datasheetUrl={c.datasheet_url}
                specs={[
                  { label: "Rated Power", value: c.rated_power_w ? `${c.rated_power_w}W` : null },
                  { label: "Peak Current", value: c.peak_current_a ? `${c.peak_current_a}A` : null },
                  { label: "Voltage", value: `${c.voltage_v}V` },
                ]}
                selected={s.controllerId === c.id}
                onSelect={() => s.selectPackageItem("controllerId", c.id)}
              />
            ))}
          </div>
        </ConfigRow>
      )}

      {isHub && (
        <ConfigRow
          itemKey="torqueSensorId"
          label="Torque Sensor"
          required
          skippable
          skipped={s.skippedItems.includes("torqueSensorId")}
          onToggleSkip={() => toggleSkip("torqueSensorId", "torqueSensorId")}
          thirdPartyKey="torqueSensorId"
          hasOptions={false}
          expanded={expanded.torqueSensorId}
          onToggleExpanded={() => toggleExpanded("torqueSensorId")}
          selectedSummary={s.torqueSensorId ? <p className="text-sm font-sans font-bold text-primary">{s.torqueSensorId}</p> : null}
        >
          <EmptyOptionsNotice />
        </ConfigRow>
      )}

      <section id="config-bikeComponents-panel" className="mb-6 border border-transparent">
        <div className="mb-4 flex items-center gap-2">
          <SectionLabel>Bike Components</SectionLabel>
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-muted-foreground">Optional</span>
        </div>
        {bikeComponentsLoading ? (
          <div className="flex items-center gap-2 py-8 justify-center text-sm font-sans text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading options…
          </div>
        ) : (
          <div className="space-y-6">
            {BIKE_COMPONENT_CATEGORIES.map((category) => {
              const options = bikeComponents.filter((c: BikeComponentRow) => c.category === category.id)
              const selectedId = s.bikeComponentSelections[category.id] ?? null
              if (options.length === 0) return null
              return (
                <div key={category.id}>
                  <p className="mb-3 text-xs font-sans font-bold uppercase tracking-wider text-graphite">{category.label}</p>
                  {category.id === "chainring" && (
                    <p className="mb-3 text-xs font-body text-muted-foreground">
                      The chainring&apos;s tooth count is carried into the Drivetrain stage and must match the front chainring entered there.
                    </p>
                  )}
                  <div className="product-option-grid">
                    {options.map((c) => (
                      <OptionCard
                        key={c.id}
                        title={c.model}
                        specs={[
                          { label: "Teeth", value: c.teeth != null ? `${c.teeth}T` : null },
                          { label: "Description", value: c.short_description },
                          { label: "Weight", value: c.weight_kg ? `${c.weight_kg}kg` : null },
                        ]}
                        selected={selectedId === c.id}
                        onSelect={() => toggleBikeComponent(category.id, c)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
