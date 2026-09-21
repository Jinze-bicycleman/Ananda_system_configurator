"use client"

import { useState, type ReactNode } from "react"
import { useAnandaStore } from "@/lib/ananda-store"
import { aAccessories } from "@/lib/ananda-data"
import { StepHeader, SectionLabel } from "./ui-primitives"
import { cn } from "@/lib/utils"
import { Wifi, Lightbulb, Gauge, MoreHorizontal, CheckCircle2, Plus, X, HelpCircle } from "lucide-react"
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
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import type { BluetoothAppChoice } from "@/lib/ananda-product-targets"

const CATEGORIES = [
  { id: "lights", label: "Lighting", icon: Lightbulb },
  { id: "throttle", label: "Throttle", icon: Gauge },
]

// ─── IoT / Connectivity ──────────────────────────────────────────────────────
// Moved here from Step 3 (Product Targets) — the companion-app choice now
// lives alongside the rest of the accessory decisions instead of being set
// up-front, while still writing to the same product-target fields the
// recommendation engine already reads.
function ConnectivitySection() {
  const s = useAnandaStore()
  const t = s.productTargets
  const [pendingThirdParty, setPendingThirdParty] = useState(false)

  const choose = (app: BluetoothAppChoice | "no_app") => {
    if (app === "no_app") {
      s.setProductTarget({ functions: { bluetoothApp: null, bluetooth: "not_required" } })
      return
    }
    if (app === "third_party" && !t.functions.bluetoothThirdPartyAcknowledged) {
      setPendingThirdParty(true)
      return
    }
    s.setProductTarget({ functions: { bluetoothApp: app, bluetooth: "target" } })
  }

  const confirmThirdParty = () => {
    s.setProductTarget({ functions: { bluetoothApp: "third_party", bluetooth: "target", bluetoothThirdPartyAcknowledged: true } })
  }

  const current: "ananda_app" | "no_app" | "third_party" = t.functions.bluetoothApp ?? "no_app"

  const OPTIONS: { id: "ananda_app" | "no_app" | "third_party"; label: string; info: ReactNode }[] = [
    {
      id: "ananda_app",
      label: "Ananda Ride App",
      info: (
        <div className="space-y-1.5">
          <p className="font-sans font-bold uppercase tracking-wider text-foreground">Key Features</p>
          <p>Live tracking &amp; ride history, motor diagnostics, boost adjustment, and theft-security features.</p>
        </div>
      ),
    },
    { id: "no_app", label: "No App", info: <p>No companion-app connectivity — the system operates standalone.</p> },
    {
      id: "third_party",
      label: "3rd-Party App",
      info: <p>Uses the Ananda communication protocol for data transferring and reading with your own third-party application.</p>,
    },
  ]

  return (
    <section>
      <SectionLabel>
        <span className="flex items-center gap-2">
          <Wifi className="w-3.5 h-3.5" />
          IoT / Connectivity
        </span>
      </SectionLabel>
      <div className="flex flex-wrap gap-2 border border-border p-3">
        {OPTIONS.map((opt) => (
          <div
            key={opt.id}
            className={cn(
              "flex items-center gap-1.5 border px-2.5 py-2 transition-colors",
              current === opt.id ? "border-primary bg-primary text-white" : "border-border text-muted-foreground hover:border-primary/40",
            )}
          >
            <button type="button" onClick={() => choose(opt.id)} className="text-[11px] font-sans font-bold uppercase tracking-wider">
              {opt.label}
            </button>
            <HoverCard openDelay={100}>
              <HoverCardTrigger asChild>
                <button
                  type="button"
                  aria-label={`About ${opt.label}`}
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-current"
                >
                  <HelpCircle className="h-3 w-3" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 text-xs leading-relaxed text-foreground">{opt.info}</HoverCardContent>
            </HoverCard>
          </div>
        ))}
      </div>

      <AlertDialog open={pendingThirdParty} onOpenChange={setPendingThirdParty}>
        <AlertDialogContent className="border-2 border-border font-sans">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-sans text-lg font-black uppercase tracking-tight text-graphite">
              3rd-Party App Connectivity
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body text-sm text-muted-foreground">
              Configuring 3rd-party app connectivity may cause extra cost, please consult our sales for more information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-sans text-xs font-bold uppercase tracking-wider">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmThirdParty}
              className="bg-primary font-sans text-xs font-bold uppercase tracking-wider text-white hover:bg-primary/90"
            >
              Confirm &amp; Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}

// ─── Lighting spec fields ────────────────────────────────────────────────────
function LightSpecFields({ accessoryId }: { accessoryId: string }) {
  const s = useAnandaStore()
  const spec = s.lightSpecs[accessoryId] ?? { voltageV: null, currentA: null, powerW: null }
  return (
    <div className="mt-2 grid grid-cols-3 gap-2 border-t border-dashed border-border pt-2" onClick={(e) => e.stopPropagation()}>
      {(
        [
          { key: "voltageV" as const, label: "Voltage (V)" },
          { key: "currentA" as const, label: "Current (A)" },
          { key: "powerW" as const, label: "Power (W)" },
        ]
      ).map((f) => (
        <label key={f.key} className="text-[9px] font-sans font-bold uppercase tracking-wide text-muted-foreground">
          {f.label}
          <input
            type="number"
            step="0.1"
            value={spec[f.key] ?? ""}
            onChange={(e) => s.setLightSpec(accessoryId, { [f.key]: e.target.value ? Number(e.target.value) : null })}
            onClick={(e) => e.stopPropagation()}
            className="mt-1 w-full border border-border px-1.5 py-1 text-[11px] font-body text-foreground focus:outline-none focus:border-primary"
          />
        </label>
      ))}
    </div>
  )
}

// ─── Throttle warning + algorithm choice ─────────────────────────────────────
function ThrottleConfig() {
  const s = useAnandaStore()
  return (
    <div className="mt-4 border border-warning/40 bg-warning/10 p-4" onClick={(e) => e.stopPropagation()}>
      <p className="text-xs font-body text-warning-foreground mb-3">
        Please provide a sample of the throttle for system integration testing. We also need to know the desired throttle algorithm.
      </p>
      <p className="mb-2 text-[10px] font-sans font-bold uppercase tracking-wider text-graphite">Throttle Algorithm</p>
      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "zero_start" as const, label: "0 km/h Start" },
            { id: "speed_gate" as const, label: "Available Above Speed Limit" },
          ]
        ).map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => s.setField("throttleStartMode", opt.id)}
            className={cn(
              "border px-3 py-1.5 text-[10px] font-sans font-bold uppercase tracking-wider transition-colors",
              s.throttleStartMode === opt.id ? "border-primary bg-primary text-white" : "border-border text-muted-foreground hover:border-primary/40",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {s.throttleStartMode === "speed_gate" && (
        <div className="mt-3 flex items-center gap-2">
          <label className="text-[10px] font-sans font-bold uppercase tracking-wide text-muted-foreground">
            Minimum speed (km/h)
          </label>
          <input
            type="number"
            value={s.throttleSpeedGateKmh ?? ""}
            onChange={(e) => s.setField("throttleSpeedGateKmh", e.target.value ? Number(e.target.value) : null)}
            className="w-20 border border-border px-2 py-1 text-xs font-body tabular-nums focus:outline-none focus:border-primary"
          />
        </div>
      )}
    </div>
  )
}

// ─── Other accessories — free-text entries only ──────────────────────────────
function OtherAccessoriesSection() {
  const s = useAnandaStore()
  const [draft, setDraft] = useState("")

  const add = () => {
    const name = draft.trim()
    if (!name) return
    s.addCustomAccessory(name)
    setDraft("")
  }

  return (
    <section>
      <SectionLabel>
        <span className="flex items-center gap-2">
          <MoreHorizontal className="w-3.5 h-3.5" />
          Other Accessories
        </span>
      </SectionLabel>
      <div className="space-y-2">
        {s.customAccessories.map((acc) => (
          <div key={acc.id} className="flex items-center gap-2 border border-border px-3 py-2">
            <input
              value={acc.name}
              onChange={(e) => s.updateCustomAccessory(acc.id, e.target.value)}
              className="flex-1 border-none bg-transparent text-sm font-sans font-semibold text-foreground focus:outline-none"
            />
            <button
              type="button"
              aria-label={`Remove ${acc.name}`}
              onClick={() => s.removeCustomAccessory(acc.id)}
              className="text-muted-foreground transition-colors hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                add()
              }
            }}
            placeholder="Describe the accessory (e.g. custom horn, basket, TPMS)"
            className="flex-1 border border-dashed border-border px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={add}
            className="flex items-center gap-1.5 border border-primary bg-primary/5 px-3 py-2 text-[11px] font-sans font-bold uppercase tracking-wide text-primary transition-colors hover:bg-primary/10"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </div>
    </section>
  )
}

export function Step8Accessories() {
  const s = useAnandaStore()

  return (
    <div>
      <StepHeader
        step={6}
        title="Accessories"
        subtitle="Select optional accessories for the system. All items show technical specifications and weight only. Toggle to add or remove."
      />

      <div className="space-y-8">
        <ConnectivitySection />

        {CATEGORIES.map((cat) => {
          const items = aAccessories.filter((a) => a.category === cat.id)
          const Icon = cat.icon
          return (
            <section key={cat.id}>
              <SectionLabel>
                <span className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" />
                  {cat.label}
                </span>
              </SectionLabel>

              <div className="product-option-grid">
                {items.map((acc) => {
                  const selected = s.accessoryIds.includes(acc.id)
                  return (
                    <div key={acc.id} className="flex flex-col gap-0">
                      <button
                        onClick={() => s.toggleAccessory(acc.id)}
                        className={cn(
                          "product-card relative text-left border-2 transition-all p-0 w-full",
                          selected ? "border-primary shadow-md shadow-primary/10" : "border-border hover:border-primary/40",
                        )}
                      >
                        <div className={cn("h-1 w-full", selected ? "bg-primary" : "bg-border")} />

                        {selected && (
                          <div className="absolute top-2 right-2">
                            <div className="bg-primary rounded-full p-0.5">
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            </div>
                          </div>
                        )}

                        <div
                          className={cn(
                            "relative flex items-center justify-center h-16 overflow-hidden",
                            selected ? "bg-primary/5" : "bg-surface",
                          )}
                        >
                          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 160 64" preserveAspectRatio="none">
                            <polygon
                              points="100,0 160,0 160,64 60,64"
                              fill={selected ? "#008F36" : "#f3f4f6"}
                              opacity={selected ? "0.12" : "0.5"}
                            />
                          </svg>
                          <Icon className={cn("w-7 h-7 relative z-10", selected ? "text-primary" : "text-border")} />
                        </div>

                        <div className="min-w-0 p-3">
                          <p
                            className={cn(
                              "text-sm font-sans font-bold uppercase leading-tight mb-1",
                              selected ? "text-primary" : "text-graphite",
                            )}
                          >
                            {acc.name}
                          </p>
                          <p className="text-[11px] font-body text-muted-foreground leading-snug mb-2">{acc.description}</p>
                          <div className="mt-auto flex items-center justify-between gap-2">
                            <span className="text-[10px] font-sans uppercase tracking-wider text-muted-foreground">Weight</span>
                            <span className="whitespace-nowrap text-xs font-sans font-bold text-foreground">
                              {acc.weightKg ? `${acc.weightKg} kg` : "—"}
                            </span>
                          </div>
                          {cat.id === "lights" && selected && <LightSpecFields accessoryId={acc.id} />}
                        </div>
                      </button>
                      {cat.id === "throttle" && selected && <ThrottleConfig />}
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}

        <OtherAccessoriesSection />
      </div>

      {/* Summary */}
      {(s.accessoryIds.length > 0 || s.customAccessories.length > 0) && (
        <div className="mt-6 border border-primary/30 bg-primary/5 px-5 py-4">
          <p className="text-[11px] font-sans font-bold uppercase tracking-wider text-primary mb-2">
            {s.accessoryIds.length + s.customAccessories.length} accessor{s.accessoryIds.length + s.customAccessories.length > 1 ? "ies" : "y"} selected
          </p>
          <div className="flex flex-wrap gap-2">
            {s.accessoryIds.map((id) => {
              const acc = aAccessories.find((a) => a.id === id)
              if (!acc) return null
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 bg-white border border-primary/30 px-2.5 py-1 text-xs font-sans font-semibold text-primary"
                >
                  {acc.name}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      s.toggleAccessory(id)
                    }}
                    className="text-primary/50 hover:text-primary"
                  >
                    ×
                  </button>
                </span>
              )
            })}
            {s.customAccessories.map((acc) => (
              <span
                key={acc.id}
                className="inline-flex items-center gap-1.5 bg-white border border-primary/30 px-2.5 py-1 text-xs font-sans font-semibold text-primary"
              >
                {acc.name || "Untitled accessory"}
                <button onClick={() => s.removeCustomAccessory(acc.id)} className="text-primary/50 hover:text-primary">
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
